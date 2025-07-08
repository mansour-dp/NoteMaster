# Script pour supprimer le commit ae10c64 qui contient la clé Groq
# Ce script utilise git rebase pour supprimer uniquement ce commit

Write-Host "Suppression du commit ae10c64 qui contient la clé Groq..." -ForegroundColor Yellow

# Créer un fichier temporaire avec les instructions de rebase
$rebaseInstructions = @"
pick ed075f7 Ajout de docker file and docker compose version stable
drop ae10c64 version stable
pick 8c7d9f3 version stable 1
"@

$tempFile = [System.IO.Path]::GetTempFileName()
$rebaseInstructions | Out-File -FilePath $tempFile -Encoding UTF8

# Exporter la variable d'environnement pour utiliser notre fichier
$env:GIT_SEQUENCE_EDITOR = "cp `"$tempFile`""

try {
    # Exécuter le rebase
    git rebase -i HEAD~3
    
    Write-Host "✅ Commit supprimé avec succès !" -ForegroundColor Green
    Write-Host "Vérification de l'historique :" -ForegroundColor Cyan
    git log --oneline -5
} catch {
    Write-Host "❌ Erreur lors du rebase : $_" -ForegroundColor Red
} finally {
    # Nettoyer
    Remove-Item $tempFile -ErrorAction SilentlyContinue
    Remove-Item Env:\GIT_SEQUENCE_EDITOR -ErrorAction SilentlyContinue
}
