import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const ImageManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newImage, setNewImage] = useState({
    file: null,
    filename: '',
    coordinates: { lat: 49.2606, lng: -123.246 },
    difficulty_level: 'normal'
  });

  const difficultyLevels = [
    { key: 'very_easy', label: 'Very Easy' },
    { key: 'easy', label: 'Easy' },
    { key: 'normal', label: 'Normal' },
    { key: 'hard', label: 'Hard' },
    { key: 'very_hard', label: 'Very Hard' }
  ];

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      console.log('Loaded images:', data); // Debug log
      setImages(data);
    } catch (error) {
      console.error('Error loading images:', error);
      alert('Error loading images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(prev => ({
        ...prev,
        file,
        filename: file.name
      }));
    }
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    if (!newImage.file || !newImage.filename) {
      alert('Please select a file and enter a filename');
      return;
    }

    setUploading(true);
    try {
      // Get file extension from the uploaded file
      const fileExt = newImage.file.name.split('.').pop();
      
      // Check if filename already has an extension
      let fileName = newImage.filename;
      if (!fileName.toLowerCase().endsWith(`.${fileExt.toLowerCase()}`)) {
        fileName = `${newImage.filename}.${fileExt}`;
      }
      
      // Upload directly to the bucket root, not in a subfolder
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('game-images')
        .upload(filePath, newImage.file);

      if (uploadError) throw uploadError;

      // Add to database
      const { data: insertedImage, error: dbError } = await supabase
        .from('images')
        .insert({
          filename: fileName,
          storage_path: filePath,
          coordinates: newImage.coordinates,
          difficulty_level: newImage.difficulty_level
        })
        .select()
        .single();

      if (dbError) throw dbError;

      // Add to game instances (orientation = 2, classic = 3)
      const gameInstanceEntries = [
        { game_instance_id: 2, image_id: insertedImage.id }, // orientation
        { game_instance_id: 3, image_id: insertedImage.id }  // classic
      ];

      const { error: gameInstanceError } = await supabase
        .from('game_instance_images')
        .insert(gameInstanceEntries);

      if (gameInstanceError) throw gameInstanceError;

      alert('Image added successfully!');
      setShowAddForm(false);
      setNewImage({
        file: null,
        filename: '',
        coordinates: { lat: 49.2606, lng: -123.246 },
        difficulty_level: 'normal'
      });
      loadImages();

    } catch (error) {
      console.error('Error adding image:', error);
      alert('Error adding image: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId, storagePath) => {
    if (!window.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      // Delete from game instances first (due to foreign key constraints)
      await supabase
        .from('game_instance_images')
        .delete()
        .eq('image_id', imageId);

      // Delete from storage
      await supabase.storage
        .from('game-images')
        .remove([storagePath]);

      // Delete from database
      const { error } = await supabase
        .from('images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      alert('Image deleted successfully!');
      loadImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error deleting image: ' + error.message);
    }
  };

  const updateImageDifficulty = async (imageId, difficulty) => {
    try {
      const { error } = await supabase
        .from('images')
        .update({ difficulty_level: difficulty })
        .eq('id', imageId);

      if (error) throw error;
      
      // Update local state
      setImages(prev => prev.map(img => 
        img.id === imageId ? { ...img, difficulty_level: difficulty } : img
      ));
    } catch (error) {
      console.error('Error updating difficulty:', error);
      alert('Error updating difficulty');
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading images...</div>;
  }

  return (
    <div className="image-manager">
      <div className="manager-header">
        <h2>Image Manager</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-image-btn"
        >
          {showAddForm ? 'Cancel' : 'Add New Image'}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddImage} className="add-image-form">
          <h3>Add New Image</h3>
          
          <div className="form-group">
            <label>Image File:</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileSelect}
              required 
            />
          </div>

          <div className="form-group">
            <label>Filename (without extension):</label>
            <input 
              type="text"
              value={newImage.filename.replace(/\.[^/.]+$/, "")}
              onChange={(e) => setNewImage(prev => ({ ...prev, filename: e.target.value }))}
              required 
            />
          </div>

          <div className="form-group">
            <label>Coordinates:</label>
            <div className="coordinate-inputs">
              <input 
                type="number"
                step="any"
                placeholder="Latitude"
                value={newImage.coordinates.lat}
                onChange={(e) => setNewImage(prev => ({
                  ...prev,
                  coordinates: { ...prev.coordinates, lat: parseFloat(e.target.value) }
                }))}
                required 
              />
              <input 
                type="number"
                step="any"
                placeholder="Longitude"
                value={newImage.coordinates.lng}
                onChange={(e) => setNewImage(prev => ({
                  ...prev,
                  coordinates: { ...prev.coordinates, lng: parseFloat(e.target.value) }
                }))}
                required 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Difficulty Level:</label>
            <select 
              value={newImage.difficulty_level}
              onChange={(e) => setNewImage(prev => ({ ...prev, difficulty_level: e.target.value }))}
            >
              {difficultyLevels.map(level => (
                <option key={level.key} value={level.key}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <button type="submit" disabled={uploading} className="submit-btn">
            {uploading ? 'Uploading...' : 'Add Image'}
          </button>
        </form>
      )}

      <div className="images-list">
        <h3>Existing Images ({images.length})</h3>
        <div className="images-grid">
          {images.map(image => (
            <div key={image.id} className="image-card">
              <img 
                src={`${process.env.REACT_APP_SUPABASE_URL}/storage/v1/object/public/game-images/${image.filename}`}
                alt={image.filename}
                className="image-preview"
                onError={(e) => {
                  console.log('Image load error for:', image.filename);
                  console.log('Attempted URL:', e.target.src);
                  console.log('Full image data:', image);
                  console.log('Supabase URL:', process.env.REACT_APP_SUPABASE_URL);
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5Ij5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
              <div className="image-info">
                <h4>{image.filename}</h4>
                <p>Coordinates: {image.coordinates.lat.toFixed(6)}, {image.coordinates.lng.toFixed(6)}</p>
                <div className="difficulty-selector">
                  <label>Difficulty:</label>
                  <select 
                    value={image.difficulty_level || 'normal'}
                    onChange={(e) => updateImageDifficulty(image.id, e.target.value)}
                  >
                    {difficultyLevels.map(level => (
                      <option key={level.key} value={level.key}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button 
                  onClick={() => handleDeleteImage(image.id, image.storage_path)}
                  className="delete-btn"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageManager;
