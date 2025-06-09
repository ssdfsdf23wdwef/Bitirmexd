# AI Model Yanıtı

Tarih: 2025-06-09T00:17:33.287Z
Trace ID: quiz-1749428241244-55gov
Yanıt Uzunluğu: 7371 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Aşağıdaki komutlardan hangisi bir dosyanın içeriğini birleştirip görüntülemek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "less",
        "cat",
        "nano",
        "vi"
      ],
      "correctAnswer": "cat",
      "explanation": "cat komutu, dosyaların içeriğini birleştirerek görüntüler. less etkileşimli görüntüleme, nano ve vi ise metin düzenleme için kullanılır.",
      "subTopicName": "Dosya Görüntüleme Ve Düzenleme",
      "normalizedSubTopicName": "dosya_goruntuleme_ve_duzenleme",
      "difficulty": "easy"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdaki komutlardan hangisi 'example.txt' dosyasının içeriğini 'output.txt' dosyasına yönlendirir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "cat output.txt > example.txt",
        "cat example.txt < output.txt",
        "cat example.txt > output.txt",
        "cat output.txt < example.txt"
      ],
      "correctAnswer": "cat example.txt > output.txt",
      "explanation": "> işareti, çıktıyı belirtilen dosyaya yönlendirir. Bu örnekte, example.txt'nin içeriği output.txt dosyasına yazılır.",
      "subTopicName": "Dosya Görüntüleme Ve Düzenleme",
      "normalizedSubTopicName": "dosya_goruntuleme_ve_duzenleme",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "'less' komutu hangi özelliği ile 'cat' komutundan ayrılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Dosya içeriğini birleştirebilmesi",
        "Dosya içeriğini düzenleyebilmesi",
        "Dosya içinde geriye doğru gezinme imkanı sunması",
        "Dosya içeriğini şifreleyebilmesi"
      ],
      "correctAnswer": "Dosya içinde geriye doğru gezinme imkanı sunması",
      "explanation": "less komutu, dosya içeriğini etkileşimli olarak görüntülerken geriye doğru gezinme imkanı sunar. cat komutu ise sadece içeriği sıralı bir şekilde gösterir.",
      "subTopicName": "Dosya İçeriğini Görüntüleme Cat Less",
      "normalizedSubTopicName": "dosya_icerigini_goruntuleme_cat_less",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "Aşağıdaki komutlardan hangisi 'large_file.txt' dosyasını etkileşimli olarak görüntülemek için kullanılır ve kullanıcının dosya içinde ileri geri hareket etmesine olanak tanır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "cat large_file.txt",
        "nano large_file.txt",
        "less large_file.txt",
        "vi large_file.txt"
      ],
      "correctAnswer": "less large_file.txt",
      "explanation": "less komutu, büyük dosyaları etkileşimli olarak görüntülemek için idealdir ve kullanıcının dosya içinde ileri geri hareket etmesine olanak sağlar.",
      "subTopicName": "Dosya İçeriğini Görüntüleme Cat Less",
      "normalizedSubTopicName": "dosya_icerigini_goruntuleme_cat_less",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "Hangi komut, basit bir metin düzenleyici olarak bilinir ve kullanımı kolay arayüzü ile öne çıkar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "vi",
        "vim",
        "nano",
        "emacs"
      ],
      "correctAnswer": "nano",
      "explanation": "nano, basit ve kullanıcı dostu bir metin düzenleyicisidir. vi ve vim daha gelişmiş özelliklere sahipken, nano kolay kullanımı ile öne çıkar.",
      "subTopicName": "Text Editörleri Nano Vi Vim",
      "normalizedSubTopicName": "text_editorleri_nano_vi_vim",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "'vi' veya 'vim' editörlerini kullanırken, düzenleme moduna geçmek için hangi tuşa basılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Esc",
        "Ctrl + S",
        "i",
        "Enter"
      ],
      "correctAnswer": "i",
      "explanation": "vi ve vim editörlerinde düzenleme moduna geçmek için 'i' tuşuna basılır. Esc komut moduna geri dönmek için kullanılır.",
      "subTopicName": "Text Editörleri Nano Vi Vim",
      "normalizedSubTopicName": "text_editorleri_nano_vi_vim",
      "difficulty": "medium"
    },
    {
      "id": "q7",
      "questionText": "Aşağıdaki komutlardan hangisi bir dosyanın sadece ilk 5 satırını görüntülemek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "tail -n 5",
        "head -n 5",
        "cat -n 5",
        "less -n 5"
      ],
      "correctAnswer": "head -n 5",
      "explanation": "head komutu, bir dosyanın başından belirli sayıda satırı görüntülemek için kullanılır. '-n 5' parametresi, ilk 5 satırı belirtir.",
      "subTopicName": "Dosyanın İlk Son Kısmını Görüntüleme Head Tail",
      "normalizedSubTopicName": "dosyanin_ilk_son_kismini_goruntuleme_head_tail",
      "difficulty": "medium"
    },
    {
      "id": "q8",
      "questionText": "'log.txt' dosyasının son 20 satırını görüntülemek için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "head -20 log.txt",
        "tail -20 log.txt",
        "cat log.txt | head -20",
        "cat log.txt | tail -20"
      ],
      "correctAnswer": "tail -20 log.txt",
      "explanation": "tail komutu, bir dosyanın sonundan belirli sayıda satırı görüntülemek için kullanılır. 'tail -20 log.txt' komutu, log.txt dosyasının son 20 satırını gösterir.",
      "subTopicName": "Dosyanın İlk Son Kısmını Görüntüleme Head Tail",
      "normalizedSubTopicName": "dosyanin_ilk_son_kismini_goruntuleme_head_tail",
      "difficulty": "medium"
    },
    {
      "id": "q9",
      "questionText": "Linux sistemlerde çalışan süreçleri (process) görüntülemek için kullanılan komut aşağıdakilerden hangisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "df",
        "du",
        "ps",
        "free"
      ],
      "correctAnswer": "ps",
      "explanation": "ps komutu, çalışan süreçler hakkında bilgi verir. df disk alanı kullanımını, du dosya alanı kullanımını, free ise bellek kullanımını gösterir.",
      "subTopicName": "Çalışan İşlemleri Görüntüleme Ps",
      "normalizedSubTopicName": "calisan_islemleri_goruntuleme_ps",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Hangi 'ps' komutu, sistemdeki tüm çalışan süreçleri (hem kullanıcıya ait hem de sistem süreçleri) detaylı bir şekilde listeler?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "ps",
        "ps aux",
        "ps -l",
        "ps -ef"
      ],
      "correctAnswer": "ps aux",
      "explanation": "'ps aux' komutu, sistemdeki tüm çalışan süreçleri (hem kullanıcıya ait hem de sistem süreçleri) detaylı bir şekilde listeler. Bu komut, kullanıcı adı, PID, CPU kullanımı gibi bilgileri içerir.",
      "subTopicName": "Çalışan İşlemleri Görüntüleme Ps",
      "normalizedSubTopicName": "calisan_islemleri_goruntuleme_ps",
      "difficulty": "medium"
    }
  ]
}
```
```
