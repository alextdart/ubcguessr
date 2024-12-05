import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles.css"; 

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <h1>Do you think you know UBC Campus?</h1>
            <h2>Test your skills here on UBCguessr!</h2>
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
