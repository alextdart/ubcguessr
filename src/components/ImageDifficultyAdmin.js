import React, { useState, useEffect } from "react";
import { supabase, gameAPI } from "../lib/supabase";
import "../styles.css";

const ImageDifficultyAdmin = () => {
    const [images, setImages] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stats, setStats] = useState({});

    const difficultyLevels = [
        { key: 'very_easy', label: 'Very Easy', color: '#22c55e', description: 'Iconic landmarks, impossible to miss' },
        { key: 'easy', label: 'Easy', color: '#84cc16', description: 'Well-known buildings, clear landmarks' },
        { key: 'normal', label: 'Normal', color: '#eab308', description: 'Recognizable with some campus knowledge' },
        { key: 'hard', label: 'Hard', color: '#f97316', description: 'Requires good campus knowledge' },
        { key: 'very_hard', label: 'Very Hard', color: '#ef4444', description: 'Obscure locations, expert level' }
    ];

    useEffect(() => {
        loadImages();
    }, []);

    const loadImages = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('images')
                .select('*')
                .order('filename');

            if (error) throw error;

            setImages(data);
            calculateStats(data);
        } catch (error) {
            console.error('Error loading images:', error);
            alert('Error loading images');
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (imageList) => {
        const stats = {};
        difficultyLevels.forEach(level => {
            stats[level.key] = imageList.filter(img => img.difficulty_level === level.key).length;
        });
        stats.unassigned = imageList.filter(img => !img.difficulty_level || img.difficulty_level === 'normal').length;
        setStats(stats);
    };

    const updateDifficulty = async (difficulty) => {
        if (!images[currentIndex]) return;

        try {
            setSaving(true);
            const { error } = await supabase
                .from('images')
                .update({ difficulty_level: difficulty })
                .eq('id', images[currentIndex].id);

            if (error) throw error;

            // Update local state
            const updatedImages = [...images];
            updatedImages[currentIndex].difficulty_level = difficulty;
            setImages(updatedImages);
            calculateStats(updatedImages);

            // Auto-advance to next image
            if (currentIndex < images.length - 1) {
                setCurrentIndex(currentIndex + 1);
            }

        } catch (error) {
            console.error('Error updating difficulty:', error);
            alert('Error updating difficulty');
        } finally {
            setSaving(false);
        }
    };

    const navigateImage = (direction) => {
        if (direction === 'prev' && currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else if (direction === 'next' && currentIndex < images.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const jumpToImage = (index) => {
        if (index >= 0 && index < images.length) {
            setCurrentIndex(index);
        }
    };

    if (loading) {
        return (
            <div className="admin-container">
                <h1>Loading Images...</h1>
            </div>
        );
    }

    const currentImage = images[currentIndex];
    const progress = Math.round(((currentIndex + 1) / images.length) * 100);

    return (
        <div className="admin-container">
            <div className="admin-header">
                <h1>Image Difficulty Assignment</h1>
                <p>Assign difficulty levels for the orientation game</p>
                
                <div className="admin-stats">
                    <h3>Current Statistics:</h3>
                    <div className="stats-grid">
                        {difficultyLevels.map(level => (
                            <div key={level.key} className="stat-item" style={{ borderColor: level.color }}>
                                <span style={{ color: level.color }}>{level.label}</span>
                                <strong>{stats[level.key] || 0}</strong>
                            </div>
                        ))}
                        <div className="stat-item" style={{ borderColor: '#666' }}>
                            <span>Unassigned</span>
                            <strong>{stats.unassigned || 0}</strong>
                        </div>
                    </div>
                </div>
            </div>

            {currentImage && (
                <div className="admin-main">
                    <div className="image-section">
                        <div className="image-header">
                            <h2>Image {currentIndex + 1} of {images.length}</h2>
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p>Progress: {progress}%</p>
                        </div>

                        <div className="image-display-admin">
                            <img
                                src={gameAPI.getImageUrl(currentImage.filename)}
                                alt={currentImage.filename}
                                className="admin-image"
                            />
                        </div>

                        <div className="image-info">
                            <h3>{currentImage.filename}</h3>
                            <p>Current difficulty: <strong>{currentImage.difficulty_level || 'normal'}</strong></p>
                            <p>Coordinates: {currentImage.coordinates.lat.toFixed(6)}, {currentImage.coordinates.lng.toFixed(6)}</p>
                        </div>
                    </div>

                    <div className="controls-section">
                        <div className="navigation-controls">
                            <button 
                                onClick={() => navigateImage('prev')} 
                                disabled={currentIndex === 0}
                                className="nav-btn"
                            >
                                ← Previous
                            </button>
                            
                            <input
                                type="number"
                                min="1"
                                max={images.length}
                                value={currentIndex + 1}
                                onChange={(e) => jumpToImage(parseInt(e.target.value) - 1)}
                                className="jump-input"
                            />
                            
                            <button 
                                onClick={() => navigateImage('next')} 
                                disabled={currentIndex === images.length - 1}
                                className="nav-btn"
                            >
                                Next →
                            </button>
                        </div>

                        <div className="difficulty-controls">
                            <h3>Assign Difficulty Level:</h3>
                            <div className="difficulty-buttons">
                                {difficultyLevels.map(level => (
                                    <button
                                        key={level.key}
                                        onClick={() => updateDifficulty(level.key)}
                                        disabled={saving}
                                        className={`difficulty-btn ${currentImage.difficulty_level === level.key ? 'active' : ''}`}
                                        style={{ 
                                            backgroundColor: level.color,
                                            opacity: saving ? 0.7 : 1
                                        }}
                                    >
                                        <strong>{level.label}</strong>
                                        <span>{level.description}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {saving && (
                            <div className="saving-indicator">
                                Saving...
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="admin-footer">
                <p>⚠️ This is an admin page for difficulty assignment. It will be removed before production.</p>
            </div>
        </div>
    );
};

export default ImageDifficultyAdmin;
