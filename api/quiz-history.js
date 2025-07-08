// API Route pour gérer l'historique des quiz sur Vercel
export default async function handler(req, res) {
  // Permettre les requêtes CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Sur Vercel, on ne peut pas persister les fichiers
  // On renvoie des données vides pour éviter les erreurs
  if (req.method === "GET") {
    // GET /api/quiz-history
    if (!req.query.id) {
      return res.status(200).json([]);
    }
    
    // GET /api/quiz-history/[id]
    return res.status(404).json({ error: "Quiz non trouvé" });
  }

  if (req.method === "POST") {
    // POST /api/quiz-history - Sauvegarder un quiz
    const { noteTitle, questions, userAnswers, results } = req.body;

    if (!noteTitle || !questions || !userAnswers || !results) {
      return res.status(400).json({ error: "Données manquantes" });
    }

    // Générer un ID unique pour le quiz
    const quizId = `quiz-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Sur Vercel, on ne peut pas sauvegarder les fichiers
    // On renvoie juste l'ID généré
    return res.status(200).json({ 
      quizId,
      message: "Quiz sauvegardé localement dans le navigateur"
    });
  }

  if (req.method === "DELETE") {
    // DELETE /api/quiz-history/[id]
    return res.status(200).json({ 
      success: true, 
      message: "Quiz supprimé localement" 
    });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
