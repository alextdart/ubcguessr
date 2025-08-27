import { gameAPI } from '../src/lib/supabase.js'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { gameInstance = 'public', timeframe = 'all' } = req.query

        try {
            const leaderboard = await gameAPI.getLeaderboard(gameInstance, timeframe, 30)
            res.status(200).json(leaderboard)
        } catch (error) {
            console.error('Error fetching leaderboard:', error)
            res.status(500).json({ error: 'Failed to fetch leaderboard' })
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' })
    }
}
