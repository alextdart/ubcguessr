import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
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

const ImageDisplay = ({ image, onNext }) => {
    return (
        <div style={{ textAlign: "center" }}>
            <img
                src={process.env.PUBLIC_URL + "/images/" + image}
                alt="Guess this location"
                style={{ width: "80%", height: "auto", margin: "20px 0" }}
            />
            <button onClick={onNext}>Next</button>
        </div>
    );
};

const Map = ({ onPinPlaced }) => {
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
            <MapClickHandler />
        </MapContainer>
    );
};

const App = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userGuess, setUserGuess] = useState(null);
    const [score, setScore] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % imageData.length);
        setUserGuess(null); // Reset guess for the next round
    };

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
        alert(`You were ${distance} meters away! You earned ${roundScore.toFixed(0)} points.`);
    };

    return (
        <div style={{ textAlign: "center", padding: "20px" }}>
            <h1>UBC Guessr</h1>
            <h2>Score: {score}</h2>
            <ImageDisplay image={imageData[currentIndex].image} onNext={handleNext} />
            <Map onPinPlaced={handlePinPlaced} />
            <button onClick={handleScoreCalculation} style={{ margin: "20px", padding: "10px 20px" }}>
                Submit Guess
            </button>
        </div>
    );
};

export default App;
