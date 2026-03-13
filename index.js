const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors()); // CRITICAL: Allows your local PC to access the API
app.use(express.json());

const url = process.env.MONGO_URL; // Your Atlas String in Render Env
const client = new MongoClient(url);
const dbName = "mydatabase";

// Connect once when server starts
async function connectDB() {
    try { await client.connect(); console.log("Connected to Atlas"); }
    catch (e) { console.error(e); }
}
connectDB();

// CREATE
app.post('/students', async (req, res) => {
    const result = await client.db(dbName).collection("students").insertOne(req.body);
    res.json(result);
});

// READ (Get All)
app.get('/students', async (req, res) => {
    const data = await client.db(dbName).collection("students").find().toArray();
    res.json(data);
});

// UPDATE
app.put('/students/:id', async (req, res) => {
    const result = await client.db(dbName).collection("students").updateOne(
        { _id: new ObjectId(req.params.id) },
        { $set: req.body }
    );
    res.json(result);
});

// DELETE
app.delete('/students/:id', async (req, res) => {
    const result = await client.db(dbName).collection("students").deleteOne({ _id: new ObjectId(req.params.id) });
    res.json(result);
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`API running on ${PORT}`));