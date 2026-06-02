import React, { useState, useRef } from 'react';
import { X, ChevronDown, ChevronUp, AlignCenter, RotateCcw, Maximize2, Minimize2, Move } from 'lucide-react';
import type { OverlaySettings, TextLine } from '../App';
import './TextEditorPanel.css';

interface TextEditorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  settings: OverlaySettings;
  onChange: (settings: OverlaySettings) => void;
}

const TextEditorPanel: React.FC<TextEditorPanelProps> = ({
  isOpen,
  onClose,
  settings,
  onChange,
}) => {
  const [activeSection, setActiveSection] = useState<string>('text');
  const previewRef = useRef<HTMLDivElement>(null);

  const toggleSection = (section: string) => {
    setActiveSection(prev => prev === section ? '' : section);
  };

  const handleLineChange = (id: string, updates: Partial<TextLine>) => {
    const newLines = settings.lines.map(line => 
      line.id === id ? { ...line, ...updates } : line
    );
    onChange({ ...settings, lines: newLines });
  };

  const applyTemplate = (template: 'clean' | 'card' | 'glass') => {
    const updates: Partial<OverlaySettings> = { template };
    
    if (template === 'clean') {
      updates.backgroundColor = '#ffffff';
      updates.backgroundOpacity = 0;
      updates.borderWidth = 0;
      updates.padding = 0;
      updates.lines = settings.lines.map(l => ({ ...l, color: '#0f172a' }));
    } else if (template === 'card') {
      updates.backgroundColor = '#ffffff';
      updates.backgroundOpacity = 0.98;
      updates.borderWidth = 1;
      updates.borderColor = '#e2e8f0';
      updates.borderRadius = 8;
      updates.padding = 24;
      updates.lines = settings.lines.map((l, i) => ({ ...l, color: i === 0 ? '#0f172a' : '#64748b' }));
    } else if (template === 'glass') {
      updates.backgroundColor = '#ffffff';
      updates.backgroundOpacity = 0.3;
      updates.borderWidth = 1;
      updates.borderColor = '#ffffff';
      updates.borderRadius = 16;
      updates.padding = 24;
      updates.lines = settings.lines.map(l => ({ ...l, color: '#000000' }));
    }
    
    onChange({ ...settings, ...updates });
  };

  const applyPreset = (preset: 'small' | 'medium' | 'large' | 'auto') => {
    if (preset === 'small') {
      onChange({ ...settings, boxWidth: 120, boxHeight: 40, padding: 8, borderRadius: 4 });
    } else if (preset === 'medium') {
      onChange({ ...settings, boxWidth: 220, boxHeight: 70, padding: 16, borderRadius: 8 });
    } else if (preset === 'large') {
      onChange({ ...settings, boxWidth: 350, boxHeight: 120, padding: 24, borderRadius: 12 });
    } else if (preset === 'auto') {
      onChange({ ...settings, boxWidth: 0, boxHeight: 0, padding: 16 });
    }
  };

  // Live Preview Style
  const previewOverlayStyle: React.CSSProperties = {
    backgroundColor: settings.backgroundColor === 'transparent' || settings.backgroundOpacity === 0
      ? 'transparent' 
      : `rgba(${parseInt(settings.backgroundColor.slice(1, 3), 16) || 255}, ${parseInt(settings.backgroundColor.slice(3, 5), 16) || 255}, ${parseInt(settings.backgroundColor.slice(5, 7), 16) || 255}, ${settings.backgroundOpacity})`,
    backdropFilter: settings.template === 'glass' ? 'blur(10px)' : 'none',
    boxShadow: settings.template === 'clean' ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.1)',
    border: settings.borderWidth > 0 ? `${settings.borderWidth}px solid ${settings.borderColor}` : 'none',
    padding: `${settings.padding}px`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    textAlign: 'center',
    width: settings.boxWidth > 0 ? `${settings.boxWidth}px` : 'auto',
    height: settings.boxHeight > 0 ? `${settings.boxHeight}px` : 'auto',
    justifyContent: 'center',
    borderRadius: `${settings.borderRadius}px`,
    fontFamily: settings.fontFamily,
    transition: 'all 0.2s ease-out',
    margin: 'auto',
    position: 'relative',
    boxSizing: 'border-box',
    overflow: 'hidden'
  };

  return (
    <div className={`bottom-sheet ${isOpen ? 'open' : ''}`}>
      <div className="sheet-header">
        <div className="header-title-group">
          <h3>Text Editor</h3>
          <span className="header-subtitle">WYSIWYG Preview</span>
        </div>
        <button className="sheet-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="sheet-content">
        {/* LIVE PREVIEW AREA */}
        <div className="live-preview-container">
          <div className="preview-canvas">
            <div style={previewOverlayStyle} ref={previewRef}>
              {settings.lines.map(line => (
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
          </div>
          <div className="preview-label">Live Preview</div>
        </div>

        {/* Accordion Item: Text Content */}
        <div className={`accordion-item ${activeSection === 'text' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('text')}>
            <div className="accordion-title">
               <span className="icon-wrapper"><Move size={16} /></span>
               <span>Content</span>
            </div>
            {activeSection === 'text' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {activeSection === 'text' && (
            <div className="accordion-body">
              {settings.lines.map((line, index) => (
                <div key={line.id} className="compact-input-group">
                  <label>{index === 0 ? 'Main Title' : 'Subtitle'}</label>
                  <input 
                    type="text"
                    className="canva-input"
                    placeholder={`Enter ${index === 0 ? 'title' : 'subtitle'}...`}
                    value={line.text}
                    onChange={(e) => handleLineChange(line.id, { text: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accordion Item: Font & Style */}
        <div className={`accordion-item ${activeSection === 'font' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('font')}>
             <div className="accordion-title">
               <span className="icon-wrapper"><AlignCenter size={16} /></span>
               <span>Typography</span>
            </div>
            {activeSection === 'font' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {activeSection === 'font' && (
            <div className="accordion-body">
              <div className="compact-input-group">
                  <label>Font Family</label>
                  <select 
                    className="canva-select"
                    value={settings.fontFamily}
                    onChange={(e) => onChange({ ...settings, fontFamily: e.target.value })}
                  >
                    <option value="Inter">Inter</option>
                    <option value="Poppins">Poppins</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Prompt">Prompt (Thai)</option>
                    <option value="Kanit">Kanit (Thai)</option>
                    <option value="Sarabun">Sarabun (Thai)</option>
                    <option value="Noto Sans Thai">Noto Sans Thai</option>
                  </select>
              </div>

              {settings.lines.map((line, index) => (
                <div key={`style-${line.id}`} className="line-style-box">
                  <div className="line-style-header">{index === 0 ? 'Title Style' : 'Subtitle Style'}</div>
                  
                  <div className="style-row">
                    <div className="style-col">
                      <label>Color</label>
                      <input 
                        type="color" 
                        className="canva-color-picker"
                        value={line.color}
                        onChange={(e) => handleLineChange(line.id, { color: e.target.value })}
                      />
                    </div>
                    <div className="style-col flex-2">
                      <div className="label-with-value">
                        <label>Size</label>
                        <span className="value-badge">{line.fontSize}px</span>
                      </div>
                      <div className="input-with-slider">
                        <input 
                          type="range" 
                          className="canva-slider"
                          min="8" max="120" 
                          value={line.fontSize}
                          onChange={(e) => handleLineChange(line.id, { fontSize: Number(e.target.value) })}
                        />
                        <input 
                          type="number" 
                          className="canva-number-input"
                          value={line.fontSize}
                          onChange={(e) => handleLineChange(line.id, { fontSize: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="style-row">
                     <div className="style-col flex-1">
                      <label>Weight</label>
                      <select 
                        className="canva-select"
                        value={line.fontWeight}
                        onChange={(e) => handleLineChange(line.id, { fontWeight: e.target.value })}
                      >
                        <option value="300">Light</option>
                        <option value="400">Regular</option>
                        <option value="500">Medium</option>
                        <option value="600">Semi Bold</option>
                        <option value="700">Bold</option>
                        <option value="800">Extra Bold</option>
                        <option value="900">Black</option>
                      </select>
                    </div>
                    <div className="style-col">
                       <label>Style</label>
                       <button 
                          className={`canva-toggle ${line.italic ? 'active' : ''}`}
                          onClick={() => handleLineChange(line.id, { italic: !line.italic })}
                        >
                          Italic
                        </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Accordion Item: Box Style */}
        <div className={`accordion-item ${activeSection === 'box' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('box')}>
            <div className="accordion-title">
               <span className="icon-wrapper"><Maximize2 size={16} /></span>
               <span>Box & Container</span>
            </div>
            {activeSection === 'box' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {activeSection === 'box' && (
            <div className="accordion-body">
              <div className="presets-container">
                <label className="section-label">Size Presets</label>
                <div className="preset-grid">
                  <button className="preset-btn" onClick={() => applyPreset('auto')}>Auto Fit</button>
                  <button className="preset-btn" onClick={() => applyPreset('small')}>Small</button>
                  <button className="preset-btn" onClick={() => applyPreset('medium')}>Medium</button>
                  <button className="preset-btn" onClick={() => applyPreset('large')}>Large</button>
                </div>
              </div>

              <div className="compact-input-group">
                <div className="label-with-value">
                  <label>Width (0 = Auto)</label>
                  <span className="value-badge">{settings.boxWidth === 0 ? 'Auto' : settings.boxWidth + 'px'}</span>
                </div>
                <div className="input-with-slider">
                  <input 
                    type="range" 
                    className="canva-slider"
                    min="0" max="800" 
                    value={settings.boxWidth}
                    onChange={(e) => onChange({ ...settings, boxWidth: Number(e.target.value) })}
                  />
                  <input 
                    type="number" 
                    className="canva-number-input"
                    value={settings.boxWidth}
                    onChange={(e) => onChange({ ...settings, boxWidth: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="compact-input-group">
                <div className="label-with-value">
                  <label>Height (0 = Auto)</label>
                  <span className="value-badge">{settings.boxHeight === 0 ? 'Auto' : settings.boxHeight + 'px'}</span>
                </div>
                <div className="input-with-slider">
                  <input 
                    type="range" 
                    className="canva-slider"
                    min="0" max="800" 
                    value={settings.boxHeight}
                    onChange={(e) => onChange({ ...settings, boxHeight: Number(e.target.value) })}
                  />
                  <input 
                    type="number" 
                    className="canva-number-input"
                    value={settings.boxHeight}
                    onChange={(e) => onChange({ ...settings, boxHeight: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="compact-input-group">
                <div className="label-with-value">
                  <label>Padding</label>
                  <span className="value-badge">{settings.padding}px</span>
                </div>
                <div className="input-with-slider">
                  <input 
                    type="range" 
                    className="canva-slider"
                    min="0" max="120" 
                    value={settings.padding}
                    onChange={(e) => onChange({ ...settings, padding: Number(e.target.value) })}
                  />
                  <input 
                    type="number" 
                    className="canva-number-input"
                    value={settings.padding}
                    onChange={(e) => onChange({ ...settings, padding: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="compact-input-group">
                <div className="label-with-value">
                  <label>Corner Radius</label>
                  <span className="value-badge">{settings.borderRadius}px</span>
                </div>
                <div className="input-with-slider">
                  <input 
                    type="range" 
                    className="canva-slider"
                    min="0" max="100" 
                    value={settings.borderRadius}
                    onChange={(e) => onChange({ ...settings, borderRadius: Number(e.target.value) })}
                  />
                   <input 
                    type="number" 
                    className="canva-number-input"
                    value={settings.borderRadius}
                    onChange={(e) => onChange({ ...settings, borderRadius: Number(e.target.value) })}
                  />
                </div>
              </div>
              
              <div className="style-row" style={{ marginTop: '0.5rem' }}>
                <div className="style-col flex-1">
                  <label>Border Width</label>
                  <select 
                    className="canva-select"
                    value={settings.borderWidth}
                    onChange={(e) => onChange({ ...settings, borderWidth: Number(e.target.value) })}
                  >
                    <option value="0">None</option>
                    {[1, 2, 3, 4, 5, 8, 10, 12].map(w => (
                      <option key={w} value={w}>{w}px</option>
                    ))}
                  </select>
                </div>
                <div className="style-col">
                  <label>Border Color</label>
                  <input 
                    type="color" 
                    className="canva-color-picker"
                    value={settings.borderColor}
                    onChange={(e) => onChange({ ...settings, borderColor: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="style-row" style={{ marginTop: '0.5rem' }}>
                <div className="style-col flex-1">
                  <div className="label-with-value">
                    <label>Background Opacity</label>
                    <span className="value-badge">{Math.round(settings.backgroundOpacity * 100)}%</span>
                  </div>
                  <input 
                    type="range" 
                    className="canva-slider"
                    min="0" max="1" step="0.01"
                    value={settings.backgroundOpacity}
                    onChange={(e) => onChange({ ...settings, backgroundOpacity: Number(e.target.value) })}
                  />
                </div>
                <div className="style-col">
                  <label>BG Color</label>
                  <input 
                    type="color" 
                    className="canva-color-picker"
                    value={settings.backgroundColor === 'transparent' ? '#ffffff' : settings.backgroundColor}
                    onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Accordion Item: Template */}
        <div className={`accordion-item ${activeSection === 'template' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('template')}>
             <div className="accordion-title">
               <span className="icon-wrapper"><Minimize2 size={16} /></span>
               <span>Style Templates</span>
            </div>
            {activeSection === 'template' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {activeSection === 'template' && (
            <div className="accordion-body template-row">
              <button 
                className={`canva-template-btn ${settings.template === 'clean' ? 'active' : ''}`}
                onClick={() => applyTemplate('clean')}
              >
                <strong>Text Only</strong>
                <span>No background or border</span>
              </button>
              <button 
                className={`canva-template-btn ${settings.template === 'card' ? 'active' : ''}`}
                onClick={() => applyTemplate('card')}
              >
                <strong>White Label</strong>
                <span>Clean solid background</span>
              </button>
              <button 
                className={`canva-template-btn ${settings.template === 'glass' ? 'active' : ''}`}
                onClick={() => applyTemplate('glass')}
              >
                <strong>Glass Style</strong>
                <span>Modern transparent blur</span>
              </button>
            </div>
          )}
        </div>

        {/* Accordion Item: Position */}
        <div className={`accordion-item ${activeSection === 'position' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('position')}>
            <div className="accordion-title">
               <span className="icon-wrapper"><RotateCcw size={16} /></span>
               <span>Position & Snapping</span>
            </div>
            {activeSection === 'position' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {activeSection === 'position' && (
            <div className="accordion-body">
              <p className="hint-text">Drag text on the main image to move freely, or use these precise alignments:</p>
              <div className="position-grid">
                <button className="canva-pos-btn" onClick={() => onChange({ ...settings, x: 50 })}>
                  Center Horizontal
                </button>
                <button className="canva-pos-btn" onClick={() => onChange({ ...settings, y: 50 })}>
                  Center Vertical
                </button>
                <button className="canva-pos-btn" onClick={() => onChange({ ...settings, x: 10, y: 10 })}>
                  Top Left
                </button>
                <button className="canva-pos-btn" onClick={() => onChange({ ...settings, x: 90, y: 90 })}>
                  Bottom Right
                </button>
                <button className="canva-pos-btn full-width" onClick={() => onChange({ ...settings, x: 50, y: 50 })}>
                  <RotateCcw size={14} /> Reset to Center
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEditorPanel;

