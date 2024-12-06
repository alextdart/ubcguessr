import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise;

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, score } = req.body;
        const date = new Date();

        try {
            const client = await clientPromise;
            const database = client.db('leaderboard');
            const collection = database.collection('scores');

            await collection.insertOne({ name, score, date });

            res.status(200).json({ message: 'Score submitted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to submit score' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}