import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            await client.connect();
            const database = client.db('leaderboard');
            const collection = database.collection('scores');

            const leaderboard = await collection.find().sort({ score: -1 }).limit(20).toArray();

            res.status(200).json(leaderboard);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch leaderboard' });
        } finally {
            await client.close();
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}