// API Route pour Vercel - Notes statiques
// Note: Sur Vercel, on ne peut pas persister de fichiers
// Cette implémentation utilise une approche statique pour la démonstration

const sampleNotes = [
  {
    title: "Introduction à React",
    content: `React est une bibliothèque JavaScript développée par Facebook pour créer des interfaces utilisateur. 

Concepts clés :
- Composants : blocs de construction réutilisables
- JSX : syntaxe qui mélange JavaScript et HTML
- État (State) : données qui peuvent changer
- Props : propriétés passées aux composants
- Hooks : fonctions pour utiliser l'état et d'autres fonctionnalités

React utilise un DOM virtuel pour optimiser les performances. Les composants peuvent être fonctionnels ou basés sur des classes, mais les composants fonctionnels avec hooks sont maintenant privilégiés.`,
  },
  {
    title: "Introduction à JavaScript",
    content: `JavaScript est un langage de programmation polyvalent, principalement utilisé pour le développement web.

Caractéristiques principales :
- Langage interprété, dynamique
- Orienté objet et fonctionnel
- Exécuté côté client et serveur (Node.js)
- Typage faible et dynamique

Concepts fondamentaux :
- Variables : var, let, const
- Types de données : string, number, boolean, object, array
- Fonctions : déclarations, expressions, arrow functions
- Événements : interactions utilisateur
- DOM : manipulation des éléments HTML

JavaScript est essentiel pour créer des expériences web interactives et dynamiques.`,
  },
  {
    title: "Cours Linux",
    content: `Linux est un système d'exploitation open source basé sur Unix, créé par Linus Torvalds.

Avantages de Linux :
- Gratuit et open source
- Sécurisé et stable
- Personnalisable
- Performances élevées
- Large communauté de support

Commandes de base :
- ls : lister les fichiers
- cd : changer de répertoire
- mkdir : créer un dossier
- cp : copier des fichiers
- mv : déplacer/renommer
- rm : supprimer
- sudo : exécuter en tant qu'administrateur
- grep : rechercher dans les fichiers

Linux est largement utilisé pour les serveurs, le développement et l'administration système.`,
  },
];

module.exports = async (req, res) => {
  // Configurer CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case "GET":
        // Retourner toutes les notes
        res.json(sampleNotes);
        break;

      case "POST":
        // Simuler la création d'une note
        const { title, content } = req.body;
        if (!title || !content) {
          return res.status(400).json({ error: "Titre et contenu requis" });
        }

        // Note: Sur Vercel, on ne peut pas persister les données
        // Cette réponse simule la création
        // Pour la démonstration, on ajoute la note temporairement
        sampleNotes.push({ title, content });
        res.json({
          message: "Note créée avec succès",
          note: { title, content },
        });
        break;

      default:
        res.status(405).json({ error: "Méthode non autorisée" });
    }
  } catch (error) {
    console.error("Erreur dans l'API notes:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};
