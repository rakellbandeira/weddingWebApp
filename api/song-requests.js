import mongoose from 'mongoose';
import { connectToDatabase } from './_db.js';

// Define schema
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

// Get or create model
function getSongRequestModel() {
  try {
    return mongoose.model('SongRequest');
  } catch {
    return mongoose.model('SongRequest', songRequestSchema);
  }
}

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Connect to database
    await connectToDatabase();
    const SongRequest = getSongRequestModel();

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
}