/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  NotFoundException,
  InternalServerErrorException,
  Post,
  Body,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { FirebaseGuard } from '../auth/firebase/firebase.guard';
import { Quiz, QuizSummary } from '../common/types/quiz.type';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { FailedQuestion } from '../common/types/question.type';
import { RequestWithUser } from '../common/types/request.type';
import { LoggerService } from '../common/services/logger.service';
import { FlowTrackerService } from '../common/services/flow-tracker.service';
import { LogMethod } from '../common/decorators';
import { User } from '../common/decorators/decorators/user.decorator';

@Controller('quizzes')
@ApiTags('quizzes')
@UseGuards(FirebaseGuard)
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
export class QuizzesController {
  private readonly logger: LoggerService;
  private readonly flowTracker: FlowTrackerService;

  constructor(private readonly quizzesService: QuizzesService) {
    this.logger = LoggerService.getInstance();
    this.flowTracker = FlowTrackerService.getInstance();
    this.logger.debug(
      'QuizzesController başlatıldı',
      'QuizzesController.constructor',
      __filename,
      28,
    );
  }

  @Get()
  @LogMethod({ trackParams: true })
  @ApiOperation({ summary: 'Kullanıcının tüm sınavlarını getirir' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sınavlar başarıyla getirildi',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Kimlik doğrulama hatası - yetkilendirme gerekli',
  })
  async findAll(): Promise<QuizSummary[]> {
    try {
      this.flowTracker.trackStep(
        'Kullanıcının tüm sınavları getiriliyor',
        'QuizzesController',
      );

      const quizzes = await this.quizzesService.findAll();

      return quizzes.map((quiz: Quiz) => quiz as unknown as QuizSummary);
    } catch (error) {
      this.logger.logError(error, 'QuizzesController.findAll', {
        additionalInfo: 'Sınavlar getirilirken bir hata oluştu',
      });

      throw new InternalServerErrorException(
        'Sınavlar getirilirken bir hata oluştu',
        { cause: error },
      );
    }
  }

  @Get('by-course/:courseId')
  @LogMethod({ trackParams: true })
  @ApiOperation({ summary: 'Belirli bir dersin sınavlarını getirir' })
  @ApiParam({ name: 'courseId', description: 'Ders ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Derse ait sınavlar başarıyla getirildi',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Kimlik doğrulama hatası - yetkilendirme gerekli',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ders bulunamadı',
  })
  async findByCourse(
    @Param('courseId') courseId: string,
  ): Promise<QuizSummary[]> {
    try {
      this.flowTracker.trackStep(
        `${courseId} ID'li derse ait sınavlar getiriliyor`,
        'QuizzesController',
      );

      const quizzes = await this.quizzesService.findAllByCourse(
        courseId,
        'dummyUserId',
      );

      this.logger.info(
        `${courseId} ID'li derse ait ${quizzes.length} adet sınav getirildi`,
        'QuizzesController.findByCourse',
        __filename,
        96,
        { courseId, quizzesCount: quizzes.length },
      );

      return quizzes.map((quiz: Quiz) => quiz as unknown as QuizSummary);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `${courseId} ID'li ders bulunamadı`,
          'QuizzesController.findByCourse',
          __filename,
          105,
          { courseId },
        );
        throw error;
      }

      this.logger.logError(error, 'QuizzesController.findByCourse', {
        courseId,
        additionalInfo: 'Derse ait sınavlar getirilirken bir hata oluştu',
      });

      throw new InternalServerErrorException(
        'Derse ait sınavlar getirilirken bir hata oluştu',
        { cause: error },
      );
    }
  }

  @Get('failed-questions')
  @LogMethod({ trackParams: true })
  @ApiOperation({ summary: 'Kullanıcının başarısız olduğu soruları getirir' })
  @ApiQuery({
    name: 'courseId',
    description: 'Ders ID (opsiyonel)',
    required: false,
    type: String,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Başarısız sorular başarıyla getirildi',
  })
  async findFailedQuestions(
    @Query('courseId') courseId?: string,
  ): Promise<unknown[]> {
    try {
      this.flowTracker.trackStep(
        courseId
          ? `${courseId} ID'li derse ait başarısız sorular getiriliyor`
          : 'Kullanıcının tüm başarısız soruları getiriliyor',
        'QuizzesController',
      );

      const failedQuestions = await this.quizzesService.getFailedQuestions(
        'dummyUserId',
        courseId,
      );

      this.logger.info(
        `${failedQuestions.length} adet başarısız soru getirildi`,
        'QuizzesController.findFailedQuestions',
        __filename,
        148,
        { courseId, questionsCount: failedQuestions.length },
      );

      return failedQuestions;
    } catch (error) {
      this.logger.logError(error, 'QuizzesController.findFailedQuestions', {
        courseId,
        additionalInfo: 'Başarısız sorular getirilirken bir hata oluştu',
      });

      throw new InternalServerErrorException(
        'Başarısız sorular getirilirken bir hata oluştu',
        { cause: error },
      );
    }
  }

  @Post('quick')
  @HttpCode(HttpStatus.CREATED)
  @LogMethod({ trackParams: true })
  @ApiOperation({ summary: 'Hızlı sınav oluşturur' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['documentText', 'subTopics', 'questionCount', 'difficulty'],
      properties: {
        documentText: {
          type: 'string',
          description: 'Belge metni',
        },
        subTopics: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Alt konular',
        },
        questionCount: {
          type: 'number',
          minimum: 1,
          maximum: 30,
          default: 10,
          description: 'Soru sayısı',
        },
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
          description: 'Zorluk seviyesi',
        },
        documentId: {
          type: 'string',
          description: 'Belge ID (opsiyonel)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Hızlı sınav başarıyla oluşturuldu',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        questions: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        totalQuestions: { type: 'number' },
        quizType: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz istek - sınav oluşturulamadı',
  })
  async createQuickQuiz(
    @User() user: { uid: string },
    @Body()
    body: {
      documentText?: string;
      subTopics?: string[];
      questionCount?: number;
      difficulty?: string;
      documentId?: string;
    },
  ): Promise<Quiz> {
    try {
      this.flowTracker.trackStep(
        'Hızlı sınav oluşturma isteği alındı',
        'QuizzesController',
      );

      // Varsayılan değerler ve tip kontrolü
      const documentText = body.documentText || '';
      const subTopics = body.subTopics || [];
      const questionCount = body.questionCount || 10;
      const difficulty = body.difficulty || 'medium';
      const documentId = body.documentId;

      // documentId varsa belge metnini backend bulacak, documentId yoksa documentText zorunlu
      if (!documentId && !documentText) {
        throw new BadRequestException('Belge ID veya belge metni zorunludur');
      }

      if (!subTopics || !Array.isArray(subTopics) || subTopics.length === 0) {
        throw new BadRequestException('En az bir alt konu seçilmelidir');
      }

      this.logger.info(
        `Hızlı sınav oluşturma isteği: ${questionCount} soru, ${difficulty} zorluk`,
        'QuizzesController.createQuickQuiz',
        __filename,
        undefined,
        {
          userId: user.uid,
          documentId,
          subTopicsCount: subTopics.length,
          documentTextLength: documentText.length,
          questionCount,
          difficulty,
        },
      );

      // Hızlı sınav oluştur
      const quiz = await this.quizzesService.createQuickQuiz(
        user.uid,
        documentText,
        subTopics,
        questionCount,
        difficulty,
        documentId,
      );

      this.logger.info(
        `Hızlı sınav başarıyla oluşturuldu: ${quiz.id}`,
        'QuizzesController.createQuickQuiz',
        __filename,
        undefined,
        { quizId: quiz.id, questionCount: quiz.totalQuestions },
      );

      return quiz;
    } catch (error) {
      this.logger.error(
        `Hızlı sınav oluşturulurken hata: ${error.message}`,
        'QuizzesController.createQuickQuiz',
        __filename,
        undefined,
        error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Hızlı sınav oluşturulurken bir hata oluştu',
        { cause: error },
      );
    }
  }

  @Post('personalized')
  @HttpCode(HttpStatus.CREATED)
  @LogMethod({ trackParams: true })
  @ApiOperation({ summary: 'Kişiselleştirilmiş sınav oluşturur' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['courseId', 'subTopics', 'questionCount', 'difficulty'],
      properties: {
        courseId: {
          type: 'string',
          description: 'Kurs ID',
        },
        subTopics: {
          type: 'array',
          items: {
            type: 'string',
          },
          description: 'Alt konular',
        },
        questionCount: {
          type: 'number',
          minimum: 1,
          maximum: 30,
          default: 10,
          description: 'Soru sayısı',
        },
        difficulty: {
          type: 'string',
          enum: ['easy', 'medium', 'hard'],
          default: 'medium',
          description: 'Zorluk seviyesi',
        },
        documentId: {
          type: 'string',
          description: 'Belge ID (opsiyonel)',
        },
        documentText: {
          type: 'string',
          description: 'Belge metni (opsiyonel)',
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Kişiselleştirilmiş sınav başarıyla oluşturuldu',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        title: { type: 'string' },
        questions: {
          type: 'array',
          items: {
            type: 'object',
          },
        },
        totalQuestions: { type: 'number' },
        quizType: { type: 'string' },
        timestamp: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Geçersiz istek - sınav oluşturulamadı',
  })
  async createPersonalizedQuiz(
    @User() user: { uid: string },
    @Body()
    body: {
      courseId?: string;
      subTopics?: string[];
      questionCount?: number;
      difficulty?: string;
      documentId?: string;
      documentText?: string;
    },
  ): Promise<Quiz> {
    try {
      this.flowTracker.trackStep(
        'Kişiselleştirilmiş sınav oluşturma isteği alındı',
        'QuizzesController',
      );

      // Varsayılan değerler ve tip kontrolü
      const courseId = body.courseId || '';
      const subTopics = body.subTopics || [];
      const questionCount = body.questionCount || 10;
      const difficulty = body.difficulty || 'medium';
      const documentId = body.documentId;
      const documentText = body.documentText || '';

      if (!courseId) {
        throw new BadRequestException('Kurs ID zorunludur');
      }

      if (!subTopics || !Array.isArray(subTopics) || subTopics.length === 0) {
        throw new BadRequestException('En az bir alt konu seçilmelidir');
      }

      this.logger.info(
        `Kişiselleştirilmiş sınav oluşturma isteği: ${questionCount} soru, ${difficulty} zorluk, kurs: ${courseId}`,
        'QuizzesController.createPersonalizedQuiz',
        __filename,
        undefined,
        {
          userId: user.uid,
          courseId,
          documentId,
          subTopicsCount: subTopics.length,
          documentTextLength: documentText?.length || 0,
          questionCount,
          difficulty,
        },
      );

      // Kişiselleştirilmiş sınav oluştur
      const quiz = await this.quizzesService.createPersonalizedQuiz(
        user.uid,
        courseId,
        subTopics,
        questionCount,
        difficulty,
        documentId,
        documentText,
      );

      this.logger.info(
        `Kişiselleştirilmiş sınav başarıyla oluşturuldu: ${quiz.id}`,
        'QuizzesController.createPersonalizedQuiz',
        __filename,
        undefined,
        { quizId: quiz.id, questionCount: quiz.totalQuestions },
      );

      return quiz;
    } catch (error) {
      this.logger.error(
        `Kişiselleştirilmiş sınav oluşturulurken hata: ${error.message}`,
        'QuizzesController.createPersonalizedQuiz',
        __filename,
        undefined,
        error,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Kişiselleştirilmiş sınav oluşturulurken bir hata oluştu',
        { cause: error },
      );
    }
  }

  @Get(':id')
  @LogMethod({ trackParams: true })
  @ApiOperation({ summary: 'Belirli bir sınavı getirir' })
  @ApiParam({ name: 'id', description: 'Sınav ID', type: String })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sınav başarıyla getirildi',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sınav bulunamadı',
  })
  async findOne(
    @Param('id') id: string,
    @User() user: { uid: string },
  ): Promise<Quiz> {
    try {
      this.flowTracker.trackStep(
        `${id} ID'li sınav getiriliyor`,
        'QuizzesController',
      );

      const quiz = await this.quizzesService.findOne(id, user.uid);

      this.logger.info(
        `${id} ID'li sınav başarıyla getirildi`,
        'QuizzesController.findOne',
        __filename,
        undefined,
        { quizId: id, userId: user.uid },
      );

      return quiz;
    } catch (error) {
      this.logger.error(
        `Sınav getirilirken hata: ${error.message}`,
        'QuizzesController.findOne',
        __filename,
        undefined,
        error,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Sınav getirilirken bir hata oluştu',
        { cause: error },
      );
    }
  }

  @Post(':id/submit')
  @HttpCode(HttpStatus.OK)
  @LogMethod({ trackParams: true })
  @ApiOperation({
    summary: 'Bir sınavın cevaplarını gönderir ve sonuçları alır',
  })
  @ApiParam({ name: 'id', description: 'Sınav ID', type: String })
  @ApiBody({ type: SubmitQuizDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Sınav başarıyla gönderildi ve analiz edildi',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Kimlik doğrulama hatası',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Sınav bulunamadı',
  })
  async submitQuiz(
    @Param('id') quizId: string,
    @User() user: { uid: string },
    @Body() submitQuizDto: SubmitQuizDto,
  ): Promise<any> {
    try {
      this.flowTracker.trackStep(
        `Sınav gönderiliyor: ${quizId}`,
        'QuizzesController.submitQuiz',
      );

      const result = await this.quizzesService.submitQuiz(
        submitQuizDto,
        user.uid,
      );

      this.logger.info(
        `Sınav başarıyla gönderildi ve analiz edildi: ${quizId}`,
        'QuizzesController.submitQuiz',
        __filename,
        undefined,
        { quizId, userId: user.uid, score: result.analysis.overallScore },
      );
      return result;
    } catch (error) {
      this.logger.logError(error, 'QuizzesController.submitQuiz', {
        quizId,
        userId: user.uid,
        additionalInfo: 'Sınav gönderilirken hata oluştu',
      });

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Sınav gönderilirken bir hata oluştu',
        { cause: error },
      );
    }
  }
}