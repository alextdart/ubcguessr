
import React, { useState, useEffect } from "react";
import "../styles.css";

const Leaderboards = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);

    useEffect(() => {
        fetch('/api/getLeaderboard')
            .then((response) => response.json())
            .then((data) => setLeaderboard(data));

        fetch('/api/getDailyLeaderboard')
            .then((response) => response.json())
            .then((data) => setDailyLeaderboard(data));

        fetch('/api/getWeeklyLeaderboard')
            .then((response) => response.json())
            .then((data) => setWeeklyLeaderboard(data));
    }, []);

    return (
        <div className="leaderboards-page">
            <h2>Leaderboards</h2>
            <div className="leaderboards-container">
                <div className="leaderboard">
                    <h3>Daily Leaderboard (Top 20)</h3>
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Score</th>
                                <th>Name</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dailyLeaderboard.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.score}</td>
                                    <td>{entry.name}</td>
                                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="leaderboard">
                    <h3>Weekly Leaderboard (Top 20)</h3>
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Score</th>
                                <th>Name</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {weeklyLeaderboard.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.score}</td>
                                    <td>{entry.name}</td>
                                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="leaderboard">
                    <h3>All-time Leaderboard (Top 20)</h3>
                    <table className="leaderboard-table">
                        <thead>
                            <tr>
                                <th>Score</th>
                                <th>Name</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry, index) => (
                                <tr key={index}>
                                    <td>{entry.score}</td>
                                    <td>{entry.name}</td>
                                    <td>{new Date(entry.date).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Leaderboards;