// API Route pour sauvegarder les quiz sur Vercel
export default async function handler(req, res) {
  // Permettre les requêtes CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { noteTitle, questions, userAnswers, results, totalScore, averageScore } = req.body;

    if (!noteTitle || !questions || !userAnswers || !results) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    // Générer un ID unique pour le quiz
    const quizId = `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculer les statistiques
    const correctAnswers = results.filter(r => r.isCorrect).length;
    const questionsCount = questions.length;
    
    const quizData = {
      id: quizId,
      noteTitle,
      date: new Date().toLocaleDateString('fr-FR'),
      timestamp: Date.now(),
      totalScore: totalScore || results.reduce((sum, r) => sum + r.score, 0),
      averageScore: averageScore || (results.reduce((sum, r) => sum + r.score, 0) / questionsCount),
      questionsCount,
      correctAnswers,
      questions,
      userAnswers,
      results
    };

    // Sur Vercel, on ne peut pas sauvegarder les fichiers
    // On renvoie les données pour que le frontend les sauvegarde localement
    return res.status(200).json({ 
      quizId,
      quizData,
      message: "Quiz sauvegardé localement dans le navigateur"
    });

  } catch (error) {
    console.error("Erreur sauvegarde quiz:", error);
    return res.status(500).json({ 
      error: "Erreur lors de la sauvegarde du quiz",
      details: error.message 
    });
  }
}
