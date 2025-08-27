import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const GameStats = () => {
  const [stats, setStats] = useState({
    totalGames: 0,
    totalPlayers: 0,
    averageScore: 0,
    gamesByMode: {},
    recentGames: [],
    topScores: [],
    dailyGames: []
  });
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState('all');

  useEffect(() => {
    loadStats();
  }, [timeframe]);

  const loadStats = async () => {
    setLoading(true);
    try {
      // Get basic stats
      const { data: allScores } = await supabase
        .from('scores')
        .select(`
          *,
          game_instances(name, display_name)
        `)
        .order('created_at', { ascending: false });

      // Filter by timeframe
      const now = new Date();
      const filteredScores = allScores.filter(score => {
        const scoreDate = new Date(score.created_at);
        switch (timeframe) {
          case 'today':
            return scoreDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return scoreDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            return scoreDate >= monthAgo;
          default:
            return true;
        }
      });

      // Calculate stats
      const totalGames = filteredScores.length;
      const uniquePlayers = new Set(filteredScores.map(s => s.player_name)).size;
      const averageScore = totalGames > 0 
        ? Math.round(filteredScores.reduce((sum, s) => sum + s.total_score, 0) / totalGames)
        : 0;

      // Games by mode
      const gamesByMode = {};
      filteredScores.forEach(score => {
        const mode = score.game_instances?.display_name || 'Unknown';
        gamesByMode[mode] = (gamesByMode[mode] || 0) + 1;
      });

      // Recent games (last 10)
      const recentGames = filteredScores.slice(0, 10);

      // Top scores
      const topScores = [...filteredScores]
        .sort((a, b) => b.total_score - a.total_score)
        .slice(0, 10);

      // Daily games for the last 7 days
      const dailyGames = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const dayGames = allScores.filter(score => 
          score.created_at.startsWith(dateStr)
        ).length;
        dailyGames.push({
          date: date.toLocaleDateString(),
          games: dayGames
        });
      }

      setStats({
        totalGames,
        totalPlayers: uniquePlayers,
        averageScore,
        gamesByMode,
        recentGames,
        topScores,
        dailyGames
      });

    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading statistics...</div>;
  }

  return (
    <div className="game-stats">
      <div className="stats-header">
        <h2>Game Statistics</h2>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value)}
          className="stats-timeframe"
        >
          <option value="all">All Time</option>
          <option value="month">Last 30 Days</option>
          <option value="week">Last 7 Days</option>
          <option value="today">Today</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="stats-overview">
        <div className="stat-card">
          <h3>Total Games</h3>
          <div className="stat-number">{stats.totalGames}</div>
        </div>
        <div className="stat-card">
          <h3>Unique Players</h3>
          <div className="stat-number">{stats.totalPlayers}</div>
        </div>
        <div className="stat-card">
          <h3>Average Score</h3>
          <div className="stat-number">{stats.averageScore}</div>
        </div>
      </div>

      {/* Games by Mode */}
      <div className="stats-section">
        <h3>Games by Mode</h3>
        <div className="mode-stats">
          {Object.entries(stats.gamesByMode).map(([mode, count]) => (
            <div key={mode} className="mode-stat">
              <span className="mode-name">{mode}</span>
              <span className="mode-count">{count} games</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Activity */}
      <div className="stats-section">
        <h3>Daily Activity (Last 7 Days)</h3>
        <div className="daily-chart">
          {stats.dailyGames.map((day, index) => (
            <div key={index} className="daily-bar">
              <div 
                className="bar" 
                style={{ 
                  height: `${Math.max(day.games * 3, 5)}px`,
                  backgroundColor: day.games > 0 ? '#3b82f6' : '#e5e7eb'
                }}
              ></div>
              <span className="day-label">{day.date.split('/')[1]}/{day.date.split('/')[0]}</span>
              <span className="day-count">{day.games}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Games and Top Scores */}
      <div className="stats-tables">
        <div className="stats-table">
          <h3>Recent Games</h3>
          <table>
            <thead>
              <tr>
                <th>Player</th>
                <th>Score</th>
                <th>Mode</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentGames.map((game, index) => (
                <tr key={index}>
                  <td>{game.player_name}</td>
                  <td>{game.total_score}</td>
                  <td>{game.game_instances?.display_name || 'Unknown'}</td>
                  <td>{new Date(game.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="stats-table">
          <h3>Top Scores ({timeframe})</h3>
          <table>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Mode</th>
              </tr>
            </thead>
            <tbody>
              {stats.topScores.map((score, index) => (
                <tr key={index}>
                  <td>#{index + 1}</td>
                  <td>{score.player_name}</td>
                  <td>{score.total_score}</td>
                  <td>{score.game_instances?.display_name || 'Unknown'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GameStats;
