import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, 
    });
    global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, score } = req.body;
        const date = new Date();

        if (!name || !score) {
            return res.status(400).json({ error: 'Name and score are required' });
        }

        if (typeof score !== 'number' || isNaN(score)) {
            return res.status(400).json({ error: 'Score must be a valid number.' });
        }

        if (score > 5000) {
            return res.status(400).json({ error: 'Invalid score.' });
        }

        if (name.includes('http') || name.includes('@')) {
            return res.status(400).json({ error: 'Invalid name. Please avoid using links or "@" in your name.' });
        }

        try {
            const client = await clientPromise;
            const database = client.db('leaderboard');
            const collection = database.collection('scores');

            await collection.insertOne({ name, score, date });

            res.status(200).json({ message: 'Score submitted successfully' });
        } catch (error) {
            console.error('Error submitting score:', error);
            res.status(500).json({ error: 'Failed to submit score', details: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}