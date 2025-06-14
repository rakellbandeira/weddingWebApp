// api/seed.js
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

// Models
let SongRequest, Advice;
try {
  SongRequest = mongoose.model('SongRequest');
  Advice = mongoose.model('Advice');
} catch {
  SongRequest = mongoose.model('SongRequest', songRequestSchema);
  Advice = mongoose.model('Advice', adviceSchema);
}

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Simple password protection
  const { password } = req.body;
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    await connectToDatabase();
    
    // Check if data already exists
    const songCount = await SongRequest.countDocuments();
    const adviceCount = await Advice.countDocuments();
    
    if (songCount > 0 || adviceCount > 0) {
      return res.status(200).json({ 
        message: 'Database already has data', 
        songCount, 
        adviceCount 
      });
    }
    
    // Add sample data
    const sampleSong = new SongRequest({
      songTitle: "All of Me - John Legend",
      youtubeLink: "https://www.youtube.com/watch?v=450p7goxZqg",
      requestedBy: "Anônimo"
    });
    
    const sampleAdvice = new Advice({
      guestName: "Anônimo",
      yearsMarried: 25,
      advice: "O segredo de um casamento feliz é nunca dormir brigados. Conversem sempre, riam juntos e lembrem-se de que vocês são uma equipe enfrentando a vida lado a lado.",
      isAnonymous: true
    });
    
    await sampleSong.save();
    await sampleAdvice.save();
    
    res.status(200).json({ 
      success: true, 
      message: 'Database seeded successfully!',
      added: {
        song: sampleSong.songTitle,
        advice: 'One advice card'
      }
    });
    
  } catch (error) {
    console.error('Seeding error:', error);
    res.status(500).json({ error: 'Failed to seed database' });
  }
};