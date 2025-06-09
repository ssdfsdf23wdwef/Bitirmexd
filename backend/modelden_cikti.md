# AI Model Yanıtı

Tarih: 2025-06-09T10:47:44.683Z
Trace ID: quiz-1749466051534-fyos2
Yanıt Uzunluğu: 7849 karakter

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
        "Ağ arayüzlerini devre dışı bırakmak.",
        "Ağ arayüzlerini görüntülemek ve yapılandırmak.",
        "DNS sunucularını sorgulamak.",
        "Ağ bağlantılarının hızını test etmek."
      ],
      "correctAnswer": "Ağ arayüzlerini görüntülemek ve yapılandırmak.",
      "explanation": "'ifconfig' komutu, ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır. Metinde 'Ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır.' ifadesi yer almaktadır.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme Komutları",
      "normalizedSubTopicName": "ag_yonetimi_ve_i_zleme_komutlari",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "'netstat -i' komutu hangi bilgiyi görüntüler?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Aktif TCP bağlantılarını",
        "Ağ arayüzlerinin IP adreslerini",
        "Ağ istatistiklerini",
        "Dinlenen soketleri"
      ],
      "correctAnswer": "Ağ istatistiklerini",
      "explanation": "'netstat -i' komutu ağ istatistiklerini görüntülemek için kullanılır. Metinde 'netstat -i Ağ istatistiklerini görüntüleme' ifadesi yer almaktadır.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme Komutları",
      "normalizedSubTopicName": "ag_yonetimi_ve_i_zleme_komutlari",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "Aşağıdaki komutlardan hangisi bir ağ arayüzünü etkinleştirmek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "sudo ip link set eth0 down",
        "ifconfig eth0",
        "sudo ip link set eth0 up",
        "ping 10.112.0.1"
      ],
      "correctAnswer": "sudo ip link set eth0 up",
      "explanation": "'sudo ip link set eth0 up' komutu, 'eth0' adlı ağ arayüzünü etkinleştirmek için kullanılır. Metinde 'sudo ip link set eth0 up Ağ arayüzünü etkinleştirme' ifadesi yer almaktadır.",
      "subTopicName": "Arayüz Yapılandırması",
      "normalizedSubTopicName": "arayuz_yapilandirmasi",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "'ip addr show' komutu ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Ağ arayüzlerini devre dışı bırakır.",
        "Ağ arayüzlerini listeler.",
        "Ağ bağlantılarını test eder.",
        "Ağ yönlendirme tablosunu görüntüler."
      ],
      "correctAnswer": "Ağ arayüzlerini listeler.",
      "explanation": "'ip addr show' komutu, ağ arayüzlerini listelemek için kullanılır. Metinde 'ip addr show Ağ arayüzlerini listeleme' ifadesi yer almaktadır.",
      "subTopicName": "Arayüz Yapılandırması",
      "normalizedSubTopicName": "arayuz_yapilandirmasi",
      "difficulty": "easy"
    },
    {
      "id": "q5",
      "questionText": "Aşağıdakilerden hangisi 'ip' komutunun kullanım amaçlarından biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Ağ arayüzlerini listeleme",
        "Ağ arayüzünü etkinleştirme",
        "Ağ arayüzünü devre dışı bırakma",
        "DNS sunucusuna alan adı sorgulama"
      ],
      "correctAnswer": "DNS sunucusuna alan adı sorgulama",
      "explanation": "'ip' komutu ağ arayüzlerini listeleme, etkinleştirme ve devre dışı bırakma işlemlerinde kullanılır. DNS sorgulama 'nslookup' veya 'dig' komutlarıyla yapılır. Metinde 'ip addr show Ağ arayüzlerini listeleme', 'sudo ip link set eth0 up Ağ arayüzünü etkinleştirme', 'sudo ip link set eth0 down Ağ arayüzünü devre dışı bırakma' ifadeleri yer almaktadır.",
      "subTopicName": "Ağ Yapılandırması",
      "normalizedSubTopicName": "ag_yapilandirmasi",
      "difficulty": "medium"
    },
    {
      "id": "q6",
      "questionText": "Bir ağ arayüzünü devre dışı bırakmak için hangi 'ip' komutu kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "ip addr show",
        "sudo ip link set eth0 up",
        "sudo ip link set eth0 down",
        "ping 10.112.0.1"
      ],
      "correctAnswer": "sudo ip link set eth0 down",
      "explanation": "'sudo ip link set eth0 down' komutu, belirtilen ağ arayüzünü devre dışı bırakmak için kullanılır. Metinde 'sudo ip link set eth0 down Ağ arayüzünü devre dışı bırakma' ifadesi yer almaktadır.",
      "subTopicName": "Ağ Yapılandırması",
      "normalizedSubTopicName": "ag_yapilandirmasi",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "'ping' komutu hangi protokolü kullanarak ağ bağlantısını test eder?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "TCP",
        "UDP",
        "ICMP",
        "HTTP"
      ],
      "correctAnswer": "ICMP",
      "explanation": "'ping' komutu, hedefe ICMP Echo istekleri göndererek ağ bağlantısını test eder. Metinde 'Bir ağdaki hedefe (genellikle başka bir cihaz veya sunucu) ICMP Echo istekleri gönderir.' ifadesi yer almaktadır.",
      "subTopicName": "Ağ Bağlantı Testi",
      "normalizedSubTopicName": "ag_baglanti_testi",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "'ping -c 4 10.112.0.1' komutu ne yapar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "10.112.0.1 adresine sürekli ping gönderir.",
        "10.112.0.1 adresine 4 adet ping gönderir.",
        "10.112.0.1 adresinden 4 adet dosya indirir.",
        "10.112.0.1 adresini 4 farklı porttan test eder."
      ],
      "correctAnswer": "10.112.0.1 adresine 4 adet ping gönderir.",
      "explanation": "'ping -c 4 10.112.0.1' komutu, 10.112.0.1 adresine 4 adet ping gönderir. Metinde 'ping -c 4 10.112.0.1 Belirli sayıda ping gönderme' ifadesi yer almaktadır.",
      "subTopicName": "Ağ Bağlantı Testi",
      "normalizedSubTopicName": "ag_baglanti_testi",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "'netstat' komutu hangi tür bilgileri sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sadece aktif ağ bağlantılarını",
        "Sadece ağ istatistiklerini",
        "Ağ bağlantıları ve istatistikleri hakkında bilgi",
        "Sadece DNS sunucu bilgilerini"
      ],
      "correctAnswer": "Ağ bağlantıları ve istatistikleri hakkında bilgi",
      "explanation": "'netstat' komutu, ağ bağlantıları ve istatistikleri hakkında bilgi verir. Metinde 'Ağ bağlantıları ve istatistikleri hakkında bilgi verir.' ifadesi yer almaktadır.",
      "subTopicName": "Bağlantı İ Statistikleri",
      "normalizedSubTopicName": "baglanti_i_istatistikleri",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "'netstat -tuln' komutu neyi listeler?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Tüm aktif ağ bağlantılarını",
        "Belirli bir portu dinleyen süreçleri",
        "Ağ arayüzlerinin IP adreslerini",
        "Ağ yönlendirme tablosunu"
      ],
      "correctAnswer": "Belirli bir portu dinleyen süreçleri",
      "explanation": "'netstat -tuln' komutu, belirli bir portu dinleyen süreçleri listeler. Metinde 'netstat -tuln Belirli bir portu dinleyen süreçleri listeleme' ifadesi yer almaktadır.",
      "subTopicName": "Bağlantı İ Statistikleri",
      "normalizedSubTopicName": "baglanti_i_istatistikleri",
      "difficulty": "medium"
    }
  ]
}
```
```
