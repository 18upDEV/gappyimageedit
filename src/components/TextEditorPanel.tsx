import React, { useState } from 'react';
import { X, Plus, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Italic, ChevronDown, ChevronUp } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState<string>('content');

  const toggleSection = (section: string) => {
    setActiveSection(prev => prev === section ? '' : section);
  };

  const handleLineChange = (id: string, updates: Partial<TextLine>) => {

    const newLines = settings.lines.map(line => 
      line.id === id ? { ...line, ...updates } : line
    );
    onChange({ ...settings, lines: newLines });
  };

  const addLine = () => {
    const newLine: TextLine = {
      id: Date.now().toString(),
      text: 'New Line',
      fontSize: 16,
      fontWeight: '400',
      italic: false,
      color: '#64748b',
      opacity: 1,
      letterSpacing: 0,
      textTransform: 'none'
    };
    onChange({ ...settings, lines: [...settings.lines, newLine] });
  };

  const removeLine = (id: string) => {
    if (settings.lines.length <= 1) return;
    onChange({ ...settings, lines: settings.lines.filter(l => l.id !== id) });
  };

  const applyTemplate = (template: 'clean' | 'card' | 'glass') => {
    const updates: Partial<OverlaySettings> = { template };
    
    if (template === 'clean') {
      updates.backgroundColor = 'transparent';
      updates.backgroundOpacity = 0;
      updates.shadow = false;
      updates.lines = settings.lines.map(l => ({ ...l, color: '#0f172a', opacity: 1 }));
    } else if (template === 'card') {
      updates.backgroundColor = '#ffffff';
      updates.backgroundOpacity = 0.98;
      updates.shadow = true;
      updates.lines = settings.lines.map((l, i) => ({ ...l, color: i === 0 ? '#0f172a' : '#64748b', opacity: 1 }));
    } else if (template === 'glass') {
      updates.backgroundColor = '#ffffff';
      updates.backgroundOpacity = 0.3;
      updates.shadow = true;
      updates.lines = settings.lines.map(l => ({ ...l, color: '#000000', opacity: 1 }));
    }
    
    onChange({ ...settings, ...updates });
  };

  return (
    <div className={`text-editor-panel ${isOpen ? '' : 'closed'}`}>
      <div className="editor-header">
        <h3>Customize Text Overlay</h3>
        <button className="close-editor-btn" onClick={onClose}>
          <X size={20} />
        </button>
      </div>

      <div className="editor-content">
        {/* Templates */}
        <div className={`editor-section ${activeSection === 'templates' ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('templates')}>
            <h4>Style Templates</h4>
            {activeSection === 'templates' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {activeSection === 'templates' && (
            <div className="section-body">
              <div className="template-grid">
                <button 
                  className={`template-option ${settings.template === 'clean' ? 'active' : ''}`}
                  onClick={() => applyTemplate('clean')}
                >
                  Clean
                </button>
                <button 
                  className={`template-option ${settings.template === 'card' ? 'active' : ''}`}
                  onClick={() => applyTemplate('card')}
                >
                  Professional
                </button>
                <button 
                  className={`template-option ${settings.template === 'glass' ? 'active' : ''}`}
                  onClick={() => applyTemplate('glass')}
                >
                  Glassmorphism
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className={`editor-section ${activeSection === 'content' ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('content')}>
            <h4>Text Content & Style</h4>
            {activeSection === 'content' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {activeSection === 'content' && (
            <div className="section-body">
              <div className="content-list">
                {settings.lines.map((line, index) => (
                  <div key={line.id} className="line-editor">
                    <div className="line-header">
                      <span className="line-label">Line {index + 1}</span>
                      <button className="remove-line-btn" onClick={() => removeLine(line.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <input 
                      className="line-input"
                      value={line.text}
                      onChange={(e) => handleLineChange(line.id, { text: e.target.value })}
                      placeholder="Enter text..."
                    />
                    <div className="line-controls">
                      <div className="control-item">
                        <label>Size</label>
                        <input 
                          type="number" 
                          value={line.fontSize}
                          onChange={(e) => handleLineChange(line.id, { fontSize: Number(e.target.value) })}
                        />
                      </div>
                      <div className="control-item">
                        <label>Opacity</label>
                        <input 
                          type="range" 
                          min="0" 
                          max="1" 
                          step="0.1"
                          value={line.opacity}
                          onChange={(e) => handleLineChange(line.id, { opacity: Number(e.target.value) })}
                        />
                      </div>
                      <div className="control-item">
                        <label>Color</label>
                        <input 
                          type="color" 
                          value={line.color}
                          onChange={(e) => handleLineChange(line.id, { color: e.target.value })}
                        />
                      </div>
                      <div className="control-item">
                        <label>Spacing</label>
                        <input 
                          type="number" 
                          step="0.1"
                          value={line.letterSpacing}
                          onChange={(e) => handleLineChange(line.id, { letterSpacing: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                    <div className="toggle-group">
                      <button 
                        className={`toggle-btn ${line.fontWeight === '700' ? 'active' : ''}`}
                        onClick={() => handleLineChange(line.id, { fontWeight: line.fontWeight === '700' ? '400' : '700' })}
                        title="Bold"
                      >
                        <Bold size={14} />
                      </button>
                      <button 
                        className={`toggle-btn ${line.italic ? 'active' : ''}`}
                        onClick={() => handleLineChange(line.id, { italic: !line.italic })}
                        title="Italic"
                      >
                        <Italic size={14} />
                      </button>
                      <button 
                        className={`toggle-btn ${line.textTransform === 'uppercase' ? 'active' : ''}`}
                        onClick={() => handleLineChange(line.id, { textTransform: line.textTransform === 'uppercase' ? 'none' : 'uppercase' })}
                      >
                        ABC
                      </button>
                    </div>
                  </div>
                ))}
                <button className="add-line-btn" onClick={addLine}>
                  <Plus size={16} /> Add Custom Text Line
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Typography */}
        <div className={`editor-section ${activeSection === 'global' ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('global')}>
            <h4>Global Layout</h4>
            {activeSection === 'global' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {activeSection === 'global' && (
            <div className="section-body">
              <div className="settings-grid">
                <div className="control-item">
                  <label>Alignment</label>
                  <div className="toggle-group">
                    <button 
                      className={`toggle-btn ${settings.alignment === 'left' ? 'active' : ''}`}
                      onClick={() => onChange({ ...settings, alignment: 'left' })}
                    >
                      <AlignLeft size={16} />
                    </button>
                    <button 
                      className={`toggle-btn ${settings.alignment === 'center' ? 'active' : ''}`}
                      onClick={() => onChange({ ...settings, alignment: 'center' })}
                    >
                      <AlignCenter size={16} />
                    </button>
                    <button 
                      className={`toggle-btn ${settings.alignment === 'right' ? 'active' : ''}`}
                      onClick={() => onChange({ ...settings, alignment: 'right' })}
                    >
                      <AlignRight size={16} />
                    </button>
                  </div>
                </div>
                <div className="control-item">
                  <label>Line Spacing</label>
                  <input 
                    type="range" 
                    min="0.8" 
                    max="2.5" 
                    step="0.1" 
                    value={settings.lineSpacing}
                    onChange={(e) => onChange({ ...settings, lineSpacing: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="settings-grid" style={{ marginTop: '1.25rem' }}>
                <div className="control-item">
                  <label>Text Shadow</label>
                  <button 
                    className={`toggle-btn ${settings.shadow ? 'active' : ''}`}
                    onClick={() => onChange({ ...settings, shadow: !settings.shadow, outline: false })}
                  >
                    Toggle Shadow
                  </button>
                </div>
                <div className="control-item">
                  <label>Text Outline</label>
                  <button 
                    className={`toggle-btn ${settings.outline ? 'active' : ''}`}
                    onClick={() => onChange({ ...settings, outline: !settings.outline, shadow: false })}
                  >
                    Toggle Outline
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Background & Border */}
        <div className={`editor-section ${activeSection === 'background' ? 'expanded' : ''}`}>
          <div className="section-header" onClick={() => toggleSection('background')}>
            <h4>Background & Border</h4>
            {activeSection === 'background' ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
          {activeSection === 'background' && (
            <div className="section-body">
              <div className="settings-grid">
                <div className="control-item">
                  <label>BG Color</label>
                  <input 
                    type="color" 
                    value={settings.backgroundColor === 'transparent' ? '#ffffff' : settings.backgroundColor}
                    onChange={(e) => onChange({ ...settings, backgroundColor: e.target.value })}
                  />
                </div>
                <div className="control-item">
                  <label>Opacity</label>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={settings.backgroundOpacity}
                    onChange={(e) => onChange({ ...settings, backgroundOpacity: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="settings-grid" style={{ marginTop: '1.25rem' }}>
                <div className="control-item">
                  <label>Border Width</label>
                  <select 
                      value={settings.borderWidth || 0}
                      onChange={(e) => onChange({ ...settings, borderWidth: Number(e.target.value) })}
                    >
                      <option value="0">0px (None)</option>
                      <option value="1">1px</option>
                      <option value="2">2px</option>
                      <option value="3">3px</option>
                      <option value="5">5px</option>
                  </select>
                </div>
                <div className="control-item">
                  <label>Border Color</label>
                  <input 
                    type="color" 
                    value={settings.borderColor || '#e2e8f0'}
                    onChange={(e) => onChange({ ...settings, borderColor: e.target.value })}
                  />
                </div>
              </div>
              <div className="control-item" style={{ marginTop: '1.25rem' }}>
                <label>Quick Position</label>
                <div className="pos-buttons">
                  <button className="action-btn" onClick={() => onChange({ ...settings, x: 50 })}>
                    Center Horizontally
                  </button>
                  <button className="action-btn" onClick={() => onChange({ ...settings, y: 50 })}>
                    Center Vertically
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextEditorPanel;
