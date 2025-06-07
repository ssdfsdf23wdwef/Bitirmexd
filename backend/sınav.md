# Sınav Oluşturma Promptu

## Tarih: 2025-06-06T04:42:50.081Z

## Trace ID: quiz-1749184970062-uhl5g

## Alt Konular (8 adet):
```
## AKTİF KONULAR (SORU ÜRETİLECEK)

**Aşağıdaki alt konular için belirtilen sayıda soru üretilecektir:**

1. **Kvm Hypervisor Kurulumu** (2 soru)
2. **Gerekli Paketlerin Kurulumu** (2 soru)
3. **Libvirtd Servisini Yapılandırma** (2 soru)
4. **Kullanıcı Yetkilendirmesi** (2 soru)
5. **Virt İnstallıkomutu Kullanımı** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Sanal Makine Listeleme Ve Görüntüleme
2. Sanal Makine Durum Değişiklikleri
3. Sanal Makine Silme İ Şlemi

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

1. **Kvm Hypervisor Kurulumu** (2 soru)
2. **Gerekli Paketlerin Kurulumu** (2 soru)
3. **Libvirtd Servisini Yapılandırma** (2 soru)
4. **Kullanıcı Yetkilendirmesi** (2 soru)
5. **Virt İnstallıkomutu Kullanımı** (2 soru)

**Toplam Aktif: 5 alt konu, 10 soru**

## BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)

**Aşağıdaki konulardan soru üretilmeyecektir:**

1. Sanal Makine Listeleme Ve Görüntüleme
2. Sanal Makine Durum Değişiklikleri
3. Sanal Makine Silme İ Şlemi

  *Lütfen dikkat: Bu bölümde "AKTİF KONULAR (SORU ÜRETİLECEK)" ve "BEKLEYEN KONULAR (SORU ÜRETİLMEYECEK)" olmak üzere iki liste görebilirsin.*
- **Eğitim İçeriği:** 


BİLGİSAYAR MÜHENDİSLİĞİ LABORATUVARI
BAHAR DÖNEMİ 2025
Öğretim Üyesi: Dr. Bilal USANMAZ
bilal@atauni.edu.tr



5.Hafta


KVM (Tip-1 Hypervisor Kurulumu)

Aşağıdaki adresten ubuntu imajını indirilir
https://ubuntu.com/download/desktop/thank-you?version=22.04.1&architecture=amd64
İndirilen imajın ismi : ubuntu-22.04.1-desktop-amd64.iso

İmaj indirme süresini kısaltıp daha önce indirilmiş bir bilgisayardan kendi bilgisayarınıza almak
için aşağıdaki komutu XX ile gösterilen yerleri doğru doldurarak çalıştırınız.
scp hp00@10.4.15.209:/home/hp00/Downloads/ubuntu-22.04.1-desktop-amd64.iso /home/hpXX/Downloads

Kvm kurulumu
sudo apt update
sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils
sudo systemctl enable --now libvirtd
sudo systemctl start libvirtd
sudo systemctl status libvirtd
sudo usermod -aG kvm $USER
sudo usermod -aG libvirt $USER

Aşağıdaki dosyada gerekli değişiklikler yapılır (gerekliyse)
sudo nano /etc/libvirt/qemu.conf
Dosya içerisinde ctrl+w kombinasyonu ile #user aratılır, bulunan satırdaki # işareti kaldırılır
Dosya içerisinde ctrl+w kombinasyonu ile #group aratılır, bulunan satırdaki # işareti kaldırılır
Dosya ctrl+x ile kayıt edilerek çıkılır

Komut satırında aşağıdaki komut verilir
sudo systemctl restart libvirtd.service








VM kurulumu (aşağıdakiler bir sh dosya içine de yazılabilir, komut satırına da yazılabilir)

sudo virt-install --name=testVM \
--os-variant=ubuntu22.04 \
--vcpu=2 \
--ram=4096 \
--disk path=/var/lib/libvirt/images/testVM.img,size=30 \
--graphics spice \
--cdrom=/home/hpXX/Downloads/ubuntu-22.04.1-desktop-amd64.iso \
--network bridge:virbr0


Yeni kurulan sanal makinenin konumu yukarıdaki şekilde yeşil renk ile gösterilen “Guest Kernel”
kısmıdır.









Sanal Makinelerin Yönetilmesi
- Kurulu olan sanal makineleri ve durumlarını listeleyin

virsh list --all
- Çalışır durumda (running) olan sanal makineyi görüntüleyin

virt-viewer testVM
- Tüm sanal makineleri grafik arayüzden yönetin.
virt-manager

- Shut-down durumundaki bir sanal makineyi başlatma
virsh start testVM
- Bir sanal makineyi restart yapma
virsh reboot testVM

- Bir sanal makineyi kapatma
virsh shutdown testVM

- Bir sanal makineyi pause yapma
virsh suspend testVM

- Bir sanal makineyi unpause yapma
virsh resume testVM

- Bir sanal makineyi silme
Bir sanal makineyi silmek için iki işlem yapılmalıdır. Önce sanal makine destroy
edilmelidir sonrada undefine yapılmalıdır.
virsh destroy testVM
virsh undefine testVM



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

  - Kvm Hypervisor Kurulumu: 2 soru
  - Gerekli Paketlerin Kurulumu: 2 soru
  - Libvirtd Servisini Yapılandırma: 2 soru
  - Kullanıcı Yetkilendirmesi: 2 soru
  - Virt İnstallıkomutu Kullanımı: 2 soru


### Soru Örnekleri (Her Alt Konudan 1 Adet):

#### Kvm Hypervisor Kurulumu:
- Soru: KVM hypervisor kurulumu için gerekli paketlerden biri aşağıdakilerden hangisidir?
- Seçenekler: qemu-kvm | docker | virtualbox | vmware
- Doğru Cevap: qemu-kvm
- Zorluk: easy

#### Gerekli Paketlerin Kurulumu:
- Soru: KVM kurulumu için gerekli paketlerin kurulumunda kullanılan komut aşağıdakilerden hangisidir?
- Seçenekler: sudo apt update | sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils | sudo systemctl enable --now libvirtd | sudo usermod -aG kvm $USER
- Doğru Cevap: sudo apt install -y qemu-kvm virt-manager libvirt-daemon-system virtinst libvirt-clients bridge-utils
- Zorluk: easy

#### Libvirtd Servisini Yapılandırma:
- Soru: Libvirtd servisinin otomatik olarak başlamasını sağlamak için hangi komut kullanılır?
- Seçenekler: sudo systemctl start libvirtd | sudo systemctl enable libvirtd | sudo systemctl restart libvirtd | sudo systemctl status libvirtd
- Doğru Cevap: sudo systemctl enable libvirtd
- Zorluk: easy

#### Kullanıcı Yetkilendirmesi:
- Soru: Kullanıcının KVM sanal makinelerini yönetebilmesi için hangi gruplara eklenmesi gerekir?
- Seçenekler: kvm ve libvirt | root ve admin | qemu ve kvm | libvirt ve qemu
- Doğru Cevap: kvm ve libvirt
- Zorluk: easy

#### Virt İnstallıkomutu Kullanımı:
- Soru: `virt-install` komutunda kullanılan `--disk path=/var/lib/libvirt/images/testVM.img,size=30` parametresi neyi ifade eder?
- Seçenekler: Sanal makinenin adını | Sanal makineye ayrılan RAM miktarını | Sanal makine diskinin konumunu ve boyutunu | Sanal makine için kullanılacak işletim sistemi varyantını
- Doğru Cevap: Sanal makine diskinin konumunu ve boyutunu
- Zorluk: medium

