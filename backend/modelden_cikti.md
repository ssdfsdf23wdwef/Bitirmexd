# AI Model Yanıtı

Tarih: 2025-06-09T12:34:53.398Z
Trace ID: quiz-1749472479682-sebx8
Yanıt Uzunluğu: 7981 karakter

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
        "Web sunucularına HTTP istekleri göndermek"
      ],
      "correctAnswer": "Ağ arayüzlerini listelemek ve yapılandırmak",
      "explanation": "'ifconfig' komutu, ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır. Diğer seçenekler farklı komutların işlevleridir (nslookup, netstat, curl).",
      "subTopicName": "Ağ Arayüzü Yönetimi",
      "normalizedSubTopicName": "ag_arayuzu_yonetimi",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "'ifconfig eth0' komutu hangi işlevi yerine getirir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Tüm ağ arayüzlerini listeler.",
        "Sadece 'eth0' arayüzünün IP adresini görüntüler.",
        "Ağ istatistiklerini gösterir.",
        "DNS sunucusuna sorgu gönderir."
      ],
      "correctAnswer": "Sadece 'eth0' arayüzünün IP adresini görüntüler.",
      "explanation": "'ifconfig eth0' komutu, belirtilen 'eth0' arayüzünün IP adresini görüntülemek için kullanılır. Genel ağ arayüzlerini listelemek için sadece 'ifconfig' kullanılır.",
      "subTopicName": "Ağ Arayüzü Yönetimi",
      "normalizedSubTopicName": "ag_arayuzu_yonetimi",
      "difficulty": "easy"
    },
    {
      "id": "q3",
      "questionText": "Aşağıdaki 'ip' komutlarından hangisi 'eth0' arayüzünü etkinleştirmek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "sudo ip link set eth0 down",
        "ip addr show",
        "sudo ip link set eth0 up",
        "ip route show"
      ],
      "correctAnswer": "sudo ip link set eth0 up",
      "explanation": "'sudo ip link set eth0 up' komutu, 'eth0' arayüzünü etkinleştirmek için kullanılır. 'down' seçeneği arayüzü devre dışı bırakır.",
      "subTopicName": "İfconfiğiile Arayüz Yapılandırması",
      "normalizedSubTopicName": "ifconfigiile_arayuz_yapilandirmasi",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "'sudo ip link set eth0 down' komutunun işlevi nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "eth0 arayüzünün IP adresini gösterir.",
        "eth0 arayüzünü devre dışı bırakır.",
        "eth0 arayüzünü etkinleştirir.",
        "Ağ istatistiklerini gösterir."
      ],
      "correctAnswer": "eth0 arayüzünü devre dışı bırakır.",
      "explanation": "'sudo ip link set eth0 down' komutu, belirtilen 'eth0' ağ arayüzünü devre dışı bırakmak için kullanılır.",
      "subTopicName": "İfconfiğiile Arayüz Yapılandırması",
      "normalizedSubTopicName": "ifconfigiile_arayuz_yapilandirmasi",
      "difficulty": "easy"
    },
    {
      "id": "q5",
      "questionText": "Aşağıdaki 'ip' komutlarından hangisi ağ arayüzlerini listelemek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "ip addr show",
        "ip link set eth0 up",
        "ip link set eth0 down",
        "ip route"
      ],
      "correctAnswer": "ip addr show",
      "explanation": "'ip addr show' komutu, sistemdeki tüm ağ arayüzlerini listelemek için kullanılır.",
      "subTopicName": "İp Komutu İle Arayüz Yönetimi",
      "normalizedSubTopicName": "ip_komutu_ile_arayuz_yonetimi",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "'ip' komutu ile 'ifconfig' komutu arasındaki temel fark nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "analyzing",
      "options": [
        "'ip' komutu sadece arayüzleri listeler, 'ifconfig' yapılandırır.",
        "'ifconfig' komutu sadece arayüzleri listeler, 'ip' yapılandırır.",
        "'ip' komutu 'ifconfig' komutuna göre daha modern ve çok yönlüdür.",
        "'ifconfig' komutu 'ip' komutuna göre daha modern ve çok yönlüdür."
      ],
      "correctAnswer": "'ip' komutu 'ifconfig' komutuna göre daha modern ve çok yönlüdür.",
      "explanation": "'ip' komutu, 'ifconfig' komutuna göre daha gelişmiş özelliklere sahip ve daha modern bir alternatiftir. Daha fazla yapılandırma seçeneği sunar.",
      "subTopicName": "İp Komutu İle Arayüz Yönetimi",
      "normalizedSubTopicName": "ip_komutu_ile_arayuz_yonetimi",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "'ping 10.112.0.1' komutu ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "10.112.0.1 adresine belirli sayıda ping isteği gönderir.",
        "10.112.0.1 adresine sürekli ping isteği gönderir.",
        "10.112.0.1 adresine bir ICMP Echo isteği gönderir.",
        "10.112.0.1 adresinden dosya indirir."
      ],
      "correctAnswer": "10.112.0.1 adresine bir ICMP Echo isteği gönderir.",
      "explanation": "'ping 10.112.0.1' komutu, belirtilen IP adresine bir ICMP Echo isteği göndererek ağ bağlantısının olup olmadığını test eder.",
      "subTopicName": "Pinğiile Ağ Bağlantısı Testi",
      "normalizedSubTopicName": "pingiile_ag_baglantisi_testi",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "'ping -c 4 10.112.0.1' komutu ne anlama gelir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "10.112.0.1 adresine 4 adet ping isteği gönder.",
        "10.112.0.1 adresine sürekli ping isteği gönder.",
        "10.112.0.1 adresine 4 saniye boyunca ping isteği gönder.",
        "10.112.0.1 adresinden 4 adet dosya indir."
      ],
      "correctAnswer": "10.112.0.1 adresine 4 adet ping isteği gönder.",
      "explanation": "'ping -c 4 10.112.0.1' komutu, 10.112.0.1 adresine toplamda 4 adet ping isteği göndereceği anlamına gelir. '-c' parametresi gönderilecek ping sayısını belirtir.",
      "subTopicName": "Pinğiile Ağ Bağlantısı Testi",
      "normalizedSubTopicName": "pingiile_ag_baglantisi_testi",
      "difficulty": "easy"
    },
    {
      "id": "q9",
      "questionText": "'traceroute google.com' komutu ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "google.com adresine giden yolu izler.",
        "google.com adresinden dosya indirir.",
        "google.com adresinin IP adresini sorgular.",
        "google.com adresine ping isteği gönderir."
      ],
      "correctAnswer": "google.com adresine giden yolu izler.",
      "explanation": "'traceroute google.com' komutu, belirtilen hedefe (google.com) giden yolun hangi ağ cihazları üzerinden geçtiğini gösterir.",
      "subTopicName": "Traceroute İle Yol Takibi",
      "normalizedSubTopicName": "traceroute_ile_yol_takibi",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Aşağıdakilerden hangisi 'traceroute' komutunun temel işlevidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Bir hedefe giden veri paketlerinin izlediği yolu belirlemek",
        "Ağ arayüzlerini yapılandırmak",
        "DNS sunucularını sorgulamak",
        "Ağ bağlantı hızını test etmek"
      ],
      "correctAnswer": "Bir hedefe giden veri paketlerinin izlediği yolu belirlemek",
      "explanation": "'traceroute' komutu, bir hedefe ulaşmak için veri paketlerinin hangi ağ cihazlarından geçtiğini göstererek yol takibi yapar.",
      "subTopicName": "Traceroute İle Yol Takibi",
      "normalizedSubTopicName": "traceroute_ile_yol_takibi",
      "difficulty": "easy"
    }
  ]
}
```
```
