import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp, AlignCenter, RotateCcw } from 'lucide-react';
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

  return (
    <div className={`bottom-sheet ${isOpen ? 'open' : ''}`}>
      <div className="sheet-header">
        <h3>Edit Text</h3>
        <button className="sheet-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <div className="sheet-content">
        {/* Accordion Item: Text Content */}
        <div className={`accordion-item ${activeSection === 'text' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('text')}>
            <span>Text</span>
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
            <span>Font & Style</span>
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
                      <label>Size</label>
                      <input 
                        type="range" 
                        className="canva-slider"
                        min="12" max="72" 
                        value={line.fontSize}
                        onChange={(e) => handleLineChange(line.id, { fontSize: Number(e.target.value) })}
                      />
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
                        <option value="700">Bold</option>
                        <option value="800">Black</option>
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
            <span>Box Style</span>
            {activeSection === 'box' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {activeSection === 'box' && (
            <div className="accordion-body">
              <div className="compact-input-group">
                <label>Box Width (px)</label>
                <input 
                  type="range" 
                  className="canva-slider"
                  min="100" max="600" 
                  value={settings.boxWidth}
                  onChange={(e) => onChange({ ...settings, boxWidth: Number(e.target.value) })}
                />
              </div>
              <div className="compact-input-group">
                <label>Box Height (px, 0 = Auto)</label>
                <input 
                  type="range" 
                  className="canva-slider"
                  min="0" max="600" 
                  value={settings.boxHeight}
                  onChange={(e) => onChange({ ...settings, boxHeight: Number(e.target.value) })}
                />
              </div>
              <div className="compact-input-group">
                <label>Padding</label>
                <input 
                  type="range" 
                  className="canva-slider"
                  min="0" max="100" 
                  value={settings.padding}
                  onChange={(e) => onChange({ ...settings, padding: Number(e.target.value) })}
                />
              </div>
              <div className="compact-input-group">
                <label>Corner Radius</label>
                <input 
                  type="range" 
                  className="canva-slider"
                  min="0" max="50" 
                  value={settings.borderRadius}
                  onChange={(e) => onChange({ ...settings, borderRadius: Number(e.target.value) })}
                />
              </div>
              
              <div className="style-row" style={{ marginTop: '0.5rem' }}>
                <div className="style-col flex-1">
                  <label>Border Width</label>
                  <select 
                    className="canva-select"
                    value={settings.borderWidth}
                    onChange={(e) => onChange({ ...settings, borderWidth: Number(e.target.value) })}
                  >
                    <option value="0">0px</option>
                    <option value="1">1px</option>
                    <option value="2">2px</option>
                    <option value="3">3px</option>
                    <option value="5">5px</option>
                    <option value="8">8px</option>
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
                  <label>Background Opacity</label>
                  <input 
                    type="range" 
                    className="canva-slider"
                    min="0" max="1" step="0.1"
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
              <div className="compact-input-group">
                <button 
                  className="canva-template-btn"
                  onClick={() => onChange({ ...settings, backgroundOpacity: 0, borderWidth: 0 })}
                  style={{ textAlign: 'center', marginTop: '0.5rem' }}
                >
                  Remove Background & Border
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Accordion Item: Template */}
        <div className={`accordion-item ${activeSection === 'template' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('template')}>
            <span>Template</span>
            {activeSection === 'template' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {activeSection === 'template' && (
            <div className="accordion-body template-row">
              <button 
                className={`canva-template-btn ${settings.template === 'clean' ? 'active' : ''}`}
                onClick={() => applyTemplate('clean')}
              >
                Text Only
              </button>
              <button 
                className={`canva-template-btn ${settings.template === 'card' ? 'active' : ''}`}
                onClick={() => applyTemplate('card')}
              >
                White Label
              </button>
              <button 
                className={`canva-template-btn ${settings.template === 'glass' ? 'active' : ''}`}
                onClick={() => applyTemplate('glass')}
              >
                Glass Style
              </button>
            </div>
          )}
        </div>

        {/* Accordion Item: Position */}
        <div className={`accordion-item ${activeSection === 'position' ? 'expanded' : ''}`}>
          <div className="accordion-header" onClick={() => toggleSection('position')}>
            <span>Position</span>
            {activeSection === 'position' ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
          {activeSection === 'position' && (
            <div className="accordion-body">
              <p className="hint-text">Drag text on the image to move freely, or use snaps:</p>
              <div className="position-grid">
                <button className="canva-pos-btn" onClick={() => onChange({ ...settings, x: 50 })}>
                  <AlignCenter size={18} /> Center X
                </button>
                <button className="canva-pos-btn" onClick={() => onChange({ ...settings, y: 50 })}>
                  <AlignCenter size={18} /> Center Y
                </button>
                <button className="canva-pos-btn" onClick={() => onChange({ ...settings, x: 50, y: 50 })}>
                  <RotateCcw size={18} /> Reset
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
