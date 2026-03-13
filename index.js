const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());

const url = process.env.MONGO_URL; 
const client = new MongoClient(url);
const dbName = "mydatabase";

// Connect once and log success/failure
async function connectDB() {
    try { 
        await client.connect(); 
        console.log("✅ SUCCESS: Connected to MongoDB Atlas"); 
    } catch (e) { 
        console.error("❌ CONNECTION ERROR:", e.message); 
    }
}
connectDB();

// CREATE: Add a student
app.post('/students', async (req, res) => {
    try {
        console.log("Incoming POST data:", req.body);
        const result = await client.db(dbName).collection("students").insertOne(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error("❌ CREATE ERROR:", error.message);
        res.status(500).json({ error: "Failed to insert data", details: error.message });
    }
});

// READ: Get all students
app.get('/students', async (req, res) => {
    try {
        const data = await client.db(dbName).collection("students").find().toArray();
        console.log(`✅ READ: Found ${data.length} students`);
        res.json(data);
    } catch (error) {
        console.error("❌ READ ERROR:", error.message);
        res.status(500).json({ error: "Failed to fetch data", details: error.message });
    }
});

// UPDATE: Edit a student
app.put('/students/:id', async (req, res) => {
    try {
        const result = await client.db(dbName).collection("students").updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: req.body }
        );
        res.json(result);
    } catch (error) {
        console.error("❌ UPDATE ERROR:", error.message);
        res.status(500).json({ error: "Update failed", details: error.message });
    }
});

// DELETE: Remove a student
app.delete('/students/:id', async (req, res) => {
    try {
        const result = await client.db(dbName).collection("students").deleteOne({ 
            _id: new ObjectId(req.params.id) 
        });
        res.json(result);
    } catch (error) {
        console.error("❌ DELETE ERROR:", error.message);
        res.status(500).json({ error: "Delete failed", details: error.message });
    }
});

// Health check route (to test if the server is awake)
app.get('/', (req, res) => res.send("API is awake and running! 🚀"));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 API Mission Control active on port ${PORT}`));
