import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getDistance } from "geolib";
import imageData from "../images.json";
import L from "leaflet";
import "../styles.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const ImageDisplay = ({ image }) => (
    <div className="image-display">
        <img
            src={process.env.PUBLIC_URL + "/images/" + image}
            alt="Guess this location"
            className="game-image"
        />
    </div>
);

const Map = ({ onPinPlaced, correctLocation, userGuess, showResults }) => {
    const [position, setPosition] = useState(null);

    const MapClickHandler = () => {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                onPinPlaced(e.latlng);
            }
        });
        return null;
    };

    return (
        <div className="map-container">
            <MapContainer center={[49.2606, -123.246]} zoom={15} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {position && <Marker position={position} />}
                {showResults && (
                    <>
                        <Marker position={correctLocation} />
                        <Polyline positions={[userGuess, correctLocation]} color="blue" />
                    </>
                )}
                <MapClickHandler />
            </MapContainer>
        </div>
    );
};

const Play = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userGuess, setUserGuess] = useState(null);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [round, setRound] = useState(1);
    const totalRounds = 5;

    const handlePinPlaced = (position) => {
        setUserGuess(position);
    };

    const handleScoreCalculation = () => {
        if (!userGuess) {
            alert("Please place a pin before submitting!");
            return;
        }
    
        const correctLocation = imageData[currentIndex].coordinates;
        const distance = getDistance(
            { latitude: correctLocation.lat, longitude: correctLocation.lng },
            { latitude: userGuess.lat, longitude: userGuess.lng }
        );
    
        // Calculate the score for this round and round it to the nearest integer
        const roundScore = Math.round(Math.max(1000 - distance / 0.7, 0));
        setScore((prevScore) => prevScore + roundScore);
        setShowResults(true);
    
        // Small delay so map updates before alert comes up
        setTimeout(() => {
            alert(`You were ${distance} meters away! You earned ${roundScore} points.`);
        }, 100); // 100ms delay 
    };
    

    const handleNextRound = () => {
        if (round >= totalRounds) {
            alert(`Game Over! Your final score is ${score}.`);
            setRound(1);
            setScore(0);
            setCurrentIndex(0);
        } else {
            setRound((prevRound) => prevRound + 1);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % imageData.length);
            setUserGuess(null);
            setShowResults(false);
        }
    };

    return (
        <div className="play-container">
            {/* Score and Round Info */}
            <header className="play-header">
                <h2>Score: {score}</h2>
                <h3>Round {round}/{totalRounds}</h3>
            </header>

            {/* Image and Map Side by Side */}
            <div className="play-main">
                <ImageDisplay image={imageData[currentIndex].image} />
                <Map
                    onPinPlaced={handlePinPlaced}
                    correctLocation={imageData[currentIndex].coordinates}
                    userGuess={userGuess}
                    showResults={showResults}
                />
            </div>

            {/* Buttons */}
            <div className="play-buttons">
                {!showResults ? (
                    <button onClick={handleScoreCalculation} className="btn-primary">
                        Submit Guess
                    </button>
                ) : (
                    <button onClick={handleNextRound} className="btn-secondary">
                        Next Round
                    </button>
                )}
            </div>
        </div>
    );
};

export default Play;
