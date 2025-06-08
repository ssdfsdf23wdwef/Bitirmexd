import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
  Get,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { AiService } from '../ai/ai.service';
import { UpdateLearningTargetDto } from './dto/update-learning-target.dto';
import { NormalizationService } from '../shared/normalization/normalization.service';
import { CreateLearningTargetDto } from './dto/create-learning-target.dto';
import { LearningTargetWithQuizzes, LearningTarget } from '../common/interfaces';
import { LearningTargetSource } from '../common/types/learning-target.type';
import { DetectNewTopicsDto } from './dto/detect-new-topics.dto';
import { ConfirmNewTopicsDto } from './dto/confirm-new-topics.dto';
import { v4 as uuidv4 } from 'uuid';
import { TopicDetectionService } from '../ai/services/topic-detection.service';
import * as admin from 'firebase-admin';
import { FIRESTORE_COLLECTIONS } from '../common/constants';
import { LoggerService } from '../common/services/logger.service';
import { FlowTrackerService } from '../common/services/flow-tracker.service';
import { LogMethod } from '../common/decorators';
import { DocumentsService } from '../documents/documents.service';

// Legacy type - will be gradually replaced with the LearningTargetStatus enum
type LegacyLearningTargetStatus = 'pending' | 'failed' | 'medium' | 'mastered';

@Injectable()
export class LearningTargetsService {
  private readonly logger: LoggerService;
  private readonly flowTracker: FlowTrackerService;

  constructor(
    private firebaseService: FirebaseService,
    private aiService: AiService,
    private normalizationService: NormalizationService,
    @Inject(forwardRef(() => DocumentsService))
    private documentsService: DocumentsService,
    @Inject(forwardRef(() => TopicDetectionService))
    private topicDetectionService: TopicDetectionService,
  ) {
    this.logger = LoggerService.getInstance();
    this.flowTracker = FlowTrackerService.getInstance();
    this.logger.debug(
      'LearningTargetsService başlatıldı',
      'LearningTargetsService.constructor',
      __filename,
      23,
    );
  }

  /**
   * Create a learning target manually
   * @param dto The create learning target DTO
   * @param userId The user ID
   * @returns The created learning target
   */
  @LogMethod({ trackParams: true })
  async createManualLearningTarget(
    dto: CreateLearningTargetDto,
    userId: string,
  ): Promise<LearningTarget> {
    try {
      this.flowTracker.trackStep(
        'Manuel öğrenme hedefi oluşturuluyor',
        'LearningTargetsService',
      );

      this.logger.info(
        'Manuel öğrenme hedefi oluşturma işlemi başlatılıyor',
        'LearningTargetsService.createManualLearningTarget',
        __filename,
        undefined,
        { userId }
      );

      // Create a new document reference
      const db = this.firebaseService.firestore;
      const targetRef = db.collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS).doc();
      const now = admin.firestore.FieldValue.serverTimestamp();
      
      // Create the learning target object
      const newTarget: Omit<LearningTarget, 'id'> = {
        userId,
        courseId: dto.courseId || '', // Provide default empty string if undefined
        subTopicName: dto.topicName, // Map topicName from DTO to subTopicName for interface
        normalizedSubTopicName: this.normalizationService.normalizeSubTopicName(dto.topicName), // Generate normalized name
        status: dto.status || 'pending',
        failCount: 0,
        mediumCount: 0,
        successCount: 0,
        lastAttemptScorePercent: null,
        lastAttempt: null,
        firstEncountered: new Date().toISOString(),
      };

      // Save to Firestore
      await targetRef.set(newTarget);

      this.logger.info(
        'Manuel öğrenme hedefi başarıyla oluşturuldu',
        'LearningTargetsService.createManualLearningTarget',
        __filename,
        undefined,
        { targetId: targetRef.id, userId }
      );

      // Return the created target
      return {
        ...newTarget,
        id: targetRef.id,
        createdAt: null as any, // Will be set by Firestore
        updatedAt: null as any, // Will be set by Firestore
      } as LearningTarget;
    } catch (error) {
      this.logger.error(
        `Manuel öğrenme hedefi oluşturulurken hata: ${error.message}`,
        'LearningTargetsService.createManualLearningTarget',
        __filename,
        undefined,
        error
      );
      throw error;
    }
  }

  /**
   * Find all learning targets for a user, optionally filtered by course ID
   * @param userId The user ID
   * @param courseId Optional course ID filter
   * @returns List of learning targets for the user
   */
  @LogMethod({ trackParams: true })
  async findAllLearningTargetsByUserId(
    userId: string,
    courseId?: string,
  ): Promise<LearningTarget[]> {
    try {
      this.flowTracker.trackStep(
        courseId
          ? `${courseId} ID'li derse ait öğrenme hedefleri listeleniyor`
          : 'Tüm öğrenme hedefleri listeleniyor',
        'LearningTargetsService',
      );
      
      this.logger.info(
        'Kullanıcıya ait öğrenme hedefleri getiriliyor',
        'LearningTargetsService.findAllLearningTargetsByUserId',
        __filename,
        undefined,
        { userId, courseId }
      );

      // Build query based on whether courseId is provided
      let query = this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS)
        .where('userId', '==', userId);
        
      if (courseId) {
        query = query.where('courseId', '==', courseId);
      }

      const targetsSnapshot = await query.get();

      // Convert to LearningTarget objects
      const targets: LearningTarget[] = [];
      targetsSnapshot.forEach((doc) => {
        targets.push({
          ...doc.data() as Omit<LearningTarget, 'id'>,
          id: doc.id,
        });
      });

      this.logger.info(
        `${targets.length} adet öğrenme hedefi getirildi`,
        'LearningTargetsService.findAllLearningTargetsByUserId',
        __filename,
        undefined,
        { userId, courseId, targetCount: targets.length }
      );

      return targets;
    } catch (error) {
      this.logger.error(
        `Öğrenme hedefleri getirilirken hata: ${error.message}`,
        'LearningTargetsService.findAllLearningTargetsByUserId',
        __filename,
        undefined,
        error
      );
      throw error;
    }
  }
  
  /**
   * Find learning targets by course ID with quizzes
   * @param courseId The course ID
   * @param userId The user ID
   * @returns List of learning targets for the specified course with quizzes
   */
  @LogMethod({ trackParams: true })
  async findByCourse(
    courseId: string,
    userId: string,
  ): Promise<LearningTargetWithQuizzes[]> {
    try {
      this.logger.debug(
        `Kursa ait öğrenme hedefleri getiriliyor (course: ${courseId}, user: ${userId})`,
        'LearningTargetsService.findByCourse',
        __filename,
        0,
        { courseId, userId },
      );

      // Önce kullanıcının bu kursa erişim yetkisi olduğunu doğrula
      await this.validateCourseOwnership(courseId, userId);

      // Öğrenme hedeflerini getir
      const learningTargetsSnapshot = await this.firebaseService.firestore
        .collection('learningTargets')
        .where('courseId', '==', courseId)
        .where('userId', '==', userId)
        .get();

      if (learningTargetsSnapshot.empty) {
        this.logger.info(
          `Kurs için öğrenme hedefi bulunamadı (course: ${courseId})`,
          'LearningTargetsService.findByCourse',
          __filename,
          0,
          { courseId, userId },
        );
        return [];
      }

      // Her bir öğrenme hedefi için quizleri getir
      const learningTargets = await Promise.all(
        learningTargetsSnapshot.docs.map(async (doc) => {
          const data = doc.data();
          let quizzes: any[] = [];

          try {
            // İlişkili quizleri getir
            const quizzesSnapshot = await this.firebaseService.firestore
              .collection('quizzes')
              .where('learningTargetId', '==', doc.id)
              .get();
              
            quizzes = quizzesSnapshot.docs.map(quizDoc => ({
              id: quizDoc.id,
              ...quizDoc.data(),
            }));
          } catch (quizError) {
            const errorMessage = quizError instanceof Error ? quizError.message : 'Bilinmeyen hata';
            this.logger.error(
              `Quizler getirilirken hata oluştu: ${errorMessage}`,
              'LearningTargetsService.findByCourse',
              __filename,
              0,
              quizError instanceof Error ? quizError : new Error(errorMessage),
              { 
                learningTargetId: doc.id,
                error: errorMessage
              },
            );
            // Hata durumunda quiz dizisini boş bırak
            quizzes = [];
          }

          return {
            ...data,
            id: doc.id,
            quizzes,
            // Varsayılan değerler
            lastAttempt: data.lastAttempt || null,
            lastAttemptScorePercent: data.lastAttemptScorePercent || null,
            failCount: data.failCount || 0,
            mediumCount: data.mediumCount || 0,
            successCount: data.successCount || 0,
            firstEncountered: data.firstEncountered || new Date(),
            lastPersonalizedQuizId: data.lastPersonalizedQuizId || null,
          } as LearningTargetWithQuizzes;
        })
      );

      this.logger.info(
        `${learningTargets.length} adet öğrenme hedefi getirildi (course: ${courseId})`,
        'LearningTargetsService.findByCourse',
        __filename,
        0,
        { courseId, userId, targetCount: learningTargets.length }
      );

      return learningTargets;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      const errorContext = {
        courseId,
        userId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      };
      
      this.logger.error(
        `Öğrenme hedefleri getirilirken hata: ${errorMessage}`,
        'LearningTargetsService.findByCourse',
        __filename,
        0,
        error instanceof Error ? error : new Error(errorMessage),
        errorContext
      );
      
      // Rethrow the error to be handled by the controller
      throw error;
    }
  }
  
  /**
   * Delete a learning target
   * @param targetId ID of the learning target to delete
   * @param userId User ID for verification
   */
  @LogMethod({ trackParams: true })
  async deleteLearningTarget(
    targetId: string,
    userId: string,
  ): Promise<void> {
    try {
      this.flowTracker.trackStep(
        `${targetId} ID'li öğrenme hedefi siliniyor`,
        'LearningTargetsService',
      );
      
      this.logger.info(
        `${targetId} ID'li öğrenme hedefi silme işlemi başlatılıyor`,
        'LearningTargetsService.deleteLearningTarget',
        __filename,
        undefined,
        { targetId, userId }
      );

      // Get target to verify ownership
      const targetRef = this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS)
        .doc(targetId);
      
      const targetSnapshot = await targetRef.get();
      
      if (!targetSnapshot.exists) {
        throw new NotFoundException(`${targetId} ID'li öğrenme hedefi bulunamadı`);
      }

      const targetData = targetSnapshot.data() as LearningTarget;
      
      // Verify ownership
      if (targetData.userId !== userId) {
        throw new ForbiddenException('Bu öğrenme hedefini silme yetkiniz yok');
      }

      // Delete the document
      await targetRef.delete();

      this.logger.info(
        `${targetId} ID'li öğrenme hedefi başarıyla silindi`,
        'LearningTargetsService.deleteLearningTarget',
        __filename,
        undefined,
        { targetId, userId }
      );
    } catch (error) {
      this.logger.error(
        `Öğrenme hedefi silinirken hata: ${error.message}`,
        'LearningTargetsService.deleteLearningTarget',
        __filename,
        undefined,
        error
      );
      throw error;
    }
  }

  /**
   * Propose new topics using AI based on existing topics and context
   * @param dto Detection parameters
   * @param userId User ID for logging and flow tracking
   * @returns List of proposed topics with temporary IDs
   */
  @LogMethod({ trackParams: true })
  async proposeNewTopics(
    dto: DetectNewTopicsDto,
    userId: string,
  ): Promise<{ proposedTopics: { tempId: string; name: string; relevance?: string; details?: string }[] }> {
    const operationId = `service-propose-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();
    
    console.group(`\n🔍 SERVICE: Propose New Topics - Operation ID: ${operationId}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`📋 DTO:`, JSON.stringify(dto, null, 2));
    console.log(`📊 Existing Topics Count: ${dto.existingTopicTexts?.length || 0}`);
    console.log(`📝 Context Text Length: ${dto.contextText?.length || 0} characters`);
    
    try {
      this.flowTracker.trackStep(
        `Yeni konu önerileri tespit ediliyor`,
        'LearningTargetsService',
      );

      this.logger.info(
        `${userId} kullanıcısı için yeni konu önerileri tespiti başlatılıyor`,
        'LearningTargetsService.proposeNewTopics',
        __filename,
        undefined,
        { userId, existingTopicCount: dto.existingTopicTexts.length }
      );

      // Get course content if courseId is provided
      let contextText = dto.contextText || '';
      if (dto.courseId && !dto.contextText) {
        // TODO: If needed, get course content from course service
        // For now, just use the existing topics as context if no explicit context is provided
        contextText = dto.existingTopicTexts.join('. ');
        console.log(`\n📝 No context text provided, using existing topics as context (${contextText.length} chars)`);
      }

      console.log(`\n🚀 Calling TopicDetectionService.detectNewTopicsExclusive...`);
      const aiServiceStartTime = performance.now();
      
      // Call the topic detection service to detect new topics
      const result = await this.topicDetectionService.detectNewTopicsExclusive(
        contextText,
        dto.existingTopicTexts,
      );

      const aiServiceEndTime = performance.now();
      const aiServiceDuration = aiServiceEndTime - aiServiceStartTime;
      
      console.log(`\n✅ AI Service call completed in ${aiServiceDuration.toFixed(2)}ms`);
      console.log(`📊 AI Service Result:`, JSON.stringify(result, null, 2));

      // Assign temporary IDs to the proposed topics
      const proposedTopics = result.proposedTopics.map(topic => ({
        ...topic,
        tempId: uuidv4(), // Generate a unique ID for each proposed topic
      }));

      console.log(`\n🎯 Processing Results:`);
      console.log(`📊 Proposed Topics Count: ${proposedTopics.length}`);
      
      if (proposedTopics.length > 0) {
        console.log(`\n📝 Detailed Proposed Topics:`);
        proposedTopics.forEach((topic, index) => {
          console.log(`  ${index + 1}. ${topic.name} (Temp ID: ${topic.tempId})`);
          if (topic.relevance) console.log(`     Relevance: ${topic.relevance}`);
          if (topic.details) console.log(`     Details: ${topic.details}`);
        });
      }

      this.logger.info(
        `${proposedTopics.length} adet yeni konu önerisi tespit edildi`,
        'LearningTargetsService.proposeNewTopics',
        __filename,
        undefined,
        { userId, proposedTopicCount: proposedTopics.length }
      );

      const totalDuration = performance.now() - startTime;
      console.log(`\n🎯 Total service operation completed in ${totalDuration.toFixed(2)}ms`);
      console.groupEnd();

      return { proposedTopics };
    } catch (error) {
      const errorDuration = performance.now() - startTime;
      console.error(`\n❌ ERROR in propose new topics service after ${errorDuration.toFixed(2)}ms:`);
      console.error(`Error Name: ${error.name}`);
      console.error(`Error Message: ${error.message}`);
      console.error(`Error Stack:`, error.stack);
      console.groupEnd();
      
      this.logger.error(
        `Yeni konu önerileri tespiti sırasında hata: ${error.message}`,
        'LearningTargetsService.proposeNewTopics',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  /**
   * Confirm and save selected topics as learning targets
   * @param dto The selected topics with temporary IDs
   * @param userId The user ID
   * @returns List of created learning targets
   */
  @LogMethod({ trackParams: true })
  async confirmAndSaveNewTopicsAsLearningTargets(
    dto: ConfirmNewTopicsDto,
    userId: string,
  ): Promise<LearningTarget[]> {
    const operationId = `service-confirm-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = performance.now();
    
    console.group(`\n✅ SERVICE: Confirm and Save Topics - Operation ID: ${operationId}`);
    console.log(`📅 Timestamp: ${new Date().toISOString()}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`🏫 Course ID: ${dto.courseId}`);
    console.log(`📊 Selected Topics Count: ${dto.selectedTopics?.length || 0}`);
    console.log(`📋 DTO:`, JSON.stringify(dto, null, 2));
    
    try {
      this.flowTracker.trackStep(
        `Seçilen konular öğrenme hedefi olarak kaydediliyor`,
        'LearningTargetsService',
      );

      this.logger.info(
        `${userId} kullanıcısı için ${dto.selectedTopics.length} adet öğrenme hedefi oluşturuluyor`,
        'LearningTargetsService.confirmAndSaveNewTopicsAsLearningTargets',
        __filename,
        undefined,
        { userId, selectedTopicCount: dto.selectedTopics.length }
      );

      if (dto.selectedTopics.length === 0) {
        console.log(`\n⚠️ No topics selected, returning empty array`);
        console.groupEnd();
        return [];
      }

      console.log(`\n📝 Topics to be created:`);
      dto.selectedTopics.forEach((topic, index) => {
        console.log(`  ${index + 1}. ${topic.name} (Temp ID: ${topic.tempId})`);
      });

      // Get Firestore batch for bulk write
      const db = this.firebaseService.firestore;
      const batch = db.batch();
      const now = admin.firestore.FieldValue.serverTimestamp();
      const createdTargets: LearningTarget[] = [];

      console.log(`\n🚀 Preparing Firestore batch operations...`);
      const batchStartTime = performance.now();

      // Create a learning target for each selected topic
      for (const topic of dto.selectedTopics) {
        const normalizedName = this.normalizationService.normalizeSubTopicName(topic.name || '');
        
        const newTarget: Omit<LearningTarget, 'id'> = {
          userId,
          courseId: dto.courseId || '', // Provide default empty string if undefined
          subTopicName: topic.name || '', // Ensure name is not undefined
          normalizedSubTopicName: normalizedName,
          status: 'pending',
          failCount: 0,
          mediumCount: 0,
          successCount: 0,
          lastAttemptScorePercent: null,
          lastAttempt: null,
          firstEncountered: new Date().toISOString(),
        };

        // Create a new document reference
        const targetRef = db.collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS).doc();
        batch.set(targetRef, newTarget);
        
        console.log(`  📄 Prepared batch operation for: ${topic.name} -> Document ID: ${targetRef.id}`);
        console.log(`     Normalized Name: ${normalizedName}`);
        
        // Add to created targets list with temporary ID for return
        // Add to created targets with a placeholder for timestamps
        // This is a workaround for the Timestamp/FieldValue type issue
        createdTargets.push({
          ...newTarget,
          id: targetRef.id,
          createdAt: null as any, // Will be set by Firestore
          updatedAt: null as any, // Will be set by Firestore
        } as LearningTarget);
      }

      const batchPrepTime = performance.now() - batchStartTime;
      console.log(`\n✅ Batch prepared in ${batchPrepTime.toFixed(2)}ms`);
      
      console.log(`\n💾 Committing batch to Firestore...`);
      const commitStartTime = performance.now();
      
      // Commit the batch
      await batch.commit();
      
      const commitTime = performance.now() - commitStartTime;
      console.log(`\n✅ Batch committed successfully in ${commitTime.toFixed(2)}ms`);
      
      console.log(`\n🎯 Created Learning Targets Summary:`);
      createdTargets.forEach((target, index) => {
        console.log(`  ${index + 1}. ${target.subTopicName}`);
        console.log(`     ID: ${target.id}`);
        console.log(`     Status: ${target.status}`);
        console.log(`     Course ID: ${target.courseId}`);
        console.log(`     Normalized: ${target.normalizedSubTopicName}`);
      });

      this.logger.info(
        `${createdTargets.length} adet öğrenme hedefi başarıyla oluşturuldu`,
        'LearningTargetsService.confirmAndSaveNewTopicsAsLearningTargets',
        __filename,
        undefined,
        { userId, createdCount: createdTargets.length }
      );

      const totalDuration = performance.now() - startTime;
      console.log(`\n🎯 Total service operation completed in ${totalDuration.toFixed(2)}ms`);
      console.groupEnd();

      return createdTargets;
    } catch (error) {
      const errorDuration = performance.now() - startTime;
      console.error(`\n❌ ERROR in confirm and save topics service after ${errorDuration.toFixed(2)}ms:`);
      console.error(`Error Name: ${error.name}`);
      console.error(`Error Message: ${error.message}`);
      console.error(`Error Stack:`, error.stack);
      console.groupEnd();
      
      this.logger.error(
        `Öğrenme hedefleri oluşturulurken hata: ${error.message}`,
        'LearningTargetsService.confirmAndSaveNewTopicsAsLearningTargets',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  /**
        `Kullanıcıya ait öğrenme hedefleri getiriliyor`,
        'LearningTargetsService',
      );
      
      this.logger.info(
        `${userId} kullanıcısına ait öğrenme hedefleri getiriliyor`,
        'LearningTargetsService.findAllLearningTargetsByUserId',
        __filename,
        undefined,
        { userId, courseId }
      );

      // Create query conditions
      const conditions: any[] = [
        {
          field: 'userId',
          operator: '==' as admin.firestore.WhereFilterOp,
          value: userId,
        },
      ];
      
      // Add courseId filter if provided
      if (courseId) {
        conditions.push({
          field: 'courseId',
          operator: '==' as admin.firestore.WhereFilterOp,
          value: courseId,
        });
      }

      // Query Firestore
      const targetsSnapshot = await this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS)
        .where('userId', '==', userId)
        .orderBy('updatedAt', 'desc')
        .get();
      
      // Convert snapshots to objects
      const targets: LearningTarget[] = [];
      targetsSnapshot.forEach(doc => {
        targets.push({
          id: doc.id,
          ...doc.data(),
        } as LearningTarget);
      });

      this.logger.info(
        `${targets.length} adet öğrenme hedefi getirildi`,
        'LearningTargetsService.findAllLearningTargetsByUserId',
        __filename,
        undefined,
        { userId, courseId, targetCount: targets.length },
      );

      return targets;
    } catch (error) {
      this.logger.error(
        `Öğrenme hedefleri getirilirken hata: ${error.message}`,
        'LearningTargetsService.findAllLearningTargetsByUserId',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }
  // This was a duplicate method that has been removed

  /**
   * Update a learning target
   * @param targetId ID of the learning target to update
   * @param userId User ID for verification
   * @param dto Update data
   * @returns Updated learning target
   */
  @LogMethod({ trackParams: true })
  async update(
    targetId: string,
    userId: string,
    dto: UpdateLearningTargetDto,
  ): Promise<LearningTarget> {
    try {
      this.flowTracker.trackStep(
        `${targetId} ID'li öğrenme hedefi güncelleniyor`,
        'LearningTargetsService',
      );

      this.logger.info(
        `${targetId} ID'li öğrenme hedefinin güncellenmesi istendi`,
        'LearningTargetsService.update',
        __filename,
        undefined,
        { targetId, userId, updateData: dto }
      );

      // LOG: Güncelleme girişimi
      if (typeof (global as any).logLearningTarget === 'function') {
        (global as any).logLearningTarget(
          'INFO',
          `[update] Öğrenme hedefi güncelleme girişimi`,
          { targetId, userId, updateData: dto, function: 'update', step: 'input', timestamp: new Date().toISOString() }
        );
      }

      // Get the target to verify ownership
      const targetRef = this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS)
        .doc(targetId);

      const targetSnapshot = await targetRef.get();
      
      if (!targetSnapshot.exists) {
        throw new NotFoundException(`${targetId} ID'li öğrenme hedefi bulunamadı`);
      }

      const targetData = targetSnapshot.data() as LearningTarget;
      
      // Verify ownership
      if (targetData.userId !== userId) {
        throw new ForbiddenException('Bu öğrenme hedefini güncelleme yetkiniz yok');
      }

      // Prepare update data
      const updateData: any = {}; // Use any type to allow properties not in the interface
      const now = admin.firestore.FieldValue.serverTimestamp();
      
      // Only update fields that are provided
      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }
      
      if (dto.notes !== undefined) {
        updateData.notes = dto.notes;
      }
      
      // Always update the updatedAt timestamp
      updateData.updatedAt = now;

      // Update the document
      await targetRef.update(updateData);

      this.logger.info(
        `${targetId} ID'li öğrenme hedefi başarıyla güncellendi`,
        'LearningTargetsService.update',
        __filename,
        undefined,
        { targetId, userId }
      );

      // Return the updated target
      return {
        ...targetData,
        ...updateData,
        id: targetId,
        updatedAt: null as any, // Will be set by Firestore
      } as LearningTarget;
    } catch (error) {
      this.logger.error(
        `Öğrenme hedefi güncellenirken hata: ${error.message}`,
        'LearningTargetsService.update',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  /**
   * Get existing topics for a course
   */
  @LogMethod({ trackParams: true })
  private async getExistingTopics(courseId: string): Promise<string[]> {
    try {
      this.flowTracker.trackStep(
        `${courseId} ID'li derse ait mevcut konular getiriliyor`,
        'LearningTargetsService',
      );

      const existingTopics = await this.firebaseService.findMany<{
        subTopicName: string;
      }>(FIRESTORE_COLLECTIONS.LEARNING_TARGETS, [
        {
          field: 'courseId',
          operator: '==' as admin.firestore.WhereFilterOp,
          value: courseId,
        },
      ]);

      this.logger.debug(
        `${existingTopics.length} adet mevcut konu bulundu`,
        'LearningTargetsService.getExistingTopics',
        __filename,
        82,
        { courseId, topicCount: existingTopics.length },
      );

      return existingTopics.map((t) => t.subTopicName); // Using subTopicName from the database
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsService.getExistingTopics', {
        courseId,
        additionalInfo: 'Mevcut konular getirilirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Get learning targets by status
   */
  @LogMethod({ trackParams: true })
  async findByStatus(
    courseId: string,
    userId: string,
    status: 'pending' | 'failed' | 'medium' | 'mastered',
  ): Promise<LearningTargetWithQuizzes[]> {
    try {
      this.flowTracker.trackStep(
        `${courseId} ID'li dersin '${status}' durumundaki öğrenme hedefleri getiriliyor`,
        'LearningTargetsService',
      );

      await this.validateCourseOwnership(courseId, userId);

      const targets =
        await this.firebaseService.findMany<LearningTargetWithQuizzes>(
          FIRESTORE_COLLECTIONS.LEARNING_TARGETS,
          [
            {
              field: 'courseId',
              operator: '==' as admin.firestore.WhereFilterOp,
              value: courseId,
            },
            {
              field: 'status',
              operator: '==' as admin.firestore.WhereFilterOp,
              value: status,
            },
          ],
          // Sıralama kaldırıldı - bileşik indeks gereksinimini ortadan kaldırmak için
          // { field: 'firstEncountered', direction: 'desc' },
        );

      this.logger.info(
        `${targets.length} adet '${status}' durumundaki öğrenme hedefi getirildi`,
        'LearningTargetsService.findByStatus',
        __filename,
        120,
        { courseId, userId, status, targetCount: targets.length },
      );

      return targets;
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsService.findByStatus', {
        courseId,
        userId,
        status,
        additionalInfo:
          'Durum bazlı öğrenme hedefleri getirilirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Update a learning target
   * @param targetId The ID of the learning target to update
   * @param dto The update data
   * @param userId The user ID
   * @returns The updated learning target
   */
  @LogMethod({ trackParams: true })
  async updateLearningTarget(
    targetId: string,
    dto: UpdateLearningTargetDto,
    userId: string,
  ): Promise<LearningTarget> {
    try {
      this.flowTracker.trackStep(
        `${targetId} ID'li öğrenme hedefi güncelleniyor`,
        'LearningTargetsService',
      );

      this.logger.info(
        `${targetId} ID'li öğrenme hedefi güncelleniyor`,
        'LearningTargetsService.updateLearningTarget',
        __filename,
        undefined,
        { targetId, userId }
      );

      // Get the existing target to verify ownership
      const targetRef = this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS)
        .doc(targetId);

      const targetSnapshot = await targetRef.get();
      
      if (!targetSnapshot.exists) {
        throw new NotFoundException(`${targetId} ID'li öğrenme hedefi bulunamadı`);
      }

      const targetData = targetSnapshot.data() as LearningTarget;
      
      // Verify ownership
      if (targetData.userId !== userId) {
        throw new ForbiddenException('Bu öğrenme hedefini güncelleme yetkiniz yok');
      }

      // Prepare update data
      const updateData: any = {
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      // Add fields to update if they exist in DTO
      if (dto.status !== undefined) {
        updateData.status = dto.status;
      }

      if (dto.notes !== undefined) {
        updateData.notes = dto.notes;
      }

      // Update the document
      await targetRef.update(updateData);

      this.logger.info(
        `${targetId} ID'li öğrenme hedefi başarıyla güncellendi`,
        'LearningTargetsService.updateLearningTarget',
        __filename,
        undefined,
        { targetId, userId, updateFields: Object.keys(updateData).filter(k => k !== 'updatedAt') }
      );

      // Return the updated target
      // We're using the existing data + updates for return value since we don't have a direct method to get fresh data with Timestamp handling
      return {
        ...targetData,
        ...updateData,
        id: targetId,
        updatedAt: null as any, // Will be set by Firestore
      } as LearningTarget;
    } catch (error) {
      this.logger.error(
        `Öğrenme hedefi güncellenirken hata: ${error.message}`,
        'LearningTargetsService.updateLearningTarget',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  /**
   * Delete a learning target
   */
  @LogMethod({ trackParams: true })
  async remove(id: string, userId: string): Promise<void> {
    try {
      this.flowTracker.trackStep(
        `${id} ID'li öğrenme hedefi siliniyor`,
        'LearningTargetsService',
      );

      // Verify ownership
      await this.findOne(id, userId);

      await this.firebaseService.delete(
        FIRESTORE_COLLECTIONS.LEARNING_TARGETS,
        id,
      );

      this.logger.info(
        `Öğrenme hedefi silindi: ${id}`,
        'LearningTargetsService.remove',
        __filename,
        204,
        { targetId: id, userId },
      );
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsService.remove', {
        targetId: id,
        userId,
        additionalInfo: 'Öğrenme hedefi silinirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Create a new learning target
   */
  @LogMethod({ trackParams: true })
  async create(
    userId: string,
    createLearningTargetDto: CreateLearningTargetDto,
  ): Promise<LearningTargetWithQuizzes> {
    try {
      this.flowTracker.trackStep(
        `Yeni öğrenme hedefi oluşturuluyor`,
        'LearningTargetsService',
      );

      // Validate course ownership
      await this.validateCourseOwnership(
        createLearningTargetDto.courseId || '',
        userId,
      );

      const normalizedName = this.normalizationService.normalizeSubTopicName(
        createLearningTargetDto.topicName,
      );

      this.logger.debug(
        `Öğrenme hedefi normalizasyonu: "${createLearningTargetDto.topicName}" -> "${normalizedName}"`,
        'LearningTargetsService.create',
        __filename,
        235,
        {
          userId,
          courseId: createLearningTargetDto.courseId || '',
          subTopicName: createLearningTargetDto.topicName,
          normalizedName,
        },
      );

      const now = new Date();

      // Create target with required properties, using type assertion to handle model differences
      const newTarget = {
        userId,
        normalizedSubTopicName: normalizedName,
        subTopicName: createLearningTargetDto.topicName, // Using topicName from DTO but mapping to subTopicName for compatibility
        status: 'pending' as any, // Type assertion to handle legacy status mapping
        failCount: 0,
        mediumCount: 0,
        successCount: 0,
        lastAttempt: null,
        lastAttemptScorePercent: null,
        quizzes: [],
        attemptCount: 0,
        notes: createLearningTargetDto.notes,
        courseId: createLearningTargetDto.courseId || '',
        createdAt: now as any,
        updatedAt: now as any,
        source: LearningTargetSource.MANUAL,
        firstEncountered: now, // Adding required property
      };

      const createdDoc = await this.firebaseService.create<
        Omit<LearningTargetWithQuizzes, 'id'>
      >(FIRESTORE_COLLECTIONS.LEARNING_TARGETS, newTarget);

      this.logger.info(
        `Yeni öğrenme hedefi oluşturuldu: ${createdDoc.id}`,
        'LearningTargetsService.create',
        __filename,
        263,
        {
          targetId: createdDoc.id,
          userId,
          topicName: createLearningTargetDto.topicName, // Using topicName to match the new model structure
          courseId: createLearningTargetDto.courseId || '',
        },
      );

      return {
        ...createdDoc,
        quizzes: [],
        firstEncountered: now,
      } as LearningTargetWithQuizzes;
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsService.create', {
        userId,
        createData: createLearningTargetDto,
        additionalInfo: 'Öğrenme hedefi oluşturulurken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Get all learning targets for a user
   * Alias: findAll - Bu metot kullanıcıya ait tüm öğrenme hedeflerini döndürür
   */
  @LogMethod({ trackParams: true })
  async findMany(userId: string): Promise<LearningTargetWithQuizzes[]> {
    try {
      this.flowTracker.trackStep(
        `Kullanıcıya ait tüm öğrenme hedefleri getiriliyor`,
        'LearningTargetsService',
      );

      const targets =
        await this.firebaseService.findMany<LearningTargetWithQuizzes>(
          FIRESTORE_COLLECTIONS.LEARNING_TARGETS,
          [
            {
              field: 'userId',
              operator: '==' as admin.firestore.WhereFilterOp,
              value: userId,
            },
          ],
          { field: 'firstEncountered', direction: 'desc' },
        );

      this.logger.info(
        `${targets.length} adet öğrenme hedefi getirildi`,
        'LearningTargetsService.findMany',
        __filename,
        303,
        { userId, targetCount: targets.length },
      );

      return targets;
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsService.findMany', {
        userId,
        additionalInfo:
          'Kullanıcıya ait öğrenme hedefleri getirilirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Get all learning targets for a user
   * @param userId User ID
   */
  @LogMethod({ trackParams: true })
  async findAll(userId: string): Promise<LearningTargetWithQuizzes[]> {
    try {
      this.flowTracker.trackStep(
        `Kullanıcıya ait tüm öğrenme hedefleri getiriliyor`,
        'LearningTargetsService',
      );

      return await this.findMany(userId);
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsService.findAll', {
        userId,
        additionalInfo:
          'Kullanıcıya ait öğrenme hedefleri getirilirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Get a single learning target by ID
   */
  @LogMethod({ trackParams: true })
  async findOne(
    id: string,
    userId: string,
  ): Promise<LearningTargetWithQuizzes> {
    try {
      this.flowTracker.trackStep(
        `${id} ID'li öğrenme hedefi getiriliyor`,
        'LearningTargetsService',
      );

      const target =
        await this.firebaseService.findById<LearningTargetWithQuizzes>(
          FIRESTORE_COLLECTIONS.LEARNING_TARGETS,
          id,
        );

      if (!target) {
        this.logger.warn(
          `Öğrenme hedefi bulunamadı: ${id}`,
          'LearningTargetsService.findOne',
          __filename,
          350,
          { targetId: id, userId },
        );
        throw new NotFoundException(`Öğrenme hedefi bulunamadı: ${id}`);
      }

      if (target.userId !== userId) {
        this.logger.warn(
          `Yetkisiz erişim: ${userId} kullanıcısı ${id} ID'li öğrenme hedefine erişim yetkisine sahip değil`,
          'LearningTargetsService.findOne',
          __filename,
          360,
          { targetId: id, userId, ownerId: target.userId },
        );
        throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır.');
      }

      this.logger.debug(
        `Öğrenme hedefi getirildi: ${id}`,
        'LearningTargetsService.findOne',
        __filename,
        369,
        { targetId: id, userId },
      );

      return target;
    } catch (error) {
      // Zaten loglanan hataları tekrar loglama
      if (
        !(
          error instanceof NotFoundException ||
          error instanceof ForbiddenException
        )
      ) {
        this.logger.logError(error, 'LearningTargetsService.findOne', {
          targetId: id,
          userId,
          additionalInfo: 'Öğrenme hedefi getirilirken hata oluştu',
        });
      }
      throw error;
    }
  }

  /**
   * Use AI to detect topics in document text
   */
  @LogMethod({ trackParams: true })
  async analyzeDocumentForTopics(
    documentId: string,
    userId: string,
  ): Promise<string[]> {
    try {
      this.logger.debug(
        `Belge ID ${documentId} için belge metnini getiriliyor...`,
        'LearningTargetsService.analyzeDocumentForTopics',
        __filename,
        undefined,
        { documentId, userId },
      );

      // Belge ID kullanarak belge metnini al
      const documentTextResponse = await this.documentsService.getDocumentText(
        documentId,
        userId,
      );

      // Belge metni dönüş tipini kontrol et
      if (!documentTextResponse || !documentTextResponse.text) {
        this.logger.warn(
          `Belge metni alınamadı veya boş (ID: ${documentId})`,
          'LearningTargetsService.analyzeDocumentForTopics',
          __filename,
          undefined,
          { documentId, userId },
        );
        throw new BadRequestException('Geçerli bir belge metni bulunamadı.');
      }

      // Belge metni aldığımızı logla
      this.logger.debug(
        `Belge metni alındı (${documentTextResponse.text.length} karakter)`,
        'LearningTargetsService.analyzeDocumentForTopics',
        __filename,
        undefined,
        {
          documentId,
          userId,
          textLength: documentTextResponse.text.length,
        },
      );

      // Belge metninden konuları tespit et
      this.logger.debug(
        'AI servisi kullanılarak konular tespit ediliyor...',
        'LearningTargetsService.analyzeDocumentForTopics',
        __filename,
        undefined,
        { documentId, userId },
      );

      // AI servisini kullanarak metinden konuları tespit et
      const topicResult = await this.aiService.detectTopics(
        documentTextResponse.text,
      );

      // topicResult.topics dizisindeki her bir topic nesnesinden (SubTopic bekliyoruz)
      // subTopicName veya alternatiflerini alarak string dizisi oluştur
      if (topicResult && Array.isArray(topicResult.topics)) {
        return topicResult.topics.map(
          (
            topic: any, // topic'in SubTopic veya benzeri bir yapıda olması beklenir
          ) =>
            topic.subTopicName ||
            topic.normalizedSubTopicName ||
            topic.mainTopic || // Eğer mainTopic de bir olasılıksa
            'Bilinmeyen konu',
        );
      }

      // Eğer topics dizisi yoksa boş dizi dön
      return [];
    } catch (error) {
      this.logger.logError(
        error,
        'LearningTargetsService.analyzeDocumentForTopics',
        {
          userId,
          documentId,
          additionalInfo: 'Belge analizinde hata oluştu',
        },
      );
      throw error;
    }
  }

  /**
   * Doğrudan metin içeriğinden konuları tespit eder
   */
  @LogMethod({ trackParams: true })
  async analyzeDocumentText(
    documentText: string,
    userId: string,
  ): Promise<string[]> {
    try {
      this.logger.debug(
        `Doğrudan metin analizi başlatılıyor (${documentText.length} karakter)`,
        'LearningTargetsService',
        __filename,
      );

      // AI servisi ile konuları tespit et
      const topicResult = await this.aiService.detectTopics(documentText);

      // TopicDetectionResult nesnesini string dizisine dönüştür
      const topics = topicResult.topics.map(
        (topic) =>
          topic.subTopicName ||
          topic.normalizedSubTopicName ||
          'Bilinmeyen konu',
      );

      this.logger.info(
        `${topics.length} adet konu tespit edildi`,
        'LearningTargetsService',
        __filename,
      );

      this.logger.debug(
        'Metinden çıkarılan konular',
        'LearningTargetsService',
        __filename,
        undefined,
        {
          userId,
          topicCount: topics.length,
          topics: topics.join(', '),
        },
      );

      return topics;
    } catch (error) {
      this.logger.logError(
        error,
        'LearningTargetsService.analyzeDocumentText',
        {
          userId,
          textLength: documentText?.length || 0,
          additionalInfo: 'Metin içinden konular tespit edilirken hata oluştu',
        },
      );
      return [];
    }
  }

  /**
   * Create multiple learning targets at once
   */
  @LogMethod({ trackParams: true })
  async createBatch(
    courseId: string,
    userId: string,
    topics: Array<{ subTopicName: string; normalizedSubTopicName?: string }>,
  ): Promise<LearningTargetWithQuizzes[]> {
    try {
      this.flowTracker.trackStep(
        `${courseId} ID'li ders için ${topics.length} adet öğrenme hedefi toplu oluşturuluyor`,
        'LearningTargetsService',
      );

      // Verify course ownership
      await this.validateCourseOwnership(courseId, userId);

      // Get existing topics to avoid duplicates
      const existingTopics = await this.getExistingTopics(courseId);
      const existingNormalizedTopics = existingTopics.map((topic) =>
        this.normalizationService.normalizeSubTopicName(topic),
      );

      this.logger.debug(
        `${existingTopics.length} adet mevcut konu bulundu`,
        'LearningTargetsService.createBatch',
        __filename,
        450,
        {
          courseId,
          userId,
          topicCount: topics.length,
          existingTopicCount: existingTopics.length,
        },
      );

      // Filter out duplicates based on normalized names
      const uniqueTopics = topics.filter((topic) => {
        // Normalize if not already normalized
        const normalizedName =
          topic.normalizedSubTopicName ||
          this.normalizationService.normalizeSubTopicName(topic.subTopicName);
        return !existingNormalizedTopics.includes(normalizedName);
      });

      this.logger.debug(
        `${uniqueTopics.length} adet benzersiz yeni konu bulundu`,
        'LearningTargetsService.createBatch',
        __filename,
        466,
        {
          courseId,
          userId,
          uniqueTopicCount: uniqueTopics.length,
        },
      );

      if (uniqueTopics.length === 0) {
        this.logger.info(
          'Eklenecek yeni konu bulunamadı',
          'LearningTargetsService.createBatch',
          __filename,
          477,
          { courseId, userId },
        );
        return []; // No new topics to add
      }

      const now = new Date();
      const batch = this.firebaseService.firestore.batch();
      const createdTargets: LearningTargetWithQuizzes[] = [];

      // Her bir konu için öğrenme hedefi oluştur
      for (const topic of uniqueTopics) {
        // Eğer normalizedSubTopicName zaten tanımlı değilse, oluştur
        const normalizedName = topic.normalizedSubTopicName || 
          this.normalizationService.normalizeSubTopicName(topic.subTopicName);
        
        // Yeni öğrenme hedefi ID'si (Firestore'un benzersiz ID oluşturma metodunu kullanıyoruz)
        const newId = this.firebaseService.generateId();
        
        // Yeni belge referansı
        const newRef = this.firebaseService.firestore
          .collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS)
          .doc(newId);
        
        // Öğrenme hedefi verisi - tüm hedefler "pending" (beklemede) olarak kaydediliyor
        const newLearningTarget = {
          id: newId,
          courseId,
          userId,
          subTopicName: topic.subTopicName,
          normalizedSubTopicName: normalizedName,
          status: 'pending', // Öğrenme hedefi durumu: beklemede
          isNew: true, // Yeni oluşturulan hedef olduğu için true
          lastAttemptScorePercent: 0,
          attemptCount: 0,
          successCount: 0,
          failCount: 0,
          mediumCount: 0,
          quizzes: [], // İlişkili sınavlar başlangıçta boş
          createdAt: now as any, // Type assertion for Firestore Timestamp
          updatedAt: now as any, // Type assertion for Firestore Timestamp
          firstEncountered: now,
          lastAttempt: null,
        };
        
        // Batch'e ekle
        batch.set(newRef, newLearningTarget);
        
        // Oluşturulan hedefleri izle
        // Use double type assertion to safely convert between incompatible types
        createdTargets.push(newLearningTarget as unknown as LearningTargetWithQuizzes);
        
        this.logger.debug(
          `Yeni öğrenme hedefi oluşturuldu: ${newId} (${topic.subTopicName})`,
          'LearningTargetsService.createBatch',
          __filename,
          500,
          { targetId: newId, topicName: topic.subTopicName }
        );
      }

      // Kayıt yapılacak öğrenme hedefi sayısını logla
      this.logger.info(
        `${createdTargets.length} adet yeni öğrenme hedefi oluşturulacak`,
        'LearningTargetsService.createBatch',
        __filename,
        510,
        { courseId, userId, count: createdTargets.length }
      );

      try {
        // Batch işlemini commit et
        await batch.commit();
        
        this.logger.info(
          `${createdTargets.length} adet yeni öğrenme hedefi başarıyla oluşturuldu`,
          'LearningTargetsService.createBatch',
          __filename,
          520,
          { courseId, userId, count: createdTargets.length }
        );
        
        return createdTargets;
      } catch (error) {
        this.logger.logError(error, 'LearningTargetsService.createBatch', {
          courseId,
          userId,
          topicCount: topics.length,
          additionalInfo: 'Öğrenme hedefleri oluşturulurken hata oluştu',
        });
        throw error;
      }
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsService.createBatch', {
        courseId,
        userId,
        topicCount: topics.length,
        additionalInfo: 'Öğrenme hedefleri oluşturulurken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Confirm and save new AI-suggested topics
   * This method processes AI-suggested topics that have been confirmed by the user
   */
  @LogMethod({ trackParams: true })
  async confirmAndSaveNewTopics(
    courseId: string,
    newTopicNames: string[],
    userId: string,
  ): Promise<LearningTarget[]> {
    try {
      this.flowTracker.trackStep(
        `${newTopicNames.length} adet AI önerisi konuları onaylanarak kaydediliyor`,
        'LearningTargetsService',
      );

      // Validate inputs
      if (!courseId || !Array.isArray(newTopicNames) || !userId) {
        throw new BadRequestException(
          'Geçersiz parametreler: courseId, newTopicNames ve userId gereklidir',
        );
      }

      if (newTopicNames.length === 0) {
        this.logger.info(
          'Onaylanacak konu bulunamadı',
          'LearningTargetsService.confirmAndSaveNewTopics',
          __filename,
          undefined,
          { courseId, userId },
        );
        return [];
      }

      // Verify course ownership
      await this.validateCourseOwnership(courseId, userId);

      this.logger.debug(
        `AI önerisi konular onaylanarak kaydediliyor: ${newTopicNames.join(', ')}`,
        'LearningTargetsService.confirmAndSaveNewTopics',
        __filename,
        undefined,
        {
          courseId,
          userId,
          topicCount: newTopicNames.length,
          topics: newTopicNames,
        },
      );

      // Get existing topics to check for duplicates
      const existingTopics = await this.getExistingTopics(courseId);
      const existingNormalizedTopics = existingTopics.map((topic) =>
        this.normalizationService.normalizeSubTopicName(topic),
      );

      this.logger.debug(
        `${existingTopics.length} adet mevcut konu kontrol ediliyor`,
        'LearningTargetsService.confirmAndSaveNewTopics',
        __filename,
        undefined,
        {
          courseId,
          userId,
          existingTopicCount: existingTopics.length,
        },
      );

      // Filter out duplicates and prepare topics for creation
      const uniqueTopics: Array<{ subTopicName: string; normalizedSubTopicName: string }> = [];
      const duplicateTopics: string[] = [];

      for (const topicName of newTopicNames) {
        const normalizedName = this.normalizationService.normalizeSubTopicName(topicName);
        
        if (existingNormalizedTopics.includes(normalizedName)) {
          duplicateTopics.push(topicName);
        } else {
          uniqueTopics.push({
            subTopicName: topicName,
            normalizedSubTopicName: normalizedName,
          });
        }
      }

      if (duplicateTopics.length > 0) {
        this.logger.warn(
          `Duplicate topics filtered out: ${duplicateTopics.join(', ')}`,
          'LearningTargetsService.confirmAndSaveNewTopics',
          __filename,
          undefined,
          {
            courseId,
            userId,
            duplicateCount: duplicateTopics.length,
            duplicates: duplicateTopics,
          },
        );
      }

      if (uniqueTopics.length === 0) {
        this.logger.info(
          'Tüm konular zaten mevcut, yeni konu eklenmedi',
          'LearningTargetsService.confirmAndSaveNewTopics',
          __filename,
          undefined,
          { courseId, userId, duplicateCount: duplicateTopics.length },
        );
        return [];
      }

      // Create learning targets with batch operation
      const now = new Date();
      const batch = this.firebaseService.firestore.batch();
      const createdTargets: LearningTarget[] = [];

      for (const topic of uniqueTopics) {
        // Generate unique ID for the new learning target
        const newId = this.firebaseService.generateId();
        
        // Create document reference
        const newRef = this.firebaseService.firestore
          .collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS)
          .doc(newId);
        
        // Create learning target data with AI-generated source
        const newLearningTarget: LearningTarget = {
          id: newId,
          courseId,
          userId,
          subTopicName: topic.subTopicName, // Using subTopicName to match interface
          normalizedSubTopicName: topic.normalizedSubTopicName, // Adding normalized name
          status: 'pending' as 'pending' | 'failed' | 'medium' | 'mastered', // Default status for new AI-suggested topics
          failCount: 0,
          mediumCount: 0,
          successCount: 0,
          lastAttemptScorePercent: null,
          lastAttempt: null,
          firstEncountered: now.toISOString(),
        };
        
        // Add to batch
        batch.set(newRef, newLearningTarget);
        
        // Track created targets
        createdTargets.push(newLearningTarget);
        
        this.logger.debug(
          `AI önerisi konu öğrenme hedefi olarak hazırlandı: ${newId} (${topic.subTopicName})`,
          'LearningTargetsService.confirmAndSaveNewTopics',
          __filename,
          undefined,
          { 
            targetId: newId, 
            topicName: topic.subTopicName,
          },
        );
      }

      this.logger.info(
        `${createdTargets.length} adet AI önerisi konu öğrenme hedefi olarak kaydedilecek`,
        'LearningTargetsService.confirmAndSaveNewTopics',
        __filename,
        undefined,
        { 
          courseId, 
          userId, 
          count: createdTargets.length,
        },
      );

      // Execute batch operation
      await batch.commit();
      
      this.logger.info(
        `${createdTargets.length} adet AI önerisi konu başarıyla öğrenme hedefi olarak kaydedildi`,
        'LearningTargetsService.confirmAndSaveNewTopics',
        __filename,
        undefined,
        { 
          courseId, 
          userId, 
          count: createdTargets.length,
          topics: createdTargets.map(t => t.subTopicName),
        },
      );

      return createdTargets;
    } catch (error) {
      this.logger.logError(error, 'LearningTargetsService.confirmAndSaveNewTopics', {
        courseId,
        userId,
        topicCount: newTopicNames?.length || 0,
        topics: newTopicNames,
        additionalInfo: 'AI önerisi konular kaydedilirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Verify course ownership
   */
  private async validateCourseOwnership(
    courseId: string,
    userId: string,
  ): Promise<void> {
    const course = await this.firebaseService.findById<{ userId: string }>(
      FIRESTORE_COLLECTIONS.COURSES,
      courseId,
    );

    if (!course) {
      throw new NotFoundException(`Kurs bulunamadı: ${courseId}`);
    }

    if (course.userId !== userId) {
      throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır.');
    }
  }

  /**
   * Batch update learning targets based on quiz results
   * @param userId User ID
   * @param targets Array of learning targets to update
   * @returns Update result with success status and count
   */
  @LogMethod({ trackParams: true })
  async batchUpdate(userId: string, targets: any[]): Promise<{ success: boolean; updatedCount: number }> {
    const operationId = `batch-update-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = performance.now();
    
    console.group(`🔄 Service: Batch Update Learning Targets [${operationId}]`);
    console.log(`🕐 Service Start Time: ${new Date().toISOString()}`);
    console.log(`👤 User ID: ${userId}`);
    console.log(`📊 Targets Count: ${targets.length}`);
    console.log(`🏷️ Operation ID: ${operationId}`);
    
    if (targets.length > 0) {
      console.log(`📋 Targets to Process:`);
      targets.forEach((target, index) => {
        console.log(`  ${index + 1}. SubTopic: "${target.subTopic}", Status: "${target.status}", Score: ${target.score}`);
      });
    }
    
    try {
      this.flowTracker.trackStep(
        `Batch updating ${targets.length} learning targets`,
        'LearningTargetsService.batchUpdate',
      );

      this.logger.info(
        `Batch updating learning targets for user ${userId}`,
        'LearningTargetsService.batchUpdate',
        __filename,
        undefined,
        { userId, targetCount: targets.length }
      );

      if (targets.length === 0) {
        console.log(`⚠️ No targets to process, returning early`);
        console.groupEnd();
        return { success: true, updatedCount: 0 };
      }

      // Get Firestore database instance and create batch
      console.log(`🔧 Initializing Firestore batch operation...`);
      const db = this.firebaseService.firestore;
      const batch = db.batch();
      let updatedCount = 0;
      let newTargetsCount = 0;
      let existingTargetsCount = 0;

      // Process each target in the array
      console.log(`\n🔍 Processing ${targets.length} targets individually...`);
      const processingStartTime = performance.now();
      
      for (let i = 0; i < targets.length; i++) {
        const target = targets[i];
        const targetStartTime = performance.now();
        
        console.log(`\n📝 Processing Target ${i + 1}/${targets.length}:`);
        console.log(`  🏷️ SubTopic: "${target.subTopic}"`);
        console.log(`  📊 Status: "${target.status}"`);
        console.log(`  🎯 Score: ${target.score}`);
        
        // Normalize the incoming subTopic for querying
        const normalizedQuerySubTopic = this.normalizationService.normalizeSubTopicName(target.subTopic);
        console.log(`  🔄 Normalized SubTopic: "${normalizedQuerySubTopic}"`);

        // Query for existing record based on userId and normalizedSubTopicName
        console.log(`  🔍 Querying for existing record...`);
        const queryStartTime = performance.now();
        
        const existingQuery = await db
          .collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS)
          .where('userId', '==', userId)
          .where('normalizedSubTopicName', '==', normalizedQuerySubTopic) // Changed to query by normalized name
          .limit(1)
          .get();
          
        const queryDuration = performance.now() - queryStartTime;
        console.log(`  ⏱️ Query Duration: ${queryDuration.toFixed(2)}ms`);

        if (!existingQuery.empty) {
          // Record exists - update it using batch.update()
          existingTargetsCount++;
          const existingDoc = existingQuery.docs[0];
          const existingData = existingDoc.data();
          
          console.log(`  ✅ Found existing record: ${existingDoc.id}`);
          console.log(`  📋 Current Status: "${existingData.status}" -> New Status: "${target.status}"`);
          console.log(`  🔢 Current Counters: fail=${existingData.failCount || 0}, medium=${existingData.mediumCount || 0}, success=${existingData.successCount || 0}`);
          
          // Convert frontend status to backend status
          const backendStatus = this.convertFrontendStatusToBackend(target.status);
          console.log(`  🔄 Backend Status: "${backendStatus}"`);
          
          // Prepare update data
          const updateData: any = {
            status: backendStatus,
            lastAttemptScorePercent: target.score,
            lastAttempt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          // Update counters based on status
          if (backendStatus === 'failed') {
            updateData.failCount = (existingData.failCount || 0) + 1;
            console.log(`  ➕ Incrementing fail count: ${existingData.failCount || 0} -> ${updateData.failCount}`);
          } else if (backendStatus === 'medium') {
            updateData.mediumCount = (existingData.mediumCount || 0) + 1;
            console.log(`  ➕ Incrementing medium count: ${existingData.mediumCount || 0} -> ${updateData.mediumCount}`);
          } else if (backendStatus === 'mastered') {
            updateData.successCount = (existingData.successCount || 0) + 1;
            console.log(`  ➕ Incrementing success count: ${existingData.successCount || 0} -> ${updateData.successCount}`);
          }

          batch.update(existingDoc.ref, updateData);
          updatedCount++;
          console.log(`  ✅ Queued for update (${updatedCount}/${targets.length})`);

          this.logger.debug(
            `Queued update for existing learning target: ${existingDoc.id} (${target.subTopic}) -> ${backendStatus}`,
            'LearningTargetsService.batchUpdate',
            __filename,
            undefined,
            { 
              targetId: existingDoc.id,
              subTopic: target.subTopic,
              oldStatus: existingData.status,
              newStatus: backendStatus,
              score: target.score 
            }
          );
        } else {
          // Record doesn't exist - create new one using batch.set()
          newTargetsCount++;
          const newDocRef = db.collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS).doc();
          const backendStatus = this.convertFrontendStatusToBackend(target.status);
          const now = admin.firestore.FieldValue.serverTimestamp();
          
          console.log(`  🆕 Creating new record: ${newDocRef.id}`);
          console.log(`  🔄 Backend Status: "${backendStatus}"`);
          
          // Prepare new document data
          const newDocData = {
            userId,
            subTopicName: target.subTopic,
            normalizedSubTopicName: this.normalizationService.normalizeSubTopicName(target.subTopic),
            status: backendStatus,
            failCount: backendStatus === 'failed' ? 1 : 0,
            mediumCount: backendStatus === 'medium' ? 1 : 0,
            successCount: backendStatus === 'mastered' ? 1 : 0,
            lastAttemptScorePercent: target.score,
            lastAttempt: now,
            firstEncountered: new Date().toISOString(),
            courseId: target.courseId || '',
            createdAt: now,
            updatedAt: now,
          };
          
          console.log(`  🔢 Initial Counters: fail=${newDocData.failCount}, medium=${newDocData.mediumCount}, success=${newDocData.successCount}`);

          batch.set(newDocRef, newDocData);
          updatedCount++;
          console.log(`  ✅ Queued for creation (${updatedCount}/${targets.length})`);

          this.logger.debug(
            `Queued creation of new learning target: ${newDocRef.id} (${target.subTopic}) -> ${backendStatus}`,
            'LearningTargetsService.batchUpdate',
            __filename,
            undefined,
            { 
              targetId: newDocRef.id,
              subTopic: target.subTopic,
              status: backendStatus,
              score: target.score 
            }
          );
        }
        
        const targetDuration = performance.now() - targetStartTime;
        console.log(`  ⏱️ Target Processing Duration: ${targetDuration.toFixed(2)}ms`);
      }
      
      const processingDuration = performance.now() - processingStartTime;
      console.log(`\n📊 Processing Summary:`);
      console.log(`  📈 Total Processing Duration: ${processingDuration.toFixed(2)}ms`);
      console.log(`  🔄 Existing Targets Updated: ${existingTargetsCount}`);
      console.log(`  🆕 New Targets Created: ${newTargetsCount}`);
      console.log(`  ✅ Total Queued Operations: ${updatedCount}`);

      // Execute all batch operations at once
      console.log(`\n🚀 Committing batch operations to Firestore...`);
      const commitStartTime = performance.now();
      
      await batch.commit();
      
      const commitDuration = performance.now() - commitStartTime;
      const totalDuration = performance.now() - startTime;
      
      console.log(`✅ Batch commit completed!`);
      console.log(`⏱️ Commit Duration: ${commitDuration.toFixed(2)}ms`);
      console.log(`⏱️ Total Operation Duration: ${totalDuration.toFixed(2)}ms`);
      console.log(`📈 Success Rate: ${((updatedCount / targets.length) * 100).toFixed(1)}%`);

      this.logger.info(
        `Batch update completed: ${updatedCount}/${targets.length} targets processed`,
        'LearningTargetsService.batchUpdate',
        __filename,
        undefined,
        { userId, requestedCount: targets.length, updatedCount }
      );

      console.groupEnd();
      return { success: true, updatedCount };
    } catch (error) {
      const totalDuration = performance.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`❌ Batch Update Error after ${totalDuration.toFixed(2)}ms:`, errorMessage);
      console.error(`📊 Error Details:`, error);
      console.groupEnd();
      
      this.logger.error(
        `Batch update failed: ${error.message}`,
        'LearningTargetsService.batchUpdate',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  /**
   * Convert frontend status format to backend format
   */
  private convertFrontendStatusToBackend(frontendStatus: string): 'pending' | 'failed' | 'medium' | 'mastered' {
    switch (frontendStatus.toUpperCase()) {
      case 'PENDING':
        return 'pending';
      case 'FAILED':
        return 'failed';
      case 'MEDIUM':
        return 'medium';
      case 'MASTERED':
        return 'mastered';
      default:
        return 'pending';
    }
  }
}
