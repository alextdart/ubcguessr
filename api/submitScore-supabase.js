import { gameAPI } from '../lib/supabase'

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { name, score, roundsData, gameInstance = 'public' } = req.body

        if (!name || score === undefined) {
            return res.status(400).json({ error: 'Name and score are required' })
        }

        if (typeof score !== 'number' || isNaN(score)) {
            return res.status(400).json({ error: 'Score must be a valid number.' })
        }

        if (score > 5000) {
            return res.status(400).json({ error: 'Invalid score.' })
        }

        if (name.includes('http') || name.includes('@')) {
            return res.status(400).json({ error: 'Invalid name. Please avoid using links or "@" in your name.' })
        }

        try {
            await gameAPI.submitScore(name, score, roundsData, gameInstance)
            res.status(200).json({ message: 'Score submitted successfully' })
        } catch (error) {
            console.error('Error submitting score:', error)
            res.status(500).json({ error: 'Failed to submit score', details: error.message })
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' })
    }
}
