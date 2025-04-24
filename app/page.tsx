'use client'
import React, { useState, useRef } from "react";
import { HiOutlinePhotograph } from "react-icons/hi";
import { FaTrash } from "react-icons/fa";
import { TbLetterA } from "react-icons/tb";
import { FiSave } from "react-icons/fi";

interface AvatarStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  size: number;
  fontFamily: string;
  fontSize: number;
  textColor: string;
}

const AvatarEditor: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [hasImage, setHasImage] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showAvatarPreview, setShowAvatarPreview] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [rotation, setRotation] = useState<number>(0);
  const [avatarName, setAvatarName] = useState<string>("");
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>({
    backgroundColor: "#f0f4f8",
    borderColor: "#4a90e2",
    borderWidth: 3,
    borderRadius: 50,
    size: 200,
    fontFamily: "Inter, sans-serif",
    fontSize: 64,
    textColor: "#2d3748",
  });

  const imageRef = useRef<HTMLImageElement | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (): void => {
        setImage(reader.result as string);
        setHasImage(true);
        setShowAvatarPreview(false);
        setAvatarPreview(null);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (): void => {
        setImage(reader.result as string);
        setHasImage(true);
        setShowAvatarPreview(false);
        setAvatarPreview(null);
        setZoom(1);
        setPosition({ x: 0, y: 0 });
        setRotation(0);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleZoom = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setZoom(Number.parseFloat(e.target.value));
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setPosition((prev) => ({
      ...prev,
      [name]: Number.parseInt(value, 10),
    }));
  };

  const handleRotate = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setRotation(Number.parseInt(e.target.value, 10));
  };

  const handleAvatarStyleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setAvatarStyle((prev) => ({
      ...prev,
      [name]: ["borderWidth", "borderRadius", "size", "fontSize"].includes(name)
        ? Number.parseInt(value, 10)
        : value,
    }));
  };
  
  const handleAvatarNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAvatarName(e.target.value);
  };

  const handleCreateAvatar = (): void => {
    if (!hasImage && !avatarName) return; // Allow creation with just a name

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { naturalWidth = 300, naturalHeight = 300 } = imageRef.current || {};
    
    canvas.width = avatarStyle.size;
    canvas.height = avatarStyle.size;

    // Fill background
    ctx.fillStyle = avatarStyle.backgroundColor;
    ctx.fillRect(0, 0, avatarStyle.size, avatarStyle.size);
    
    // Save context state
    ctx.save();
    
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(
      avatarStyle.size / 2,
      avatarStyle.size / 2,
      (avatarStyle.size / 2) - avatarStyle.borderWidth,
      0,
      Math.PI * 2
    );
    ctx.clip();
    
    // If no image but has avatar name, create text-based avatar
    if (!imageRef.current && avatarName) {
      ctx.restore(); // Restore to draw text above clip region
      
      // Draw initial letter
      const initial = avatarName.charAt(0).toUpperCase();
      ctx.fillStyle = avatarStyle.textColor;
      ctx.font = `${avatarStyle.fontSize}px ${avatarStyle.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initial, avatarStyle.size / 2, avatarStyle.size / 2);
      
      ctx.save(); // Save again for subsequent operations
      ctx.beginPath();
      ctx.arc(
        avatarStyle.size / 2,
        avatarStyle.size / 2,
        (avatarStyle.size / 2) - avatarStyle.borderWidth,
        0,
        Math.PI * 2
      );
      ctx.clip();
    }
    
    // If we have an image, draw it
    if (imageRef.current) {
      // Calculate centered positioning
      const scaleFactor = zoom;
      const scaledWidth = naturalWidth * scaleFactor;
      const scaledHeight = naturalHeight * scaleFactor;
      
      // Calculate positions to center the image
      const drawX = (avatarStyle.size - scaledWidth) / 2 + position.x;
      const drawY = (avatarStyle.size - scaledHeight) / 2 + position.y;
      
      // Translate to center of canvas for rotation
      ctx.translate(avatarStyle.size / 2, avatarStyle.size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.translate(-avatarStyle.size / 2, -avatarStyle.size / 2);
      
      // Apply a subtle vignette effect
      const gradient = ctx.createRadialGradient(
        avatarStyle.size / 2, avatarStyle.size / 2, 0,
        avatarStyle.size / 2, avatarStyle.size / 2, avatarStyle.size / 2
      );
      gradient.addColorStop(0.6, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.15)');
      
      // Draw image
      ctx.drawImage(
        imageRef.current,
        0,
        0,
        naturalWidth,
        naturalHeight,
        drawX,
        drawY,
        scaledWidth,
        scaledHeight
      );
      
      // Apply vignette
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, avatarStyle.size, avatarStyle.size);
    }
    
    // Restore context
    ctx.restore();
    
    // Draw border with gradient effect
    if (avatarStyle.borderWidth > 0) {
      ctx.strokeStyle = avatarStyle.borderColor;
      ctx.lineWidth = avatarStyle.borderWidth;
      
      // Create a more sophisticated border effect
      if (avatarStyle.borderWidth >= 3) {
        // Create a gradient for thicker borders
        const borderGradient = ctx.createLinearGradient(
          0, 0, 
          avatarStyle.size, avatarStyle.size
        );
        
        // Get base color
        const baseColor = avatarStyle.borderColor;
        
        // Create a lighter version for gradient
        const lighterColor = baseColor === '#ffffff' ? '#f0f0f0' : 
          `#${Math.min(parseInt(baseColor.slice(1, 3), 16) + 25, 255).toString(16).padStart(2, '0')}${
            Math.min(parseInt(baseColor.slice(3, 5), 16) + 25, 255).toString(16).padStart(2, '0')}${
            Math.min(parseInt(baseColor.slice(5, 7), 16) + 25, 255).toString(16).padStart(2, '0')}`;
        
        // Create a darker version for gradient
        const darkerColor = baseColor === '#000000' ? '#101010' : 
          `#${Math.max(parseInt(baseColor.slice(1, 3), 16) - 25, 0).toString(16).padStart(2, '0')}${
            Math.max(parseInt(baseColor.slice(3, 5), 16) - 25, 0).toString(16).padStart(2, '0')}${
            Math.max(parseInt(baseColor.slice(5, 7), 16) - 25, 0).toString(16).padStart(2, '0')}`;
            
        borderGradient.addColorStop(0, lighterColor);
        borderGradient.addColorStop(1, darkerColor);
        
        ctx.strokeStyle = borderGradient;
      }
      
      ctx.beginPath();
      ctx.arc(
        avatarStyle.size / 2,
        avatarStyle.size / 2,
        (avatarStyle.size / 2) - (avatarStyle.borderWidth / 2),
        0,
        Math.PI * 2
      );
      ctx.stroke();
      
      // Add subtle shadow effect
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 5;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
    }

    // Set preview
    const avatarImage = canvas.toDataURL();
    setAvatarPreview(avatarImage);
    setShowAvatarPreview(true);
  };

  const handleSaveAvatar = (): void => {
    if (!avatarPreview) return;

    const link = document.createElement("a");
    link.download = "avatar.png";
    link.href = avatarPreview;
    link.click();
  };

  const handleReset = (): void => {
    setImage(null);
    setHasImage(false);
    setShowAvatarPreview(false);
    setAvatarPreview(null);
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setAvatarName("");
    setAvatarStyle({
      backgroundColor: "#f0f4f8",
      borderColor: "#4a90e2",
      borderWidth: 3,
      borderRadius: 50,
      size: 200,
      fontFamily: "Inter, sans-serif",
      fontSize: 64,
      textColor: "#2d3748",
    });
  };

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-6 bg-white rounded-xl shadow-lg p-6 mb-6 bg-gradient-to-br from-white to-gray-50">
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 border-gray-200">Avatar Editor</h2>
          
          {/* Image upload area */}
          <div
            className="w-full h-64 flex items-center justify-center border-2 border-dashed rounded-lg border-gray-300 bg-gray-50 relative overflow-hidden group hover:border-blue-400 transition-all"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {hasImage ? (
              <div className="relative w-full h-full">
                <img
                  ref={imageRef}
                  src={image as string}
                  alt="Upload"
                  className="max-w-full max-h-full object-contain absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                    filter: 'contrast(1.05)',
                  }}
                />
                <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium">Adjust image below</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 mb-2 bg-blue-50 rounded-full flex items-center justify-center">
                  <HiOutlinePhotograph className="text-4xl text-blue-400" />
                </div>
                <p className="text-gray-600 text-center mb-2 font-medium">Drag & drop an image or click to upload</p>
                <p className="text-gray-400 text-sm text-center">For best results, use a square image</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            )}
          </div>
          
          {/* Image controls */}
          <div className="grid grid-cols-1 gap-4 mt-4">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600 font-medium">Zoom</label>
                <span className="text-xs text-gray-500">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="3"
                step="0.1"
                value={zoom}
                onChange={handleZoom}
                className="w-full accent-blue-500"
                disabled={!hasImage}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>-</span>
                <span>+</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600 font-medium">Position X</label>
                  <span className="text-xs text-gray-500">{position.x}px</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  name="x"
                  value={position.x}
                  onChange={handlePositionChange}
                  className="w-full accent-blue-500"
                  disabled={!hasImage}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>←</span>
                  <span>→</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <label className="text-sm text-gray-600 font-medium">Position Y</label>
                  <span className="text-xs text-gray-500">{position.y}px</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  name="y"
                  value={position.y}
                  onChange={handlePositionChange}
                  className="w-full accent-blue-500"
                  disabled={!hasImage}
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>↑</span>
                  <span>↓</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center">
                <label className="text-sm text-gray-600 font-medium">Rotation</label>
                <span className="text-xs text-gray-500">{rotation}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="360"
                value={rotation}
                onChange={handleRotate}
                className="w-full accent-blue-500"
                disabled={!hasImage}
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0°</span>
                <span>360°</span>
              </div>
            </div>
          </div>
          
          <button
            className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center justify-center gap-2 mt-4 font-medium disabled:opacity-50 disabled:bg-blue-400 shadow-md"
            onClick={handleCreateAvatar}
            disabled={!hasImage && !avatarName}
          >
            <TbLetterA className="text-lg" />
            {hasImage ? "Create Avatar from Image" : avatarName ? "Create Text Avatar" : "Create Avatar"}
          </button>
        </div>
        
        {/* Preview Section */}
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-xl font-bold text-gray-800 border-b pb-2 border-gray-200">Avatar Preview</h2>
          
          <div className="w-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white border border-gray-200 rounded-lg p-6 min-h-64 shadow-inner">
            {showAvatarPreview && avatarPreview ? (
              <div
                style={{
                  width: `${avatarStyle.size}px`,
                  height: `${avatarStyle.size}px`,
                  borderRadius: `${avatarStyle.borderRadius}%`,
                  border: `${avatarStyle.borderWidth}px solid ${avatarStyle.borderColor}`,
                  backgroundColor: avatarStyle.backgroundColor,
                  overflow: 'hidden',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                }}
              >
                <img
                  src={avatarPreview}
                  alt="Avatar Preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            ) : !hasImage && avatarName ? (
              <div
                style={{
                  width: `${avatarStyle.size}px`,
                  height: `${avatarStyle.size}px`,
                  borderRadius: `${avatarStyle.borderRadius}%`,
                  border: `${avatarStyle.borderWidth}px solid ${avatarStyle.borderColor}`,
                  backgroundColor: avatarStyle.backgroundColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  fontFamily: avatarStyle.fontFamily,
                  color: avatarStyle.textColor,
                  fontSize: `${avatarStyle.fontSize}px`,
                  fontWeight: 'bold',
                }}
              >
                {avatarName.charAt(0).toUpperCase()}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-400 py-8">
                <svg className="w-16 h-16 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p>Create your avatar to see preview</p>
                <p className="text-xs mt-1 text-gray-400">Upload an image or enter a name</p>
              </div>
            )}
          </div>
          
          {/* Style controls */}
          <div className="grid grid-cols-1 gap-4 mt-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Avatar Name</label>
              <input
                type="text"
                value={avatarName}
                onChange={handleAvatarNameChange}
                placeholder="Enter name for text avatar"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Avatar Size</label>
                <input
                  type="range"
                  min="50"
                  max="300"
                  name="size"
                  value={avatarStyle.size}
                  onChange={handleAvatarStyleChange}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Border Radius</label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  name="borderRadius"
                  value={avatarStyle.borderRadius}
                  onChange={handleAvatarStyleChange}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Square</span>
                  <span>Circle</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Border Width</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  name="borderWidth"
                  value={avatarStyle.borderWidth}
                  onChange={handleAvatarStyleChange}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>None</span>
                  <span>Thick</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Font Size</label>
                <input
                  type="range"
                  min="20"
                  max="120"
                  name="fontSize"
                  value={avatarStyle.fontSize}
                  onChange={handleAvatarStyleChange}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Small</span>
                  <span>Large</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-1">
              <label className="text-sm text-gray-600 font-medium">Font Family</label>
              <select
                name="fontFamily"
                value={avatarStyle.fontFamily}
                onChange={handleAvatarStyleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="Inter, sans-serif">Inter (Modern)</option>
                <option value="Arial, sans-serif">Arial (Classic)</option>
                <option value="Georgia, serif">Georgia (Elegant)</option>
                <option value="Verdana, sans-serif">Verdana (Clean)</option>
                <option value="'Montserrat', sans-serif">Montserrat (Contemporary)</option>
                <option value="'Playfair Display', serif">Playfair (Sophisticated)</option>
                <option value="'Roboto Mono', monospace">Roboto Mono (Technical)</option>
                <option value="'Comic Sans MS', cursive">Comic Sans (Casual)</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Background Color</label>
                <div className="relative">
                  <input
                    type="color"
                    name="backgroundColor"
                    value={avatarStyle.backgroundColor}
                    onChange={handleAvatarStyleChange}
                    className="w-full h-10 rounded border border-gray-200"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs px-1 pt-3 pb-1 bg-gradient-to-t from-gray-100 to-transparent">
                    <span className="text-gray-500">{avatarStyle.backgroundColor}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col gap-1">
                <label className="text-sm text-gray-600 font-medium">Text Color</label>
                <div className="relative">
                  <input
                    type="color"
                    name="textColor"
                    value={avatarStyle.textColor}
                    onChange={handleAvatarStyleChange}
                    className="w-full h-10 rounded border border-gray-200"
                  />
                  <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs px-1 pt-3 pb-1 bg-gradient-to-t from-gray-100 to-transparent">
                    <span className="text-gray-500">{avatarStyle.textColor}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-sm text-gray-600 font-medium">Border Color</label>
              <div className="relative">
                <input
                  type="color"
                  name="borderColor"
                  value={avatarStyle.borderColor}
                  onChange={handleAvatarStyleChange}
                  className="w-full h-10 rounded border border-gray-200"
                />
                <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs px-1 pt-3 pb-1 bg-gradient-to-t from-gray-100 to-transparent">
                  <span className="text-gray-500">{avatarStyle.borderColor}</span>
                </div>
              </div>
            </div>
            
            {/* Color palette presets */}
            <div className="mt-1">
              <label className="text-sm text-gray-600 font-medium mb-1 block">Color Presets</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { bg: "#f0f4f8", border: "#4a90e2", text: "#2d3748" },
                  { bg: "#ebf8ff", border: "#3182ce", text: "#2c5282" },
                  { bg: "#f9f7fc", border: "#805ad5", text: "#553c9a" },
                  { bg: "#fff5f5", border: "#e53e3e", text: "#9b2c2c" },
                  { bg: "#f0fff4", border: "#38a169", text: "#276749" },
                  { bg: "#2d3748", border: "#a0aec0", text: "#f7fafc" }
                ].map((palette, index) => (
                  <button
                    key={index}
                    className="w-8 h-8 rounded-full overflow-hidden border-2 transition-all hover:scale-110"
                    style={{ 
                      backgroundColor: palette.bg,
                      borderColor: palette.border 
                    }}
                    onClick={() => setAvatarStyle(prev => ({
                      ...prev,
                      backgroundColor: palette.bg,
                      borderColor: palette.border,
                      textColor: palette.text
                    }))}
                    title="Apply color preset"
                  />
                ))}
              </div>
            </div>
            
            {/* Font presets */}
            <div className="mt-1">
              <label className="text-sm text-gray-600 font-medium mb-1 block">Font Style Presets</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { family: "Inter, sans-serif", size: 64, color: "#2d3748" },
                  { family: "'Montserrat', sans-serif", size: 68, color: "#1a365d" },
                  { family: "Georgia, serif", size: 60, color: "#2c5282" },
                  { family: "'Playfair Display', serif", size: 58, color: "#553c9a" },
                  { family: "'Roboto Mono', monospace", size: 56, color: "#276749" }
                ].map((fontStyle, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 rounded bg-gray-100 text-gray-700 text-sm border border-gray-200 hover:bg-gray-200 transition-colors"
                    style={{ 
                      fontFamily: fontStyle.family
                    }}
                    onClick={() => setAvatarStyle(prev => ({
                      ...prev,
                      fontFamily: fontStyle.family,
                      fontSize: fontStyle.size,
                      textColor: fontStyle.color
                    }))}
                  >
                    Aa
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <button
              className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-gray-300 font-medium flex items-center justify-center gap-2 shadow-md"
              onClick={handleSaveAvatar}
              disabled={!showAvatarPreview}
            >
              <FiSave className="text-lg" />
              Save Avatar
            </button>
            
            <button
              className="flex-1 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300 font-medium flex items-center justify-center gap-2 shadow-md"
              onClick={handleReset}
            >
              <FaTrash className="text-lg" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarEditor;