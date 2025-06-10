/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { AiService } from '../ai/ai.service';
import { LearningTargetsService } from '../learning-targets/learning-targets.service';
import { QuizAnalysisService } from './quiz-analysis.service';
import { GenerateQuizDto, TopicDto } from './dto/generate-quiz.dto';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import {
  LearningTargetStatus,
  Quiz,
  AnalysisResult,
  QuizQuestion,
  CreateQuizParams,
  SubtopicUpdate,
} from '../common/types';
import { FIRESTORE_COLLECTIONS } from '../common/constants';
import { LoggerService, LogLevel } from '../common/services/logger.service';
import { FlowTrackerService } from '../common/services/flow-tracker.service';
import { LogMethod } from '../common/decorators';
import { DocumentsService } from '../documents/documents.service';
import { CoursesService } from '../courses/courses.service';
import { NormalizationService } from '../shared/normalization/normalization.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QuizzesService {
  private readonly logger: LoggerService;
  private readonly flowTracker: FlowTrackerService;
  findAll: any;

  // Öğrenme hedefi log dosyası yolu
  private readonly learningTargetLogPath: string;

  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly aiService: AiService,
    private readonly learningTargetsService: LearningTargetsService,
    private readonly quizAnalysisService: QuizAnalysisService,
    private readonly documentsService: DocumentsService,
    private readonly coursesService: CoursesService,
    private readonly normalizationService: NormalizationService,
  ) {
    this.logger = LoggerService.getInstance();
    this.flowTracker = FlowTrackerService.getInstance();
    this.logger.debug(
      'QuizzesService başlatıldı',
      'QuizzesService.constructor',
      __filename,
      29,
    );

    // Öğrenme hedefleri için log dosyası yolunu ayarla
    const logDir = 'logs';
    this.learningTargetLogPath = path.join(logDir, 'learning_targets.log'); // Türkçe karakter içermeyen dosya adı

    try {
      // Log dizininin var olduğundan emin ol
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
        console.log(`Log dizini oluşturuldu: ${logDir}`);
      }

      // Öğrenme hedefi log dosyasını oluştur (yoksa)
      if (!fs.existsSync(this.learningTargetLogPath)) {
        fs.writeFileSync(
          this.learningTargetLogPath,
          '[' +
            new Date().toISOString() +
            '] Öğrenme hedefleri log dosyası oluşturuldu\n',
          { encoding: 'utf8' },
        );
        console.log(
          `Öğrenme hedefleri log dosyası oluşturuldu: ${this.learningTargetLogPath}`,
        );
      }
    } catch (error) {
      console.error(
        `Log dosyası oluşturulurken hata: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Find all quizzes in the system (for admin purposes or general listing)
   */
  @LogMethod({ trackParams: true })
  async findAll(): Promise<Quiz[]> {
    try {
      this.flowTracker.trackStep('Tüm sınavlar getiriliyor', 'QuizzesService');

      const snapshot = await this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.QUIZZES)
        .orderBy('timestamp', 'desc')
        .get();

      // Firebase sonuçlarını Quiz tipine dönüştürüyoruz
      const quizzes = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as unknown as Quiz;
      });

      this.logger.info(
        `Toplam ${quizzes.length} adet sınav getirildi`,
        'QuizzesService.findAll',
        __filename,
        undefined,
        { quizzesCount: quizzes.length },
      );

      return quizzes;
    } catch (error) {
      this.logger.logError(error, 'QuizzesService.findAll', {
        additionalInfo: 'Tüm sınavlar getirilirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Find all quizzes for a user
   */
  @LogMethod({ trackParams: true })
  async findAllForUser(userId: string): Promise<Quiz[]> {
    try {
      this.flowTracker.trackStep(
        `${userId} ID'li kullanıcının tüm sınavları getiriliyor`,
        'QuizzesService',
      );

      const snapshot = await this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.QUIZZES)
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .get();

      // Firebase sonuçlarını Quiz tipine dönüştürüyoruz
      const quizzes = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        } as unknown as Quiz;
      });

      this.logger.info(
        `${quizzes.length} adet sınav getirildi`,
        'QuizzesService.findAllForUser',
        __filename,
        58,
        { userId, quizzesCount: quizzes.length },
      );

      return quizzes;
    } catch (error) {
      this.logger.logError(error, 'QuizzesService.findAllForUser', {
        userId,
        additionalInfo: 'Kullanıcının sınavları getirilirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Find quiz by id
   */
  @LogMethod({ trackParams: true })
  async findOne(id: string, userId: string): Promise<Quiz> {
    try {
      this.flowTracker.trackStep(
        `${id} ID'li sınav getiriliyor`,
        'QuizzesService',
      );

      const doc = await this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.QUIZZES)
        .doc(id)
        .get();

      if (!doc.exists) {
        this.logger.warn(
          `${id} ID'li sınav bulunamadı`,
          'QuizzesService.findOne',
          __filename,
          86,
          { quizId: id, userId },
        );
        throw new NotFoundException('Sınav bulunamadı');
      }

      // --- ADIM 1: Firestore'dan dönen ham veri ---
      this.logger.examProcessLogger.debug(
        `[TRACE] findOne | Firestore'dan dönen ham veri: ${JSON.stringify(doc.data(), null, 2)}`,
      );

      const quizData = doc.data();
      // --- ADIM 2: Quiz objesi oluşturuluyor ---
      const quiz = { id: doc.id, ...quizData } as unknown as Quiz;
      this.logger.examProcessLogger.debug(
        `[TRACE] findOne | Quiz objesi: ${JSON.stringify(quiz, null, 2)}`,
      );

      // --- ADIM 3: userAnswers alanı var mı, tipi ve içeriği nedir? ---
      this.logger.examProcessLogger.debug(
        `[TRACE] findOne | userAnswers typeof: ${typeof quiz.userAnswers}`,
      );
      if (!quiz.userAnswers) {
        this.logger.examProcessLogger.warn(
          `[TRACE] findOne | userAnswers alanı YOK veya BOŞ!`,
        );
      } else {
        this.logger.examProcessLogger.debug(
          `[TRACE] findOne | userAnswers içeriği: ${JSON.stringify(quiz.userAnswers, null, 2)}`,
        );
      }

      // --- ADIM 4: userId kontrolü ---
      if (quiz.userId !== userId) {
        this.logger.examProcessLogger.warn(
          `[TRACE] findOne | Yetkisiz erişim: ${userId} kullanıcısı ${id} ID'li sınava erişim yetkisine sahip değil`,
          'QuizzesService.findOne',
          __filename,
          98,
          { quizId: id, userId, ownerId: quiz.userId },
        );
        throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır.');
      }

      // --- ADIM 5: Response olarak dönen veri ---
      this.logger.examProcessLogger.debug(
        `[TRACE] findOne | RESPONSE olarak dönecek quiz objesi: ${JSON.stringify(quiz, null, 2)}`,
      );

      return quiz;
    } catch (error) {
      // Zaten loglanan hataları tekrar loglama
      if (
        !(
          error instanceof NotFoundException ||
          error instanceof ForbiddenException
        )
      ) {
        this.logger.logError(error, 'QuizzesService.findOne', {
          quizId: id,
          userId,
          additionalInfo: 'Sınav getirilirken hata oluştu',
        });
      }
      throw error;
    }
  }

  /**
   * Find quizzes for a specific course
   */
  @LogMethod({ trackParams: true })
  async findAllByCourse(courseId: string, userId: string) {
    try {
      this.flowTracker.trackStep(
        `${courseId} ID'li derse ait sınavlar getiriliyor`,
        'QuizzesService',
      );

      // Check if course exists and belongs to user
      await this.validateCourseOwnership(courseId, userId);

      const snapshot = await this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.QUIZZES)
        .where('courseId', '==', courseId)
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .get();

      const quizzes = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.logger.info(
        `${courseId} ID'li derse ait ${quizzes.length} adet sınav getirildi`,
        'QuizzesService.findAllByCourse',
        __filename,
        148,
        { courseId, userId, quizzesCount: quizzes.length },
      );

      return quizzes;
    } catch (error) {
      this.logger.logError(error, 'QuizzesService.findAllByCourse', {
        courseId,
        userId,
        additionalInfo: 'Derse ait sınavlar getirilirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Generate a new quiz using AI
   */
  async generateQuiz(dto: GenerateQuizDto, userId: string) {
    // Log sınav oluşturma sürecinin başlangıcı
    this.logger.logExamProcess(
      `Sınav oluşturma başladı. Kullanıcı: ${userId}, Quiz Türü: ${dto.quizType}`,
      {
        userId,
        quizType: dto.quizType,
        documentId: dto.sourceDocument?.documentId,
        hasFile: !!dto.sourceDocument?.fileName,
        selectedSubTopics: dto.selectedSubTopics?.length || 0,
      },
    );

    // Validate course ownership if a course ID is provided
    if (dto.courseId) {
      await this.validateCourseOwnership(dto.courseId, userId);
      this.logger.logExamProcess(`Kurs sahipliği doğrulandı: ${dto.courseId}`);
    }

    // Set up generation options
    const generationOptions = {
      quizType: dto.quizType,
      courseId: dto.courseId,
      personalizedQuizType: dto.personalizedQuizType,
      difficulty: dto.preferences.difficulty || 'medium',
      questionCount: dto.preferences.questionCount || 5,
      prioritizeWeakAndMediumTopics:
        dto.preferences.prioritizeWeakAndMediumTopics !== false,
    };

    // Log aktif yapılandırma
    this.logger.logExamProcess(
      `Quiz oluşturma yapılandırması`,
      generationOptions,
    );

    // Get selected topics if not provided
    let selectedTopics = dto.selectedSubTopics || [];
    if (selectedTopics.length === 0) {
      this.logger.logExamProcess(
        `Seçili alt konu bulunamadı - otomatik konu oluşturma kontrolü yapılıyor`,
      );

      // Eğer belge var ama konu seçilmemişse otomatik oluştur
      if (dto.sourceDocument) {
        // Dosya adından bir belge ID oluştur veya storage path'i kullan
        const fileIdentifier =
          dto.sourceDocument.fileName ||
          (dto.sourceDocument.storagePath
            ? dto.sourceDocument.storagePath.split('/').pop()
            : 'belge');

        this.logger.logExamProcess(
          `Belge bilgisi bulundu, varsayılan konu oluşturuluyor: ${fileIdentifier}`,
        );

        // Varsayılan alt konu oluştur
        const defaultTopicName = 'Belge İçeriği';
        const documentIdentifier = fileIdentifier
          ? fileIdentifier.replace(/\.[^/.]+$/, '')
          : 'belge'; // Dosya uzantısını kaldır
        const defaultSubTopic = {
          subTopic: defaultTopicName,
          normalizedSubTopic: `belge-${documentIdentifier.substring(0, 8)}`,
        };

        this.logger.logExamProcess(
          `Varsayılan alt konu oluşturuldu`,
          defaultSubTopic,
        );
        selectedTopics = [defaultSubTopic];
      } else {
        this.logger.logExamProcess(
          `Belge bilgisi ve seçili konu bulunamadı - hata fırlatılıyor`,
        );
        throw new BadRequestException('En az bir alt konu seçilmelidir');
      }
    } else {
      this.logger.logExamProcess(
        `Seçili alt konular (${selectedTopics.length})`,
        selectedTopics,
      );
    }

    // For personalized quizzes, get topics based on the personalization type
    if (dto.quizType === 'personalized' && dto.courseId) {
      if (!dto.personalizedQuizType) {
        throw new BadRequestException(
          'Kişiselleştirilmiş sınav tipi belirtilmelidir',
        );
      }

      // Get appropriate topics based on the personalization type
      if (dto.personalizedQuizType === 'weakTopicFocused') {
        const weakTopics = await this.firebaseService.firestore
          .collection('learningTargets')
          .where('courseId', '==', dto.courseId)
          .where('userId', '==', userId)
          .where('status', 'array-contains', 'failed')
          .where('status', 'array-contains', 'medium')
          .select('subTopicName', 'normalizedSubTopicName', 'status')
          .get()
          .then((snapshot) =>
            snapshot.docs.map((doc) => ({
              subTopicName: doc.data().subTopicName,
              normalizedSubTopicName: doc.data().normalizedSubTopicName,
              status: doc.data().status,
            })),
          );

        if (weakTopics.length === 0) {
          throw new BadRequestException(
            'Zayıf konu bulunamadı. Lütfen başka bir sınav tipi seçin.',
          );
        }

        // PRD 4.6.1: Zayıf/Orta Odaklı sınav için, duruma göre sonuçları sırala
        // Önce 'failed', sonra 'medium' durumundaki konular
        selectedTopics = weakTopics
          .sort((a, b) => {
            // 'failed' durumunda olanları başa yerleştir
            if (a.status === 'failed' && b.status !== 'failed') return -1;
            if (a.status !== 'failed' && b.status === 'failed') return 1;
            return 0;
          })
          .map((t) => ({
            subTopic: t.subTopicName,
            normalizedSubTopic: t.normalizedSubTopicName,
            status: t.status,
          }));
      } else if (dto.personalizedQuizType === 'newTopicFocused') {
        // First, get ALL existing topics for this course (not just pending ones)
        const existingTopics = await this.firebaseService.firestore
          .collection('learningTargets')
          .where('courseId', '==', dto.courseId)
          .where('userId', '==', userId)
          .select('subTopicName', 'normalizedSubTopicName', 'status')
          .get()
          .then((snapshot) =>
            snapshot.docs.map((doc) => ({
              subTopicName: doc.data().subTopicName,
              normalizedSubTopicName: doc.data().normalizedSubTopicName,
              status: doc.data().status,
            })),
          );

        this.logger.logExamProcess(
          `newTopicFocused: ${existingTopics.length} mevcut konu bulundu`,
          {
            courseId: dto.courseId,
            existingTopicsCount: existingTopics.length,
            existingTopics: existingTopics.map((t) => t.subTopicName),
          },
        );

        // Check if document is provided for new topic detection
        if (!dto.sourceDocument || !dto.sourceDocument.text) {
          throw new BadRequestException(
            'Yeni konu tespit etmek için bir belge yüklemeniz gerekiyor.',
          );
        }

        this.logger.logExamProcess(
          'newTopicFocused: Belgeden mevcut konular dışında yeni konular tespit ediliyor',
          {
            courseId: dto.courseId,
            documentTextLength: dto.sourceDocument.text.length,
            existingTopicsForAI: existingTopics.map((t) => t.subTopicName),
          },
        );

        try {
          // Pass existing topics to AI so it can detect NEW topics that are NOT in the existing list
          const existingTopicNames = existingTopics.map((t) => t.subTopicName);
          const topicsResult = await this.aiService.detectTopics(
            dto.sourceDocument.text,
            existingTopicNames, // Pass existing topics to AI
            `newTopicFocused_${dto.courseId}_${Date.now()}`,
          );

          if (topicsResult.topics && topicsResult.topics.length > 0) {
            // Filter out any topics that already exist (double-check)
            const newTopics = topicsResult.topics.filter((detectedTopic) => {
              const isDuplicate = existingTopics.some(
                (existingTopic) =>
                  existingTopic.normalizedSubTopicName ===
                    detectedTopic.normalizedSubTopicName ||
                  existingTopic.subTopicName.toLowerCase() ===
                    detectedTopic.subTopicName.toLowerCase(),
              );
              return !isDuplicate;
            });

            if (newTopics.length === 0) {
              throw new BadRequestException(
                'Bu belgede var olan konular dışında yeni konu tespit edilemedi. Farklı içerikli bir belge yüklemeyi deneyin.',
              );
            }

            selectedTopics = newTopics.map((topic) => ({
              subTopic: topic.subTopicName,
              normalizedSubTopic: topic.normalizedSubTopicName,
              status: 'pending', // Mark as pending since these are new topics
            }));

            this.logger.logExamProcess(
              `newTopicFocused: Belgeden ${selectedTopics.length} YENİ konu tespit edildi`,
              {
                detectedNewTopics: selectedTopics.map((t) => t.subTopic),
                filteredOutExisting:
                  topicsResult.topics.length - newTopics.length,
              },
            );
          } else {
            throw new BadRequestException(
              'Belgeden konu tespit edilemedi. Lütfen daha içerik açısından zengin bir belge yükleyin.',
            );
          }
        } catch (topicDetectionError) {
          this.logger.logError(
            topicDetectionError,
            'QuizzesService.generateQuiz - newTopicFocused topic detection',
            {
              courseId: dto.courseId,
              userId,
              documentTextLength: dto.sourceDocument.text.length,
              existingTopicsCount: existingTopics.length,
            },
          );
          throw new BadRequestException(
            'Belgeden konu tespit edilirken hata oluştu. Lütfen tekrar deneyin.',
          );
        }
      } else if (dto.personalizedQuizType === 'comprehensive') {
        // Get a mix of all topics in the course
        const allTopics = await this.firebaseService.firestore
          .collection('learningTargets')
          .where('courseId', '==', dto.courseId)
          .where('userId', '==', userId)
          .select('subTopicName', 'normalizedSubTopicName', 'status')
          .get()
          .then((snapshot) =>
            snapshot.docs.map((doc) => ({
              subTopicName: doc.data().subTopicName,
              normalizedSubTopicName: doc.data().normalizedSubTopicName,
              status: doc.data().status,
            })),
          );

        if (allTopics.length === 0) {
          throw new BadRequestException('Kurs için konu bulunamadı');
        }

        // PRD 4.6.1 & 4.6.2: Kapsamlı sınavda zayıf ve orta konulara öncelik verme
        if (dto.preferences.prioritizeWeakAndMediumTopics) {
          // Group topics by status
          const grouped = {
            failed: allTopics.filter((t) => t.status === 'failed'),
            medium: allTopics.filter((t) => t.status === 'medium'),
            pending: allTopics.filter((t) => t.status === 'pending'),
            mastered: allTopics.filter((t) => t.status === 'mastered'),
          };

          // Calculate proportional distribution (PRD 4.6.2: %60 ağırlık)
          // Zayıf ve orta konulara toplam %60 ağırlık verilir
          const totalQuestions = dto.preferences.questionCount || 10;

          // PRD ile uyumlu, zayıf/orta konular için toplam %60 ağırlık
          const weakMediumWeight = 0.6;
          const otherWeight = 0.4;

          // Proportional distribution with prioritization
          const distribution = {
            failed: Math.round(totalQuestions * (weakMediumWeight * 0.6)), // %60'ın %60'ı = %36
            medium: Math.round(totalQuestions * (weakMediumWeight * 0.4)), // %60'ın %40'ı = %24
            pending: Math.round(totalQuestions * (otherWeight * 0.6)), // %40'ın %60'ı = %24
            mastered: Math.round(totalQuestions * (otherWeight * 0.4)), // %40'ın %40'ı = %16
          };

          // Ensure total adds up to requested count
          let currentTotal = Object.values(distribution).reduce(
            (a, b) => a + b,
            0,
          );

          // Konu dağılımı için değişkenler
          let initialAssignedQuestions = 0;
          // Create empty array for initial topic counts
          const initialTopicsArray = [];

          while (
            initialAssignedQuestions < totalQuestions &&
            initialTopicsArray.length > 0
          ) {
            // Add remaining to strongest priority that has topics
            if (grouped.failed.length > 0) {
              distribution.failed += 1;
            } else if (grouped.medium.length > 0) {
              distribution.medium += 1;
            } else if (grouped.pending.length > 0) {
              distribution.pending += 1;
            } else if (grouped.mastered.length > 0) {
              distribution.mastered += 1;
            } else {
              break; // No topics at all (shouldn't happen due to earlier check)
            }
            currentTotal += 1;
          }

          // Adjust if we don't have enough topics in a category
          if (grouped.failed.length === 0) {
            distribution.medium += distribution.failed;
            distribution.failed = 0;
          } else if (grouped.failed.length < distribution.failed) {
            distribution.medium += distribution.failed - grouped.failed.length;
            distribution.failed = grouped.failed.length;
          }

          if (grouped.medium.length === 0) {
            distribution.pending += distribution.medium;
            distribution.medium = 0;
          } else if (grouped.medium.length < distribution.medium) {
            distribution.pending += distribution.medium - grouped.medium.length;
            distribution.medium = grouped.medium.length;
          }

          if (grouped.pending.length === 0) {
            distribution.mastered += distribution.pending;
            distribution.pending = 0;
          } else if (grouped.pending.length < distribution.pending) {
            distribution.mastered +=
              distribution.pending - grouped.pending.length;
            distribution.pending = grouped.pending.length;
          }

          if (grouped.mastered.length < distribution.mastered) {
            distribution.mastered = grouped.mastered.length;
          }

          // Helper function to select random topics up to the required count
          const selectRandomTopics = (topics, count) => {
            if (count <= 0) return [];
            const shuffled = [...topics].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, Math.min(topics.length, count));
          };

          // Build the selected topics list with counts for AI
          const topicsWithCounts: TopicDto[] = [];

          // Add topics from each category with explicit count and status
          Object.entries(grouped).forEach(([status, topics]) => {
            if (topics.length > 0 && distribution[status] > 0) {
              const selectedForCategory = selectRandomTopics(
                topics,
                distribution[status],
              );

              // Her konu için tam olarak kaç soru üretileceğini belirt
              topicsWithCounts.push(
                ...selectedForCategory.map((t) => ({
                  subTopic: t.subTopicName,
                  normalizedSubTopic: t.normalizedSubTopicName,
                  count: 1, // Default 1 soru
                  status,
                })),
              );
            }
          });

          // Ensure distribution matches exactly the required count
          let finalAssignedQuestions = topicsWithCounts.reduce(
            (sum, topic) => sum + (topic.count ?? 0),
            0,
          );

          // Eksik sorular varsa, zayıf konulara ekleme yap
          let index = 0;
          while (
            finalAssignedQuestions < totalQuestions &&
            topicsWithCounts.length > 0
          ) {
            const statusPriority = ['failed', 'medium', 'pending', 'mastered'];
            for (const priorityStatus of statusPriority) {
              const eligibleTopics = topicsWithCounts.filter(
                (t) => t.status === priorityStatus,
              );
              if (eligibleTopics.length > 0) {
                const targetIndex = index % eligibleTopics.length;
                const targetTopic = eligibleTopics[targetIndex];
                const topicIndex = topicsWithCounts.findIndex(
                  (t) =>
                    t.normalizedSubTopic === targetTopic.normalizedSubTopic,
                );

                if (topicIndex !== -1) {
                  topicsWithCounts[topicIndex].count =
                    (topicsWithCounts[topicIndex].count ?? 0) + 1;
                  finalAssignedQuestions += 1;
                  index += 1;
                  break;
                }
              }
            }
            if (finalAssignedQuestions === totalQuestions) break;
          }

          // Pass this enhanced array to AI service
          selectedTopics = topicsWithCounts;

          this.logger.info(
            `Topic distribution for comprehensive quiz: ${JSON.stringify(distribution)}`,
            'QuizzesService.generateQuiz',
            __filename,
            461,
            { distribution },
          );
          this.logger.info(
            `Selected topics with counts: ${JSON.stringify(
              selectedTopics.map((t) => ({
                subTopic: t.subTopic,
                count: t.count,
                status: t.status,
              })),
            )}`,
            'QuizzesService.generateQuiz',
            __filename,
            473,
            {
              selectedTopics: JSON.stringify(
                selectedTopics.map((t) => ({
                  subTopic: t.subTopic,
                  count: t.count,
                  status: t.status,
                })),
              ),
            },
          );
        } else {
          // Without prioritization, just select random topics
          const shuffled = [...allTopics].sort(() => 0.5 - Math.random());
          const maxTopics = Math.min(
            allTopics.length,
            Math.min(10, dto.preferences.questionCount || 10),
          );

          selectedTopics = shuffled.slice(0, maxTopics).map((t) => ({
            subTopic: t.subTopicName,
            normalizedSubTopic: t.normalizedSubTopicName,
            status: t.status,
            // Her konu için yaklaşık eşit soru sayısı belirle
            count: Math.max(
              1,
              Math.floor((dto.preferences.questionCount || 10) / maxTopics),
            ),
          }));

          // Kalan soruları dağıt
          let assignedQuestions = selectedTopics.reduce(
            (sum, topic) => sum + (topic.count ?? 0),
            0,
          );
          let index = 0;
          while (
            assignedQuestions < (dto.preferences.questionCount || 10) &&
            selectedTopics.length > 0
          ) {
            if (selectedTopics.length > 0) {
              selectedTopics[index % selectedTopics.length].count =
                (selectedTopics[index % selectedTopics.length].count ?? 0) + 1;
              assignedQuestions += 1;
              index += 1;
            }
          }
        }
      }
    }

    // Normalize subTopics for AI service
    const normalizedSubTopics = selectedTopics
      .map((t) => (typeof t === 'string' ? t : t.normalizedSubTopic))
      .filter(Boolean) as string[];

    // Sınav oluşturma için AI servisine istek
    this.logger.logExamProcess(`OpenAI soru üretici servisi çağrılıyor`, {
      subTopics: normalizedSubTopics,
      documentId: dto.sourceDocument?.documentId,
      questionCount: generationOptions.questionCount,
      difficulty: generationOptions.difficulty,
    });

    // Call AI service to generate questions
    const questions = await this.aiService.generateQuizQuestions({
      ...generationOptions,
      subTopics: normalizedSubTopics,
    });

    // Sorular üretildikten sonra
    this.logger.logExamProcess(
      `Sorular başarıyla üretildi. Soru sayısı: ${questions.length}`,
    );

    // Create a new quiz object
    const newQuiz = await this.saveQuiz({
      userId,
      quizType: dto.quizType,
      personalizedQuizType: dto.personalizedQuizType,
      courseId: dto.courseId,
      sourceDocument: dto.sourceDocument,
      selectedSubTopics: selectedTopics as TopicDto[],
      preferences: dto.preferences,
      questions,
    });

    // Quiz veritabanına kaydedildikten sonra
    this.logger.logExamProcess(
      `Quiz veritabanına kaydedildi. Quiz ID: ${newQuiz.id}`,
    );

    // newTopicFocused türü için tespit edilen yeni konuları öğrenme hedefi olarak kaydet
    if (
      dto.personalizedQuizType === 'newTopicFocused' &&
      selectedTopics &&
      selectedTopics.length > 0 &&
      dto.courseId
    ) {
      try {
        await this.saveDetectedSubTopicsAsLearningTargets(
          dto.courseId,
          userId,
          selectedTopics,
          dto.personalizedQuizType,
        );
        this.logger.logExamProcess(
          `newTopicFocused türü için ${selectedTopics.length} yeni konu öğrenme hedefi olarak kaydedildi`,
        );
      } catch (error) {
        this.logger.error(
          'Yeni konuları öğrenme hedefi olarak kaydetme hatası:',
          error,
        );
        // Quiz oluşturma başarılı oldu, sadece logging yapıyoruz
      }
    }

    return newQuiz;
  }

  /**
   * Submit answers for a quiz, save to Firestore, and return results.
   */
  async submitQuiz(
    dto: SubmitQuizDto,
    userId: string,
  ): Promise<{ quiz: Quiz; analysis: AnalysisResult }> {
    // Debug logging helper
    const submitDebugLog = (message: string, data?: any) => {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [SUBMIT_QUIZ_DEBUG] ${message}${data ? '\nDATA: ' + JSON.stringify(data, null, 2) : ''}\n`;
      require('fs').appendFileSync(
        'C:\\Users\\Ahmet haman\\OneDrive\\Desktop\\Bitirme\\backend\\logs\\kayit.log',
        logEntry,
      );
    };

    submitDebugLog('=== SUBMIT QUIZ START ===', {
      userId,
      quizId: dto.quizId,
      quizType: dto.quizType,
      courseId: dto.courseId,
      questionsCount: dto.questions?.length || 0,
      userAnswersKeys: Object.keys(dto.userAnswers || {}),
      originalUserAnswers: dto.userAnswers,
    });

    // Transform userAnswers to ensure they are strings for analysis and Firestore compatibility
    // Frontend sends objects like {id: "option_1", text: "Answer text"}, we need just the text
    submitDebugLog('🔄 TRANSFORMING USER ANSWERS');
    const transformedUserAnswers: Record<string, string> = {};
    for (const [questionId, answer] of Object.entries(dto.userAnswers)) {
      submitDebugLog(`🔍 PROCESSING ANSWER FOR QUESTION: ${questionId}`, {
        questionId,
        originalAnswer: answer,
        answerType: typeof answer,
      });

      if (typeof answer === 'string') {
        transformedUserAnswers[questionId] = answer;
        submitDebugLog(`✅ STRING ANSWER: ${answer}`);
      } else if (answer && typeof answer === 'object' && 'text' in answer) {
        const textValue = String((answer as any).text);
        transformedUserAnswers[questionId] = textValue;
        submitDebugLog(`✅ OBJECT ANSWER CONVERTED: ${textValue}`, {
          originalObject: answer,
        });
      } else {
        const stringValue = String(answer || '');
        transformedUserAnswers[questionId] = stringValue;
        submitDebugLog(`⚠️ FALLBACK CONVERSION: ${stringValue}`, {
          originalValue: answer,
        });
      }
    }

    submitDebugLog('📊 TRANSFORMATION COMPLETE', {
      originalCount: Object.keys(dto.userAnswers).length,
      transformedCount: Object.keys(transformedUserAnswers).length,
      transformedUserAnswers,
    });

    // Analyze quiz results using transformed string answers
    const analysisResult = this.quizAnalysisService.analyzeQuizResults(
      dto.questions,
      transformedUserAnswers,
    );

    // Access the analysis properties correctly from the result's analysisResult property
    const analysis: AnalysisResult = {
      overallScore: analysisResult.analysisResult.overallScore,
      performanceBySubTopic:
        analysisResult.analysisResult.performanceBySubTopic,
      performanceCategorization:
        analysisResult.analysisResult.performanceCategorization,
      performanceByDifficulty:
        analysisResult.analysisResult.performanceByDifficulty,
      recommendations: analysisResult.analysisResult.recommendations || null,
    };

    // Calculate quiz complexity for metadata
    const complexityData = this.calculateQuizComplexity(dto.questions);

    // Generate improvement suggestions
    if (!analysis.recommendations) {
      analysis.recommendations = this.generateImprovementSuggestions(analysis);
    }

    // Create a Firestore-safe version of the data by deeply transforming nested objects
    const firestore_safe_questions = dto.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: Array.isArray(q.options)
        ? q.options.map((opt) =>
            typeof opt === 'string'
              ? opt
              : opt && typeof opt === 'object' && 'text' in opt
                ? String((opt as any).text)
                : String(opt || ''),
          )
        : [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      subTopic: q.subTopic || '',
      normalizedSubTopic: q.normalizedSubTopic || '',
      difficulty: q.difficulty || 'medium',
    }));

    const firestore_safe_selectedSubTopics = Array.isArray(
      dto.selectedSubTopics,
    )
      ? dto.selectedSubTopics.map((st) =>
          typeof st === 'string'
            ? st
            : st && typeof st === 'object'
              ? {
                  subTopic: String((st as any).subTopic || ''),
                  normalizedSubTopic: String(
                    (st as any).normalizedSubTopic || '',
                  ),
                  selected: Boolean((st as any).selected),
                }
              : String(st || ''),
        )
      : [];

    const firestore_safe_preferences = dto.preferences
      ? {
          questionCount: Number(dto.preferences.questionCount || 10),
          difficulty: String(dto.preferences.difficulty || 'medium'),
          timeLimit: dto.preferences.timeLimit
            ? Number(dto.preferences.timeLimit)
            : null,
          prioritizeWeakAndMediumTopics: dto.preferences
            .prioritizeWeakAndMediumTopics
            ? Boolean(dto.preferences.prioritizeWeakAndMediumTopics)
            : null,
        }
      : null;

    const firestore_safe_sourceDocument = dto.sourceDocument
      ? {
          fileName: String(dto.sourceDocument.fileName || ''),
          storagePath: String(dto.sourceDocument.storagePath || ''),
          documentId: dto.sourceDocument.documentId || null,
        }
      : null;

    // Transform complexityData to be Firestore-safe
    const firestore_safe_complexityData = complexityData
      ? {
          difficultyDistribution: complexityData.difficultyDistribution
            ? this.firebaseService.toPlainObject(
                complexityData.difficultyDistribution,
              )
            : null,
          averageComplexity: complexityData.averageComplexity
            ? Number(complexityData.averageComplexity)
            : null,
          complexityLevel: complexityData.complexityLevel
            ? String(complexityData.complexityLevel)
            : null,
        }
      : null;

    const quizDataToSave = {
      userId,
      quizType: String(dto.quizType),
      personalizedQuizType: dto.personalizedQuizType
        ? String(dto.personalizedQuizType)
        : null,
      courseId: dto.courseId ? String(dto.courseId) : null,
      sourceDocument: firestore_safe_sourceDocument,
      selectedSubTopics: firestore_safe_selectedSubTopics,
      preferences: firestore_safe_preferences,
      questions: firestore_safe_questions,
      userAnswers: transformedUserAnswers, // Use transformed string-only userAnswers
      score: Number(analysis.overallScore),
      correctCount: Number(
        (analysisResult as any).correctCount ||
          (analysisResult as any).totalCorrect ||
          0,
      ),
      totalQuestions: Number(
        (analysisResult as any).totalQuestions || dto.questions.length,
      ),
      elapsedTime: dto.elapsedTime ? Number(dto.elapsedTime) : 0,
      analysisResult: this.firebaseService.toPlainObject(analysis), // Use utility for analysis object
      timestamp: new Date(),
      complexityData: firestore_safe_complexityData, // Use Firestore-safe complexity data
    };

    // TRANSACTION-BASED SUBMİT: Veri tutarlılığı için transaction kullan
    let savedQuizId: string;

    try {
      // Firestore transaction içinde quiz operations yap
      savedQuizId = await this.firebaseService.firestore.runTransaction(
        async (transaction) => {
          // 1. Quiz verisini Firestore'dan al (eğer quiz ID varsa)
          let existingQuiz: any = null;
          if (dto.quizId) {
            this.logger.info(
              `Transaction içinde mevcut quiz alınıyor: ${dto.quizId}`,
              'QuizzesService.submitQuiz',
              __filename,
              undefined,
              { quizId: dto.quizId, userId: userId },
            );

            const quizRef = this.firebaseService.firestore
              .collection(FIRESTORE_COLLECTIONS.QUIZZES)
              .doc(dto.quizId);

            const quizDoc = await transaction.get(quizRef);

            if (quizDoc.exists) {
              existingQuiz = quizDoc.data() as any;
              this.logger.info(
                `Mevcut quiz bulundu ve güncellenecek: ${dto.quizId}`,
                'QuizzesService.submitQuiz',
                __filename,
                undefined,
                {
                  quizId: dto.quizId,
                  existingQuizType: existingQuiz?.quizType,
                },
              );

              // Mevcut quiz'i güncelleyerek submit verisini ekle
              transaction.update(quizRef, {
                ...quizDataToSave,
                timestamp: new Date(), // Submit zamanını güncelle
                score: Number(analysis.overallScore),
                correctCount: Number((analysisResult as any).correctCount || 0),
                elapsedTime: dto.elapsedTime ? Number(dto.elapsedTime) : 0,
                userAnswers: transformedUserAnswers,
                analysisResult: this.firebaseService.toPlainObject(analysis),
              });

              return dto.quizId;
            } else {
              this.logger.warn(
                `Quiz ID sağlandı ancak bulunamadı: ${dto.quizId}, yeni quiz oluşturuluyor`,
                'QuizzesService.submitQuiz',
                __filename,
                undefined,
                { quizId: dto.quizId, userId: userId },
              );
            }
          }

          // 2. Yeni quiz oluştur (ID yoksa veya bulunamazsa)
          const newQuizRef = this.firebaseService.firestore
            .collection(FIRESTORE_COLLECTIONS.QUIZZES)
            .doc(); // Yeni ID oluştur

          transaction.set(newQuizRef, quizDataToSave);
          this.logger.info(
            `Transaction içinde yeni quiz oluşturuldu: ${newQuizRef.id}`,
            'QuizzesService.submitQuiz',
            __filename,
            undefined,
            {
              newQuizId: newQuizRef.id,
              userId: userId,
              quizType: dto.quizType,
            },
          );

          return newQuizRef.id;
        },
      );

      this.logger.info(
        `Quiz transaction başarıyla tamamlandı: ${savedQuizId}`,
        'QuizzesService.submitQuiz',
        __filename,
        undefined,
        { quizId: savedQuizId, userId: userId },
      );
    } catch (transactionError) {
      this.logger.error(
        `Quiz transaction hatası: ${transactionError instanceof Error ? transactionError.message : String(transactionError)}`,
        'QuizzesService.submitQuiz',
        __filename,
        undefined,
        transactionError instanceof Error
          ? transactionError
          : new Error(String(transactionError)),
        { userId: userId, quizType: dto.quizType },
      );
      throw new Error(
        `Quiz submission transaction failed: ${transactionError instanceof Error ? transactionError.message : String(transactionError)}`,
      );
    }

    // 3. Quiz submission'ı ayrı subcollection'a kaydet
    try {
      // Validate userId is not undefined
      if (!userId) {
        throw new Error('userId is required for quiz submission');
      }

      const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const submissionData = {
        submissionId,
        userId: String(userId),
        quizId: savedQuizId,
        userAnswers: transformedUserAnswers,
        score: Number(analysis.overallScore),
        correctCount: Number((analysisResult as any).correctCount || 0),
        totalQuestions: dto.questions.length,
        elapsedTime: dto.elapsedTime ? Number(dto.elapsedTime) : 0,
        submissionTimestamp: new Date(),
        analysisResult: this.firebaseService.toPlainObject(analysis),
      };

      // Quiz'in submission subcollection'ına kaydet
      await this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.QUIZZES)
        .doc(savedQuizId)
        .collection('submissions')
        .doc(submissionId)
        .set(submissionData);

      // User'ın quiz submissions koleksiyonuna özet kaydet
      await this.firebaseService.firestore
        .collection('users')
        .doc(userId)
        .collection('quizSubmissions')
        .doc(submissionId)
        .set({
          submissionId,
          quizId: savedQuizId,
          quizType: dto.quizType,
          score: Number(analysis.overallScore),
          submissionTimestamp: new Date(),
          courseId: dto.courseId || null,
        });

      this.logger.info(
        `Quiz submission subcollections başarıyla oluşturuldu`,
        'QuizzesService.submitQuiz',
        __filename,
        undefined,
        {
          quizId: savedQuizId,
          submissionId,
          userId: userId,
          score: analysis.overallScore,
        },
      );
    } catch (subcollectionError) {
      this.logger.error(
        `Submission subcollection kaydetme hatası: ${subcollectionError instanceof Error ? subcollectionError.message : String(subcollectionError)}`,
        'QuizzesService.submitQuiz',
        __filename,
        undefined,
        subcollectionError instanceof Error
          ? subcollectionError
          : new Error(String(subcollectionError)),
        { quizId: savedQuizId, userId: userId },
      );
      // Subcollection hatası ana işlemi durdurmuyor ama log et
    }

    // Debug logging helper for quiz submission
    const failedQuestionsDebugLog = (message: string, data?: any) => {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [QUIZ_SUBMISSION_DEBUG] ${message}${data ? '\nDATA: ' + JSON.stringify(data, null, 2) : ''}\n`;
      require('fs').appendFileSync(
        'C:\\Users\\Ahmet haman\\OneDrive\\Desktop\\Bitirme\\backend\\logs\\kayit.log',
        logEntry,
      );
    };

    failedQuestionsDebugLog(
      '=== QUIZ SUBMISSION - FAILED QUESTIONS PROCESSING START ===',
      {
        savedQuizId,
        userId,
        courseId: dto.courseId,
        totalQuestions: dto.questions.length,
        transformedUserAnswersKeys: Object.keys(transformedUserAnswers),
      },
    );

    // Save failed questions if there are any
    failedQuestionsDebugLog('🔍 FILTERING FAILED QUESTIONS');

    const failedQuestions = dto.questions.filter((q, index) => {
      const userAnswer = transformedUserAnswers[q.id];
      const isIncorrect = userAnswer !== q.correctAnswer;

      failedQuestionsDebugLog(`📝 QUESTION ${index + 1} ANALYSIS`, {
        questionIndex: index,
        questionId: q.id,
        questionText: q.questionText?.substring(0, 50) + '...',
        userAnswer,
        correctAnswer: q.correctAnswer,
        isIncorrect,
        fullQuestion: q,
      });

      return isIncorrect;
    });

    failedQuestionsDebugLog('📊 FAILED QUESTIONS FILTER RESULTS', {
      totalQuestions: dto.questions.length,
      failedQuestionsCount: failedQuestions.length,
      failedQuestionIds: failedQuestions.map((q) => q.id),
      failedQuestions: failedQuestions.map((q) => ({
        id: q.id,
        questionText: q.questionText?.substring(0, 50) + '...',
        userAnswer: transformedUserAnswers[q.id],
        correctAnswer: q.correctAnswer,
      })),
    });

    if (failedQuestions.length > 0) {
      failedQuestionsDebugLog('🚀 CALLING saveFailedQuestions METHOD', {
        savedQuizId,
        userId,
        courseId: dto.courseId || null,
        failedQuestionsCount: failedQuestions.length,
      });

      try {
        await this.saveFailedQuestions(
          savedQuizId,
          userId,
          dto.courseId || null,
          failedQuestions,
          transformedUserAnswers,
        );
        failedQuestionsDebugLog(
          '✅ saveFailedQuestions COMPLETED SUCCESSFULLY',
        );
      } catch (saveFailedError) {
        failedQuestionsDebugLog('💥 saveFailedQuestions ERROR', {
          error: saveFailedError.message,
          stack: saveFailedError.stack,
          failedQuestions,
          transformedUserAnswers,
        });
        throw saveFailedError;
      }
    } else {
      failedQuestionsDebugLog('✅ NO FAILED QUESTIONS TO SAVE');
    }

    // Update learning targets status if this was a personalized quiz
    if (dto.quizType === 'personalized' && dto.courseId) {
      try {
        // Define interface for subtopic update
        interface SubtopicUpdate {
          subTopic: string;
          normalizedSubTopic: string;
        }

        // Normalize and validate selected subtopics
        const subTopicsToUpdate: SubtopicUpdate[] = [];
        const selectedSubTopics = Array.isArray(dto.selectedSubTopics)
          ? dto.selectedSubTopics
          : [];

        // Process each subtopic
        for (const item of selectedSubTopics) {
          try {
            if (!item || typeof item !== 'object') continue;

            // Handle TopicSelection object with proper type checking
            const topicItem = item as Record<string, any>;
            if ('subTopic' in topicItem && topicItem.subTopic) {
              const subTopic = String(topicItem.subTopic).trim();
              if (subTopic) {
                const normalizedSubTopic =
                  'normalizedSubTopic' in topicItem &&
                  topicItem.normalizedSubTopic
                    ? String(topicItem.normalizedSubTopic)
                    : this.normalizationService.normalizeSubTopicName(subTopic);

                subTopicsToUpdate.push({
                  subTopic,
                  normalizedSubTopic,
                });
              }
            }
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            this.logger.warn(
              `Error processing subtopic item: ${JSON.stringify(item)}`,
              'QuizzesService.submitQuiz',
              __filename,
              undefined,
              { error: errorMessage } as Record<string, unknown>,
            );
          }
        }

        this.logger.info(
          `${savedQuizId} ID'li sınav tamamlandı, öğrenme hedefleri güncelleniyor...`,
          'QuizzesService.submitQuiz',
          __filename,
          undefined,
          {
            quizId: savedQuizId,
            subtopicsCount: subTopicsToUpdate.length,
            courseId: dto.courseId,
          } as Record<string, unknown>,
        );

        // Log the subtopics that will be updated
        if (subTopicsToUpdate.length > 0) {
          this.logger.debug(
            `Processing ${subTopicsToUpdate.length} subtopics for learning targets update`,
            'QuizzesService.submitQuiz',
            __filename,
            undefined,
            {
              quizId: savedQuizId,
              courseId: dto.courseId,
              subtopics: subTopicsToUpdate.map((st) => st.subTopic),
            } as Record<string, unknown>,
          );

          subTopicsToUpdate.push({
            subTopic: 'genel konu',
            normalizedSubTopic:
              this.normalizationService.normalizeSubTopicName('genel konu'),
          });
          try {
            // Convert to the expected TopicDto format for updateLearningTargetsFromAnalysis
            const topicDtos = subTopicsToUpdate.map((topic) => ({
              subTopic: topic.subTopic,
              normalizedSubTopic: topic.normalizedSubTopic,
            }));

            if (dto.courseId) {
              await this.updateLearningTargetsFromAnalysis(
                analysis,
                dto.courseId,
                userId,
                topicDtos,
              );
            }

            this.logger.info(
              `Successfully updated learning targets for ${subTopicsToUpdate.length} subtopics`,
              'QuizzesService.submitQuiz',
              __filename,
              undefined,
              {
                quizId: savedQuizId,
                subtopicsCount: subTopicsToUpdate.length,
                courseId: dto.courseId,
              } as Record<string, unknown>,
            );
          } catch (error) {
            // Log the error but don't fail the entire operation
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            const errorStack = error instanceof Error ? error.stack : undefined;
            // Create a proper Error object for logging
            const errorToLog = new Error(
              `Failed to update learning targets: ${errorMessage}`,
            );
            if (errorStack) {
              errorToLog.stack = errorStack;
            }

            // Log the error with context
            this.logger.error(
              `Failed to update learning targets: ${errorToLog.message}`,
              'QuizzesService.submitQuiz',
              __filename, // filePath
              undefined, // lineNumber
              errorToLog, // error object
              {
                // additionalInfo
                quizId: savedQuizId,
                courseId: dto.courseId,
              },
            );
          }
        } else {
          this.logger.warn(
            'No valid subtopics found for learning targets update',
            'QuizzesService.submitQuiz',
            __filename,
            undefined,
            {
              quizId: savedQuizId,
              originalSubtopics: dto.selectedSubTopics,
              courseId: dto.courseId,
            } as Record<string, unknown>,
          );
        }
      } catch (error) {
        // Öğrenme hedefi güncelleme hatası sınavın tamamlanmasını engellemesin
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        console.error('[ERROR] Error updating learning targets:', error);
        this.logger.error(
          `Öğrenme hedefleri güncellenirken hata oluştu (Quiz ID: ${savedQuizId}): ${errorMessage}`,
          'QuizzesService.submitQuiz',
          __filename,
          undefined,
        );
        // Hatayı logluyoruz ama dışarı fırlatmıyoruz
      }
    }

    // Construct the Quiz object to return (matching the interface)
    const savedTimestamp = quizDataToSave.timestamp as Date;
    const returnedQuiz: Quiz = {
      id: savedQuizId,
      userId: quizDataToSave.userId,
      quizType: quizDataToSave.quizType,
      personalizedQuizType: quizDataToSave.personalizedQuizType || null,
      courseId: quizDataToSave.courseId, // This should now be compatible
      score: quizDataToSave.score,
      correctCount: quizDataToSave.correctCount,
      totalQuestions: quizDataToSave.totalQuestions,
      elapsedTime: quizDataToSave.elapsedTime || 0, // Varsayılan değer ekle
      userAnswers: quizDataToSave.userAnswers,
      timestamp: savedTimestamp,
      preferences: quizDataToSave.preferences,
      questions: quizDataToSave.questions,
      analysisResult: quizDataToSave.analysisResult,
      sourceDocument: quizDataToSave.sourceDocument,
      selectedSubTopics: quizDataToSave.selectedSubTopics as any,
    };

    return { quiz: returnedQuiz, analysis };
  }

  /**
   * Updates learning targets based on quiz analysis results
   * @param analysis Quiz analysis results
   * @param courseId Course ID
   * @param userId User ID
   * @param selectedSubTopics Selected subtopics for the quiz
   */
  private async updateLearningTargetsFromAnalysis(
    analysis: AnalysisResult,
    courseId: string,
    userId: string,
    selectedSubTopics?: TopicDto[],
  ): Promise<void> {
    const traceId = `LT-${Date.now()}`;
    const startTime = Date.now();

    // Log the start of the learning target update process
    this.logLearningTarget(
      LogLevel.INFO,
      `[${traceId}] Learning target update process started`,
      {
        traceId,
        courseId,
        userId,
        hasAnalysis: !!analysis,
        hasSelectedSubTopics:
          !!selectedSubTopics && selectedSubTopics.length > 0,
        timestamp: new Date().toISOString(),
      },
    );

    console.log(`[${traceId}] [START] updateLearningTargetsFromAnalysis`, {
      courseId,
      userId,
      hasAnalysis: !!analysis,
      selectedSubTopicsCount: selectedSubTopics?.length || 0,
      timestamp: new Date().toISOString(),
    });

    try {
      // Log the start of the operation
      this.logger.info(
        `[${traceId}] Updating learning targets for course ${courseId} based on quiz analysis...`,
        'QuizzesService.updateLearningTargetsFromAnalysis',
        __filename,
        undefined,
        {
          courseId,
          userId,
          hasPerformanceData: !!analysis?.performanceBySubTopic,
          selectedSubTopicsCount: selectedSubTopics?.length || 0,
        },
      );

      // Log to learning targets log file
      this.logLearningTarget(
        LogLevel.INFO,
        `Updating learning targets for course ${courseId} based on quiz analysis`,
        {
          traceId,
          courseId,
          userId,
          hasAnalysis: !!analysis,
          selectedSubTopicsCount: selectedSubTopics?.length || 0,
          timestamp: new Date().toISOString(),
        },
      );

      console.log(`[${traceId}] [VALIDATION] Validating parameters...`);
      // Parametre doğrulama
      if (!courseId || !userId) {
        throw new Error('Course ID ve User ID zorunludur');
      }

      // 1. First, create learning targets for all subtopics in the quiz (if they don't exist yet)
      let subTopics: string[] = [];

      // Log the raw selectedSubTopics for debugging
      console.log(
        `[${traceId}] [DEBUG] Raw selectedSubTopics:`,
        JSON.stringify(selectedSubTopics, null, 2),
      );
      this.logLearningTarget(
        LogLevel.DEBUG,
        `[${traceId}] Raw selectedSubTopics`,
        { selectedSubTopics, count: selectedSubTopics?.length || 0 },
      );

      // The selectedSubTopics parameter can come in different formats, let's convert them all to a string array
      if (selectedSubTopics && selectedSubTopics.length > 0) {
        console.log(
          `[${traceId}] [PROCESSING] Processing ${selectedSubTopics.length} selected subtopics...`,
        );
        this.logLearningTarget(
          LogLevel.INFO,
          `[${traceId}] Processing selected subtopics`,
          { count: selectedSubTopics.length },
        );
        try {
          // Debug için log ekle
          console.log(
            '[DEBUG] Selected Subtopics:',
            JSON.stringify(selectedSubTopics, null, 2),
          );

          if (typeof selectedSubTopics[0] === 'string') {
            // Eğer zaten string dizisiyse
            // Convert TopicDto[] to string[] by extracting subTopic property
            subTopics = selectedSubTopics
              .map((topic) =>
                typeof topic === 'object' &&
                topic !== null &&
                'subTopic' in topic
                  ? topic.subTopic
                  : null,
              )
              .filter((topic): topic is string => typeof topic === 'string');
          } else if (
            typeof selectedSubTopics[0] === 'object' &&
            'subTopic' in selectedSubTopics[0]
          ) {
            // Eğer TopicDto dizisiyse
            subTopics = (selectedSubTopics as TopicDto[])
              .map((topic) => topic?.subTopic)
              .filter(Boolean) as string[];
          }

          if (subTopics.length > 0) {
            this.logger.info(
              `[${traceId}] Creating learning targets for ${subTopics.length} subtopics`,
              'QuizzesService.updateLearningTargetsFromAnalysis',
              __filename,
              undefined,
              { courseId, userId, subTopicCount: subTopics.length, subTopics },
            );

            // Log to learning targets file
            this.logLearningTarget(
              LogLevel.INFO,
              `Creating learning targets for ${subTopics.length} subtopics`,
              {
                courseId,
                userId,
                traceId,
                subTopicCount: subTopics.length,
                subTopics,
              },
            );

            // Process each subtopic
            const topicsForLearningTargets = subTopics
              .filter((topic) => {
                const isValid = topic && typeof topic === 'string';
                if (!isValid) {
                  console.warn(
                    `[${traceId}] [WARN] Invalid topic filtered out:`,
                    topic,
                  );
                  this.logLearningTarget(
                    LogLevel.WARN,
                    `[${traceId}] Invalid topic filtered out`,
                    { topic, type: typeof topic },
                  );
                }
                return isValid;
              })
              .map((topic) => ({
                subTopicName: topic,
                normalizedSubTopicName:
                  this.normalizationService.normalizeSubTopicName(topic),
              }));

            console.log(
              `[${traceId}] [DEBUG] Topics for Learning Targets:`,
              JSON.stringify(topicsForLearningTargets, null, 2),
            );
            this.logLearningTarget(
              LogLevel.DEBUG,
              `[${traceId}] Topics for Learning Targets`,
              {
                count: topicsForLearningTargets.length,
                topics: topicsForLearningTargets,
              },
            );

            if (topicsForLearningTargets.length === 0) {
              console.warn(
                `[${traceId}] [WARN] No valid topics after filtering and normalization`,
              );
              this.logLearningTarget(
                LogLevel.WARN,
                `[${traceId}] No valid topics after filtering and normalization`,
                { originalCount: subTopics.length },
              );
              return; // Exit early if no valid topics
            }

            try {
              // Create learning targets (updates existing ones, only creates new ones if they don't exist)
              console.log(
                `[${traceId}] [CREATE_BATCH] Creating batch for ${topicsForLearningTargets.length} learning targets...`,
              );
              this.logLearningTarget(
                LogLevel.INFO,
                `[${traceId}] Creating batch learning targets`,
                { count: topicsForLearningTargets.length },
              );

              const batchStartTime = Date.now();
              const result = await this.learningTargetsService.createBatch(
                courseId,
                userId,
                topicsForLearningTargets,
              );

              const batchDuration = Date.now() - batchStartTime;
              console.log(
                `[${traceId}] [CREATE_BATCH] Completed in ${batchDuration}ms`,
              );
              console.log(`[${traceId}] [CREATE_BATCH] Result:`, result);

              this.logLearningTarget(
                LogLevel.INFO,
                `[${traceId}] Batch creation completed`,
                {
                  durationMs: batchDuration,
                  result: result || 'no_result',
                  success: !!result,
                },
              );

              this.logger.info(
                `[${traceId}] Learning targets created successfully for all subtopics`,
                'QuizzesService.updateLearningTargetsFromAnalysis',
                __filename,
                undefined,
                { courseId, userId, result },
              );

              // Öğrenme hedefleri log dosyasına başarılı işlemi kaydet
              this.logLearningTarget(
                LogLevel.INFO,
                'Learning targets created successfully',
                {
                  courseId,
                  userId,
                  traceId,
                  action: 'create_batch_success',
                  count: topicsForLearningTargets.length,
                  result: result ? 'success' : 'no_result',
                },
              );
            } catch (batchError) {
              console.error('[ERROR] Create Batch Error:', batchError);
              this.logger.error(
                `Error processing learning targets batch: ${batchError}`,
                'QuizzesService.updateLearningTargetsFromAnalysis',
                __filename,
                undefined, // lineNumber
                batchError instanceof Error
                  ? batchError
                  : new Error(String(batchError)), // error
                { courseId, userId }, // additionalInfo
              );
              throw batchError;
            }
          } else {
            console.warn('[WARN] No valid topics to create learning targets');
            this.logger.warn(
              `[${traceId}] No valid topics to create learning targets`,
              'QuizzesService.updateLearningTargetsFromAnalysis',
              __filename,
              undefined,
              { courseId, userId, subTopics },
            );
          }
        } catch (processError) {
          console.error('[ERROR] Error processing subtopics:', processError);
          const errorMessage =
            processError instanceof Error
              ? processError.message
              : String(processError);
          const errorStack =
            processError instanceof Error ? processError.stack : undefined;

          console.error(
            `[${traceId}] [ERROR] Error in updateLearningTargetsFromAnalysis:`,
            errorMessage,
          );
          if (errorStack) {
            console.error(`[${traceId}] [ERROR] Stack trace:`, errorStack);
          }

          this.logger.error(
            `[${traceId}] Error in updateLearningTargetsFromAnalysis: ${errorMessage}`,
            'QuizzesService.updateLearningTargetsFromAnalysis',
            __filename,
            undefined,
            processError,
            {
              courseId,
              userId,
              traceId,
              error: {
                message: errorMessage,
                name:
                  processError instanceof Error
                    ? processError.name
                    : 'UnknownError',
                stack: errorStack,
              },
            },
          );

          // Log to learning targets file
          this.logLearningTarget(
            LogLevel.ERROR,
            `[${traceId}] Error updating learning targets`,
            {
              error: errorMessage,
              stack: errorStack,
              courseId,
              userId,
              traceId,
            },
          );

          // We don't throw the error, we just log it because the failure of this operation should not affect the main process
        } finally {
          const duration = Date.now() - startTime;
          console.log(
            `[${traceId}] [COMPLETED] updateLearningTargetsFromAnalysis completed in ${duration}ms`,
          );

          this.logLearningTarget(
            LogLevel.INFO,
            `[${traceId}] Learning target update process completed`,
            {
              traceId,
              courseId,
              userId,
              durationMs: duration,
              timestamp: new Date().toISOString(),
            },
          );
        }
      } else {
        console.warn('[WARN] No selectedSubTopics provided or empty array');
        this.logger.warn(
          `[${traceId}] No selectedSubTopics provided or empty array`,
          'QuizzesService.updateLearningTargetsFromAnalysis',
          __filename,
          undefined,
          { courseId, userId },
        );
      }

      // 2. Update learning target statuses based on analysis results
      console.log(`[${traceId}] [ANALYSIS] Checking analysis results...`);
      this.logLearningTarget(
        LogLevel.INFO,
        `[${traceId}] Processing analysis results`,
        {
          hasAnalysis: !!analysis,
          hasPerformanceData: !!analysis?.performanceBySubTopic,
          performanceKeys: analysis?.performanceBySubTopic
            ? Object.keys(analysis.performanceBySubTopic)
            : [],
        },
      );

      if (analysis && analysis.performanceBySubTopic) {
        const performanceEntries = Object.entries(
          analysis.performanceBySubTopic,
        );
        console.log(
          `[${traceId}] [ANALYSIS] Found performance data for ${performanceEntries.length} subtopics`,
        );

        if (performanceEntries.length === 0) {
          console.warn(
            `[${traceId}] [WARN] No performance data available in analysis`,
          );
          this.logLearningTarget(
            LogLevel.WARN,
            `[${traceId}] No performance data available`,
            { analysisKeys: Object.keys(analysis) },
          );
        }
        this.logger.info(
          `[${traceId}] Updating learning target statuses based on performance`,
          'QuizzesService.updateLearningTargetsFromAnalysis',
          __filename,
          undefined,
          {
            courseId,
            userId,
            performanceTopicsCount: Object.keys(analysis.performanceBySubTopic)
              .length,
          },
        );

        // Analiz sonuçlarındaki her alt konu için
        for (const [subTopic, performance] of Object.entries(
          analysis.performanceBySubTopic,
        )) {
          // Puana göre durumu hesapla
          const status = this.calculateStatus(performance.scorePercent);

          try {
            // Öğrenme hedefini bul
            const targets = await this.learningTargetsService.findByCourse(
              courseId,
              userId,
            );
            const normalizedSubTopic =
              this.normalizationService.normalizeSubTopicName(subTopic);

            // Normalize edilmiş ada göre hedefi buluyorz
            const target = targets.find(
              (t) =>
                this.normalizationService.normalizeSubTopicName(
                  t.subTopicName,
                ) === normalizedSubTopic,
            );

            if (target) {
              // Hedef bulundu, durumunu güncelle
              await this.learningTargetsService.updateLearningTarget(
                target.id,
                {
                  status: status as any, // Type casting ile sorunu çözüyoruz
                  // Not: UpdateLearningTargetDto içinde lastAttemptScorePercent alanı yok
                  // istatistikler için ayrı bir güncelleme metodu kullanılabilir
                },
                userId,
              );

              this.logger.info(
                `[${traceId}] Updated learning target status for "${subTopic}" to ${status}`,
                'QuizzesService.updateLearningTargetsFromAnalysis',
                __filename,
                undefined,
                {
                  targetId: target.id,
                  subTopic,
                  newStatus: status,
                  scorePercent: performance.scorePercent,
                },
              );

              // Öğrenme hedefi güncellemesini özel log dosyasına kaydet
              this.logLearningTarget(
                LogLevel.INFO,
                `Öğrenme hedefi durumu güncellendi: "${subTopic}" -> ${status}`,
                {
                  courseId,
                  userId,
                  targetId: target.id,
                  oldStatus: target.status,
                  newStatus: status,
                  scorePercent: performance.scorePercent,
                  traceId,
                  action: 'update_status',
                },
              );
            } else {
              this.logger.warn(
                `[${traceId}] Could not find learning target for subtopic "${subTopic}"`,
                'QuizzesService.updateLearningTargetsFromAnalysis',
                __filename,
                undefined,
                { courseId, userId, subTopic, normalizedSubTopic },
              );
            }
          } catch (error) {
            // Bireysel güncellemeler hatası sınavın tamamlanmasını engellemesin
            this.logger.error(
              `[${traceId}] Error updating learning target for "${subTopic}": ${error instanceof Error ? error.message : String(error)}`,
              'QuizzesService.updateLearningTargetsFromAnalysis',
              __filename,
              undefined,
            );

            // Hata durumunu özel log dosyasına da kaydet
            this.logLearningTarget(
              LogLevel.ERROR,
              `Öğrenme hedefi güncellenirken hata: "${subTopic}"`,
              {
                courseId,
                userId,
                subTopic,
                error: error instanceof Error ? error.message : String(error),
                traceId,
                action: 'update_error',
              },
            );
          }
        }
      }
    } catch (error) {
      // Genel hata durumunda loglama yap
      this.logger.error(
        `[${traceId}] Error in updateLearningTargetsFromAnalysis: ${error instanceof Error ? error.message : String(error)}`,
        'QuizzesService.updateLearningTargetsFromAnalysis',
        __filename,
        undefined,
        // metadata objesi geçmiyoruz, zaten hata mesajı log içeriğinde yer alıyor
      );
      // Hatayı dışarı fırlatmıyoruz, sadece logluyoruz
    }
  }

  /**
   * Öğrenme hedefi işlemlerini özel log dosyasına kaydeder
   * @param level Log seviyesi
   * @param message Mesaj
   * @param data Ek veriler
   */
  /**
   * Logs learning target related messages to a dedicated log file
   * @param level Log level
   * @param message Log message
   * @param data Additional data to include in the log
   */
  private logLearningTarget(
    level: LogLevel,
    message: string,
    data?: Record<string, any>,
  ): void {
    try {
      // Log dizininin var olduğundan emin ol
      const logDir = 'logs';
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Log dosyası yoksa oluştur
      if (!fs.existsSync(this.learningTargetLogPath)) {
        fs.writeFileSync(
          this.learningTargetLogPath,
          '[' +
            new Date().toISOString() +
            '] Öğrenme hedefleri log dosyası oluşturuldu\n',
          { encoding: 'utf8' },
        );
      }

      // Log formatını oluştur
      const timestamp = new Date().toISOString();
      const logData = {
        timestamp,
        level: level.toUpperCase(),
        message,
        ...data,
      };

      // Log'u dosyaya yaz
      const logEntry = JSON.stringify(logData) + '\n';
      fs.appendFileSync(this.learningTargetLogPath, logEntry, {
        encoding: 'utf8',
      });

      // Konsola da yaz
      switch (level) {
        case LogLevel.ERROR:
          console.error(`[Öğrenme Hedef] ${message}`, data);
          break;
        case LogLevel.WARN:
          console.warn(`[Öğrenme Hedef] ${message}`, data);
          break;
        case LogLevel.INFO:
          console.info(`[Öğrenme Hedef] ${message}`, data);
          break;
        case LogLevel.DEBUG:
          console.debug(`[Öğrenme Hedef] ${message}`, data);
          break;
      }
    } catch (error) {
      console.error(
        `Öğrenme hedefi log hatası: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // Helper to calculate status based on score (PRD 4.5.2)
  private calculateStatus(scorePercent: number): LearningTargetStatus {
    if (scorePercent >= 70) return 'mastered';
    if (scorePercent >= 50) return 'medium';
    return 'failed';
  }

  /**
   * Save failed questions for review
   */
  private async saveFailedQuestions(
    quizId: string,
    userId: string,
    courseId: string | null,
    failedQuestions: any[],
    userAnswers: Record<string, string>,
  ) {
    const saveFailedDebugLog = (message: string, data?: any) => {
      const timestamp = new Date().toISOString();
      const logEntry = `[${timestamp}] [SAVE_FAILED_QUESTIONS_DEBUG] ${message}${data ? '\nDATA: ' + JSON.stringify(data, null, 2) : ''}\n`;
      require('fs').appendFileSync(
        'C:\\Users\\Ahmet haman\\OneDrive\\Desktop\\Bitirme\\backend\\logs\\kayit.log',
        logEntry,
      );
    };

    saveFailedDebugLog('=== SAVE FAILED QUESTIONS START ===', {
      quizId,
      userId,
      courseId,
      failedQuestionsCount: failedQuestions?.length || 0,
      userAnswersKeys: Object.keys(userAnswers || {}),
    });

    if (!failedQuestions || failedQuestions.length === 0) {
      saveFailedDebugLog('❌ NO FAILED QUESTIONS TO SAVE - RETURNING EARLY');
      return;
    }

    saveFailedDebugLog('📝 PROCESSING FAILED QUESTIONS', {
      failedQuestions: failedQuestions.map((q, index) => ({
        index,
        id: q.id,
        questionId: q.questionId,
        questionText: q.questionText?.substring(0, 50) + '...',
        hasOptions: Array.isArray(q.options),
        optionsCount: q.options?.length,
        correctAnswer: q.correctAnswer,
        subTopic: q.subTopic,
        subTopicName: q.subTopicName,
        normalizedSubTopic: q.normalizedSubTopic,
        normalizedSubTopicName: q.normalizedSubTopicName,
        difficulty: q.difficulty,
      })),
    });

    const failedQuestionRecords = failedQuestions.map((q, index) => {
      saveFailedDebugLog(
        `🔍 PROCESSING QUESTION ${index + 1}/${failedQuestions.length}`,
        {
          questionIndex: index,
          originalQuestion: {
            id: q.id,
            questionId: q.questionId,
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            subTopic: q.subTopic,
            subTopicName: q.subTopicName,
            normalizedSubTopic: q.normalizedSubTopic,
            normalizedSubTopicName: q.normalizedSubTopicName,
            difficulty: q.difficulty,
          },
        },
      );

      const questionId = q.id || q.questionId;
      const userAnswer = userAnswers[q.id] || userAnswers[questionId] || '';

      saveFailedDebugLog(`📊 EXTRACTED DATA FOR QUESTION ${index + 1}`, {
        extractedQuestionId: questionId,
        extractedUserAnswer: userAnswer,
        userAnswersForThisId: {
          byId: userAnswers[q.id],
          byQuestionId: userAnswers[questionId],
        },
      });

      // Fix options field to prevent nested arrays in Firestore
      let processedOptions = [];
      if (Array.isArray(q.options)) {
        processedOptions = q.options.map((option) => {
          if (typeof option === 'string') {
            return option;
          } else if (typeof option === 'object' && option !== null) {
            // If option is an object with text property, extract text
            return option.text || option.id || String(option);
          }
          return String(option);
        });
      }

      const record = {
        userId,
        quizId,
        courseId,
        questionId: questionId,
        questionText: q.questionText || '',
        options: processedOptions, // Now guaranteed to be string array
        correctAnswer: q.correctAnswer || '',
        userAnswer: userAnswer,
        subTopic: q.subTopic || q.subTopicName || '',
        normalizedSubTopic:
          q.normalizedSubTopic || q.normalizedSubTopicName || '',
        difficulty: q.difficulty || 'medium',
        failedTimestamp: new Date(),
      };

      saveFailedDebugLog(`✅ CREATED RECORD FOR QUESTION ${index + 1}`, {
        record,
      });

      // Validate critical fields
      if (!record.questionId) {
        saveFailedDebugLog(
          `🚨 CRITICAL ERROR: questionId is undefined for question ${index + 1}`,
          {
            originalQ: q,
            record,
            possibleIds: { qId: q.id, qQuestionId: q.questionId },
          },
        );
      }

      return record;
    });

    saveFailedDebugLog('📦 ALL RECORDS CREATED', {
      recordsCount: failedQuestionRecords.length,
      records: failedQuestionRecords,
    });

    try {
      saveFailedDebugLog('🚀 STARTING FIRESTORE BATCH OPERATION');

      const batch = this.firebaseService.firestore.batch();
      const collectionRef = this.firebaseService.firestore.collection(
        FIRESTORE_COLLECTIONS.FAILED_QUESTIONS,
      );

      failedQuestionRecords.forEach((record, index) => {
        saveFailedDebugLog(`📝 ADDING RECORD ${index + 1} TO BATCH`, {
          record,
        });

        // Final validation before adding to batch
        const invalidFields: string[] = [];
        if (record.questionId === undefined || record.questionId === null)
          invalidFields.push('questionId');
        if (!record.userId) invalidFields.push('userId');
        if (!record.quizId) invalidFields.push('quizId');

        if (invalidFields.length > 0) {
          saveFailedDebugLog(
            `🚨 INVALID RECORD DETECTED - WILL CAUSE FIRESTORE ERROR`,
            {
              recordIndex: index,
              invalidFields,
              record,
            },
          );
        }

        const docRef = collectionRef.doc();
        batch.set(docRef, record);

        saveFailedDebugLog(
          `✅ RECORD ${index + 1} ADDED TO BATCH WITH DOC ID: ${docRef.id}`,
        );
      });

      saveFailedDebugLog('💾 COMMITTING BATCH TO FIRESTORE');
      await batch.commit();
      saveFailedDebugLog('🎉 BATCH COMMITTED SUCCESSFULLY');
    } catch (batchError) {
      saveFailedDebugLog('💥 FIRESTORE BATCH ERROR', {
        error: batchError.message,
        stack: batchError.stack,
        failedQuestionRecords,
      });
      throw batchError;
    }

    saveFailedDebugLog('=== SAVE FAILED QUESTIONS END ===');
  }

  /**
   * Helper method to validate that a course exists and belongs to the user
   */
  @LogMethod({ trackParams: true })
  private async validateCourseOwnership(courseId: string, userId: string) {
    try {
      this.flowTracker.trackStep(
        `${courseId} ID'li ders sahipliği doğrulanıyor`,
        'QuizzesService',
      );

      const course = await this.firebaseService.findById<{ userId: string }>(
        FIRESTORE_COLLECTIONS.COURSES,
        courseId,
      );

      if (!course) {
        this.logger.warn(
          `${courseId} ID'li ders bulunamadı`,
          'QuizzesService.validateCourseOwnership',
          __filename,
          582,
          { courseId, userId },
        );
        throw new NotFoundException(`Kurs bulunamadı: ${courseId}`);
      }

      if (course.userId !== userId) {
        this.logger.warn(
          `Yetkisiz erişim: ${userId} kullanıcısı ${courseId} ID'li derse erişim yetkisine sahip değil`,
          'QuizzesService.validateCourseOwnership',
          __filename,
          593,
          { courseId, userId, ownerId: course.userId },
        );
        throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır');
      }

      this.logger.debug(
        `${courseId} ID'li ders sahipliği doğrulandı`,
        'QuizzesService.validateCourseOwnership',
        __filename,
        602,
        { courseId, userId },
      );
    } catch (error) {
      // Zaten loglanan hataları tekrar loglama
      if (
        !(
          error instanceof NotFoundException ||
          error instanceof ForbiddenException
        )
      ) {
        this.logger.logError(error, 'QuizzesService.validateCourseOwnership', {
          courseId,
          userId,
          additionalInfo: 'Ders sahipliği doğrulanırken hata oluştu',
        });
      }
      throw error;
    }
  }

  /**
   * Get failed questions for a user, optionally filtered by course
   */
  @LogMethod({ trackParams: true })
  async getFailedQuestions(userId: string, courseId?: string) {
    try {
      this.flowTracker.trackStep(
        courseId
          ? `${courseId} ID'li derse ait başarısız sorular getiriliyor`
          : `${userId} ID'li kullanıcının tüm başarısız soruları getiriliyor`,
        'QuizzesService',
      );

      if (courseId) {
        await this.validateCourseOwnership(courseId, userId);
      }

      const query = this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.FAILED_QUESTIONS)
        .where('userId', '==', userId);

      if (courseId) {
        query.where('courseId', '==', courseId);
      }

      const snapshot = await query.get();
      const failedQuestions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      this.logger.info(
        `${failedQuestions.length} adet başarısız soru getirildi`,
        'QuizzesService.getFailedQuestions',
        __filename,
        644,
        { userId, courseId, questionsCount: failedQuestions.length },
      );

      return failedQuestions;
    } catch (error) {
      this.logger.logError(error, 'QuizzesService.getFailedQuestions', {
        userId,
        courseId,
        additionalInfo: 'Başarısız sorular getirilirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Delete a quiz
   */
  @LogMethod({ trackParams: true })
  async remove(id: string, userId: string) {
    try {
      this.flowTracker.trackStep(
        `${id} ID'li sınav siliniyor`,
        'QuizzesService',
      );

      const quiz = await this.findOne(id, userId);

      // No need to check ownership again since findOne already does that

      // Delete the quiz
      await this.firebaseService.delete(FIRESTORE_COLLECTIONS.QUIZZES, id);

      // Delete any analysis if exists
      const analysisQuery = this.firebaseService.firestore
        .collection('quizAnalysis')
        .where('quizId', '==', id);

      const analysisSnapshot = await analysisQuery.get();
      if (!analysisSnapshot.empty) {
        const batch = this.firebaseService.firestore.batch();
        analysisSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }

      this.logger.info(
        `${id} ID'li sınav başarıyla silindi`,
        'QuizzesService.remove',
        __filename,
        686,
        { quizId: id, userId },
      );

      return { success: true, message: 'Sınav başarıyla silindi' };
    } catch (error) {
      this.logger.logError(error, 'QuizzesService.remove', {
        quizId: id,
        userId,
        additionalInfo: 'Sınav silinirken hata oluştu',
      });
      throw error;
    }
  }

  /**
   * Get analysis for a specific quiz (using Prisma)
   */
  async getQuizAnalysis(
    id: string,
    userId: string,
  ): Promise<AnalysisResult | null> {
    const quiz = await this.findOne(id, userId);

    if (!quiz) {
      throw new NotFoundException('Quiz bulunamadı');
    }

    // Since findOne already checks ownership, this check might be redundant
    // but let's keep it as an extra security measure
    if (quiz.userId !== userId) {
      throw new ForbiddenException('Bu işlem için yetkiniz bulunmamaktadır.');
    }

    if (!quiz.analysisResult) {
      this.logger.warn(
        `Quiz ${id} için analiz sonucu bulunamadı.`,
        'QuizzesService.getQuizAnalysis',
        __filename,
        720,
        { quizId: id, userId },
      );
      return null;
    }
    return quiz.analysisResult as AnalysisResult;
  }

  /**
   * Sınav sorularının karmaşıklığını hesaplar
   * Yardımcı metot
   */
  private calculateQuizComplexity(questions) {
    if (!questions || !questions.length) return null;

    // Zorluk seviyesine göre dağılım
    const difficultyCount = {
      easy: 0,
      medium: 0,
      hard: 0,
    };

    questions.forEach((q) => {
      const difficulty = q.difficulty || 'medium';
      if (difficultyCount[difficulty] !== undefined) {
        difficultyCount[difficulty]++;
      }
    });

    // Ortalama zorluk (1:kolay, 2:orta, 3:zor)
    const difficultyValues = { easy: 1, medium: 2, hard: 3 };
    let complexityScore = 0;
    let totalWeight = 0;

    Object.entries(difficultyCount).forEach(([difficulty, count]) => {
      complexityScore += difficultyValues[difficulty] * count;
      totalWeight += count;
    });

    const averageComplexity =
      totalWeight > 0 ? complexityScore / totalWeight : 0;

    return {
      difficultyDistribution: difficultyCount,
      averageComplexity: averageComplexity,
      complexityLevel:
        averageComplexity < 1.5
          ? 'Kolay'
          : averageComplexity < 2.5
            ? 'Orta'
            : 'Zor',
    };
  }

  /**
   * Analiz sonuçlarına göre gelişim önerileri üretir
   * Yardımcı metot
   */
  private generateImprovementSuggestions(analysisResult) {
    if (!analysisResult) return [];

    const suggestions: any[] = [];

    // Başarısız olunan konular için öneriler ekle
    if (analysisResult.performanceCategorization?.failed?.length > 0) {
      suggestions.push({
        priority: 'high',
        type: 'focusAreas',
        message: 'Başarısız olduğunuz konulara yoğunlaşın',
        areas: analysisResult.performanceCategorization.failed,
        action: 'weakTopicReview',
      });
    }

    // Orta seviyede olunan konular için öneriler
    if (analysisResult.performanceCategorization?.medium?.length > 0) {
      suggestions.push({
        priority: 'medium',
        type: 'improveAreas',
        message: 'Geliştirmeniz gereken konular',
        areas: analysisResult.performanceCategorization.medium,
        action: 'practiceMore',
      });
    }

    // Genel puana göre öneriler
    const overallScore = analysisResult.overallScore || 0;
    if (overallScore < 50) {
      suggestions.push({
        priority: 'high',
        type: 'generalStudy',
        message: 'Temel kavramları gözden geçirmeniz önerilir',
        action: 'basicReview',
      });
    } else if (overallScore < 70) {
      suggestions.push({
        priority: 'medium',
        type: 'targetedStudy',
        message: 'Eksik konularınızı tamamlamanız önerilir',
        action: 'targetedReview',
      });
    } else {
      suggestions.push({
        priority: 'low',
        type: 'advancedStudy',
        message: 'Konuları iyi anlamışsınız, yeni konulara geçebilirsiniz',
        action: 'moveToNext',
      });
    }

    return suggestions;
  }

  /**
   * Başarısız sorulardan tekrar sınavı oluşturur
   * PRD 4.7.4 - Kullanıcının geçmişte yanlış cevapladığı soruları temel alarak sınav oluşturma
   */
  async generateReviewQuiz(
    courseId: string | null,
    userId: string,
    questionCount: number = 10,
  ): Promise<Record<string, any>> {
    this.logger.info(
      `Generating review quiz for user ${userId} with course ${courseId || 'all'}`,
      'QuizzesService.generateReviewQuiz',
      __filename,
      807,
      { courseId, userId, questionCount },
    );

    // Course ID varsa, dersin kullanıcıya ait olduğunu kontrol et
    if (courseId) {
      await this.validateCourseOwnership(courseId, userId);
    }

    // Kullanıcının yanlış cevapladığı soruları getir
    const failedQuestions = (await this.getFailedQuestions(
      userId,
      courseId ?? undefined,
    )) as any[];

    if (failedQuestions.length === 0) {
      throw new BadRequestException(
        'Tekrar sınavı için yeterli başarısız soru bulunamadı',
      );
    }

    // Soruları tarihe göre sırala (en yeniden en eskiye)
    const sortedQuestions = [...failedQuestions].sort(
      (a, b) =>
        new Date((a as any).failedTimestamp).getTime() -
        new Date((b as any).failedTimestamp).getTime(),
    );

    // Soru sayısını kontrol et (istenen soru sayısı kadar veya mevcut tüm sorular)
    const selectedCount = Math.min(questionCount, sortedQuestions.length);

    // En son yanlış cevaplanan sorular kullanılır
    // (Yeni versiyon ayrıca benzersiz soruları almaya dikkat eder)
    const uniqueQuestionIds = new Set();
    const selectedQuestions: any[] = [];

    for (const question of sortedQuestions as any[]) {
      if (!uniqueQuestionIds.has((question as any).questionId)) {
        uniqueQuestionIds.add((question as any).questionId);
        selectedQuestions.push(question as any);
      }
      if (selectedQuestions.length >= selectedCount) break;
    }

    // FailedQuestion modeli -> QuizQuestion formatına dönüştür
    const quizQuestions = selectedQuestions.map((q, index) => ({
      id: `review_${Date.now()}_${index}`,
      questionText: (q as any).questionText,
      options: (q as any).options,
      correctAnswer: (q as any).correctAnswer,
      explanation: (q as any).explanation || 'Açıklama bulunmuyor',
      subTopic: (q as any).subTopicName,
      normalizedSubTopic: (q as any).normalizedSubTopicName,
      difficulty: (q as any).difficulty,
      originalQuestionId: (q as any).questionId, // Orijinal soru ID'sini referans olarak tut
      failedTimestamp: (q as any).failedTimestamp, // Son başarısız yanıtlama zamanı
    }));

    // Yeni sınav nesnesi oluştur (henüz veritabanına kaydedilmemiş)
    const newQuiz = {
      userId,
      quizType: 'review', // Yeni bir sınav tipi: review
      personalizedQuizType: null,
      courseId,
      sourceDocument: null,
      selectedSubTopics: selectedQuestions.map((q: any) => ({
        subTopic: q.subTopicName,
        normalizedSubTopic: q.normalizedSubTopicName,
      })),
      preferences: {
        difficulty: 'mixed', // Karışık zorluk seviyesi
        questionCount: selectedCount,
      },
      questions: quizQuestions,
    };

    return newQuiz;
  }

  /**
   * Alt konu adını normalize eder (normalize edilmiş ad yoksa)
   * Yardımcı metot
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private normalizeName(name: string): string {
    this.logger.info(
      `Normalizing name: ${name}`,
      'QuizzesService.normalizeName',
      __filename,
      785,
      { name },
    );

    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private async findLearningTargetId(subTopicName: string): Promise<string> {
    this.logger.debug(
      `Öğrenme hedefi ID'si aranıyor: ${subTopicName}`,
      'QuizzesService.findLearningTargetId',
      __filename,
      883,
      { subTopicName },
    );

    const target = await this.firebaseService.firestore
      .collection('learningTargets')
      .where('subTopicName', '==', subTopicName)
      .select('id')
      .get();

    if (target.empty) {
      throw new NotFoundException(`Öğrenme hedefi bulunamadı: ${subTopicName}`);
    }

    const doc = target.docs[0];
    return doc.data().id;
  }

  /**
   * Belge metni ve alt konulardan sınav oluştur
   */
  @LogMethod({ trackParams: true })
  async createQuiz(params: CreateQuizParams) {
    this.flowTracker.trackStep('Sınav oluşturuluyor', 'QuizzesService');

    try {
      // Alt konu kontrolü
      if (
        !params.subTopics ||
        !Array.isArray(params.subTopics) ||
        params.subTopics.length === 0
      ) {
        throw new BadRequestException('En az bir alt konu belirtilmelidir');
      }

      // Sorular oluştur
      const questions = await this.aiService.generateQuizQuestions({
        subTopics: params.subTopics,
        questionCount: params.preferences.questionCount,
        difficulty: params.preferences.difficulty as any,
      });

      if (!questions || questions.length === 0) {
        throw new BadRequestException('Sorular oluşturulamadı');
      }

      this.logger.info(
        `${questions.length} soru oluşturuldu`,
        'QuizzesService.createQuiz',
        __filename,
        undefined,
        { questionCount: questions.length },
      );

      // Sınav için model oluştur
      const quizModel = {
        userId: params.userId,
        title: `Hızlı Sınav - ${new Date().toLocaleDateString('tr-TR')}`,
        type: params.quizType,
        questions: questions,
        status: 'active',
        sourceDocument: params.sourceDocument
          ? {
              documentId: params.sourceDocument.documentId,
              fileName: `Belge_${params.sourceDocument.documentId}`,
            }
          : null,
        createdAt: new Date(),
        preferences: {
          questionCount: params.preferences.questionCount,
          difficulty: params.preferences.difficulty,
          timeLimit: params.preferences.timeLimit ?? null,
        },
        metadata: {
          subTopics: params.subTopics.map((topic) => topic.subTopicName),
        },
      };

      // Firestore'a kaydet
      const savedQuiz = await this.firebaseService.create('quizzes', quizModel);

      this.logger.info(
        `Sınav başarıyla oluşturuldu, ID: ${savedQuiz.id}`,
        'QuizzesService.createQuiz',
        __filename,
        undefined,
        { quizId: savedQuiz.id },
      );

      return {
        ...savedQuiz,
        questionCount: questions.length,
      };
    } catch (error) {
      this.logger.error(
        `Sınav oluşturma hatası: ${error.message}`,
        'QuizzesService.createQuiz',
        __filename,
      );
      throw error;
    }
  }

  /**
   * Hızlı sınav oluşturur
   */
  async createQuickQuiz(
    userId: string,
    documentText: string,
    subTopics: string[],
    questionCount: number = 10,
    difficulty: string = 'medium',
    documentId?: string,
  ): Promise<Quiz> {
    try {
      this.flowTracker.trackStep('Hızlı sınav oluşturuluyor', 'QuizzesService');

      // Belge ID varsa, belgenin metnini getir
      let finalDocumentText = documentText;

      if (documentId) {
        this.logger.info(
          `Belge ID mevcut (${documentId}), belge metni alınıyor`,
          'QuizzesService.createQuickQuiz',
          __filename,
          undefined,
          { documentId, userId, hasProvidedText: !!documentText },
        );

        try {
          // DocumentsService'den belge metnini al - getDocumentText metodu hem ID hem userId bekliyor
          const documentResult = await this.documentsService.getDocumentText(
            documentId,
            userId,
          );

          if (documentResult && documentResult.text) {
            finalDocumentText = documentResult.text;
            this.logger.info(
              `Belge metni veritabanından alındı: ${finalDocumentText.length} karakter`,
              'QuizzesService.createQuickQuiz',
              __filename,
              undefined,
              { documentId, textLength: finalDocumentText.length },
            );
          } else {
            this.logger.warn(
              `Belge ID (${documentId}) için metin bulunamadı, kullanıcının sağladığı metin kullanılacak`,
              'QuizzesService.createQuickQuiz',
              __filename,
              undefined,
              { documentId, userId },
            );
          }
        } catch (docError) {
          this.logger.logError(docError, 'QuizzesService.createQuickQuiz', {
            documentId,
            userId,
            additionalInfo: 'Belge metni alınırken hata oluştu',
          });

          // Kullanıcı tarafından sağlanan metin varsa onu kullan
          if (!finalDocumentText) {
            throw new BadRequestException(
              'Belge metni alınamadı ve alternatif metin sağlanmadı. Lütfen tekrar deneyin.',
            );
          }
        }
      }

      // Belge metni kontrolü - documentId olsa bile finalDocumentText hala boş olabilir
      if (!finalDocumentText || finalDocumentText.length === 0) {
        this.logger.warn(
          'Belge metni boş',
          'QuizzesService.createQuickQuiz',
          __filename,
          undefined,
          { textLength: finalDocumentText?.length, userId, documentId },
        );
        throw new BadRequestException(
          'Belge metni boş. Lütfen geçerli bir belge yükleyin veya metin girin.',
        );
      }

      // Belge metni çok kısa olduğunda sadece uyarı ver ama işlemi engelleme
      if (finalDocumentText.length < 100) {
        this.logger.warn(
          'Belge metni çok kısa, minimum önerilen 100 karakter',
          'QuizzesService.createQuickQuiz',
          __filename,
          undefined,
          { textLength: finalDocumentText.length, userId, documentId },
        );
        // Uyarı logla ama işlemi devam ettir
      }

      // Alt konuları kontrol et
      if (!subTopics || !Array.isArray(subTopics) || subTopics.length === 0) {
        this.logger.warn(
          'Geçersiz alt konular',
          'QuizzesService.createQuickQuiz',
          __filename,
          undefined,
          { subTopics, userId },
        );
        throw new BadRequestException(
          'En az bir alt konu seçmelisiniz. Lütfen belge yükleyip konuları tespit edin.',
        );
      }

      // Soru sayısını kontrol et
      if (questionCount < 1 || questionCount > 50) {
        questionCount = 10; // Varsayılana ayarla
      }

      // Zorluk seviyesini kontrol et
      const allowedDifficulties = ['easy', 'medium', 'hard', 'mixed'];
      if (!allowedDifficulties.includes(difficulty)) {
        difficulty = 'medium'; // Varsayılana ayarla
      }

      this.logger.info(
        `Hızlı sınav oluşturma AI isteği hazırlanıyor. ${subTopics.length} konu, ${questionCount} soru`,
        'QuizzesService.createQuickQuiz',
        __filename,
        undefined,
        { userId, subTopicsCount: subTopics.length, questionCount, difficulty },
      );

      // Yeni quiz oluştur
      const quizId = this.firebaseService.firestore
        .collection('quizzes')
        .doc().id;
      const traceId = `quiz_${quizId}_${Date.now()}`;

      // Tracing ve akış izleme için metadata
      const metadata = {
        quizId,
        userId,
        subTopicsCount: subTopics.length,
        traceId,
      };

      this.flowTracker.trackStep(
        `AI'dan ${questionCount} soru oluşturulması isteniyor`,
        'QuizzesService',
      );

      // AI'den soruları oluştur
      let questions: QuizQuestion[] = [];
      try {
        this.logger.debug(
          'AI soru oluşturma isteği gönderiliyor',
          'QuizzesService.createQuickQuiz',
          __filename,
          undefined,
          { userId, quizId, traceId },
        );

        // AI'den soruları oluştur - retry mekanizması ekle
        const maxRetries = 2;
        let retryCount = 0;
        let success = false;

        while (retryCount <= maxRetries && !success) {
          try {
            questions = await this.aiService.generateQuickQuiz(
              finalDocumentText,
              subTopics,
              questionCount,
              difficulty,
            );

            // Soruları kontrol et
            if (questions && Array.isArray(questions) && questions.length > 0) {
              this.logger.info(
                `AI ${questions.length} soru üretti`,
                'QuizzesService.createQuickQuiz',
                __filename,
                undefined,
                { quizId, generatedQuestions: questions.length },
              );
              success = true;
            } else {
              throw new Error('AI geçerli sorular üretmedi');
            }
          } catch (aiError) {
            retryCount++;
            this.logger.warn(
              `AI soru oluşturma denemesi ${retryCount} başarısız: ${aiError instanceof Error ? aiError.message : 'Bilinmeyen hata'}`,
              'QuizzesService.createQuickQuiz',
              __filename,
              undefined,
              { retryCount, quizId, error: aiError },
            );

            if (retryCount > maxRetries) {
              throw aiError;
            }
          }
        }

        this.logger.info(
          `${questions.length} soru başarıyla üretildi`,
          'QuizzesService.createQuickQuiz',
          __filename,
          undefined,
          { quizId, questionCount: questions.length },
        );
      } catch (aiError) {
        this.logger.error(
          `AI soru üretme hatası (userId: ${userId}, quizId: ${quizId}): ${aiError instanceof Error ? aiError.message : 'Bilinmeyen hata'}`,
          'QuizzesService.createQuickQuiz',
          __filename,
        );
        throw new BadRequestException(
          'Sınav soruları oluşturulurken hata oluştu. Lütfen daha sonra tekrar deneyin.',
        );
      }

      // Yeni quiz nesnesi oluştur - veritabanına kaydetmeden
      const timestamp = new Date();
      const quiz = {
        id: quizId,
        userId,
        quizType: 'quick',
        personalizedQuizType: null,
        questions,
        timestamp,
        selectedSubTopics: subTopics,
        courseId: '', // Undefined yerine boş string kullan
        completed: false,
        score: 0,
        correctCount: 0,
        totalQuestions: questions.length,
        elapsedTime: 0,
        userAnswers: {} as Record<string, string>,
        preferences: {
          questionCount,
          difficulty,
          timeLimit: null,
          prioritizeWeakAndMediumTopics: false,
        },
        sourceDocument: documentId
          ? {
              documentId,
              fileName: `Döküman #${documentId}`,
              uploadDate: timestamp,
            }
          : null,
      } as Quiz;

      this.logger.info(
        `Hızlı sınav oluşturuldu (henüz kaydedilmedi): ID=${quizId}`,
        'QuizzesService.createQuickQuiz',
        __filename,
        undefined,
        { quizId, userId, questionCount: questions.length },
      );

      // Seçilen konular öğrenme hedefi olarak kaydediliyor...
      try {
        this.logger.info(
          'Seçilen konular öğrenme hedefi olarak kaydediliyor...',
          'QuizzesService.createPersonalizedQuiz',
          __filename,
        );
        if (
          Array.isArray(subTopics) &&
          subTopics.length > 0 &&
          courseId &&
          userId
        ) {
          const topicsForLearningTargets = subTopics.map((topic) => ({
            subTopicName: topic,
            normalizedSubTopicName:
              this.normalizationService.normalizeSubTopicName(topic),
          }));
          await this.learningTargetsService.createBatch(
            courseId,
            userId,
            topicsForLearningTargets,
          );
          this.logger.info(
            `${topicsForLearningTargets.length} adet yeni öğrenme hedefi başarıyla kaydedildi.`,
            'QuizzesService.createPersonalizedQuiz',
            __filename,
          );
        }
      } catch (error) {
        this.logger.error(
          'Öğrenme hedefleri kaydedilirken bir hata oluştu.',
          'QuizzesService.createPersonalizedQuiz',
          __filename,
          undefined,
          error,
        );
        // Hata oluşsa bile sınav oluşturmaya devam etmesi için süreci durdurmuyoruz.
      }

      return quiz;
    } catch (error) {
      this.logger.error(
        `Hızlı sınav oluşturma genel hatası (userId: ${userId}): ${error instanceof Error ? error.message : 'Bilinmeyen hata'}`,
        'QuizzesService.createQuickQuiz',
        __filename,
      );
      throw error;
    }
  }

  /**
   * Kişiselleştirilmiş sınav oluştur
   * @param userId Kullanıcı ID'si
   * @param courseId Kurs ID'si
   * @param subTopics Sınav için seçilen alt konular
   * @param questionCount Soru sayısı
   * @param difficulty Zorluk seviyesi
   * @param documentId Belge ID'si (opsiyonel)
   * @param documentText Belge metni (opsiyonel)
   * @returns Oluşturulan sınav
   */
  @LogMethod({ trackParams: true })
  async createPersonalizedQuiz(
    userId: string,
    courseId: string,
    subTopics: string[],
    questionCount: number = 10,
    difficulty: string = 'medium',
    documentId?: string,
    documentText?: string,
    personalizedQuizType?: string,
  ): Promise<Quiz> {
    const startTime = Date.now();
    const traceId = `personalized-quiz-${startTime}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      this.logger.info(
        `[${traceId}] Kişiselleştirilmiş sınav oluşturma başlatılıyor: ${questionCount} soru, ${difficulty} zorluk, ${subTopics.length} alt konu`,
        'QuizzesService.createPersonalizedQuiz',
        __filename,
        undefined,
        { userId, courseId, subTopics },
      );

      this.flowTracker.trackStep(
        'Kişiselleştirilmiş sınav oluşturma süreci başlatıldı',
        'QuizzesService',
      );

      // 1. Kullanıcının performans verilerini getir
      const weakTopics = await this.getWeakTopicsForUser(userId, courseId);
      const mediumTopics = await this.getMediumTopicsForUser(userId, courseId);
      const failedQuestions = await this.getFailedQuestionsForUserAndCourse(
        userId,
        courseId,
      );

      // 2. Öğrenme hedeflerini getir
      const learningTargets = await this.getLearningTargetsForCourse(
        courseId,
        userId,
      );

      // 3. Performans verileri ve öğrenme hedefleriyle kişiselleştirilmiş sınav oluştur
      const userPerformance = {
        weakTopics: weakTopics.map((t) => t.subTopicName),
        mediumTopics: mediumTopics.map((t) => t.subTopicName),
        failedQuestions: failedQuestions.map((q) => ({
          question: q.questionText,
          correctAnswer: q.correctAnswer,
        })),
      };

      const targetsList = learningTargets.map((t) => ({
        targetId: t.id,
        description: t.subTopicName || '', // Using subTopicName as per the interface
        status: t.status,
      }));

      // 4. AI servisiyle sınav soruları oluştur
      const questions = await this.aiService.generatePersonalizedQuiz(
        subTopics,
        userPerformance,
        questionCount,
        difficulty,
        documentText,
        targetsList,
      );

      this.logger.debug(
        `[${traceId}] Kişiselleştirilmiş sınav soruları oluşturuldu: ${questions.length} soru`,
        'QuizzesService.createPersonalizedQuiz',
        __filename,
        undefined,
        { questionsCount: questions.length },
      );

      // 5. Quiz nesnesini oluştur ama veritabanına kaydetme
      const quizId = this.firebaseService.firestore
        .collection('quizzes')
        .doc().id;
      const timestamp = new Date();

      // Quiz nesnesini oluştur ancak veritabanına kaydetme - kullanıcı sınavı tamamlayana kadar veritabanına kaydedilmeyecek
      const quiz = {
        id: quizId,
        userId,
        quizType: 'personalized',
        personalizedQuizType, // Eklenen parametre
        courseId,
        timestamp,
        questions, // Soruları doğrudan ekle
        selectedSubTopics: subTopics.map((topic) => ({ subTopic: topic })),
        completed: false,
        score: 0,
        correctCount: 0,
        totalQuestions: questions.length,
        elapsedTime: 0,
        userAnswers: {} as Record<string, string>,
        preferences: {
          questionCount,
          difficulty,
          prioritizeWeakAndMediumTopics: true,
        },
        sourceDocument:
          documentId && documentText
            ? {
                documentId,
                fileName: `Döküman #${documentId}`,
                text: documentText.substring(0, 500) + '...', // Özet olarak sadece ilk 500 karakter
              }
            : undefined,
      } as Quiz;

      this.logger.info(
        `[${traceId}] Kişiselleştirilmiş sınav oluşturuldu (henüz kaydedilmedi): ID=${quizId}`,
        'QuizzesService.createPersonalizedQuiz',
        __filename,
        undefined,
        { quizId, userId, questionCount: questions.length },
      );

      // 7. Eğer yeni konulara odaklı bir sınav ise, bu konuları öğrenme hedefi olarak kaydet
      if (personalizedQuizType === 'newTopicFocused' && subTopics.length > 0) {
        try {
          this.logger.info(
            `[${traceId}] Yeni konulara odaklı sınav sonrası öğrenme hedefleri oluşturuluyor. Konu sayısı: ${subTopics.length}`,
            'QuizzesService.createPersonalizedQuiz',
            __filename,
            undefined,
            { userId, courseId, subTopicCount: subTopics.length },
          );

          // SubTopics'i LearningTargetsService'in beklediği formata dönüştür
          const topicsForLearningTargets = subTopics.map((topic) => ({
            subTopicName: topic,
            // Normalize edilmiş adı da ekleyebiliriz, ancak servis kendisi de yapabilir
            normalizedSubTopicName:
              this.normalizationService.normalizeSubTopicName(topic),
          }));

          // LOG: Öğrenme hedefi oluşturma giriş verileri
          this.logLearningTarget(
            LogLevel.INFO,
            `[${traceId}] [START] Öğrenme hedefi oluşturma girişimi`,
            {
              userId,
              courseId,
              personalizedQuizType,
              topicsForLearningTargets,
              function: 'createPersonalizedQuiz',
              step: 'input',
              timestamp: new Date().toISOString(),
            },
          );

          // Öğrenme hedeflerini oluştur
          await this.learningTargetsService.createBatch(
            courseId,
            userId,
            topicsForLearningTargets,
          );

          // LOG: Başarılı kayıt
          this.logLearningTarget(
            LogLevel.INFO,
            `[${traceId}] Öğrenme hedefleri başarıyla oluşturuldu`,
            {
              userId,
              courseId,
              personalizedQuizType,
              topicsForLearningTargets,
            },
          );
        } catch (learningTargetError) {
          // LOG: Hata kaydı
          this.logLearningTarget(
            LogLevel.ERROR,
            `[${traceId}] Öğrenme hedefleri oluşturulurken hata oluştu`,
            {
              userId,
              courseId,
              personalizedQuizType,
              topicsForLearningTargets,
              error:
                learningTargetError instanceof Error
                  ? learningTargetError.message
                  : String(learningTargetError),
            },
          );
        }
      }

      const duration = Date.now() - startTime;
      this.logger.info(
        `[${traceId}] Kişiselleştirilmiş sınav başarıyla oluşturuldu: ${questions.length} soru (${duration}ms)`,
        'QuizzesService.createPersonalizedQuiz',
        __filename,
        undefined,
        { quizId: quizId, questionsCount: questions.length, duration },
      );

      // Quiz nesnesini döndür (veritabanından değil, direkt oluşturulan nesneyi)
      return quiz;
    } catch (error) {
      this.logger.error(
        `[${traceId}] Kişiselleştirilmiş sınav oluşturulurken hata: ${error.message}`,
        'QuizzesService.createPersonalizedQuiz',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  /**
   * Kullanıcının zayıf olduğu konuları getir
   * @private
   */
  private async getWeakTopicsForUser(userId: string, courseId: string) {
    // Firestore'dan zayıf konuları getir
    const snapshot = await this.firebaseService.firestore
      .collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS)
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .where('status', '==', 'failed')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      subTopicName: doc.data().normalizedSubTopicName,
    }));
  }

  /**
   * Kullanıcının orta düzeyde olduğu konuları getir
   * @private
   */
  private async getMediumTopicsForUser(userId: string, courseId: string) {
    // Firestore'dan orta düzey konuları getir
    const snapshot = await this.firebaseService.firestore
      .collection(FIRESTORE_COLLECTIONS.LEARNING_TARGETS)
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .where('status', '==', 'medium')
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      subTopicName: doc.data().normalizedSubTopicName,
    }));
  }

  /**
   * Kurs için öğrenme hedeflerini getir
   * @private
   */
  private async getLearningTargetsForCourse(courseId: string, userId: string) {
    // Firestore'dan öğrenme hedeflerini getir
    return this.learningTargetsService.findByCourse(courseId, userId);
  }

  /**
   * Kullanıcının belirli bir kurstaki yanlış cevapladığı soruları getir
   * @private
   */
  private async getFailedQuestionsForUserAndCourse(
    userId: string,
    courseId: string,
  ) {
    // Firestore'dan yanlış cevaplanan soruları getir
    const snapshot = await this.firebaseService.firestore
      .collection(FIRESTORE_COLLECTIONS.FAILED_QUESTIONS)
      .where('userId', '==', userId)
      .where('courseId', '==', courseId)
      .limit(10) // En fazla 10 yanlış soru
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  /**
   * Bir sınavın sorularını güncelle
   * @param quizId Sınav ID'si
   * @param questions Sorular
   * @private
   */
  private async updateQuizWithQuestions(
    quizId: string,
    questions: QuizQuestion[],
  ) {
    // Firestore'da sınavı güncelle
    await this.firebaseService.firestore
      .collection(FIRESTORE_COLLECTIONS.QUIZZES)
      .doc(quizId)
      .update({
        questions,
        totalQuestions: questions.length,
      });
  }

  /**
   * Sınav verilerini kaydet ve oluşturulan sınavı döndür
   * @private
   */
  private async saveQuiz(params: {
    userId: string;
    quizType: 'quick' | 'personalized';
    personalizedQuizType?: string | null;
    courseId?: string | null;
    sourceDocument?: {
      documentId?: string;
      fileName?: string;
      text?: string;
    } | null;
    selectedSubTopics: any[];
    preferences: {
      questionCount: number;
      difficulty: string;
      timeLimit?: number | null;
      prioritizeWeakAndMediumTopics?: boolean | null;
    };
    questions: any[];
  }): Promise<Quiz> {
    try {
      // Quiz verileri oluştur
      const timestamp = new Date();

      // Log kaydı
      this.logger.logExamProcess(
        `Sınav kaydediliyor: ${params.userId} ID'li kullanıcı, ${params.quizType} türünde`,
        {
          userId: params.userId,
          quizType: params.quizType,
          questionCount: params.questions.length,
          timestamp,
        },
      );

      // Quiz nesnesi oluştur
      const quiz = {
        userId: params.userId,
        quizType: params.quizType,
        personalizedQuizType: params.personalizedQuizType || null,
        courseId: params.courseId || undefined, // Reverted to undefined, will update Quiz interface
        questions: params.questions,
        timestamp,
        selectedSubTopics: params.selectedSubTopics,
        preferences: params.preferences,
        score: 0,
        correctCount: 0,
        totalQuestions: params.questions.length,
        elapsedTime: 0,
        userAnswers: {} as Record<string, string>,
        sourceDocument: params.sourceDocument
          ? {
              documentId: params.sourceDocument.documentId,
              fileName: params.sourceDocument.fileName,
              uploadDate: timestamp,
            }
          : null,
        analysisResult: null,
      };

      // Firestore'a kaydet
      const docRef = await this.firebaseService.firestore
        .collection(FIRESTORE_COLLECTIONS.QUIZZES)
        .add(quiz);

      // ID'yi ekleyerek döndür
      return {
        ...quiz,
        id: docRef.id,
      } as Quiz;
    } catch (error) {
      this.logger.logError(error, 'QuizzesService.saveQuiz', {
        userId: params.userId,
        quizType: params.quizType,
        courseId: params.courseId,
      });
      throw new Error(`Sınav kaydedilemedi: ${error.message}`);
    }
  }

  /**
   * Kişiselleştirilmiş sınavlar için tespit edilen alt konuları öğrenme hedefleri olarak kaydet
   */
  @LogMethod({ trackParams: true })
  private async saveDetectedSubTopicsAsLearningTargets(
    courseId: string,
    userId: string,
    selectedTopics: TopicDto[],
    personalizedQuizType: string,
  ): Promise<void> {
    try {
      this.logger.logExamProcess(
        `${personalizedQuizType} türü kişiselleştirilmiş sınav için ${selectedTopics.length} adet alt konu öğrenme hedefi olarak kaydediliyor`,
        {
          courseId,
          userId,
          personalizedQuizType,
          topicCount: selectedTopics.length,
          rawSelectedTopics: selectedTopics, // Debug için raw veri
        },
      );

      // Alt konuları LearningTargetsService'in beklediği formata çevir
      const topicsForLearningTargets = selectedTopics
        .map((topic, index) => {
          this.logger.logExamProcess(`Topic mapping debug - Index ${index}:`, {
            rawTopic: topic,
            topicType: typeof topic,
            isString: typeof topic === 'string',
            hasSubTopic:
              topic && typeof topic === 'object' && 'subTopic' in topic,
            hasNormalizedSubTopic:
              topic &&
              typeof topic === 'object' &&
              'normalizedSubTopic' in topic,
          });

          return {
            subTopicName: typeof topic === 'string' ? topic : topic.subTopic,
            normalizedSubTopicName:
              typeof topic === 'string' ? undefined : topic.normalizedSubTopic,
          };
        })
        .filter((topic) => topic.subTopicName); // Boş olanları filtrele

      this.logger.logExamProcess(
        `Mapping tamamlandı. Filtrelenmiş topic sayısı: ${topicsForLearningTargets.length}`,
        {
          topicsForLearningTargets,
          originalCount: selectedTopics.length,
          filteredCount: topicsForLearningTargets.length,
        },
      );

      if (topicsForLearningTargets.length === 0) {
        this.logger.logExamProcess(
          `Öğrenme hedefi olarak kaydedilecek geçerli alt konu bulunamadı`,
          { courseId, userId, personalizedQuizType },
        );
        return;
      }

      // LearningTargetsService'teki createBatch metodunu kullanarak otomatik kaydet
      this.logger.logExamProcess(
        `LearningTargetsService.createBatch çağrılıyor`,
        {
          courseId,
          userId,
          topicsForLearningTargets,
        },
      );

      const savedTargets = await this.learningTargetsService.createBatch(
        courseId,
        userId,
        topicsForLearningTargets,
      );

      this.logger.logExamProcess(
        `${savedTargets.length} adet alt konu başarıyla "pending" (beklemede) durumu ile öğrenme hedefi olarak kaydedildi`,
        {
          courseId,
          userId,
          personalizedQuizType,
          savedCount: savedTargets.length,
          requestedCount: topicsForLearningTargets.length,
          savedTargets: savedTargets.map((t) => ({
            id: t.id,
            subTopicName: t.subTopicName,
            status: t.status,
          })),
        },
      );
    } catch (error) {
      // Hata olsa bile sınav oluşturmaya devam et, sadece logla
      this.logger.logError(
        error,
        'QuizzesService.saveDetectedSubTopicsAsLearningTargets',
        {
          courseId,
          userId,
          personalizedQuizType,
          topicCount: selectedTopics.length,
          additionalInfo:
            'Alt konular öğrenme hedefi olarak kaydedilirken hata oluştu - sınav oluşturmaya devam edildi',
        },
      );
    }
  }
}
