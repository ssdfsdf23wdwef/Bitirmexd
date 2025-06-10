/**
 * Topic Classification Test
 * Tests the simplified main topic classification system
 */

// Classification function (copied from CourseDetail page)
const classifyMainTopic = (description: string): string => {
  const text = description.toLowerCase();
  
  // Programming concepts
  if (text.includes('variable') || text.includes('değişken') || text.includes('veri tip')) {
    return 'Temel Programlama';
  }
  if (text.includes('function') || text.includes('fonksiyon') || text.includes('metod')) {
    return 'Fonksiyonlar';
  }
  if (text.includes('array') || text.includes('dizi') || text.includes('list')) {
    return 'Veri Yapıları';
  }
  if (text.includes('loop') || text.includes('döngü') || text.includes('for') || text.includes('while')) {
    return 'Döngüler';
  }
  if (text.includes('class') || text.includes('sınıf') || text.includes('object') || text.includes('nesne')) {
    return 'Nesne Yönelimli Programlama';
  }
  if (text.includes('algorithm') || text.includes('algoritma')) {
    return 'Algoritmalar';
  }
  if (text.includes('database') || text.includes('veritabanı') || text.includes('sql')) {
    return 'Veritabanı';
  }
  if (text.includes('web') || text.includes('http') || text.includes('api')) {
    return 'Web Geliştirme';
  }
  
  // Math concepts
  if (text.includes('integral') || text.includes('türev') || text.includes('limit')) {
    return 'Matematik Analiz';
  }
  if (text.includes('linear') || text.includes('doğrusal') || text.includes('matrix')) {
    return 'Lineer Cebir';
  }
  if (text.includes('probability') || text.includes('olasılık') || text.includes('statistics')) {
    return 'İstatistik';
  }
  if (text.includes('geometry') || text.includes('geometri')) {
    return 'Geometri';
  }
  
  // Physics concepts
  if (text.includes('force') || text.includes('kuvvet') || text.includes('motion') || text.includes('hareket')) {
    return 'Mekanik';
  }
  if (text.includes('electric') || text.includes('elektrik')) {
    return 'Elektrik';
  }
  if (text.includes('wave') || text.includes('dalga')) {
    return 'Dalgalar';
  }
  
  // Chemistry concepts
  if (text.includes('element') || text.includes('atom')) {
    return 'Kimya Temelleri';
  }
  if (text.includes('reaction') || text.includes('reaksiyon')) {
    return 'Kimyasal Reaksiyonlar';
  }
  
  // Biology concepts
  if (text.includes('cell') || text.includes('hücre')) {
    return 'Hücre Biyolojisi';
  }
  if (text.includes('evolution') || text.includes('evrim')) {
    return 'Evrim';
  }
  
  return 'Genel Konular';
};

// Test cases
const testCases = [
  // Programming topics
  { input: 'JavaScript variable declaration', expected: 'Temel Programlama' },
  { input: 'Python fonksiyon tanımlama', expected: 'Fonksiyonlar' },
  { input: 'Array and list manipulation', expected: 'Veri Yapıları' },
  { input: 'For döngüsü kullanımı', expected: 'Döngüler' },
  { input: 'Java class yapısı', expected: 'Nesne Yönelimli Programlama' },
  { input: 'Sorting algoritma', expected: 'Algoritmalar' },
  { input: 'SQL veritabanı', expected: 'Veritabanı' },
  { input: 'REST API geliştirme', expected: 'Web Geliştirme' },
  
  // Math topics
  { input: 'Integral hesaplama', expected: 'Matematik Analiz' },
  { input: 'Matrix operations', expected: 'Lineer Cebir' },
  { input: 'Probability teorisi', expected: 'İstatistik' },
  { input: 'Geometri problemleri', expected: 'Geometri' },
  
  // Physics topics
  { input: 'Newton kuvvet kanunları', expected: 'Mekanik' },
  { input: 'Electric circuits', expected: 'Elektrik' },
  { input: 'Sound wave properties', expected: 'Dalgalar' },
  
  // Chemistry topics
  { input: 'Periodic element table', expected: 'Kimya Temelleri' },
  { input: 'Chemical reaction types', expected: 'Kimyasal Reaksiyonlar' },
  
  // Biology topics
  { input: 'Cell structure', expected: 'Hücre Biyolojisi' },
  { input: 'Evolution theory', expected: 'Evrim' },
  
  // Default case
  { input: 'Random topic that does not match', expected: 'Genel Konular' },
];

// Run tests
console.log('🧪 Topic Classification Tests\n');

let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = classifyMainTopic(testCase.input);
  const success = result === testCase.expected;
  
  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: "${testCase.input}" → "${result}"`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: "${testCase.input}"`);
    console.log(`   Expected: "${testCase.expected}"`);
    console.log(`   Got: "${result}"`);
  }
});

console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`);

// Example structure output
console.log('\n📋 Example Topic Structure:');
console.log('a. Temel Programlama');
console.log('   1. Variable Declaration');
console.log('   2. Data Types');
console.log('   3. Operators');
console.log('');
console.log('b. Fonksiyonlar');
console.log('   1. Function Definition');
console.log('   2. Parameters');  
console.log('   3. Return Values');
console.log('');
console.log('c. Veri Yapıları');
console.log('   1. Arrays');
console.log('   2. Lists');
console.log('   3. Hash Tables');

export { classifyMainTopic };
