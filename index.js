const express = require('express');
const cors = require('cors'); // 1. Added CORS
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors()); // 2. Enable CORS
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

async function run() {
  try {
    await client.connect();

    // 3. Define db correctly
    const db = client.db('mirazShop');
    await db.command({ ping: 1 });
    console.log("Successfully connected to MongoDB Atlas!");

    // Collections
    const mensWatchCollection = db.collection("mens_watches");
    const womensWatchCollection = db.collection("womens_watches");
    const threePieceCollection = db.collection("three_pieces");
    const cosmeticsCollection = db.collection("cosmetics");

    // Routes
    app.get('/', (req, res) => {
      res.send('Miraz Shop Server is running...');
    });

    app.get("/api/products/single/:id", async (req, res) => {
      try {
        const { id } = req.params;

        // আপনার সব প্রোডাক্ট কালেকশনের লিস্ট
        const collections = [
          "mens_watches",
          "womens_watches",
          "three_pieces",
          "beauty_and_health",
        ];

        let foundProduct = null;

        // যেকোনো কালেকশনে এই ID-এর প্রোডাক্ট আছে কি না খুঁজে দেখা
        for (const colName of collections) {
          const collection = client.db("mirazShop").collection(colName);
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

    // Express.js API (Server side)
    app.get("/api/products/collection/:collectionName", async (req, res) => {
      try {
        const { collectionName } = req.params;
        // আপনার ডাটাবেজের নাম দিন
        const mensWatchCollection = db.collection(collectionName);

        // ওই কালেকশনের সব ডাটা ফেচ করা
        const products = await mensWatchCollection.find({}).toArray();

        res.status(200).json({
          success: true,
          data: products,
        });
      } catch (error) {
        console.error(`Error fetching collection ${req.params.collectionName}:`, error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch products from collection",
        });
      }
    });

    // 1. Men's Watch POST API
    app.post("/api/products/mens-watch", async (req, res) => {
      try {
        const productData = { ...req.body, createdAt: new Date() };
        const result = await mensWatchCollection.insertOne(productData);
        res.status(201).send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // 2. Women's Watch POST API
    app.post("/api/products/womens-watch", async (req, res) => {
      try {
        const productData = { ...req.body, createdAt: new Date() };
        const result = await womensWatchCollection.insertOne(productData);
        res.status(201).send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // 3. 3-Piece Dress POST API
    app.post("/api/products/three-piece", async (req, res) => {
      try {
        const productData = { ...req.body, createdAt: new Date() };
        const result = await threePieceCollection.insertOne(productData);
        res.status(201).send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

    // 4. Cosmetics POST API
    app.post("/api/products/cosmetics", async (req, res) => {
      try {
        const productData = { ...req.body, createdAt: new Date() };
        const result = await cosmeticsCollection.insertOne(productData);
        res.status(201).send({ success: true, insertedId: result.insertedId });
      } catch (error) {
        res.status(500).send({ error: error.message });
      }
    });

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

run().catch(console.dir);

// Server Listen outside run() to ensure it starts properly
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});