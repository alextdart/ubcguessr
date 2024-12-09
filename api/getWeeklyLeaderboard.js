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

// from https://stackoverflow.com/questions/4156434/javascript-get-the-first-day-of-the-week-from-current-date
function setToMonday( date ) {
    var day = date.getDay() || 7;  
    if( day !== 1 ) 
        date.setHours(-24 * (day - 1)); 
    return date;
}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const client = await clientPromise;
            const database = client.db('leaderboard');
            const collection = database.collection('scores');

            const today = new Date();
            const mondayThisWeek = setToMonday(today);

            const weeklyScores = await collection.find({ date: { $gte: mondayThisWeek } }).sort({ score: -1, date: 1 }).limit(30).toArray();

            res.status(200).json(weeklyScores);
        } catch (error) {
            console.error('Error fetching weekly leaderboard:', error);
            res.status(500).json({ error: 'Failed to fetch weekly leaderboard', details: error.message });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}