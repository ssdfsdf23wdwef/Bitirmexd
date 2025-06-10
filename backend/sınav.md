# Sınav Oluşturma Promptu

## Tarih: 2025-06-10T17:53:23.154Z

## Trace ID: quiz-1749578003103-f7e96

## Alt Konular (8 adet):
```
## AKTİF KONULAR (SORU ÜRETİLECEK)

**Aşağıdaki alt konular için belirtilen sayıda soru üretilecektir:**

1. **Konteynerizasyonun Tanımı Ve İ Şlevi** (2 soru)
2. **Uygulama Ve Bağımlılık Paketleme** (2 soru)
3. **İ Zole Ortamda Çalıştırma** (2 soru)
4. **Taşınabilirlik Ve Uyumluluk** (2 soru)
5. **Hız Ve Verimlilik** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Ölçeklenebilirlik Ve Yönetim
2. Yazılım Geliştirme Ve Devops
3. Mikroservisler Ve Bulut Bilişim

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

1. **Konteynerizasyonun Tanımı Ve İ Şlevi** (2 soru)
2. **Uygulama Ve Bağımlılık Paketleme** (2 soru)
3. **İ Zole Ortamda Çalıştırma** (2 soru)
4. **Taşınabilirlik Ve Uyumluluk** (2 soru)
5. **Hız Ve Verimlilik** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Ölçeklenebilirlik Ve Yönetim
2. Yazılım Geliştirme Ve Devops
3. Mikroservisler Ve Bulut Bilişim

  *Lütfen dikkat: Bu bölümde "AKTİF KONULAR (SORU ÜRETİLECEK)" ve "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" olmak üzere iki liste görebilirsin.*
- **Eğitim İçeriği:** 


BİLGİSAYAR MÜHENDİSLİĞİ LABORATUVARI
BAHAR DÖNEMİ 2025
Öğretim Üyesi: Dr. Bilal USANMAZ
bilal@atauni.edu.tr



6.Hafta



Şekil: VM ve konteyner mimarileri


Şekil: Nvidia konteyner örnek gösterimi




Konteynerizasyon nedir?

Konteynerleştirme, bir uygulamanın kodunu herhangi bir altyapıda çalıştırmak için ihtiyaç
duyduğu tüm dosya ve kütüphanelerle bir araya getiren bir yazılım dağıtım işlemidir.
Geleneksel olarak bilgisayarınızda herhangi bir uygulamayı çalıştırmak için makinenin işletim
sistemiyle eşleşen sürümünün yüklenmesi gerekmektedir. Örneğin, bir yazılım paketinin
Windows sürümünü bir Windows makinesine yüklemeniz gerekiyordu. Ancak
konteynerleştirmeyle her tür cihaz ve işletim sisteminde çalışan tek bir yazılım paketi veya
konteyner oluşturabilir[1].

Konteynerleştirme, bir uygulamanın tüm bileşenlerinin tek bir konteyner imajında toplandığı ve
aynı paylaşılan işletim sistemi üzerinde izole edilmiş kullanıcı alanında çalıştırılabildiği bir
sanallaştırma türüdür[3].

Yazılım mühendisliğinde konteynerleştirme, yazılım uygulamalarının türü veya satıcısı ne olursa
olsun herhangi bir bulut veya bulut dışı ortamda konteyner adı verilen yalıtılmış kullanıcı
alanlarında çalışabilmesi için işletim sistemi düzeyinde sanallaştırma veya birden fazla ağ
kaynağı üzerinden uygulama düzeyinde sanallaştırmadır[4].

Konteynerleştirme, yazılım kodunun kütüphaneler, framework ler ve diğer bağımlılıklar gibi
gerekli tüm bileşenlerle birlikte paketlenmesidir[5].


Konteynerleştirme, bir uygulamayı ve onun bağımlılıklarını (kütüphaneler, çerçeveler vb.)
konteyner adı verilen standart bir birime paketleyen bir yazılım dağıtım yöntemidir. Bu
konteyner, uygulamayı izole ederek, temeldeki işletim sistemi ne olursa olsun her türlü altyapı
üzerinde tutarlı ve verimli bir şekilde çalışmasına olanak tanır. Bu taşınabilirlik ve verimlilik,
konteynerleri modern bulutta yerel uygulamalar için ideal hale getirir.










Konteyner teknolojisi, son yıllarda yazılım geliştirme ve dağıtımı için oldukça popüler hale
gelmiştir. Bu popülerliğin arkasında yatan birçok neden var:
1. Taşınabilirlik: Konteynerler, işletim sisteminden bağımsız bir şekilde çalışabilirler. Bu, bir
konteynerin herhangi bir Linux dağıtımı, Windows veya macOS üzerinde çalıştırılabileceği
anlamına gelir. Bu taşınabilirlik, geliştiricilerin ve operatörlerin uygulamaları farklı ortamlarda
kolayca dağıtmalarını ve çalıştırmalarını sağlar.
2. Hız: Konteynerler, sanal makinelerden (VM'ler) çok daha hızlı bir şekilde başlatılabilir ve
durdurulabilir. Bu, uygulamaların daha hızlı bir şekilde geliştirilmesine, test edilmesine ve
dağıtılmasına yardımcı olur.
3. Verimlilik: Konteynerler, işletim sistemi kaynaklarını VM'lerden daha verimli bir şekilde
kullanır. Bu, daha az sunucu ve altyapı ile daha fazla uygulama çalıştırabileceğiniz anlamına
gelir.
4. Ölçeklenebilirlik: Konteynerler, otomatik olarak ölçeklendirilebilir. Bu, uygulamanızın trafik
yükü arttıkça veya azaldıkça otomatik olarak daha fazla veya daha az konteyner başlatarak veya
durdurarak kaynaklarınızı optimize edebileceğiniz anlamına gelir.
5. Güvenlik: Konteynerler, her uygulama için ayrı bir izolasyon katmanı sağlayarak güvenliği
artırır. Bu, bir uygulamadaki bir güvenlik açıklığının diğer uygulamaları etkilemesini önler.
6. Kolay Yönetim: Konteynerler, Docker gibi araçlarla kolayca yönetilebilir. Bu, birden fazla
konteynerden oluşan karmaşık uygulamaları bile kolayca yönetmenize ve izlemenize yardımcı
olur.

Konteyner Teknolojisinin Kullanım Alanları:
Konteyner teknolojisi, çeşitli alanlarda kullanılmaktadır:
● Yazılım Geliştirme: Konteynerler, geliştiricilerin uygulamaları yerel ortamlarında test
etmelerini ve dağıtmadan önce hata ayıklamalarını sağlar.
● DevOps: Konteynerler, CI/CD (Sürekli Entegrasyon/Sürekli Dağıtım) süreçlerini
otomatikleştirmeye ve hızlandırmaya yardımcı olur.
● Mikroservisler: Konteynerler, mikroservis mimarisini uygulamak için idealdir.
● Bulut Bilişim: Konteynerler, bulut ortamında uygulamaları dağıtmak ve yönetmek için
idealdir.


Uygulama
01_konteyner_kurulumu.txt
02_konteyner_calistirma.txt




Kaynaklar:

https://aws.amazon.com/what-is/containerization/
https://www.ibm.com/topics/containerization
https://www.checkpoint.com/cyber-hub/cloud-security/what-is-container-security/what-is-cont
ainerization/
https://en.wikipedia.org/wiki/Containerization_(computing)
https://www.redhat.com/en/topics/cloud-native-apps/what-is-containerization


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

  - Konteynerizasyonun Tanımı Ve İ Şlevi: 2 soru
  - Uygulama Ve Bağımlılık Paketleme: 2 soru
  - İ Zole Ortamda Çalıştırma: 2 soru
  - Taşınabilirlik Ve Uyumluluk: 2 soru
  - Hız Ve Verimlilik: 2 soru


### Soru Örnekleri (Her Alt Konudan 1 Adet):

#### Konteynerizasyonun Tanımı Ve İ Şlevi:
- Soru: Konteynerizasyonun temel amacı nedir?
- Seçenekler: Uygulamaları sanal makinelerde çalıştırmak | Uygulama kodunu, ihtiyaç duyduğu tüm dosya ve kütüphanelerle bir araya getirerek herhangi bir altyapıda çalıştırmak | İşletim sistemini güncellemek | Donanım kaynaklarını yönetmek
- Doğru Cevap: Uygulama kodunu, ihtiyaç duyduğu tüm dosya ve kütüphanelerle bir araya getirerek herhangi bir altyapıda çalıştırmak
- Zorluk: easy

#### Uygulama Ve Bağımlılık Paketleme:
- Soru: Konteynerleştirme sürecinde uygulama ve bağımlılık paketleme ne anlama gelir?
- Seçenekler: Uygulamanın sadece kaynak kodunun paketlenmesi | Uygulamanın çalışması için gerekli olan tüm kütüphanelerin, framework'lerin ve diğer bağımlılıkların uygulama ile birlikte paketlenmesi | Uygulamanın sadece işletim sistemi ile paketlenmesi | Uygulamanın sadece kullanıcı arayüzünün paketlenmesi
- Doğru Cevap: Uygulamanın çalışması için gerekli olan tüm kütüphanelerin, framework'lerin ve diğer bağımlılıkların uygulama ile birlikte paketlenmesi
- Zorluk: easy

#### İ Zole Ortamda Çalıştırma:
- Soru: Konteynerlerin izole ortamda çalıştırılması ne gibi avantajlar sağlar?
- Seçenekler: Diğer uygulamalarla kaynak paylaşımını kolaylaştırır | Uygulamaların birbirini etkilemesini engeller ve güvenliği artırır | İşletim sistemi güncellemelerini hızlandırır | Donanım maliyetlerini artırır
- Doğru Cevap: Uygulamaların birbirini etkilemesini engeller ve güvenliği artırır
- Zorluk: medium

#### Taşınabilirlik Ve Uyumluluk:
- Soru: Konteynerlerin taşınabilirliği ve uyumluluğu ne anlama gelir?
- Seçenekler: Sadece aynı işletim sisteminde çalışabilme | Farklı işletim sistemleri ve altyapılar arasında kolayca taşınabilme ve çalışabilme | Sadece bulut ortamında çalışabilme | Sadece geliştirme ortamında çalışabilme
- Doğru Cevap: Farklı işletim sistemleri ve altyapılar arasında kolayca taşınabilme ve çalışabilme
- Zorluk: easy

#### Hız Ve Verimlilik:
- Soru: Konteynerlerin hız ve verimlilik avantajları nelerdir?
- Seçenekler: Sanal makinelere göre daha yavaş başlatılmaları ve daha fazla kaynak tüketmeleri | Sanal makinelere göre daha hızlı başlatılmaları ve daha az kaynak tüketmeleri | Sadece belirli donanımlarda verimli çalışabilmeleri | Geliştirme süreçlerini yavaşlatmaları
- Doğru Cevap: Sanal makinelere göre daha hızlı başlatılmaları ve daha az kaynak tüketmeleri
- Zorluk: easy

