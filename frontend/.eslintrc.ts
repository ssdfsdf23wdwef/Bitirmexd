/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'prettier'],
  extends: [
    'next/core-web-vitals',           // Next.js’in kendi kural paketi
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended'     // <- Prettier’i ESLint’e entegre eder
  ],
  rules: {
    // Özel ayarların varsa buraya
  },
};
