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

// Fonction de génération de questions de secours
function generateFallbackQuestions(title, content) {
  const sentences = content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
  const words = content.split(/\s+/).filter((word) => word.length > 4);
  const uniqueWords = [...new Set(words)];
  const keyTerms = uniqueWords.slice(0, 8);

  const questionPool = [
    {
      text: `Quels sont les concepts principaux mentionnés dans "${title}"?`,
      reponse: `D'après le contenu, les concepts principaux incluent: ${keyTerms
        .slice(0, 5)
        .join(", ")}. Ces éléments constituent la base du sujet.`,
    },
    {
      text: `Expliquez l'importance du sujet "${title}" dans son domaine.`,
      reponse: `Le sujet "${title}" est important car il traite de ${
        keyTerms[0] || "concepts fondamentaux"
      }. ${
        sentences[0] ||
        "Il constitue une base essentielle pour la compréhension du domaine."
      }`,
    },
    {
      text: `Quelles sont les applications pratiques des notions présentées dans "${title}"?`,
      reponse: `Les applications incluent l'utilisation de ${keyTerms
        .slice(1, 4)
        .join(
          ", "
        )}. Ces concepts peuvent être appliqués dans des contextes variés.`,
    },
    {
      text: `Comment les éléments de "${title}" s'articulent-ils entre eux?`,
      reponse: `Les éléments s'articulent autour de ${
        keyTerms[0] || "principes centraux"
      }, créant une structure cohérente pour ${
        keyTerms[1] || "l'apprentissage"
      }.`,
    },
    {
      text: `Quels défis ou problèmes "${title}" permet-il de résoudre?`,
      reponse: `Ce sujet permet de résoudre des problèmes liés à ${keyTerms
        .slice(2, 5)
        .join(", ")}. Il offre des solutions pratiques et théoriques.`,
    },
  ];

  return questionPool;
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
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: "Titre et contenu requis" });
    }

    const sessionId = Date.now();
    const currentTime = new Date().toLocaleString("fr-FR");

    const prompt = `Générez exactement 5 questions pédagogiques INNOVANTES sur ce contenu:

TITRE: "${title}"
CONTENU: "${content}"

INSTRUCTIONS:
- Questions spécifiques au contenu fourni
- Aucune question générique
- Réponses détaillées et précises  
- Variez les formulations et approches
- Date/heure: ${currentTime}

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

    let questions;

    try {
      const response = await callAIAPI(messages, 1500);

      try {
        questions = JSON.parse(response);
      } catch (parseError) {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Format de réponse invalide");
        }
      }
    } catch (aiError) {
      console.warn("🔄 Activation du mode fallback...");
      questions = generateFallbackQuestions(title, content);
    }

    res.json(questions);
  } catch (error) {
    console.error("Erreur lors de la génération des questions:", error);
    res
      .status(500)
      .json({ error: "Erreur lors de la génération des questions" });
  }
};
