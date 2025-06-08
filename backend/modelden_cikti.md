# AI Model Yanıtı

Tarih: 2025-06-08T00:38:40.116Z
Trace ID: quiz-1749343106184-f8nle
Yanıt Uzunluğu: 9546 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Konteynerizasyonun temel amacı nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Uygulamaları sanal makinelerde çalıştırmak",
        "Uygulama kodunu, ihtiyaç duyduğu tüm dosya ve kütüphanelerle bir araya getirerek herhangi bir altyapıda çalıştırmak",
        "İşletim sistemini güncellemek",
        "Donanım kaynaklarını optimize etmek"
      ],
      "correctAnswer": "Uygulama kodunu, ihtiyaç duyduğu tüm dosya ve kütüphanelerle bir araya getirerek herhangi bir altyapıda çalıştırmak",
      "explanation": "Konteynerizasyon, bir uygulamanın kodunu, çalışması için gereken tüm bağımlılıklarla birlikte paketleyerek farklı altyapılarda tutarlı bir şekilde çalışmasını sağlamayı amaçlar. Bu, uygulamanın işletim sisteminden bağımsız olarak çalışabilmesini sağlar. Kaynak: Konteynerizasyon nedir? bölümü.",
      "subTopicName": "Konteynerizasyonun Tanımı Ve İ Şlevi",
      "normalizedSubTopicName": "konteynerizasyonun_tanımı_ve_işlevi",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdakilerden hangisi konteynerizasyonun temel özelliklerinden biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "İzolasyon",
        "Taşınabilirlik",
        "Doğrudan donanım erişimi",
        "Verimlilik"
      ],
      "correctAnswer": "Doğrudan donanım erişimi",
      "explanation": "Konteynerler, işletim sistemi seviyesinde sanallaştırma sağladığı için doğrudan donanıma erişmezler. Bunun yerine, paylaşılan işletim sistemi üzerinde izole edilmiş bir ortamda çalışırlar. Diğer seçenekler (izolasyon, taşınabilirlik, verimlilik) konteynerizasyonun temel özelliklerindendir. Kaynak: Konteynerizasyon nedir? bölümü.",
      "subTopicName": "Konteynerizasyonun Tanımı Ve İ Şlevi",
      "normalizedSubTopicName": "konteynerizasyonun_tanımı_ve_işlevi",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "Konteynerleştirme sürecinde, bir uygulama ve onun bağımlılıkları hangi birim içinde paketlenir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Sanal Makine",
        "Konteyner İmajı",
        "Çekirdek (Kernel)",
        "Sürücü (Driver)"
      ],
      "correctAnswer": "Konteyner İmajı",
      "explanation": "Konteynerleştirme, bir uygulamayı ve onun bağımlılıklarını konteyner imajı adı verilen standart bir birimde paketler. Bu imaj, uygulamanın farklı ortamlarda tutarlı bir şekilde çalışmasını sağlar. Kaynak: Konteynerizasyon nedir? bölümü.",
      "subTopicName": "Uygulama Ve Bağımlılık Paketleme",
      "normalizedSubTopicName": "uygulama_ve_bağımlılık_paketleme",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "Aşağıdakilerden hangisi, uygulama ve bağımlılıkların paketlenmesinin temel faydalarından biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Uygulama bağımlılıklarının tutarlı bir şekilde yönetilmesi",
        "Farklı ortamlarda uyumluluk sorunlarının azaltılması",
        "Geliştirme ve dağıtım süreçlerinin hızlandırılması",
        "Donanım maliyetlerinin artırılması"
      ],
      "correctAnswer": "Donanım maliyetlerinin artırılması",
      "explanation": "Uygulama ve bağımlılıkların paketlenmesi, donanım maliyetlerini artırmaz; aksine, kaynakların daha verimli kullanılmasını sağlayarak potansiyel olarak maliyetleri düşürebilir. Diğer seçenekler (bağımlılık yönetimi, uyumluluk, hızlandırma) paketlemenin faydalarıdır. Kaynak: Konteynerizasyon nedir? bölümü.",
      "subTopicName": "Uygulama Ve Bağımlılık Paketleme",
      "normalizedSubTopicName": "uygulama_ve_bağımlılık_paketleme",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "Konteynerler, aynı işletim sistemi üzerinde nasıl çalışır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Farklı işletim sistemleri kullanarak",
        "İzole edilmiş kullanıcı alanlarında",
        "Doğrudan donanım üzerinde",
        "Sanal makineler aracılığıyla"
      ],
      "correctAnswer": "İzole edilmiş kullanıcı alanlarında",
      "explanation": "Konteynerler, aynı paylaşılan işletim sistemi üzerinde izole edilmiş kullanıcı alanlarında çalışır. Bu izolasyon, her konteynerin kendi bağımlılıklarına ve yapılandırmasına sahip olmasını sağlar ve diğer konteynerleri etkilemesini önler. Kaynak: Konteynerizasyon nedir? bölümü.",
      "subTopicName": "İ Zole Ortamda Çalıştırma",
      "normalizedSubTopicName": "izole_ortamda_çalıştırma",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "İzole ortamda çalıştırmanın temel avantajı nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Kaynak kullanımını azaltmak",
        "Uygulamalar arası bağımlılığı artırmak",
        "Güvenlik açıklarını azaltmak",
        "Uygulamaların birbirini etkilemesini önlemek"
      ],
      "correctAnswer": "Uygulamaların birbirini etkilemesini önlemek",
      "explanation": "İzole ortamda çalıştırmanın temel avantajı, uygulamaların birbirini etkilemesini önlemektir. Bu, bir uygulamadaki bir hatanın veya güvenlik açığının diğer uygulamaları etkilemesini engeller ve sistem genelinde daha güvenli bir ortam sağlar. Kaynak: Konteynerizasyon nedir? bölümü.",
      "subTopicName": "İ Zole Ortamda Çalıştırma",
      "normalizedSubTopicName": "izole_ortamda_çalıştırma",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "Konteynerlerin taşınabilirliği ne anlama gelir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sadece belirli işletim sistemlerinde çalışabilme",
        "Farklı altyapılarda ve ortamlarda kolayca çalışabilme",
        "Sadece bulut ortamlarında çalışabilme",
        "Sadece geliştirme ortamlarında çalışabilme"
      ],
      "correctAnswer": "Farklı altyapılarda ve ortamlarda kolayca çalışabilme",
      "explanation": "Konteynerlerin taşınabilirliği, onların farklı altyapılarda (Linux, Windows, macOS) ve ortamlarda (bulut, şirket içi) kolayca çalışabilmesi anlamına gelir. Bu, geliştiricilerin ve operatörlerin uygulamaları farklı ortamlara kolayca dağıtmasını sağlar. Kaynak: Konteyner teknolojisinin kullanım alanları bölümü.",
      "subTopicName": "Taşınabilirlik Ve Uyumluluk",
      "normalizedSubTopicName": "taşınabilirlik_ve_uyumluluk",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "Konteynerlerin uyumluluğu hangi sorunu çözer?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Farklı işletim sistemleri arasındaki uyumsuzlukları",
        "Donanım kaynaklarının yetersizliğini",
        "Ağ bağlantı sorunlarını",
        "Güvenlik açıklarını"
      ],
      "correctAnswer": "Farklı işletim sistemleri arasındaki uyumsuzlukları",
      "explanation": "Konteynerlerin uyumluluğu, farklı işletim sistemleri arasındaki uyumsuzlukları çözerek uygulamaların farklı ortamlarda sorunsuz bir şekilde çalışmasını sağlar. Bu, geliştirme, test ve dağıtım süreçlerini kolaylaştırır. Kaynak: Konteyner teknolojisinin kullanım alanları bölümü.",
      "subTopicName": "Taşınabilirlik Ve Uyumluluk",
      "normalizedSubTopicName": "taşınabilirlik_ve_uyumluluk",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "Konteynerlerin hızı ve verimliliği neyi ifade eder?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sadece daha hızlı başlatılmalarını",
        "Sanal makinelere göre daha fazla kaynak tüketmelerini",
        "Daha hızlı başlatılmaları ve daha az kaynak tüketmelerini",
        "Sadece daha az depolama alanı kullanmalarını"
      ],
      "correctAnswer": "Daha hızlı başlatılmaları ve daha az kaynak tüketmelerini",
      "explanation": "Konteynerlerin hızı ve verimliliği, sanal makinelere kıyasla daha hızlı başlatılmalarını ve daha az işletim sistemi kaynağı tüketmelerini ifade eder. Bu, daha fazla uygulamanın aynı altyapıda çalıştırılabilmesi anlamına gelir. Kaynak: Konteyner teknolojisinin kullanım alanları bölümü.",
      "subTopicName": "Hız Ve Verimlilik",
      "normalizedSubTopicName": "hız_ve_verimlilik",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Konteynerlerin hız ve verimliliğinin temel nedeni nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Tam bir işletim sistemi içermeleri",
        "Sanal makine kullanmaları",
        "İşletim sistemi çekirdeğini paylaşmaları",
        "Daha fazla donanım kaynağına ihtiyaç duymaları"
      ],
      "correctAnswer": "İşletim sistemi çekirdeğini paylaşmaları",
      "explanation": "Konteynerlerin hız ve verimliliğinin temel nedeni, sanal makineler gibi tam bir işletim sistemi içermemeleri ve işletim sistemi çekirdeğini paylaşmalarıdır. Bu, daha az kaynak tüketimi ve daha hızlı başlatma süreleri sağlar. Kaynak: Konteyner teknolojisinin kullanım alanları bölümü.",
      "subTopicName": "Hız Ve Verimlilik",
      "normalizedSubTopicName": "hız_ve_verimlilik",
      "difficulty": "medium"
    }
  ]
}
```
```
