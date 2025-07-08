#!/bin/sh

echo "🐳 Démarrage NoteMaster dans Docker..."

# Démarrer le serveur backend en arrière-plan
echo "🔌 Démarrage de l'API sur le port 5000..."
cd /app/server && node server.js &

# Démarrer le frontend React
echo "📱 Démarrage du frontend sur le port 3000..."
cd /app && npx serve -s build -l 3000

# Garder le conteneur en vie
wait
