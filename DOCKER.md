# 🐳 NoteMaster avec Docker

## 🚀 Démarrage ultra-rapide

Une fois le projet cloné, il suffit de :

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/NoteMaster.git
cd NoteMaster

# 2. Démarrer avec Docker (1 seule commande !)
docker-compose up -d

# 3. Accéder à l'application
# http://localhost:3000
```

## 🎯 Avantages

- ✅ **Aucune installation** - Juste Docker requis
- ✅ **Environnement identique** - Même config partout
- ✅ **Démarrage en 1 commande** - `docker-compose up`
- ✅ **Données persistantes** - Volume Docker pour les notes
- ✅ **Production ready** - Optimisé pour la prod

## 🔧 Commandes utiles

```bash
# Démarrer en arrière-plan
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Arrêter
docker-compose down

# Reconstruire (après modifications)
docker-compose build --no-cache
```

## 📱 Accès

- **Application** : http://localhost:3000
- **API** : http://localhost:3000/api (via proxy)

## 🔐 Configuration IA

Pour utiliser votre propre clé Groq, modifiez le fichier `.env` :

```env
GROQ_API_KEY=votre_clé_groq_ici
```

Puis relancez :
```bash
docker-compose down
docker-compose up -d
```
