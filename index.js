const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors()); 
app.use(express.json());

const url = process.env.MONGO_URL; 
// We create the client but don't connect globally to avoid stale connections
const client = new MongoClient(url);
const dbName = "mydatabase";

/**
 * Helper function to ensure we have an active connection
 * This prevents the "Topology is closed" error.
 */
async function getDB() {
    try {
        // If the client isn't connected, connect it
        await client.connect();
        return client.db(dbName);
    } catch (e) {
        console.error("❌ DATABASE ACCESS ERROR:", e.message);
        throw e;
    }
}

// Health check route (to test if the server is awake)
app.get('/', (req, res) => res.send("API is awake and running! 🚀"));

// CREATE: Add a student
app.post('/students', async (req, res) => {
    try {
        const db = await getDB();
        console.log("Incoming POST data:", req.body);
        const result = await db.collection("students").insertOne(req.body);
        res.status(201).json(result);
    } catch (error) {
        console.error("❌ CREATE ERROR:", error.message);
        res.status(500).json({ error: "Failed to insert data", details: error.message });
    }
});

// READ: Get all students
app.get('/students', async (req, res) => {
    try {
        const db = await getDB();
        const data = await db.collection("students").find().toArray();
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
        const db = await getDB();
        const result = await db.collection("students").updateOne(
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
        const db = await getDB();
        const result = await db.collection("students").deleteOne({ 
            _id: new ObjectId(req.params.id) 
        });
        res.json(result);
    } catch (error) {
        console.error("❌ DELETE ERROR:", error.message);
        res.status(500).json({ error: "Delete failed", details: error.message });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 API Mission Control active on port ${PORT}`);
    // Optional: Initial connection test
    getDB().then(() => console.log("✅ Initial connection test passed")).catch(() => {});
});
