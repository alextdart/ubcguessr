import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper functions for game operations
export const gameAPI = {
  // Get images for a specific game instance
  async getGameImages(gameInstanceName = 'public') {
    const { data: gameInstance } = await supabase
      .from('game_instances')
      .select('id')
      .eq('name', gameInstanceName)
      .eq('is_active', true)
      .single()

    if (!gameInstance) {
      throw new Error(`Game instance '${gameInstanceName}' not found`)
    }

    const { data: images, error } = await supabase
      .from('game_instance_images')
      .select(`
        images (
          id,
          filename,
          coordinates,
          storage_path,
          difficulty_level
        )
      `)
      .eq('game_instance_id', gameInstance.id)

    if (error) throw error

    return images.map(item => ({
      id: item.images.id,
      image: item.images.filename,
      coordinates: item.images.coordinates,
      storage_path: item.images.storage_path,
      difficulty_level: item.images.difficulty_level
    }))
  },

  // Submit score
  async submitScore(playerName, totalScore, roundsData, gameInstanceName = 'public') {
    const { data: gameInstance } = await supabase
      .from('game_instances')
      .select('id')
      .eq('name', gameInstanceName)
      .eq('is_active', true)
      .single()

    if (!gameInstance) {
      throw new Error(`Game instance '${gameInstanceName}' not found`)
    }

    const { data, error } = await supabase
      .from('scores')
      .insert({
        game_instance_id: gameInstance.id,
        player_name: playerName,
        total_score: totalScore,
        rounds_data: roundsData
      })
      .select()

    if (error) throw error
    return data[0]
  },

  // Get leaderboard
  async getLeaderboard(gameInstanceName = 'public', timeframe = 'all', limit = 30) {
    const { data: gameInstance } = await supabase
      .from('game_instances')
      .select('id')
      .eq('name', gameInstanceName)
      .eq('is_active', true)
      .single()

    if (!gameInstance) {
      throw new Error(`Game instance '${gameInstanceName}' not found`)
    }

    let query = supabase
      .from('scores')
      .select('player_name, total_score, submitted_at')
      .eq('game_instance_id', gameInstance.id)
      .order('total_score', { ascending: false })
      .order('submitted_at', { ascending: true })
      .limit(limit)

    // Add timeframe filters
    const now = new Date()
    if (timeframe === 'daily') {
      const today4pm = new Date()
      today4pm.setHours(16, 0, 0, 0) // 4 PM today
      if (now.getHours() < 16) {
        today4pm.setDate(today4pm.getDate() - 1) // Yesterday 4 PM if before 4 PM today
      }
      query = query.gte('submitted_at', today4pm.toISOString())
    } else if (timeframe === 'weekly') {
      const lastSunday4pm = new Date()
      const daysSinceSunday = lastSunday4pm.getDay()
      lastSunday4pm.setDate(lastSunday4pm.getDate() - daysSinceSunday)
      lastSunday4pm.setHours(16, 0, 0, 0)
      if (now.getDay() === 0 && now.getHours() < 16) {
        lastSunday4pm.setDate(lastSunday4pm.getDate() - 7) // Previous week if Sunday before 4 PM
      }
      query = query.gte('submitted_at', lastSunday4pm.toISOString())
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(score => ({
      name: score.player_name,
      score: score.total_score,
      date: score.submitted_at
    }))
  },

  // Get image URL from storage
  getImageUrl(filename) {
    const { data } = supabase.storage
      .from('game-images')
      .getPublicUrl(filename)
    
    return data.publicUrl
  }
}
