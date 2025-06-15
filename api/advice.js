const mongoose = require('mongoose');
const { connectToDatabase } = require('./_db');

// Define schema
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

// Get or create model
function getAdviceModel() {
  try {
    return mongoose.model('Advice');
  } catch {
    return mongoose.model('Advice', adviceSchema);
  }
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
    const Advice = getAdviceModel();

    if (req.method === 'POST') {
      const advice = new Advice(req.body);
      await advice.save();
      res.status(201).json({ success: true, message: 'Advice submitted successfully' });
    } else if (req.method === 'GET') {
      const adviceList = await Advice.find().sort({ timestamp: -1 });
      res.status(200).json(adviceList);
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