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
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Montserrat">Montserrat</option>
                    <option value="Kanit">Kanit (Thai)</option>
                    <option value="Prompt">Prompt (Thai)</option>
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
                onClick={() => onChange({ ...settings, template: 'clean' })}
              >
                Text Only
              </button>
              <button 
                className={`canva-template-btn ${settings.template === 'card' ? 'active' : ''}`}
                onClick={() => onChange({ ...settings, template: 'card' })}
              >
                White Label
              </button>
              <button 
                className={`canva-template-btn ${settings.template === 'glass' ? 'active' : ''}`}
                onClick={() => onChange({ ...settings, template: 'glass' })}
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
