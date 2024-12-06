import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const userIcon = new L.Icon({
    iconUrl: process.env.PUBLIC_URL + '/images/user-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const correctIcon = new L.Icon({
    iconUrl: process.env.PUBLIC_URL + '/images/correct-marker.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const FinalScore = ({ scores, guessLocations, correctLocations }) => {
    const [name, setName] = useState('');
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        fetch('/api/getLeaderboard')
            .then((response) => response.json())
            .then((data) => setLeaderboard(data));
    }, []);

    const handleSubmitScore = () => {
        fetch('/api/submitScore', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, score: scores.reduce((a, b) => a + b, 0) })
        })
            .then((response) => response.json())
            .then(() => {
                fetch('/api/getLeaderboard')
                    .then((response) => response.json())
                    .then((data) => setLeaderboard(data));
            });
    };

    return (
        <div>
            <h2>Final Score</h2>
            <ul>
                {scores.map((score, index) => (
                    <li key={index}>Round {index + 1}: {score} points</li>
                ))}
            </ul>
            <h3>Total Score: {scores.reduce((a, b) => a + b, 0)} points</h3>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
            />
            <button onClick={handleSubmitScore} className="btn-secondary">
                Submit Score
            </button>
            <h3>Leaderboard</h3>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Score</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {leaderboard.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.name}</td>
                            <td>{entry.score}</td>
                            <td>{new Date(entry.date).toLocaleDateString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="final-score-map">
                <MapContainer center={[49.2606, -123.246]} zoom={13} style={{ height: '600px', width: '100%' }}>
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
    );
};

export default FinalScore;