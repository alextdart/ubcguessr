import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css"; 

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <div className="orientation-banner">
                <h1>UBC Orientation 2025</h1>
                <h2>Welcome to UBC! Test your knowledge of campus landmarks</h2>
                <p>Get familiar with your new home by exploring the most iconic locations on campus</p>
            </div>
            
            <button 
                onClick={() => navigate("/play/orientation")} 
                className="start-button orientation-button"
            >
                Orientation Challenge
            </button>
            
            <div className="secondary-options">
                <button 
                    onClick={() => navigate("/play/classic")} 
                    className="classic-link"
                >
                    Play Classic Game
                </button>
            </div>
        </div>
    );
};

export default Home;
