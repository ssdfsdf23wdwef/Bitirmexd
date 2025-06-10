# AI Model Yanıtı

Tarih: 2025-06-10T16:16:11.066Z
Trace ID: quiz-1749572156296-q2i9v
Yanıt Uzunluğu: 7861 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Aşağıdaki komutlardan hangisi bir dosyanın içeriğini birleştirip başka bir dosyaya yönlendirmek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "less",
        "cat",
        "nano",
        "vi"
      ],
      "correctAnswer": "cat",
      "explanation": "cat komutu, dosyaların içeriğini birleştirir ve görüntüler. Ayrıca, `cat file1.txt file2.txt > file3.txt` şeklinde kullanılarak dosyaların içeriği birleştirilip file3.txt dosyasına yönlendirilebilir. less, dosya içeriğini etkileşimli olarak görüntülerken, nano ve vi metin düzenleme araçlarıdır.",
      "subTopicName": "Dosya Görüntüleme Ve Düzenleme",
      "normalizedSubTopicName": "dosya_goruntuleme_ve_duzenleme",
      "difficulty": "medium"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdaki komutlardan hangisi bir dosyanın içeriğini etkileşimli bir şekilde görüntülemek için kullanılır ve geriye doğru gezinme imkanı sunar?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "cat",
        "head",
        "less",
        "tail"
      ],
      "correctAnswer": "less",
      "explanation": "less komutu, dosya içeriğini etkileşimli olarak görüntüler ve geriye doğru gezinme imkanı sunar. cat komutu dosya içeriğini birleştirip görüntülerken, head ve tail komutları sırasıyla dosyanın ilk ve son kısımlarını gösterir.",
      "subTopicName": "Dosya Görüntüleme Ve Düzenleme",
      "normalizedSubTopicName": "dosya_goruntuleme_ve_duzenleme",
      "difficulty": "easy"
    },
    {
      "id": "q3",
      "questionText": "Aşağıdaki komutlardan hangisi bir dosyanın içeriğini görüntülemek için kullanılır, ancak `less` komutundan farklı olarak etkileşimli gezinme özelliği sunmaz?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "nano",
        "vi",
        "cat",
        "grep"
      ],
      "correctAnswer": "cat",
      "explanation": "`cat` komutu bir dosyanın içeriğini doğrudan ekrana yazdırır ve etkileşimli gezinme özelliği sunmaz. `less` komutu etkileşimli gezinme özelliği sunar. `nano` ve `vi` metin düzenleme araçlarıdır, `grep` ise dosyalarda arama yapar.",
      "subTopicName": "Dosya İçeriğini Görüntüleme Cat Less",
      "normalizedSubTopicName": "dosya_icerigini_goruntuleme_cat_less",
      "difficulty": "medium"
    },
    {
      "id": "q4",
      "questionText": "`less` komutunun `cat` komutuna göre temel avantajı nedir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Dosyaları birleştirebilmesi",
        "Dosya içinde arama yapabilmesi",
        "Etkileşimli olarak ileri ve geri gezinme imkanı sunması",
        "Dosyayı düzenleyebilmesi"
      ],
      "correctAnswer": "Etkileşimli olarak ileri ve geri gezinme imkanı sunması",
      "explanation": "`less` komutu, `cat` komutuna göre etkileşimli olarak ileri ve geri gezinme imkanı sunar. Bu özellik, özellikle büyük dosyaların içeriğini incelerken kullanışlıdır. `cat` dosyaları birleştirebilirken, `less` bu özelliği sunmaz. Dosya içinde arama yapmak için `grep` kullanılır, dosyayı düzenlemek için ise `nano` veya `vi` gibi metin düzenleyiciler kullanılır.",
      "subTopicName": "Dosya İçeriğini Görüntüleme Cat Less",
      "normalizedSubTopicName": "dosya_icerigini_goruntuleme_cat_less",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "Hangi komut, Linux sistemlerde basit metin düzenleme işlemleri için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "vi",
        "grep",
        "nano",
        "cat"
      ],
      "correctAnswer": "nano",
      "explanation": "nano, Linux sistemlerde basit metin düzenleme işlemleri için kullanılan bir text editörüdür. vi daha gelişmiş bir editördür, grep dosyalarda arama yapar ve cat dosya içeriğini görüntüler.",
      "subTopicName": "Basit Metin Düzenleme Nano",
      "normalizedSubTopicName": "basit_metin_duzenleme_nano",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "`nano` editörünü kullanarak bir dosyayı açmak ve düzenlemek için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "cat dosya.txt",
        "nano dosya.txt",
        "vi dosya.txt",
        "grep dosya.txt"
      ],
      "correctAnswer": "nano dosya.txt",
      "explanation": "`nano` editörünü kullanarak bir dosyayı açmak ve düzenlemek için `nano dosya.txt` komutu kullanılır. `cat` komutu dosya içeriğini görüntüler, `vi` gelişmiş bir metin editörüdür ve `grep` dosyalarda arama yapar.",
      "subTopicName": "Basit Metin Düzenleme Nano",
      "normalizedSubTopicName": "basit_metin_duzenleme_nano",
      "difficulty": "easy"
    },
    {
      "id": "q7",
      "questionText": "Aşağıdakilerden hangisi Linux sistemlerde gelişmiş bir metin düzenleme aracıdır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "nano",
        "cat",
        "vi/vim",
        "head"
      ],
      "correctAnswer": "vi/vim",
      "explanation": "vi/vim, Linux sistemlerde kullanılan gelişmiş bir metin düzenleme aracıdır. nano daha basit bir editördür, cat dosya içeriğini görüntüler ve head dosyanın ilk satırlarını gösterir.",
      "subTopicName": "Gelişmiş Metin Düzenleme Vi Vim",
      "normalizedSubTopicName": "gelismis_metin_duzenleme_vi_vim",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "`vi` veya `vim` editörünü kullanarak 'example.txt' adlı bir dosyayı açmak için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "nano example.txt",
        "cat example.txt",
        "vi example.txt",
        "grep example.txt"
      ],
      "correctAnswer": "vi example.txt",
      "explanation": "`vi` veya `vim` editörünü kullanarak 'example.txt' adlı bir dosyayı açmak için `vi example.txt` komutu kullanılır. `nano` daha basit bir metin editörüdür, `cat` dosya içeriğini görüntüler ve `grep` dosyalarda arama yapar.",
      "subTopicName": "Gelişmiş Metin Düzenleme Vi Vim",
      "normalizedSubTopicName": "gelismis_metin_duzenleme_vi_vim",
      "difficulty": "easy"
    },
    {
      "id": "q9",
      "questionText": "Linux'ta çalışan süreçler hakkında bilgi almak için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "df",
        "du",
        "ps",
        "free"
      ],
      "correctAnswer": "ps",
      "explanation": "ps komutu, çalışan süreçler hakkında bilgi verir. df disk alanı kullanımını, du dosya alanı kullanımını ve free bellek kullanımını gösterir.",
      "subTopicName": "Çalışan Süreçleri Görüntüleme Ps",
      "normalizedSubTopicName": "calisan_surecleri_goruntuleme_ps",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Hangi `ps` komutu, sistemdeki tüm çalışan süreçleri detaylı bir şekilde listeler?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "ps",
        "ps -h",
        "ps aux",
        "ps -ef"
      ],
      "correctAnswer": "ps aux",
      "explanation": "`ps aux` komutu, sistemdeki tüm çalışan süreçleri detaylı bir şekilde listeler. Bu komut, kullanıcılar, PID'ler, CPU ve bellek kullanımları gibi bilgileri içerir.",
      "subTopicName": "Çalışan Süreçleri Görüntüleme Ps",
      "normalizedSubTopicName": "calisan_surecleri_goruntuleme_ps",
      "difficulty": "medium"
    }
  ]
}
```
```
