import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DOMPurify from 'dompurify';
import { Filter } from 'bad-words';
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

    const handleSubmitScore = () => {
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

        const requestBody = { name: sanitizedInput, score: totalScore };
        console.log(JSON.stringify(requestBody));
        fetch('/api/submitScore', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        })
            .then((response) => {
                if (!response.ok) {
                    console.error("Error:", response.status, response.statusText);
                    return response.text().then((text) => {
                        try {
                            const json = JSON.parse(text);
                            throw new Error(json.message);
                        } catch {
                            throw new Error(text);
                        }
                    });
                }
                return response.json();
            })
            .then(() => {
                setIsSubmitted(true);
                fetch('/api/getLeaderboard')
                    .then((response) => response.json())
                    .then((data) => setLeaderboard(data));
            })
            .catch((error) => {
                console.error('Error submitting score:', error);
            });
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
        </div>
    );
};

export default FinalScore;