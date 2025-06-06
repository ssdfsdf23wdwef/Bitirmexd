# AI Model Yanıtı

Tarih: 2025-06-06T04:08:00.546Z
Trace ID: quiz-1749182867944-r3xfe
Yanıt Uzunluğu: 6900 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Aşağıdakilerden hangisi Linux'ta ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılan bir komuttur?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "ping",
        "netstat",
        "ifconfig",
        "traceroute"
      ],
      "correctAnswer": "ifconfig",
      "explanation": "ifconfig (Interface Configuration) komutu, Linux'ta ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır. Diğer seçenekler farklı ağ işlemlerini gerçekleştirir.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme Komutları",
      "normalizedSubTopicName": "ag_yonetimi_ve_izleme_komutlari",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Hangi komut, belirli bir ağ arayüzünün IP adresini görüntülemek için kullanılabilir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "ping eth0",
        "netstat -i",
        "ifconfig eth0",
        "traceroute eth0"
      ],
      "correctAnswer": "ifconfig eth0",
      "explanation": "ifconfig eth0 komutu, eth0 arayüzünün IP adresini ve diğer yapılandırma detaylarını gösterir. Diğer seçenekler farklı ağ bilgilerini sağlar.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme Komutları",
      "normalizedSubTopicName": "ag_yonetimi_ve_izleme_komutlari",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "Aşağıdaki komutlardan hangisi bir ağ arayüzünü etkinleştirmek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo ip link set eth0 down",
        "sudo ip link show eth0",
        "sudo ip link set eth0 up",
        "sudo ip addr show"
      ],
      "correctAnswer": "sudo ip link set eth0 up",
      "explanation": "sudo ip link set eth0 up komutu, eth0 ağ arayüzünü etkinleştirir. 'down' seçeneği arayüzü devre dışı bırakır.",
      "subTopicName": "Arayüz Yapılandırması",
      "normalizedSubTopicName": "arayuz_yapilandirmasi",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "Aşağıdaki komutlardan hangisi bir ağ arayüzünü devre dışı bırakmak için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "sudo ip link set eth0 up",
        "sudo ip link show eth0",
        "sudo ip link set eth0 down",
        "sudo ip addr show"
      ],
      "correctAnswer": "sudo ip link set eth0 down",
      "explanation": "sudo ip link set eth0 down komutu, eth0 ağ arayüzünü devre dışı bırakır. 'up' seçeneği arayüzü etkinleştirir.",
      "subTopicName": "Arayüz Yapılandırması",
      "normalizedSubTopicName": "arayuz_yapilandirmasi",
      "difficulty": "easy"
    },
    {
      "id": "q5",
      "questionText": "Ağ arayüzlerini listelemek için kullanılan 'ip' komutu hangisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "ip link set",
        "ip addr show",
        "ip link show",
        "ip addr set"
      ],
      "correctAnswer": "ip addr show",
      "explanation": "ip addr show komutu, sistemdeki tüm ağ arayüzlerini ve bunlara ait IP adreslerini listeler.",
      "subTopicName": "Ağ Arayüzü Yönetimi",
      "normalizedSubTopicName": "ag_arayuzu_yonetimi",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "'ip' komutu ile bir arayüzün durumunu (up/down) değiştirmek için hangi alt komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "ip addr",
        "ip route",
        "ip link",
        "ip netns"
      ],
      "correctAnswer": "ip link",
      "explanation": "ip link komutu, ağ arayüzlerinin özelliklerini değiştirmek ve durumlarını kontrol etmek için kullanılır (up/down).",
      "subTopicName": "Ağ Arayüzü Yönetimi",
      "normalizedSubTopicName": "ag_arayuzu_yonetimi",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "Aşağıdaki komutlardan hangisi, bir ağdaki bir hedefe ICMP Echo istekleri göndererek ağ bağlantısını test etmek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "netstat",
        "traceroute",
        "ping",
        "nslookup"
      ],
      "correctAnswer": "ping",
      "explanation": "ping komutu, bir ağdaki bir hedefe ICMP Echo istekleri göndererek ağ bağlantısını test etmek için kullanılır.",
      "subTopicName": "Ağ Bağlantısı Testi",
      "normalizedSubTopicName": "ag_baglantisi_testi",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "ping komutunda '-c' parametresi neyi ifade eder?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Hedefin IP adresini",
        "Gönderilecek ping sayısını",
        "Paket boyutunu",
        "Zaman aşımı süresini"
      ],
      "correctAnswer": "Gönderilecek ping sayısını",
      "explanation": "ping komutunda '-c' parametresi, hedefe gönderilecek ping sayısını belirtir. Örneğin, 'ping -c 4 10.112.0.1' komutu hedefe 4 adet ping gönderir.",
      "subTopicName": "Ağ Bağlantısı Testi",
      "normalizedSubTopicName": "ag_baglantisi_testi",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "Aşağıdaki komutlardan hangisi mevcut ağ bağlantılarını listelemek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "ping",
        "traceroute",
        "netstat",
        "nslookup"
      ],
      "correctAnswer": "netstat",
      "explanation": "netstat komutu, mevcut ağ bağlantılarını ve istatistiklerini listelemek için kullanılır.",
      "subTopicName": "Ağ Bağlantılarını Görüntüleme",
      "normalizedSubTopicName": "ag_baglantilarini_goruntuleme",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "netstat komutunda '-tuln' parametreleri neyi ifade eder?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Tüm arayüzleri listeler",
        "Sadece TCP bağlantılarını gösterir",
        "Belirli bir portu dinleyen süreçleri listeler",
        "Ağ istatistiklerini gösterir"
      ],
      "correctAnswer": "Belirli bir portu dinleyen süreçleri listeler",
      "explanation": "netstat -tuln komutu, belirli bir portu dinleyen TCP ve UDP bağlantılarını listeler. 't' TCP, 'u' UDP, 'l' dinleyen soketler ve 'n' sayısal adresler anlamına gelir.",
      "subTopicName": "Ağ Bağlantılarını Görüntüleme",
      "normalizedSubTopicName": "ag_baglantilarini_goruntuleme",
      "difficulty": "medium"
    }
  ]
}
```
```
