# Sınav Oluşturma Promptu

## Tarih: 2025-06-06T00:10:30.156Z

## Trace ID: quiz-1749168630145-4e4u8

## Alt Konular (10 adet):
```
## AKTİF KONULAR (SORU ÜRETİLECEK)

**Aşağıdaki alt konular için belirtilen sayıda soru üretilecektir:**

1. **Eksaskala Çağında Yazılım Zorlukları** (2 soru)
2. **Ölçeklenebilirlik Zorlukları** (2 soru)
3. **Hata Toleransı Gereksinimleri** (2 soru)
4. **Veri Hareketi Ve Depolama** (2 soru)
5. **Hafif Çekirdek Lightweight Kernel** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Dinamik Kaynak Yönetimi
2. Hata Toleransı Mekanizmaları
3. Akıllı Veri Yönlendirme
4. Önbellekleme Teknikleri
5. Paralel Programlama Paradigmaları

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

1. **Eksaskala Çağında Yazılım Zorlukları** (2 soru)
2. **Ölçeklenebilirlik Zorlukları** (2 soru)
3. **Hata Toleransı Gereksinimleri** (2 soru)
4. **Veri Hareketi Ve Depolama** (2 soru)
5. **Hafif Çekirdek Lightweight Kernel** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Dinamik Kaynak Yönetimi
2. Hata Toleransı Mekanizmaları
3. Akıllı Veri Yönlendirme
4. Önbellekleme Teknikleri
5. Paralel Programlama Paradigmaları

  *Lütfen dikkat: Bu bölümde "AKTİF KONULAR (SORU ÜRETİLECEK)" ve "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" olmak üzere iki liste görebilirsin.*
- **Eğitim İçeriği:** 

Bilgisayar Mühendisliği Bölümü
Bahar –2025(ÖÖ.,İÖ.)
MBM7-452 -Eksaskala Bilgisayar Sistemleri
(Sunu 4)
Dr. Öğr. Üyesi Esra Çelik

Günün Sorusu
Eksaskala çağında oluşabilecek yazılım
zorlukları neler olabilir?

Eksaskala Çağında Yazılım Zorlukları
•Eksaskala bilgisayar sistemlerinde en sık görülen yazılım zolukları,
•geleneksel yazılım ve işletim sistemleri için büyük zorluklar oluşturur.
•Örneğin:
•Ölçeklenebilirlik: Geleneksel sistemler milyonlarca çekirdeği verimli yönetemez.
•Hata Toleransı: Büyük sistemlerde donanım arızaları sık görülür, dayanıklı
yazılım gerekir.
•Kaynak Yönetimi: Dinamik ve verimli kaynak kullanımı şarttır.
•Veri Hareketi:Büyük veri setlerinin hızlı taşınması ve depolanması gereklidir.
•Programlama:Paralel işlem için özel yazılım ve diller gereklidir.

Eksaskala Çağında Yazılım Zorlukları
•Eksaskaladaki zorluklara çözüm olarak:
•Hafif işletim sistemleri
•Veri yönetimi ve depolama çözümleri
•Uygulamalar için yazılımlar
•geliştirilmiştir.

Peki nedir bu
yapılar?

Hafif İşletim Sistemleri
•Geleneksel işletim sistemleri:
•Milyonlarca çekirdeği verimli yönetemez.
•Büyük sistemlerdekidonanım hatalarınıtolere edemez.
•CPU, GPUve TPU için optimize edilmemiştir.
•Güç tüketimini dinamik olarak ayarlanmaz.
•Hafif çekirdek tasarımlarına kıyasla gereksiz yük oluşturur.
•İş yüklerine göre esnek kaynak tahsisi yapamaz.
•Büyük veri setlerinin hızlı işlenmesini sağlayacak optimizasyonlardan
yoksundur.
•Geleneksel işletim sistemleri, eksaskala bilgisayar sistemlerinin gereksinimlerini
karşılayamadığı için yeni nesil ölçeklenebilir ve uyarlanabilir hafif işletim sistemleri
gereklidir.

Hafif İşletim Sistemleri
•Hafif işletim sistemleri, geleneksel işletim sistemlerine kıyasla:
•daha az kaynak tüketen,
•minimum düzeyde hizmet sunan ve
•yalnızca belirli görevleri (kritik görevleri) yerine getirmek için optimize edilmiş
sistemlerdir.
•Eksaskala sistemlerde hafif işletim sistemleri:
•Performans kayıplarını azaltır.
•Gereksiz arka plan işlemlerini ortadan kaldırır.
•Daha iyi bellek yönetimi sağlar.
•Daha hızlı işlem gerçekleştirir.
•TOSS (Tri-Lab Operating System Stack),eksaskala bilgisayar sistemleri için
tasarlanmış hafif ve yüksek performanslı bir işletim sistemi türüdür.

Hafif işletim
sistemlerinin bu
şekilde performans
göstermesini
sağlayan nedir?

Hafif İşletim Sistemleri
•Hafif çekirdek (Lightweight kernel),
•hafif işletim sisteminin en temel bileşeni olup,
•yalnızca temel işletim sistemi fonksiyonlarınıyerine getiren
yapılardır.
•Hafif çekirdek yapıları:
•Küçük ve hızlıdır.
•Gereksiz özellikleri barındırmaz.
•İhtiyaca göre modülerolarak genişletilebilir.
•Milyonlarca çekirdeği verimli şekilde yönetir.
•Düşük gecikmesağlar.
•Gerçek zamanlı ve yüksek performanslı hesaplamalar için idealdir.
Programlar
Donanım
İşletim Sistemi
Kullanıcılar


Hafif işletim sistemlerinde ne
gibi hatalar oluşur ve
çözümler neler olabilir?

Hafif İşletim Sistemlerinde Hata Toleransı
•Hafif işletim sistemlerinde:
•Hata oluştuğunda sistemin geri kalanı korunarak izole çalışma sağlanır.
•Hatalar erkenden algılanarak düzeltilmesi için otomatik hata yönetimi uygulanır.
•Sistem kilitlendiğinde, otomatik olarak yeniden başlatma sağlanır.
•Arızalanan bileşenler sistem çalışırken değiştirilebilir.
•Sistem hataları kayıt altına alınarak analiz edilir ve tekrar oluşmasını önleyici
önlemleralınır.
•Dağıtık sistemlerde bir düğüm hatalandığında, diğerleri devreye girerek işleyişi
devam ettirir.
•Kritik işlemler hata durumunda kesintiye uğramadan devam eder.


Hafif işletim sistemlerinde
dinamik kaynak yönetimi
nasıl olabilir?

Hafif İşletim Sistemlerinde Dinamik Kaynak Yönetimi
•Hafif işletim sistemlerinde milyonlarca işlem birimi arasında dinamik kaynak yönetim
için:
•İşlemciler arasında iş yükü dengelenerek performans artırılır.
•Değişken iş yüklerine göre kaynaklar otomatik olarak artırılır veya azaltılır.
•Anlık ihtiyaçlara göre kaynak kullanımı optimize edilir.
•Hata durumlarında sistem kesintisiz çalışmaya devam edecek şekilde kaynaklar
yeniden düzenlenir.
•Dağıtık mimaride bileşenler arasında hızlı veri akışı sağlanır.
•Boşta kalan kaynaklar düşük güç modunaalınarak enerji tasarrufu yapılır.
•Farklı uygulama türlerine göre en uygun kaynak yönetimi stratejisi seçilir.

Veri Yönetimi ve Depolama Çözümleri
•Eksaskala sistemlerinde yüksek kapasiteli depolama sistemlerinde:
•Akıllı tahmin algoritmalarıyla veriye hızlı erişim sağlanır.
•Veri kaybını önlemek için yedekleme, hata tespiti ve onarımyapılır.
•Enerji dostu donanım ve yazılımla güç tüketimi azaltılır.
•Veri aktarım darboğazlarını azaltmak için akıllı veri yönlendirme ve
önbellekleme teknikleri kullanılır.

Akıllı veri yönlendirme ve
önbellekleme
tekniklerinin avantajları
neler olabilir?

Veri Yönetimi ve Depolama Çözümleri
•Akıllı veri yönlendirme ve önbellekleme teknikleri ile:
•İçeriği kullanıcılara yakın sunuculardan sunar, ağ tıkanıklığını
azaltır.
•Ağ trafiğini dinamik yönlendirir, en uygun veri yollarını seçer.
•Popüler veriler RAM'de saklanarak disk erişimi azaltılır.
•Gelecekteki veri ihtiyaçları önceden tahmin edilip önbelleğe alınır
ve veri aktarımı hızlanır.

Uygulamalar İçin Yazılımlar
•Eksaskala bilgisayar sistemlerinde uygulamalar için yazılımlar :
•MPI, OpenMP ve CUDA, gibi geniş ölçekli paralel programlama paradigmaları
sunar.
•Dögü açma/kapama, vektörleştirme ve işlemciye özel optimizasyonlarsağlar.
•Verimli veri hareketi, önbellekleme stratejileri ile bellek erişimini optimize eder.
•Profiling, izleme ve hata ayıklama ile kod optimizasyonu desteği sunar.
•Heterojen kaynaklar arasında hesaplama iş yüklerini dengeler.
•Yapay zeka tabanlı analiz araçlarıyla veri odaklı kararlar alır.
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

  - Eksaskala Çağında Yazılım Zorlukları: 2 soru
  - Ölçeklenebilirlik Zorlukları: 2 soru
  - Hata Toleransı Gereksinimleri: 2 soru
  - Veri Hareketi Ve Depolama: 2 soru
  - Hafif Çekirdek Lightweight Kernel: 2 soru


### Soru Örnekleri (Her Alt Konudan 1 Adet):

#### Eksaskala Çağında Yazılım Zorlukları:
- Soru: Aşağıdakilerden hangisi eksaskala bilgisayar sistemlerinde karşılaşılan yazılım zorluklarından biri değildir?
- Seçenekler: Ölçeklenebilirlik | Hata toleransı | Kaynak yönetimi | Veri şifreleme
- Doğru Cevap: Veri şifreleme
- Zorluk: medium

#### Ölçeklenebilirlik Zorlukları:
- Soru: Eksaskala sistemlerde ölçeklenebilirlik zorluklarının temel nedeni nedir?
- Seçenekler: Geleneksel sistemlerin milyonlarca çekirdeği verimli yönetememesi | Yüksek enerji tüketimi | Veri depolama kapasitesinin yetersizliği | Programlama dillerinin uyumsuzluğu
- Doğru Cevap: Geleneksel sistemlerin milyonlarca çekirdeği verimli yönetememesi
- Zorluk: medium

#### Hata Toleransı Gereksinimleri:
- Soru: Eksaskala sistemlerde hata toleransı gereksinimlerinin artmasının temel nedeni nedir?
- Seçenekler: Büyük sistemlerde donanım arızalarının daha sık görülmesi | Yazılım hatalarının artması | Siber saldırıların artması | Enerji kesintilerinin sıklaşması
- Doğru Cevap: Büyük sistemlerde donanım arızalarının daha sık görülmesi
- Zorluk: medium

#### Veri Hareketi Ve Depolama:
- Soru: Eksaskala sistemlerde büyük veri setlerinin hızlı taşınması ve depolanması neden önemlidir?
- Seçenekler: Veri analiz süreçlerini hızlandırmak için | Enerji tüketimini azaltmak için | Maliyetleri düşürmek için | Güvenliği artırmak için
- Doğru Cevap: Veri analiz süreçlerini hızlandırmak için
- Zorluk: medium

#### Hafif Çekirdek Lightweight Kernel:
- Soru: Hafif çekirdek (Lightweight kernel) yapılarının temel amacı nedir?
- Seçenekler: Gereksiz özellikleri barındırarak sistemi daha kararlı hale getirmek | Sistem kaynaklarını daha fazla tüketerek performansı artırmak | Yalnızca temel işletim sistemi fonksiyonlarını yerine getirerek performansı optimize etmek | Geleneksel işletim sistemlerinin tüm özelliklerini taşımak
- Doğru Cevap: Yalnızca temel işletim sistemi fonksiyonlarını yerine getirerek performansı optimize etmek
- Zorluk: medium

