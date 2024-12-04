import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getDistance } from "geolib";
import imageData from "./images.json";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const ImageDisplay = ({ image }) => (
    <div style={{ textAlign: "center" }}>
        <img
            src={process.env.PUBLIC_URL + "/images/" + image}
            alt="Guess this location"
            style={{ width: "80%", height: "auto", margin: "20px 0" }}
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
        <MapContainer center={[49.2606, -123.246]} zoom={15} style={{ height: "400px", width: "100%" }}>
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {position && <Marker position={position} />}
            {showResults && (
                <>
                    <Marker position={correctLocation} />
                    <Polyline positions={[userGuess, correctLocation]} color="red" />
                </>
            )}
            <MapClickHandler />
        </MapContainer>
    );
};

const App = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userGuess, setUserGuess] = useState(null);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [round, setRound] = useState(1);
    const totalRounds = 5;

    const handlePinPlaced = (position) => {
        setUserGuess(position);
        console.log("User's guess:", position);
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

        const roundScore = Math.max(1000 - distance / 10, 0); // Example scoring: max 1000, less with distance
        setScore((prevScore) => prevScore + roundScore);
        setShowResults(true);

        alert(`You were ${distance} meters away! You earned ${roundScore.toFixed(0)} points.`);
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
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>UBC Guessr</h1>
            <h2>Score: {score}</h2>
            <h3>Round {round}/{totalRounds}</h3>
            <ImageDisplay image={imageData[currentIndex].image} />
            <Map
                onPinPlaced={handlePinPlaced}
                correctLocation={imageData[currentIndex].coordinates}
                userGuess={userGuess}
                showResults={showResults}
            />
            {!showResults ? (
                <button onClick={handleScoreCalculation} style={{ margin: "20px", padding: "10px 20px" }}>
                    Submit Guess
                </button>
            ) : (
                <button onClick={handleNextRound} style={{ margin: "20px", padding: "10px 20px" }}>
                    Next Round
                </button>
            )}
        </div>
    );
};

export default App;
