# Sınav Oluşturma Promptu

## Tarih: 2025-05-22T11:03:33.173Z

## Trace ID: quiz-1747911813149-hyp2c

## Alt Konular (9 adet):
```
## AKTİF KONULAR (SORU ÜRETİLECEK)

**Aşağıdaki alt konular için belirtilen sayıda soru üretilecektir:**

1. **S Perbilgisayar S Ralama Listeleri** (2 soru)
2. **Top500 Tan M Ve Amac** (2 soru)
3. **Hpcğitan M Ve Amac** (2 soru)
4. **Green500 Tan M Ve Amac** (2 soru)
5. **Linpack Testi Ve Flops** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Linpack Testinin K S Tlamalar
2. Konjugat Gradyan Y Ntemi
3. Bellek Ve Veri Transfer Performans
4. Flops Watt Oran

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

1. **S Perbilgisayar S Ralama Listeleri** (2 soru)
2. **Top500 Tan M Ve Amac** (2 soru)
3. **Hpcğitan M Ve Amac** (2 soru)
4. **Green500 Tan M Ve Amac** (2 soru)
5. **Linpack Testi Ve Flops** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Linpack Testinin K S Tlamalar
2. Konjugat Gradyan Y Ntemi
3. Bellek Ve Veri Transfer Performans
4. Flops Watt Oran

  *Lütfen dikkat: Bu bölümde "AKTİF KONULAR (SORU ÜRETİLECEK)" ve "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" olmak üzere iki liste görebilirsin.*
- **Eğitim İçeriği:** 

Bilgisayar Mühendisliği Bölümü
Bahar –2025(ÖÖ.,İÖ.)
MBM7-452 -Eksaskala Bilgisayar Sistemleri
(Sunu 6)
Dr. Öğr. Üyesi Esra Çelik

Süperbilgisayar Dünyasında Sıralama
•Süperbilgisayarlar, yüksek hesaplama gücüyle bilimsel
araştırmalardan yapay zekaya kadar pek çok alanda kullanılır.
•Bu sistemlerin hızını, verimliliğini ve gerçek performansını
değerlendiren üç temel liste vardır:
•TOP500
•HPCG (High Performance Conjugate Gradient)
•Green500

TOP500
•TOP500,
•dünyanın en hızlı 500 süperbilgisayarını hesaplama gücüne göre
sıralar.
•1993’ten bu yana yılda iki kez (Haziran ve Kasım aylarında)
yayımlanmaktadır.
•Performansodaklıdır.
•En yüksek hesaplama gücü kimde?sorusunun cevabını verir.

TOP500
•Sıralama ölçütü olarak LINPACK testi kullanılır.
•Bu test:
•Süperbilgisayarın ne kadar hızlı işlem yapabildiğini yanisistemin
floating-point işlemleri (FLOPS) performansını ölçer.
•Matris çözümlemeye dayalıdır.
•Bellek kullanımı, veri aktarımı veya gerçek dünya uygulamalarındaki
performansı tam olarak yansıtmaz.

TOP500
•Kasım 2024 TOP500 listesinde ElCapiton ilk sırada yer alır.

HPCG
•HPCG,
•bellek, iletişim ve veri akış performansını test eder.
•Gerçek dünya uygulamalarına odaklanır.
•TOP500’ün eksik kaldığı noktaları tamamlamak için alternatif olarak
geliştirilmiştir.
•Gerçek dünya uygulamalarına (mühendislik hesaplamaları vb.) daha
yakındır.

HPCG
•Sıralama ölçütü olarak HPCG testi kullanılır.
•Bu test:
•İteratif bir doğrusal denklem çözme yöntemi olan Konjugat
Gradyanyöntemini kullanılır.
•Bellek erişimi, iletişim yeteneği ve veri transfer performansını test
eder

HPCG
•Kasım 2024 HPCG listesinde Fugaku ilk sırada yer alır.

Green500
•Green500,
•enerji verimliliğini temel alarak süperbilgisayarları sıralayan
listedir.
•Çevreci yaklaşıma odaklanır.
•Verimli, sürdürülebilir HPC sistemlerini teşvik eder.
•Sıralama ölçütü olarak FLOPS/Wattoranına bakar.
•Yani, 1 watt enerji başına ne kadar işlem yapıldığı değerlendirilir.

Green500
•Kasım 2024 Green500 listesinde JEDI ilk sırada yer alır.

Listelerin Karşılaştırılması
ListeOdak NoktasıTest (Benchmark)Amaç
TOP500Ham hesaplama gücü
(FLOPS)
LINPACKEn hızlı
süperbilgisayarları
belirlemek
HPCGBellek, iletişim ve
gerçekçi yük
HPCGGerçek
uygulamalardaki
performansı ölçmek
Green500Enerji verimliliğiFLOPS/WattEn verimli
süperbilgisayarları
sıralamak
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
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Aşağıdakilerden hangisi süperbilgisayarları değerlendiren temel listelerden biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": ["TOP500", "HPCG", "Green500", "Blue500"],
      "correctAnswer": "Blue500",
      "explanation": "TOP500, HPCG ve Green500 süperbilgisayarları değerlendiren temel listelerdir. Blue500 diye bir liste bulunmamaktadır. Bu bilgi sununun ilk bölümlerinde yer almaktadır.",
      "subTopicName": "Süperbilgisayar Dünyasında Sıralama Listeleri",
      "normalizedSubTopicName": "superbilgisayar_dunyasi_siralama_listeleri",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Süperbilgisayarların kullanım alanlarına hangi örnek verilemez?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": ["Bilimsel araştırmalar", "Yapay zeka", "Hava durumu tahmini", "Ev tipi basit hesaplamalar"],
      "correctAnswer": "Ev tipi basit hesaplamalar",
      "explanation": "Süperbilgisayarlar yüksek hesaplama gücü gerektiren bilimsel araştırmalar, yapay zeka ve hava durumu tahmini gibi alanlarda kullanılır. Ev tipi basit hesaplamalar için süperbilgisayarlara ihtiyaç yoktur. Bu bilgi sununun ilk bölümlerinde yer almaktadır.",
      "subTopicName": "Süperbilgisayar Dünyasında Sıralama Listeleri",
      "normalizedSubTopicName": "superbilgisayar_dunyasi_siralama_listeleri",
      "difficulty": "easy"
    },
    {
      "id": "q3",
      "questionText": "TOP500 listesi hangi yıldan beri yayınlanmaktadır ve yılda kaç kez güncellenir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": ["1993'ten beri, yılda iki kez", "2000'den beri, yılda bir kez", "1990'dan beri, yılda dört kez", "1995'ten beri, yılda üç kez"],
      "correctAnswer": "1993'ten beri, yılda iki kez",
      "explanation": "TOP500 listesi 1993'ten bu yana yılda iki kez (Haziran ve Kasım aylarında) yayınlanmaktadır. Bu bilgi sununun TOP500 bölümünde yer almaktadır.",
      "subTopicName": "TOP500 Tanımı Ve Amacı",
      "normalizedSubTopicName": "top500_tanimi_ve_amaci",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "TOP500 listesinin temel amacı nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": ["Enerji verimliliğini ölçmek", "Bellek performansını değerlendirmek", "En hızlı süperbilgisayarları belirlemek", "Gerçek dünya uygulamalarındaki performansı ölçmek"],
      "correctAnswer": "En hızlı süperbilgisayarları belirlemek",
      "explanation": "TOP500 listesinin temel amacı, en yüksek hesaplama gücüne sahip yani en hızlı süperbilgisayarları belirlemektir. Bu bilgi sununun TOP500 bölümünde yer almaktadır.",
      "subTopicName": "TOP500 Tanımı Ve Amacı",
      "normalizedSubTopicName": "top500_tanimi_ve_amaci",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "HPCG'nin (High Performance Conjugate Gradient) temel odak noktası nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": ["Ham hesaplama gücü", "Enerji verimliliği", "Bellek, iletişim ve veri akış performansı", "Sadece floating-point işlemleri"],
      "correctAnswer": "Bellek, iletişim ve veri akış performansı",
      "explanation": "HPCG, bellek, iletişim ve veri akış performansını test etmeye odaklanır. Bu bilgi sununun HPCG bölümünde yer almaktadır.",
      "subTopicName": "HPCG Tanımı Ve Amacı",
      "normalizedSubTopicName": "hpcg_tanimi_ve_amaci",
      "difficulty": "medium"
    },
    {
      "id": "q6",
      "questionText": "HPCG, hangi listedeki eksiklikleri tamamlamak için bir alternatif olarak geliştirilmiştir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": ["Green500", "TOP500", "Graph500", "HPL-AI"],
      "correctAnswer": "TOP500",
      "explanation": "HPCG, TOP500'ün eksik kaldığı noktaları tamamlamak için alternatif olarak geliştirilmiştir. Bu bilgi sununun HPCG bölümünde yer almaktadır.",
      "subTopicName": "HPCG Tanımı Ve Amacı",
      "normalizedSubTopicName": "hpcg_tanimi_ve_amaci",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "Green500 listesi süperbilgisayarları neye göre sıralar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": ["Ham hesaplama gücüne", "Bellek performansına", "Enerji verimliliğine", "Veri aktarım hızına"],
      "correctAnswer": "Enerji verimliliğine",
      "explanation": "Green500, enerji verimliliğini temel alarak süperbilgisayarları sıralayan listedir. Bu bilgi sununun Green500 bölümünde yer almaktadır.",
      "subTopicName": "Green500 Tanımı Ve Amacı",
      "normalizedSubTopicName": "green500_tanimi_ve_amaci",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "Green500 listesinde sıralama ölçütü olarak ne kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": ["FLOPS", "Watt", "FLOPS/Watt", "HPCG Testi"],
      "correctAnswer": "FLOPS/Watt",
      "explanation": "Green500 listesinde sıralama ölçütü olarak FLOPS/Watt oranına bakılır. Yani, 1 watt enerji başına ne kadar işlem yapıldığı değerlendirilir. Bu bilgi sununun Green500 bölümünde yer almaktadır.",
      "subTopicName": "Green500 Tanımı Ve Amacı",
      "normalizedSubTopicName": "green500_tanimi_ve_amaci",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "LINPACK testi neyi ölçer?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": ["Bellek erişim hızını", "Enerji tüketimini", "Sistemin floating-point işlemleri (FLOPS) performansını", "Veri transfer hızını"],
      "correctAnswer": "Sistemin floating-point işlemleri (FLOPS) performansını",
      "explanation": "LINPACK testi, süperbilgisayarın ne kadar hızlı işlem yapabildiğini yani sistemin floating-point işlemleri (FLOPS) performansını ölçer. Bu bilgi sununun TOP500 bölümünde yer almaktadır.",
      "subTopicName": "Linpack Testi Ve Flops",
      "normalizedSubTopicName": "linpack_testi_ve_flops",
      "difficulty": "medium"
    },
    {
      "id": "q10",
      "questionText": "LINPACK testinin temelinde hangi matematiksel işlem yatar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": ["İstatistiksel analiz", "Matris çözümleme", "Veri sıkıştırma", "Kriptografik şifreleme"],
      "correctAnswer": "Matris çözümleme",
      "explanation": "LINPACK testi matris çözümlemeye dayalıdır. Bu bilgi sununun TOP500 bölümünde yer almaktadır.",
      "subTopicName": "Linpack Testi Ve Flops",
      "normalizedSubTopicName": "linpack_testi_ve_flops",
      "difficulty": "medium"
    }
  ]
}
```
```



## İşlenen Sorular Analizi:

- Toplam Soru Sayısı: 10
- Alt Konu Dağılımı:

  - Süperbilgisayar Dünyasında Sıralama Listeleri: 2 soru
  - TOP500 Tanımı Ve Amacı: 2 soru
  - HPCG Tanımı Ve Amacı: 2 soru
  - Green500 Tanımı Ve Amacı: 2 soru
  - Linpack Testi Ve Flops: 2 soru


### Soru Örnekleri (Her Alt Konudan 1 Adet):

#### Süperbilgisayar Dünyasında Sıralama Listeleri:
- Soru: Aşağıdakilerden hangisi süperbilgisayarları değerlendiren temel listelerden biri değildir?
- Seçenekler: TOP500 | HPCG | Green500 | Blue500
- Doğru Cevap: Blue500
- Zorluk: easy

#### TOP500 Tanımı Ve Amacı:
- Soru: TOP500 listesi hangi yıldan beri yayınlanmaktadır ve yılda kaç kez güncellenir?
- Seçenekler: 1993'ten beri, yılda iki kez | 2000'den beri, yılda bir kez | 1990'dan beri, yılda dört kez | 1995'ten beri, yılda üç kez
- Doğru Cevap: 1993'ten beri, yılda iki kez
- Zorluk: easy

#### HPCG Tanımı Ve Amacı:
- Soru: HPCG'nin (High Performance Conjugate Gradient) temel odak noktası nedir?
- Seçenekler: Ham hesaplama gücü | Enerji verimliliği | Bellek, iletişim ve veri akış performansı | Sadece floating-point işlemleri
- Doğru Cevap: Bellek, iletişim ve veri akış performansı
- Zorluk: medium

#### Green500 Tanımı Ve Amacı:
- Soru: Green500 listesi süperbilgisayarları neye göre sıralar?
- Seçenekler: Ham hesaplama gücüne | Bellek performansına | Enerji verimliliğine | Veri aktarım hızına
- Doğru Cevap: Enerji verimliliğine
- Zorluk: easy

#### Linpack Testi Ve Flops:
- Soru: LINPACK testi neyi ölçer?
- Seçenekler: Bellek erişim hızını | Enerji tüketimini | Sistemin floating-point işlemleri (FLOPS) performansını | Veri transfer hızını
- Doğru Cevap: Sistemin floating-point işlemleri (FLOPS) performansını
- Zorluk: medium

