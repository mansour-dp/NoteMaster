# 📚 NoteMaster

> **Application d'apprentissage intelligent avec IA**

NoteMaster est une application web moderne qui combine la prise de notes et l'intelligence artificielle pour générer automatiquement des quiz personnalisés.

## Fonctionnalités

- 📝 **Prise de notes intuitive** - Créez et organisez vos notes facilement
- 🤖 **Quiz IA automatiques** - Génération de questions intelligentes via Groq
- 📊 **Suivi des performances** - Statistiques détaillées et progression
- 🌙 **Mode sombre/clair** - Interface adaptative
- 📱 **Design responsive** - Mobile et desktop

## Installation

```bash
# 1. Cloner le projet
git clone https://github.com/votre-username/NoteMaster.git
cd NoteMaster

# 2. Installer les dépendances
npm install
cd server && npm install && cd ..

# 3. Lancer l'application
npm run dev
```

## Utilisation

1. **Créer des notes** - Ajoutez vos contenus d'apprentissage
2. **Générer des quiz** - L'IA crée automatiquement des questions
3. **Tester vos connaissances** - Répondez aux quiz
4. **Suivre vos progrès** - Consultez vos statistiques

## Technologies

- **Frontend** : React 18 + TypeScript + Material-UI
- **Backend** : Node.js + Express
- **IA** : Groq API (gratuite)
- **Déploiement** : Vercel

## 🔧 Configuration IA

Pour activer l'IA, ajoutez votre clé Groq dans `server/.env` :

```env
AI_PROVIDER=groq
GROQ_API_KEY=votre_clé_groq_ici
```

Obtenez votre clé gratuite sur [console.groq.com](https://console.groq.com/)

## 📱 Accès

- **Application** : http://localhost:3000
- **API** : http://localhost:5000

## 🐳 Démarrage avec Docker (Recommandé)

```bash
# 1. Cloner le projet
git clone https://github.com/mansour-dp/NoteMaster.git
cd NoteMaster

# 2. Lancer avec Docker (1 seule commande !)
docker-compose up -d
```

➡️ **Application** : http://localhost:3000

## 📖 Utilisation

1. **Créer des notes** - Utilisez l'éditeur pour vos contenus
2. **Générer des questions** - L'IA analyse vos notes automatiquement
3. **Faire des quiz** - Testez vos connaissances
4. **Suivre vos progrès** - Consultez vos statistiques

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

Ce projet est sous licence MIT.

---

⭐ **N'hésitez pas à mettre une étoile si ce projet vous plaît !**

## 🔗 Liens utiles

- 🌐 **Demo live** : [https://notemaster-react.vercel.app](https://notemaster-react.vercel.app)
- 📧 **Issues** : [GitHub Issues](https://github.com/mansour-dp/NoteMaster/issues)
- 📚 **Wiki** : [Documentation complète](https://github.com/mansour-dp/NoteMaster/wiki)
