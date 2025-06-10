/**
 * Topic Classification Utility
 * Ana konuları sınıflandırmak için kullanılır
 */

export class TopicClassificationUtil {
  /**
   * Alt konuyu ana konuya sınıflandırır
   * @param subTopicName Alt konu adı
   * @returns Ana konu kategorisi
   */
  static classifyMainTopic(subTopicName: string): string {
    const text = subTopicName.toLowerCase();
    
    // Programming concepts
    if (text.includes('variable') || text.includes('değişken') || text.includes('veri tip')) {
      return 'Temel Programlama';
    }
    if (text.includes('function') || text.includes('fonksiyon') || text.includes('metod')) {
      return 'Fonksiyonlar';
    }
    if (text.includes('array') || text.includes('dizi') || text.includes('list')) {
      return 'Veri Yapıları';
    }
    if (text.includes('loop') || text.includes('döngü') || text.includes('for') || text.includes('while')) {
      return 'Döngüler';
    }
    if (text.includes('class') || text.includes('sınıf') || text.includes('object') || text.includes('nesne')) {
      return 'Nesne Yönelimli Programlama';
    }
    if (text.includes('algorithm') || text.includes('algoritma')) {
      return 'Algoritmalar';
    }
    if (text.includes('database') || text.includes('veritabanı') || text.includes('sql')) {
      return 'Veritabanı';
    }
    if (text.includes('web') || text.includes('http') || text.includes('api')) {
      return 'Web Geliştirme';
    }
    
    // Math concepts
    if (text.includes('integral') || text.includes('türev') || text.includes('limit')) {
      return 'Matematik Analiz';
    }
    if (text.includes('linear') || text.includes('doğrusal') || text.includes('matrix')) {
      return 'Lineer Cebir';
    }
    if (text.includes('probability') || text.includes('olasılık') || text.includes('statistics')) {
      return 'İstatistik';
    }
    if (text.includes('geometry') || text.includes('geometri')) {
      return 'Geometri';
    }
    
    // Physics concepts
    if (text.includes('force') || text.includes('kuvvet') || text.includes('motion') || text.includes('hareket')) {
      return 'Mekanik';
    }
    if (text.includes('electric') || text.includes('elektrik')) {
      return 'Elektrik';
    }
    if (text.includes('wave') || text.includes('dalga')) {
      return 'Dalgalar';
    }
    
    // Chemistry concepts
    if (text.includes('element') || text.includes('atom')) {
      return 'Kimya Temelleri';
    }
    if (text.includes('reaction') || text.includes('reaksiyon')) {
      return 'Kimyasal Reaksiyonlar';
    }
    
    // Biology concepts
    if (text.includes('cell') || text.includes('hücre')) {
      return 'Hücre Biyolojisi';
    }
    if (text.includes('evolution') || text.includes('evrim')) {
      return 'Evrim';
    }
    
    return 'Genel Konular';
  }
}
