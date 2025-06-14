// Load environment variables from .env file
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Apply other middleware
app.use(bodyParser.json());
app.use(express.static('public'));

// Add OPTIONS handling for preflight requests
app.options('*', cors()); // Enable preflight for all routes


// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wedding';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Define schemas and models
const guestSchema = new mongoose.Schema({
  name: {
    type: String,
    default: "Anônimo",
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  attending: {
    type: Boolean,
    required: true
  },
  dietaryRestrictions: {
    type: String,
    trim: true,
    default: ''
  },
  plusOne: {
    type: Boolean,
    default: false
  },
  plusOneName: {
    type: String,
    trim: true,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

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

const quizResultSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  score: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Create models
const Guest = mongoose.model('Guest', guestSchema);
const SongRequest = mongoose.model('SongRequest', songRequestSchema);
const Advice = mongoose.model('Advice', adviceSchema);
const QuizResult = mongoose.model('QuizResult', quizResultSchema);


// Admin routes 
app.get('/admin', (req, res) => {
    // Simple authentication (use a more secure method in production)
    const password = req.query.password;
    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).send('Unauthorized');
    }
    
    res.sendFile(path.resolve(__dirname, 'public', 'admin.html'));
  });

// API routes for RSVP
app.post('/api/rsvp', async (req, res) => {
  try {
    const guest = new Guest(req.body);
    await guest.save();
    res.status(201).json({ success: true, message: 'RSVP submitted successfully' });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting RSVP',
      error: error.message 
    });
  }
});

app.get('/api/rsvp', async (req, res) => {
  try {
    const guests = await Guest.find().sort({ timestamp: -1 });
    res.json(guests);
  } catch (error) {
    console.error('Error fetching RSVPs:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching RSVPs',
      error: error.message 
    });
  }
});

// API routes for Song Requests
app.post('/api/song-requests', async (req, res) => {
  try {
    const songRequest = new SongRequest(req.body);
    await songRequest.save();
    res.status(201).json({ success: true, message: 'Song request submitted successfully' });
  } catch (error) {
    console.error('Song request error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting song request',
      error: error.message 
    });
  }
});

app.get('/api/song-requests', async (req, res) => {
  try {
    const songRequests = await SongRequest.find().sort({ timestamp: -1 });
    res.json(songRequests);
  } catch (error) {
    console.error('Error fetching song requests:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching song requests',
      error: error.message 
    });
  }
});

// API routes for Marriage Advice
app.post('/api/advice', async (req, res) => {
  try {
    const advice = new Advice(req.body);
    await advice.save();
    res.status(201).json({ success: true, message: 'Advice submitted successfully' });
  } catch (error) {
    console.error('Advice submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting advice',
      error: error.message 
    });
  }
});

app.get('/api/advice', async (req, res) => {
  try {
    const advice = await Advice.find().sort({ timestamp: -1 });
    res.json(advice);
  } catch (error) {
    console.error('Error fetching advice:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching advice',
      error: error.message 
    });
  }
});

// API routes for Quiz Results
app.post('/api/quiz-results', async (req, res) => {
  try {
    const quizResult = new QuizResult(req.body);
    await quizResult.save();
    res.status(201).json({ success: true, message: 'Quiz result submitted successfully' });
  } catch (error) {
    console.error('Quiz result submission error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error submitting quiz result',
      error: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong on the server',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Serve static files for any other route (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});