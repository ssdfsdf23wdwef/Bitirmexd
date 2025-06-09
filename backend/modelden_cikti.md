# AI Model Yanıtı

Tarih: 2025-06-09T00:52:03.098Z
Trace ID: quiz-1749430308852-59mc3
Yanıt Uzunluğu: 9335 karakter

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
      "explanation": "Konteynerizasyon, bir uygulamanın kodunu, herhangi bir altyapıda çalışması için gereken tüm dosya ve kütüphanelerle bir araya getiren bir yazılım dağıtım işlemidir. Bu, uygulamanın farklı ortamlarda tutarlı bir şekilde çalışmasını sağlar.",
      "subTopicName": "Konteynerizasyonun Tanımı Ve İşlevi",
      "normalizedSubTopicName": "konteynerizasyonun_tanımı_ve_işlevi",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdakilerden hangisi konteynerleştirmenin temel özelliklerinden biri değildir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Uygulama bileşenlerinin tek bir konteyner imajında toplanması",
        "İzole edilmiş kullanıcı alanında çalışma",
        "Paylaşılan işletim sistemi üzerinde çalışma",
        "Donanım seviyesinde sanallaştırma"
      ],
      "correctAnswer": "Donanım seviyesinde sanallaştırma",
      "explanation": "Konteynerleştirme, işletim sistemi seviyesinde sanallaştırmadır. Uygulama bileşenleri tek bir konteyner imajında toplanır ve aynı paylaşılan işletim sistemi üzerinde izole edilmiş kullanıcı alanında çalıştırılır. Donanım seviyesinde sanallaştırma, sanal makinelerin (VM'ler) özelliğidir, konteynerlerin değil.",
      "subTopicName": "Konteynerizasyonun Tanımı Ve İşlevi",
      "normalizedSubTopicName": "konteynerizasyonun_tanımı_ve_işlevi",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "Konteynerleştirme sürecinde, bir uygulamanın bağımlılıkları ve gerekli bileşenleri hangi birimde paketlenir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Sanal Makine (VM)",
        "Konteyner",
        "Çekirdek (Kernel)",
        "Sürücü (Driver)"
      ],
      "correctAnswer": "Konteyner",
      "explanation": "Konteynerleştirme, yazılım kodunun kütüphaneler, framework'ler ve diğer bağımlılıklar gibi gerekli tüm bileşenlerle birlikte konteyner adı verilen standart bir birimde paketlenmesidir.",
      "subTopicName": "Uygulama Paketleme Ve Dağıtımı",
      "normalizedSubTopicName": "uygulama_paketleme_ve_dağıtımı",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "Aşağıdakilerden hangisi konteynerlerin uygulama paketleme ve dağıtımındaki avantajlarından biridir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sadece Windows işletim sistemlerinde çalışabilme",
        "Sadece belirli donanımlarda çalışabilme",
        "Temeldeki işletim sistemi ne olursa olsun her türlü altyapıda tutarlı ve verimli bir şekilde çalışabilme",
        "Daha fazla kaynak tüketimi"
      ],
      "correctAnswer": "Temeldeki işletim sistemi ne olursa olsun her türlü altyapıda tutarlı ve verimli bir şekilde çalışabilme",
      "explanation": "Konteynerler, uygulamaları izole ederek, temeldeki işletim sistemi ne olursa olsun her türlü altyapıda tutarlı ve verimli bir şekilde çalışmasına olanak tanır. Bu taşınabilirlik ve verimlilik, konteynerleri modern bulutta yerel uygulamalar için ideal hale getirir.",
      "subTopicName": "Uygulama Paketleme Ve Dağıtımı",
      "normalizedSubTopicName": "uygulama_paketleme_ve_dağıtımı",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "Konteynerleştirme, hangi düzeyde sanallaştırma sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Donanım",
        "İşletim Sistemi",
        "Uygulama",
        "Ağ"
      ],
      "correctAnswer": "İşletim Sistemi",
      "explanation": "Konteynerleştirme, yazılım uygulamalarının herhangi bir bulut veya bulut dışı ortamda çalışabilmesi için işletim sistemi düzeyinde sanallaştırma sağlar.",
      "subTopicName": "İşletim Sistemi Seviyesinde Sanallaştırma",
      "normalizedSubTopicName": "işletim_sistemi_seviyesinde_sanallaştırma",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "İşletim sistemi seviyesinde sanallaştırma ile konteynerler, aynı işletim sistemi üzerinde nasıl çalışır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Her konteyner farklı bir işletim sistemi kullanır",
        "Konteynerler izole edilmiş kullanıcı alanlarında çalışır",
        "Konteynerler donanımı doğrudan paylaşır",
        "Konteynerler birbirleriyle iletişim kuramaz"
      ],
      "correctAnswer": "Konteynerler izole edilmiş kullanıcı alanlarında çalışır",
      "explanation": "Konteynerleştirme, bir uygulamanın tüm bileşenlerinin tek bir konteyner imajında toplandığı ve aynı paylaşılan işletim sistemi üzerinde izole edilmiş kullanıcı alanında çalıştırılabildiği bir sanallaştırma türüdür.",
      "subTopicName": "İşletim Sistemi Seviyesinde Sanallaştırma",
      "normalizedSubTopicName": "işletim_sistemi_seviyesinde_sanallaştırma",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "Konteynerlerin taşınabilirliği ne anlama gelir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Sadece belirli Linux dağıtımlarında çalışabilme",
        "Sadece Windows işletim sistemlerinde çalışabilme",
        "İşletim sisteminden bağımsız bir şekilde farklı ortamlarda çalışabilme",
        "Sadece bulut ortamlarında çalışabilme"
      ],
      "correctAnswer": "İşletim sisteminden bağımsız bir şekilde farklı ortamlarda çalışabilme",
      "explanation": "Konteynerler, işletim sisteminden bağımsız bir şekilde çalışabilirler. Bu, bir konteynerin herhangi bir Linux dağıtımı, Windows veya macOS üzerinde çalıştırılabileceği anlamına gelir.",
      "subTopicName": "Taşınabilirlik Ve Platform Bağımsızlığı",
      "normalizedSubTopicName": "taşınabilirlik_ve_platform_bağımsızlığı",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "Konteynerlerin platform bağımsızlığı, geliştiricilere ve operatörlere ne gibi bir avantaj sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Uygulamaları sadece tek bir ortamda geliştirmeyi",
        "Uygulamaları farklı ortamlarda kolayca dağıtma ve çalıştırma imkanı",
        "Sadece belirli donanımlara bağımlı kalmayı",
        "Daha fazla maliyetli altyapı kullanmayı"
      ],
      "correctAnswer": "Uygulamaları farklı ortamlarda kolayca dağıtma ve çalıştırma imkanı",
      "explanation": "Konteynerlerin taşınabilirliği, geliştiricilerin ve operatörlerin uygulamaları farklı ortamlarda kolayca dağıtmalarını ve çalıştırmalarını sağlar.",
      "subTopicName": "Taşınabilirlik Ve Platform Bağımsızlığı",
      "normalizedSubTopicName": "taşınabilirlik_ve_platform_bağımsızlığı",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "Konteynerler, sanal makinelere (VM'ler) kıyasla nasıl bir hız avantajı sunar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "Daha yavaş başlatılır ve durdurulur",
        "VM'lerden çok daha hızlı başlatılabilir ve durdurulabilir",
        "Aynı hızda başlatılır ve durdurulur",
        "Hız konusunda bir fark yoktur"
      ],
      "correctAnswer": "VM'lerden çok daha hızlı başlatılabilir ve durdurulabilir",
      "explanation": "Konteynerler, sanal makinelerden (VM'ler) çok daha hızlı bir şekilde başlatılabilir ve durdurulabilir. Bu, uygulamaların daha hızlı bir şekilde geliştirilmesine, test edilmesine ve dağıtılmasına yardımcı olur.",
      "subTopicName": "Hız Ve Verimlilik",
      "normalizedSubTopicName": "hız_ve_verimlilik",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Konteynerlerin verimliliği, altyapı kaynakları açısından ne gibi bir fayda sağlar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Daha fazla sunucu ve altyapı gerektirir",
        "İşletim sistemi kaynaklarını VM'lerden daha verimli bir şekilde kullanır",
        "Daha az uygulama çalıştırılabilir",
        "Verimlilik konusunda bir fark yoktur"
      ],
      "correctAnswer": "İşletim sistemi kaynaklarını VM'lerden daha verimli bir şekilde kullanır",
      "explanation": "Konteynerler, işletim sistemi kaynaklarını VM'lerden daha verimli bir şekilde kullanır. Bu, daha az sunucu ve altyapı ile daha fazla uygulama çalıştırabileceğiniz anlamına gelir.",
      "subTopicName": "Hız Ve Verimlilik",
      "normalizedSubTopicName": "hız_ve_verimlilik",
      "difficulty": "medium"
    }
  ]
}
```
```
