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
            today.setUTCHours(0, 0, 0, 0); // Set to midnight UTC
            const localMidnight = new Date(today.getTime() - today.getTimezoneOffset() * 60000); // Convert to local midnight

            const dailyScores = await collection.find({ date: { $gte: localMidnight } }).sort({ score: -1 }).limit(20).toArray();

            res.status(200).json(dailyScores);
        } catch (error) {
            console.error('Error fetching daily leaderboard:', error);
            res.status(500).json({ error: 'Failed to fetch daily leaderboard', details: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}