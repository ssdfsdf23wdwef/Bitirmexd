import { Injectable } from '@nestjs/common';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
  GenerativeModel,
} from '@google/generative-ai';
import {
  AIProvider,
  AIProviderConfig,
  AIRequestOptions,
  AIResponse,
} from './ai-provider.interface';

@Injectable()
export class GeminiProviderService implements AIProvider {
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private config: AIProviderConfig;

  initialize(config: AIProviderConfig): void {
    this.config = config;
    this.genAI = new GoogleGenerativeAI(config.apiKey);

    const defaultSafetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    this.model = this.genAI.getGenerativeModel({
      model: config.model || 'gemini-2.0-flash',
      safetySettings: defaultSafetySettings,
      generationConfig: {
        temperature: config.temperature || 0.7,
        maxOutputTokens: config.maxTokens || 30000,
      },
    });

  }

  async generateContent(
    prompt: string,
    options?: AIRequestOptions,
  ): Promise<AIResponse> {
    try {
      const startTime = Date.now();
      const traceId =
        options?.metadata?.traceId ||
        `gemini-${startTime}-${Math.random().toString(36).substring(2, 7)}`;

      // Özel ayarlar varsa onları kullan, yoksa modeldeki ayarları kullan
      const requestParams = options || {};

      // İstek içeriklerini oluştur
      let contents: Array<{ role: string; parts: Array<{ text: string }> }> =
        [];

      // Sistem mesajı varsa ekle
      if (options?.systemInstruction) {
        
        contents.push({
          role: 'user', // Gemini modelinde system role yerine user kullanılır
          parts: [
            {
              text: `SYSTEM INSTRUCTIONS:\n${options.systemInstruction}\n\nPlease follow these instructions carefully and format your response as specified.`,
            },
          ],
        });
      }

      // Ana promptu ekle
      contents.push({
        role: 'user',
        parts: [{ text: prompt }],
      });

   

      // API çağrısı öncesi son hazırlıklar
      const generationConfig = {
        temperature:
          requestParams.temperature || this.config.temperature || 0.5,
        maxOutputTokens:
          requestParams.maxTokens || this.config.maxTokens || 30048,
        topK: requestParams.topK || 40,
        topP: requestParams.topP || 0.95,
      };


      // API çağrısı
      const response = await this.model.generateContent({
        contents,
        generationConfig: {
          temperature: requestParams.temperature || this.config.temperature,
          maxOutputTokens: requestParams.maxTokens || this.config.maxTokens,
          topK: requestParams.topK || 40,
          topP: requestParams.topP || 0.95,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      // Tamamlanma süresini hesapla
      const endTime = Date.now();
      const duration = endTime - startTime;
    

      // Yanıt metnini alma -  response.response.candidates[0].content.parts[0].text kullanabiliriz
      let responseText = '';

      try {
        // Direktmen response'u string olarak almaya çalış
        if (response.response) {
         

          if (
            response.response.candidates &&
            response.response.candidates[0] &&
            response.response.candidates[0].content &&
            response.response.candidates[0].content.parts &&
            response.response.candidates[0].content.parts[0]
          ) {
            responseText =
              response.response.candidates[0].content.parts[0].text || '';

        
          } else {
           
          }
        } else if (typeof (response as any).text === 'function') {
          // Bazı Gemini API sürümlerinde doğrudan text() metodu ile yanıt dönebilir
          responseText = (response as any).text();
         
        } else if (typeof (response as any).text === 'string') {
          // Text bir string olabilir
          responseText = (response as any).text;
          
        } else {
          // Gemini API response yapısını ayrıntılı loglayalım (hata ayıklama amaçlı)
          

          // Eğer response bir fonksiyon içeriyorsa ve adı text ise
          if (typeof response === 'object' && response !== null) {
            // Response nesnesinin anahtarlarını loglayalım
           

            if (typeof response.toString === 'function') {
              responseText = response.toString();
             
            }
          }
        }
      } catch (textError) {
  

        // Son çare: tüm nesneyi JSON'a çevirmeyi dene
        try {
          const responseJson = JSON.stringify(response);
          const textMatch = responseJson.match(/"text"\s*:\s*"([^"]+)"/);
          if (textMatch && textMatch[1]) {
            responseText = textMatch[1];
          
          }
        } catch (jsonError) {
         
        }

        // Yine de yanıt alınamadıysa boş metin kullan
        if (!responseText) {
          responseText = '';
        }
      }

      // Basit token hesaplaması (kesin değil, sadece tahmin)
      const promptTokenEstimate = Math.ceil(prompt.length / 4);
      const completionTokenEstimate = Math.ceil(
        (responseText?.length || 0) / 4,
      );
      const totalTokenEstimate = promptTokenEstimate + completionTokenEstimate;


      // JSON içerik kontrolü
      if (
        responseText &&
        (prompt.toLowerCase().includes('json') ||
          (options?.systemInstruction &&
            options.systemInstruction.toLowerCase().includes('json')))
      ) {
        try {
          // Basit bir JSON kontrolü yap
          const containsJsonBraces =
            responseText.includes('{') && responseText.includes('}');

          if (containsJsonBraces) {
            const jsonPrefix = responseText.indexOf('{');
            const jsonSuffix = responseText.lastIndexOf('}') + 1;

            // JSON olabilecek metni çıkarmayı dene
            const possibleJson = responseText.substring(jsonPrefix, jsonSuffix);

            try {
              // JSON parse etmeyi dene (sadece kontrol amaçlı)
              JSON.parse(possibleJson);
            } catch (jsonError) {
              
            }
          } else {
           
          }
        } catch (formatError) {
         
        }
      }

      return {
        text: responseText,
        usage: {
          promptTokens: promptTokenEstimate,
          completionTokens: completionTokenEstimate,
          totalTokens: totalTokenEstimate,
        },
      };
    } catch (error) {

      throw error;
    }
  }
}
