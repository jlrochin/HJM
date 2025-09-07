"use client";

// ============================================================================
// COMPONENTE: FONDO ANIMADO
// ============================================================================
// Este componente crea un fondo animado interactivo usando Canvas API
// Incluye:
// - Partículas flotantes con movimiento oscilatorio
// - Gradiente radial que sigue al cursor
// - Efectos de sombra y transparencia
// - Redimensionamiento automático del canvas
// ============================================================================

import { useEffect, useRef } from "react";

// ============================================================================
// INTERFACES Y TIPOS
// ============================================================================
interface Particle {
  baseX: number;      // Posición base X de la partícula
  baseY: number;      // Posición base Y de la partícula
  x: number;          // Posición actual X
  y: number;          // Posición actual Y
  size: number;       // Tamaño de la partícula
  color: string;      // Color de la partícula
  angle: number;      // Ángulo para el movimiento oscilatorio
  speed: number;      // Velocidad de movimiento
}

interface MousePosition {
  x: number;
  y: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL: FONDO ANIMADO
// ============================================================================
export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!canvas) return;

    // ============================================================================
    // FUNCIÓN: REDIMENSIONAR CANVAS
    // ============================================================================
    // Ajusta el tamaño del canvas al tamaño de la ventana
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // ============================================================================
    // CONFIGURACIÓN: PARTÍCULAS Y COLORES
    // ============================================================================
    const particles: Particle[] = [];

    // Paleta de colores para las partículas
    const colors = [
      "rgba(59,130,246,0.7)",   // Azul
      "rgba(99,102,241,0.7)",   // Índigo
      "rgba(139,92,246,0.7)",   // Púrpura
      "rgba(16,185,129,0.7)",   // Verde
      "rgba(236,72,153,0.7)",   // Rosa
    ];

    // ============================================================================
    // CREACIÓN: DISTRIBUCIÓN UNIFORME DE PARTÍCULAS
    // ============================================================================
    // Calcula el número de partículas basado en el área de la pantalla
    const area = canvas.width * canvas.height;
    const density = 0.00003; // Densidad reducida para mejor rendimiento
    const numParticles = Math.floor(area * density);
    const gridSize = Math.ceil(Math.sqrt(numParticles));
    const cellWidth = canvas.width / gridSize;
    const cellHeight = canvas.height / gridSize;

    // Crea partículas en una cuadrícula uniforme con desplazamiento aleatorio
    for (let gx = 0; gx < gridSize; gx++) {
      for (let gy = 0; gy < gridSize; gy++) {
        // Posición base en la celda con desplazamiento aleatorio
        const baseX = gx * cellWidth +
          cellWidth / 2 +
          (Math.random() - 0.5) * cellWidth * 0.5;
        const baseY = gy * cellHeight +
          cellHeight / 2 +
          (Math.random() - 0.5) * cellHeight * 0.5;

        particles.push({
          baseX,
          baseY,
          x: baseX,
          y: baseY,
          size: Math.random() * 14 + 6,        // Tamaño entre 6-20px
          color: colors[Math.floor(Math.random() * colors.length)],
          angle: Math.random() * Math.PI * 2,  // Ángulo aleatorio inicial
          speed: Math.random() * 1.2 + 0.3,   // Velocidad entre 0.3-1.5
        });
      }
    }

    // ============================================================================
    // CONFIGURACIÓN: POSICIÓN DEL CURSOR
    // ============================================================================
    let mouse: MousePosition = {
      x: canvas.width / 2,
      y: canvas.height / 2
    };

    // ============================================================================
    // FUNCIÓN: ANIMACIÓN PRINCIPAL
    // ============================================================================
    const animate = () => {
      if (!ctx) return;

      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ============================================================================
      // FONDO: GRADIENTE RADIAL
      // ============================================================================
      // Crea un gradiente radial que sigue al cursor
      const gradient = ctx.createRadialGradient(
        mouse.x, mouse.y, 100,                    // Centro del gradiente (cursor)
        canvas.width / 2, canvas.height / 2,      // Centro de la pantalla
        Math.max(canvas.width, canvas.height) / 1.2 // Radio del gradiente
      );

      gradient.addColorStop(0, "rgba(59,130,246,0.15)");   // Azul en el centro
      gradient.addColorStop(0.5, "rgba(139,92,246,0.10)"); // Púrpura en medio
      gradient.addColorStop(1, "rgba(255,255,255,0.05)");  // Blanco transparente

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // ============================================================================
      // DIBUJO: PARTÍCULAS ANIMADAS
      // ============================================================================
      particles.forEach((particle) => {
        // Movimiento oscilatorio suave
        particle.angle += 0.005 * particle.speed;
        const oscillationX = Math.sin(particle.angle) * 18;  // Amplitud X
        const oscillationY = Math.cos(particle.angle) * 18;  // Amplitud Y

        // Actualizar posición con movimiento oscilatorio
        particle.x = particle.baseX + oscillationX;
        particle.y = particle.baseY + oscillationY;

        // Dibujar partícula
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;

        // Efecto de sombra
        ctx.shadowColor = particle.color;
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Continuar animación
      requestAnimationFrame(animate);
    };

    // Iniciar animación
    animate();

    // ============================================================================
    // LIMPIEZA: REMOVER EVENT LISTENERS
    // ============================================================================
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  // ============================================================================
  // RENDER: CANVAS ANIMADO
  // ============================================================================
  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
    />
  );
}
