module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Test 1: Basic function works
    console.log('Debug API called');
    
    // Test 2: Environment variable exists
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      return res.status(500).json({ 
        error: 'MONGODB_URI not found',
        envVars: Object.keys(process.env).filter(key => key.includes('MONGO'))
      });
    }

    // Test 3: Can import mongoose
    const mongoose = require('mongoose');
    console.log('Mongoose imported successfully');

    // Test 4: Try connecting
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('MongoDB connected successfully');
    }

    res.status(200).json({ 
      success: true,
      message: 'All tests passed!',
      mongoConnectionState: mongoose.connection.readyState,
      mongoUriExists: !!mongoUri,
      mongoUriPrefix: mongoUri ? mongoUri.substring(0, 20) + '...' : 'none'
    });

  } catch (error) {
    console.error('Debug API error:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack,
      name: error.name
    });
  }
};