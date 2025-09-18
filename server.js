const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const path = require('path');
const app = express();
const PORT = 3000;

// MongoDB Connection
const MONGODB_URI = "mongodb+srv://navscan-app-user:29dJdiwFfFTvLpcK@navscancluster1.k8m6zjh.mongodb.net/?retryWrites=true&w=majority&appName=NavscanCluster1";
const DB_NAME = "navscan";
let db;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db(DB_NAME);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'SCORPION NAVY Backend Online',
    port: PORT,
    timestamp: new Date().toISOString(),
    version: 'v2.0.0',
    database: 'MongoDB'
  });
});

// Get all scans
app.get('/api/scans', async (req, res) => {
  try {
    const scans = await db.collection('scans').find().toArray();
    res.json(scans);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch scans' });
  }
});

// Get all discounts  
app.get('/api/discounts', async (req, res) => {
  try {
    const discounts = await db.collection('discounts').find().toArray();
    res.json(discounts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch discounts' });
  }
});

// Get all inventory
app.get('/api/inventory', async (req, res) => {
  try {
    const inventory = await db.collection('inventory').find().toArray();
    res.json(inventory);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Log a new scan
app.post('/api/scan', async (req, res) => {
  try {
    const newScan = req.body;
    newScan.timestamp = new Date().toISOString();
    
    const result = await db.collection('scans').insertOne(newScan);
    res.json({ 
      success: true, 
      message: 'Scan logged successfully',
      scanId: result.insertedId 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to log scan' });
  }
});

// Start server
async function startServer() {
  await connectToMongoDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 SCORPION Backend Server running on http://localhost:${PORT}`);
    console.log(`📊 Health: http://localhost:${PORT}/api/status`);
    console.log(`📈 Scans: http://localhost:${PORT}/api/scans`);
    console.log(`🎯 Discounts: http://localhost:${PORT}/api/discounts`);
    console.log(`📦 Inventory: http://localhost:${PORT}/api/inventory`);
    console.log('💾 Database: MongoDB Atlas');
  });
}

startServer();
