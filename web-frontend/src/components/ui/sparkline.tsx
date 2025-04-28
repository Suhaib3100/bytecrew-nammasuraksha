"use client";

import * as React from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function Sparkline({ 
  data, 
  color = "currentColor", 
  height = 30, 
  width = 100 
}: SparklineProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set line style
    ctx.strokeStyle = color === "green" ? "#22c55e" : color === "red" ? "#ef4444" : color;
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    
    // Find min and max values for scaling
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1; // Avoid division by zero
    
    // Calculate scaling factors
    const xScale = canvas.width / (data.length - 1);
    const yScale = (canvas.height - 4) / range; // Leave a small padding
    
    // Start drawing
    ctx.beginPath();
    
    // Move to first point
    ctx.moveTo(0, canvas.height - ((data[0] - min) * yScale) - 2);
    
    // Draw lines to each point
    for (let i = 1; i < data.length; i++) {
      const x = i * xScale;
      const y = canvas.height - ((data[i] - min) * yScale) - 2; // -2 for padding
      ctx.lineTo(x, y);
    }
    
    ctx.stroke();
  }, [data, color]);
  
  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      className="inline-block"
    />
  );
}