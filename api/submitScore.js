import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, score } = req.body;
        const date = new Date();

        try {
            await client.connect();
            const database = client.db('leaderboard');
            const collection = database.collection('scores');

            await collection.insertOne({ name, score, date });

            res.status(200).json({ message: 'Score submitted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to submit score' });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}