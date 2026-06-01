import React, { useState, useRef, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { domToPng } from 'modern-screenshot';
import TextEditorPanel from './components/TextEditorPanel';
import { Type, Download, Trash2, X, Image as ImageIcon } from 'lucide-react';
import getCroppedImg from './utils/cropUtils';
import CustomCropper from './components/CustomCropper';
import type { GridData } from './components/CustomCropper';
import './App.css';

interface ImageData {
  original: string;
  display: string;
  grid?: GridData;
}

export interface TextLine {
  id: string;
  text: string;
  fontSize: number;
  fontWeight: string;
  italic: boolean;
  color: string;
  opacity: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'lowercase';
}

export interface OverlaySettings {
  template: 'clean' | 'card' | 'glass';
  fontFamily: string;
  alignment: 'left' | 'center' | 'right';
  lineSpacing: number;
  shadow: boolean;
  outline: boolean;
  backgroundColor: string;
  backgroundOpacity: number;
  x: number;
  y: number;
  lines: TextLine[];
}

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [error, setError] = useState<string>('');
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentGrid, setCurrentGrid] = useState<GridData | null>(null);
  
  // Advanced Overlay State
  const [overlay, setOverlay] = useState<OverlaySettings>({
    template: 'card',
    fontFamily: 'Inter',
    alignment: 'center',
    lineSpacing: 1.2,
    shadow: true,
    outline: false,
    backgroundColor: '#ffffff',
    backgroundOpacity: 0.98,
    x: 50,
    y: 50,
    lines: [
      { 
        id: '1', 
        text: '21404 สตรีวิทยา2', 
        fontSize: 24, 
        fontWeight: '800', 
        italic: false,
        color: '#000000', 
        opacity: 1,
        letterSpacing: -0.5, 
        textTransform: 'none' 
      },
      { 
        id: '2', 
        text: 'CM.11 Nittaya', 
        fontSize: 18, 
        fontWeight: '500', 
        italic: false,
        color: '#000000', 
        opacity: 1,
        letterSpacing: 1, 
        textTransform: 'uppercase' 
      }
    ]
  });
  
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const gridRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    
    if (isDraggingText) {
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setOverlay(prev => ({
        ...prev,
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y))
      }));
    }
  }, [isDraggingText]);

  const handleMouseUp = useCallback(() => {
    setIsDraggingText(false);
  }, []);

  const getGridCols = (count: number) => {
    if (count <= 1) return 1;
    if (count <= 4) return 2;
    if (count <= 6) return 3;
    return 3; // Max 3 cols for 9 images
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const validTypes = ['image/jpeg', 'image/png'];
    const validExtensions = ['.jpg', '.jpeg', '.png'];
    
    const allValid = fileList.every(file => {
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return validTypes.includes(file.type) || validExtensions.includes(extension);
    });
    
    if (!allValid) {
      setError('Only .jpeg, .jpg, and .png files are allowed.');
      return;
    }

    setError('');
    
    const newImages = fileList.map(file => {
      const url = URL.createObjectURL(file);
      return { original: url, display: url };
    });
    
    setImages(prev => [...prev, ...newImages].slice(0, 9));
  };

  const clearAllImages = () => {
    if (images.length === 0) return;
    if (window.confirm('Are you sure you want to clear all images? This will reset your progress.')) {
        images.forEach(img => {
            URL.revokeObjectURL(img.original);
            if (img.display !== img.original) URL.revokeObjectURL(img.display);
        });
        setImages([]);
        setActiveCropIndex(null);
    }
  };

  const clearImage = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newImages = [...images];
    const removed = newImages.splice(index, 1)[0];
    URL.revokeObjectURL(removed.original);
    if (removed.display !== removed.original) URL.revokeObjectURL(removed.display);
    setImages(newImages);
  };

  const saveCrop = async () => {
    if (activeCropIndex === null || !currentGrid) return;

    const imageData = images[activeCropIndex];
    const pixelCrop = currentGrid.pixelCrop;
    
    try {
      const croppedImageUrl = await getCroppedImg(
        imageData.original, 
        pixelCrop,
        rotation
      );
      if (croppedImageUrl) {
        const newImages = [...images];
        if (newImages[activeCropIndex].display !== newImages[activeCropIndex].original) {
            URL.revokeObjectURL(newImages[activeCropIndex].display);
        }
        newImages[activeCropIndex] = { 
          ...imageData, 
          display: croppedImageUrl,
          grid: currentGrid
        };
        setImages(newImages);
      }
      setActiveCropIndex(null);
      setCurrentGrid(null);
    } catch (e) {
      console.error(e);
    }
  };

  const exportImage = async () => {
    if (gridRef.current === null) {
      alert('Error: Grid element not found.');
      return;
    }
    
    try {
      const dataUrl = await domToPng(gridRef.current, {
        scale: 3,
      });
      
      const link = document.createElement('a');
      link.download = `audit-report-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();

      // Reset application after successful export
      setTimeout(() => {
          images.forEach(img => {
            URL.revokeObjectURL(img.original);
            if (img.display !== img.original) URL.revokeObjectURL(img.display);
          });
          setImages([]);
          setActiveCropIndex(null);
          alert('Report generated and session cleared.');
      }, 500);

    } catch (err) {
      console.error('Export failed:', err);
      alert('Export failed. Try using smaller images.');
    }
  };

  return (
    <div className="container">
      <h1>Retail Compliance Report</h1>
      <p className="subtitle">Professional Merchandising & Store Inspection Documentation</p>
      
      <div className="controls">
        <input 
          type="file" 
          multiple 
          accept=".jpeg,.jpg,.png" 
          onChange={handleFileChange} 
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          <ImageIcon size={18} /> Add Photos ({images.length}/9)
        </label>
        
        {images.length > 0 && (
          <button onClick={clearAllImages} className="clear-all-button">
            <Trash2 size={18} /> Clear All
          </button>
        )}

        {error && <p className="error">{error}</p>}
        
        <button 
          onClick={exportImage} 
          disabled={images.length === 0}
          className="export-button"
        >
          <Download size={18} /> Generate Report Image
        </button>

        <button 
          onClick={() => setIsEditorOpen(true)} 
          disabled={images.length === 0}
          className="edit-text-trigger"
        >
          <Type size={18} /> Customize Text Overlay
        </button>
      </div>

      <div className="grid-wrapper">
        <div 
          className="grid-container" 
          ref={gridRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {images.length > 0 ? (
            <>
              <div 
                className="dynamic-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${getGridCols(images.length)}, 1fr)`,
                  width: '100%',
                  height: '100%',
                  gap: '12px',
                  backgroundColor: '#ffffff'
                }}
              >
                {images.map((img, index) => (
                  <div 
                    key={index} 
                    className="grid-item cursor-pointer group"
                    onClick={() => {
                        if (!isDraggingText) {
                          setActiveCropIndex(index);
                          setZoom(1);
                          setRotation(0);
                        }
                    }}
                  >
                    <img src={img.display} alt={`audit-photo-${index}`} />
                    
                    <button 
                        className="slot-clear-btn"
                        onClick={(e) => clearImage(index, e)}
                        title="Remove image"
                    >
                        <X size={14} />
                    </button>

                    <div className="item-overlay">Click to Edit</div>
                  </div>
                ))}
              </div>

              <div 
                className="text-overlay"
                style={{
                  left: `${overlay.x}%`,
                  top: `${overlay.y}%`,
                  transform: 'translate(-50%, -50%)',
                  cursor: isDraggingText ? 'grabbing' : 'grab',
                  pointerEvents: 'auto',
                  backgroundColor: overlay.backgroundColor === 'transparent' 
                    ? 'transparent' 
                    : `rgba(${parseInt(overlay.backgroundColor.slice(1, 3), 16)}, ${parseInt(overlay.backgroundColor.slice(3, 5), 16)}, ${parseInt(overlay.backgroundColor.slice(5, 7), 16)}, ${overlay.backgroundOpacity})`,
                  backdropFilter: overlay.template === 'glass' ? 'blur(10px)' : 'none',
                  boxShadow: overlay.shadow ? '0 10px 25px rgba(0, 0, 0, 0.1)' : 'none',
                  border: overlay.backgroundColor === 'transparent' ? 'none' : '1px solid #e2e8f0',
                  padding: overlay.backgroundColor === 'transparent' ? '0' : '1.5rem 3rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: overlay.alignment === 'center' ? 'center' : overlay.alignment === 'right' ? 'flex-end' : 'flex-start',
                  gap: `${(overlay.lineSpacing - 1) * 20}px`,
                  textAlign: overlay.alignment,
                  minWidth: overlay.backgroundColor === 'transparent' ? 'auto' : '320px',
                  zIndex: 10,
                  borderRadius: '2px',
                }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  setIsDraggingText(true);
                }}
                onDoubleClick={() => setIsEditorOpen(true)}
              >
                {overlay.lines.map(line => (
                  <div 
                    key={line.id}
                    style={{
                      fontSize: `${line.fontSize}px`,
                      fontWeight: line.fontWeight,
                      fontStyle: line.italic ? 'italic' : 'normal',
                      color: line.color,
                      opacity: line.opacity,
                      letterSpacing: `${line.letterSpacing}px`,
                      textTransform: line.textTransform as any,
                      textShadow: overlay.shadow 
                        ? `2px 2px 4px ${line.color === '#ffffff' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.3)'}` 
                        : 'none',
                      WebkitTextStroke: overlay.outline 
                        ? `1.5px ${line.color === '#ffffff' || line.color.toLowerCase() === '#fff' ? '#000000' : '#ffffff'}` 
                        : '0px transparent',
                    }}
                  >
                    {line.text}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="placeholder">
              <p>Select 1 or 4 images to see the preview</p>
              <span style={{fontSize: '0.8rem', marginTop: '0.5rem'}}>Professional Documentation Aesthetic</span>
            </div>
          )}
        </div>
      </div>

      {/* Crop Modal */}
      {activeCropIndex !== null && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <div className="crop-modal-header">
              <h3>Crop & Zoom Image</h3>
              <button onClick={() => setActiveCropIndex(null)} className="close-btn">×</button>
            </div>
            <div className="crop-container">
              <CustomCropper
                image={images[activeCropIndex].original}
                zoom={zoom}
                rotation={rotation}
                onCropChange={setCurrentGrid}
                initialData={images[activeCropIndex].grid}
                aspectRatio={1}
              />
            </div>
            <div className="crop-controls">
              <div className="control-groups">
                <div className="zoom-slider">
                  <span>Zoom</span>
                  <input
                    type="range"
                    value={zoom}
                    min={0.5}
                    max={3}
                    step={0.1}
                    onChange={(e) => setZoom(Number(e.target.value))}
                  />
                </div>
                <div className="zoom-slider">
                  <span>Rotate</span>
                  <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    onChange={(e) => setRotation(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={() => setActiveCropIndex(null)} className="cancel-btn">Cancel</button>
                <button onClick={saveCrop} className="save-btn">Apply Crop</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Text Editor Panel */}
      <TextEditorPanel 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        settings={overlay}
        onChange={setOverlay}
      />
    </div>
  );
}

export default App;
