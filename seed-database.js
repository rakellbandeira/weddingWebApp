// seed-database.js
require('dotenv').config();
const mongoose = require('mongoose');

// Define schemas (same as in your server.js)
const songRequestSchema = new mongoose.Schema({
  songTitle: {
    type: String,
    required: true,
    trim: true
  },
  youtubeLink: {
    type: String,
    trim: true,
    default: ''
  },
  requestedBy: {
    type: String,
    default: 'Anônimo',
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const adviceSchema = new mongoose.Schema({
  guestName: {
    type: String,
    required: true,
    trim: true
  },
  yearsMarried: {
    type: Number,
    default: 0,
    min: 0
  },
  advice: {
    type: String,
    required: true,
    trim: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create models
const SongRequest = mongoose.model('SongRequest', songRequestSchema);
const Advice = mongoose.model('Advice', adviceSchema);

// Sample data
const sampleSongRequest = {
  songTitle: "All of Me - John Legend",
  youtubeLink: "https://www.youtube.com/watch?v=450p7goxZqg",
  requestedBy: "Anônimo"
};

const sampleAdvice = {
  guestName: "Anônimo",
  yearsMarried: 25,
  advice: "O segredo de um casamento feliz é nunca dormir brigados. Conversem sempre, riam juntos e lembrem-se de que vocês são uma equipe enfrentando a vida lado a lado.",
  isAnonymous: true
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding';
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB');
    
    // Check if data already exists to avoid duplicates
    const existingSong = await SongRequest.findOne({ songTitle: sampleSongRequest.songTitle });
    const existingAdvice = await Advice.findOne({ advice: sampleAdvice.advice });
    
    if (!existingSong) {
      const songRequest = new SongRequest(sampleSongRequest);
      await songRequest.save();
      console.log('✅ Sample song request added:', sampleSongRequest.songTitle);
    } else {
      console.log('ℹ️ Sample song request already exists, skipping...');
    }
    
    if (!existingAdvice) {
      const advice = new Advice(sampleAdvice);
      await advice.save();
      console.log('✅ Sample advice added');
    } else {
      console.log('ℹ️ Sample advice already exists, skipping...');
    }
    
    console.log('🎉 Database seeding completed!');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close connection
    await mongoose.connection.close();
    console.log('📤 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
seedDatabase();