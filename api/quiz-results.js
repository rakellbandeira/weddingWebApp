const mongoose = require('mongoose');
const { connectToDatabase } = require('./_db');

// Define schema
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

// Initialize model
let QuizResult;
try {
  QuizResult = mongoose.model('QuizResult');
} catch {
  QuizResult = mongoose.model('QuizResult', quizResultSchema);
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to database
    await connectToDatabase();

    if (req.method === 'POST') {
      const quizResult = new QuizResult(req.body);
      await quizResult.save();
      res.status(201).json({ success: true, message: 'Quiz result submitted successfully' });
    } else if (req.method === 'GET') {
      const results = await QuizResult.find().sort({ timestamp: -1 });
      res.status(200).json(results);
    } else {
      res.status(405).json({ success: false, message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error',
      error: error.message 
    });
  }
};