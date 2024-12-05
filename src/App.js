import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import Play from "./components/Play";
import About from "./components/About";
import FinalScore from "./components/FinalScore"; // Import the new component
import "./styles.css";


const App = () => {
    return (
        <Router>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/play" element={<Play />} />
                <Route path="/about" element={<About />} />
                <Route path="/final-score" element={<FinalScore />} /> {/* Add the new route */}
            </Routes>
        </Router>
    );
};

export default App;
