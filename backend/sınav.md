# Sınav Oluşturma Promptu

## Tarih: 2025-06-08T19:18:45.294Z

## Trace ID: quiz-1749410325278-sx644

## Alt Konular (9 adet):
```
## AKTİF KONULAR (SORU ÜRETİLECEK)

**Aşağıdaki alt konular için belirtilen sayıda soru üretilecektir:**

1. **Recommendation Systems Overview** (2 soru)
2. **Retrieval Strategies** (2 soru)
3. **Rankinğialgorithms** (2 soru)
4. **Content İnformation Utilization** (2 soru)
5. **Advantages And Disadvantages** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Cosine Similarity
2. Dot Product Similarity
3. Euclidean Distance
4. User İtem İnteractions

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

1. **Recommendation Systems Overview** (2 soru)
2. **Retrieval Strategies** (2 soru)
3. **Rankinğialgorithms** (2 soru)
4. **Content İnformation Utilization** (2 soru)
5. **Advantages And Disadvantages** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Cosine Similarity
2. Dot Product Similarity
3. Euclidean Distance
4. User İtem İnteractions

  *Lütfen dikkat: Bu bölümde "AKTİF KONULAR (SORU ÜRETİLECEK)" ve "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" olmak üzere iki liste görebilirsin.*
- **Eğitim İçeriği:** 

Security Level:
Department name:AIE
Author’s name:Çağrı Yeşil
Date:2.11.2023
Recommendation Systems

Contents
1.Recommendation system: Retrieval & Ranking
2.Content base recommendation system
3.Similarity measurements f_simple(U1,M1) and f_complex(U1,M1,...)
4.Colobrative Filtering

Huawei Proprietary -Restricted Distribution3
Similarity Metric: is a metric that shows how much an item is similar to an item or suitable for a user
Retrieval:
•Selecting top K items according to similarity metrics for an user
•Selecting all movies of which genres are sci-fi and adventure for a user
•Content-baseor colobrative filtering approaches can be used here
Ranking:
•Ranking or ordering selecting items according to a metricto decide which items will be showed to user
•Deciding which movie among the sci-fi and adventure movies will be shown to a user
•Machine learning, deep learning strategies are used here
Question:
•Why do we need retrieval? Can’t we just use rank all the items and select best of them?
•Why do we need ranking? Can’t we just select top 1 item according to the similarity metric
Retrieval/Ranking

Huawei Proprietary -Restricted Distribution4
Why do we need retrieval? Can’t we just use rank all the items and select best of them?
•There are millions of data and recommendations are generally real-time problems
•It is not possible to rank millions of data in real-time
•Therefore, we select a subset of data with retrieval strategies and then apply ranking to that small subset
Why do we need ranking? Can’t we just select top 1 item according to the similarity metric?
•To be fast, retrieval strategies use small amount of features.
•With small amount of features, it is not possible to decide which item is better for an user
•We need different strategies (ranking) to handle larger amount of features.
Retrieval/Ranking

Huawei Proprietary -Restricted Distribution5
1) Content-base approach:
>If user watch 2 horror movies then the system can recommend
horror moviesto that user.
2) Colobrative approach
>BooksofUser1:A,B(History),C(History)
>BooksofUser2:B,C,D
>RecommendAtoUser1andRecommendDtoUser2
Retrieval strategies

Huawei Proprietary -Restricted Distribution6
Content-base Recommendation
•In content-base recommendation, we use content
information to recommend items to users
•Which movie whould you recommend to these
users? Why?
•What if we have 1000 sci-fi movies that we can
recommend to user 3, which one will we
recommend?
•What about User 2, we have no information about
her/his preferences?

Huawei Proprietary -Restricted Distribution7
Content-base Recommendation
•In real world, we may have to use more than one
content information
•Which movie whould you recommend to these
users? Why?

Huawei Proprietary -Restricted Distribution8
How to measure similarity/closeness?
<User1, Star Wars> = 1*1+0*1+1*0+0*0+1*0 = 1
<User1, Exorcist> = 2
<User1, Avengers> = 2
<User1, La la land> = 1

Huawei Proprietary -Restricted Distribution9
Similarity of vectors
Movie 1 = [1,3]
Movie 2 = [2,1]
User = [2,2]

Huawei Proprietary -Restricted Distribution10
Similarity of vectors: Cosine similarity
Movie 1 = [1,3]
Movie 2 = [2,1]
User = [2,2]
cos(M1, User) = cos(β=26.57) = 0.13
cos(M2, User) = cos(α=18.44) = 0.91
Movie 2 is more similar to User
Reminder: cos(0) = 1 and cos(90)=0
α
β

Huawei Proprietary -Restricted Distribution11
Similarity of vectors: Dot Product (similarity)
sx,y=
푖=0
푑
푥
푖
.푦
푖
Movie 1 = [1,3]
Movie 2 = [2,1]
User = [2,2]
<M1, User> = 1∗2+3∗2=8
<M2, User> =2∗2+1∗2= 6
Movie 1 is more similar to User
α
β

Huawei Proprietary -Restricted Distribution12
dotproductofx,y∊푅
푑
=<x,y>=

푖=0
푑
푥
푖
푦
푖
=푥푦cos(푥,푦)
푛표푟푚표푟푚푎푔푛푖푡푢푑푒표푓푥→푥=

푖
푑
푥
푖
2
푛표푟푚표푟푚푎푔푛푖푡푢푑푒표푓푦→푦=

푖
푑
푦
푖
2
푊ℎ푎푡ℎ푎푝푝푒푛푠푖푓푥and푦푖푠푒푞푢푎푙푡표1?
Similarity of vectors: Dot Product (similarity) cont.

Huawei Proprietary -Restricted Distribution13
Similarity of vectors: Euclidean distance
s(x,y)=
푖=0
푑
(푥
푖
−푦
푖
)
2
Movie 1 = [1,3]
Movie 2 = [2,1]
User = [2,2]
<M1, User> = (1−2)
2
+(3−2)
2
= 2
<M2, User> =(2−2)
2
+(3−2)
2
= 1
Movie 2 is closer to User
α
β

Huawei Proprietary -Restricted Distribution14
•Compared to the cosine, the dot product similarity is sensitive to the norm of the embedding.
>That is, the larger the norm of an embedding, the higher the similarity (for items with an acute angle)
and the more likely the item is to be recommended.
•Items that appear very frequently in the training set (for example, popular YouTube videos) tend to have
embeddingswith large norms.
>If capturing popularity information is desirable, then you should prefer dot product. However, if you're not careful,
the popular items may end up dominating the recommendations.
•Dot product is easy to implement and compute, therefore we generally use dot product in
recommendation systems
Which Similarity Measure to Choose?

Huawei Proprietary -Restricted Distribution15
Advantages
•The model doesn't need any data about other users, since the recommendations are specific to this
user. This makes...(Kısaltıldı)
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

  - Recommendation Systems Overview: 2 soru
  - Retrieval Strategies: 2 soru
  - Rankinğialgorithms: 2 soru
  - Content İnformation Utilization: 2 soru
  - Advantages And Disadvantages: 2 soru


### Soru Örnekleri (Her Alt Konudan 1 Adet):

#### Recommendation Systems Overview:
- Soru: Aşağıdakilerden hangisi bir öneri sisteminin temel işlevlerinden biridir?
- Seçenekler: Kullanıcı verilerini analiz etmek | Veri tabanlarını yönetmek | Kullanıcılara uygun öğeleri bulmak ve sıralamak | Ağ güvenliğini sağlamak
- Doğru Cevap: Kullanıcılara uygun öğeleri bulmak ve sıralamak
- Zorluk: easy

#### Retrieval Strategies:
- Soru: Öneri sistemlerinde retrieval stratejileri neden gereklidir? 
- Seçenekler: Tüm öğeleri gerçek zamanlı olarak sıralamanın mümkün olmaması | Kullanıcı arayüzünü basitleştirmek için | Veri depolama maliyetlerini azaltmak için | Sadece en popüler öğeleri göstermek için
- Doğru Cevap: Tüm öğeleri gerçek zamanlı olarak sıralamanın mümkün olmaması
- Zorluk: medium

#### Rankinğialgorithms:
- Soru: Öneri sistemlerinde sıralama (ranking) algoritmalarının temel amacı nedir?
- Seçenekler: Öğeleri rastgele sıralamak | En popüler öğeleri en üste yerleştirmek | Retrieval aşamasında seçilen öğeleri, kullanıcının ilgi alanlarına göre en uygun olandan en az uygun olana doğru sıralamak | Sadece yeni eklenen öğeleri göstermek
- Doğru Cevap: Retrieval aşamasında seçilen öğeleri, kullanıcının ilgi alanlarına göre en uygun olandan en az uygun olana doğru sıralamak
- Zorluk: medium

#### Content İnformation Utilization:
- Soru: İçerik tabanlı öneri sistemleri (Content-based recommendation systems) neye göre önerilerde bulunur?
- Seçenekler: Diğer kullanıcıların tercihlerine | Öğelerin içeriğine (açıklama, tür, özellikler vb.) | Rastgele seçilen öğelere | Sadece popüler öğelere
- Doğru Cevap: Öğelerin içeriğine (açıklama, tür, özellikler vb.)
- Zorluk: easy

#### Advantages And Disadvantages:
- Soru: Aşağıdakilerden hangisi öneri sistemlerinin bir avantajı değildir?
- Seçenekler: Kullanıcılara kişiselleştirilmiş öneriler sunabilme | İşletmelerin satışlarını artırabilme | Yeni ve keşfedilmemiş öğeleri kullanıcılara sunabilme | Diğer kullanıcılar hakkında veri gerektirmesi
- Doğru Cevap: Diğer kullanıcılar hakkında veri gerektirmesi
- Zorluk: medium

