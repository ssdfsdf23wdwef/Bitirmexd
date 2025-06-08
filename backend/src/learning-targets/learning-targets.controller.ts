/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
  Query,
  BadRequestException,
  Request,
  HttpCode,
  HttpStatus,
  SetMetadata,
  NotFoundException,
  Patch,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiBody,
  ApiQuery,
  getSchemaPath,
  ApiProperty, // ApiProperty eklendi
} from '@nestjs/swagger';
import { LearningTargetsService } from './learning-targets.service';
import {
  UpdateLearningTargetDto,
  DetectTopicsDto,
  CreateBatchLearningTargetsDto,
  DetectNewTopicsDto,
  ConfirmNewTopicsDto,
  CreateLearningTargetDto,
  BatchUpdateLearningTargetsDto,
} from './dto'; // DTO'ların yolu doğru varsayılıyor
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LearningTargetWithQuizzes, LearningTarget } from '../common/interfaces';
import { RequestWithUser } from '../common/types';
import { LoggerService } from '../common/services/logger.service';
import { FlowTrackerService } from '../common/services/flow-tracker.service';
import { LogMethod } from '../common/decorators';
import { DocumentsService } from '../documents/documents.service';
import { TopicDetectionService } from '../ai/services/topic-detection.service';

// Swagger için response sınıfları
class LearningTargetResponseDto {
  @ApiProperty({ description: 'Öğrenme hedefinin ID\'si' })
  id: string;

  @ApiProperty({ description: 'Kullanıcı ID\'si' })
  userId: string;

  @ApiProperty({ description: 'Ders ID\'si' })
  courseId: string;

  @ApiProperty({ description: 'Konu adı' })
  topicName: string;

  @ApiProperty({ description: 'Öğrenme hedefinin durumu' })
  status: string;

  @ApiProperty({ description: 'Öğrenme hedefinin kaynağı', required: false })
  source?: string;

  @ApiProperty({ description: 'Yeni konu mu?', required: false })
  isNewTopic?: boolean;

  @ApiProperty({ description: 'Notlar', required: false })
  notes?: string;

  @ApiProperty({ description: 'Oluşturulma tarihi' })
  createdAt: Date;

  @ApiProperty({ description: 'Güncellenme tarihi' })
  updatedAt: Date;
}

class DetectedTopicDto {
  @ApiProperty({ description: 'Tespit edilen alt konunun adı' })
  subTopicName: string;

  @ApiProperty({
    description: 'Tespit edilen alt konunun normalleştirilmiş adı',
  })
  normalizedSubTopicName: string;
}

class TopicDetectionResponseDto {
  @ApiProperty({
    type: [DetectedTopicDto],
    description: 'Tespit edilen konuların listesi',
  })
  topics: DetectedTopicDto[];
}

// LearningTargetWithQuizzes arayüzünün Swagger'da şema olarak kullanılabilmesi için dummy sınıf
// Bu sınıfın LearningTargetWithQuizzes arayüzü ile aynı alanlara sahip olduğundan emin olun.
class LearningTargetWithQuizzesResponse implements LearningTargetWithQuizzes {
  @ApiProperty()
  id: string;
  @ApiProperty()
  courseId: string;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  subTopicName: string;
  @ApiProperty()
  normalizedSubTopicName: string;
  @ApiProperty({ enum: ['pending', 'failed', 'medium', 'mastered'] })
  status: 'pending' | 'failed' | 'medium' | 'mastered';
  @ApiProperty()
  failCount: number;
  @ApiProperty()
  mediumCount: number;
  @ApiProperty()
  successCount: number;
  @ApiProperty({ type: 'number', nullable: true })
  lastAttemptScorePercent: number | null;
  @ApiProperty({ type: 'string', format: 'date-time', nullable: true })
  lastAttempt: Date | null;
  @ApiProperty({ type: 'string', format: 'date-time' })
  firstEncountered: Date;
  @ApiProperty({ type: 'string', nullable: true })
  lastPersonalizedQuizId: string | null;
  // quizzes: any[]; // Daha spesifik bir tip (örn: QuizDto[]) kullanılabilir veya API yanıtında bu alan yoksa kaldırılabilir.
  // Şimdilik yoruma alıyorum, LearningTargetWithQuizzes interface'ine göre hareket edilmeli.
}

// Helper function for normalization (isteğe bağlı, kod içinde direkt de kullanılabilir)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşü]+/g, '-') // Türkçe karakterler için genişletilmiş regex
    .replace(/-+/g, '-') // Birden fazla tireyi tek tireye indirge
    .replace(/^-+|-+$/g, ''); // Başta ve sonda kalan tireleri temizle
}

@ApiTags('Öğrenme Hedefleri')
@ApiBearerAuth('Firebase JWT') // Swagger UI'da Authorize butonu için Bearer token (JWT) şeması
@UseGuards(JwtAuthGuard) // Tüm endpoint'ler için JWT koruması (anonymousAllowed ile override edilebilir)
@Controller('learning-targets')
export class LearningTargetsController {
  private readonly logger: LoggerService;
  private readonly flowTracker: FlowTrackerService;

  constructor(
    private readonly learningTargetsService: LearningTargetsService,
    private readonly documentsService: DocumentsService, // Kullanılmıyorsa kaldırılabilir
    private readonly topicDetectionService: TopicDetectionService,
  ) {
    this.logger = LoggerService.getInstance();
    this.flowTracker = FlowTrackerService.getInstance();
    this.logger.debug(
      'LearningTargetsController başlatıldı',
      'LearningTargetsController.constructor',
      __filename,
      75, // Bu satır numarasını manuel güncelledim, idealde otomatik olmalı veya log servisi kendisi halletmeli
      { service: LearningTargetsController.name },
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Kullanıcıya ait tüm öğrenme hedeflerini listeler, opsiyonel olarak bir derse göre filtrelenebilir',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: "Ders ID'si (opsiyonel)",
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Öğrenme hedefleri başarıyla listelendi',
    type: [LearningTargetResponseDto],
  })
  @LogMethod()
  async findAllByUser(
    @Query('courseId') courseId: string | undefined,
    @Req() req: RequestWithUser,
  ): Promise<LearningTarget[]> {
    try {
      this.flowTracker.trackStep(
        'Kullanıcıya ait öğrenme hedefleri listeleniyor',
        'LearningTargetsController',
      );

      const targets = await this.learningTargetsService.findAllLearningTargetsByUserId(
        req.user.uid,
        courseId,
      );
      
      return targets;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      const errorContext = {
        error: errorMessage,
        courseId,
        userId: req.user?.uid || 'unknown'
      };
      
      this.logger.error(
        `Öğrenme hedefleri listelenirken hata: ${errorMessage}`,
        'LearningTargetsController.findAllByUser',
        __filename,
        0,
        error instanceof Error ? error : new Error(errorMessage),
        errorContext
      );
      
      // Rethrow the error to be handled by the global exception filter
      throw error;
    }
  }
  
  @Get('by-course/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Kursa ait öğrenme hedeflerini getirir',
    description:
      'Belirtilen kursa ait tüm öğrenme hedeflerini ve ilgili sınavları getirir.',
  })
  @ApiParam({ name: 'courseId', description: 'Kurs ID\'si' })
  @ApiResponse({
    status: 200,
    description: 'Öğrenme hedefleri başarıyla getirildi',
    type: [LearningTargetWithQuizzesResponse],
  })
  @ApiResponse({ status: 401, description: 'Yetkilendirme hatası' })
  @ApiResponse({ status: 404, description: 'Kurs bulunamadı' })
  @LogMethod()
  async getByCourse(
    @Param('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ): Promise<LearningTargetWithQuizzes[]> {
    try {
      this.flowTracker.trackStep(
        `Kursa ait öğrenme hedefleri getiriliyor: ${courseId}`,
        'LearningTargetsController',
      );

      const userId = req.user.uid;
      if (!userId) {
        throw new UnauthorizedException('Geçersiz kullanıcı kimliği');
      }

      const learningTargets = await this.learningTargetsService.findByCourse(
        courseId,
        userId,
      );

      this.flowTracker.trackStep(
        `Toplam ${learningTargets.length} adet öğrenme hedefi getirildi`,
        'LearningTargetsController',
      );

      return learningTargets;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      const errorContext = {
        courseId,
        userId: req.user?.uid || 'unknown',
        error: errorMessage,
      };
      
      this.logger.error(
        `Öğrenme hedefleri getirilirken hata: ${errorMessage}`,
        'LearningTargetsController.getByCourse',
        __filename,
        0,
        error instanceof Error ? error : new Error(errorMessage),
        errorContext
      );
      
      throw error;
    }
  }

  // Removed duplicate findByCourse method - use getByCourse instead
  
  @Post('propose-new')
  @ApiOperation({
    summary: 'Yeni konular önermek için AI kullanır',
  })
  @ApiBody({ type: DetectNewTopicsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Yeni konular başarıyla tespit edildi',
    schema: {
      type: 'object',
      properties: {
        proposedTopics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              tempId: { type: 'string' },
              name: { type: 'string' },
              relevance: { type: 'string', nullable: true },
              details: { type: 'string', nullable: true },
            },
          },
        },
      },
    },
  })
  @LogMethod()
  async proposeNewTopics(
    @Body() dto: DetectNewTopicsDto,
    @Req() req: RequestWithUser,
  ) {
    const operationId = `propose-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();
    
    console.group(`\n🔍 BACKEND: Propose New Topics - Operation ID: ${operationId}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`👤 User ID: ${req.user.uid}`);
    console.log(`📋 Request Body:`, JSON.stringify(dto, null, 2));
    console.log(`📊 Existing Topics Count: ${dto.existingTopicTexts?.length || 0}`);
    console.log(`📝 Context Text Length: ${dto.contextText?.length || 0} characters`);
    
    try {
      this.flowTracker.trackStep(
        'Yeni konular tespit ediliyor',
        'LearningTargetsController',
      );

      console.log(`\n🚀 Calling LearningTargetsService.proposeNewTopics...`);
      const serviceStartTime = performance.now();
      
      const result = await this.learningTargetsService.proposeNewTopics(
        dto,
        req.user.uid,
      );
      
      const serviceEndTime = performance.now();
      const serviceDuration = serviceEndTime - serviceStartTime;
      
      console.log(`\n✅ Service call completed in ${serviceDuration.toFixed(2)}ms`);
      console.log(`📋 Proposed Topics Result:`, JSON.stringify(result, null, 2));
      console.log(`📊 Proposed Topics Count: ${result.proposedTopics?.length || 0}`);
      
      if (result.proposedTopics && result.proposedTopics.length > 0) {
        console.log(`\n📝 Detailed Proposed Topics:`);
        result.proposedTopics.forEach((topic, index) => {
          console.log(`  ${index + 1}. ${topic.name} (ID: ${topic.tempId})`);
          if (topic.relevance) console.log(`     Relevance: ${topic.relevance}`);
          if (topic.details) console.log(`     Details: ${topic.details}`);
        });
      }
      
      const totalDuration = performance.now() - startTime;
      console.log(`\n🎯 Total operation completed in ${totalDuration.toFixed(2)}ms`);
      console.groupEnd();
      
      return result;
    } catch (error) {
      const errorDuration = performance.now() - startTime;
      console.error(`\n❌ ERROR in propose new topics after ${errorDuration.toFixed(2)}ms:`);
      console.error(`Error Name: ${error.name}`);
      console.error(`Error Message: ${error.message}`);
      console.error(`Error Stack:`, error.stack);
      console.groupEnd();
      
      this.logger.error(
        `Yeni konular tespit edilirken hata: ${error.message}`,
        'LearningTargetsController.proposeNewTopics',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  @Post('confirm-new')
  @ApiOperation({
    summary: 'Seçilen yeni konuları öğrenme hedefleri olarak kaydeder',
  })
  @ApiBody({ type: ConfirmNewTopicsDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Yeni öğrenme hedefleri başarıyla oluşturuldu',
    type: [LearningTargetResponseDto],
  })
  @LogMethod()
  async confirmNewTopics(
    @Body() dto: ConfirmNewTopicsDto,
    @Req() req: RequestWithUser,
  ): Promise<LearningTarget[]> {
    const operationId = `confirm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();
    
    console.group(`\n✅ BACKEND: Confirm New Topics - Operation ID: ${operationId}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`👤 User ID: ${req.user.uid}`);
    console.log(`📋 Request Body:`, JSON.stringify(dto, null, 2));
    console.log(`🏫 Course ID: ${dto.courseId}`);
    console.log(`📊 Selected Topics Count: ${dto.selectedTopics?.length || 0}`);
    
    if (dto.selectedTopics && dto.selectedTopics.length > 0) {
      console.log(`\n📝 Selected Topics Details:`);
      dto.selectedTopics.forEach((topic, index) => {
        console.log(`  ${index + 1}. ${topic.name} (Temp ID: ${topic.tempId})`);
      });
    }
    
    try {
      this.flowTracker.trackStep(
        'Yeni konular öğrenme hedefi olarak kaydediliyor',
        'LearningTargetsController',
      );

      console.log(`\n🚀 Calling LearningTargetsService.confirmAndSaveNewTopicsAsLearningTargets...`);
      const serviceStartTime = performance.now();
      
      const result = await this.learningTargetsService.confirmAndSaveNewTopicsAsLearningTargets(
        dto,
        req.user.uid,
      );
      
      const serviceEndTime = performance.now();
      const serviceDuration = serviceEndTime - serviceStartTime;
      
      console.log(`\n✅ Service call completed in ${serviceDuration.toFixed(2)}ms`);
      console.log(`📊 Created Learning Targets Count: ${result.length}`);
      
      if (result.length > 0) {
        console.log(`\n🎯 Created Learning Targets Details:`);
        result.forEach((target, index) => {
          console.log(`  ${index + 1}. ${target.subTopicName} (ID: ${target.id})`);
          console.log(`     Status: ${target.status}`);
          console.log(`     Course ID: ${target.courseId}`);
          console.log(`     Normalized Name: ${target.normalizedSubTopicName}`);
        });
      }
      
      const totalDuration = performance.now() - startTime;
      console.log(`\n🎯 Total operation completed in ${totalDuration.toFixed(2)}ms`);
      console.groupEnd();
      
      return result;
    } catch (error) {
      const errorDuration = performance.now() - startTime;
      console.error(`\n❌ ERROR in confirm new topics after ${errorDuration.toFixed(2)}ms:`);
      console.error(`Error Name: ${error.name}`);
      console.error(`Error Message: ${error.message}`);
      console.error(`Error Stack:`, error.stack);
      console.groupEnd();
      
      this.logger.error(
        `Yeni öğrenme hedefleri oluşturulurken hata: ${error.message}`,
        'LearningTargetsController.confirmNewTopics',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  @Post('manual')
  @ApiOperation({
    summary: 'Manuel olarak yeni bir öğrenme hedefi oluşturur',
  })
  @ApiBody({ type: CreateLearningTargetDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Öğrenme hedefi başarıyla oluşturuldu',
    type: LearningTargetResponseDto,
  })
  @LogMethod()
  async createManualTarget(
    @Body() dto: CreateLearningTargetDto,
    @Req() req: RequestWithUser,
  ): Promise<LearningTarget> {
    try {
      this.flowTracker.trackStep(
        'Manuel öğrenme hedefi oluşturuluyor',
        'LearningTargetsController',
      );

      return await this.learningTargetsService.createManualLearningTarget(
        dto,
        req.user.uid,
      );
    } catch (error) {
      this.logger.error(
        `Manuel öğrenme hedefi oluşturulurken hata: ${error.message}`,
        'LearningTargetsController.createManualTarget',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Mevcut bir öğrenme hedefini günceller',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Güncellenecek öğrenme hedefinin ID\'si',
  })
  @ApiBody({ type: UpdateLearningTargetDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Öğrenme hedefi başarıyla güncellendi',
    type: LearningTargetResponseDto,
  })
  @LogMethod()
  async updateTarget(
    @Param('id') id: string,
    @Body() dto: UpdateLearningTargetDto,
    @Req() req: RequestWithUser,
  ): Promise<LearningTarget> {
    try {
      this.flowTracker.trackStep(
        `${id} ID'li öğrenme hedefi güncelleniyor`,
        'LearningTargetsController',
      );

      return await this.learningTargetsService.updateLearningTarget(
        id,
        dto,
        req.user.uid,
      );
    } catch (error) {
      this.logger.error(
        `Öğrenme hedefi güncellenirken hata: ${error.message}`,
        'LearningTargetsController.updateTarget',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Bir öğrenme hedefini siler',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Silinecek öğrenme hedefinin ID\'si',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Öğrenme hedefi başarıyla silindi',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @LogMethod()
  async deleteTarget(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    try {
      this.flowTracker.trackStep(
        `${id} ID'li öğrenme hedefi siliniyor`,
        'LearningTargetsController',
      );

      await this.learningTargetsService.deleteLearningTarget(
        id,
        req.user.uid,
      );
    } catch (error) {
      this.logger.error(
        `Öğrenme hedefi silinirken hata: ${error.message}`,
        'LearningTargetsController.deleteTarget',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  @Get('by-course/:courseId')
  @ApiOperation({
    summary:
      'Bir derse ait tüm öğrenme hedeflerini listeler (path parametresi ile)',
  })
  @ApiParam({ name: 'courseId', description: "Ders ID'si", type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Öğrenme hedefleri başarıyla listelendi',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(LearningTargetWithQuizzesResponse) },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ders bulunamadı',
  })
  @LogMethod()
  async findByCourse(
    @Param('courseId') courseId: string,
    @Req() req: RequestWithUser,
  ) {
    try {
      this.flowTracker.trackStep(
        `${courseId} ID'li derse ait öğrenme hedefleri alınıyor`,
        'LearningTargetsController.findByCourse',
      );
      return await this.learningTargetsService.findByCourse(
        courseId,
        req.user.uid,
      );
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsController.findByCourse', {
        userId: req.user.uid,
        courseId,
        additionalInfo: 'Derse ait öğrenme hedefleri alınırken hata oluştu',
      });
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Bir öğrenme hedefinin detaylarını getirir' })
  @ApiParam({ name: 'id', description: "Öğrenme hedefi ID'si", type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Öğrenme hedefi başarıyla getirildi',
    type: LearningTargetWithQuizzesResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Öğrenme hedefi bulunamadı',
  })
  @LogMethod()
  async findOne(
    @Param('id') id: string,
    @Req() req: RequestWithUser, // Düzeltildi: any -> RequestWithUser
  ): Promise<LearningTargetWithQuizzes> {
    const userId = req.user.uid;
    try {
      this.flowTracker.trackStep(
        `${id} ID'li öğrenme hedefi detayları getiriliyor`,
        'LearningTargetsController.findOne',
      );
      return await this.learningTargetsService.findOne(id, userId);
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsController.findOne', {
        userId,
        targetId: id,
        additionalInfo: 'Öğrenme hedefi getirilirken hata oluştu',
      });
      throw error;
    }
  }

  @Get('by-status/:courseId')
  @ApiOperation({ summary: 'Duruma göre öğrenme hedeflerini listeler' })
  @ApiParam({ name: 'courseId', description: "Ders ID'si", type: String })
  @ApiQuery({
    name: 'status',
    description: 'Hedef durumu',
    enum: ['pending', 'failed', 'medium', 'mastered'],
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Öğrenme hedefleri başarıyla listelendi',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(LearningTargetWithQuizzesResponse) },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz durum parametresi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ders bulunamadı',
  })
  @LogMethod()
  async findByStatus(
    @Param('courseId') courseId: string,
    @Query('status') status: string,
    @Req() req: RequestWithUser, // Düzeltildi: any -> RequestWithUser
  ) {
    const userId = req.user.uid;
    try {
      this.flowTracker.trackStep(
        `${courseId} ID'li dersin '${status}' durumundaki öğrenme hedefleri listeleniyor`,
        'LearningTargetsController.findByStatus',
      );

      const validStatuses = ['pending', 'failed', 'medium', 'mastered'];
      if (!validStatuses.includes(status)) {
        this.logger.warn(
          `Geçersiz durum parametresi: ${status}`,
          'LearningTargetsController.findByStatus',
          __filename,
          251, // Manuel güncellendi
          { validStatuses, providedStatus: status },
        );
        throw new BadRequestException(
          `Geçersiz durum parametresi. Geçerli değerler: ${validStatuses.join(
            ', ',
          )}`,
        );
      }

      return await this.learningTargetsService.findByStatus(
        courseId,
        userId,
        status as 'pending' | 'failed' | 'medium' | 'mastered',
      );
    } catch (error) {
      if (!(error instanceof BadRequestException)) {
        this.logger.logError(
          error,
          'LearningTargetsController.findByStatus',
          {
            userId,
            courseId,
            status,
            additionalInfo:
              'Durum bazlı öğrenme hedefleri alınırken hata oluştu',
          },
        );
      }
      throw error;
    }
  }

  @Post('detect-topics')
  @HttpCode(HttpStatus.OK) // Genellikle POST için 201 (Created) kullanılır, ama burada sadece tespit yapılıp kaydedilmeyebilir. OK (200) kabul edilebilir.
  @ApiOperation({
    summary:
      'Belge metninden konuları tespit eder ve isteğe bağlı olarak öğrenme hedefleri olarak kaydeder',
  })
  @ApiBody({ type: DetectTopicsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Konular başarıyla tespit edildi',
    type: TopicDetectionResponseDto, // Düzeltildi
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz istek (örn: metin veya belge ID eksik)',
  })
  @SetMetadata('anonymousAllowed', true) // Bu endpoint kimlik doğrulaması olmadan da kullanılabilir
  @LogMethod()
  async detectTopics(
    @Body() dto: DetectTopicsDto,
    @Req() req: RequestWithUser, // RequestWithUser kullanılıyor, req.user null olabilir
  ): Promise<TopicDetectionResponseDto> {
    const userId = req.user?.uid || 'anonymous'; // req.user null olabilir
    const isAuthenticated = userId !== 'anonymous';

    try {
      this.flowTracker.trackStep(
        `${dto.courseId || 'N/A'} ID'li ders için metin içinden konular tespit ediliyor`,
        'LearningTargetsController.detectTopics',
      );

      this.logger.debug(
        'Konu tespiti başlatılıyor',
        'LearningTargetsController.detectTopics',
        __filename,
        318, // Manuel güncellendi
        {
          userId,
          courseId: dto.courseId || 'N/A',
          textLength: dto.documentText?.length || 0,
          hasDocumentId: !!dto.documentId,
          isAnonymous: !isAuthenticated,
          requestBody: dto, // Hassas veri içermiyorsa loglanabilir
        },
      );

      let detectedRawTopics: string[] = [];

      if (dto.documentId) {
        this.logger.info(
          `Belge ID'si kullanılarak konular tespit ediliyor: ${dto.documentId}`,
          'LearningTargetsController.detectTopics',
          __filename,
          336, // Manuel güncellendi
          { documentId: dto.documentId },
        );
        detectedRawTopics =
          await this.learningTargetsService.analyzeDocumentForTopics(
            dto.documentId,
            userId, // Servis metodu userId'yi anonim durumlar için handle edebilmeli
          );
        this.logger.info(
          `Belge ID ${dto.documentId} için konu tespiti başarılı: ${detectedRawTopics.length} konu bulundu`,
          'LearningTargetsController.detectTopics',
          __filename,
          348, // Manuel güncellendi
        );
      } else if (dto.documentText) {
        this.logger.info(
          `Doğrudan metin kullanılarak konular tespit ediliyor (${dto.documentText?.length || 0} karakter)`,
          'LearningTargetsController.detectTopics',
          __filename,
          356, // Manuel güncellendi
        );
        detectedRawTopics =
          await this.learningTargetsService.analyzeDocumentText(
            dto.documentText,
            userId, // Servis metodu userId'yi anonim durumlar için handle edebilmeli
          );
        this.logger.info(
          `Doğrudan metinden konu tespiti tamamlandı: ${detectedRawTopics.length} konu bulundu`,
          'LearningTargetsController.detectTopics',
          __filename,
          367, // Manuel güncellendi
        );
      } else {
        this.logger.warn(
          "Konu tespiti için ne belge metni ne de belge ID'si belirtilmemiş",
          'LearningTargetsController.detectTopics',
          __filename,
          374, // Manuel güncellendi
          { dto },
        );
        throw new BadRequestException(
          "Konu tespiti için belge metni (documentText) veya belge ID'si (documentId) gerekmektedir",
        );
      }

      // Tespit edilen konuları öğrenme hedefi olarak kaydetme (eğer kimlik doğrulanmış ve courseId varsa)
      if (isAuthenticated && dto.courseId && detectedRawTopics.length > 0) {
        this.logger.info(
          `✨ KONU TESPİTİ: ${detectedRawTopics.length} konu tespit edildi, ${dto.courseId} ID'li ders için öğrenme hedefleri olarak kaydediliyor`,
          'LearningTargetsController.detectTopics',
          __filename,
          388, // Manuel güncellendi
        );
        const topicsToSave = detectedRawTopics.map((topicName) => ({
          subTopicName: topicName,
          normalizedSubTopicName: normalizeName(topicName), // Düzeltilmiş normalleştirme
        }));

        try {
          const savedTargets = await this.learningTargetsService.createBatch(
            dto.courseId,
            userId, // Artık 'anonymous' değil, gerçek userId
            topicsToSave,
          );
          this.logger.info(
            `✅ BAŞARILI: ${savedTargets.length} adet öğrenme hedefi "pending" durumu ile veritabanına kaydedildi`,
            'LearningTargetsController.detectTopics',
            __filename,
            404, // Manuel güncellendi
          );
        } catch (saveError) {
          this.logger.error(
            `❌ HATA: Öğrenme hedefleri kaydedilirken hata oluştu: ${saveError.message}`,
            'LearningTargetsController.detectTopics',
            __filename,
            411, // Manuel güncellendi
            saveError,
          );
          // Kaydetme hatası olsa bile tespit edilen konuları döndürmeye devam et
        }
      } else if (dto.courseId && !isAuthenticated) {
        this.logger.info(
          `⚠️ UYARI: Kullanıcı giriş yapmadığı için ${dto.courseId} dersine öğrenme hedefleri kaydedilmedi`,
          'LearningTargetsController.detectTopics',
          __filename,
          421, // Manuel güncellendi
        );
      } else if (isAuthenticated && !dto.courseId && detectedRawTopics.length > 0) {
        this.logger.info(
          `ℹ️ BİLGİ: CourseId sağlanmadığı için tespit edilen konular öğrenme hedefi olarak kaydedilmedi.`,
          'LearningTargetsController.detectTopics',
          __filename,
          428, // Manuel güncellendi
        );
      }


      return {
        topics: detectedRawTopics.map((topicName) => ({
          subTopicName: topicName,
          normalizedSubTopicName: normalizeName(topicName), // Düzeltilmiş ve tutarlı normalleştirme
        })),
      };
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsController.detectTopics', {
        userId,
        courseId: dto.courseId || 'N/A',
        documentId: dto.documentId,
        textLength: dto.documentText?.length || 0,
        additionalInfo: 'Konular tespit edilirken hata oluştu',
        errorDetails: {
          name: error.name,
          message: error.message,
          stack: error.stack, // Geliştirme ortamında loglanabilir
        },
      });
      throw error;
    }
  }

  @Post('batch')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Toplu olarak öğrenme hedefleri oluşturur' })
  @ApiBody({ type: CreateBatchLearningTargetsDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Öğrenme hedefleri başarıyla oluşturuldu',
    schema: {
      type: 'array',
      items: { $ref: getSchemaPath(LearningTargetWithQuizzesResponse) },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz istek veya eksik bilgi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ders bulunamadı',
  })
  @LogMethod()
  async createBatch(
    @Body() dto: CreateBatchLearningTargetsDto,
    @Req() req: RequestWithUser,
  ) {
    const userId = req.user.uid;
    try {
      this.flowTracker.trackStep(
        `${dto.courseId} ID'li ders için toplu öğrenme hedefleri oluşturuluyor (${dto.topics.length} adet)`,
        'LearningTargetsController.createBatch',
      );

      if (!dto.topics || dto.topics.length === 0) {
        throw new BadRequestException('Oluşturulacak konu listesi boş olamaz.');
      }

      const topicsToCreate = dto.topics.map((topic) => ({
        subTopicName: topic.subTopicName,
        // Eğer DTO'dan normalizedSubTopicName gelmiyorsa veya boşsa, subTopicName'den türet
        normalizedSubTopicName:
          topic.normalizedSubTopicName?.trim() ||
          normalizeName(topic.subTopicName), // Düzeltilmiş
      }));

      this.logger.debug(
        `${topicsToCreate.length} adet öğrenme hedefi oluşturuluyor`,
        'LearningTargetsController.createBatch',
        __filename,
        504, // Manuel güncellendi
        {
          userId,
          courseId: dto.courseId,
          topicCount: topicsToCreate.length,
        },
      );

      return await this.learningTargetsService.createBatch(
        dto.courseId,
        userId,
        topicsToCreate,
      );
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsController.createBatch', {
        userId,
        courseId: dto.courseId,
        topicCount: dto.topics?.length || 0,
        additionalInfo: 'Toplu öğrenme hedefleri oluşturulurken hata oluştu',
      });
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Bir öğrenme hedefini günceller' })
  @ApiParam({ name: 'id', description: "Öğrenme hedefi ID'si", type: String })
  @ApiBody({ type: UpdateLearningTargetDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Öğrenme hedefi başarıyla güncellendi',
    type: LearningTargetWithQuizzesResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Öğrenme hedefi bulunamadı',
  })
  @LogMethod()
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() updateLearningTargetDto: UpdateLearningTargetDto,
  ): Promise<LearningTargetWithQuizzes> {
    try {
      this.flowTracker.trackStep(
        `${id} ID'li öğrenme hedefi güncelleniyor`,
        'LearningTargetsController.update',
      );
      // If topicName is provided, create a normalized version of it
      if (updateLearningTargetDto.topicName) {
        // Add a normalized version of the topic name to the DTO
        const normalizedTopicName = normalizeName(updateLearningTargetDto.topicName);
        // Use type assertion to add this property to the DTO
        (updateLearningTargetDto as any).normalizedTopicName = normalizedTopicName;
      }


      const result = await this.learningTargetsService.update(
        id,
        req.user.uid,
        updateLearningTargetDto,
      );
      // Return the updated learning target
      // Convert any timestamp fields to Date objects for the client
      // Add required properties for LearningTargetWithQuizzes interface
      return {
        ...result,
        // Only include these properties if they exist
        ...(result['lastAttempt'] ? { lastAttempt: new Date(result['lastAttempt']) } : { lastAttempt: null }),
        ...(result['firstEncountered'] ? { firstEncountered: new Date(result['firstEncountered']) } : {}),
        // Add missing properties required by LearningTargetWithQuizzes with defaults
        lastAttemptScorePercent: (result as any).lastAttemptScorePercent || 0,
        failCount: (result as any).failCount || 0,
        mediumCount: (result as any).mediumCount || 0,
        successCount: (result as any).successCount || 0,
        attemptCount: (result as any).attemptCount || 0,
        quizzes: (result as any).quizzes || [],
      } as any; // Final type assertion to bypass type check since we're ensuring properties exist
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsController.update', {
        userId: req.user.uid,
        targetId: id,
        updateData: updateLearningTargetDto,
        additionalInfo: 'Öğrenme hedefi güncellenirken hata oluştu',
      });
      throw error;
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Başarılı silme işleminde genellikle 204 No Content döndürülür
  @ApiOperation({ summary: 'Bir öğrenme hedefini siler' })
  @ApiParam({ name: 'id', description: "Öğrenme hedefi ID'si", type: String })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Öğrenme hedefi başarıyla silindi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Öğrenme hedefi bulunamadı',
  })
  @LogMethod()
  async remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<void> {
    try {
      this.flowTracker.trackStep(
        `${id} ID'li öğrenme hedefi siliniyor`,
        'LearningTargetsController.remove',
      );
      await this.learningTargetsService.remove(id, req.user.uid);
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsController.remove', {
        userId: req.user.uid,
        targetId: id,
        additionalInfo: 'Öğrenme hedefi silinirken hata oluştu',
      });
      throw error;
    }
  }

  @Post(':courseId/detect-new-topics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Ders içeriğine göre mevcut konularla karşılaştırarak yeni konuları tespit eder',
  })
  @ApiParam({ name: 'courseId', description: "Ders ID'si", type: String })
  @ApiBody({ type: DetectNewTopicsDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Yeni konular başarıyla tespit edildi',
    type: [String],
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz istek verisi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ders bulunamadı',
  })
  @LogMethod()
  async detectNewTopics(
    @Param('courseId') courseId: string,
    @Body() detectNewTopicsDto: DetectNewTopicsDto,
    @Req() req: RequestWithUser,
  ): Promise<string[]> {
    const operationId = `detect-new-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();
    
    console.group(`\n🔍 BACKEND: Detect New Topics - Operation ID: ${operationId}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`👤 User ID: ${req.user.uid}`);
    console.log(`🏫 Course ID: ${courseId}`);
    console.log(`📋 Request Body:`, JSON.stringify(detectNewTopicsDto, null, 2));
    console.log(`📊 Existing Topics Count: ${detectNewTopicsDto.existingTopicTexts?.length || 0}`);
    console.log(`📝 Context Text Length: ${detectNewTopicsDto.contextText?.length || 0} characters`);
    
    if (detectNewTopicsDto.existingTopicTexts && detectNewTopicsDto.existingTopicTexts.length > 0) {
      console.log(`\n📝 Existing Topics List:`);
      detectNewTopicsDto.existingTopicTexts.forEach((topic, index) => {
        console.log(`  ${index + 1}. ${topic}`);
      });
    }
    
    const userId = req.user.uid;
    try {
      this.flowTracker.trackStep(
        `Detecting new topics for course ${courseId} based on lesson context`,
        'LearningTargetsController.detectNewTopics',
      );
      this.logger.debug(
        'Yeni konu tespiti başlatıldı',
        'LearningTargetsController.detectNewTopics',
        __filename,
        659, // Manuel güncellendi
        {
          userId,
          courseId,
          existingTopicsCount: detectNewTopicsDto.existingTopicTexts.length,
          lessonContextLength: detectNewTopicsDto.contextText?.length || 0,
        },
      );

      if (!detectNewTopicsDto.contextText?.trim()) {
        const errorMessage = 'Ders içeriği (lessonContext) boş olamaz.';
        console.error(`\n❌ VALIDATION ERROR: ${errorMessage}`);
        console.groupEnd();
        throw new BadRequestException(errorMessage);
      }

      console.log(`\n🚀 Calling TopicDetectionService.detectExclusiveNewTopics...`);
      const serviceStartTime = performance.now();
      
      const newTopics =
        await this.topicDetectionService.detectExclusiveNewTopics(
          detectNewTopicsDto.contextText,
          detectNewTopicsDto.existingTopicTexts,
        );

      const serviceEndTime = performance.now();
      const serviceDuration = serviceEndTime - serviceStartTime;
      
      console.log(`\n✅ Service call completed in ${serviceDuration.toFixed(2)}ms`);
      console.log(`📊 New Topics Detected Count: ${newTopics.length}`);
      
      if (newTopics.length > 0) {
        console.log(`\n🎯 Detected New Topics:`);
        newTopics.forEach((topic, index) => {
          console.log(`  ${index + 1}. ${topic}`);
        });
      } else {
        console.log(`\n ℹ️ No new topics detected (all existing topics covered)`);
      }

      this.logger.info(
        `${newTopics.length} yeni konu tespit edildi (course: ${courseId})`,
        'LearningTargetsController.detectNewTopics',
        __filename,
        682, // Manuel güncellendi
        { count: newTopics.length },
      );
      
      const totalDuration = performance.now() - startTime;
      console.log(`\n🎯 Total operation completed in ${totalDuration.toFixed(2)}ms`);
      console.groupEnd();
      
      return newTopics;
    } catch (error) {
      const errorDuration = performance.now() - startTime;
      console.error(`\n❌ ERROR in detect new topics after ${errorDuration.toFixed(2)}ms:`);
      console.error(`Error Name: ${error.name}`);
      console.error(`Error Message: ${error.message}`);
      console.error(`Error Stack:`, error.stack);
      console.groupEnd();
      
      this.logger.logError(
        error,
        'LearningTargetsController.detectNewTopics',
        {
          userId,
          courseId,
          lessonContextLength: detectNewTopicsDto.contextText?.length,
          existingTopicNamesCount:
            detectNewTopicsDto.existingTopicTexts?.length,
          additionalInfo: 'Yeni konu tespiti sırasında hata oluştu',
        },
      );
      throw error;
    }
  }

  @Patch('batch-update')
  @ApiOperation({
    summary: 'Öğrenme hedeflerini toplu olarak günceller',
    description: 'Quiz sonuçlarına göre öğrenme hedeflerinin durumlarını ve puanlarını toplu olarak günceller'
  })
  @ApiBody({ 
    type: BatchUpdateLearningTargetsDto,
    description: 'Güncellenecek öğrenme hedefleri listesi'
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Öğrenme hedefleri başarıyla güncellendi',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        updatedCount: { type: 'number', example: 5 }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz istek verisi'
  })
  @LogMethod()
  async batchUpdateLearningTargets(
    @Request() req: RequestWithUser,
    @Body() batchUpdateDto: BatchUpdateLearningTargetsDto,
  ): Promise<{ success: boolean; updatedCount: number }> {
    const operationId = `batch-update-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();
    
    console.group(`\n🔄 BACKEND: Batch Update Learning Targets - Operation ID: ${operationId}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`👤 User ID: ${req.user.uid}`);
    console.log(`📊 Targets to Update Count: ${batchUpdateDto.targets?.length || 0}`);
    console.log(`📋 Request Body:`, JSON.stringify(batchUpdateDto, null, 2));
    
    if (batchUpdateDto.targets && batchUpdateDto.targets.length > 0) {
      console.log(`\n📝 Targets Update Details:`);
      batchUpdateDto.targets.forEach((target, index) => {
        console.log(`  ${index + 1}. ${target.subTopic}`);
        console.log(`     Status: ${target.status}`);
        console.log(`     Score: ${target.score}`);
      });
    }
    
    try {
      const userId = req.user.uid;
      
      this.flowTracker.trackStep(
        `Batch updating ${batchUpdateDto.targets.length} learning targets for user ${userId}`,
        'LearningTargetsController.batchUpdateLearningTargets',
      );

      this.logger.info(
        `Batch update request received for ${batchUpdateDto.targets.length} learning targets`,
        'LearningTargetsController.batchUpdateLearningTargets',
        __filename,
        undefined,
        { 
          userId, 
          targetCount: batchUpdateDto.targets.length,
          targets: batchUpdateDto.targets.map(t => ({ 
            subTopic: t.subTopic, 
            status: t.status, 
            score: t.score 
          }))
        }
      );

      console.log(`\n🚀 Calling LearningTargetsService.batchUpdate...`);
      const serviceStartTime = performance.now();
      
      const result = await this.learningTargetsService.batchUpdate(
        userId,
        batchUpdateDto.targets
      );
      
      const serviceEndTime = performance.now();
      const serviceDuration = serviceEndTime - serviceStartTime;
      
      console.log(`\n✅ Service call completed in ${serviceDuration.toFixed(2)}ms`);
      console.log(`📊 Batch Update Result:`, JSON.stringify(result, null, 2));
      console.log(`📈 Updated Count: ${result.updatedCount}/${batchUpdateDto.targets.length}`);
      console.log(`🎯 Success Rate: ${((result.updatedCount / batchUpdateDto.targets.length) * 100).toFixed(1)}%`);

      this.logger.info(
        `Batch update completed: ${result.updatedCount}/${batchUpdateDto.targets.length} targets updated`,
        'LearningTargetsController.batchUpdateLearningTargets',
        __filename,
        undefined,
        { userId, ...result }
      );

      const totalDuration = performance.now() - startTime;
      console.log(`\n🎯 Total operation completed in ${totalDuration.toFixed(2)}ms`);
      console.groupEnd();

      return result;
    } catch (error) {
      const errorDuration = performance.now() - startTime;
      console.error(`\n❌ ERROR in batch update learning targets after ${errorDuration.toFixed(2)}ms:`);
      console.error(`Error Name: ${error.name}`);
      console.error(`Error Message: ${error.message}`);
      console.error(`Error Stack:`, error.stack);
      console.groupEnd();
      
      this.logger.logError(
        error,
        'LearningTargetsController.batchUpdateLearningTargets',
        {
          userId: req.user?.uid || 'unknown',
          targetCount: batchUpdateDto.targets?.length || 0,
          additionalInfo: 'Batch öğrenme hedefi güncellemesi sırasında hata oluştu',
        },
      );
      throw error;
    }
  }

  // Legacy endpoint removed to prevent duplication with the new 'confirm-new' endpoint
}