# Sınav Oluşturma Promptu

## Tarih: 2025-06-07T23:51:53.035Z

## Trace ID: quiz-1749340313017-502wn

## Alt Konular (10 adet):
```
## AKTİF KONULAR (SORU ÜRETİLECEK)

**Aşağıdaki alt konular için belirtilen sayıda soru üretilecektir:**

1. **Ağ Arayüzü Yönetimi** (2 soru)
2. **İfconfiğiile Arayüz Yapılandırması** (2 soru)
3. **İp Komutu İle Ağ Yapılandırması** (2 soru)
4. **Pinğiile Ağ Bağlantısı Testi** (2 soru)
5. **Netstat İle Ağ Bağlantılarını Görüntüleme** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Ss İle Soket İ Statistiklerini Görüntüleme
2. Traceroute İle Yol Takibi
3. Nslookup İle Dns Sorgulama
4. Diğiile Dns Bilgisi Edinme
5. Curl İle Ağ İ Stekleri Gönderme

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

1. **Ağ Arayüzü Yönetimi** (2 soru)
2. **İfconfiğiile Arayüz Yapılandırması** (2 soru)
3. **İp Komutu İle Ağ Yapılandırması** (2 soru)
4. **Pinğiile Ağ Bağlantısı Testi** (2 soru)
5. **Netstat İle Ağ Bağlantılarını Görüntüleme** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Ss İle Soket İ Statistiklerini Görüntüleme
2. Traceroute İle Yol Takibi
3. Nslookup İle Dns Sorgulama
4. Diğiile Dns Bilgisi Edinme
5. Curl İle Ağ İ Stekleri Gönderme

  *Lütfen dikkat: Bu bölümde "AKTİF KONULAR (SORU ÜRETİLECEK)" ve "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" olmak üzere iki liste görebilirsin.*
- **Eğitim İçeriği:** 


BİLGİSAYAR MÜHENDİSLİĞİ LABORATUVARI
BAHAR DÖNEMİ 2025
Öğretim Üyesi: Dr. Bilal USANMAZ
bilal@atauni.edu.tr



3.Hafta


Temel Linux Komutları-3

Amaç: Öğrencilerin KVM, Docker, Podman ve Kubernetes kurmak ve kullanmak için ihtiyaç
duyacakları temel işlemleri Linux komut satırında gerçekleştirebilmelerini sağlamak.

3. Ağ yönetimi ve izleme
●
ifconfig
(İnterface Configuration)
Ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır.
Örnek: ifconfig (Ağ arayüzlerini listeleme)
Örnek: ifconfig eth0 (Belirli bir arayüzün IP adresini görüntüleme)
●
ip
(Ağ yapılandırması)
Örnek: ip addr show Ağ arayüzlerini listeleme
Örnek: sudo ip link set eth0 up Ağ arayüzünü etkinleştirme
Örnek: sudo ip link set eth0 down Ağ arayüzünü devre dışı bırakma
●
ping
(Ağ Bağlantısını Test Etme)
Bir ağdaki hedefe (genellikle başka bir cihaz veya sunucu) ICMP Echo istekleri gönderir.
Örnek: ping 10.112.0.1 Bir IP adresine ping gönderme
Örnek: ping -c 4 10.112.0.1 Belirli sayıda ping gönderme
●
netstat
(Ağ Bağlantılarını Görüntüleme)
Ağ bağlantıları ve istatistikleri hakkında bilgi verir.
Örnek: netstat Mevcut bağlantıları listeleme


Örnek: netstat -tuln Belirli bir portu dinleyen süreçleri listeleme
Örnek: netstat -i Ağ istatistiklerini görüntüleme
●
ss
(Socket Statistiği)
ss
komutu, aktif ağ bağlantılarını ve soket bilgilerini görüntüler ve
netstat
komutunun
modern bir alternatifi olarak kabul edilir.
Örnek: ss -t Mevcut TCP bağlantılarını listeleme
Örnek: ss -l Dinleyen soketleri listeleme
Örnek: ss -tuln Belirli bir portu dinleyen bağlantıları listeleme

●
traceroute
(Yol Takibi)
Bir hedefe giden yolun hangi ağ cihazları (router) üzerinden geçtiğini gösterir.
Örnek: traceroute google.com Bir hedefe doğru giden yolu izleme
●
nslookup
(DNS Sorgulama)
DNS sunucusu üzerinden bir alan adının IP adresini sorgular.
Örnek: nslookup google.com Bir alan adının IP adresini sorgulama
●
dig
(Domain Information Groper)
dig
, DNS sorguları yaparak bir alan adıyla ilgili daha ayrıntılı bilgi sağlar.
Örnek: dig google.com Bir alan adı için DNS sorgusu yapma
Örnek: dig google.com MX Alan adının MX kayıtlarını sorgulama
●
route
(Yönlendirme Tablosu)
Ağ yönlendirme tablosunu yönetmek için kullanılır.
Örnek: route -n Yönlendirme tablosunu görüntüleme
●
curl
(Ağ İstekleri)
Web sunucularına HTTP, HTTPS, FTP vb. protokollerle istekler gönderir.


Örnek: curl https://www.atauni.edu.tr Bir URL'ye HTTP isteği gönderme
●
wget
(Dosya İndirme)
Ağ üzerinden dosya indirmek için kullanılan komut.
wget
https://birimler.atauni.edu.tr/ogrenci-isleri-daire-baskanligi/wp-content/uploads/sites/18/2
020/07/Akademik-Takvim_2024_2025_17052024.pdf
●
mtr
(Ping ve Traceroute Kombinasyonu)
Ağ bağlantısının durumunu izler, ping ve traceroute'un birleşimi gibi çalışır.
Örnek: mtr google.com
Hedefe mtr ile izleme

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

  - Ağ Arayüzü Yönetimi: 2 soru
  - İfconfiğiile Arayüz Yapılandırması: 2 soru
  - İp Komutu İle Ağ Yapılandırması: 2 soru
  - Pinğiile Ağ Bağlantısı Testi: 2 soru
  - Netstat İle Ağ Bağlantılarını Görüntüleme: 2 soru


### Soru Örnekleri (Her Alt Konudan 1 Adet):

#### Ağ Arayüzü Yönetimi:
- Soru: Aşağıdakilerden hangisi 'ifconfig' komutunun temel kullanım amaçlarından biridir?
- Seçenekler: Ağ arayüzlerini listelemek ve yapılandırmak | DNS sunucusu üzerinden alan adının IP adresini sorgulamak | Web sunucularına HTTP istekleri göndermek | Ağ bağlantısının durumunu izlemek
- Doğru Cevap: Ağ arayüzlerini listelemek ve yapılandırmak
- Zorluk: easy

#### İfconfiğiile Arayüz Yapılandırması:
- Soru: Aşağıdakilerden hangisi 'ip' komutunun bir ağ arayüzünü etkinleştirmek için kullanılan doğru söz dizimidir?
- Seçenekler: sudo ip link set eth0 up | ip addr show eth0 | sudo ip link set eth0 down | ip config eth0 enable
- Doğru Cevap: sudo ip link set eth0 up
- Zorluk: medium

#### İp Komutu İle Ağ Yapılandırması:
- Soru: Aşağıdaki 'ip' komutlarından hangisi 'eth0' arayüzünü devre dışı bırakır?
- Seçenekler: sudo ip link set eth0 down | sudo ip link set eth0 up | ip addr show | ip route add default via 192.168.1.1
- Doğru Cevap: sudo ip link set eth0 down
- Zorluk: medium

#### Pinğiile Ağ Bağlantısı Testi:
- Soru: 'ping 10.112.0.1' komutu ne yapar?
- Seçenekler: 10.112.0.1 IP adresine ping gönderir | Mevcut bağlantıları listeler | Ağ arayüzlerini listeler | DNS sunucusuna sorgu gönderir
- Doğru Cevap: 10.112.0.1 IP adresine ping gönderir
- Zorluk: easy

#### Netstat İle Ağ Bağlantılarını Görüntüleme:
- Soru: 'netstat' komutu ne için kullanılır?
- Seçenekler: Ağ bağlantılarını ve istatistiklerini görüntülemek | Bir hedefe giden yolu izlemek | DNS sunucusuna sorgu göndermek | Web sunucularına istek göndermek
- Doğru Cevap: Ağ bağlantılarını ve istatistiklerini görüntülemek
- Zorluk: easy

