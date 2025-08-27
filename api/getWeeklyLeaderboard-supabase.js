import { gameAPI } from '../src/lib/supabase.js'

export default async function handler(req, res) {
    if (req.method === 'GET') {
        const { gameInstance = 'public' } = req.query

        try {
            const leaderboard = await gameAPI.getLeaderboard(gameInstance, 'weekly', 30)
            res.status(200).json(leaderboard)
        } catch (error) {
            console.error('Error fetching weekly leaderboard:', error)
            res.status(500).json({ error: 'Failed to fetch weekly leaderboard' })
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' })
    }
}
