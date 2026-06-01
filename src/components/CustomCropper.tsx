import React, { useState, useRef, useEffect } from 'react';
import './CustomCropper.css';

export interface GridData {
  v: number[]; // [left, v1, v2, right] as percentages of image
  h: number[]; // [top, h1, h2, bottom] as percentages of image
  pixelCrop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface CustomCropperProps {
  image: string;
  zoom: number;
  rotation: number;
  onCropChange: (data: GridData) => void;
  initialData?: GridData;
  aspectRatio?: number;
}

const CustomCropper: React.FC<CustomCropperProps> = ({
  image,
  zoom,
  rotation,
  onCropChange,
  initialData,
  aspectRatio,
}) => {
  // Coordinates as percentages (0-100) of the container
  // v[0]=left, v[1]=guide1, v[2]=guide2, v[3]=right
  // h[0]=top, h[1]=guide1, h[2]=guide2, h[3]=bottom
  const [vCoords, setVCoords] = useState<number[]>(initialData?.v || [10, 36.6, 63.3, 90]);
  const [hCoords, setHCoords] = useState<number[]>(initialData?.h || [10, 36.6, 63.3, 90]);
  const [useAspect, setUseAspect] = useState(!!aspectRatio);
  
  const [dragInfo, setDragInfo] = useState<{
    type: 'v' | 'h' | 'corner' | 'intersection';
    indices: number[];
  } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Notify parent of the grid state
  useEffect(() => {
    if (!imageRef.current || !containerRef.current) return;
    
    const { naturalWidth, naturalHeight } = imageRef.current;
    const rect = imageRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    // Calculate image position relative to container in percentages
    const imgL = ((rect.left - containerRect.left) / containerRect.width) * 100;
    const imgT = ((rect.top - containerRect.top) / containerRect.height) * 100;
    const imgW = (rect.width / containerRect.width) * 100;
    const imgH = (rect.height / containerRect.height) * 100;

    // Map vCoords/hCoords (container %) to image relative %
    const mapToImg = (val: number, start: number, size: number) => {
        return Math.max(0, Math.min(100, ((val - start) / size) * 100));
    };

    const pixelCrop = {
      x: (mapToImg(vCoords[0], imgL, imgW) / 100) * naturalWidth,
      y: (mapToImg(hCoords[0], imgT, imgH) / 100) * naturalHeight,
      width: ((vCoords[3] - vCoords[0]) / imgW) * naturalWidth,
      height: ((hCoords[3] - hCoords[0]) / imgH) * naturalHeight,
    };

    // Also pass the relative grid lines for the preview overlay
    const relativeGrid = {
        v: vCoords.map(v => mapToImg(v, vCoords[0], vCoords[3] - vCoords[0])),
        h: hCoords.map(h => mapToImg(h, hCoords[0], hCoords[3] - hCoords[0])),
    };

    onCropChange({ 
      v: vCoords, 
      h: hCoords,
      pixelCrop,
      relativeGrid
    } as any);
  }, [vCoords, hCoords, onCropChange, zoom, rotation]);

  const handlePointerDown = (e: React.PointerEvent, type: any, indices: number[]) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDragInfo({ type, indices });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragInfo || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const minGap = 5; // Minimum 5% gap between lines

    if (dragInfo.type === 'v' || dragInfo.type === 'corner' || dragInfo.type === 'intersection') {
      const newV = [...vCoords];
      dragInfo.indices.forEach(idx => {
        const prev = idx > 0 ? newV[idx - 1] + minGap : 0;
        const next = idx < 3 ? newV[idx + 1] - minGap : 100;
        newV[idx] = Math.max(prev, Math.min(next, x));
      });

      // Aspect ratio constraint for outer box
      if (useAspect && aspectRatio && dragInfo.type === 'corner') {
        const width = newV[3] - newV[0];
        const targetHeight = width / aspectRatio;
        const newH = [...hCoords];
        
        // Adjust bottom or top based on which corner is dragged
        const [vi, hi] = dragInfo.indices;
        if (vi === 3 && hi === 3) { // SE
            newH[3] = Math.min(100, newH[0] + targetHeight);
        } else if (vi === 0 && hi === 0) { // NW
            newH[0] = Math.max(0, newH[3] - targetHeight);
        } else if (vi === 3 && hi === 0) { // NE
            newH[0] = Math.max(0, newH[3] - targetHeight);
        } else if (vi === 0 && hi === 3) { // SW
            newH[3] = Math.min(100, newH[0] + targetHeight);
        }
        setHCoords(newH);
      }
      setVCoords(newV);
    } else if (dragInfo.type === 'h') {
      const newH = [...hCoords];
      dragInfo.indices.forEach(idx => {
        const prev = idx > 0 ? newH[idx - 1] + minGap : 0;
        const next = idx < 3 ? newH[idx + 1] - minGap : 100;
        newH[idx] = Math.max(prev, Math.min(next, y));
      });
      setHCoords(newH);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (dragInfo) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      setDragInfo(null);
    }
  };

  return (
    <div 
      className="custom-cropper-container" 
      ref={containerRef}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <div 
        className="image-wrapper"
        style={{
          transform: `scale(${zoom}) rotate(${rotation}deg)`,
        }}
      >
        <img 
          src={image} 
          alt="To crop" 
          ref={imageRef} 
          draggable={false}
          onLoad={() => {
            // Trigger a re-render to ensure onCropComplete is called with natural dimensions
            setVCoords([...vCoords]);
          }}
        />
      </div>

      <div className="crop-overlay">
        {/* Darkened areas around the crop box */}
        <div className="overlay-mask top" style={{ height: `${hCoords[0]}%` }} />
        <div className="overlay-mask bottom" style={{ top: `${hCoords[3]}%` }} />
        <div 
          className="overlay-mask left" 
          style={{ 
            top: `${hCoords[0]}%`, 
            height: `${hCoords[3] - hCoords[0]}%`, 
            width: `${vCoords[0]}%` 
          }} 
        />
        <div 
          className="overlay-mask right" 
          style={{ 
            top: `${hCoords[0]}%`, 
            height: `${hCoords[3] - hCoords[0]}%`, 
            left: `${vCoords[3]}%` 
          }} 
        />

        {/* The interactive grid */}
        <div 
          className="grid-box"
          style={{
            left: `${vCoords[0]}%`,
            top: `${hCoords[0]}%`,
            width: `${vCoords[3] - vCoords[0]}%`,
            height: `${hCoords[3] - hCoords[0]}%`,
          }}
        >
          {/* Internal Lines */}
          {[1, 2].map(i => (
            <React.Fragment key={`lines-${i}`}>
              <div 
                className="grid-line vertical"
                style={{ left: `${((vCoords[i] - vCoords[0]) / (vCoords[3] - vCoords[0])) * 100}%` }}
                onPointerDown={(e) => handlePointerDown(e, 'v', [i])}
              />
              <div 
                className="grid-line horizontal"
                style={{ top: `${((hCoords[i] - hCoords[0]) / (hCoords[3] - hCoords[0])) * 100}%` }}
                onPointerDown={(e) => handlePointerDown(e, 'h', [i])}
              />
            </React.Fragment>
          ))}

          {/* Border Handles */}
          <div className="border-handle top" onPointerDown={(e) => handlePointerDown(e, 'h', [0])} />
          <div className="border-handle bottom" onPointerDown={(e) => handlePointerDown(e, 'h', [3])} />
          <div className="border-handle left" onPointerDown={(e) => handlePointerDown(e, 'v', [0])} />
          <div className="border-handle right" onPointerDown={(e) => handlePointerDown(e, 'v', [3])} />

          {/* Aspect Toggle */}
          {aspectRatio && (
            <div 
              className={`aspect-toggle ${useAspect ? 'active' : ''}`}
              onClick={() => setUseAspect(!useAspect)}
              title="Toggle Fixed Aspect Ratio"
              style={{
                position: 'absolute',
                top: '-35px',
                right: '0',
                backgroundColor: useAspect ? '#2563eb' : '#fff',
                color: useAspect ? '#fff' : '#2563eb',
                border: '1px solid #2563eb',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '12px',
                cursor: 'pointer',
                pointerEvents: 'auto',
                zIndex: 30,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              {useAspect ? '🔒 Aspect Locked' : '🔓 Aspect Free'}
            </div>
          )}

          {/* Corner Handles */}
          <div className="corner-handle nw" onPointerDown={(e) => handlePointerDown(e, 'corner', [0, 0])} />
          <div className="corner-handle ne" onPointerDown={(e) => handlePointerDown(e, 'corner', [3, 0])} />
          <div className="corner-handle sw" onPointerDown={(e) => handlePointerDown(e, 'corner', [0, 3])} />
          <div className="corner-handle se" onPointerDown={(e) => handlePointerDown(e, 'corner', [3, 3])} />
          
          {/* Intersection Handles (Visual only for now, or could drag both) */}
          {[1, 2].map(vi => [1, 2].map(hi => (
            <div 
              key={`inter-${vi}-${hi}`}
              className="intersection-handle"
              style={{
                left: `${((vCoords[vi] - vCoords[0]) / (vCoords[3] - vCoords[0])) * 100}%`,
                top: `${((hCoords[hi] - hCoords[0]) / (hCoords[3] - hCoords[0])) * 100}%`,
              }}
              onPointerDown={(e) => handlePointerDown(e, 'intersection', [vi, hi])}
            />
          )))}
        </div>
      </div>
    </div>
  );
};

export default CustomCropper;
