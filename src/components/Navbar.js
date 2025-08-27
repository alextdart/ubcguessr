import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles.css";

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [playDropdownOpen, setPlayDropdownOpen] = useState(false);
    const [leaderboardDropdownOpen, setLeaderboardDropdownOpen] = useState(false);

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const togglePlayDropdown = () => {
        setPlayDropdownOpen(!playDropdownOpen);
    };

    const toggleLeaderboardDropdown = () => {
        setLeaderboardDropdownOpen(!leaderboardDropdownOpen);
    };

    const closeDropdowns = () => {
        setMenuOpen(false);
        setPlayDropdownOpen(false);
        setLeaderboardDropdownOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="logo">UBCguessr</div>
            <div className={`nav-links ${menuOpen ? "active" : ""}`}>
                <Link to="/" onClick={closeDropdowns}>Home</Link>
                
                <div 
                    className="dropdown"
                    onMouseEnter={() => setPlayDropdownOpen(true)}
                    onMouseLeave={() => setPlayDropdownOpen(false)}
                >
                    <button 
                        className="dropdown-button" 
                        onClick={togglePlayDropdown}
                    >
                        Play ▼
                    </button>
                    {playDropdownOpen && (
                        <div className="dropdown-content">
                            <Link to="/play/orientation" onClick={closeDropdowns}>
                                Orientation Challenge
                            </Link>
                            <Link to="/play/classic" onClick={closeDropdowns}>
                                Classic Mode
                            </Link>
                            <Link to="/play/challenge" onClick={closeDropdowns}>
                                Challenge Mode
                            </Link>
                        </div>
                    )}
                </div>
                
                <Link to="/about" onClick={closeDropdowns}>About</Link>
                
                <div 
                    className="dropdown"
                    onMouseEnter={() => setLeaderboardDropdownOpen(true)}
                    onMouseLeave={() => setLeaderboardDropdownOpen(false)}
                >
                    <button 
                        className="dropdown-button" 
                        onClick={toggleLeaderboardDropdown}
                    >
                        Leaderboards ▼
                    </button>
                    {leaderboardDropdownOpen && (
                        <div className="dropdown-content">
                            <Link to="/leaderboards/orientation" onClick={closeDropdowns}>
                                Orientation Leaderboards
                            </Link>
                            <Link to="/leaderboards/classic" onClick={closeDropdowns}>
                                Classic Leaderboards
                            </Link>
                            <Link to="/leaderboards/challenge" onClick={closeDropdowns}>
                                Challenge Leaderboards
                            </Link>
                        </div>
                    )}
                </div>
            </div>
            <div className="menu-icon" onClick={toggleMenu}>
                &#9776; {/* Unicode character for hamburger menu */}
            </div>
        </nav>
    );
};

export default Navbar;
