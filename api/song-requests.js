const mongoose = require('mongoose');
const { connectToDatabase } = require('./_db');

// Define schema
const songRequestSchema = new mongoose.Schema({
  songTitle: {
    type: String,
    required: true,
    trim: true
  },
  artist: {
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
    required: true,
    trim: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Initialize model
let SongRequest;
try {
  SongRequest = mongoose.model('SongRequest');
} catch {
  SongRequest = mongoose.model('SongRequest', songRequestSchema);
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
      const songRequest = new SongRequest(req.body);
      await songRequest.save();
      res.status(201).json({ success: true, message: 'Song request submitted successfully' });
    } else if (req.method === 'GET') {
      const songRequests = await SongRequest.find().sort({ timestamp: -1 });
      res.status(200).json(songRequests);
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