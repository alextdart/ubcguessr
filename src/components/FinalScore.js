import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DOMPurify from 'dompurify';
import { Filter } from 'bad-words';
import { gameAPI } from "../lib/supabase";
import "../styles.css";

// Custom icons
const userIcon = new L.Icon({
    iconUrl: process.env.PUBLIC_URL + "/images/user-marker.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const correctIcon = new L.Icon({
    iconUrl: process.env.PUBLIC_URL + "/images/correct-marker.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const FinalScore = () => {
    const location = useLocation();
    const { scores = [], guessLocations = [], correctLocations = [] } = location.state || {};
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);
    const [dailyLeaderboard, setDailyLeaderboard] = useState([]);
    const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const loadLeaderboards = async () => {
            try {
                const [allTime, daily, weekly] = await Promise.all([
                    gameAPI.getLeaderboard('public', 'all', 30),
                    gameAPI.getLeaderboard('public', 'daily', 30),
                    gameAPI.getLeaderboard('public', 'weekly', 30)
                ]);
                
                setLeaderboard(allTime);
                setDailyLeaderboard(daily);
                setWeeklyLeaderboard(weekly);
            } catch (error) {
                console.error('Error loading leaderboards:', error);
            }
        };

        loadLeaderboards();
    }, []);

    const handleSubmitScore = async () => {
        const filter = new Filter();
        const sanitizedInput = DOMPurify.sanitize(name);
        const totalScore = scores.reduce((a, b) => a + b, 0);

        if (filter.isProfane(sanitizedInput)) {
            alert("Please use appropriate language.");
            return;
        }

        if (totalScore > 5000) {
            alert("Invalid score.");
            return;
        }

        if (sanitizedInput.includes('http') || sanitizedInput.includes('@')) {
            alert("Invalid name. Please avoid using links or '@' in your name.");
            return;
        }

        // Prepare rounds data for submission
        const roundsData = scores.map((score, index) => ({
            imageId: null, // We don't have image IDs from the old format
            guess: guessLocations[index] ? {
                lat: guessLocations[index].lat,
                lng: guessLocations[index].lng
            } : null,
            correct: correctLocations[index] ? {
                lat: correctLocations[index].lat,
                lng: correctLocations[index].lng
            } : null,
            score: score,
            distance: null // We could calculate this if needed
        }));

        try {
            console.log('Submitting score:', { name: sanitizedInput, totalScore, roundsData });
            
            await gameAPI.submitScore(sanitizedInput, totalScore, roundsData, 'public');
            
            setIsSubmitted(true);
            
            // Refresh leaderboards
            const [allTime, daily, weekly] = await Promise.all([
                gameAPI.getLeaderboard('public', 'all', 30),
                gameAPI.getLeaderboard('public', 'daily', 30),
                gameAPI.getLeaderboard('public', 'weekly', 30)
            ]);
            
            setLeaderboard(allTime);
            setDailyLeaderboard(daily);
            setWeeklyLeaderboard(weekly);
            
            console.log('Score submitted successfully and leaderboards updated');
        } catch (error) {
            console.error('Error submitting score:', error);
            alert('Error submitting score. Please try again.');
        }
    };

    const handlePlayAgain = () => {
        navigate("/play");
    };

    return (
        <div>
            <div className="final-score-container">
                <div className="final-score-content">
                    <div className="final-score-text">
                        <div className="final-score-background"></div>
                        <h2>Final Score</h2>
                        <p>Total Score: {scores.reduce((a, b) => a + b, 0)}</p>
                        <h3>Round Scores:</h3>
                        <ul>
                            {scores.map((score, index) => (
                                <li key={index}>Round {index + 1}: {score} points</li>
                            ))}
                        </ul>
                        <button onClick={handlePlayAgain} className="btn-secondary">
                            Play Again
                        </button>
                    </div>
                    <div className="final-score-map">
                        <MapContainer center={[49.2606, -123.246]} zoom={13} style={{ height: "600px", width: "100%" }}>
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            {guessLocations.map((guess, index) => (
                                <Marker key={`guess-${index}`} position={guess} icon={userIcon} />
                            ))}
                            {correctLocations.map((correct, index) => (
                                <Marker key={`correct-${index}`} position={correct} icon={correctIcon} />
                            ))}
                            {guessLocations.map((guess, index) => (
                                <Polyline key={`line-${index}`} positions={[guess, correctLocations[index]]} color="blue" />
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>
            <div className="leaderboard-container">
                <div className="submit-score">
                    <h3>Submit Your Score</h3>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                        className="name-input"
                        disabled={isSubmitted}
                    />
                    <button onClick={handleSubmitScore} className="btn-secondary" disabled={isSubmitted}>
                        Submit Score
                    </button>
                </div>
                <div className="leaderboard-columns">
                    <div className="leaderboard">
                        <h2>Daily Leaderboard (Top 30)</h2>
                        <h3>Resets Daily at 4pm</h3>
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
                        <h2>Weekly Leaderboard (Top 30)</h2>
                        <h3>Resets Sundays at 4pm</h3>
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
                        <h2>All-time Leaderboard (Top 30)</h2>
                        <h3>Persistent</h3>
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
        </div>
    );
};

export default FinalScore;