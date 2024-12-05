import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const FinalScore = () => {
    const location = useLocation();
    const { scores } = location.state;
    const navigate = useNavigate();

    const handlePlayAgain = () => {
        navigate("/play");
    };

    return (
        <div className="final-score-container">
            <h2>Final Score</h2>
            <p>Total Score: {scores.reduce((a, b) => a + b, 0)}</p>
            <h3>Round Scores:</h3>
            <ul>
                {scores.map((score, index) => (
                    <li key={index}>Round {index + 1}: {score} points</li>
                ))}
            </ul>
            <button onClick={handlePlayAgain} className="btn-primary">
                Play Again
            </button>
        </div>
    );
};

export default FinalScore;