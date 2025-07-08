const axios = require("axios");

// Configuration API IA
const AI_PROVIDER = process.env.AI_PROVIDER || "groq";
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Helper function pour appeler l'API IA
async function callAIAPI(messages, maxTokens = 1000) {
  try {
    let response;

    if (AI_PROVIDER === "groq" && GROQ_API_KEY) {
      response = await axios.post(
        GROQ_API_URL,
        {
          model: "llama3-8b-8192",
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
    throw error;
  }
}

// Fonction d'évaluation de secours
function evaluateFallback(userAnswer, correctAnswer) {
  const userWords = userAnswer.toLowerCase().split(/\s+/);
  const correctWords = correctAnswer.toLowerCase().split(/\s+/);

  let commonWords = 0;
  for (const word of userWords) {
    if (correctWords.includes(word) && word.length > 3) {
      commonWords++;
    }
  }

  const similarity =
    commonWords / Math.max(correctWords.length, userWords.length);

  if (similarity > 0.7) return 5;
  if (similarity > 0.5) return 4;
  if (similarity > 0.3) return 3;
  if (similarity > 0.1) return 2;
  return 1;
}

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

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

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

RÉPONDS UNIQUEMENT AVEC UN NOMBRE ENTRE 0 ET 5.`;

    const messages = [
      {
        role: "system",
        content:
          "Tu es un correcteur expert. Réponds uniquement par un nombre de 0 à 5.",
      },
      {
        role: "user",
        content: prompt,
      },
    ];

    let score;

    try {
      const response = await callAIAPI(messages, 50);
      const scoreMatch = response.match(/[0-5]/);
      score = scoreMatch ? parseInt(scoreMatch[0]) : 0;

      if (score < 0 || score > 5) {
        score = Math.max(0, Math.min(5, score));
      }
    } catch (aiError) {
      console.warn("🔄 Activation du mode fallback pour l'évaluation...");
      score = evaluateFallback(user_answer, correct_answer);
    }

    res.json({ score });
  } catch (error) {
    console.error("Erreur lors de l'évaluation:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de l'évaluation de la réponse" });
  }
};
