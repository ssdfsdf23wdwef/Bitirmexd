# Sınav Oluşturma Promptu

## Tarih: 2025-06-09T00:17:21.257Z

## Trace ID: quiz-1749428241244-55gov

## Alt Konular (7 adet):
```
## AKTİF KONULAR (SORU ÜRETİLECEK)

**Aşağıdaki alt konular için belirtilen sayıda soru üretilecektir:**

1. **Dosya Görüntüleme Ve Düzenleme** (2 soru)
2. **Dosya İçeriğini Görüntüleme Cat Less** (2 soru)
3. **Text Editörleri Nano Vi Vim** (2 soru)
4. **Dosyanın İlk Son Kısmını Görüntüleme Head Tail** (2 soru)
5. **Çalışan İşlemleri Görüntüleme Ps** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Disk Alanı Kullanımını Görüntüleme Df Du
2. Bellek Kullanımını Görüntüleme Free

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

1. **Dosya Görüntüleme Ve Düzenleme** (2 soru)
2. **Dosya İçeriğini Görüntüleme Cat Less** (2 soru)
3. **Text Editörleri Nano Vi Vim** (2 soru)
4. **Dosyanın İlk Son Kısmını Görüntüleme Head Tail** (2 soru)
5. **Çalışan İşlemleri Görüntüleme Ps** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Disk Alanı Kullanımını Görüntüleme Df Du
2. Bellek Kullanımını Görüntüleme Free

  *Lütfen dikkat: Bu bölümde "AKTİF KONULAR (SORU ÜRETİLECEK)" ve "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" olmak üzere iki liste görebilirsin.*
- **Eğitim İçeriği:** 


BİLGİSAYAR MÜHENDİSLİĞİ LABORATUVARI
BAHAR DÖNEMİ 2025
Öğretim Üyesi: Dr. Bilal USANMAZ
bilal@atauni.edu.tr



2.Hafta


Temel Linux Komutları-2

Amaç: Öğrencilerin KVM, Docker, Podman ve Kubernetes kurmak ve kullanmak için ihtiyaç
duyacakları temel işlemleri Linux komut satırında gerçekleştirebilmelerini sağlamak.

2. Dosya Görüntüleme ve Düzenleme
Dosyaların içeriklerini görüntülemek veya düzenlemek için kullanılan komutlar.
●
cat
: Dosya içeriğini birleştirir ve görüntüler.
○ Örnek:
cat file1.txt
(file1.txt'nin içeriğini görüntüler)
○
cat file1.txt file2.txt > file3.txt

●
less
: Geriye doğru gezinme ile dosya içeriğini etkileşimli olarak görüntüler
○ Örnek:
less file1.txt
(file1.txt dosyasını ileri ve geri gezinme ile görüntüler)
●
nano
: Basit bir text editörü
○ Örnek:
nano file1.txt
(file1.txt dosyasını editler)
●
vi
/
vim
: Gelişmiş text editörü
○ Örnek:
vi file1.txt
(file1.txt dosyasını editler)
●
head
: Bir dosyanın ilk kısmını çıktı olarak alır.
○ Örnek:
head file1.txt
(file1.txt dosyasının ilk 10 satırını gösterir)
●
tail
: Bir dosyanın son kısmını çıktı olarak alır.
○ Örnek:
tail file1.txt
(file1.txt dosyasının son 10 satırını gösterir)
●
grep
: Dosyalar içinde arama yapar
○ Örnek:
grep "test" file1.txt








3. Sistem Bilgisi ve İzleme
Sistem durumunu ve gerçek zamanlı izlemeyi sağlayan komutlar.
● ps: Çalışan işlemler hakkında bilgi verir.
○ Örnek: ps aux (tüm çalışan prosesleri gösterir)
● df: Disk alanı kullanımını görüntüler
○ Örnek: df -h (disk alanı bilgilerini insan tarafından okunabilir bir biçimde
gösterir)
● du: Dosya alanı kullanımını gösterir
○ Örnek: du -sh * (geçerli dizindeki her dosyanın/klasörün boyutunu
gösterir)
● free: Bellek kullanımını gösterir
○ Örnek: free -h (bellek kullanımını insan tarafından okunabilir bir
biçimde gösterir)
● uptime: Sistem çalışma süresini ve yük ortalamasını gösterir
○ Örnek: uptime
● dmesg: Kernel mesajlarını gösterir
○ Örnek: dmesg | grep error (sistem mesajlarında "error" arar)
● vmstat: Sanal bellek istatistiklerini gösterir
○ Örnek: vmstat (sistem performansını ve bellek kullanımını gösterir)



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

  - Dosya Görüntüleme Ve Düzenleme: 2 soru
  - Dosya İçeriğini Görüntüleme Cat Less: 2 soru
  - Text Editörleri Nano Vi Vim: 2 soru
  - Dosyanın İlk Son Kısmını Görüntüleme Head Tail: 2 soru
  - Çalışan İşlemleri Görüntüleme Ps: 2 soru


### Soru Örnekleri (Her Alt Konudan 1 Adet):

#### Dosya Görüntüleme Ve Düzenleme:
- Soru: Aşağıdaki komutlardan hangisi bir dosyanın içeriğini birleştirip görüntülemek için kullanılır?
- Seçenekler: less | cat | nano | vi
- Doğru Cevap: cat
- Zorluk: easy

#### Dosya İçeriğini Görüntüleme Cat Less:
- Soru: 'less' komutu hangi özelliği ile 'cat' komutundan ayrılır?
- Seçenekler: Dosya içeriğini birleştirebilmesi | Dosya içeriğini düzenleyebilmesi | Dosya içinde geriye doğru gezinme imkanı sunması | Dosya içeriğini şifreleyebilmesi
- Doğru Cevap: Dosya içinde geriye doğru gezinme imkanı sunması
- Zorluk: medium

#### Text Editörleri Nano Vi Vim:
- Soru: Hangi komut, basit bir metin düzenleyici olarak bilinir ve kullanımı kolay arayüzü ile öne çıkar?
- Seçenekler: vi | vim | nano | emacs
- Doğru Cevap: nano
- Zorluk: easy

#### Dosyanın İlk Son Kısmını Görüntüleme Head Tail:
- Soru: Aşağıdaki komutlardan hangisi bir dosyanın sadece ilk 5 satırını görüntülemek için kullanılır?
- Seçenekler: tail -n 5 | head -n 5 | cat -n 5 | less -n 5
- Doğru Cevap: head -n 5
- Zorluk: medium

#### Çalışan İşlemleri Görüntüleme Ps:
- Soru: Linux sistemlerde çalışan süreçleri (process) görüntülemek için kullanılan komut aşağıdakilerden hangisidir?
- Seçenekler: df | du | ps | free
- Doğru Cevap: ps
- Zorluk: easy

