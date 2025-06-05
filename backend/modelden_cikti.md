# AI Model Yanıtı

Tarih: 2025-06-05T21:29:59.824Z
Trace ID: quiz-1749158983104-g09vu
Yanıt Uzunluğu: 8900 karakter

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
        "Ağ arayüzlerini devre dışı bırakmak",
        "Ağ arayüzlerini görüntülemek ve yapılandırmak",
        "DNS sunucularına sorgu göndermek",
        "Ağ bağlantısının hızını test etmek"
      ],
      "correctAnswer": "Ağ arayüzlerini görüntülemek ve yapılandırmak",
      "explanation": "'ifconfig' komutu, ağ arayüzlerini görüntülemek ve yapılandırmak için kullanılır. Belirli bir arayüzün IP adresini görüntülemek veya arayüzleri listelemek gibi işlemleri gerçekleştirebilirsiniz. Diğer seçenekler farklı komutlarla (örneğin, 'nslookup' DNS sorguları için) gerçekleştirilir.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme",
      "normalizedSubTopicName": "ag_yonetimi_ve_i_zleme",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "'ip addr show' komutu hangi amaçla kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Yönlendirme tablosunu görüntülemek",
        "Ağ arayüzlerini listelemek",
        "Ağ bağlantısını test etmek",
        "DNS sunucusuna sorgu göndermek"
      ],
      "correctAnswer": "Ağ arayüzlerini listelemek",
      "explanation": "'ip addr show' komutu, sistemdeki ağ arayüzlerini listelemek için kullanılır. Bu komut, 'ifconfig' komutuna alternatif olarak daha modern bir yaklaşımla ağ yapılandırmasını yönetmeyi sağlar.",
      "subTopicName": "Ağ Yönetimi Ve İ Zleme",
      "normalizedSubTopicName": "ag_yonetimi_ve_i_zleme",
      "difficulty": "easy"
    },
    {
      "id": "q3",
      "questionText": "Aşağıdaki komutlardan hangisi, 'eth0' adlı ağ arayüzüne 192.168.1.10 IP adresini atamak için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "ifconfig eth0 192.168.1.10",
        "ip addr add 192.168.1.10/24 dev eth0",
        "netstat eth0 192.168.1.10",
        "ping eth0 192.168.1.10"
      ],
      "correctAnswer": "ip addr add 192.168.1.10/24 dev eth0",
      "explanation": "'ip addr add 192.168.1.10/24 dev eth0' komutu, 'eth0' arayüzüne 192.168.1.10 IP adresini atar. 'ifconfig eth0 192.168.1.10' da kullanılabilir ancak 'ip' komutu daha güncel bir alternatiftir. 'netstat' ve 'ping' komutları farklı amaçlara hizmet eder.",
      "subTopicName": "Ağ Arayüzü Yapılandırması İfconfiğiip",
      "normalizedSubTopicName": "ag_arayuzu_yapilandirmasi_ifconfigiip",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "Bir ağ arayüzünü devre dışı bırakmak için hangi 'ip' komutu kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "sudo ip link set eth0 up",
        "sudo ip link set eth0 down",
        "ip addr show eth0",
        "sudo ip link delete eth0"
      ],
      "correctAnswer": "sudo ip link set eth0 down",
      "explanation": "'sudo ip link set eth0 down' komutu, 'eth0' adlı ağ arayüzünü devre dışı bırakır. 'up' komutu ise arayüzü etkinleştirir. 'ip addr show' arayüz bilgilerini gösterir, 'ip link delete' ise arayüzü siler.",
      "subTopicName": "Ağ Arayüzü Yapılandırması İfconfiğiip",
      "normalizedSubTopicName": "ag_arayuzu_yapilandirmasi_ifconfigiip",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "Aşağıdaki 'ping' komutlarından hangisi, hedef cihaza sadece 4 adet ICMP Echo isteği gönderecek şekilde ayarlanmıştır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "ping 10.112.0.1",
        "ping -c 4 10.112.0.1",
        "ping -t 4 10.112.0.1",
        "ping -n 4 10.112.0.1"
      ],
      "correctAnswer": "ping -c 4 10.112.0.1",
      "explanation": "'ping -c 4 10.112.0.1' komutu, belirtilen IP adresine (10.112.0.1) sadece 4 adet ICMP Echo isteği gönderir. '-c' parametresi, gönderilecek ping sayısını belirtir.",
      "subTopicName": "Ağ Bağlantısı Testi Ping",
      "normalizedSubTopicName": "ag_baglantisi_testi_ping",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "'ping' komutu ile bir hedefe erişilememesi durumunda, bu durumun olası nedenleri arasında aşağıdakilerden hangisi yer almaz?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "analyzing",
      "options": [
        "Hedef cihazın kapalı olması",
        "Ağ bağlantısında bir sorun olması",
        "Hedef cihazın güvenlik duvarının ICMP isteklerini engellemesi",
        "DNS sunucusunun doğru yapılandırılmamış olması"
      ],
      "correctAnswer": "DNS sunucusunun doğru yapılandırılmamış olması",
      "explanation": "DNS sunucusunun doğru yapılandırılmamış olması, alan adlarının IP adreslerine çevrilememesine neden olur. Ancak, 'ping' komutu IP adresleri üzerinden çalıştığı için, DNS sorunu doğrudan 'ping' başarısızlığına neden olmaz. Diğer seçenekler ('Hedef cihazın kapalı olması', 'Ağ bağlantısında bir sorun olması', 'Hedef cihazın güvenlik duvarının ICMP isteklerini engellemesi') 'ping' komutunun başarısız olmasına neden olabilir.",
      "subTopicName": "Ağ Bağlantısı Testi Ping",
      "normalizedSubTopicName": "ag_baglantisi_testi_ping",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "'netstat -tuln' komutu ne işe yarar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Ağ istatistiklerini görüntüleme",
        "Mevcut TCP bağlantılarını listeleme",
        "Belirli bir portu dinleyen süreçleri listeleme",
        "Yönlendirme tablosunu görüntüleme"
      ],
      "correctAnswer": "Belirli bir portu dinleyen süreçleri listeleme",
      "explanation": "'netstat -tuln' komutu, belirli bir portu dinleyen süreçleri listeler. '-t' TCP bağlantılarını, '-u' UDP bağlantılarını, '-l' dinleyen soketleri ve '-n' sayısal adresleri gösterir.",
      "subTopicName": "Ağ İ Statistiklerini Görüntüleme Netstat Ss",
      "normalizedSubTopicName": "ag_i_statistiklerini_goruntuleme_netstat_ss",
      "difficulty": "medium"
    },
    {
      "id": "q8",
      "questionText": "Aşağıdakilerden hangisi 'ss' komutunun 'netstat' komutuna göre avantajlarından biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "analyzing",
      "options": [
        "Daha hızlı ve verimli olması",
        "Daha fazla soket bilgisi sağlaması",
        "Daha modern bir araç olması",
        "Daha eski sistemlerde de sorunsuz çalışması"
      ],
      "correctAnswer": "Daha eski sistemlerde de sorunsuz çalışması",
      "explanation": "'ss' komutu, 'netstat' komutuna göre daha modern, hızlı ve verimlidir. Ancak, 'netstat' daha eski sistemlerde de bulunabilirken, 'ss' daha yeni sistemlerde yaygındır. Bu nedenle, 'Daha eski sistemlerde de sorunsuz çalışması' 'ss' komutunun bir avantajı değildir.",
      "subTopicName": "Ağ İ Statistiklerini Görüntüleme Netstat Ss",
      "normalizedSubTopicName": "ag_i_statistiklerini_goruntuleme_netstat_ss",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "'nslookup google.com' komutu ne yapar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "google.com adresine ping gönderir",
        "google.com'un IP adresini DNS sunucusundan sorgular",
        "google.com üzerindeki açık portları tarar",
        "google.com'a giden ağ yolunu izler"
      ],
      "correctAnswer": "google.com'un IP adresini DNS sunucusundan sorgular",
      "explanation": "'nslookup google.com' komutu, DNS sunucusu üzerinden google.com alan adının IP adresini sorgular. Bu, bir alan adının hangi IP adresine karşılık geldiğini öğrenmek için kullanılır.",
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
        "google.com'un A kayıtlarını",
        "google.com'un NS kayıtlarını",
        "google.com'un MX kayıtlarını",
        "google.com'un TXT kayıtlarını"
      ],
      "correctAnswer": "google.com'un MX kayıtlarını",
      "explanation": "'dig google.com MX' komutu, google.com alan adının MX (Mail Exchange) kayıtlarını sorgular. MX kayıtları, e-posta sunucularının hangi sunucular üzerinden e-posta alıp göndereceğini belirtir.",
      "subTopicName": "Dns Sorgulama Nslookup Dig",
      "normalizedSubTopicName": "dns_sorgulama_nslookup_dig",
      "difficulty": "medium"
    }
  ]
}
```
```
