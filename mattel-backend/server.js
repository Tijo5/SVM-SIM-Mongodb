// Step 1: Import dependencies
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb'); // Import MongoDB client

// Step 2: Initialize the Express app and set up middleware
const app = express();
app.use(express.json());
app.use(cors());

// Step 3: Set up MongoDB connection with the MongoClient
const uri = "";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function connectDB() {
  try {
    // Step 4: Connect the client to the MongoDB server
    await client.connect();
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    // API route to save daily sales data
    app.post('/api/sales', async (req, res) => {
      const { date, sales } = req.body;
      try {
        const database = client.db("sim_sales");
        const collection = database.collection("daily_sales");
        
        // Check if data for the same date already exists
        const existingSales = await collection.findOne({ date });
        if (existingSales) {
          return res.status(400).send("Sales data for this date already exists.");
        }
        
        // Insert new sales data
        const newSales = { date, sales };
        await collection.insertOne(newSales);
        res.status(201).send("Sales data saved successfully");
      } catch (error) {
        console.error('Error saving sales data:', error);
        res.status(500).send("Error saving sales data");
      }
    });

    // API route to fetch sales data for a specific date
    app.get('/api/sales/:date', async (req, res) => {
      const { date } = req.params;
      try {
        const database = client.db("sim_sales");
        const collection = database.collection("daily_sales");

        // Fetch sales data for the given date
        const salesData = await collection.findOne({ date });
        if (salesData) {
          res.status(200).json(salesData);
        } else {
          // Return sales: null if no data is found
          res.status(200).json({ sales: null });
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).send("Error fetching sales data");
      }
    });

  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
  }
}

connectDB().catch(console.dir);

// Step 5: Start the Express server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
