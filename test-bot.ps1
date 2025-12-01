# Quick Bot Test Script
Write-Host "`n=== Veo3 Telegram Bot Test ===" -ForegroundColor Cyan
Write-Host ""

# Check if .env exists
if (-not (Test-Path .env)) {
    Write-Host "❌ .env file not found!" -ForegroundColor Red
    Write-Host "Please create .env file with your TELEGRAM_BOT_TOKEN" -ForegroundColor Yellow
    exit 1
}

# Check if token is set
$envContent = Get-Content .env
$hasToken = $envContent | Select-String -Pattern "TELEGRAM_BOT_TOKEN=(?!YOUR_TOKEN_HERE|your_telegram_bot_token_here)" -Quiet

if (-not $hasToken) {
    Write-Host "⚠️  WARNING: TELEGRAM_BOT_TOKEN not set in .env" -ForegroundColor Yellow
    Write-Host "   Please add your bot token from @BotFather" -ForegroundColor Yellow
    Write-Host ""
}

Write-Host "✅ .env file exists" -ForegroundColor Green
Write-Host ""
Write-Host "To test the bot:" -ForegroundColor Cyan
Write-Host "1. Make sure TELEGRAM_BOT_TOKEN is set in .env" -ForegroundColor White
Write-Host "2. Run: npm run dev" -ForegroundColor White
Write-Host "3. Look for: 'Telegram bot started and polling for updates'" -ForegroundColor White
Write-Host "4. Open Telegram and send /start to your bot" -ForegroundColor White
Write-Host ""

