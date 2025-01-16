"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Circle, Square, Type, Pencil, Eraser, Trash2, Triangle, ArrowRight } from 'lucide-react';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

type DrawingMode = 'freehand' | 'line' | 'circle' | 'rectangle' | 'triangle' | 'arrow' | 'text' | 'eraser';
type DrawingColor = 'yellow' | 'red' | 'white' | 'blue';

interface Point {
  x: number;
  y: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ width, height }) => {
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
  const drawHistoryRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    if (!canvas || !previewCanvas) return;

    canvas.width = width;
    canvas.height = height;
    previewCanvas.width = width;
    previewCanvas.height = height;
    
    const ctx = canvas.getContext('2d');
    const previewCtx = previewCanvas.getContext('2d');
    if (!ctx || !previewCtx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    previewCtx.strokeStyle = color;
    previewCtx.lineWidth = strokeWidth;
    previewCtx.lineCap = 'round';
    previewCtx.lineJoin = 'round';
    
    saveDrawState();
  }, [width, height]);

  useEffect(() => {
    const previewCtx = previewCanvasRef.current?.getContext('2d');
    if (previewCtx) {
      previewCtx.strokeStyle = color;
      previewCtx.lineWidth = strokeWidth;
    }
  }, [color, strokeWidth]);

  const saveDrawState = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const currentState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    drawHistoryRef.current = drawHistoryRef.current.slice(0, historyIndexRef.current + 1);
    drawHistoryRef.current.push(currentState);
    historyIndexRef.current++;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveDrawState();
  };

  const drawShape = (ctx: CanvasRenderingContext2D, start: Point, end: Point) => {
    ctx.beginPath();
    
    switch (mode) {
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

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'text') {
      setTextInputPosition({ x, y });
      setShowTextInput(true);
      setTextInput('');
      return;
    }

    setIsDrawing(true);
    setStartPoint({ x, y });

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (mode === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const previewCtx = previewCanvas?.getContext('2d');
    if (!canvas || !ctx || !previewCanvas || !previewCtx) return;

    const rect = canvas.getBoundingClientRect();
    const currentPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (mode === 'freehand' || mode === 'eraser') {
      ctx.lineTo(currentPoint.x, currentPoint.y);
      ctx.stroke();
    } else {
      // Clear preview canvas and draw shape preview
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
      previewCtx.strokeStyle = color;
      drawShape(previewCtx, startPoint, currentPoint);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    const previewCanvas = previewCanvasRef.current;
    const ctx = canvas?.getContext('2d');
    const previewCtx = previewCanvas?.getContext('2d');
    if (!canvas || !ctx || !previewCanvas || !previewCtx) return;

    const rect = canvas.getBoundingClientRect();
    const endPoint = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    if (mode !== 'freehand' && mode !== 'eraser') {
      drawShape(ctx, startPoint, endPoint);
      previewCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    }

    setIsDrawing(false);
    setStartPoint(null);
    saveDrawState();
  };

  const handleTextSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && textInput.trim()) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      ctx.font = '20px Arial';
      ctx.fillStyle = color;
      ctx.fillText(textInput, textInputPosition.x, textInputPosition.y);
      
      setShowTextInput(false);
      setTextInput('');
      saveDrawState();
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
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          style={{ touchAction: 'none' }}
        />
      </div>

      {showTextInput && (
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleTextSubmit}
          className="absolute bg-black/50 text-white px-2 py-1 outline-none border border-white/50 rounded"
          style={{
            left: textInputPosition.x,
            top: textInputPosition.y,
            transform: 'translateY(-100%)'
          }}
          autoFocus
        />
      )}

      {/* Drawing Tools */}
      <div className="absolute right-4 top-4 flex flex-col gap-2">
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
          onClick={() => setMode('eraser')}
          className={`p-2 rounded-full ${mode === 'eraser' ? 'bg-white text-black' : 'bg-black/50 text-white'}`}
        >
          <Eraser className="w-5 h-5" />
        </button>
        <button
          onClick={clearCanvas}
          className="p-2 rounded-full bg-black/50 text-white hover:bg-white hover:text-black"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Color Picker */}
      <div className="absolute right-16 top-4 flex flex-col gap-2">
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
};

export default DrawingCanvas;