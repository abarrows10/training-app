"use client";

import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { Circle, Square, Type, Pencil, Trash2, Triangle, ArrowRight, Undo } from 'lucide-react';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

type DrawingMode = 'freehand' | 'line' | 'circle' | 'rectangle' | 'triangle' | 'arrow' | 'text';
type DrawingColor = 'yellow' | 'red' | 'white' | 'blue';

interface Point {
  x: number;
  y: number;
}

interface Drawing {
  mode: DrawingMode;
  color: DrawingColor;
  points: Point[];
  text?: string;
}

const DrawingCanvas = forwardRef<any, DrawingCanvasProps>(({ width, height }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<DrawingMode>('freehand');
  const [color, setColor] = useState<DrawingColor>('yellow');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputPosition, setTextInputPosition] = useState<Point>({ x: 0, y: 0 });
  const [textInput, setTextInput] = useState('');
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [currentDrawing, setCurrentDrawing] = useState<Point[]>([]);

  useImperativeHandle(ref, () => ({
    getDrawings: () => drawings,
    clearDrawings: clearCanvas
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;

    canvas.width = width;
    canvas.height = height;
    previewCanvas.width = width;
    previewCanvas.height = height;
  }, [width, height]);

  useEffect(() => {
    redrawCanvas();
  }, [drawings]);

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawings.forEach(drawing => {
      ctx.strokeStyle = drawing.color;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (drawing.mode === 'text' && drawing.text) {
        ctx.font = '20px Arial';
        ctx.fillStyle = drawing.color;
        ctx.fillText(drawing.text, drawing.points[0].x, drawing.points[0].y);
      } else {
        drawShape(ctx, drawing.mode, drawing.points[0], drawing.points[1]);
      }
    });
  };

  const getCoordinates = (e: React.TouchEvent | React.MouseEvent | TouchEvent | MouseEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as MouseEvent).clientX;
      clientY = (e as MouseEvent).clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    if (confirm('Are you sure you want to clear all drawings?')) {
      setDrawings([]);
      const canvas = canvasRef.current;
      const previewCanvas = previewCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      const previewCtx = previewCanvas?.getContext('2d');
      
      if (ctx) ctx.clearRect(0, 0, width, height);
      if (previewCtx) previewCtx.clearRect(0, 0, width, height);
    }
  };

  const undoLastDrawing = () => {
    setDrawings(prev => prev.slice(0, -1));
  };

  const drawShape = (ctx: CanvasRenderingContext2D, mode: DrawingMode, start: Point, end: Point) => {
    if (!start || !end) return;

    ctx.beginPath();
    
    switch (mode) {
      case 'freehand':
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        break;
        
      case 'line':
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        break;
        
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        );
        ctx.arc(start.x, start.y, radius, 0, 2 * Math.PI);
        break;
        
      case 'rectangle':
        const width = end.x - start.x;
        const height = end.y - start.y;
        ctx.rect(start.x, start.y, width, height);
        break;
        
      case 'triangle':
        ctx.moveTo(start.x, end.y);
        ctx.lineTo(start.x + (end.x - start.x) / 2, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.closePath();
        break;
        
      case 'arrow':
        const angle = Math.atan2(end.y - start.y, end.x - start.x);
        const headLength = 20;
        
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        
        ctx.lineTo(
          end.x - headLength * Math.cos(angle - Math.PI / 6),
          end.y - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(end.x, end.y);
        ctx.lineTo(
          end.x - headLength * Math.cos(angle + Math.PI / 6),
          end.y - headLength * Math.sin(angle + Math.PI / 6)
        );
        break;
    }
    
    ctx.stroke();
  };

  const startDrawing = (e: React.TouchEvent | React.MouseEvent) => {
    const point = getCoordinates(e);
    if (!point) return;

    if (mode === 'text') {
      setTextInputPosition(point);
      setShowTextInput(true);
      setTextInput('');
      return;
    }

    setIsDrawing(true);
    setStartPoint(point);
    setCurrentDrawing([point]);
  };

  const draw = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const point = getCoordinates(e);
    if (!point) return;

    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas?.getContext('2d');
    
    if (!previewCanvas || !previewCtx) return;

    previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    previewCtx.strokeStyle = color;
    previewCtx.lineWidth = strokeWidth;
    previewCtx.lineCap = 'round';
    previewCtx.lineJoin = 'round';

    drawShape(previewCtx, mode, startPoint, point);
    setCurrentDrawing([startPoint, point]);
  };

  const stopDrawing = () => {
    if (!isDrawing || !startPoint || currentDrawing.length < 2) return;
    
    setDrawings(prev => [...prev, {
      mode,
      color,
      points: currentDrawing
    }]);

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentDrawing([]);

    const previewCanvas = previewCanvasRef.current;
    const previewCtx = previewCanvas?.getContext('2d');
    if (previewCtx) previewCtx.clearRect(0, 0, width, height);
  };

  const handleText = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && textInput.trim() && textInputPosition) {
      setDrawings(prev => [...prev, {
        mode: 'text',
        color,
        points: [textInputPosition],
        text: textInput
      }]);
      
      setShowTextInput(false);
      setTextInput('');
    }
  };

  return (
    <>
      <div className="absolute inset-0 pointer-events-auto">
        <canvas
          ref={previewCanvasRef}
          className="absolute inset-0"
          style={{ pointerEvents: 'none' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ touchAction: 'none' }}
        />
      </div>

      {showTextInput && (
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleText}
          className="absolute bg-black/50 text-white px-2 py-1 outline-none border border-white/50 rounded z-50"
          style={{
            left: textInputPosition.x,
            top: textInputPosition.y,
            transform: 'translateY(-100%)'
          }}
          autoFocus
        />
      )}

      {/* Drawing Tools */}
      <div className="absolute right-4 top-28 flex flex-col gap-2">
        <button
          onClick={() => setMode('freehand')}
          className={`p-2 rounded-full ${mode === 'freehand' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          <Pencil className="w-5 h-5" />
        </button>
        <button
          onClick={() => setMode('line')}
          className={`p-2 rounded-full ${mode === 'line' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          <div className="w-5 h-5 rotate-45 border-b-2" />
        </button>
        <button
          onClick={() => setMode('circle')}
          className={`p-2 rounded-full ${mode === 'circle' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          <Circle className="w-5 h-5" />
        </button>
        <button
          onClick={() => setMode('rectangle')}
          className={`p-2 rounded-full ${mode === 'rectangle' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          <Square className="w-5 h-5" />
        </button>
        <button
          onClick={() => setMode('triangle')}
          className={`p-2 rounded-full ${mode === 'triangle' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          <Triangle className="w-5 h-5" />
        </button>
        <button
          onClick={() => setMode('arrow')}
          className={`p-2 rounded-full ${mode === 'arrow' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          <ArrowRight className="w-5 h-5" />
        </button>
        <button
          onClick={() => setMode('text')}
          className={`p-2 rounded-full ${mode === 'text' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          <Type className="w-5 h-5" />
        </button>
        <button
          onClick={undoLastDrawing}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black"
        >
          <Undo className="w-5 h-5" />
        </button>
        <button
          onClick={clearCanvas}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Color Picker */}
      <div className="absolute right-16 top-28 flex flex-col gap-2">
        {['yellow', 'red', 'white', 'blue'].map((c) => (
          <button
            key={c}
            onClick={() => setColor(c as DrawingColor)}
            className={`w-8 h-8 rounded-full border-2 ${
              color === c ? 'border-white' : 'border-transparent'
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </>
  );
});

DrawingCanvas.displayName = 'DrawingCanvas';

export default DrawingCanvas;