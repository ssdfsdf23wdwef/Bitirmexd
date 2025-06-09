# AI Model Yanıtı

Tarih: 2025-06-09T13:16:06.624Z
Trace ID: quiz-1749474952863-x4jr8
Yanıt Uzunluğu: 7642 karakter

## Ham Çıktı:
```json
```json
{
  "questions": [
    {
      "id": "q1",
      "questionText": "Aşağıdaki komutlardan hangisi, iki dosyanın içeriğini birleştirip yeni bir dosyaya kaydetmek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "less file1.txt file2.txt > file3.txt",
        "cat file1.txt file2.txt > file3.txt",
        "nano file1.txt file2.txt > file3.txt",
        "vi file1.txt file2.txt > file3.txt"
      ],
      "correctAnswer": "cat file1.txt file2.txt > file3.txt",
      "explanation": "cat komutu, belirtilen dosyaların içeriğini birleştirir. '>' işareti ise bu birleştirilmiş içeriği yeni bir dosyaya yönlendirir. Bu örnekte, file1.txt ve file2.txt'nin içeriği birleştirilerek file3.txt dosyasına kaydedilir. less, nano ve vi komutları dosya görüntüleme ve düzenleme amaçlıdır, birleştirme işlemi yapmazlar.",
      "subTopicName": "Dosya İçeriği Birleştirme",
      "normalizedSubTopicName": "dosya_içeriği_birleştirme",
      "difficulty": "medium"
    },
    {
      "id": "q2",
      "questionText": "Aşağıdaki komutlardan hangisi 'example' kelimesini içeren satırları 'file.txt' içinde bulmak için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "applying",
      "options": [
        "head file.txt",
        "tail file.txt",
        "grep \"example\" file.txt",
        "less file.txt"
      ],
      "correctAnswer": "grep \"example\" file.txt",
      "explanation": "grep komutu, belirtilen deseni (bu durumda 'example' kelimesi) bir dosya içinde arar ve eşleşen satırları görüntüler. head ve tail komutları dosyanın başını ve sonunu gösterir, less ise dosyayı etkileşimli olarak görüntüler.",
      "subTopicName": "Dosya İçeriği Birleştirme",
      "normalizedSubTopicName": "dosya_içeriği_birleştirme",
      "difficulty": "medium"
    },
    {
      "id": "q3",
      "questionText": "Aşağıdaki komutlardan hangisi bir dosyanın içeriğini ileri ve geri gezinme özelliği ile etkileşimli olarak görüntülemek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "cat",
        "less",
        "nano",
        "vi"
      ],
      "correctAnswer": "less",
      "explanation": "less komutu, bir dosyanın içeriğini etkileşimli olarak görüntülemek için kullanılır. Bu, kullanıcının dosya içinde ileri ve geri hareket etmesine olanak tanır. cat komutu dosyanın tamamını bir defada görüntülerken, nano ve vi metin düzenleyicileridir.",
      "subTopicName": "Etkileşimli Dosya Görüntüleme",
      "normalizedSubTopicName": "etkileşimli_dosya_görüntüleme",
      "difficulty": "easy"
    },
    {
      "id": "q4",
      "questionText": "'less' komutu ile bir dosyayı görüntülerken, aşağıdakilerden hangisi yapılamaz?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "understanding",
      "options": [
        "Dosya içinde yukarı ve aşağı hareket etmek",
        "Dosyayı düzenlemek",
        "Dosyanın sonuna gitmek",
        "Dosyanın başına gitmek"
      ],
      "correctAnswer": "Dosyayı düzenlemek",
      "explanation": "less komutu sadece dosya görüntüleme amaçlıdır, dosya içeriğini düzenleme yeteneği yoktur. Dosya içinde yukarı ve aşağı hareket edilebilir, dosyanın başına ve sonuna gidilebilir.",
      "subTopicName": "Etkileşimli Dosya Görüntüleme",
      "normalizedSubTopicName": "etkileşimli_dosya_görüntüleme",
      "difficulty": "medium"
    },
    {
      "id": "q5",
      "questionText": "Aşağıdakilerden hangisi basit bir metin düzenleyicisidir?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "vi",
        "grep",
        "nano",
        "cat"
      ],
      "correctAnswer": "nano",
      "explanation": "nano, kullanımı kolay ve basit bir metin düzenleyicisidir. vi daha gelişmiş bir düzenleyicidir. grep dosya içinde arama yapar, cat ise dosya içeriğini görüntüler.",
      "subTopicName": "Text Editör Kullanımı",
      "normalizedSubTopicName": "text_editör_kullanımı",
      "difficulty": "easy"
    },
    {
      "id": "q6",
      "questionText": "Hangi komut, bir dosyayı düzenlemek için kullanılabilecek gelişmiş bir metin editörüdür?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "head",
        "tail",
        "nano",
        "vi"
      ],
      "correctAnswer": "vi",
      "explanation": "vi, gelişmiş özelliklere sahip bir metin editörüdür. head ve tail komutları dosyanın başını ve sonunu gösterir, nano ise basit bir metin editörüdür.",
      "subTopicName": "Text Editör Kullanımı",
      "normalizedSubTopicName": "text_editör_kullanımı",
      "difficulty": "easy"
    },
    {
      "id": "q7",
      "questionText": "Aşağıdaki komutlardan hangisi bir dosyanın içeriğini görüntülemek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "ps",
        "df",
        "cat",
        "free"
      ],
      "correctAnswer": "cat",
      "explanation": "cat komutu, bir dosyanın içeriğini terminal ekranında görüntülemek için kullanılır. ps çalışan süreçleri, df disk alanı kullanımını, free ise bellek kullanımını gösterir.",
      "subTopicName": "Dosya Görüntüleme Ve Düzenleme",
      "normalizedSubTopicName": "dosya_görüntüleme_ve_düzenleme",
      "difficulty": "easy"
    },
    {
      "id": "q8",
      "questionText": "Aşağıdaki komutlardan hangisi bir dosyanın son 10 satırını görüntülemek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "head",
        "tail",
        "less",
        "grep"
      ],
      "correctAnswer": "tail",
      "explanation": "tail komutu, bir dosyanın son satırlarını (varsayılan olarak son 10 satırı) görüntülemek için kullanılır. head ilk satırları, less etkileşimli görüntüleme, grep ise desen arama için kullanılır.",
      "subTopicName": "Dosya Görüntüleme Ve Düzenleme",
      "normalizedSubTopicName": "dosya_görüntüleme_ve_düzenleme",
      "difficulty": "easy"
    },
    {
      "id": "q9",
      "questionText": "Linux sistemlerde çalışan süreçler hakkında bilgi almak için hangi komut kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "df",
        "free",
        "ps",
        "du"
      ],
      "correctAnswer": "ps",
      "explanation": "ps komutu, çalışan süreçler hakkında bilgi verir. Örneğin, 'ps aux' komutu tüm çalışan süreçleri detaylı bir şekilde listeler. df disk alanı kullanımını, free bellek kullanımını, du ise dosya alanı kullanımını gösterir.",
      "subTopicName": "Çalışan Süreçleri Görüntüleme",
      "normalizedSubTopicName": "çalışan_süreçleri_görüntüleme",
      "difficulty": "easy"
    },
    {
      "id": "q10",
      "questionText": "Hangi komut, tüm çalışan süreçleri detaylı bir şekilde listelemek için kullanılır?",
      "questionType": "multiple_choice",
      "cognitiveDomain": "remembering",
      "options": [
        "ps",
        "ps aux",
        "ps -h",
        "ps -s"
      ],
      "correctAnswer": "ps aux",
      "explanation": "ps aux komutu, tüm çalışan süreçleri kullanıcı, PID, CPU kullanımı gibi detaylı bilgilerle birlikte listeler. Diğer seçenekler ps komutunun farklı kullanımlarını temsil eder, ancak tüm süreçleri detaylı listeleme işlevini 'ps aux' sağlar.",
      "subTopicName": "Çalışan Süreçleri Görüntüleme",
      "normalizedSubTopicName": "çalışan_süreçleri_görüntüleme",
      "difficulty": "easy"
    }
  ]
}
```
```
