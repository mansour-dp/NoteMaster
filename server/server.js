const express = require("express");
const cors = require("cors");
const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Dossiers pour stocker les données
const DATA_DIR = path.join(__dirname, "data");
const NOTES_DIR = path.join(DATA_DIR, "notes");
const QUESTIONS_DIR = path.join(DATA_DIR, "questions");
const STATS_DIR = path.join(DATA_DIR, "stats");
const QUIZ_HISTORY_DIR = path.join(DATA_DIR, "quiz-history");

// Créer les dossiers s'ils n'existent pas
fs.ensureDirSync(NOTES_DIR);
fs.ensureDirSync(QUESTIONS_DIR);
fs.ensureDirSync(STATS_DIR);
fs.ensureDirSync(QUIZ_HISTORY_DIR);

// Configuration API IA
const AI_PROVIDER = process.env.AI_PROVIDER || "fallback";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper function pour appeler l'API IA (Groq)
async function callAIAPI(messages, maxTokens = 1000) {
  try {
    let response;

    if (AI_PROVIDER === "groq" && GROQ_API_KEY) {
      // Utiliser Groq
      response = await axios.post(
        GROQ_API_URL,
        {
          model: "llama3-8b-8192", // Modèle Llama gratuit et performant
          messages: messages,
          max_tokens: maxTokens,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
    } else {
      throw new Error("Aucune API IA configurée");
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("Erreur API IA:", error.response?.data || error.message);

    if (error.response?.data?.error?.message?.includes("invalid")) {
      throw new Error("Clé API invalide. Vérifiez votre clé dans server/.env");
    }

    if (
      error.response?.data?.error?.message?.includes("Insufficient Balance")
    ) {
      throw new Error(
        "Solde insuffisant. Rechargez votre compte ou utilisez Groq (gratuit)"
      );
    }

    throw new Error("Erreur lors de l'appel à l'API IA");
  }
}

// Test de la clé API au démarrage
async function testAIAPI() {
  if (AI_PROVIDER === "groq") {
    if (!GROQ_API_KEY || GROQ_API_KEY === "your_groq_api_key_here") {
      console.warn("⚠️  ATTENTION: Clé API Groq non configurée!");
      console.warn(
        "🔄 L'application fonctionnera en mode fallback uniquement."
      );
      return false;
    }
  }

  try {
    console.log(`🧪 Test de la clé API ${AI_PROVIDER.toUpperCase()}...`);
    await callAIAPI(
      [{ role: "user", content: 'Dites juste "test réussi"' }],
      10
    );
    console.log(`✅ Clé API ${AI_PROVIDER.toUpperCase()} valide!`);
    return true;
  } catch (error) {
    if (error.message.includes("Insufficient Balance")) {
      console.error("❌ Solde insuffisant sur votre compte!");
      console.warn("� Essayez Groq (gratuit) : https://console.groq.com/");
      console.warn(
        "🔄 L'application fonctionnera en mode fallback uniquement."
      );
    } else {
      console.error(
        `❌ Test API ${AI_PROVIDER.toUpperCase()} échoué:`,
        error.message
      );
    }
    return false;
  }
}

// Routes pour les notes

// GET /notes - Récupérer toutes les notes
app.get("/notes", async (req, res) => {
  try {
    const files = await fs.readdir(NOTES_DIR);
    const notes = [];

    for (const file of files) {
      if (file.endsWith(".txt")) {
        const title = path.basename(file, ".txt");
        const content = await fs.readFile(path.join(NOTES_DIR, file), "utf8");
        notes.push({ title, content });
      }
    }

    res.json(notes);
  } catch (error) {
    console.error("Erreur lors de la récupération des notes:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /notes - Créer une nouvelle note
app.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Titre et contenu requis" });
    }

    const filename = `${title}.txt`;
    const filepath = path.join(NOTES_DIR, filename);

    await fs.writeFile(filepath, content, "utf8");

    res.json({ message: "Note créée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la création de la note:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT /notes/:title - Mettre à jour une note
app.put("/notes/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Contenu requis" });
    }

    const filename = `${title}.txt`;
    const filepath = path.join(NOTES_DIR, filename);

    await fs.writeFile(filepath, content, "utf8");

    res.json({ message: "Note mise à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la note:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /notes/:title - Supprimer une note
app.delete("/notes/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const filename = `${title}.txt`;
    const filepath = path.join(NOTES_DIR, filename);

    await fs.remove(filepath);

    // Supprimer aussi les questions associées
    const questionsFile = path.join(QUESTIONS_DIR, `${title}.json`);
    if (await fs.pathExists(questionsFile)) {
      await fs.remove(questionsFile);
    }

    res.json({ message: "Note supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la note:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Route pour générer des questions avec IA
app.post("/generate-questions", async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Titre et contenu requis" });
    }

    // Créer un identifiant unique pour cette session
    const sessionId = Date.now();

    // Lire l'historique des questions déjà générées pour cette note
    const historyFile = path.join(QUESTIONS_DIR, `${title}.json`);
    let previousQuestions = [];
    if (await fs.pathExists(historyFile)) {
      try {
        const existingData = await fs.readFile(historyFile, "utf8");
        const parsed = JSON.parse(existingData);
        if (Array.isArray(parsed.history)) {
          previousQuestions = parsed.history
            .flat()
            .map((q) => q.text || q.question);
        } else if (Array.isArray(parsed)) {
          previousQuestions = parsed.map((q) => q.text || q.question);
        }
      } catch (e) {
        console.log("Création d'un nouvel historique pour", title);
      }
    }

    // Créer les instructions pour éviter les répétitions
    const avoidRepetition =
      previousQuestions.length > 0
        ? `\n\nIMPORTANT: ÉVITEZ absolument ces questions déjà posées:\n${previousQuestions
            .map((q, i) => `${i + 1}. ${q}`)
            .join(
              "\n"
            )}\n\nGénérez des questions COMPLÈTEMENT DIFFÉRENTES avec de nouveaux angles d'approche.`
        : "";

    // Ajouter de la variabilité pour éviter les questions répétitives
    const questionStyles = [
      "questions conceptuelles approfondies",
      "questions d'application pratique",
      "questions d'analyse critique",
      "questions de comparaison et contraste",
      "questions de résolution de problèmes",
      "questions de réflexion personnelle",
      "questions de mémorisation ciblée",
      "questions de synthèse créative",
    ];

    const selectedStyles = questionStyles
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    const currentTime = new Date().toLocaleString("fr-FR");

    const prompt = `En tant qu'expert pédagogique, basez-vous sur cette note "${title}":

CONTENU:
"${content}"

MISSION: Créez exactement 5 questions d'apprentissage ORIGINALES et UNIQUES.

STYLE DEMANDÉ (session ${sessionId}): ${selectedStyles.join(", ")}

CONTRAINTES:
- Questions spécifiques au contenu fourni
- Aucune question générique
- Réponses détaillées et précises  
- Variez les formulations et approches
- Date/heure: ${currentTime}${avoidRepetition}

FORMAT JSON STRICT:
[
  {
    "text": "Question précise et spécifique?",
    "reponse": "Réponse complète et détaillée basée sur le contenu"
  }
]

Générez maintenant 5 questions INNOVANTES et DIFFÉRENTES:`;

    const messages = [
      {
        role: "system",
        content: `Tu es un générateur de questions pédagogiques expert. Tu crées TOUJOURS des questions uniques et originales. Session: ${sessionId}. Évite absolument toute répétition. Réponds uniquement en JSON valide.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await callAIAPI(messages, 1500);

    // Parser la réponse JSON
    let questions;
    try {
      questions = JSON.parse(response);
    } catch (parseError) {
      // Si le parsing échoue, essayer d'extraire le JSON
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        questions = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Format de réponse invalide");
      }
    }

    // Sauvegarder les questions avec historique
    const questionsFile = path.join(QUESTIONS_DIR, `${title}.json`);

    // Charger l'historique existant
    let historyData = { current: questions, history: [] };
    if (await fs.pathExists(questionsFile)) {
      try {
        const existingData = await fs.readFile(questionsFile, "utf8");
        const parsed = JSON.parse(existingData);
        if (parsed.history) {
          historyData.history = parsed.history;
        } else if (Array.isArray(parsed)) {
          historyData.history = [parsed];
        }
      } catch (e) {
        console.log("Création d'un nouvel historique");
      }
    }

    // Ajouter les nouvelles questions à l'historique
    historyData.history.push(questions);
    // Garder seulement les 10 dernières générations
    if (historyData.history.length > 10) {
      historyData.history = historyData.history.slice(-10);
    }

    await fs.writeFile(questionsFile, JSON.stringify(historyData, null, 2));

    res.json(questions);
  } catch (error) {
    console.error("Erreur lors de la génération des questions:", error);

    // Mode fallback en cas d'erreur API DeepSeek
    console.warn("🔄 Activation du mode fallback (questions génériques)...");
    try {
      const { title, content } = req.body;
      const fallbackQuestions = generateFallbackQuestions(title, content);

      const questionsFile = path.join(QUESTIONS_DIR, `${title}.json`);
      await fs.writeFile(
        questionsFile,
        JSON.stringify(fallbackQuestions, null, 2)
      );

      res.json(fallbackQuestions);
    } catch (fallbackError) {
      res
        .status(500)
        .json({ error: "Erreur lors de la génération des questions" });
    }
  }
});

// Route pour évaluer une réponse
app.post("/evaluate-answer", async (req, res) => {
  try {
    const { question, user_answer, correct_answer } = req.body;

    if (!question || !user_answer || !correct_answer) {
      return res.status(400).json({
        error: "Question, réponse utilisateur et réponse correcte requises",
      });
    }

    const prompt = `Évalue cette réponse d'étudiant:

Question: "${question}"
Réponse correcte: "${correct_answer}"
Réponse de l'étudiant: "${user_answer}"

Donne un score de 0 à 5 basé sur:
- Exactitude du contenu (0-2 points)
- Complétude de la réponse (0-2 points)  
- Compréhension démontrée (0-1 point)

Réponds uniquement avec un nombre entier entre 0 et 5.`;

    const messages = [
      {
        role: "system",
        content:
          "Tu es un correcteur pédagogique expert. Tu évalues les réponses d'étudiants de manière juste et constructive. Réponds uniquement avec un nombre.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    const response = await callAIAPI(messages, 50);

    // Extraire le score numérique
    const score = parseInt(response.trim());

    if (isNaN(score) || score < 0 || score > 5) {
      throw new Error("Score invalide reçu de l'API");
    }

    res.json({ score });
  } catch (error) {
    console.error("Erreur lors de l'évaluation:", error);

    // Mode fallback pour l'évaluation
    console.warn("🔄 Activation du mode fallback pour l'évaluation...");
    try {
      const { user_answer, correct_answer } = req.body;
      const fallbackScore = evaluateFallback(user_answer, correct_answer);
      res.json({ score: fallbackScore });
    } catch (fallbackError) {
      res
        .status(500)
        .json({ error: "Erreur lors de l'évaluation de la réponse" });
    }
  }
});

// Route pour récupérer les questions d'une note
app.get("/questions/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const questionsFile = path.join(QUESTIONS_DIR, `${title}.json`);

    if (await fs.pathExists(questionsFile)) {
      const questions = await fs.readJson(questionsFile);
      res.json(questions);
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des questions:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Fonction de génération de questions de secours
function generateFallbackQuestions(title, content) {
  // Extraire des informations spécifiques du contenu
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const words = content.split(/\s+/).filter((word) => word.length > 4);
  const uniqueWords = [...new Set(words)];
  const keyTerms = uniqueWords.slice(0, 8);

  // Générer un timestamp pour la variabilité
  const timestamp = Date.now();
  const randomSeed = timestamp % 1000;

  // Questions variées basées sur le contenu
  const questionPool = [
    {
      text: `Quels sont les concepts principaux mentionnés dans "${title}"?`,
      reponse: `D'après le contenu, les concepts principaux incluent: ${keyTerms
        .slice(0, 5)
        .join(", ")}. ${
        sentences[0] || "Ces éléments constituent la base du sujet."
      }`,
    },
    {
      text: `Expliquez en détail ce qui est décrit dans "${title}".`,
      reponse: `${
        sentences.slice(0, 2).join(". ") || content.substring(0, 300)
      }. Ceci forme l'essentiel de la compréhension du sujet.`,
    },
    {
      text: `Quelles informations importantes peut-on retenir de "${title}"?`,
      reponse: `Les informations importantes incluent: ${
        sentences.slice(1, 3).join(". ") ||
        "les concepts abordés dans le contenu"
      }. Ces éléments sont cruciaux pour la maîtrise du sujet.`,
    },
    {
      text: `Comment définiriez-vous les termes clés de "${title}"?`,
      reponse: `Les termes clés (${keyTerms
        .slice(0, 3)
        .join(", ")}) sont définis dans le contexte suivant: ${
        sentences[2] || content.substring(100, 400)
      }.`,
    },
    {
      text: `Quels sont les aspects pratiques ou applications de ce qui est présenté dans "${title}"?`,
      reponse: `Les aspects pratiques incluent l'application des concepts décrits. ${
        sentences.slice(-2).join(". ") ||
        "La mise en pratique permet de consolider la compréhension."
      }`,
    },
    {
      text: `Pourquoi est-il important de comprendre "${title}"?`,
      reponse: `La compréhension de ce sujet est importante car ${
        sentences[1] || "elle permet d'acquérir des connaissances fondamentales"
      }. ${keyTerms
        .slice(3, 6)
        .join(", ")} sont des éléments essentiels à maîtriser.`,
    },
    {
      text: `Quels liens peut-on établir entre les différents éléments de "${title}"?`,
      reponse: `Les liens entre les éléments montrent que ${sentences
        .slice(0, 2)
        .join(
          " et que "
        )}. Ces connexions permettent une compréhension globale.`,
    },
    {
      text: `Comment pourriez-vous expliquer "${title}" à quelqu'un qui n'y connaît rien?`,
      reponse: `Pour expliquer simplement: ${content.substring(
        0,
        250
      )}. En résumé, ${keyTerms
        .slice(0, 4)
        .join(", ")} sont les bases à comprendre.`,
    },
  ];

  // Sélectionner 5 questions de manière pseudo-aléatoire basée sur le timestamp
  const selectedQuestions = [];
  const usedIndices = new Set();

  for (let i = 0; i < 5; i++) {
    let index = (randomSeed + i * 3) % questionPool.length;
    while (usedIndices.has(index)) {
      index = (index + 1) % questionPool.length;
    }
    usedIndices.add(index);
    selectedQuestions.push(questionPool[index]);
  }

  return selectedQuestions;
}

// Fonction d'évaluation de secours
function evaluateFallback(userAnswer, correctAnswer) {
  if (!userAnswer || userAnswer.trim().length === 0) {
    return 0;
  }

  const userWords = userAnswer.toLowerCase().split(/\s+/);
  const correctWords = correctAnswer.toLowerCase().split(/\s+/);

  // Calculer la correspondance des mots
  let matches = 0;
  userWords.forEach((word) => {
    if (
      correctWords.some(
        (correctWord) =>
          correctWord.includes(word) || word.includes(correctWord)
      )
    ) {
      matches++;
    }
  });

  // Calculer le score basé sur la longueur et les correspondances
  const lengthScore = Math.min(userAnswer.length / 50, 2); // Max 2 points pour la longueur
  const matchScore = Math.min((matches / correctWords.length) * 3, 3); // Max 3 points pour les correspondances

  return Math.round(Math.min(lengthScore + matchScore, 5));
}

// ============================================
// ENDPOINTS POUR L'HISTORIQUE DES QUIZ
// ============================================

// Sauvegarder un quiz complet
app.post("/save-quiz", async (req, res) => {
  try {
    const {
      noteTitle,
      questions,
      userAnswers,
      results,
      totalScore,
      averageScore,
    } = req.body;

    if (!noteTitle || !questions || !userAnswers || !results) {
      return res.status(400).json({ error: "Données du quiz incomplètes" });
    }

    // Créer l'objet quiz
    const quiz = {
      id: `${noteTitle}-${Date.now()}`, // ID unique
      noteTitle,
      date: new Date().toISOString(),
      timestamp: Date.now(),
      questions,
      userAnswers,
      results,
      totalScore,
      averageScore,
      questionsCount: questions.length,
      correctAnswers: results.filter((r) => r.isCorrect).length,
    };

    // Sauvegarder dans un fichier JSON
    const filename = `quiz-${quiz.id}.json`;
    const filepath = path.join(QUIZ_HISTORY_DIR, filename);

    await fs.writeJson(filepath, quiz, { spaces: 2 });

    res.json({
      success: true,
      message: "Quiz sauvegardé avec succès",
      quizId: quiz.id,
    });
  } catch (error) {
    console.error("Erreur lors de la sauvegarde du quiz:", error);
    res.status(500).json({ error: "Erreur serveur lors de la sauvegarde" });
  }
});

// Récupérer l'historique des quiz
app.get("/quiz-history", async (req, res) => {
  try {
    const files = await fs.readdir(QUIZ_HISTORY_DIR);
    const quizFiles = files.filter(
      (file) => file.startsWith("quiz-") && file.endsWith(".json")
    );

    const quizHistory = [];

    for (const file of quizFiles) {
      try {
        const filepath = path.join(QUIZ_HISTORY_DIR, file);
        const quiz = await fs.readJson(filepath);

        // Ajouter seulement les infos essentielles pour la liste
        quizHistory.push({
          id: quiz.id,
          noteTitle: quiz.noteTitle,
          date: quiz.date,
          timestamp: quiz.timestamp,
          totalScore: quiz.totalScore,
          averageScore: quiz.averageScore,
          questionsCount: quiz.questionsCount,
          correctAnswers: quiz.correctAnswers,
        });
      } catch (fileError) {
        console.warn(`Erreur lecture fichier ${file}:`, fileError);
      }
    }

    // Trier par date (plus récent en premier)
    quizHistory.sort((a, b) => b.timestamp - a.timestamp);

    res.json(quizHistory);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Récupérer un quiz spécifique avec tous les détails
app.get("/quiz-history/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    const files = await fs.readdir(QUIZ_HISTORY_DIR);
    const targetFile = files.find((file) => file.includes(quizId));

    if (!targetFile) {
      return res.status(404).json({ error: "Quiz non trouvé" });
    }

    const filepath = path.join(QUIZ_HISTORY_DIR, targetFile);
    const quiz = await fs.readJson(filepath);

    res.json(quiz);
  } catch (error) {
    console.error("Erreur lors de la récupération du quiz:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Supprimer un quiz de l'historique
app.delete("/quiz-history/:quizId", async (req, res) => {
  try {
    const { quizId } = req.params;

    const files = await fs.readdir(QUIZ_HISTORY_DIR);
    const targetFile = files.find((file) => file.includes(quizId));

    if (!targetFile) {
      return res.status(404).json({ error: "Quiz non trouvé" });
    }

    const filepath = path.join(QUIZ_HISTORY_DIR, targetFile);
    await fs.remove(filepath);

    res.json({ success: true, message: "Quiz supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du quiz:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Fonction pour créer des notes de démonstration
async function createDemoNotes() {
  try {
    // Vérifier si des notes existent déjà
    const files = await fs.readdir(NOTES_DIR);
    const existingNotes = files.filter((file) => file.endsWith(".txt"));

    if (existingNotes.length > 0) {
      console.log(`📝 ${existingNotes.length} notes existantes trouvées`);
      return;
    }

    console.log("🎯 Création des notes de démonstration...");

    // Notes de démonstration
    const demoNotes = [
      {
        title: "Introduction à JavaScript",
        content: `JavaScript est un langage de programmation polyvalent et dynamique, principalement utilisé pour le développement web. Créé en 1995 par Brendan Eich, JavaScript est devenu l'un des langages les plus populaires au monde.

Caractéristiques principales :
- Langage interprété (pas de compilation nécessaire)
- Typage dynamique (les variables peuvent changer de type)
- Programmation orientée objet et fonctionnelle
- Exécution côté client (navigateur) et côté serveur (Node.js)

Syntaxe de base :
- Variables : let, const, var
- Fonctions : function, arrow functions
- Conditions : if/else, switch
- Boucles : for, while, forEach

JavaScript permet de créer des applications web interactives, des serveurs web, des applications mobiles, et même des applications desktop.

Exemple simple :
let message = "Bonjour le monde!";
console.log(message);

Les frameworks populaires incluent React, Vue.js, Angular pour le frontend, et Express.js pour le backend.`,
      },
      {
        title: "Les Bases de la Photographie",
        content: `La photographie est l'art de capturer la lumière pour créer des images. Comprendre les bases est essentiel pour améliorer vos compétences.

Triangle d'exposition :
1. Ouverture (f/stop) : Contrôle la profondeur de champ
   - f/1.4 à f/2.8 : Grande ouverture, flou d'arrière-plan
   - f/8 à f/11 : Ouverture moyenne, netteté équilibrée
   - f/16 à f/22 : Petite ouverture, grande profondeur de champ

2. Vitesse d'obturation : Contrôle le mouvement
   - 1/500s ou plus : Figer le mouvement
   - 1/60s à 1/250s : Usage général
   - 1/30s ou moins : Flou de mouvement créatif

3. ISO : Sensibilité à la lumière
   - ISO 100-400 : Lumière abondante
   - ISO 800-1600 : Lumière modérée
   - ISO 3200+ : Faible luminosité

Règles de composition :
- Règle des tiers : Diviser l'image en 9 sections
- Lignes directrices : Guider l'œil vers le sujet
- Cadrage : Utiliser l'environnement pour encadrer le sujet
- Symétrie et motifs : Créer un équilibre visuel

Types de photographie :
- Portrait : Mettre en valeur les personnes
- Paysage : Capturer la beauté naturelle
- Street : Documenter la vie urbaine
- Macro : Photographier les détails

L'éclairage est crucial : la golden hour (lever/coucher du soleil) offre une lumière douce et chaude, idéale pour la plupart des sujets.`,
      },
      {
        title: "Principes de Base du Marketing Digital",
        content: `Le marketing digital englobe toutes les stratégies de promotion utilisant les canaux numériques pour atteindre les consommateurs.

Composants principaux :

1. SEO (Search Engine Optimization) :
   - Optimisation pour les moteurs de recherche
   - Recherche de mots-clés pertinents
   - Création de contenu de qualité
   - Optimisation technique du site

2. SEA (Search Engine Advertising) :
   - Publicité payante sur Google Ads
   - Ciblage par mots-clés
   - Contrôle du budget et des enchères
   - Mesure du ROI

3. Social Media Marketing :
   - Présence sur les réseaux sociaux
   - Création de contenu engageant
   - Interaction avec la communauté
   - Publicité sociale ciblée

4. Email Marketing :
   - Newsletters personnalisées
   - Séquences d'automatisation
   - Segmentation de la base de données
   - A/B testing des campagnes

5. Content Marketing :
   - Blogs et articles informatifs
   - Vidéos et podcasts
   - Infographies et visuels
   - Webinaires et formations

Métriques importantes :
- Taux de conversion : Pourcentage de visiteurs qui effectuent une action
- Coût par acquisition (CPA) : Coût pour acquérir un client
- Retour sur investissement (ROI) : Bénéfice généré par rapport à l'investissement
- Taux d'engagement : Interaction avec le contenu

Outils essentiels :
- Google Analytics : Analyse du trafic web
- Google Search Console : Monitoring SEO
- Hootsuite/Buffer : Gestion des réseaux sociaux
- Mailchimp : Email marketing
- Canva : Création de visuels

Le marketing digital permet un ciblage précis, une mesure en temps réel et une optimisation continue des campagnes.`,
      },
      {
        title: "Histoire de l'Art - Renaissance",
        content: `La Renaissance (14e-16e siècles) marque une révolution artistique et culturelle majeure, née en Italie et s'étendant à travers l'Europe.

Contexte historique :
- Redécouverte des textes antiques grecs et romains
- Développement de l'humanisme
- Prospérité économique des cités-États italiennes
- Invention de l'imprimerie (diffusion des idées)

Caractéristiques artistiques :

1. Techniques innovantes :
   - Perspective linéaire : Création de profondeur
   - Sfumato : Transitions douces entre couleurs
   - Chiaroscuro : Jeu d'ombres et de lumières
   - Anatomie précise : Étude du corps humain

2. Thèmes privilégiés :
   - Mythologie antique
   - Portraits individualisés
   - Scènes religieuses humanisées
   - Allégories complexes

Grands maîtres :

Leonardo da Vinci (1452-1519) :
- La Joconde : Portrait énigmatique
- La Cène : Composition dramatique
- Homme de Vitruve : Proportions parfaites

Michel-Ange (1475-1564) :
- David : Sculpture monumentale
- Chapelle Sixtine : Fresques magistrales
- Pietà : Émotion dans le marbre

Raphaël (1483-1520) :
- École d'Athènes : Philosophie et art
- Madones : Grâce et beauté
- Chambres du Vatican : Décoration complète

Impact culturel :
- Révolution dans la représentation artistique
- Développement du mécénat
- Émergence de l'artiste-intellectuel
- Influence sur l'art européen pendant des siècles

La Renaissance établit les fondements de l'art occidental moderne, alliant technique, beauté et réflexion philosophique.`,
      },
      {
        title: "Nutrition et Alimentation Équilibrée",
        content: `Une alimentation équilibrée est essentielle pour maintenir une bonne santé physique et mentale. Elle fournit à l'organisme tous les nutriments nécessaires à son bon fonctionnement.

Macronutriments essentiels :

1. Glucides (45-65% des calories) :
   - Source principale d'énergie
   - Glucides complexes : Céréales complètes, légumineuses
   - Glucides simples : Fruits, légumes (à privilégier)
   - Éviter : Sucres raffinés, sodas

2. Protéines (10-35% des calories) :
   - Construction et réparation des tissus
   - Sources animales : Viande, poisson, œufs, produits laitiers
   - Sources végétales : Légumineuses, noix, graines
   - Besoins : 0,8-1g par kg de poids corporel

3. Lipides (20-35% des calories) :
   - Acides gras essentiels
   - Bonnes graisses : Huile d'olive, avocat, noix, poissons gras
   - À limiter : Graisses saturées, trans

Micronutriments importants :
- Vitamines : A, C, D, E, K, complexe B
- Minéraux : Calcium, fer, magnésium, zinc
- Antioxydants : Polyphénols, caroténoïdes

Règles d'or :
1. Variété : Manger de tout en quantités modérées
2. Équilibre : Répartir les apports sur la journée
3. Modération : Éviter les excès
4. Hydratation : 1,5-2L d'eau par jour
5. Régularité : Horaires de repas fixes

Conseils pratiques :
- 5 fruits et légumes par jour
- Céréales complètes privilégiées
- Poisson 2-3 fois par semaine
- Limiter le sel et le sucre ajouté
- Cuisson douce préférée

Planification des repas :
- Petit-déjeuner : 25% des apports
- Déjeuner : 35% des apports
- Collation : 10% des apports
- Dîner : 30% des apports

L'alimentation équilibrée, associée à l'activité physique, prévient de nombreuses maladies chroniques et améliore la qualité de vie.`,
      },
    ];

    // Créer les fichiers de notes
    for (const note of demoNotes) {
      const filename = `${note.title}.txt`;
      const filepath = path.join(NOTES_DIR, filename);
      await fs.writeFile(filepath, note.content, "utf8");
      console.log(`✅ Note créée: ${note.title}`);
    }

    console.log(`🎉 ${demoNotes.length} notes de démonstration créées avec succès!`);
  } catch (error) {
    console.error("Erreur lors de la création des notes de démonstration:", error);
  }
}

// Servir les fichiers statiques React en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '..', 'build')));
  
  // Toutes les autres routes retournent le fichier React
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
  });
}

// Démarrer le serveur
app.listen(PORT, async () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}`);

  // Test de la clé API IA
  await testAIAPI();

  // Création des notes de démonstration
  await createDemoNotes();
});
