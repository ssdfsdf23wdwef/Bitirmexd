import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { AIProviderService } from '../providers/ai-provider.service';
import { NormalizationService } from '../../shared/normalization/normalization.service';
import { TopicDetectionResult } from '../interfaces';
import * as path from 'path';
import * as fs from 'fs';
import { LoggerService } from '../../common/services/logger.service';
import { FlowTrackerService } from '../../common/services/flow-tracker.service';
import { PromptManagerService } from './prompt-manager.service';
import pRetry from 'p-retry';
import {
  TopicDetectionAiResponseSchema,
  FinalNormalizedTopicDetectionResultSchema,
} from '../schemas/topic-detection.schema';

@Injectable()
export class TopicDetectionService {
  private readonly logger: LoggerService;
  private readonly flowTracker: FlowTrackerService;
  private readonly MAX_RETRIES = 3;

  // Sonuç format şeması
  private readonly NEW_TOPICS_RESULT_SCHEMA = {
    type: 'object',
    properties: {
      newly_identified_topics: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['newly_identified_topics'],
  };

  // Varsayılan Türkçe konu tespiti prompt'u
  private readonly DEFAULT_TOPIC_DETECTION_PROMPT_TR = `
## GÖREV: Eğitim Materyalinden Konuları ve Alt Konuları Algılama

Aşağıdaki eğitim materyali metnini analiz et ve içindeki ana konuları ve alt konuları tespit et.

### Talimatlar:
1. Metni okuyarak ana konuları ve bunlara ait alt konuları belirle
2. Her ana konunun altında, o konuyla ilgili alt konuları listele
3. Çok genel konulardan kaçın, mümkün olduğunca spesifik ol
4. Metinde geçen terimler ve kavramlar arasındaki ilişkileri koru
5. En önemli/belirgin 5-10 konu ve alt konuyu belirle

### Yanıt Formatı:
Sonuçları JSON formatında, aşağıdaki yapıda döndür:

\`\`\`json
{
  "topics": [
    {
      "mainTopic": "Ana Konu Adı 1",
      "subTopics": ["Alt Konu 1.1", "Alt Konu 1.2"]
    },
    {
      "mainTopic": "Ana Konu Adı 2",
      "subTopics": ["Alt Konu 2.1", "Alt Konu 2.2"]
    }
  ]
}
\`\`\`

Sadece JSON döndür, başka açıklama yapma.
`;

  private readonly RETRY_OPTIONS = {
    retries: 3,
    factor: 2,
    minTimeout: 1000,
    maxTimeout: 15000,
    onFailedAttempt: (error: any) => {
      const attemptNumber = error.attemptNumber || 1;
      const retriesLeft = error.retriesLeft || 0;
      const errorTraceId = `retry-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      this.logger.warn(
        `[${errorTraceId}] AI çağrısı ${attemptNumber}. denemede başarısız oldu. ${retriesLeft} deneme kaldı. Hata: ${error.message}`,
        'TopicDetectionService.RETRY_OPTIONS.onFailedAttempt',
        __filename,
      );
    },
  };

  constructor(
    private readonly aiProviderService: AIProviderService,
    private readonly normalizationService: NormalizationService,
    private readonly promptManagerService: PromptManagerService,
  ) {
    this.logger = LoggerService.getInstance();
    this.flowTracker = FlowTrackerService.getInstance();
  }

  /**
   * Detect topics from the provided document text
   */
  async detectTopics(
    documentText: string,
    existingTopics: string[] = [],
    cacheKey?: string,
  ): Promise<TopicDetectionResult> {
    const processingStartTime = Date.now();
    const traceId = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      this.logger.debug(
        `[${traceId}] AI servisi metin analizi başlatılıyor (${documentText.length} karakter)`,
        'TopicDetectionService.detectTopics',
        __filename,
      );

      this.flowTracker.trackStep(
        'Dokümandan konular algılanıyor',
        'TopicDetectionService',
      );

      // Eğer metin çok kısaysa uyarı ver
      if (documentText.length < 100) {
        this.logger.warn(
          `[${traceId}] Analiz için çok kısa metin (${documentText.length} karakter). Minimum önerilen: 100 karakter`,
          'TopicDetectionService.detectTopics',
          __filename,
        );
        // Çok kısa metinler için hata fırlatmak yerine sadece uyarı logla ve devam et
      }

      // Önbellek kontrolü - eğer cacheKey verilmişse
      if (cacheKey) {
        this.logger.debug(
          `[${traceId}] Önbellek anahtarı ile kontrol: ${cacheKey}`,
          'TopicDetectionService.detectTopics',
          __filename,
        );
      }

      // Truncate document text if too long
      const maxTextLength = 15000;
      let truncatedText = documentText;
      let isTextTruncated = false;

      if (documentText.length > maxTextLength) {
        const originalLength = documentText.length;
        truncatedText = documentText.slice(0, maxTextLength) + '...';
        isTextTruncated = true;

        this.logger.warn(
          `[${traceId}] Metin çok uzun, ${maxTextLength} karaktere kısaltıldı (orijinal: ${originalLength} karakter)`,
          'TopicDetectionService.detectTopics',
          __filename,
        );
      }

      // Building the prompt using the content from detect-topics-tr.txt file
      const promptFilePath = path.resolve(
        __dirname,
        '..',
        'prompts',
        'detect-topics-tr.txt',
      );
      let promptContent = '';
      let promptSource = 'file';

      try {
        promptContent = fs.readFileSync(promptFilePath, 'utf8');
      } catch (error) {
        promptSource = 'default';
        this.logger.error(
          `[${traceId}] Prompt dosyası okuma hatası: ${error.message}, varsayılan prompt kullanılacak`,
          'TopicDetectionService.detectTopics',
          __filename,
          undefined,
          error,
        );

        this.logger.info(
          `[${traceId}] Varsayılan prompt kullanılıyor (${this.DEFAULT_TOPIC_DETECTION_PROMPT_TR.length} karakter)`,
          'TopicDetectionService.detectTopics',
          __filename,
        );

        promptContent = this.DEFAULT_TOPIC_DETECTION_PROMPT_TR;
      }

      // Append the document text to the prompt
      const prompt = `${promptContent}\n\n**Input Text to Analyze:**\n${truncatedText}`;

      // Build existing topics list if any
      const existingTopicsText =
        existingTopics.length > 0
          ? `\n\nExisting topics: ${existingTopics.join(', ')}`
          : '';

      // Combine prompt with existing topics
      const fullPrompt = prompt + existingTopicsText;

      this.logger.debug(
        `[${traceId}] Hazırlanan prompt uzunluğu: ${fullPrompt.length} karakter`,
        'TopicDetectionService.detectTopics',
        __filename,
      );

      // Track the AI service being used
      this.flowTracker.trackStep(
        `Konular tespit ediliyor`,
        'TopicDetectionService',
      );

      let result: TopicDetectionResult = { topics: [] };

      // Her durumda yeniden deneme mekanizması kullan
      this.logger.info(
        `[${traceId}] AI modeli çağrısı başlatılıyor`,
        'TopicDetectionService.detectTopics',
        __filename,
      );

      const aiCallStartTime = Date.now();

      // AI isteğini gerçekleştir
      result = await pRetry(async () => {
        const aiResponseText =
          await this.aiProviderService.generateContent(fullPrompt);

        const parsedResponse = this.parseJsonResponse<any>(aiResponseText.text); // Tipini any yapıp validasyona bırakalım

        try {
          TopicDetectionAiResponseSchema.parse(parsedResponse); // Zod ile validasyon
        } catch (validationError) {
          this.logger.error(
            `[${traceId}] AI yanıtı şema validasyonundan geçemedi: ${validationError.message}`,
            'TopicDetectionService.detectTopics.ZodValidation',
            __filename,
            undefined,
            validationError,
            { rawResponse: aiResponseText.text.substring(0, 1000) }, // Yanıtın ilk 1000 karakterini logla
          );
          // Zod hatalarını daha okunabilir hale getir
          const errorMessages = validationError.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join('; ');
          throw new BadRequestException(
            `AI yanıtı geçersiz formatta: ${errorMessages}`,
          );
        }

        // Validasyondan geçtiyse, normalizasyona devam et
        return this.normalizeTopicResult(parsedResponse);
      }, this.RETRY_OPTIONS);

      const aiCallDuration = Date.now() - aiCallStartTime;

      this.logger.info(
        `[${traceId}] AI modeli yanıt verdi (${aiCallDuration}ms)`,
        'TopicDetectionService.detectTopics',
        __filename,
      );

      // Normalizasyon sonrası sonucu da valide edelim (opsiyonel ama iyi bir pratik)
      try {
        FinalNormalizedTopicDetectionResultSchema.parse(result);
      } catch (normalizationValidationError) {
        this.logger.error(
          `[${traceId}] Normalleştirilmiş konu sonucu şema validasyonundan geçemedi: ${normalizationValidationError.message}`,
          'TopicDetectionService.detectTopics.NormalizationValidation',
          __filename,
          undefined,
          normalizationValidationError,
          { normalizedResult: result },
        );
        // Bu noktada bir hata fırlatmak yerine uyarı logu ile devam edilebilir veya default bir sonuç döndürülebilir.
        // Şimdilik loglayıp devam edelim, çünkü ana validasyon AI yanıtı için yapıldı.
      }

      // Check if we got valid results (Bu kontrol Zod ile yapıldığı için gerek kalmayabilir veya daha basit hale getirilebilir)
      if (!result || !result.topics || !Array.isArray(result.topics)) {
        // ... (Bu kısım Zod validasyonu sonrası muhtemelen gereksiz olacak veya uyarıya dönüşecek)
      }

      // Sonuç boşsa veya çok az konu içeriyorsa uyarı log'u
      if (result.topics.length === 0) {
        this.logger.warn(
          `[${traceId}] Belgede hiçbir konu algılanamadı`,
          'TopicDetectionService.detectTopics',
          __filename,
        );
      } else if (result.topics.length < 3 && documentText.length > 1000) {
        this.logger.warn(
          `[${traceId}] Uzun belgede çok az konu algılandı (${result.topics.length})`,
          'TopicDetectionService.detectTopics',
          __filename,
        );
      }

      // Log işleme süresini
      const processingDuration = Date.now() - processingStartTime;
      this.logger.debug(
        `[${traceId}] Konular başarıyla algılandı (${result.topics.length} konu, ${processingDuration}ms)`,
        'TopicDetectionService.detectTopics',
        __filename,
      );

      // Tespit edilen konuları console'da göstermek için detaylı log
      console.log('\n=== TESPİT EDİLEN KONULAR ===');
      if (result.topics.length > 0) {
        result.topics.forEach((topic, index) => {
          console.log(`\n[${index + 1}] ${topic.subTopicName}`);
          if (topic.parentTopic) {
            console.log(`  Ana Konu: ${topic.parentTopic}`);
          }
          if (topic.isMainTopic) {
            console.log('  [Ana Konu]');
          }
        });
      } else {
        console.log('Hiçbir konu tespit edilemedi.');
      }
      console.log('\n============================\n');

      return result;
    } catch (error) {
      this.logger.error(
        `[${traceId}] Konu tespiti sırasında hata: ${error.message}`,
        'TopicDetectionService.detectTopics',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  /**
   * Detect new and unique topics that are not in the existing topics list
   * @param lessonContext The context or description of the lesson
   * @param existingTopicNames Array of existing topic names to exclude
   * @returns Array of newly identified unique topic names
   */
  async detectExclusiveNewTopics(
    lessonContext: string,
    existingTopicNames: string[] = [],
  ): Promise<string[]> {
    const traceId = `exclusive-topics-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const processingStartTime = Date.now();
    const operationId = `detect-exclusive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    console.group(
      `🔍 AI Service: Detect Exclusive New Topics [${operationId}]`,
    );
    console.log(`🕐 AI Service Start Time: ${new Date().toISOString()}`);
    console.log(`🏷️ Operation ID: ${operationId}`);
    console.log(`🆔 Trace ID: ${traceId}`);
    console.log(
      `📄 Lesson Context Length: ${lessonContext?.length || 0} characters`,
    );
    console.log(`📋 Existing Topics Count: ${existingTopicNames.length}`);

    if (existingTopicNames.length > 0) {
      console.log(`📝 Existing Topics List:`);
      existingTopicNames.forEach((topic, index) => {
        console.log(`  ${index + 1}. "${topic}"`);
      });
    } else {
      console.log(`📝 No existing topics provided`);
    }

    try {
      this.logger.debug(
        `[${traceId}] Özel yeni konu tespiti başlatılıyor - Ders bağlamı: ${lessonContext?.length || 0} karakter, Mevcut konu sayısı: ${existingTopicNames.length}`,
        'TopicDetectionService.detectExclusiveNewTopics',
        __filename,
      );

      // Load the exclusive new topics detection prompt
      console.log(`\n🔧 Loading exclusive new topics detection prompt...`);
      const promptLoadStartTime = performance.now();

      let promptTemplate: string;
      try {
        promptTemplate = await this.promptManagerService.loadPrompt(
          'detect_new_topics_exclusive_tr.txt',
        );
        const promptLoadDuration = performance.now() - promptLoadStartTime;

        console.log(`✅ Prompt loaded successfully`);
        console.log(`📏 Prompt Length: ${promptTemplate.length} characters`);
        console.log(
          `⏱️ Prompt Load Duration: ${promptLoadDuration.toFixed(2)}ms`,
        );

        this.logger.debug(
          `[${traceId}] Özel yeni konu prompt'u başarıyla yüklendi (${promptTemplate.length} karakter)`,
          'TopicDetectionService.detectExclusiveNewTopics',
          __filename,
        );
      } catch (error) {
        const promptLoadDuration = performance.now() - promptLoadStartTime;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        console.error(
          `❌ Failed to load prompt after ${promptLoadDuration.toFixed(2)}ms:`,
          errorMessage,
        );
        console.groupEnd();

        this.logger.error(
          `[${traceId}] Özel yeni konu prompt dosyası yüklenemedi: ${error.message}`,
          'TopicDetectionService.detectExclusiveNewTopics',
          __filename,
          undefined,
          error,
        );
        return [];
      }

      // Prepare variables for prompt compilation
      console.log(`\n🔄 Preparing prompt variables...`);
      const existingTopicsString =
        existingTopicNames.length > 0 ? existingTopicNames.join(', ') : 'Yok';

      const variables = {
        lessonContext: lessonContext || 'Belirtilmemiş',
        existingTopics: existingTopicsString,
      };

      console.log(`📝 Variables Prepared:`);
      console.log(
        `  - Lesson Context: ${variables.lessonContext.length} characters`,
      );
      console.log(`  - Existing Topics: "${variables.existingTopics}"`);

      // Compile the prompt with variables
      console.log(`\n🔧 Compiling prompt with variables...`);
      const promptCompileStartTime = performance.now();

      const compiledPrompt = this.promptManagerService.compilePrompt(
        promptTemplate,
        variables,
      );
      const promptCompileDuration = performance.now() - promptCompileStartTime;

      console.log(`✅ Prompt compiled successfully`);
      console.log(
        `📏 Compiled Prompt Length: ${compiledPrompt.length} characters`,
      );
      console.log(
        `⏱️ Prompt Compile Duration: ${promptCompileDuration.toFixed(2)}ms`,
      );

      this.logger.debug(
        `[${traceId}] Prompt başarıyla derlendi (${compiledPrompt.length} karakter)`,
        'TopicDetectionService.detectExclusiveNewTopics',
        __filename,
      );

      // Track the process
      this.flowTracker.trackStep(
        'Özel yeni konular tespit ediliyor',
        'TopicDetectionService',
      );

      // Call AI service with retry mechanism
      console.log(`\n🤖 Calling AI Provider Service with retry mechanism...`);
      const aiCallStartTime = performance.now();

      let aiResponse: string;
      try {
        console.log(
          `🔄 Starting AI call with retry options:`,
          this.RETRY_OPTIONS,
        );

        const aiCallResult = await pRetry(async () => {
          const callStartTime = performance.now();
          console.log(`🚀 AI Provider call attempt starting...`);

          const response =
            await this.aiProviderService.generateContent(compiledPrompt);

          const callDuration = performance.now() - callStartTime;
          console.log(
            `✅ AI Provider call successful in ${callDuration.toFixed(2)}ms`,
          );
          console.log(
            `📄 Response Length: ${response.text?.length || 0} characters`,
          );

          return response.text;
        }, this.RETRY_OPTIONS);

        aiResponse = aiCallResult;
        const totalAiCallDuration = performance.now() - aiCallStartTime;

        console.log(`✅ AI service call completed successfully`);
        console.log(
          `⏱️ Total AI Call Duration: ${totalAiCallDuration.toFixed(2)}ms`,
        );
        console.log(
          `📊 AI Response Preview: "${aiResponse?.substring(0, 200)}..."`,
        );
      } catch (error) {
        const totalAiCallDuration = performance.now() - aiCallStartTime;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';

        console.error(
          `❌ AI service call failed after ${totalAiCallDuration.toFixed(2)}ms:`,
          errorMessage,
        );
        console.groupEnd();

        this.logger.error(
          `[${traceId}] AI servisi çağrısı başarısız oldu: ${error.message}`,
          'TopicDetectionService.detectExclusiveNewTopics',
          __filename,
          undefined,
          error,
        );
        return [];
      }

      // Parse AI response with enhanced error handling
      console.log(`\n🔍 Parsing AI response...`);
      const parseStartTime = performance.now();

      let parsedResponse: { newly_identified_topics?: string[] };
      try {
        console.log(`🔄 Attempting primary JSON parsing...`);
        // Try to parse the JSON response
        parsedResponse = this.parseJsonResponse<{
          newly_identified_topics?: string[];
        }>(aiResponse);

        const parseDuration = performance.now() - parseStartTime;
        console.log(
          `✅ Primary JSON parsing successful in ${parseDuration.toFixed(2)}ms`,
        );
        console.log(
          `📊 Parsed Response Structure:`,
          JSON.stringify(parsedResponse, null, 2),
        );
      } catch (parseError) {
        console.log(
          `⚠️ Primary JSON parsing failed, attempting fallback parsing...`,
        );
        console.log(`❌ Parse Error:`, parseError.message);

        // Enhanced error logging with more context
        this.logger.error(
          `[${traceId}] AI yanıtı JSON parse edilemedi: ${parseError.message}`,
          'TopicDetectionService.detectExclusiveNewTopics',
          __filename,
          undefined,
          parseError,
          {
            aiResponse: aiResponse?.substring(0, 500),
            parseErrorStack: parseError.stack,
          },
        );

        // Attempt to extract JSON manually as a fallback
        try {
          console.log(`🔧 Attempting manual JSON extraction...`);
          // Extract any JSON-like structure using regex
          const jsonMatch = aiResponse.match(/\{[\s\S]*\}/); // Match everything between curly braces
          if (jsonMatch) {
            const jsonStr = jsonMatch[0];
            console.log(
              `📝 Extracted JSON String: "${jsonStr.substring(0, 200)}..."`,
            );

            // Clean and repair the extracted JSON
            console.log(`🧹 Cleaning and repairing JSON...`);
            const cleanedJson = this.cleanJsonString(jsonStr);
            const balancedJson = this.balanceBrackets(cleanedJson);
            const repairedJson = this.repairJsonString(balancedJson);

            console.log(
              `🔧 Repaired JSON: "${repairedJson.substring(0, 200)}..."`,
            );

            this.logger.info(
              `[${traceId}] JSON parse hatasından sonra düzeltilmiş JSON ile yeniden deneniyor`,
              'TopicDetectionService.detectExclusiveNewTopics',
              __filename,
            );

            // Try parsing the repaired JSON
            parsedResponse = JSON.parse(repairedJson);

            const parseDuration = performance.now() - parseStartTime;
            console.log(
              `✅ Fallback JSON parsing successful in ${parseDuration.toFixed(2)}ms`,
            );
            console.log(
              `📊 Fallback Parsed Response:`,
              JSON.stringify(parsedResponse, null, 2),
            );
          } else {
            // If no JSON structure is found, create a minimal valid structure
            console.log(`❌ No JSON structure found in AI response`);
            console.groupEnd();

            this.logger.warn(
              `[${traceId}] AI yanıtında JSON yapısı bulunamadı, boş sonuç döndürülüyor`,
              'TopicDetectionService.detectExclusiveNewTopics',
              __filename,
            );
            return [];
          }
        } catch (fallbackError) {
          const parseDuration = performance.now() - parseStartTime;
          const fallbackErrorMessage =
            fallbackError instanceof Error
              ? fallbackError.message
              : 'Unknown error';

          console.error(
            `❌ Fallback JSON parsing also failed after ${parseDuration.toFixed(2)}ms:`,
            fallbackErrorMessage,
          );
          console.groupEnd();

          // If fallback parsing also fails, log and return empty array
          this.logger.error(
            `[${traceId}] Düzeltilmiş JSON ile yeniden deneme de başarısız oldu: ${fallbackError.message}`,
            'TopicDetectionService.detectExclusiveNewTopics',
            __filename,
            undefined,
            fallbackError,
          );

          // Throw a more descriptive HTTP exception
          throw new BadRequestException(
            `AI yanıtı parse edilemedi: ${parseError.message}. Lütfen daha sonra tekrar deneyin.`,
          );
        }
      }

      // Extract newly identified topics
      console.log(`\n📊 Extracting newly identified topics...`);
      const newlyIdentifiedTopics =
        parsedResponse?.newly_identified_topics || [];
      console.log(
        `📋 Raw Topics from AI: ${Array.isArray(newlyIdentifiedTopics) ? newlyIdentifiedTopics.length : 'Not an array'}`,
      );

      if (
        Array.isArray(newlyIdentifiedTopics) &&
        newlyIdentifiedTopics.length > 0
      ) {
        console.log(`📝 Raw Topics List:`);
        newlyIdentifiedTopics.forEach((topic, index) => {
          console.log(`  ${index + 1}. "${topic}" (type: ${typeof topic})`);
        });
      }

      // Validate that result is an array
      if (!Array.isArray(newlyIdentifiedTopics)) {
        console.log(
          `❌ newly_identified_topics is not an array: ${typeof newlyIdentifiedTopics}`,
        );
        console.groupEnd();

        this.logger.warn(
          `[${traceId}] AI yanıtında newly_identified_topics bir dizi değil: ${typeof newlyIdentifiedTopics}`,
          'TopicDetectionService.detectExclusiveNewTopics',
          __filename,
        );
        return [];
      }

      // Filter out invalid entries and clean topic names
      console.log(`\n🧹 Cleaning and filtering topics...`);
      const filterStartTime = performance.now();

      const cleanedTopics = newlyIdentifiedTopics
        .filter((topic: any) => {
          const isValid = typeof topic === 'string' && topic.trim().length > 0;
          if (!isValid) {
            console.log(
              `🗑️ Filtering out invalid topic: "${topic}" (type: ${typeof topic})`,
            );
          }
          return isValid;
        })
        .map((topic: string) => {
          const originalTopic = topic;
          const cleanedTopic = this.cleanTopicName(topic);
          if (originalTopic !== cleanedTopic) {
            console.log(
              `🧹 Cleaned topic: "${originalTopic}" -> "${cleanedTopic}"`,
            );
          }
          return cleanedTopic;
        })
        .filter((topic: string) => {
          const isValid = topic.length > 0;
          if (!isValid) {
            console.log(`🗑️ Filtering out empty cleaned topic`);
          }
          return isValid;
        });

      const filterDuration = performance.now() - filterStartTime;
      console.log(
        `✅ Topic cleaning completed in ${filterDuration.toFixed(2)}ms`,
      );
      console.log(`📊 Final Cleaned Topics Count: ${cleanedTopics.length}`);

      const processingDuration = Date.now() - processingStartTime;
      const totalDuration = performance.now() - processingStartTime;

      console.log(`\n📈 Final Results:`);
      console.log(`✅ Detection completed successfully`);
      console.log(`📊 New Topics Found: ${cleanedTopics.length}`);
      console.log(
        `⏱️ Total Processing Duration: ${totalDuration.toFixed(2)}ms`,
      );

      this.logger.info(
        `[${traceId}] Özel yeni konu tespiti tamamlandı - ${cleanedTopics.length} yeni konu bulundu (${processingDuration}ms)`,
        'TopicDetectionService.detectExclusiveNewTopics',
        __filename,
      );

      // Log detected topics for debugging
      if (cleanedTopics.length > 0) {
        console.log(`\n🎯 Newly Detected Topics:`);
        cleanedTopics.forEach((topic, index) => {
          console.log(`  ${index + 1}. "${topic}"`);
        });

        console.log('\n=== YENİ TESPİT EDİLEN KONULAR ===');
        cleanedTopics.forEach((topic, index) => {
          console.log(`[${index + 1}] ${topic}`);
        });
        console.log('==================================\n');
      } else {
        console.log(`\n⚠️ No new topics detected`);
        console.log('\n=== HİÇBİR YENİ KONU TESPİT EDİLEMEDİ ===\n');
      }

      console.groupEnd();
      return cleanedTopics;
    } catch (error) {
      const totalDuration = performance.now() - processingStartTime;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error(
        `❌ Exclusive New Topics Detection Error after ${totalDuration.toFixed(2)}ms:`,
        errorMessage,
      );
      console.error(`📊 Error Details:`, error);
      console.groupEnd();

      this.logger.error(
        `[${traceId}] Özel yeni konu tespiti sırasında beklenmeyen hata: ${error.message}`,
        'TopicDetectionService.detectExclusiveNewTopics',
        __filename,
        undefined,
        error,
      );
      return [];
    }
  }

  /**
   * Generate default topics from text when AI parsing fails
   * @param text The document text to extract topics from
   * @returns A basic topic structure
   */
  private generateDefaultTopics(text: string): { topics: any[] } {
    try {
      // Belge başlığını bulmaya çalış
      const titleMatch = text.match(/^(.*?)[\n\r]/);
      let documentTitle = titleMatch && titleMatch[1].trim();
      if (
        !documentTitle ||
        documentTitle.length < 3 ||
        documentTitle.length > 100
      ) {
        documentTitle = 'Belge İçeriği';
      }

      // Kuantum mekanikleri, Nanoteknoloji vb. anahtar kelimeleri bulmaya çalış
      const keywordMatches = text.match(
        /kuantum|nanoteknoloji|mekanik|elektron|atom|molekül|orbit|fizik/gi,
      );
      const keywordsFound = keywordMatches
        ? Array.from(new Set(keywordMatches)).slice(0, 5)
        : [];

      // Metin içinden en sık geçen anlamlı kelimeleri bul (stopword filtrelemesi uygula)
      const stopwords = [
        've',
        'veya',
        'için',
        'ile',
        'bir',
        'bu',
        'da',
        'de',
        'çok',
        'daha',
        'gibi',
        'kadar',
      ];
      const words = text
        .split(/\s+/)
        .filter((word) => word.length > 5) // En az 5 karakterli kelimeleri al
        .map((word) => word.replace(/[^\wğüşıöçĞÜŞİÖÇ]/g, '').toLowerCase()) // Alfanümerik olmayan karakterleri temizle
        .filter((word) => word.length > 0 && !stopwords.includes(word)); // Boş kelimeleri ve stopword'leri filtrele

      // Kelime frekansını hesapla
      const wordFrequency: Record<string, number> = {};
      words.forEach((word) => {
        wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      });

      // En sık kullanılan 5 kelimeyi al
      const topWords = Object.entries(wordFrequency)
        .sort((a, b) => b[1] - a[1]) // Frekansa göre sırala
        .slice(0, 7) // İlk 7'yi al
        .map((entry) => entry[0]); // Sadece kelimeleri al

      // Doküman metninden en alakalı konuları çıkarmaya çalış (kuantum mekaniği, nano sistemler vs)
      const potentialTopics = [
        'Kuantum Mekaniği',
        'Elektronik Yapılar',
        'Atomik Orbitaller',
        'Dalga Fonksiyonları',
        'Moleküler Orbitaller',
      ];

      const relevantTopics = potentialTopics.filter((topic) =>
        text.toLowerCase().includes(topic.toLowerCase()),
      );

      // Dokümana özgü konu başlıkları oluştur
      const documentTopics: Array<{ mainTopic: string; subTopics: string[] }> =
        [];

      // Belge başlığını ana konu olarak ekle
      documentTopics.push({
        mainTopic: this.cleanTopicName(documentTitle),
        subTopics: keywordsFound.map((word) =>
          this.cleanTopicName(
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
          ),
        ),
      });

      // Dokümandan çıkarılan konu başlıklarını ekle
      if (relevantTopics.length > 0) {
        documentTopics.push({
          mainTopic: 'Tespit Edilen Fizik Konuları',
          subTopics: relevantTopics.map((topic) => this.cleanTopicName(topic)),
        });
      }

      // Metinden çıkarılan kelimelerden konular ekle
      if (topWords.length > 0) {
        const wordsMainTopic = 'Metinden Çıkarılan Konular';
        documentTopics.push({
          mainTopic: wordsMainTopic,
          subTopics: topWords.map((word) => {
            // İlk harf büyük, geri kalanı küçük olacak şekilde formatla
            const formattedWord =
              word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            return this.cleanTopicName(formattedWord);
          }),
        });
      }

      // Hiç konu bulunamadıysa, genel bir konu ekle
      if (documentTopics.length === 0) {
        documentTopics.push({
          mainTopic: 'Fizik Konuları',
          subTopics: ['Temel Fizik', 'Kuantum Fiziği', 'Atom Fiziği'].map(
            (topic) => this.cleanTopicName(topic),
          ),
        });
      }

      this.logger.info(
        `AI yanıtından konu çıkarılamadı, ${documentTopics.length} adet varsayılan konu oluşturuldu`,
        'TopicDetectionService.generateDefaultTopics',
        __filename,
      );

      return { topics: documentTopics };
    } catch (error) {
      this.logger.error(
        `Varsayılan konu oluşturma sırasında hata: ${error.message}`,
        'TopicDetectionService.generateDefaultTopics',
        __filename,
        undefined,
        error,
      );

      // En son çare - sabit konular
      return {
        topics: [
          {
            mainTopic: 'Fizik Konuları',
            subTopics: [
              'Kuantum Mekaniği',
              'Atom Yapısı',
              'Elektron Davranışı',
            ].map((topic) => this.cleanTopicName(topic)),
          },
        ],
      };
    }
  }

  /**
   * Generic JSON response parser for AI responses
   */
  private parseJsonResponse<T>(text: string | undefined | null): T {
    if (!text) {
      this.logger.warn(
        'AI yanıtı boş, varsayılan boş konu yapısı döndürülüyor',
        'TopicDetectionService.parseJsonResponse',
        __filename,
      );
      return { topics: [] } as T; // Boş yanıt durumunda boş topic listesi döndür
    }

    try {
      // Teknik terim kalıntılarını temizleyelim
      let cleanedText = text
        .replace(/\bsubTopicName:/g, '"subTopicName":')
        .replace(/\bnormalizedSubTopicName:/g, '"normalizedSubTopicName":')
        .replace(/\bmainTopic:/g, '"mainTopic":')
        .replace(/\bsubTopics:/g, '"subTopics":')
        .replace(/\bdifficulty:/g, '"difficulty":')
        .replace(/\blearningObjective:/g, '"learningObjective":')
        .replace(/\breference:/g, '"reference":')
        .replace(/\bisMainTopic:/g, '"isMainTopic":')
        .replace(/\bparentTopic:/g, '"parentTopic":');

      // Check for common formatting issues before parsing
      let jsonText = cleanedText;
      let jsonMatch: RegExpMatchArray | null = null;

      // First, try to detect JSON code blocks
      if (text.includes('```')) {
        const codeBlockRegexes = [
          /```json([\s\S]*?)```/i, // Büyük/küçük harfe duyarsız
          /```([\s\S]*?)```/, // Herhangi bir dil belirtilmemiş kod bloğu
        ];

        for (const regex of codeBlockRegexes) {
          jsonMatch = text.match(regex);
          if (jsonMatch && jsonMatch[1]) {
            jsonText = jsonMatch[1].trim();
            break;
          }
        }
      }

      // Metinden ilk { ile başlayıp son } ile biten bölümü çıkarmaya çalış
      if (!jsonMatch) {
        const firstOpen = jsonText.indexOf('{');
        const lastClose = jsonText.lastIndexOf('}');

        if (firstOpen !== -1 && lastClose !== -1 && lastClose > firstOpen) {
          jsonText = jsonText.substring(firstOpen, lastClose + 1);
        }
      }

      // Temizleme ve düzeltme işlemleri
      jsonText = this.cleanJsonString(jsonText);

      // Parantez dengesini kontrol et
      jsonText = this.balanceBrackets(jsonText);

      // Trailing comma temizleme (,] veya ,} gibi geçersiz JSON yapıları)
      jsonText = jsonText.replace(/,\s*([}\]])/g, '$1');

      // Virgül olmayan yerlerde ekleme (} { -> },{)
      jsonText = jsonText.replace(/}\s*{/g, '},{');

      // Alanlar arasında eksik virgülleri ekle ("a":"b" "c":"d" -> "a":"b", "c":"d")
      jsonText = jsonText.replace(/"\s*"/g, '", "');

      // Açılış ve kapanışta birden fazla süslü parantez olması durumu
      if (jsonText.startsWith('{{')) {
        jsonText = jsonText.replace(/^{{/, '{');
      }
      if (jsonText.endsWith('}}')) {
        jsonText = jsonText.replace(/}}$/, '}');
      }

      // Tırnak işaretleriyle ilgili düzeltmeler
      jsonText = jsonText.replace(
        /([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g,
        '$1"$2"$3',
      ); // Anahtarlar için tırnak
      jsonText = jsonText.replace(
        /:\s*([a-zA-Z][a-zA-Z0-9_]*)\s*([,}])/g,
        ':"$1"$2',
      ); // String değerler için tırnak

      // Debug olarak temizlenmiş JSON'ı logla
      this.logger.debug(
        `JSON parse hazır. Temizlenmiş metin: ${jsonText.substring(0, 200)}...`,
        'TopicDetectionService.parseJsonResponse',
        __filename,
      );

      // AI yanıtındaki eksik JSON'ı tamamlamaya çalış
      // Bu genellikle AI'nın yanıtını yarıda kesmesi durumunda olur
      if (
        jsonText.includes('"subTopics":') &&
        !jsonText.endsWith('}]}}') &&
        !jsonText.endsWith('}]}')
      ) {
        // Yanıt yarıda kesilmiş gibiyse, düzgün bir JSON yapısı oluştur
        try {
          const mainTopicMatch = jsonText.match(/"mainTopic"\s*:\s*"([^"]+)"/);
          const mainTopic = mainTopicMatch
            ? mainTopicMatch[1]
            : 'Bilinmeyen Konu';

          // subTopics içinde kaç tane subTopic olduğunu bul
          const subTopicsMatches = jsonText.match(
            /"subTopicName"\s*:\s*"([^"]+)"/g,
          );
          const subTopicNames = subTopicsMatches
            ? subTopicsMatches
                .map((match) => {
                  const nameMatch = match.match(
                    /"subTopicName"\s*:\s*"([^"]+)"/,
                  );
                  return nameMatch ? nameMatch[1] : '';
                })
                .filter((name) => name.length > 0)
            : [];

          // JSON'ı sıfırdan oluştur
          const manuallyFixedTopics = {
            topics: [
              {
                mainTopic: mainTopic,
                subTopics: subTopicNames.map((name) => ({
                  subTopicName: name,
                  normalizedSubTopicName:
                    this.normalizationService.normalizeSubTopicName(name),
                })),
              },
            ],
          };

          this.logger.info(
            `Yarıda kesilmiş JSON'ı manuel olarak tamamlandı: ${mainTopic} (${subTopicNames.length} alt konu)`,
            'TopicDetectionService.parseJsonResponse',
            __filename,
          );

          return manuallyFixedTopics as T;
        } catch (manualFixError) {
          this.logger.warn(
            `Manuel JSON düzeltme denemesi başarısız: ${manualFixError.message}`,
            'TopicDetectionService.parseJsonResponse',
            __filename,
          );
          // Manuel düzeltme başarısız olursa, aşağıdaki normal parse işlemlerine devam et
        }
      }

      // Parse JSON
      try {
        const parsedResult = JSON.parse(jsonText) as any;

        // Eğer topics özelliği eksikse ekleyelim
        if (!parsedResult.topics && Array.isArray(parsedResult)) {
          return { topics: parsedResult } as T;
        }

        return parsedResult as T;
      } catch (initialParseError) {
        this.logger.warn(
          `İlk JSON parse denemesi başarısız: ${initialParseError.message}, onarım deneniyor...`,
          'TopicDetectionService.parseJsonResponse',
          __filename,
        );

        // Onarım dene
        const repairedJson = this.repairJsonString(jsonText);

        try {
          const parsedResult = JSON.parse(repairedJson) as any;

          // Eğer topics özelliği eksikse ekleyelim
          if (!parsedResult.topics && Array.isArray(parsedResult)) {
            return { topics: parsedResult } as T;
          }

          return parsedResult as T;
        } catch (repairParseError) {
          this.logger.warn(
            `Onarılmış JSON parse denemesi de başarısız: ${repairParseError.message}, yapay konular oluşturulacak`,
            'TopicDetectionService.parseJsonResponse',
            __filename,
            undefined,
            { rawText: text.substring(0, 500) }, // İlk 500 karakteri logla
          );

          // JSON yanıtının ana konuyu ve alt konuları düzgün çıkaramadığı durumlar için
          // hızlı bir çözüm deneyelim (regex ile)
          try {
            // Ana konu adlarını bul
            const mainTopicMatches = text.match(/"mainTopic"\s*:\s*"([^"]+)"/g);
            // Alt konu adlarını bul
            const subTopicMatches = text.match(
              /"subTopicName"\s*:\s*"([^"]+)"/g,
            );

            if (mainTopicMatches && mainTopicMatches.length > 0) {
              const topics: Array<{ mainTopic: string; subTopics: string[] }> =
                [];

              // Ana konuları çıkar
              for (const mainTopicMatch of mainTopicMatches) {
                const mainTopicNameMatch = mainTopicMatch.match(
                  /"mainTopic"\s*:\s*"([^"]+)"/,
                );
                if (mainTopicNameMatch && mainTopicNameMatch[1]) {
                  const mainTopic = {
                    mainTopic: this.cleanTopicName(mainTopicNameMatch[1]),
                    subTopics: [] as string[],
                  };
                  topics.push(mainTopic);
                }
              }

              // Alt konuları çıkar ve ilk ana konuya ekle
              if (
                subTopicMatches &&
                subTopicMatches.length > 0 &&
                topics.length > 0
              ) {
                for (const subTopicMatch of subTopicMatches) {
                  const subTopicNameMatch = subTopicMatch.match(
                    /"subTopicName"\s*:\s*"([^"]+)"/,
                  );
                  if (subTopicNameMatch && subTopicNameMatch[1]) {
                    topics[0].subTopics.push(
                      this.cleanTopicName(subTopicNameMatch[1]),
                    );
                  }
                }
              }

              if (topics.length > 0) {
                this.logger.info(
                  `JSON parse hatalı olsa da regex ile ${topics.length} ana konu çıkarıldı`,
                  'TopicDetectionService.parseJsonResponse',
                  __filename,
                );
                return { topics } as T;
              }
            }
          } catch (regexError) {
            this.logger.warn(
              `Regex ile konu çıkarma denemesi başarısız: ${regexError.message}`,
              'TopicDetectionService.parseJsonResponse',
              __filename,
            );
          }

          // Her iki parse denemesi de başarısız, varsayılan konular oluştur
          return this.generateDefaultTopics(text) as T;
        }
      }
    } catch (error) {
      this.logger.error(
        `AI yanıtı JSON olarak parse edilemedi: ${error.message}. Yanıt (ilk 500kr): ${text.substring(0, 500)}`,
        'TopicDetectionService.parseJsonResponse',
        __filename,
        undefined,
        error,
      );

      // Her durumda varsayılan konuları döndür - üretimi aksatmamak için
      this.logger.warn(
        'Varsayılan konu yapısı oluşturuluyor',
        'TopicDetectionService.parseJsonResponse',
        __filename,
      );
      return this.generateDefaultTopics(text) as T;
    }
  }

  /**
   * Clean JSON string by removing extra text before/after JSON and fixing common issues
   */
  private cleanJsonString(input: string): string {
    let result = input.trim();

    // LLM'in eklediği ekstra açıklamaları kaldır
    result = result.replace(/[\r\n]+Bu JSON çıktısı.*$/g, '');
    result = result.replace(/^.*?(\{[\s\S]*\}).*$/g, '$1');

    return result;
  }

  /**
   * Balance brackets in JSON string
   */
  private balanceBrackets(input: string): string {
    let result = input;

    // Açık ve kapalı parantez sayılarını hesapla
    const openBraces = (result.match(/{/g) || []).length;
    const closeBraces = (result.match(/}/g) || []).length;
    const openBrackets = (result.match(/\[/g) || []).length;
    const closeBrackets = (result.match(/\]/g) || []).length;

    // Süslü parantezleri dengele
    if (openBraces > closeBraces) {
      result += '}'.repeat(openBraces - closeBraces);
    }

    // Köşeli parantezleri dengele
    if (openBrackets > closeBrackets) {
      result += ']'.repeat(openBrackets - closeBrackets);
    }

    return result;
  }

  /**
   * Repair a broken JSON string using common fixes
   */
  private repairJsonString(input: string): string {
    let result = input;

    // Alan adlarında çift tırnak olmayan yerleri düzelt
    // Örnek: {name: "value"} -> {"name": "value"}
    result = result.replace(/([{,]\s*)([a-zA-Z0-9_]+)(\s*:)/g, '$1"$2"$3');

    // Değerlerde eksik çift tırnak
    // Örnek: {"name": value} -> {"name": "value"}
    // Dikkat: Sadece alfanümerik değerlere tırnak ekler, true/false/null ve numerik değerlere dokunmaz
    result = result.replace(
      /(:\s*)([a-zA-Z][a-zA-Z0-9_]*)(\s*[,}])/g,
      '$1"$2"$3',
    );

    // Virgül eksikliğini düzelt
    // Örnek: {"key1":"value1" "key2":"value2"} -> {"key1":"value1", "key2":"value2"}
    result = result.replace(/(["}])\s*"/g, '$1,"');

    // Gereksiz virgülleri temizle
    // Örnek: {"key":value,,} -> {"key":value}
    result = result.replace(/,\s*,/g, ',');
    result = result.replace(/,\s*}/g, '}');

    // Tırnak eksikliği olan anahtarları düzelt
    // Örnek: {key:"value"} -> {"key":"value"}
    result = result.replace(/{\s*([a-zA-Z0-9_]+)\s*:/g, '{"$1":');

    // Tırnak eksikliği olan değerleri düzelt
    // Örnek: {"key":value} -> {"key":"value"}
    result = result.replace(/:\s*([a-zA-Z0-9_]+)\s*([,}])/g, ':"$1"$2');

    // Süslü parantez yerine köşeli parantez kullanımını düzelt (AI bazen arrays yerine objects döndürür)
    // Örnek: {"topics":{...}} -> {"topics":[...]}
    const topicsMatch = result.match(/"topics"\s*:\s*{/);
    if (topicsMatch) {
      result = result.replace(/"topics"\s*:\s*{/, '"topics":[');
      // Son süslü parantezi köşeli parantezle değiştir
      const lastCloseBrace = result.lastIndexOf('}');
      if (lastCloseBrace !== -1) {
        result =
          result.substring(0, lastCloseBrace) +
          ']' +
          result.substring(lastCloseBrace + 1);
      }
    }

    // Çift süslü parantezleri düzelt
    // Örnek: {{...}} -> {...}
    if (result.startsWith('{{') && result.endsWith('}}')) {
      result = result.substring(1, result.length - 1);
    }

    // Tamamlanmamış JSON yapılarını onar
    // Check if we have unbalanced opening and closing brackets
    const openBraces = (result.match(/{/g) || []).length;
    const closeBraces = (result.match(/}/g) || []).length;
    const openBrackets = (result.match(/\[/g) || []).length;
    const closeBrackets = (result.match(/\]/g) || []).length;

    // Add missing closing braces
    if (openBraces > closeBraces) {
      result = result + '}'.repeat(openBraces - closeBraces);
    }

    // Add missing closing brackets
    if (openBrackets > closeBrackets) {
      result = result + ']'.repeat(openBrackets - closeBrackets);
    }

    return result;
  }

  private shouldReturnDefaultTopics(): boolean {
    return process.env.NODE_ENV !== 'production';
  }

  /**
   * Detect new topics that are not already in the list of existing topics
   * Uses the detect_new_topics_exclusive_tr.txt prompt
   * @param contextText The context text to analyze
   * @param existingTopicTexts List of existing topic names
   * @returns Array of newly identified topics
   */
  async detectNewTopicsExclusive(
    contextText: string,
    existingTopicTexts: string[],
  ): Promise<{
    proposedTopics: { name: string; relevance?: string; details?: string }[];
  }> {
    const traceId = `ai-new-topics-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    try {
      this.logger.debug(
        `[${traceId}] Yeni konu tespiti başlatılıyor (${contextText.length} karakter)`,
        'TopicDetectionService.detectNewTopicsExclusive',
        __filename,
      );

      this.flowTracker.trackStep(
        'Mevcut konuların haricinde yeni konular algılanıyor',
        'TopicDetectionService',
      );

      // Truncate document text if too long
      const maxTextLength = 15000;
      let truncatedText = contextText;
      let isTextTruncated = false;

      if (contextText.length > maxTextLength) {
        const originalLength = contextText.length;
        truncatedText = contextText.slice(0, maxTextLength) + '...';
        isTextTruncated = true;

        this.logger.warn(
          `[${traceId}] Metin çok uzun, ${maxTextLength} karaktere kısaltıldı (orijinal: ${originalLength} karakter)`,
          'TopicDetectionService.detectNewTopicsExclusive',
          __filename,
        );
      }

      // Read the prompt file
      const promptFilePath = path.resolve(
        __dirname,
        '..',
        'prompts',
        'detect_new_topics_exclusive_tr.txt',
      );

      let promptContent = '';

      try {
        promptContent = fs.readFileSync(promptFilePath, 'utf8');
      } catch (error) {
        this.logger.error(
          `[${traceId}] Prompt dosyası okuma hatası: ${error.message}`,
          'TopicDetectionService.detectNewTopicsExclusive',
          __filename,
          undefined,
          error,
        );
        throw new BadRequestException(
          'Konu tespiti için gerekli prompt dosyası bulunamadı.',
        );
      }

      // Replace placeholder variables in the prompt
      const existingTopicsText = existingTopicTexts.join(', ');
      const fullPrompt = promptContent
        .replace('{lessonContext}', truncatedText)
        .replace('{existingTopics}', existingTopicsText);

      this.logger.debug(
        `[${traceId}] Hazırlanan prompt uzunluğu: ${fullPrompt.length} karakter`,
        'TopicDetectionService.detectNewTopicsExclusive',
        __filename,
      );

      // Call AI service with retry mechanism
      const aiResponse = await pRetry(async () => {
        const response = await this.aiProviderService.generateContent(
          fullPrompt,
          {
            metadata: { traceId },
            temperature: 0.3, // Lower temperature for more predictable output
          },
        );

        const aiResponseText = response.text || '';

        // Log the raw response for debugging
        this.logger.debug(
          `[${traceId}] AI servisi yanıtı: ${aiResponseText.substring(0, 500)}...`,
          'TopicDetectionService.detectNewTopicsExclusive',
          __filename,
        );

        // Parse JSON response with improved error handling
        try {
          // Try to parse the JSON response using our improved parseJsonResponse method
          return this.parseJsonResponse<any>(aiResponseText);
        } catch (parseError) {
          // Enhanced error logging
          this.logger.error(
            `[${traceId}] AI yanıtı JSON olarak parse edilemedi: ${parseError.message}`,
            'TopicDetectionService.detectNewTopicsExclusive',
            __filename,
            undefined,
            parseError,
            { aiResponse: aiResponseText?.substring(0, 500) }, // Log first 500 chars of response
          );

          // Try extracting JSON with regex as fallback
          try {
            // Extract JSON from the response if it's embedded within other text
            const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/); // Match everything between curly braces
            const jsonStr = jsonMatch ? jsonMatch[0] : aiResponseText;

            // Clean and repair the JSON string before parsing
            const cleanedJson = this.cleanJsonString(jsonStr);
            const balancedJson = this.balanceBrackets(cleanedJson);
            const repairedJson = this.repairJsonString(balancedJson);

            this.logger.info(
              `[${traceId}] Düzeltilmiş JSON ile parse yeniden deneniyor`,
              'TopicDetectionService.detectNewTopicsExclusive',
              __filename,
            );

            return JSON.parse(repairedJson);
          } catch (fallbackError) {
            this.logger.error(
              `[${traceId}] Fallback JSON ayrıştırma da başarısız oldu: ${fallbackError.message}`,
              'TopicDetectionService.detectNewTopicsExclusive',
              __filename,
              undefined,
              fallbackError,
            );

            // Return a valid but empty result structure to prevent complete failure
            return { newly_identified_topics: [] };
          }
        }
      }, this.RETRY_OPTIONS);

      this.logger.debug(
        `[${traceId}] AI yanıtı alındı: ${JSON.stringify(aiResponse)}`,
        'TopicDetectionService.detectNewTopicsExclusive',
        __filename,
      );

      // Process the response with validation
      const newTopics = aiResponse?.newly_identified_topics || [];

      // Validate that newTopics is an array
      if (!Array.isArray(newTopics)) {
        this.logger.warn(
          `[${traceId}] AI yanıtındaki newly_identified_topics bir dizi değil: ${typeof newTopics}`,
          'TopicDetectionService.detectNewTopicsExclusive',
          __filename,
        );
        return { proposedTopics: [] };
      }

      // Format the response as required with type checking
      const proposedTopics = newTopics
        .filter((topic) => typeof topic === 'string' && topic.trim().length > 0)
        .map((topic) => ({
          name: this.cleanTopicName(topic),
          relevance: 'high', // Default relevance
          details: '', // Can be enhanced in future versions
        }));

      this.logger.info(
        `[${traceId}] ${proposedTopics.length} adet yeni konu tespit edildi`,
        'TopicDetectionService.detectNewTopicsExclusive',
        __filename,
      );

      return { proposedTopics };
    } catch (error) {
      this.logger.error(
        `[${traceId}] Yeni konu tespiti sırasında hata: ${error.message}`,
        'TopicDetectionService.detectNewTopicsExclusive',
        __filename,
        undefined,
        error,
      );
      throw error;
    }
  }

  /**
   * Normalize topic detection result
   */
  private normalizeTopicResult(result: any): TopicDetectionResult {
    // Boş sonuç kontrolü
    if (!result) {
      return { topics: [] };
    }

    try {
      // AI'dan gelen format toplevel "topics" dizisi içerebilir
      const topicsArray = Array.isArray(result)
        ? result
        : Array.isArray(result.topics)
          ? result.topics
          : null;

      if (!topicsArray) {
        this.logger.warn(
          'AI yanıtı beklenen formatta değil, boş konu listesi döndürülüyor',
          'TopicDetectionService.normalizeTopicResult',
          __filename,
        );
        return { topics: [] };
      }

      // AI modeli "mainTopic" ve "subTopics" formatında döndürebilir
      // Bu formattan standart formata dönüştürme yapmamız gerekiyor
      const normalizedTopics: Array<{
        subTopicName: string;
        normalizedSubTopicName: string;
        parentTopic?: string;
        isMainTopic?: boolean;
      }> = [];

      // Ana konuları işle
      topicsArray.forEach((topic: any) => {
        if (topic.mainTopic) {
          // mainTopic - subTopics formatı
          const mainTopicName = this.cleanTopicName(topic.mainTopic);

          // String kontrolü ekle
          if (typeof mainTopicName !== 'string') {
            this.logger.warn(
              `Geçersiz ana konu türü: ${typeof mainTopicName}`,
              'TopicDetectionService.normalizeTopicResult',
              __filename,
            );
            return; // Bu topic'i atla
          }

          const normalizedMainTopic =
            this.normalizationService.normalizeSubTopicName(mainTopicName);

          // Ana konuyu ekle
          normalizedTopics.push({
            subTopicName: mainTopicName,
            normalizedSubTopicName: normalizedMainTopic,
            isMainTopic: true,
          });

          // Alt konuları ekle
          if (Array.isArray(topic.subTopics)) {
            topic.subTopics.forEach((subTopic: any) => {
              // Eğer subTopic bir string ise
              if (typeof subTopic === 'string') {
                const cleanedSubTopic = this.cleanTopicName(subTopic);
                normalizedTopics.push({
                  subTopicName: cleanedSubTopic,
                  normalizedSubTopicName:
                    this.normalizationService.normalizeSubTopicName(
                      cleanedSubTopic,
                    ),
                  parentTopic: mainTopicName,
                  isMainTopic: false,
                });
              }
              // Eğer subTopic bir obje ve subTopicName içeriyorsa
              else if (
                typeof subTopic === 'object' &&
                subTopic !== null &&
                subTopic.subTopicName
              ) {
                const cleanedSubTopicName = this.cleanTopicName(
                  subTopic.subTopicName,
                );
                normalizedTopics.push({
                  subTopicName: cleanedSubTopicName,
                  normalizedSubTopicName:
                    subTopic.normalizedSubTopicName ||
                    this.normalizationService.normalizeSubTopicName(
                      cleanedSubTopicName,
                    ),
                  parentTopic: mainTopicName,
                  isMainTopic: false,
                });
              } else {
                this.logger.warn(
                  `Geçersiz alt konu türü: ${typeof subTopic}`,
                  'TopicDetectionService.normalizeTopicResult',
                  __filename,
                );
              }
            });
          }
        } else if (
          typeof topic === 'object' &&
          topic !== null &&
          topic.subTopicName
        ) {
          // Direkt subTopicName formatı
          if (typeof topic.subTopicName !== 'string') {
            this.logger.warn(
              `Geçersiz subTopicName türü: ${typeof topic.subTopicName}`,
              'TopicDetectionService.normalizeTopicResult',
              __filename,
            );
            return; // Bu topic'i atla
          }

          const cleanedSubTopicName = this.cleanTopicName(topic.subTopicName);
          const parentTopic = topic.parentTopic
            ? this.cleanTopicName(topic.parentTopic)
            : undefined;

          normalizedTopics.push({
            subTopicName: cleanedSubTopicName,
            normalizedSubTopicName:
              this.normalizationService.normalizeSubTopicName(
                cleanedSubTopicName,
              ),
            parentTopic: parentTopic,
            isMainTopic: !!topic.isMainTopic,
          });
        } else if (typeof topic === 'string') {
          // String formatı - düz konu listesi
          const cleanedTopic = this.cleanTopicName(topic);
          normalizedTopics.push({
            subTopicName: cleanedTopic,
            normalizedSubTopicName:
              this.normalizationService.normalizeSubTopicName(cleanedTopic),
            isMainTopic: true,
          });
        }
      });

      return { topics: normalizedTopics };
    } catch (error) {
      this.logger.error(
        `Konu sonuç normalizasyonu sırasında hata: ${error.message}`,
        'TopicDetectionService.normalizeTopicResult',
        __filename,
        undefined,
        error,
      );
      return { topics: [] };
    }
  }

  private cleanTopicName(topicName: string): string {
    if (!topicName || typeof topicName !== 'string') {
      return 'Bilinmeyen Konu';
    }

    // Teknik kalıntıları temizle
    let cleaned = topicName
      .replace(/```json/gi, '') // ```json etiketlerini temizle
      .replace(/```/g, '') // Diğer Markdown etiketlerini temizle
      .replace(/\bsubTopicName\b[:=]/gi, '') // subTopicName: veya subTopicName= kalıplarını temizle
      .replace(/\bnormalizedSubTopicName\b[:=]/gi, '') // normalizedSubTopicName: kalıplarını temizle
      .replace(/["'{}]/g, '') // Json formatından kalan karakterleri temizle
      .trim(); // Başta ve sonda boşlukları temizle

    // Eğer hala ":" içeriyorsa ve başında bir kalıp varsa (muhtemelen başka bir teknik terim)
    if (cleaned.includes(':')) {
      cleaned = cleaned.split(':').slice(1).join(':').trim();
    }

    // Eğer temizleme sonrası boş bir string kaldıysa
    if (!cleaned) {
      return 'Bilinmeyen Konu';
    }

    return cleaned;
  }
}
