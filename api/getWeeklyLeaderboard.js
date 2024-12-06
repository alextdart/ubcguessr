
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
    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const database = client.db('leaderboard');
            const collection = database.collection('scores');

            const today = new Date();
            const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));

            const weeklyScores = await collection.find({ date: { $gte: firstDayOfWeek } }).sort({ score: -1 }).limit(20).toArray();

            res.status(200).json(weeklyScores);
        } catch (error) {
            console.error('Error fetching weekly leaderboard:', error);
            res.status(500).json({ error: 'Failed to fetch weekly leaderboard', details: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}