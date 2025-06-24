import { useEffect, useRef } from "react";

const width = 128;
const height = 128;

const bars = 64;
const bar_width = 1;
const radius = 0;
const center_x = width / 2;
const center_y = height / 2;

function drawBar(x1 = 0, y1 = 0, x2 = 0, y2 = 0, frequency, ctx, gradient) {
  ctx.fillStyle = gradient;

  const lineColor = "rgb(" + frequency + ", " + frequency + ", " + 205 + ")";
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = bar_width;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function animationLooper(canvas, frequencyArray) {
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, "rgba(35, 7, 77, 1)");
  gradient.addColorStop(1, "rgba(204, 83, 51, 1)");

  for (var i = 0; i < bars; i++) {
    //divide a circle into equal part
    const rads = (Math.PI * 2) / bars;

    // Math is magical
    const bar_height = frequencyArray[i] / 3;

    const x = center_x + Math.cos(rads * i) * radius;
    const y = center_y + Math.sin(rads * i) * radius;
    const x_end = center_x + Math.cos(rads * i) * (radius + bar_height);
    const y_end = center_y + Math.sin(rads * i) * (radius + bar_height);

    //draw a bar
    drawBar(x, y, x_end, y_end, frequencyArray[i], ctx, gradient);
  }
}

export const SoundVisualizer = ({ isSessionActive, audioStream }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioStream || !isSessionActive || !canvasRef.current) {
      return;
    }
    const audioCtx = new AudioContext();
    const audioAnalyzer = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(audioStream);
    source.connect(audioAnalyzer);
    audioAnalyzer.fftSize = 128;
    
    const frequencyData = new Uint8Array(audioAnalyzer.frequencyBinCount);

    let requestAnimationFrameId;

    function visualizeSoundData() {
      if (!isSessionActive) {
        return;
      }
      audioAnalyzer.getByteTimeDomainData(frequencyData);
      animationLooper(canvasRef.current, frequencyData);
      requestAnimationFrameId = requestAnimationFrame(visualizeSoundData);
    }
    visualizeSoundData();

    return () => {
      if (requestAnimationFrameId) {
        cancelAnimationFrame(requestAnimationFrameId);
      }
    };
  }, [audioStream, canvasRef.current, isSessionActive]);

  return (
    <canvas ref={canvasRef} width={width} height={height}></canvas>
  );
};
