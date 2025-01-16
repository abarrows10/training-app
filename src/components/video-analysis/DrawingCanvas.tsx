"use client";

import React, { useRef, useEffect, useState } from 'react';
import { Circle, Square, Type, Pencil, Eraser, Trash2 } from 'lucide-react';

interface DrawingCanvasProps {
  width: number;
  height: number;
}

type DrawingMode = 'freehand' | 'line' | 'circle' | 'text' | 'eraser';
type DrawingColor = 'yellow' | 'red' | 'white' | 'blue';

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [mode, setMode] = useState<DrawingMode>('freehand');
  const [color, setColor] = useState<DrawingColor>('yellow');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const drawHistoryRef = useRef<ImageData[]>([]);
  const historyIndexRef = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = color;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    // Save initial blank canvas state
    saveDrawState();
  }, [width, height]);

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

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
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
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'freehand' || mode === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !startPoint) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (mode === 'line') {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (mode === 'circle') {
      const radius = Math.sqrt(
        Math.pow(x - startPoint.x, 2) + Math.pow(y - startPoint.y, 2)
      );
      ctx.beginPath();
      ctx.arc(startPoint.x, startPoint.y, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    setIsDrawing(false);
    setStartPoint(null);
    saveDrawState();
  };

  return (
    <div className="absolute inset-0 pointer-events-auto">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{ touchAction: 'none' }}
      />

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
    </div>
  );
};

export default DrawingCanvas;