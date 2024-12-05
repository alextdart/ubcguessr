import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
            src={process.env.PUBLIC_URL + "/images/game/" + image}
            alt="Guess this location"
            className="game-image"
        />
    </div>
);

const Map = ({ onPinPlaced, correctLocation, userGuess, showResults, resetMap }) => {
    const [position, setPosition] = useState(null);
    const mapRef = useRef();

    useEffect(() => {
        if (resetMap && mapRef.current) {
            setPosition(null);
            mapRef.current.setView([49.2606, -123.246], 15);
        }
    }, [resetMap]);

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
            <MapContainer ref={mapRef} center={[49.2606, -123.246]} zoom={15} style={{ height: "100%", width: "100%" }}>
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
    const [shuffledImages, setShuffledImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userGuess, setUserGuess] = useState(null);
    const [scores, setScores] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [round, setRound] = useState(1);
    const [resetMap, setResetMap] = useState(false);
    const totalRounds = 5;
    const navigate = useNavigate();

    // Shuffle the images at the start of the game
    useEffect(() => {
        const shuffled = [...imageData].sort(() => Math.random() - 0.5); // Fisher-Yates shuffle
        setShuffledImages(shuffled.slice(0, totalRounds)); // Select only the first `totalRounds` images
    }, []);

    const handlePinPlaced = (position) => {
        setUserGuess(position);
    };

    const handleScoreCalculation = () => {
        if (!userGuess) {
            alert("Please place a pin before submitting!");
            return;
        }

        const correctLocation = shuffledImages[currentIndex].coordinates;
        const distance = getDistance(
            { latitude: correctLocation.lat, longitude: correctLocation.lng },
            { latitude: userGuess.lat, longitude: userGuess.lng }
        );

        const roundScore = Math.round(Math.max(1000 - distance, 0));
        setScores((prevScores) => [...prevScores, roundScore]);
        setShowResults(true);

        setTimeout(() => {
            alert(`You were ${distance} meters away! You earned ${roundScore} points.`);
        }, 100); // 100ms delay 
    };

    const handleNextRound = () => {
        if (round >= totalRounds) {
            navigate("/final-score", { state: { scores } });
        } else {
            setRound((prevRound) => prevRound + 1);
            setCurrentIndex((prevIndex) => prevIndex + 1);
            setUserGuess(null);
            setShowResults(false);
            setResetMap(true);
            setTimeout(() => setResetMap(false), 0); // Reset the map after state update
        }
    };

    if (shuffledImages.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div className="play-container">
            {/* Score and Round Info */}
            <header className="play-header">
                <h2>Score: {scores.reduce((a, b) => a + b, 0)}</h2>
                <h3>Round {round}/{totalRounds}</h3>
            </header>

            {/* Image and Map Side by Side */}
            <div className="play-main">
                <ImageDisplay image={shuffledImages[currentIndex].image} />
                <div className="map-container-wrapper">
                    <Map
                        onPinPlaced={handlePinPlaced}
                        correctLocation={shuffledImages[currentIndex].coordinates}
                        userGuess={userGuess}
                        showResults={showResults}
                        resetMap={resetMap}
                    />
                    <div className="play-buttons">
                        {!showResults ? (
                            <button onClick={handleScoreCalculation} className="btn-primary">
                                Submit Guess
                            </button>
                        ) : (
                            <button onClick={handleNextRound} className="btn-secondary">
                                {round >= totalRounds ? "Final Score" : "Next Round"}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Play;
