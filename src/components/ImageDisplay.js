import React, { useState, useEffect } from "react";

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

export default ImageDisplay;
