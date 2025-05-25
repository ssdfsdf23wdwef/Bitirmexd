# Sınav Oluşturma Promptu

## Tarih: 2025-05-25T07:20:48.655Z

## Trace ID: quiz-1748157648652-mafrm

## Alt Konular (1 adet):
```
## AKTİF KONULAR (SORU ÜRETİLECEK)

Soru üretilecek aktif konu bulunamadı.

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

Bekleyen konu yok.

```

## Soru Sayısı: 10

## Zorluk: mixed

## Tam Prompt:
```
// ====================================================
// ============ TEST SORULARI OLUŞTURMA PROMPT ============
// ====================================================

**📋 TEMEL GÖREV:** 
Sen bir eğitim içeriği ve test geliştirme uzmanısın. Verilen metin içeriğini derinlemesine analiz ederek, kaliteli ve içerik-odaklı test soruları oluşturacaksın.

// ----------------------------------------------------
// ------------------- GİRDİLER -----------------------
// ----------------------------------------------------

**📥 GİRDİLER:**
- **Konu Bilgileri:** ## AKTİF KONULAR (SORU ÜRETİLECEK)

Soru üretilecek aktif konu bulunamadı.

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

Bekleyen konu yok.

  *Lütfen dikkat: Bu bölümde "AKTİF KONULAR (SORU ÜRETİLECEK)" ve "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" olmak üzere iki liste görebilirsin.*
- **Eğitim İçeriği:** {{DOCUMENT_TEXT}}
- **İstenen Toplam Soru Sayısı:** 10 soru
- **Zorluk Seviyesi:** mixed

// ----------------------------------------------------
// ------------- METİN ANALİZ SÜRECİ -----------------
// ----------------------------------------------------

**🔍 İÇERİK ANALİZ ADIMLARI:**
1. Önce metni dikkatlice oku ve anla
2. "Konu Bilgileri" bölümündeki "AKTİF KONULAR (SORU ÜRETİLECEK)" listesindeki alt konulara odaklan
3. Her bir aktif alt konu için anahtar kavramları tespit et
4. Her kavram için öğrenilmesi gereken temel noktaları listele
5. İçeriğin mantık akışını ve bölümleri arasındaki ilişkiyi kavra

**⚠️ METİN SORUNLARIYLA BAŞA ÇIKMA:**
- Eğer metin formatı bozuk görünüyorsa (satır sonları eksik vb.), cümle yapısını anlamaya çalış
- Anlamsız veya hatalı karakterler varsa yok say
- Metin kısımları eksik veya kopuk görünüyorsa, mevcut bilgilerden yararlanan sorular oluştur
- Türkçe karakter sorunları varsa (ş, ç, ğ, ü, ö, ı) anlamı koruyarak düzelt

// ----------------------------------------------------
// ------------- SORU OLUŞTURMA KURALLARI ------------
// ----------------------------------------------------

**⭐ ALT KONU DAĞILIMI VE SORU KURGULAMASI:**
1. SADECE "Konu Bilgileri" bölümündeki "AKTİF KONULAR (SORU ÜRETİLECEK)" listesinde belirtilen alt konular için soru üret
2. "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" listesindeki konulardan KESİNLİKLE soru ÜRETME
3. Her aktif alt konu için tam olarak o alt konu yanında belirtilen sayıda soru üret
   Örneğin: "Nesne Yönelimli Programlama (3 soru)" ifadesi, bu konu için tam 3 soru oluşturulmalıdır
4. Toplam soru sayısının 10 olduğundan emin ol (Bu sayı, aktif konulardaki toplam soru sayısına eşit olmalıdır)
5. Belirtilen aktif alt konular ve soru sayılarına MUTLAKA UYULMALIDIR
6. Her sorunun hangi alt konuya ait olduğu JSON çıktısında "subTopicName" alanında AÇIKÇA belirtilmelidir
7. Her soruyu üretirken, o sorunun hangi aktif alt konudan geldiğini mutlaka kontrol et
8. Soru dağılımları dengesiz olabilir! Örneğin: "Veri Yapıları" için 5 soru, "Algoritma Analizi" için 2 soru

**📊 ZORLUK SEVİYELERİ (SADECE İNGİLİZCE KULLAN):**
- "easy" (kolay): Temel hatırlama ve anlama soruları
- "medium" (orta): Uygulama ve analiz soruları
- "hard" (zor): Karmaşık analiz, değerlendirme ve yaratma soruları
- "mixed" (karışık): Farklı zorluk seviyelerinin karışımı

**🧠 BLOOM TAKSONOMİSİ DÜZEYLERİ:**
- Kolay (easy): "remembering", "understanding"
- Orta (medium): "applying", "analyzing" (temel düzeyde)
- Zor (hard): "analyzing" (karmaşık), "evaluating", "creating"

**📝 SORU TÜRLERİ VE KULLANIM:**
- "multiple_choice": Kavramları test etmek için en yaygın format (4 şık)
- "true_false": Yaygın yanlış anlamaları test etmek için ideal
- "fill_in_blank": Terminoloji ve kesin bilgi için
- "short_answer": Öğrencinin kendi ifadesiyle açıklamasını gerektiren konular için

**📋 TEMEL KURALLAR:**
1. Sorular SADECE verilen içeriğe dayanmalı, dışarıdan bilgi eklenmemeli
2. Her soru bir alt konuyu ölçmeli ve doğrudan içerikle ilgili olmalı
3. Her sorunun TEK doğru cevabı olmalı, bu cevap açıkça içerikte belirtilmiş olmalı
4. Çeldiriciler (yanlış şıklar) makul ama ayırt edilebilir olmalı
5. Konu dağılımında belirtilen ağırlıklara uyulmalı
6. Sorular kavramsal anlayışı ölçmeli, sadece ezber bilgiyi değil
7. Metin içindeki kelimeler birebir kopyalanmak yerine yeniden ifade edilmeli

**💡 AÇIKLAMA YAZMA KURALLARI:**
- Her açıklama, doğru cevabı net şekilde belirtmeli
- Açıklamada öğrenciyi içeriğin ilgili bölümüne yönlendirmeli
- Sadece neyin doğru olduğunu değil, neden doğru olduğunu da açıklamalı
- Çeldiricilerin neden yanlış olduğunu kısaca belirtmeli
- Kısa ve öz olmalı, ama yeterince bilgilendirici olmalı

// ----------------------------------------------------
// -------------- JSON ÇIKTI FORMATI -----------------
// ----------------------------------------------------

**⚙️ JSON ÇIKTI KURALLARI:**
- Yanıt SADECE geçerli bir JSON nesnesi olmalıdır, ek açıklama içermemelidir
- JSON dışında hiçbir ek metin eklenmemelidir
- JSON yapısı tam ve doğru olmalı - tüm parantezleri dengeli olmalı
- Zorunlu alanlar: id, questionText, options, correctAnswer, explanation, subTopicName, difficulty
- Her soru için zorluk seviyesi SADECE İngilizce olmalı ("easy", "medium", "hard", "mixed")

**📄 JSON FORMATI:**
```
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Soru metni?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": ["Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D"],
      "correctAnswer": "Seçenek B",
      "explanation": "Doğru cevabın açıklaması",
      "subTopicName": "Nesne Yönelimli Programlama",
      "normalizedSubTopicName": "nesne_yonelimli_programlama",
      "difficulty": "medium"
    },
    {
      "id": "q2",
      "questionText": "İkinci soru metni?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": ["Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D"],
      "correctAnswer": "Seçenek A",
      "explanation": "Doğru cevabın açıklaması",
      "subTopicName": "Nesne Yönelimli Programlama",
      "normalizedSubTopicName": "nesne_yonelimli_programlama",
      "difficulty": "easy"
    },
    {
      "id": "q3",
      "questionText": "Üçüncü soru metni?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": ["Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D"],
      "correctAnswer": "Seçenek C",
      "explanation": "Doğru cevabın açıklaması",
      "subTopicName": "Nesne Yönelimli Programlama",
      "normalizedSubTopicName": "nesne_yonelimli_programlama",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "Başka bir alt konudan soru?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "analyzing",
      "options": ["Seçenek A", "Seçenek B", "Seçenek C", "Seçenek D"],
      "correctAnswer": "Seçenek D",
      "explanation": "Doğru cevabın açıklaması",
      "subTopicName": "Algoritma Analizi",
      "normalizedSubTopicName": "algoritma_analizi",
      "difficulty": "hard"
    }
  ]
}
```

// ----------------------------------------------------
// -------------- KALİTE KRİTERLERİ ------------------
// ----------------------------------------------------

**🎯 SORU KALİTESİ KRİTERLERİ:**
1. İÇERİK ODAKLILIK: Her soru, direkt olarak verilen metinden çıkarılmalı
2. AÇIKLIK: Soru ifadeleri açık, net ve anlaşılır olmalı
3. UYGUNLUK: Zorluk seviyesi ve bilişsel düzey uyumlu olmalı
4. DENGELİ ÇELDİRİCİLER: Yanlış şıklar mantıklı ama açıkça yanlış olmalı
5. KAVRAMSAL DERINLIK: Yüzeysel bilgi yerine kavramsal anlayışı ölçmeli
6. DİL KALİTESİ: Türkçe dilbilgisi ve yazım kurallarına uygun olmalı

**✅ SON KONTROLLER:**
- Tüm soruların doğru cevapları kesinlikle metinde yer almalı
- Zorluk seviyeleri MUTLAKA İngilizce olmalı ("easy", "medium", "hard", "mixed")
- JSON formatının doğruluğundan emin ol
- Sorular farklı bilişsel düzeyleri içermeli
- Tüm gerekli alanlar doldurulmalı
- ALT KONU DAĞILIMI ve SORU SAYISI:
  1. Toplam soru sayısı tam olarak 10 adet olmalı (aktif konulardaki toplam soru sayısıyla eşleşmeli)
  2. "Konu Bilgileri" bölümündeki "AKTİF KONULAR (SORU ÜRETİLECEK)" listesindeki HER BİR alt konu için belirtilen SORU SAYISINA MUTLAKA uyulmalı
     Örneğin: "Veri Tabanı Sistemleri (3 soru)" yazıyorsa, bu konudan tam 3 soru üretilmeli
  3. "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" listesindeki konulardan KESİNLİKLE soru üretilmediğinden emin ol
  4. Her sorunun "subTopicName" alanında, o sorunun geldiği alt konunun TAM ADI belirtilmeli
     Örneğin: "Nesne Yönelimli Programlama", "Veri Yapıları" gibi konu adları aynen kullanılmalı
- Her alt konu için soruların zorluk dağılımı dengeli olmalı

// ====================================================
// ================ PROMPT SONU ======================
// ====================================================
```



## AI Yanıtı:
```json
Anlaşıldı. Şu anda "AKTİF KONULAR (SORU ÜRETİLECEK)" listesi boş olduğu için soru üretemiyorum. Lütfen soru üretilecek aktif konuları ve her konu için istenen soru sayısını belirtin. Ardından, ilgili eğitim içeriğini ({{DOCUMENT_TEXT}}) sağlayın. Bu bilgileri aldıktan sonra, belirtilen kurallara ve formata uygun olarak 10 adet test sorusu oluşturabilirim.

```



## İşlenen Sorular Analizi:

- Toplam Soru Sayısı: 5
- Alt Konu Dağılımı:

  - Eksaskala Yazılım Zorlukları: 1 soru
  - Ölçeklenebilirlik: 1 soru
  - Hata Toleransı: 1 soru
  - Veri Hareketi: 1 soru
  - Hafif Çekirdek Tasarımı: 1 soru


### Soru Örnekleri (Her Alt Konudan 1 Adet):

#### Eksaskala Yazılım Zorlukları:
- Soru: Eksaskala bilgi işlem sistemlerinin karşılaştığı temel yazılım zorlukları arasında aşağıdakilerden hangisi yer almaz?
- Seçenekler: A) Ölçeklenebilirlik sorunları | B) Hata toleransı ve dayanıklılık | C) Masaüstü kullanıcı arayüzü tasarımı | D) Milyonlarca çekirdeğin etkin yönetimi
- Doğru Cevap: C) Masaüstü kullanıcı arayüzü tasarımı
- Zorluk: medium

#### Ölçeklenebilirlik:
- Soru: Eksaskala sistemlerinin ölçeklenebilirlik özelliği için aşağıdaki ifadelerden hangisi doğrudur?
- Seçenekler: A) Yüzbinlerce çekirdekle çalışan uygulamalar mevcut HPC uygulamalarının doğrudan ölçeklendirilmesiyle elde edilebilir | B) Ölçeklenebilirlikte bellek erişim desenleri önemsizdir | C) Uygulamaların zayıf ölçeklenebilirliği bile eksaskala sistem performansını etkilemez | D) İdeal ölçeklenebilirlikte, işlemci sayısı iki katına çıktığında uygulama hızı da iki katına çıkar
- Doğru Cevap: D) İdeal ölçeklenebilirlikte, işlemci sayısı iki katına çıktığında uygulama hızı da iki katına çıkar
- Zorluk: medium

#### Hata Toleransı:
- Soru: Eksaskala sistemlerinde hata toleransı neden önemlidir?
- Seçenekler: A) Sistem maliyetini azaltmak için | B) Kullanıcı arayüzünü geliştirmek için | C) Çok sayıda bileşen olduğundan, bileşen arızaları kaçınılmazdır | D) Sadece askeri uygulamalarda gerekli olduğu için
- Doğru Cevap: C) Çok sayıda bileşen olduğundan, bileşen arızaları kaçınılmazdır
- Zorluk: medium

#### Veri Hareketi:
- Soru: Eksaskala sistemlerinde veri hareketi ile ilgili aşağıdaki ifadelerden hangisi doğrudur?
- Seçenekler: A) Veri hareketi, enerji tüketiminde önemsiz bir faktördür | B) Yerel bellek erişimleri ile uzak bellek erişimleri arasında performans farkı yoktur | C) Veri hareketini minimize etmek, enerji verimliliğini artırır | D) Tüm veriler her zaman tüm işlemcilere eşit mesafededir
- Doğru Cevap: C) Veri hareketini minimize etmek, enerji verimliliğini artırır
- Zorluk: hard

#### Hafif Çekirdek Tasarımı:
- Soru: Eksaskala işletim sistemleri için aşağıdakilerden hangisi doğrudur?
- Seçenekler: A) Geleneksel işletim sistemleri eksaskala sistemler için yeterlidir | B) Hafif çekirdek (lightweight kernel) tasarımı, sistem kaynaklarını daha verimli kullanır | C) İşletim sistemi servisleri tüm çekirdeklerde tam olarak çalışmalıdır | D) Eksaskala sistemlerde işletim sistemi kullanmak gereksizdir
- Doğru Cevap: B) Hafif çekirdek (lightweight kernel) tasarımı, sistem kaynaklarını daha verimli kullanır
- Zorluk: hard

