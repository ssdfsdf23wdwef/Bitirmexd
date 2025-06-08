# AI Model Yanıtı

Tarih: 2025-06-07T23:52:05.341Z
Trace ID: quiz-1749340313017-502wn
Yanıt Uzunluğu: 8472 karakter

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
        "Web sunucularına HTTP istekleri göndermek",
        "Ağ bağlantısının durumunu izlemek"
      ],
      "correctAnswer": "Ağ arayüzlerini listelemek ve yapılandırmak",
      "explanation": "'ifconfig' komutu, ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır. Metinde 'Ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır.' ifadesi yer almaktadır. Diğer seçenekler farklı komutların kullanım amaçlarını belirtir.",
      "subTopicName": "Ağ Arayüzü Yönetimi",
      "normalizedSubTopicName": "ag_arayuzu_yonetimi",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "'ifconfig eth0' komutu hangi bilgiyi görüntülemek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "eth0 arayüzünün IP adresini",
        "Mevcut TCP bağlantılarını",
        "Bir hedefe doğru giden yolu",
        "Ağ istatistiklerini"
      ],
      "correctAnswer": "eth0 arayüzünün IP adresini",
      "explanation": "'ifconfig eth0' komutu, belirtilen eth0 arayüzünün IP adresini görüntülemek için kullanılır. Metinde 'ifconfig eth0 (Belirli bir arayüzün IP adresini görüntüleme)' ifadesi yer almaktadır. Diğer seçenekler farklı komutların kullanım amaçlarını belirtir.",
      "subTopicName": "Ağ Arayüzü Yönetimi",
      "normalizedSubTopicName": "ag_arayuzu_yonetimi",
      "difficulty": "easy"
    },
    {
      "id": "q3",
      "questionText": "Aşağıdakilerden hangisi 'ip' komutunun bir ağ arayüzünü etkinleştirmek için kullanılan doğru söz dizimidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "sudo ip link set eth0 up",
        "ip addr show eth0",
        "sudo ip link set eth0 down",
        "ip config eth0 enable"
      ],
      "correctAnswer": "sudo ip link set eth0 up",
      "explanation": "'sudo ip link set eth0 up' komutu, eth0 ağ arayüzünü etkinleştirmek için doğru söz dizimidir. Metinde 'sudo ip link set eth0 up Ağ arayüzünü etkinleştirme' ifadesi yer almaktadır. Diğer seçenekler farklı amaçlara hizmet eder.",
      "subTopicName": "İfconfiğiile Arayüz Yapılandırması",
      "normalizedSubTopicName": "ifconfigiile_arayuz_yapilandirmasi",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "'ip addr show' komutu ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Ağ arayüzlerini listeler",
        "Ağ arayüzünü devre dışı bırakır",
        "Belirli sayıda ping gönderir",
        "Mevcut bağlantıları listeler"
      ],
      "correctAnswer": "Ağ arayüzlerini listeler",
      "explanation": "'ip addr show' komutu ağ arayüzlerini listelemek için kullanılır. Metinde 'ip addr show Ağ arayüzlerini listeleme' ifadesi yer almaktadır. Diğer seçenekler farklı komutların işlevlerini belirtir.",
      "subTopicName": "İfconfiğiile Arayüz Yapılandırması",
      "normalizedSubTopicName": "ifconfigiile_arayuz_yapilandirmasi",
      "difficulty": "easy"
    },
    {
      "id": "q5",
      "questionText": "Aşağıdaki 'ip' komutlarından hangisi 'eth0' arayüzünü devre dışı bırakır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "sudo ip link set eth0 down",
        "sudo ip link set eth0 up",
        "ip addr show",
        "ip route add default via 192.168.1.1"
      ],
      "correctAnswer": "sudo ip link set eth0 down",
      "explanation": "'sudo ip link set eth0 down' komutu 'eth0' arayüzünü devre dışı bırakır. Metinde 'sudo ip link set eth0 down Ağ arayüzünü devre dışı bırakma' ifadesi yer almaktadır. Diğer seçenekler farklı işlevlere sahiptir.",
      "subTopicName": "İp Komutu İle Ağ Yapılandırması",
      "normalizedSubTopicName": "ip_komutu_ile_ag_yapilandirmasi",
      "difficulty": "medium"
    },
    {
      "id": "q6",
      "questionText": "'ip' komutu ile ilgili aşağıdaki ifadelerden hangisi doğrudur?",
      "questionType": "true_false",
      "cognitiveDomain": "understanding",
      "options": [
        "Doğru",
        "Yanlış"
      ],
      "correctAnswer": "Doğru",
      "explanation": "'ip' komutu, ağ yapılandırması için kullanılır ve arayüzleri etkinleştirmek veya devre dışı bırakmak gibi işlemleri gerçekleştirebilir. Metinde 'ip (Ağ yapılandırması)' ifadesi yer almaktadır.",
      "subTopicName": "İp Komutu İle Ağ Yapılandırması",
      "normalizedSubTopicName": "ip_komutu_ile_ag_yapilandirmasi",
      "difficulty": "easy"
    },
    {
      "id": "q7",
      "questionText": "'ping 10.112.0.1' komutu ne yapar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "10.112.0.1 IP adresine ping gönderir",
        "Mevcut bağlantıları listeler",
        "Ağ arayüzlerini listeler",
        "DNS sunucusuna sorgu gönderir"
      ],
      "correctAnswer": "10.112.0.1 IP adresine ping gönderir",
      "explanation": "'ping 10.112.0.1' komutu, belirtilen IP adresine ICMP Echo istekleri göndererek ağ bağlantısını test eder. Metinde 'ping 10.112.0.1 Bir IP adresine ping gönderme' ifadesi yer almaktadır. Diğer seçenekler farklı komutların işlevlerini belirtir.",
      "subTopicName": "Pinğiile Ağ Bağlantısı Testi",
      "normalizedSubTopicName": "pingiile_ag_baglantisi_testi",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "'ping -c 4 10.112.0.1' komutunun işlevi nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "10.112.0.1 adresine 4 adet ping gönderir",
        "10.112.0.1 adresine sürekli ping gönderir",
        "Sadece ağ arayüzlerini listeler",
        "Sadece mevcut bağlantıları listeler"
      ],
      "correctAnswer": "10.112.0.1 adresine 4 adet ping gönderir",
      "explanation": "'ping -c 4 10.112.0.1' komutu, 10.112.0.1 adresine 4 adet ping gönderir. '-c 4' parametresi gönderilecek ping sayısını belirtir. Metinde 'ping -c 4 10.112.0.1 Belirli sayıda ping gönderme' ifadesi yer almaktadır.",
      "subTopicName": "Pinğiile Ağ Bağlantısı Testi",
      "normalizedSubTopicName": "pingiile_ag_baglantisi_testi",
      "difficulty": "easy"
    },
    {
      "id": "q9",
      "questionText": "'netstat' komutu ne için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Ağ bağlantılarını ve istatistiklerini görüntülemek",
        "Bir hedefe giden yolu izlemek",
        "DNS sunucusuna sorgu göndermek",
        "Web sunucularına istek göndermek"
      ],
      "correctAnswer": "Ağ bağlantılarını ve istatistiklerini görüntülemek",
      "explanation": "'netstat' komutu, ağ bağlantıları ve istatistikleri hakkında bilgi verir. Metinde 'netstat (Ağ Bağlantılarını Görüntüleme) Ağ bağlantıları ve istatistikleri hakkında bilgi verir.' ifadesi yer almaktadır. Diğer seçenekler farklı komutların kullanım amaçlarını belirtir.",
      "subTopicName": "Netstat İle Ağ Bağlantılarını Görüntüleme",
      "normalizedSubTopicName": "netstat_ile_ag_baglantilarini_goruntuleme",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "'netstat -tuln' komutu ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Belirli bir portu dinleyen süreçleri listeler",
        "Mevcut TCP bağlantılarını listeler",
        "Ağ istatistiklerini görüntüler",
        "Yönlendirme tablosunu görüntüler"
      ],
      "correctAnswer": "Belirli bir portu dinleyen süreçleri listeler",
      "explanation": "'netstat -tuln' komutu, belirli bir portu dinleyen süreçleri listeler. Metinde 'netstat -tuln Belirli bir portu dinleyen süreçleri listeleme' ifadesi yer almaktadır. Diğer seçenekler farklı 'netstat' parametrelerinin işlevlerini belirtir.",
      "subTopicName": "Netstat İle Ağ Bağlantılarını Görüntüleme",
      "normalizedSubTopicName": "netstat_ile_ag_baglantilarini_goruntuleme",
      "difficulty": "easy"
    }
  ]
}
```
```
