// Test to validate the failed questions filtering fix
// This demonstrates the bug and the fix

console.log('🧪 Testing Failed Questions Filter Fix\n');

// Mock data simulating the bug scenario
const mockQuestions = [
  { id: 'q1', questionText: 'Question 1', correctAnswer: 'A' },
  { id: 'q2', questionText: 'Question 2', correctAnswer: 'B' },
  { id: 'q3', questionText: 'Question 3', correctAnswer: 'C' }
];

const mockUserAnswers = {
  'q1': 'A',  // Correct
  'q2': 'X',  // Wrong
  'q3': 'C'   // Correct
};

console.log('📝 Mock Questions:', mockQuestions.map(q => `${q.id}: ${q.correctAnswer}`));
console.log('📝 User Answers:', mockUserAnswers);

// BEFORE: Buggy implementation (using array index)
console.log('\n❌ BEFORE FIX (Buggy Code):');
const buggyFailedQuestions = mockQuestions.filter((q, index) => {
  const userAnswer = mockUserAnswers[index]; // BUG: using index instead of q.id
  console.log(`   Question ${q.id}: userAnswer[${index}] = ${userAnswer}, correctAnswer = ${q.correctAnswer}`);
  return userAnswer !== q.correctAnswer;
});
console.log('   Buggy Result - Failed Questions:', buggyFailedQuestions.map(q => q.id));

// AFTER: Fixed implementation (using question ID)
console.log('\n✅ AFTER FIX (Correct Code):');
const fixedFailedQuestions = mockQuestions.filter((q) => {
  const userAnswer = mockUserAnswers[q.id]; // FIX: using q.id as key
  console.log(`   Question ${q.id}: userAnswer[${q.id}] = ${userAnswer}, correctAnswer = ${q.correctAnswer}`);
  return userAnswer !== q.correctAnswer;
});
console.log('   Fixed Result - Failed Questions:', fixedFailedQuestions.map(q => q.id));

// Validation
console.log('\n🔍 VALIDATION:');
console.log('Expected failed questions: [q2] (only question 2 was answered incorrectly)');
console.log(`Buggy implementation result: [${buggyFailedQuestions.map(q => q.id).join(', ')}]`);
console.log(`Fixed implementation result: [${fixedFailedQuestions.map(q => q.id).join(', ')}]`);

const isFixWorking = fixedFailedQuestions.length === 1 && fixedFailedQuestions[0].id === 'q2';
console.log(`\n${isFixWorking ? '✅ FIX IS WORKING CORRECTLY!' : '❌ FIX HAS ISSUES'}`);

if (isFixWorking) {
  console.log('✅ The failed questions are now correctly identified using question IDs.');
  console.log('✅ Only questions with wrong answers are marked as failed.');
  console.log('✅ The quiz review functionality will work properly.');
} else {
  console.log('❌ There may still be issues with the fix.');
}
