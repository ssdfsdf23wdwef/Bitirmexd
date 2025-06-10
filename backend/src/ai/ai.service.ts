import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  TopicDetectionResult,
  QuizQuestion,
  QuizGenerationOptions,
} from './interfaces';

import { LogMethod } from '../common/decorators';
import { TopicDetectionService } from './services/topic-detection.service';
import { QuizGenerationService } from './services/quiz-generation.service';

@Injectable()
export class AiService {
  private readonly llmConfig: any;
  private readonly RETRY_OPTIONS = {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 15000,
    onFailedAttempt: (error: any) => {
      // Hem Error tipini hem de pRetry'nin özel özelliklerini ele al
      const attemptNumber = error.attemptNumber || 1;
      const retriesLeft = error.retriesLeft || 0;
      const errorTraceId = `retry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    },
  };

  constructor(
    private readonly configService: ConfigService,
    private readonly topicDetectionService: TopicDetectionService,
    private readonly quizGenerationService: QuizGenerationService,
  ) {
    // LLM yapılandırmasını config servisinden al
    this.llmConfig = this.configService.get('llm');

    // Yapılandırma bulunamazsa varsayılan değerler kullan
    if (!this.llmConfig) {
      this.llmConfig = {
        provider: 'gemini',
        apiKey: 'AIzaSyCIYYYDSYB_QN00OgoRPQgXR2cUUWCzRmw', // Varsayılan demo anahtar
        model: 'gemini-2.0-flash',
        temperature: 0.7,
        maxTokens: 30024,
      };
    }
  }

  @LogMethod({ trackParams: true })
  async detectTopics(
    documentText: string,
    existingTopics: string[] = [],
    cacheKey?: string,
  ): Promise<TopicDetectionResult> {
    try {
      // TopicDetectionService'e yönlendirerek kodu basitleştiriyoruz
      return await this.topicDetectionService.detectTopics(
        documentText,
        existingTopics,
        cacheKey,
      );
    } catch (error) {
      // Hata loglama ve yeniden fırlatma

      throw error;
    }
  }

  /**
   * Generate quiz questions based on provided topics and options
   */
  @LogMethod({ trackParams: true })
  async generateQuizQuestions(
    options: QuizGenerationOptions,
  ): Promise<QuizQuestion[]> {
    const startTime = Date.now();
    const traceId = `ai-${startTime}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      // Quiz soruları oluştur
      const questions =
        await this.quizGenerationService.generateQuizQuestions(options);

      const duration = Date.now() - startTime;

      return questions;
    } catch (error) {
      throw error;
    }
  }

  async generateQuickQuiz(
    documentText: string,
    subTopics: string[],
    questionCount: number = 10,
    difficulty: string = 'medium',
  ): Promise<QuizQuestion[]> {
    const startTime = Date.now();
    const traceId = `ai-quick-${startTime}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      // Hızlı quiz oluşturma işlemini QuizGenerationService'e devredelim
      const questions =
        await this.quizGenerationService.generateQuickQuizQuestions(
          documentText,
          subTopics,
          questionCount,
          difficulty,
        );

      const duration = Date.now() - startTime;

      return questions;
    } catch (error) {
      throw error;
    }
  }

  async generatePersonalizedQuiz(
    subTopics: string[],
    userPerformance: {
      weakTopics: string[];
      mediumTopics: string[];
      failedQuestions?: { question: string; correctAnswer: string }[];
    },
    questionCount: number = 10,
    difficulty: string = 'medium',
    documentText?: string,
    learningTargets?: {
      targetId: string;
      description: string;
      status: string;
    }[],
  ): Promise<QuizQuestion[]> {
    const startTime = Date.now();
    const traceId = `ai-personalized-${startTime}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      // Kişiselleştirilmiş quiz oluşturma işlemini QuizGenerationService'e devredelim
      const questions =
        await this.quizGenerationService.generatePersonalizedQuizQuestions(
          subTopics,
          userPerformance,
          questionCount,
          difficulty,
          documentText,
          learningTargets,
        );

      return questions;
    } catch (error) {
      throw error;
    }
  }
}
