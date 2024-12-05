import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
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

    const handlePlayAgain = () => {
        navigate("/play");
    };

    return (
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
    );
};

export default FinalScore;