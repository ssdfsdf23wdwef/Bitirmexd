# Sınav Oluşturma Promptu

## Tarih: 2025-06-08T12:59:16.162Z

## Trace ID: quiz-1749387556149-uynnf

## Alt Konular (2 adet):
```
## AKTİF KONULAR (SORU ÜRETİLECEK)

**Aşağıdaki alt konular için belirtilen sayıda soru üretilecektir:**

1. **Data Preprocessinğioverview** (5 soru)
2. **Data Quality Dimensions** (5 soru)

**Toplam Aktif: 2 alt konu, 10 soru**

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

**Aşağıdaki alt konular için belirtilen sayıda soru üretilecektir:**

1. **Data Preprocessinğioverview** (5 soru)
2. **Data Quality Dimensions** (5 soru)

**Toplam Aktif: 2 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

Bekleyen konu yok.

  *Lütfen dikkat: Bu bölümde "AKTİF KONULAR (SORU ÜRETİLECEK)" ve "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" olmak üzere iki liste görebilirsin.*
- **Eğitim İçeriği:** 

1
Data Mining:
Concepts and Techniques
(3
rd
ed.)
—Chapter 3—
Jiawei Han, Micheline Kamber, and Jian Pei
University of Illinois at Urbana-Champaign &
Simon Fraser University
©2011 Han, Kamber & Pei. All rights reserved.

22
Chapter 3: Data Preprocessing
Data Preprocessing: An Overview
Data Quality
Major Tasks in Data Preprocessing
Data Cleaning
Data Integration
Data Reduction
Data Transformation and Data Discretization
Summary

3
Data Quality: Why Preprocess the Data?
Measures for data quality: A multidimensional view
Accuracy: correct or wrong, accurate or not
Completeness: not recorded, unavailable, ...
Consistency: some modified but some not, dangling, ...
Timeliness: timely update?
Believability: how trustable the data are correct?
Interpretability: how easily the data can be
understood?

4
Major Tasks in Data Preprocessing
Data cleaning
Fill in missing values, smooth noisy data, identify or remove
outliers, and resolve inconsistencies
Data integration
Integration of multiple databases, data cubes, or files
Data reduction
Dimensionality reduction
Numerosity reduction
Data compression
Data transformation and data discretization
Normalization
Concept hierarchy generation

55
Chapter 3: Data Preprocessing
Data Preprocessing: An Overview
Data Quality
Major Tasks in Data Preprocessing
Data Cleaning
Data Integration
Data Reduction
Data Transformation and Data Discretization
Summary

6
Data Cleaning
Data in the Real World Is Dirty: Lots of potentially incorrect data,
e.g., instrument faulty, human or computer error, transmission error
incomplete: lacking attribute values, lacking certain attributes of
interest, or containing only aggregate data
e.g., Occupation=“ ” (missing data)
noisy: containing noise, errors, or outliers
e.g., Salary=“−10” (an error)
inconsistent: containing discrepancies in codes or names, e.g.,
Age=“42”, Birthday=“03/07/2010”
Was rating “1, 2, 3”, now rating “A, B, C”
discrepancy between duplicate records
Intentional(e.g., disguised missingdata)
Jan. 1 as everyone’s birthday?

7
Incomplete (Missing) Data
Data is not always available
E.g., many tuples have no recorded value for several
attributes, such as customer income in sales data
Missing data may be due to
equipment malfunction
inconsistent with other recorded data and thus deleted
data not entered due to misunderstanding
certain data may not be considered important at the
time of entry
not register history or changes of the data
Missing data may need to be inferred

8
How to Handle Missing Data?
Ignore the tuple: usually done when class label is missing
(when doing classification)—not effective when the % of
missing values per attribute varies considerably
Fill in the missing value manually: tedious + infeasible?
Fill in it automatically with
a global constant : e.g., “unknown”, a new class?!
the attribute mean
the attribute mean for all samples belonging to the
same class: smarter
the most probable value: inference-based such as
Bayesian formula or decision tree

9
Noisy Data
Noise: random error or variance in a measured variable
Incorrect attribute valuesmay be due to
faulty data collection instruments
data entry problems
data transmission problems
technology limitation
inconsistency in naming convention
Other data problemswhich require data cleaning
duplicate records
incomplete data
inconsistent data

10
How to Handle Noisy Data?
Binning
first sort data and partition into (equal-frequency) bins
then one can smooth by bin means, smooth by bin
median, smooth by bin boundaries, etc.
Regression
smooth by fitting the data into regression functions
Clustering
detect and remove outliers
Combined computer and human inspection
detect suspicious values and check by human (e.g.,
deal with possible outliers)

11
Data Cleaning as a Process
Data discrepancy detection
Use metadata (e.g., domain, range, dependency, distribution)
Check field overloading
Check uniqueness rule, consecutive rule and null rule
Use commercial tools
Data scrubbing: use simple domain knowledge (e.g., postal
code, spell-check) to detect errors and make corrections
Data auditing: by analyzing data to discover rules and
relationship to detect violators (e.g., correlation and clustering
to find outliers)
Data migration and integration
Data migration tools: allow transformations to be specified
ETL (Extraction/Transformation/Loading) tools: allow users to
specify transformations through a graphical user interface
Integration of the two processes
Iterative and interactive (e.g., Potter’s Wheels)

1212
Chapter 3: Data Preprocessing
Data Preprocessing: An Overview
Data Quality
Major Tasks in Data Preprocessing
Data Cleaning
Data Integration
Data Reduction
Data Transformation and Data Discretization
Summary

1313
Data Integration
Data integration:
Combines data from multiple sources into a coherent store
Schema integration: e.g., A.cust-id B.cust-#
Integrate metadata from d...(Kısaltıldı)
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



## İşlenen Sorular Analizi:

- Toplam Soru Sayısı: 10
- Alt Konu Dağılımı:

  - Data Preprocessinğioverview: 5 soru
  - Data Quality Dimensions: 5 soru


### Soru Örnekleri (Her Alt Konudan 1 Adet):

#### Data Preprocessinğioverview:
- Soru: Veri ön işleme sürecinin temel amacı nedir?
- Seçenekler: Veri miktarını azaltmak | Verinin kalitesini artırmak | Veriyi daha karmaşık hale getirmek | Veriyi farklı kaynaklardan toplamak
- Doğru Cevap: Verinin kalitesini artırmak
- Zorluk: easy

#### Data Quality Dimensions:
- Soru: Aşağıdakilerden hangisi veri kalitesinin bir boyutu değildir?
- Seçenekler: Doğruluk (Accuracy) | Tamlık (Completeness) | Tutarlılık (Consistency) | Karmaşıklık (Complexity)
- Doğru Cevap: Karmaşıklık (Complexity)
- Zorluk: easy

