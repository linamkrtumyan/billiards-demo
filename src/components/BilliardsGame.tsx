import React, { useEffect, useRef, useState } from "react";
import { ColorPickerMenu } from "./ColorMenu";

const BilliardsGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ballsRef = useRef<any[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const [selectedBallIndex, setSelectedBallIndex] = useState<number | null>(
    null
  );
  const [menuVisible, setMenuVisible] = useState<boolean>(false);

  const renderColorPickerMenu = (x: number, y: number) => {
    return (
      <div style={{ position: "absolute", top: y, left: x }}>
        <ColorPickerMenu onChange={handleColorChange} />
      </div>
    );
  };

  const handleColorChange = (color: string) => {
    if (selectedBallIndex !== null) {
      ballsRef.current[selectedBallIndex].color = color;
      setMenuVisible(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const balls = [
      {
        x: canvasWidth / 4,
        y: canvasHeight / 4,
        radius: 20,
        color: "red",
        dx: 0,
        dy: 0,
      },
      {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        radius: 20,
        color: "blue",
        dx: 0,
        dy: 0,
      },
      {
        x: (3 * canvasWidth) / 4,
        y: (3 * canvasHeight) / 4,
        radius: 20,
        color: "green",
        dx: 0,
        dy: 0,
      },
    ];

    const generateRandomBall = () => {
      const radius = Math.random() * 20 + 10;
      const x = Math.random() * (canvasWidth - 2 * radius) + radius;
      const y = Math.random() * (canvasHeight - 2 * radius) + radius;
      const dx = 0;
      const dy = 0;
      const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      })`;

      return { x, y, radius, color, dx, dy };
    };

    for (let i = 0; i < 50; i++) {
      balls.push(generateRandomBall());
    }

    ballsRef.current = balls;

    const render = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ballsRef.current.forEach((ball) => {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.fillStyle = ball.color;
        ctx.fill();
        ctx.closePath();
      });
    };

    const update = () => {
      ballsRef.current.forEach((ball, index) => {
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Friction or air resistance
        ball.dx *= 0.99;
        ball.dy *= 0.99;

        // Collision detection with walls
        if (ball.x - ball.radius < 0) {
          ball.x = ball.radius;
          ball.dx = -ball.dx; // Reverse direction with no energy loss
        }
        if (ball.x + ball.radius > canvasWidth) {
          ball.x = canvasWidth - ball.radius;
          ball.dx = -ball.dx; // Reverse direction with no energy loss
        }
        if (ball.y - ball.radius < 0) {
          ball.y = ball.radius;
          ball.dy = -ball.dy; // Reverse direction with no energy loss
        }
        if (ball.y + ball.radius > canvasHeight) {
          ball.y = canvasHeight - ball.radius;
          ball.dy = -ball.dy; // Reverse direction with no energy loss
        }

        // Collision detection among balls
        for (let i = index + 1; i < ballsRef.current.length; i++) {
          const otherBall = ballsRef.current[i];
          const dx = otherBall.x - ball.x;
          const dy = otherBall.y - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDistance = ball.radius + otherBall.radius;

          if (distance < minDistance) {
            // Calculate the unit normal and unit tangent vectors
            const nx = dx / distance;
            const ny = dy / distance;
            const tx = -ny;
            const ty = nx;

            // Calculate the velocities in normal and tangent directions
            const v1n = ball.dx * nx + ball.dy * ny;
            const v1t = ball.dx * tx + ball.dy * ty;
            const v2n = otherBall.dx * nx + otherBall.dy * ny;
            const v2t = otherBall.dx * tx + otherBall.dy * ty;

            // Calculate the new normal velocities after collision (1D collision)
            const m1 = 1; // Mass of ball 1 (assuming equal masses)
            const m2 = 1; // Mass of ball 2 (assuming equal masses)
            const v1nAfter = (v1n * (m1 - m2) + 2 * m2 * v2n) / (m1 + m2);
            const v2nAfter = (v2n * (m2 - m1) + 2 * m1 * v1n) / (m1 + m2);

            // Update the velocities after collision
            ball.dx = v1nAfter * nx + v1t * tx;
            ball.dy = v1nAfter * ny + v1t * ty;
            otherBall.dx = v2nAfter * nx + v2t * tx;
            otherBall.dy = v2nAfter * ny + v2t * ty;

            // Move the balls apart so they don't overlap
            const overlap = minDistance - distance;
            const moveX = overlap * nx * 0.5;
            const moveY = overlap * ny * 0.5;
            ball.x -= moveX;
            ball.y -= moveY;
            otherBall.x += moveX;
            otherBall.y += moveY;
          }
        }
      });

      render();
    };

    const mouseMoveHandler = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    };

    const mouseDownHandler = () => {
      const mouseX = mouseRef.current?.x;
      const mouseY = mouseRef.current?.y;

      if (mouseX !== undefined && mouseY !== undefined) {
        ballsRef.current.forEach((ball) => {
          const dx = mouseX - ball.x;
          const dy = mouseY - ball.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < ball.radius) {
            ball.dx = dx * 0.3;
            ball.dy = dy * 0.3;
          }
        });
      }
    };

    canvas.addEventListener("mousemove", mouseMoveHandler);
    canvas.addEventListener("mousedown", mouseDownHandler);

    const animationId = setInterval(update, 1000 / 60);

    return () => {
      clearInterval(animationId);
      canvas.removeEventListener("mousemove", mouseMoveHandler);
      canvas.removeEventListener("mousedown", mouseDownHandler);
    };
  }, []);

  const handleBallClick = (
    event: React.MouseEvent<HTMLCanvasElement, MouseEvent>
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const mouseX = event.clientX - canvas.offsetLeft;
    const mouseY = event.clientY - canvas.offsetTop;

    ballsRef.current.forEach((ball, index) => {
      const dx = mouseX - ball.x;
      const dy = mouseY - ball.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < ball.radius) {
        setSelectedBallIndex(index);
        setMenuVisible(true);
      }
    });
  };

  return (
    <div style={{ position: "relative" }}>
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ border: "1px solid black" }}
        onClick={handleBallClick}
      />
      {selectedBallIndex !== null &&
        menuVisible &&
        renderColorPickerMenu(
          ballsRef.current[selectedBallIndex].x,
          ballsRef.current[selectedBallIndex].y
        )}
    </div>
  );
};

export default BilliardsGame;
