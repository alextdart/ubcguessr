import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Play from "./components/Play";
import About from "./components/About";
import FinalScore from "./components/FinalScore"; // Import the new component
import Leaderboards from "./components/Leaderboards"; // Import the new component
import Navbar from "./components/Navbar"; // Import the Navbar component
import "./styles.css";
import { Analytics } from "@vercel/analytics/react";

const App = () => {
    return (
        <Router>
            <div>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/play" element={<Play />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/final-score" element={<FinalScore />} /> {/* Add the new route */}
                    <Route path="/leaderboards" element={<Leaderboards />} /> {/* Add the new route */}
                </Routes>
                <Analytics />
            </div>
        </Router>
    );
};

export default App;
