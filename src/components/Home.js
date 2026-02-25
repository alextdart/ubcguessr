import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css"; 

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <div className="orientation-banner">
                <h1>UBCguessr</h1>
                <h2>Test your knowledge of UBC campus landmarks</h2>
                <p>Choose your difficulty level and explore the most iconic locations on campus</p>
            </div>
            
            <div className="game-mode-buttons">
                <button 
                    onClick={() => navigate("/play/orientation")} 
                    className="game-mode-btn green-btn"
                >
                    <div className="mode-title">Orientation</div>
                    <div className="mode-difficulty">Easiest</div>
                </button>
                
                <button 
                    onClick={() => navigate("/play/classic")} 
                    className="game-mode-btn purple-btn"
                >
                    <div className="mode-title">Classic</div>
                    <div className="mode-difficulty">Balanced</div>
                </button>
                
                <button 
                    onClick={() => navigate("/play/challenge")} 
                    className="game-mode-btn red-btn"
                >
                    <div className="mode-title">Challenge</div>
                    <div className="mode-difficulty">Difficult</div>
                </button>
            </div>
        </div>
    );
};

export default Home;
