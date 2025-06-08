# Sınav Oluşturma Promptu

## Tarih: 2025-06-08T21:30:21.826Z

## Trace ID: quiz-1749418221794-r1um4

## Alt Konular (8 adet):
```
## AKTİF KONULAR (SORU ÜRETİLECEK)

**Aşağıdaki alt konular için belirtilen sayıda soru üretilecektir:**

1. **Sanallaştırma Temelıkavramları** (2 soru)
2. **Sanallaştırma Tanımı Ve Amacı** (2 soru)
3. **Sanal Makine Vm İ Şleyişi** (2 soru)
4. **Hypervisorün Rolü Ve Fonksiyonları** (2 soru)
5. **Tip 1 Hypervisor Bare Metal** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Tip 2 Hypervisor Hosted
2. Masaüstü Sanallaştırma Desktop Virtualization
3. Depolama Sanallaştırma Storage Virtualization

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

1. **Sanallaştırma Temelıkavramları** (2 soru)
2. **Sanallaştırma Tanımı Ve Amacı** (2 soru)
3. **Sanal Makine Vm İ Şleyişi** (2 soru)
4. **Hypervisorün Rolü Ve Fonksiyonları** (2 soru)
5. **Tip 1 Hypervisor Bare Metal** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Tip 2 Hypervisor Hosted
2. Masaüstü Sanallaştırma Desktop Virtualization
3. Depolama Sanallaştırma Storage Virtualization

  *Lütfen dikkat: Bu bölümde "AKTİF KONULAR (SORU ÜRETİLECEK)" ve "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" olmak üzere iki liste görebilirsin.*
- **Eğitim İçeriği:** 


BİLGİSAYAR MÜHENDİSLİĞİ LABORATUVARI
BAHAR DÖNEMİ 2025
Öğretim Üyesi: Dr. Bilal USANMAZ
bilal@atauni.edu.tr



4. Hafta


Sanallaştırma Nedir?

Sanallaştırma, gerçek bilgisayar donanımının daha verimli kullanılmasını sağlayan bir tekniktir.

Sanallaştırma, bilgisayar donanımı üzerinde bir soyutlama katmanı oluşturmak için yazılımı
kullanır ve tek bir bilgisayarın donanım parçalarının (işlemciler, bellek, depolama vb.) sanal
makineler (VM'ler) olarak da bilinen birkaç sanal bilgisayara ayrılmasına olanak tanır [1] .

Sanal Makine Nedir ?

Sanal makineler (VM'ler), sanallaştırma teknolojisinin önemli bir parçasıdır ve esasen tek bir
fiziksel sunucu içindeki ayrı sanal bilgisayarlar olarak hareket eder. Fiziksel sunucunun bellek ve
işlem gücü gibi kaynaklarını farklı VM'ler arasında paylaşmak ve tahsis etmek için
hypervisor
verilen yazılımı kullanırlar [2].

Hypervisor Nedir ?

Hypervisor, sanal makineler (VM'ler) oluşturan ve çalıştıran bir yazılımdır. Bir hypervisor,
hypervisor işletim sistemini ve kaynaklarını sanal makinelerden izole eder ve bu VM'lerin
oluşturulmasını ve yönetilmesini sağlar.
Hypervisor yüklü fiziksel donanıma host ve bunun üzerindeki sanal makinelere de guest adı
verilir.
Hypervisor tarafından tahsis edilmek üzere kullanabileceği işlemci, bellek, depolama gibi
kaynaklara
pool ismi verilir.
Tüm hypervisor’lerin, VM'leri çalıştırmak için bellek yöneticisi, işlem zamanlayıcı, giriş/çıkış (G/Ç)
yığını, aygıt sürücüleri, güvenlik yöneticisi, ağ yığını ve daha fazlası gibi bazı işletim sistemi
düzeyindeki bileşenlere ihtiyacı vardır.
Hypervisor, her sanal makineye kaynak tahsis eder ve VM kaynaklarının fiziksel kaynaklara göre
zamanlamasını yönetir.Yürütmeyi hala fiziksel donanım yapıyor, dolayısıyla hypervisor programı
yönetirken fiziksel CPU hala VM'ler tarafından talep edildiği şekilde CPU talimatlarını yürütür.


Birden fazla farklı işletim sistemi yan yana çalışabilir ve aynı sanallaştırılmış donanım
kaynaklarını bir hypervisor sayesinde paylaşabilir. Bu, sanallaştırmanın önemli bir avantajıdır.
Sanallaştırma olmadan donanım üzerinde yalnızca 1 işletim sistemi çalıştırılabilir.
Hypervisor yazılımının ticari ve açık kaynak kodlu olmak üzere farklı seçenekleri mevcuttur.
VMware, sanallaştırma için popüler bir ticari yazılımdır ve ESXi hypervisor yazılımını ve vSphere
sanallaştırma platformunu sunmaktadır.
Kernel-based Virtual Machine (KVM) bir açık kaynak hypervisor seçeneğidir. Linux çekirdeği ile
birlikte gelmektedir. Ayrıca Xen ve Microsoft Hyper-V diğer hypervisor seneçekleridir.

Hypervisor Tipleri
Sanallaştırmada kullanılan hypervisor ler 2 tiptir. Bunlar; tip-1 ve tip-2 olarak ayrılmaktadır.
Tip-1 Hypervisor
Tip-1 hypervisor aynı zamanda native yada bare metal olarakta isimlendirilmektedir. Direk host
üzerinde çalışır ve guest işletim sistemlerini yönetir. Host üzerindeki donanım kaynakları
hypervisor tarafından yönetilir
Tip-1 hypervisor türü daha çok kurumsal veri merkezlerinde veya benzeri sunucu tabanlı
ortamlarda yaygın olarak kullanılmaktadır.
KVM, Microsoft Hyper-V, ve VMware vSphere tip-1 hypervisor örnekleridir. KVM 2007 yılında
linux ile tümleşik dağıtılmaya başlanmıştır.

Şekil-1: Tip-1 Sanallaştırma mimarisi



Tip-2
Tip-2 hypervisor, hosted hypervisor olarak da bilinmektedir. Tip-2 hypervisor, geleneksel
işletim sistemleri üzerinde bir yazılım katmanı yada uygulama olarak çalışmaktadır.
Konuk işletim sistemlerini ana işletim sisteminden soyutlayarak çalışır.
Tip-2 hypervisor, kişisel bilgisayarda birden fazla işletim sistemini çalıştırmak isteyen bireysel
kullanıcılar için iyi bir seçenektir.
VMware Workstation ve Oracle VirtualBox tip-2 hypervisor için iki örnektir [3].


Şekil-2: Tip-2 Sanallaştırma mimarisi
Sanallaştırma Türleri

● Desktop virtualization
● Storage virtualization
● Network virtualization
● Data virtualization
● Application virtualization
● Data center virtualization
● CPU virtualization
● GPU virtualization
● Linux virtualization
● Cloud virtualization



Desktop virtualization (Masaüstü Sanallaştırma)

Masaüstü sanallaştırma teknolojisi fiziksel istemci cihazından masaüstü ortamını ayırır. Fiziksel
cihaz olarak bir kişisel bilgisayar yada thin client kullanılabilirken kullanıcının masaüstü merkezi
bir sunucuda barındırılmaktadır. Bu teknoloji, kullanıcıların çeşitli cihaz ve konumlardan
masaüstlerine erişmesine ve bunlarla etkileşime girmesine olanak tanır [4].

Masaüstü sanallaştırma iki farklı biçime sahiptir:
1. Virtual desktop infrastructure (VDI): Birden fazla masaüstü merkezi sunucularda
barındırılan sanal makineler üzerinde çalışır ve onlara thin client lar üzerinden erişmek
isteyen kullanıcılara servis edilir. Bu şekilde VDI, bir kuruluşun kullanıcılarına, herhangi
bir cihaza işletim sistemi kurmadan, herhangi bir cihazdan çeşitli işletim sistemlerine
erişim sağlamasını imkan verir [1].


Şekil-3: VDI tipi masaüstü sanallaştırma

2. Local Desktop virtualization: Yerel bir bilgisayarda bir hypervisor çalıştırarak kullanıcının
o bilgisayarda ...(Kısaltıldı)
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

  - Sanallaştırma Temelıkavramları: 2 soru
  - Sanallaştırma Tanımı Ve Amacı: 2 soru
  - Sanal Makine Vm İ Şleyişi: 2 soru
  - Hypervisorün Rolü Ve Fonksiyonları: 2 soru
  - Tip 1 Hypervisor Bare Metal: 2 soru


### Soru Örnekleri (Her Alt Konudan 1 Adet):

#### Sanallaştırma Temelıkavramları:
- Soru: Aşağıdakilerden hangisi sanallaştırmanın temel amaçlarından biridir?
- Seçenekler: Donanım maliyetlerini artırmak | Gerçek bilgisayar donanımının daha verimli kullanılmasını sağlamak | İşletim sistemi uyumluluğunu azaltmak | Yazılım karmaşıklığını basitleştirmek
- Doğru Cevap: Gerçek bilgisayar donanımının daha verimli kullanılmasını sağlamak
- Zorluk: easy

#### Sanallaştırma Tanımı Ve Amacı:
- Soru: Sanallaştırmanın temel amacı aşağıdakilerden hangisidir?
- Seçenekler: Donanım kaynaklarını daha az verimli kullanmak | Tek bir işletim sistemini birden fazla donanım üzerinde çalıştırmak | Donanım kaynaklarının kullanımını en üst düzeye çıkarmak ve maliyetleri düşürmek | Uygulamaların uyumluluğunu azaltmak
- Doğru Cevap: Donanım kaynaklarının kullanımını en üst düzeye çıkarmak ve maliyetleri düşürmek
- Zorluk: easy

#### Sanal Makine Vm İ Şleyişi:
- Soru: Sanal makineler (VM'ler) hangi yazılım sayesinde fiziksel sunucunun kaynaklarını paylaşır ve yönetir?
- Seçenekler: İşletim Sistemi | Hypervisor | Donanım Sürücüsü | Uygulama Yazılımı
- Doğru Cevap: Hypervisor
- Zorluk: easy

#### Hypervisorün Rolü Ve Fonksiyonları:
- Soru: Hypervisor'ün temel görevi nedir?
- Seçenekler: Donanım sürücülerini güncellemek | Sanal makineler oluşturmak ve çalıştırmak | Ağ bağlantılarını yönetmek | Uygulama yazılımlarını derlemek
- Doğru Cevap: Sanal makineler oluşturmak ve çalıştırmak
- Zorluk: easy

#### Tip 1 Hypervisor Bare Metal:
- Soru: Tip 1 hypervisor'ler için aşağıdaki ifadelerden hangisi doğrudur?
- Seçenekler: İşletim sistemi üzerinde bir uygulama olarak çalışır. | Doğrudan donanım üzerinde çalışır. | Sadece kişisel bilgisayarlarda kullanılır. | Konuk işletim sistemlerinden bağımsız çalışmaz.
- Doğru Cevap: Doğrudan donanım üzerinde çalışır.
- Zorluk: medium

