const mongoose = require('mongoose');
const { connectToDatabase } = require('./_db');

// Define schemas
const songRequestSchema = new mongoose.Schema({
  songTitle: { type: String, required: true, trim: true },
  youtubeLink: { type: String, trim: true, default: '' },
  requestedBy: { type: String, default: 'Anônimo', trim: true },
  timestamp: { type: Date, default: Date.now }
});

const adviceSchema = new mongoose.Schema({
  guestName: { type: String, required: true, trim: true },
  yearsMarried: { type: Number, default: 0, min: 0 },
  advice: { type: String, required: true, trim: true },
  isAnonymous: { type: Boolean, default: false },
  timestamp: { type: Date, default: Date.now }
});

let SongRequest, Advice;

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET to seed database.' });
  }

  try {
    await connectToDatabase();

    // Initialize models
    try {
      SongRequest = mongoose.model('SongRequest');
      Advice = mongoose.model('Advice');
    } catch {
      SongRequest = mongoose.model('SongRequest', songRequestSchema);
      Advice = mongoose.model('Advice', adviceSchema);
    }

    // Check if data already exists
    const songCount = await SongRequest.countDocuments();
    const adviceCount = await Advice.countDocuments();

    if (songCount > 0 && adviceCount > 0) {
      return res.status(200).json({
        message: 'Database already has data',
        songCount,
        adviceCount
      });
    }

    // Add sample data if none exists
    if (songCount === 0) {
      const sampleSong = new SongRequest({
        songTitle: "All of Me - John Legend",
        youtubeLink: "https://www.youtube.com/watch?v=450p7goxZqg",
        requestedBy: "Anônimo"
      });
      await sampleSong.save();
    }

    if (adviceCount === 0) {
      const sampleAdvice = new Advice({
        guestName: "Anônimo",
        yearsMarried: 25,
        advice: "O segredo de um casamento feliz é nunca dormir brigados. Conversem sempre, riam juntos e lembrem-se de que vocês são uma equipe enfrentando a vida lado a lado.",
        isAnonymous: true
      });
      await sampleAdvice.save();
    }

    res.status(200).json({
      success: true,
      message: 'Database seeded successfully!',
      songsAdded: songCount === 0 ? 1 : 0,
      adviceAdded: adviceCount === 0 ? 1 : 0
    });

  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: 'Failed to seed database', details: error.message });
  }
};