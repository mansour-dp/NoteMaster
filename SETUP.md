# 🚀 Guide d'installation NoteMaster

## 📥 Installation

```bash
# 1. Cloner le projet
git clone https://github.com/mansour-dp/NoteMaster.git
cd NoteMaster

# 2. Installer les dépendances
npm install
cd server && npm install && cd ..

# 3. Configuration des clés API (OBLIGATOIRE pour l'IA)
cp .env.example .env
cp server/.env.example server/.env
```

## 🔑 Configuration API

### **Option 1 : Avec IA (Recommandé)**

1. **Créer un compte Groq gratuit :**

   - Aller sur [console.groq.com](https://console.groq.com/)
   - S'inscrire (gratuit)
   - Générer une clé API

2. **Configurer les fichiers :**

   **Dans `server/.env` :**

   ```env
   AI_PROVIDER=groq
   GROQ_API_KEY=gsk_votre_vraie_cle_ici
   ```

   **Dans `.env` (racine) :**

   ```env
   GROQ_API_KEY=gsk_votre_vraie_cle_ici
   ```

### **Option 2 : Sans IA (Mode dégradé)**

Dans `server/.env` :

```env
AI_PROVIDER=fallback
# GROQ_API_KEY=commenté
```

## ▶️ Démarrage

```bash
# Mode développement
npm run dev

# Avec Docker
docker-compose up -d
```

## 🌐 Accès

- **Application :** http://localhost:3000
- **API :** http://localhost:5000

## 🔧 Dépannage

- **L'IA ne fonctionne pas :** Vérifiez votre clé API dans `server/.env`
- **Erreur de port :** Modifiez `PORT=5000` dans `server/.env`
- **Problème de build :** Supprimez `node_modules` et relancez `npm install`

## 📝 Notes importantes

- Les fichiers `.env` ne sont PAS versionnés (sécurité)
- Chaque développeur doit avoir sa propre clé API
- Le mode sans IA fonctionne mais avec des fonctionnalités limitées
