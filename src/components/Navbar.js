import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles.css";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    return (
        <nav className="navbar">
            <div className="logo">UBCguessr</div>
            <div className={`nav-links ${menuOpen ? "active" : ""}`}>
                <Link to="/" onClick={toggleMenu}>Home</Link>
                <Link to="/play" onClick={toggleMenu}>New Game</Link>
                <Link to="/about" onClick={toggleMenu}>About</Link>
                <Link to="/leaderboards" onClick={toggleMenu}>Leaderboards</Link>
            </div>
            <div className="menu-icon" onClick={toggleMenu}>
                &#9776; {/* Unicode character for hamburger menu */}
            </div>
        </nav>
    );
};

export default Navbar;
