# TypeScript tüm hataları kontrol etme scripti
Write-Host "=== TypeScript Hataları Kontrol Ediliyor ===" -ForegroundColor Cyan

# 1. TypeScript compiler ile tüm hataları göster
Write-Host "`n1. TypeScript Compiler Hataları:" -ForegroundColor Yellow
npx tsc --noEmit --pretty --incremental false

# 2. ESLint hataları
Write-Host "`n2. ESLint Hataları:" -ForegroundColor Yellow
npm run lint 2>&1

# 3. Next.js build hataları (sadece type check)
Write-Host "`n3. Next.js Type Check Hataları:" -ForegroundColor Yellow
$env:CI = "true"
npm run build 2>&1

Write-Host "`n=== Kontrol Tamamlandı ===" -ForegroundColor Green
