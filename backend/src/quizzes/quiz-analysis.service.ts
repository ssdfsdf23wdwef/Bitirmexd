import { Injectable, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { AnalysisResult } from '../common/interfaces';
import { LearningTargetsService } from '../learning-targets/learning-targets.service'; // Added import
import { QuizSubmissionDto } from './dto/quiz-submission.dto'; // Added import

@Injectable()
export class QuizAnalysisService {
  private readonly logger = new Logger(QuizAnalysisService.name);
  private readonly quizzesCollection = 'quizzes';
  private readonly quizSubmissionsCollection = 'quizSubmissions'; // Added for storing submission

  constructor(
    private firebaseService: FirebaseService,
    private learningTargetsService: LearningTargetsService, // Added injection
  ) {}

  /**
   * Analyzes a quiz submission, persists the results, and updates learning targets.
   * @param userId The ID of the user who submitted the quiz.
   * @param quizId The ID of the quiz.
   * @param submission The user's quiz submission details.
   * @returns The analysis result.
   */
  async analyzeAndPersistResults(
    userId: string,
    quizId: string,
    submission: QuizSubmissionDto, // Use DTO for submission type
  ): Promise<AnalysisResult> {
    this.logger.log(
      `Analyzing quiz results for user ${userId}, quiz ${quizId}`,
    );

    // 1. Fetch the complete quiz data
    const quiz = await this.firebaseService.getDocumentById<
      any // Replace 'any' with a proper Quiz interface/type if available
    >(this.quizzesCollection, quizId);

    if (!quiz || !quiz.questions) {
      this.logger.error(`Quiz not found or has no questions: ${quizId}`);
      throw new Error('Quiz data is incomplete or not found.');
    }

    // 2. Analyze the results using the existing helper method
    // The existing analyzeQuizResults seems to expect userAnswers as Record<string, string>
    // and questions array directly.
    const { analysisResult, topicScores, failedQuestions } = this.analyzeQuizResults(
      quiz.questions, // Assuming quiz.questions is an array of question objects
      submission.answers, // submission.answers should be Record<string, string>
    );

    // 3. Persist the submission details (optional, but good practice)
    const submissionData = {
      userId,
      quizId,
      submittedAt: new Date(),
      answers: submission.answers,
      analysis: analysisResult, // Store the detailed analysis with the submission
      failedQuestions, // Store failed questions for review
    };
    await this.firebaseService.addDocument(
      this.quizSubmissionsCollection,
      submissionData,
    );

    // 4. Call LearningTargetsService to persist/update learning targets
    await this.learningTargetsService.createOrUpdateFromQuizResults(
      userId,
      topicScores, // Pass the calculated topicScores
    );

    this.logger.log(
      `Successfully analyzed and persisted results for user ${userId}, quiz ${quizId}`,
    );

    return analysisResult;
  }

  /**
   * Analyze quiz results to calculate scores, create topic-based analysis
   * PRD 7.6'ya göre düzenlenmiş AnalysisResult yapısı döndürür
   */
  analyzeQuizResults(questions: any[], userAnswers: Record<string, string>) {
    const totalQuestions = questions.length;
    let correctCount = 0;

    // Her alt konu için performans verisi
    const topicResults: Record<
      string,
      {
        correct: number;
        total: number;
        subTopicName: string;
        normalizedSubTopicName: string;
        questions: any[];
      }
    > = {};

    // Zorluk seviyesine göre performans verisi
    const difficultyResults: Record<
      string,
      {
        correct: number;
        total: number;
      }
    > = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      hard: { correct: 0, total: 0 },
    };

    // Yanlış cevaplanan sorular listesi
    const failedQuestions: any[] = [];

    // Process each question
    for (const question of questions) {
      const questionId = question.id;
      const userAnswer = userAnswers[questionId];
      const isCorrect = userAnswer === question.correctAnswer;
      const difficulty = question.difficulty || 'medium';

      // Increment correct count if answer is correct
      if (isCorrect) {
        correctCount++;
      } else {
        // Add to failed questions list for later saving to DB
        failedQuestions.push({
          questionId,
          questionText: question.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          userAnswer,
          subTopicName: question.subTopicName,
          normalizedSubTopicName: question.normalizedSubTopicName,
          difficulty: difficulty,
        });
      }

      // Group results by topic
      const normalizedSubTopicName = question.normalizedSubTopicName || question.subTopicName || 'unknown_topic';
      if (!topicResults[normalizedSubTopicName]) {
        topicResults[normalizedSubTopicName] = {
          correct: 0,
          total: 0,
          subTopicName: question.subTopicName || 'Unknown Topic',
          normalizedSubTopicName,
          questions: [],
        };
      }

      // Update topic stats
      topicResults[normalizedSubTopicName].total++;
      if (isCorrect) {
        topicResults[normalizedSubTopicName].correct++;
      }

      // Update difficulty stats
      if (!difficultyResults[difficulty]) {
        difficultyResults[difficulty] = { correct: 0, total: 0 };
      }
      difficultyResults[difficulty].total++;
      if (isCorrect) {
        difficultyResults[difficulty].correct++;
      }

      // Add question details to topic results
      topicResults[normalizedSubTopicName].questions.push({
        id: questionId,
        questionText: question.questionText,
        correctAnswer: question.correctAnswer,
        userAnswer,
        isCorrect,
        explanation: question.explanation,
      });
    }

    // Calculate overall score percentage
    const score =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;

    // PRD 7.6: performanceBySubTopic - Alt konu bazlı performans
    const performanceBySubTopic = Object.entries(topicResults).reduce(
      (result, [normalizedSubTopic, data]) => {
        const scorePercent = (data.correct / data.total) * 100;
        let status: 'failed' | 'medium' | 'mastered';

        // PRD 4.5.2'ye göre durum belirleme
        if (scorePercent < 50) {
          status = 'failed';
        } else if (scorePercent < 70) {
          status = 'medium';
        } else {
          status = 'mastered';
        }

        result[normalizedSubTopic] = {
          subTopicName: data.subTopicName,
          scorePercent,
          status,
          questionCount: data.total,
          correctCount: data.correct,
          questions: data.questions,
        };

        return result;
      },
      {} as Record<string, any>,
    );

    // PRD 7.6: performanceCategorization - Duruma göre sınıflandırma
    const performanceCategorization = {
      failed: [] as string[],
      medium: [] as string[],
      mastered: [] as string[],
    };

    Object.values(performanceBySubTopic).forEach((topic: any) => {
      performanceCategorization[topic.status].push(topic.subTopicName);
    });

    // PRD 7.6: performanceByDifficulty - Zorluk bazlı performans
    const performanceByDifficulty = Object.entries(difficultyResults).reduce(
      (result, [difficulty, data]) => {
        if (data.total > 0) {
          result[difficulty] = {
            count: data.total,
            correct: data.correct,
            scorePercent: (data.correct / data.total) * 100,
          };
        }
        return result;
      },
      {} as Record<string, any>,
    );

    // Generate recommendations based on performance
    const recommendations: string[] = [];

    if (performanceCategorization.failed.length > 0) {
      recommendations.push(
        `Başarısız olduğunuz konulara odaklanın: ${performanceCategorization.failed.join(', ')}`,
      );
    }

    if (performanceCategorization.medium.length > 0) {
      recommendations.push(
        `Geliştirilmesi gereken konular: ${performanceCategorization.medium.join(', ')}`,
      );
    }

    if (score < 50) {
      recommendations.push(
        'Temel kavramları tekrar gözden geçirmeniz önerilir.',
      );
    } else if (score < 70) {
      recommendations.push(
        'İyi bir çalışma gösterdiniz ancak geliştirilmesi gereken alanlar var.',
      );
    } else {
      recommendations.push(
        'Konuları iyi anlamışsınız. Yeni konulara geçebilirsiniz.',
      );
    }

    // PRD 7.6'ya göre AnalysisResult yapısı
    const analysisResult: AnalysisResult = {
      overallScore: score,
      performanceBySubTopic,
      performanceCategorization,
      performanceByDifficulty,
      recommendations,
    };

    // Ayrıca LearningTargets servisine verilecek topicScores verisi
    const topicScores = Object.values(performanceBySubTopic).map(
      (topic: any) => ({
        normalizedSubTopicName: (topic.subTopicName || 'unknown')
          .toString()
          .toLowerCase()
          .replace(/\s+/g, '_'),
        scorePercent: topic.scorePercent || 0,
      }),
    );

    return {
      score,
      correctCount,
      totalQuestions,
      analysisResult,
      failedQuestions,
      topicScores,
    };
  }
}
