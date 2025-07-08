# Script pour supprimer automatiquement le commit ae10c64
Write-Host "🔄 Suppression du commit ae10c64 qui contient la clé Groq..." -ForegroundColor Yellow

# D'abord, annuler tout rebase en cours
try {
    git rebase --abort 2>$null
} catch {}

# Méthode alternative : utiliser git reset pour revenir avant le commit problématique
# puis cherry-pick les commits que nous voulons garder

Write-Host "📍 Sauvegarde de l'état actuel..." -ForegroundColor Cyan
$currentBranch = git branch --show-current
$headCommit = git rev-parse HEAD

# Créer une branche de sauvegarde
git branch backup-before-cleanup HEAD

Write-Host "🎯 Réinitialisation au commit avant le commit problématique..." -ForegroundColor Cyan
# Revenir au commit ed075f7 (juste avant ae10c64)
git reset --hard ed075f7

Write-Host "🍒 Cherry-pick du dernier commit valide..." -ForegroundColor Cyan
# Appliquer seulement le commit 8c7d9f3 (version stable 1)
try {
    git cherry-pick 8c7d9f3
    
    Write-Host "✅ Commit ae10c64 supprimé avec succès !" -ForegroundColor Green
    Write-Host "📋 Nouvel historique :" -ForegroundColor Cyan
    git log --oneline -5
    
    Write-Host "`n🔍 Vérification qu'aucune clé Groq n'est présente :" -ForegroundColor Cyan
    $groqCheck = git log --all --full-history -- "*" | Select-String "gsk_" 2>$null
    if ($groqCheck) {
        Write-Host "⚠️  Des clés Groq sont encore présentes dans l'historique !" -ForegroundColor Red
        $groqCheck
    } else {
        Write-Host "✅ Aucune clé Groq trouvée dans l'historique !" -ForegroundColor Green
    }
    
} catch {
    Write-Host "❌ Erreur lors du cherry-pick : $_" -ForegroundColor Red
    Write-Host "🔄 Restauration de l'état précédent..." -ForegroundColor Yellow
    git reset --hard backup-before-cleanup
}

Write-Host "`n📝 Vous pouvez maintenant push en toute sécurité :" -ForegroundColor Green
Write-Host "   git push origin main --force-with-lease" -ForegroundColor White
