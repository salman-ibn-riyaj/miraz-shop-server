const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Client Configuration
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Cache database connection for Vercel
let db;
async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('mirazShop');
    console.log("Connected to MongoDB Atlas!");
  }
  return db;
}

// Middleware to ensure DB is connected before processing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
    res.status(500).json({ success: false, message: "Database connection failed" });
  }
});

// Root Route
app.get('/', (req, res) => {
  res.send('Miraz Shop Server is running...');
});

// Single Product GET Route
app.get("/api/products/single/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const collections = ["mens_watches", "womens_watches", "three_pieces", "cosmetics", "kids_learning"];
    let foundProduct = null;

    for (const colName of collections) {
      const collection = db.collection(colName);
      const product = await collection.findOne({ _id: new ObjectId(id) });
      if (product) {
        foundProduct = product;
        break;
      }
    }

    if (!foundProduct) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: foundProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Collection GET API
app.get("/api/products/collection/:collectionName", async (req, res) => {
  try {
    const { collectionName } = req.params;
    const collection = db.collection(collectionName);
    const products = await collection.find({}).toArray();

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error(`Error fetching collection ${req.params.collectionName}:`, error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
});

// ---------------- NEW FEATURED APIs ----------------

// Featured Men's Watch
app.get('/api/featured-mens-watch', async (req, res) => {
  try {
    const mensWatchCollection = db.collection("mens_watches");
    const featuredProduct = await mensWatchCollection.find({}).limit(4).toArray();
    res.status(200).json({ success: true, data: featuredProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Featured Women's Watch
app.get('/api/featured-womens-watch', async (req, res) => {
  try {
    const womensWatchCollection = db.collection("womens_watches");
    const featuredProduct = await womensWatchCollection.find({}).limit(4).toArray();
    res.status(200).json({ success: true, data: featuredProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Featured 3-Piece
app.get('/api/featured-three-piece', async (req, res) => {
  try {
    const threePieceCollection = db.collection("three_pieces");
    const featuredProduct = await threePieceCollection.find({}).limit(4).toArray();
    res.status(200).json({ success: true, data: featuredProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Featured Cosmetics
app.get('/api/featured-cosmetics', async (req, res) => {
  try {
    const cosmeticsCollection = db.collection("cosmetics");
    const featuredProduct = await cosmeticsCollection.find({}).limit(4).toArray();
    res.status(200).json({ success: true, data: featuredProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});




// POST APIs
app.post("/api/products/mens-watch", async (req, res) => {
  try {
    const productData = { ...req.body, createdAt: new Date() };
    const result = await db.collection("mens_watches").insertOne(productData);
    res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products/womens-watch", async (req, res) => {
  try {
    const productData = { ...req.body, createdAt: new Date() };
    const result = await db.collection("womens_watches").insertOne(productData);
    res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products/three-piece", async (req, res) => {
  try {
    const productData = { ...req.body, createdAt: new Date() };
    const result = await db.collection("three_pieces").insertOne(productData);
    res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products/cosmetics", async (req, res) => {
  try {
    const productData = { ...req.body, createdAt: new Date() };
    const result = await db.collection("cosmetics").insertOne(productData);
    res.status(201).json({ success: true, insertedId: result.insertedId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Local development only
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

module.exports = app;
