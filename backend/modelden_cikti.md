# AI Model Yanıtı

Tarih: 2025-06-06T04:13:19.015Z
Trace ID: quiz-1749183184657-62slc
Yanıt Uzunluğu: 7898 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Aşağıdakilerden hangisi 'ifconfig' komutunun temel işlevlerinden biridir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Ağ arayüzlerini listelemek ve yapılandırmak",
        "DNS sunucusu üzerinden alan adı sorgulamak",
        "Ağ bağlantısının durumunu izlemek",
        "Web sunucularına HTTP istekleri göndermek"
      ],
      "correctAnswer": "Ağ arayüzlerini listelemek ve yapılandırmak",
      "explanation": "'ifconfig' (Interface Configuration) komutu, ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır. Metinde belirtildiği gibi, 'ifconfig' komutu ağ arayüzlerini listeleme ve belirli bir arayüzün IP adresini görüntüleme gibi işlevlere sahiptir.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme Araçları",
      "normalizedSubTopicName": "ag_yonetimi_ve_i_zleme_araclari",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "'ifconfig eth0' komutu ile hangi işlem gerçekleştirilir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "Tüm ağ arayüzlerini listeler",
        "eth0 arayüzünün IP adresini görüntüler",
        "Ağ istatistiklerini görüntüler",
        "Mevcut bağlantıları listeler"
      ],
      "correctAnswer": "eth0 arayüzünün IP adresini görüntüler",
      "explanation": "Metinde belirtildiği gibi, 'ifconfig eth0' komutu belirli bir arayüzün (bu örnekte eth0) IP adresini görüntülemek için kullanılır.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme Araçları",
      "normalizedSubTopicName": "ag_yonetimi_ve_i_zleme_araclari",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "Aşağıdakilerden hangisi 'ifconfig' komutu ile bir arayüzü yapılandırmak için kullanılan parametrelerden biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "ip addr",
        "netmask",
        "broadcast",
        "gateway"
      ],
      "correctAnswer": "ip addr",
      "explanation": "Metinde 'ifconfig' komutu ile ilgili örneklerde 'netmask', 'broadcast' ve 'gateway' gibi parametrelerin kullanımına dair doğrudan bir bilgi bulunmamaktadır. Ancak 'ip addr' komutu 'ip' komutu ile ağ arayüzlerini listelemek için kullanılır, 'ifconfig' ile değil.",
      "subTopicName": "İfconfiğiile Arayüz Yapılandırması",
      "normalizedSubTopicName": "ifconfigiile_arayuz_yapilandirmasi",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "'ifconfig' komutunun kullanım amacı nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Ağ arayüzlerini yapılandırmak ve görüntülemek",
        "DNS sunucularını sorgulamak",
        "Ağdaki paket kaybını tespit etmek",
        "Sistemdeki disk kullanımını izlemek"
      ],
      "correctAnswer": "Ağ arayüzlerini yapılandırmak ve görüntülemek",
      "explanation": "'ifconfig' komutu, ağ arayüzlerini yapılandırmak ve görüntülemek için kullanılır. Bu, komutun temel işlevidir ve metinde açıkça belirtilmiştir.",
      "subTopicName": "İfconfiğiile Arayüz Yapılandırması",
      "normalizedSubTopicName": "ifconfigiile_arayuz_yapilandirmasi",
      "difficulty": "easy"
    },
    {
      "id": "q5",
      "questionText": "'ip addr show' komutu hangi amaçla kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Ağ arayüzlerini listelemek",
        "Bir IP adresine ping göndermek",
        "Ağ bağlantılarını görüntülemek",
        "Yönlendirme tablosunu görüntülemek"
      ],
      "correctAnswer": "Ağ arayüzlerini listelemek",
      "explanation": "Metinde belirtildiği gibi, 'ip addr show' komutu ağ arayüzlerini listelemek için kullanılır.",
      "subTopicName": "İp Komutu İle Ağ Yönetimi",
      "normalizedSubTopicName": "ip_komutu_ile_ag_yonetimi",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "Aşağıdaki 'ip' komutlarından hangisi 'eth0' arayüzünü devre dışı bırakır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "sudo ip link set eth0 up",
        "sudo ip link set eth0 down",
        "ip addr show",
        "sudo ip link show eth0"
      ],
      "correctAnswer": "sudo ip link set eth0 down",
      "explanation": "Metinde belirtildiği gibi, 'sudo ip link set eth0 down' komutu 'eth0' arayüzünü devre dışı bırakmak için kullanılır.",
      "subTopicName": "İp Komutu İle Ağ Yönetimi",
      "normalizedSubTopicName": "ip_komutu_ile_ag_yonetimi",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "'ping 10.112.0.1' komutu ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "10.112.0.1 IP adresine ping gönderme",
        "Ağ arayüzlerini listeleme",
        "Mevcut ağ bağlantılarını listeleme",
        "DNS sunucusunu sorgulama"
      ],
      "correctAnswer": "10.112.0.1 IP adresine ping gönderme",
      "explanation": "Metinde belirtildiği gibi, 'ping 10.112.0.1' komutu belirtilen IP adresine ping göndermek için kullanılır.",
      "subTopicName": "Pinğiile Ağ Bağlantısı Testi",
      "normalizedSubTopicName": "pingiile_ag_baglantisi_testi",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "'ping -c 4 10.112.0.1' komutunun işlevi nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "10.112.0.1 adresine 4 adet ping gönderme",
        "10.112.0.1 adresinden 4 adet ping alma",
        "Ağdaki tüm cihazlara ping gönderme",
        "Sadece yerel ağa ping gönderme"
      ],
      "correctAnswer": "10.112.0.1 adresine 4 adet ping gönderme",
      "explanation": "Metinde belirtildiği gibi, 'ping -c 4 10.112.0.1' komutu belirli sayıda (bu durumda 4) ping gönderme işlemini gerçekleştirir.",
      "subTopicName": "Pinğiile Ağ Bağlantısı Testi",
      "normalizedSubTopicName": "pingiile_ag_baglantisi_testi",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "'netstat -tuln' komutu ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Belirli bir portu dinleyen süreçleri listeler",
        "Ağ istatistiklerini görüntüler",
        "Mevcut bağlantıları listeler",
        "Yönlendirme tablosunu görüntüler"
      ],
      "correctAnswer": "Belirli bir portu dinleyen süreçleri listeler",
      "explanation": "Metinde belirtildiği gibi, 'netstat -tuln' komutu belirli bir portu dinleyen süreçleri listelemek için kullanılır.",
      "subTopicName": "Netstat İle Bağlantı Görüntüleme",
      "normalizedSubTopicName": "netstat_ile_baglanti_goruntuleme",
      "difficulty": "medium"
    },
    {
      "id": "q10",
      "questionText": "Aşağıdakilerden hangisi 'netstat' komutunun temel işlevlerinden biridir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Ağ bağlantıları ve istatistikleri hakkında bilgi vermek",
        "DNS sunucusu üzerinden alan adı sorgulamak",
        "Ağdaki paket kaybını tespit etmek",
        "Web sunucularına HTTP istekleri göndermek"
      ],
      "correctAnswer": "Ağ bağlantıları ve istatistikleri hakkında bilgi vermek",
      "explanation": "'netstat' komutu, ağ bağlantıları ve istatistikleri hakkında bilgi verir. Metinde belirtildiği gibi, mevcut bağlantıları listeleme ve ağ istatistiklerini görüntüleme gibi işlevlere sahiptir.",
      "subTopicName": "Netstat İle Bağlantı Görüntüleme",
      "normalizedSubTopicName": "netstat_ile_baglanti_goruntuleme",
      "difficulty": "easy"
    }
  ]
}
```
```
