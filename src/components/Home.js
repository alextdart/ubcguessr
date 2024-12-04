import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css"; 

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <h1>Welcome to UBC Guessr!</h1>
            <button 
                onClick={() => navigate("/play")} 
                className="start-button"
            >
                Start Game
            </button>
        </div>
    );
};

export default Home;
