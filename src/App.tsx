import React, { useState, useRef, useCallback } from 'react';
import type { ChangeEvent } from 'react';
import { domToPng } from 'modern-screenshot';
import TextEditorPanel from './components/TextEditorPanel';
import { Type, Download, Trash2, X, Image as ImageIcon, Maximize2 } from 'lucide-react';
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
}

export interface OverlaySettings {
  template: 'clean' | 'card' | 'glass';
  fontFamily: string;
  x: number;
  y: number;
  boxWidth: number;
  boxHeight: number;
  padding: number;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  backgroundColor: string;
  backgroundOpacity: number;
  lines: TextLine[];
}

function App() {
  const [images, setImages] = useState<ImageData[]>([]);
  const [error, setError] = useState<string>('');
  const [activeCropIndex, setActiveCropIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentGrid, setCurrentGrid] = useState<GridData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Mobile UI States
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [activeImageAction, setActiveImageAction] = useState<number | null>(null);
  const [isPhotoMenuOpen, setIsPhotoMenuOpen] = useState(false);
  const [isLayoutMenuOpen, setIsLayoutMenuOpen] = useState(false);
  const [gridGap, setGridGap] = useState(4);
  const [aspectRatio, setAspectRatio] = useState<'1/1' | '3/2' | '4/3' | 'auto'>('auto');

  // Advanced Overlay State
  const [overlay, setOverlay] = useState<OverlaySettings>({
    template: 'card',
    fontFamily: 'Inter',
    x: 50,
    y: 50,
    boxWidth: 280,
    boxHeight: 0,
    padding: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    backgroundOpacity: 0.98,
    lines: [
      { id: '1', text: '21404 สตรีวิทยา2', fontSize: 24, fontWeight: '800', italic: false, color: '#000000' },
      { id: '2', text: 'CM.11 Nittaya', fontSize: 18, fontWeight: '500', italic: false, color: '#64748b' }
    ]
  });
  
  const [isDraggingText, setIsDraggingText] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

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
    return 3;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, isReplace = false) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const validTypes = ['image/jpeg', 'image/png'];
    
    const allValid = fileList.every(file => validTypes.includes(file.type) || /\.(jpg|jpeg|png)$/i.test(file.name));
    
    if (!allValid) {
      setError('Only JPG and PNG allowed.');
      return;
    }

    setError('');
    
    if (isReplace && activeImageAction !== null) {
      const url = URL.createObjectURL(fileList[0]);
      const newImages = [...images];
      URL.revokeObjectURL(newImages[activeImageAction].original);
      if (newImages[activeImageAction].display !== newImages[activeImageAction].original) {
        URL.revokeObjectURL(newImages[activeImageAction].display);
      }
      newImages[activeImageAction] = { original: url, display: url };
      setImages(newImages);
      setActiveImageAction(null);
      return;
    }

    const newImages = fileList.map(file => {
      const url = URL.createObjectURL(file);
      return { original: url, display: url };
    });
    
    setImages(prev => [...prev, ...newImages].slice(0, 9));
    setIsPhotoMenuOpen(false);
  };

  const clearAllImages = () => {
    if (images.length === 0) return;
    if (window.confirm('Reset all images?')) {
        images.forEach(img => {
            URL.revokeObjectURL(img.original);
            if (img.display !== img.original) URL.revokeObjectURL(img.display);
        });
        setImages([]);
        setIsPhotoMenuOpen(false);
    }
  };

  const deleteImage = (index: number) => {
    const newImages = [...images];
    const removed = newImages.splice(index, 1)[0];
    URL.revokeObjectURL(removed.original);
    if (removed.display !== removed.original) URL.revokeObjectURL(removed.display);
    setImages(newImages);
    setActiveImageAction(null);
  };

  const saveCrop = async () => {
    if (activeCropIndex === null || !currentGrid) return;
    setIsProcessing(true);

    const imageData = images[activeCropIndex];
    const pixelCrop = currentGrid.pixelCrop;
    
    try {
      const croppedImageUrl = await getCroppedImg(imageData.original, pixelCrop, rotation);
      if (croppedImageUrl) {
        const newImages = [...images];
        if (newImages[activeCropIndex].display !== newImages[activeCropIndex].original) {
            URL.revokeObjectURL(newImages[activeCropIndex].display);
        }
        newImages[activeCropIndex] = { ...imageData, display: croppedImageUrl, grid: currentGrid };
        setImages(newImages);
      }
      setActiveCropIndex(null);
      setCurrentGrid(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const exportImage = async () => {
    if (gridRef.current === null) return;
    setIsProcessing(true);
    try {
      const dataUrl = await domToPng(gridRef.current, { scale: 3 });
      const link = document.createElement('a');
      link.download = `audit-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setTimeout(() => {
          images.forEach(img => {
            URL.revokeObjectURL(img.original);
            if (img.display !== img.original) URL.revokeObjectURL(img.display);
          });
          setImages([]);
          setIsProcessing(false);
          alert('Saved!');
      }, 500);
    } catch (err) {
      console.error(err);
      setIsProcessing(false);
    }
  };

  return (
    <div className="app-shell">
      <header className="mobile-header">
        <div className="logo">AuditCam</div>
        {images.length > 0 && (
          <button className="header-export-btn" onClick={exportImage} disabled={isProcessing}>
            <Download size={16} /> Export
          </button>
        )}
      </header>

      <main className="main-content">
        <div className="preview-section">
          <div 
            className="grid-container" 
            ref={gridRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{
              aspectRatio: aspectRatio === 'auto' ? (images.length <= 4 ? '1 / 1' : images.length <= 6 ? '3 / 2' : '1 / 1') : aspectRatio,
            }}
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
                    gap: `${gridGap}px`,
                    backgroundColor: '#ffffff',
                    padding: `${gridGap}px`
                  }}
                >
                  {images.map((img, index) => (
                    <div 
                      key={index} 
                      className="grid-item"
                      onClick={() => !isDraggingText && setActiveImageAction(index)}
                    >
                      <img src={img.display} alt="" />
                      <div className="tap-indicator"><Maximize2 size={16} /></div>
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
                    backgroundColor: overlay.backgroundColor === 'transparent' || overlay.backgroundOpacity === 0
                      ? 'transparent' 
                      : `rgba(${parseInt(overlay.backgroundColor.slice(1, 3), 16) || 255}, ${parseInt(overlay.backgroundColor.slice(3, 5), 16) || 255}, ${parseInt(overlay.backgroundColor.slice(5, 7), 16) || 255}, ${overlay.backgroundOpacity})`,
                    backdropFilter: overlay.template === 'glass' ? 'blur(10px)' : 'none',
                    boxShadow: overlay.template === 'clean' ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.1)',
                    border: overlay.borderWidth > 0 ? `${overlay.borderWidth}px solid ${overlay.borderColor}` : 'none',
                    padding: `${overlay.padding}px`,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    textAlign: 'center',
                    width: overlay.boxWidth > 0 ? `${overlay.boxWidth}px` : 'auto',
                    height: overlay.boxHeight > 0 ? `${overlay.boxHeight}px` : 'auto',
                    justifyContent: 'center',
                    zIndex: 10,
                    borderRadius: `${overlay.borderRadius}px`,
                    fontFamily: overlay.fontFamily,
                    boxSizing: 'border-box',
                    overflow: 'hidden'
                  }}
                  onMouseDown={(e) => { e.stopPropagation(); setIsDraggingText(true); }}
                  onClick={(e) => { e.stopPropagation(); setIsEditorOpen(true); }}
                >
                  {overlay.lines.map(line => (
                    <div 
                      key={line.id}
                      style={{
                        fontSize: `${line.fontSize}px`,
                        fontWeight: line.fontWeight,
                        fontStyle: line.italic ? 'italic' : 'normal',
                        color: line.color,
                        lineHeight: '1.2',
                        width: '100%',
                        wordBreak: 'break-word'
                      }}
                    >
                      {line.text || '\u00A0'}
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state" onClick={() => fileInputRef.current?.click()}>
                <div className="upload-circle"><ImageIcon size={40} /></div>
                <h3>Start Your Report</h3>
                <p>Upload up to 9 photos to begin</p>
                <button className="primary-upload-btn">Add Photos</button>
              </div>
            )}
          </div>
        </div>
      </main>

      <nav className="bottom-nav">
        <button className="nav-item" onClick={() => setIsPhotoMenuOpen(true)}>
          <ImageIcon size={20} />
          <span>Photos</span>
        </button>
        <button className="nav-item" onClick={() => setIsEditorOpen(true)} disabled={images.length === 0}>
          <Type size={20} />
          <span>Overlay</span>
        </button>
        <button className="nav-item" onClick={() => setIsLayoutMenuOpen(true)} disabled={images.length === 0}>
          <Maximize2 size={20} />
          <span>Layout</span>
        </button>
        <button className="nav-item highlight" onClick={exportImage} disabled={images.length === 0}>
          <Download size={20} />
          <span>Save</span>
        </button>
      </nav>

      {/* Hidden Inputs */}
      <input type="file" multiple accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
      <input type="file" accept="image/*" ref={replaceInputRef} style={{ display: 'none' }} onChange={(e) => handleFileChange(e, true)} />

      {/* Layout Menu Sheet */}
      <div className={`bottom-sheet ${isLayoutMenuOpen ? 'open' : ''}`}>
        <div className="sheet-header">
           <h3>Grid Layout</h3>
           <button className="sheet-close-btn" onClick={() => setIsLayoutMenuOpen(false)}><X /></button>
        </div>
        <div className="sheet-content">
          <div className="compact-input-group" style={{ padding: '1.5rem' }}>
            <div className="label-with-value">
              <label>Grid Spacing</label>
              <span className="value-badge">{gridGap}px</span>
            </div>
            <input 
              type="range" 
              className="canva-slider"
              min="0" max="40" 
              value={gridGap}
              onChange={(e) => setGridGap(Number(e.target.value))}
            />
          </div>
          
          <div className="presets-container" style={{ padding: '0 1.5rem 1.5rem' }}>
            <label className="section-label">Aspect Ratio</label>
            <div className="preset-grid">
              <button className={`preset-btn ${aspectRatio === 'auto' ? 'active' : ''}`} onClick={() => setAspectRatio('auto')}>Auto</button>
              <button className={`preset-btn ${aspectRatio === '1/1' ? 'active' : ''}`} onClick={() => setAspectRatio('1/1')}>1:1</button>
              <button className={`preset-btn ${aspectRatio === '3/2' ? 'active' : ''}`} onClick={() => setAspectRatio('3/2')}>3:2</button>
              <button className={`preset-btn ${aspectRatio === '4/3' ? 'active' : ''}`} onClick={() => setAspectRatio('4/3')}>4:3</button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Action Sheet */}
      <div className={`bottom-sheet action-sheet ${activeImageAction !== null ? 'open' : ''}`}>
        <div className="sheet-header">
           <h3>Image Options</h3>
           <button className="sheet-close-btn" onClick={() => setActiveImageAction(null)}><X /></button>
        </div>
        <div className="sheet-content action-grid">
           <button className="action-item" onClick={() => { 
             setActiveCropIndex(activeImageAction); 
             setActiveImageAction(null);
             setZoom(1); setRotation(0);
           }}>
             <Maximize2 /> <span>Crop & Edit</span>
           </button>
           <button className="action-item" onClick={() => replaceInputRef.current?.click()}>
             <ImageIcon /> <span>Replace</span>
           </button>
           <button className="action-item danger" onClick={() => activeImageAction !== null && deleteImage(activeImageAction)}>
             <Trash2 /> <span>Remove</span>
           </button>
        </div>
      </div>

      {/* Photo Menu Sheet */}
      <div className={`bottom-sheet ${isPhotoMenuOpen ? 'open' : ''}`}>
        <div className="sheet-header">
           <h3>Manage Photos</h3>
           <button className="sheet-close-btn" onClick={() => setIsPhotoMenuOpen(false)}><X /></button>
        </div>
        <div className="sheet-content">
          <div className="photo-menu-list">
            <button className="menu-btn primary" onClick={() => fileInputRef.current?.click()}>
              <ImageIcon /> Add More Photos ({images.length}/9)
            </button>
            <button className="menu-btn danger" onClick={clearAllImages}>
              <Trash2 /> Reset All Photos
            </button>
          </div>
        </div>
      </div>

      {/* Crop Modal */}
      {activeCropIndex !== null && (
        <div className="crop-modal-overlay">
          <div className="crop-modal-content">
            <div className="crop-modal-header">
              <h3>Edit Crop</h3>
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
                  <input type="range" value={zoom} min={0.5} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} />
                </div>
                <div className="zoom-slider">
                  <span>Rotate</span>
                  <input type="range" value={rotation} min={0} max={360} step={1} onChange={(e) => setRotation(Number(e.target.value))} />
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={() => setActiveCropIndex(null)} className="cancel-btn">Cancel</button>
                <button onClick={saveCrop} className="save-btn" disabled={isProcessing}>Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TextEditorPanel 
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        settings={overlay}
        onChange={setOverlay}
      />

      {error && <div className="toast-error">{error}</div>}
    </div>
  );
}


export default App;
