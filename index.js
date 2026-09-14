// const express = require('express');
// const dotenv = require('dotenv');
// dotenv.config();
// const app = express()
// const port = process.env.PORT

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`)
// })


const express = require('express');
const dotenv = require('dotenv');
const { MongoClient, ServerApiVersion } = require('mongodb');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// JSON Parse করার জন্য Middleware
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
    // MongoDB Atlas-এ কানেক্ট করা
    await client.connect();
    // Ping পাঠি‍য়ে কানেকশন কনফার্ম করা
    await client.db("admin").command({ ping: 1 });
    console.log("Successfully connected to MongoDB Atlas!");

    // Routes
    app.get('/', (req, res) => {
      res.send('Hello World!');
    });

    // Server Listen
    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });

  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}

run().catch(console.dir);