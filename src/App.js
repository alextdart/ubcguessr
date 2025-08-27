import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Play from "./components/Play";
import About from "./components/About";
import FinalScore from "./components/FinalScore"; // Import the new component
import Leaderboards from "./components/Leaderboards"; // Import the new component
import ImageDifficultyAdmin from "./components/ImageDifficultyAdmin"; // Import the admin component
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
                    <Route path="/play" element={<Play gameMode="orientation" />} />
                    <Route path="/play/orientation" element={<Play gameMode="orientation" />} />
                    <Route path="/play/classic" element={<Play gameMode="classic" />} />
                    <Route path="/play/challenge" element={<Play gameMode="challenge" />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/final-score" element={<FinalScore />} /> {/* Add the new route */}
                    <Route path="/leaderboards" element={<Leaderboards gameMode="classic" />} /> {/* Default to classic */}
                    <Route path="/leaderboards/orientation" element={<Leaderboards gameMode="orientation" />} />
                    <Route path="/leaderboards/classic" element={<Leaderboards gameMode="classic" />} />
                    <Route path="/leaderboards/challenge" element={<Leaderboards gameMode="challenge" />} />
                    <Route path="/admin/image-difficulty" element={<ImageDifficultyAdmin />} /> {/* Hidden admin route */}
                </Routes>
                <Analytics />
            </div>
        </Router>
    );
};

export default App;
