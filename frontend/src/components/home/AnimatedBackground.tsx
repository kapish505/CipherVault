import { useEffect, useRef } from 'react';

/**
 * AnimatedBackground - "Liquid Digital"
 * 
 * A subtle, performant background effect using Canvas API.
 * Creates slowly moving, organic "orbs" that gently respond to cursor movement.
 * The high blur filter (in CSS) creates the liquid/gradient effect.
 */

interface Orb {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    originalX: number;
    originalY: number;
}

export function AnimatedBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Configuration
    const ORB_COUNT = 5;
    const MOUSE_INFLUENCE_RADIUS = 300;
    const MOUSE_FORCE = 0.05;
    // const DAMPING = 0.98; // For smooth return to original path

    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = 0;
        let height = 0;
        let animationFrameId: number;
        let orbs: Orb[] = [];
        let mouseX = -1000;
        let mouseY = -1000;

        // Colors derived from theme
        // Using distinct RGBA values for better mixing
        const colors = [
            'rgba(37, 99, 235, 0.4)',  // Brand Blue
            'rgba(99, 102, 241, 0.3)', // Indigo
            'rgba(59, 130, 246, 0.3)', // Light Blue
            'rgba(147, 51, 234, 0.2)', // Purple subtle
            'rgba(236, 72, 153, 0.15)' // Pink subtle
        ];

        const initOrbs = () => {
            orbs = [];
            for (let i = 0; i < ORB_COUNT; i++) {
                const radius = Math.random() * 200 + 150; // Large sizes for blur
                const x = Math.random() * width;
                const y = Math.random() * height;

                orbs.push({
                    x,
                    y,
                    originalX: x,
                    originalY: y,
                    vx: (Math.random() - 0.5) * 0.5, // Slow movement
                    vy: (Math.random() - 0.5) * 0.5,
                    radius,
                    color: colors[i % colors.length]
                });
            }
        };

        const handleResize = () => {
            width = container.offsetWidth;
            height = container.offsetHeight;
            canvas.width = width;
            canvas.height = height;
            initOrbs();
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        const update = () => {
            ctx.clearRect(0, 0, width, height);

            orbs.forEach(orb => {
                // 1. Natural drift
                orb.originalX += orb.vx;
                orb.originalY += orb.vy;

                // Bounce off edges (for original path)
                if (orb.originalX < -orb.radius) orb.originalX = width + orb.radius;
                if (orb.originalX > width + orb.radius) orb.originalX = -orb.radius;
                if (orb.originalY < -orb.radius) orb.originalY = height + orb.radius;
                if (orb.originalY > height + orb.radius) orb.originalY = -orb.radius;

                // 2. Mouse interaction (Displacement)
                const dx = mouseX - orb.x;
                const dy = mouseY - orb.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                let targetX = orb.originalX;
                let targetY = orb.originalY;

                if (distance < MOUSE_INFLUENCE_RADIUS) {
                    const angle = Math.atan2(dy, dx);
                    const force = (MOUSE_INFLUENCE_RADIUS - distance) / MOUSE_INFLUENCE_RADIUS;

                    // Push away from cursor
                    targetX -= Math.cos(angle) * force * 100 * MOUSE_FORCE;
                    targetY -= Math.sin(angle) * force * 100 * MOUSE_FORCE;
                }

                // Smoothly interpolate current position to target
                orb.x += (targetX - orb.x) * 0.05;
                orb.y += (targetY - orb.y) * 0.05;

                // Draw orb
                ctx.beginPath();
                ctx.fillStyle = orb.color;
                ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(update);
        };

        // Initialize
        window.addEventListener('resize', handleResize);
        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
        handleResize(); // Initial setup
        update(); // Start loop

        return () => {
            window.removeEventListener('resize', handleResize);
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div
            ref={containerRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100vh',
                zIndex: -1,
                overflow: 'hidden',
                pointerEvents: 'none', // Allow clicks to pass through
                backgroundColor: 'var(--color-bg-primary)', // Base background
            }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    filter: 'blur(100px)', // The secret sauce for liquid effect
                    opacity: 0.6, // Subtle blend
                    transform: 'scale(1.2)', // Hide blur edges
                }}
            />
        </div>
    );
}
