# Push to shib2bot repository
Write-Host "Pushing to shib2bot repository..." -ForegroundColor Cyan

cd C:\Users\caws8\veo3-telegram-bot

# Check current branch
$branch = git branch --show-current
Write-Host "Current branch: $branch" -ForegroundColor Yellow

# Add all changes
Write-Host "`nAdding all changes..." -ForegroundColor Yellow
git add -A

# Check status
$status = git status --short
if ($status) {
    Write-Host "Changes to commit:" -ForegroundColor Green
    Write-Host $status
    git commit -m "Clean codebase: Remove Python code, default to dummy provider, ready for public use"
} else {
    Write-Host "No changes to commit" -ForegroundColor Gray
}

# Remove old remote if exists
git remote remove shib2bot 2>$null

# Add new remote
Write-Host "`nAdding remote: shib2bot" -ForegroundColor Yellow
git remote add shib2bot https://github.com/Caws83/shib2bot.git

# Show remotes
Write-Host "`nCurrent remotes:" -ForegroundColor Yellow
git remote -v

# Push to new repo
Write-Host "`nPushing to shib2bot/main..." -ForegroundColor Yellow
git push -u shib2bot $branch --force 2>&1 | Tee-Object -Variable pushOutput

Write-Host "`nPush output:" -ForegroundColor Cyan
Write-Host $pushOutput

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Successfully pushed to https://github.com/Caws83/shib2bot.git" -ForegroundColor Green
} else {
    Write-Host "`n✗ Push failed. Check the output above." -ForegroundColor Red
}

