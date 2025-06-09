# AI Model Yanıtı

Tarih: 2025-06-09T12:01:00.999Z
Trace ID: quiz-1749470447120-920ii
Yanıt Uzunluğu: 7701 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Aşağıdakilerden hangisi 'ifconfig' komutunun temel kullanım amaçlarından biridir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Ağ arayüzlerini listelemek ve yapılandırmak",
        "DNS sunucularına sorgu göndermek",
        "Ağ üzerindeki dosya indirme işlemlerini gerçekleştirmek",
        "Ağ bağlantılarının istatistiklerini görüntülemek"
      ],
      "correctAnswer": "Ağ arayüzlerini listelemek ve yapılandırmak",
      "explanation": "'ifconfig' komutu, ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır. Diğer seçenekler farklı komutlarla gerçekleştirilir.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme",
      "normalizedSubTopicName": "ag_yonetimi_ve_i_zleme",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Hangi komut, bir ağ arayüzünü etkinleştirmek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "sudo ip link set eth0 down",
        "ping 10.112.0.1",
        "sudo ip link set eth0 up",
        "netstat -tuln"
      ],
      "correctAnswer": "sudo ip link set eth0 up",
      "explanation": "'sudo ip link set eth0 up' komutu, 'eth0' adlı ağ arayüzünü etkinleştirmek için kullanılır. 'down' parametresi ise arayüzü devre dışı bırakır.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme",
      "normalizedSubTopicName": "ag_yonetimi_ve_i_zleme",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "Aşağıdaki komutlardan hangisi bir ağ arayüzüne ait IP adresini görüntülemek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "ifconfig eth0",
        "ping eth0",
        "netstat eth0",
        "ss eth0"
      ],
      "correctAnswer": "ifconfig eth0",
      "explanation": "'ifconfig eth0' komutu, 'eth0' adlı ağ arayüzüne ait IP adresini ve diğer ağ yapılandırma bilgilerini görüntülemek için kullanılır.",
      "subTopicName": "Ağ Arayüzü Yapılandırması İfconfiğiip",
      "normalizedSubTopicName": "ag_arayuzu_yapilandirmasi_ifconfigiip",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "Aşağıdaki 'ip' komutlarından hangisi, bir ağ arayüzünün devre dışı bırakılmasını sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "sudo ip link set eth0 up",
        "ip addr show",
        "sudo ip link set eth0 down",
        "ip route show"
      ],
      "correctAnswer": "sudo ip link set eth0 down",
      "explanation": "'sudo ip link set eth0 down' komutu, belirtilen 'eth0' ağ arayüzünü devre dışı bırakır. 'up' komutu ise arayüzü etkinleştirir.",
      "subTopicName": "Ağ Arayüzü Yapılandırması İfconfiğiip",
      "normalizedSubTopicName": "ag_arayuzu_yapilandirmasi_ifconfigiip",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "'ping' komutu hangi amaçla kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Ağ bağlantısını test etmek",
        "DNS sunucusuna sorgu göndermek",
        "Ağ arayüzlerini yapılandırmak",
        "Dosya indirme işlemlerini gerçekleştirmek"
      ],
      "correctAnswer": "Ağ bağlantısını test etmek",
      "explanation": "'ping' komutu, bir ağdaki hedefe ICMP Echo istekleri göndererek ağ bağlantısını test etmek için kullanılır.",
      "subTopicName": "Ağ Bağlantısı Testi Ping",
      "normalizedSubTopicName": "ag_baglantisi_testi_ping",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "Aşağıdaki 'ping' komutlarından hangisi, belirli bir IP adresine 4 adet ping isteği göndermek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "ping 10.112.0.1",
        "ping -c 4 10.112.0.1",
        "ping -t 10.112.0.1",
        "ping -n 4 10.112.0.1"
      ],
      "correctAnswer": "ping -c 4 10.112.0.1",
      "explanation": "'ping -c 4 10.112.0.1' komutu, '-c' parametresi ile belirtilen sayıda (bu durumda 4) ping isteği gönderir.",
      "subTopicName": "Ağ Bağlantısı Testi Ping",
      "normalizedSubTopicName": "ag_baglantisi_testi_ping",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "'netstat' komutu hangi bilgileri sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sadece aktif ağ bağlantılarını",
        "Ağ bağlantıları ve istatistikleri hakkında bilgi",
        "Sadece DNS sunucu bilgilerini",
        "Sadece dosya indirme hızlarını"
      ],
      "correctAnswer": "Ağ bağlantıları ve istatistikleri hakkında bilgi",
      "explanation": "'netstat' komutu, ağ bağlantıları ve istatistikleri hakkında bilgi verir. Mevcut bağlantıları listeleme, belirli bir portu dinleyen süreçleri listeleme ve ağ istatistiklerini görüntüleme gibi işlevlere sahiptir.",
      "subTopicName": "Ağ Bağlantılarını Görüntüleme Netstat Ss",
      "normalizedSubTopicName": "ag_baglantilarini_goruntuleme_netstat_ss",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "'ss' komutu, 'netstat' komutuna göre hangi avantaja sahiptir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Daha eski bir komut olması",
        "'netstat' komutunun modern bir alternatifi olarak kabul edilmesi",
        "Sadece UDP bağlantılarını listelemesi",
        "Daha az bilgi sağlaması"
      ],
      "correctAnswer": "'netstat' komutunun modern bir alternatifi olarak kabul edilmesi",
      "explanation": "'ss' komutu, 'netstat' komutunun modern bir alternatifi olarak kabul edilir ve aktif ağ bağlantılarını ve soket bilgilerini görüntüler.",
      "subTopicName": "Ağ Bağlantılarını Görüntüleme Netstat Ss",
      "normalizedSubTopicName": "ag_baglantilarini_goruntuleme_netstat_ss",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "'nslookup' komutu ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Bir alan adının IP adresini DNS sunucusu üzerinden sorgular",
        "Ağ bağlantısını test eder",
        "Ağ arayüzlerini yapılandırır",
        "Dosya indirme işlemlerini gerçekleştirir"
      ],
      "correctAnswer": "Bir alan adının IP adresini DNS sunucusu üzerinden sorgular",
      "explanation": "'nslookup' komutu, DNS sunucusu üzerinden bir alan adının IP adresini sorgulamak için kullanılır.",
      "subTopicName": "Dns Sorgulama Nslookup Dig",
      "normalizedSubTopicName": "dns_sorgulama_nslookup_dig",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "'dig google.com MX' komutu hangi bilgiyi sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "google.com alan adının IP adresini",
        "google.com alan adının MX kayıtlarını",
        "google.com alan adının NS kayıtlarını",
        "google.com alan adının SOA kayıtlarını"
      ],
      "correctAnswer": "google.com alan adının MX kayıtlarını",
      "explanation": "'dig google.com MX' komutu, google.com alan adının MX (Mail Exchange) kayıtlarını sorgular. MX kayıtları, e-posta sunucularının yönlendirilmesi için kullanılır.",
      "subTopicName": "Dns Sorgulama Nslookup Dig",
      "normalizedSubTopicName": "dns_sorgulama_nslookup_dig",
      "difficulty": "medium"
    }
  ]
}
```
```
