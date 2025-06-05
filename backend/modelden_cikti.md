# AI Model Yanıtı

Tarih: 2025-06-05T22:41:27.892Z
Trace ID: quiz-1749163271559-a8hfv
Yanıt Uzunluğu: 8862 karakter

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
        "DNS sunucusu üzerinden alan adının IP adresini sorgulamak",
        "Ağ bağlantılarının istatistiklerini görüntülemek",
        "Bir hedefe giden yolun hangi ağ cihazları üzerinden geçtiğini göstermek"
      ],
      "correctAnswer": "Ağ arayüzlerini listelemek ve yapılandırmak",
      "explanation": "'ifconfig' komutu, ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır. Örneğin, 'ifconfig' komutu ağ arayüzlerini listelerken, 'ifconfig eth0' belirli bir arayüzün IP adresini gösterir. Diğer seçenekler farklı komutların işlevleridir.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme",
      "normalizedSubTopicName": "ağ_yönetimi_ve_i_zleme",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "'ip addr show' komutu hangi amaçla kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Ağ arayüzlerini listelemek",
        "Ağ arayüzünü etkinleştirmek",
        "Ağ arayüzünü devre dışı bırakmak",
        "Yönlendirme tablosunu görüntülemek"
      ],
      "correctAnswer": "Ağ arayüzlerini listelemek",
      "explanation": "'ip addr show' komutu, ağ arayüzlerini listelemek için kullanılır. 'sudo ip link set eth0 up' komutu arayüzü etkinleştirir, 'sudo ip link set eth0 down' komutu ise arayüzü devre dışı bırakır. 'route -n' komutu yönlendirme tablosunu gösterir.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme",
      "normalizedSubTopicName": "ağ_yönetimi_ve_i_zleme",
      "difficulty": "easy"
    },
    {
      "id": "q3",
      "questionText": "Aşağıdaki komutlardan hangisi 'eth0' arayüzüne 192.168.1.10 IP adresini atamak için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "ip addr add 192.168.1.10/24 dev eth0",
        "ip link set eth0 up",
        "ifconfig eth0 192.168.1.10 netmask 255.255.255.0",
        "route add default gw 192.168.1.1"
      ],
      "correctAnswer": "ifconfig eth0 192.168.1.10 netmask 255.255.255.0",
      "explanation": "'ifconfig eth0 192.168.1.10 netmask 255.255.255.0' komutu, 'eth0' arayüzüne 192.168.1.10 IP adresini ve 255.255.255.0 alt ağ maskesini atar. 'ip addr add' komutu da kullanılabilir ancak daha modern bir yaklaşımdır. Diğer seçenekler farklı ağ yapılandırma işlemlerini ifade eder.",
      "subTopicName": "Ağ Arayüzü Yapılandırması İfconfiğiip",
      "normalizedSubTopicName": "ağ_arayüzü_yapılandırması_ifconfiğiip",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "Bir ağ arayüzünü devre dışı bırakmak için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "sudo ip link set eth0 up",
        "sudo ip link set eth0 down",
        "ifconfig eth0 down",
        "ifconfig eth0 up"
      ],
      "correctAnswer": "sudo ip link set eth0 down",
      "explanation": "'sudo ip link set eth0 down' komutu, belirtilen 'eth0' ağ arayüzünü devre dışı bırakır. 'up' parametresi ise arayüzü etkinleştirir.",
      "subTopicName": "Ağ Arayüzü Yapılandırması İfconfiğiip",
      "normalizedSubTopicName": "ağ_arayüzü_yapılandırması_ifconfiğiip",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "Aşağıdakilerden hangisi 'ping' komutunun temel işlevidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Bir ağdaki hedefe ICMP Echo istekleri göndermek",
        "DNS sunucusu üzerinden alan adının IP adresini sorgulamak",
        "Ağ bağlantılarının istatistiklerini görüntülemek",
        "Bir hedefe giden yolun hangi ağ cihazları üzerinden geçtiğini göstermek"
      ],
      "correctAnswer": "Bir ağdaki hedefe ICMP Echo istekleri göndermek",
      "explanation": "'ping' komutu, bir ağdaki hedefe (genellikle başka bir cihaz veya sunucu) ICMP Echo istekleri göndererek ağ bağlantısını test eder. Diğer seçenekler farklı komutların işlevleridir.",
      "subTopicName": "Ağ Bağlantısı Testi Ping",
      "normalizedSubTopicName": "ağ_bağlantısı_testi_ping",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "'ping -c 4 10.112.0.1' komutu ne anlama gelir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "10.112.0.1 adresine 4 adet ping isteği gönderme",
        "10.112.0.1 adresinden 4 adet cevap bekleme",
        "10.112.0.1 adresine sürekli ping gönderme",
        "10.112.0.1 adresine 4 saniye boyunca ping gönderme"
      ],
      "correctAnswer": "10.112.0.1 adresine 4 adet ping isteği gönderme",
      "explanation": "'ping -c 4 10.112.0.1' komutu, 10.112.0.1 IP adresine 4 adet ICMP Echo isteği gönderir. '-c' parametresi gönderilecek ping sayısını belirtir.",
      "subTopicName": "Ağ Bağlantısı Testi Ping",
      "normalizedSubTopicName": "ağ_bağlantısı_testi_ping",
      "difficulty": "easy"
    },
    {
      "id": "q7",
      "questionText": "Aşağıdakilerden hangisi 'netstat' komutunun temel işlevlerinden biridir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Ağ bağlantıları ve istatistikleri hakkında bilgi vermek",
        "DNS sunucusu üzerinden alan adının IP adresini sorgulamak",
        "Ağ arayüzlerini yapılandırmak",
        "Bir hedefe giden yolun hangi ağ cihazları üzerinden geçtiğini göstermek"
      ],
      "correctAnswer": "Ağ bağlantıları ve istatistikleri hakkında bilgi vermek",
      "explanation": "'netstat' komutu, ağ bağlantıları ve istatistikleri hakkında bilgi verir. Mevcut bağlantıları listeler, belirli bir portu dinleyen süreçleri gösterir ve ağ istatistiklerini görüntüler. Diğer seçenekler farklı komutların işlevleridir.",
      "subTopicName": "Ağ Bağlantılarını Görüntüleme Netstat Ss",
      "normalizedSubTopicName": "ağ_bağlantılarını_görüntüleme_netstat_ss",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "'ss -tuln' komutu ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Belirli bir portu dinleyen bağlantıları listeler",
        "Mevcut TCP bağlantılarını listeler",
        "Dinleyen soketleri listeler",
        "Ağ istatistiklerini görüntüler"
      ],
      "correctAnswer": "Belirli bir portu dinleyen bağlantıları listeler",
      "explanation": "'ss -tuln' komutu, belirli bir portu dinleyen bağlantıları listeler. 'ss' komutu 'netstat' komutunun modern bir alternatifi olarak kabul edilir.",
      "subTopicName": "Ağ Bağlantılarını Görüntüleme Netstat Ss",
      "normalizedSubTopicName": "ağ_bağlantılarını_görüntüleme_netstat_ss",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "Aşağıdakilerden hangisi 'nslookup' komutunun temel işlevidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "DNS sunucusu üzerinden bir alan adının IP adresini sorgulamak",
        "Ağ bağlantılarını ve istatistikleri hakkında bilgi vermek",
        "Ağ arayüzlerini yapılandırmak",
        "Bir hedefe giden yolun hangi ağ cihazları üzerinden geçtiğini göstermek"
      ],
      "correctAnswer": "DNS sunucusu üzerinden bir alan adının IP adresini sorgulamak",
      "explanation": "'nslookup' komutu, DNS sunucusu üzerinden bir alan adının IP adresini sorgular. Diğer seçenekler farklı komutların işlevleridir.",
      "subTopicName": "Alan Adı İp Adresi Sorgulama Nslookup Dig",
      "normalizedSubTopicName": "alan_adı_ip_adresi_sorgulama_nslookup_dig",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "'dig google.com MX' komutu ne anlama gelir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "google.com alan adının MX kayıtlarını sorgulama",
        "google.com alan adı için DNS sorgusu yapma",
        "google.com alan adının IP adresini sorgulama",
        "google.com alan adına ping gönderme"
      ],
      "correctAnswer": "google.com alan adının MX kayıtlarını sorgulama",
      "explanation": "'dig google.com MX' komutu, google.com alan adının MX (Mail Exchange) kayıtlarını sorgular. MX kayıtları, e-posta sunucularının adreslerini belirtir.",
      "subTopicName": "Alan Adı İp Adresi Sorgulama Nslookup Dig",
      "normalizedSubTopicName": "alan_adı_ip_adresi_sorgulama_nslookup_dig",
      "difficulty": "medium"
    }
  ]
}
```
```
