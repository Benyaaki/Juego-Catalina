// Sistema de sprites dibujados con Canvas
export class Sprite {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.visible = true;
        this.opacity = 1;
    }

    draw(ctx) {
        if (!this.visible || this.opacity <= 0) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        this.render(ctx);
        ctx.restore();
    }

    render(ctx) {
        // Override en subclases
    }

    contains(x, y) {
        return x >= this.x - this.width / 2 &&
               x <= this.x + this.width / 2 &&
               y >= this.y - this.height / 2 &&
               y <= this.y + this.height / 2;
    }

    fadeOut(duration, callback) {
        const startOpacity = this.opacity;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            this.opacity = startOpacity * (1 - progress);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.visible = false;
                if (callback) callback();
            }
        };
        
        requestAnimationFrame(animate);
    }
}

// Planeta Catalina (planeta central pastel)
export class PlanetaCatalina extends Sprite {
    constructor(x, y, radius) {
        super(x, y, radius * 2, radius * 2);
        this.radius = radius;
        this.rotation = 0;
        this.rotationSpeed = 0.002;
    }

    update() {
        this.rotation += this.rotationSpeed;
    }

    render(ctx) {
        // Círculo principal pastel rosa
        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );
        gradient.addColorStop(0, '#ffb6c1');
        gradient.addColorStop(0.5, '#ffc0cb');
        gradient.addColorStop(1, '#ff91a4');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Detalles decorativos
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Líneas decorativas
        ctx.strokeStyle = 'rgba(255, 182, 193, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 6; i++) {
            ctx.beginPath();
            ctx.moveTo(this.radius * 0.7, 0);
            ctx.lineTo(this.radius * 0.9, 0);
            ctx.stroke();
            ctx.rotate(Math.PI / 3);
        }
        
        ctx.restore();
    }
}

// Planeta Choripán
export class PlanetaChoripan extends Sprite {
    constructor(x, y, radius) {
        super(x, y, radius * 2, radius * 2);
        this.radius = radius;
        this.rotation = 0;
        this.rotationSpeed = 0.003;
        this.orbitCenterX = x;
        this.orbitCenterY = y;
        this.orbitRadius = 150;
        this.orbitAngle = 0;
        this.orbitSpeed = 0.001;
    }

    update() {
        this.rotation += this.rotationSpeed;
        this.orbitAngle += this.orbitSpeed;
        this.x = this.orbitCenterX + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y = this.orbitCenterY + Math.sin(this.orbitAngle) * this.orbitRadius;
    }

    render(ctx) {
        // Pan (parte superior e inferior)
        ctx.fillStyle = '#f4d03f';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y - this.radius * 0.3, this.radius * 0.9, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(this.x, this.y + this.radius * 0.3, this.radius * 0.9, this.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Chorizo (centro)
        ctx.fillStyle = '#d2691e';
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius * 0.7, this.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Detalles
        ctx.fillStyle = '#8b4513';
        ctx.beginPath();
        ctx.arc(this.x - this.radius * 0.3, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x + this.radius * 0.3, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Nebulosa de Vino Chileno
export class NebulosaVino extends Sprite {
    constructor(x, y, width, height) {
        super(x, y, width, height);
        this.particles = [];
        this.initParticles();
    }

    initParticles() {
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.width - this.width / 2,
                y: Math.random() * this.height - this.height / 2,
                size: Math.random() * 30 + 20,
                opacity: Math.random() * 0.5 + 0.3
            });
        }
    }

    update() {
        // Movimiento suave de partículas
        this.particles.forEach(particle => {
            particle.x += Math.sin(particle.y * 0.01) * 0.5;
            particle.y += Math.cos(particle.x * 0.01) * 0.5;
        });
    }

    render(ctx) {
        this.particles.forEach(particle => {
            const gradient = ctx.createRadialGradient(
                this.x + particle.x,
                this.y + particle.y,
                0,
                this.x + particle.x,
                this.y + particle.y,
                particle.size
            );
            gradient.addColorStop(0, `rgba(138, 43, 226, ${particle.opacity})`);
            gradient.addColorStop(1, 'rgba(138, 43, 226, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x + particle.x, this.y + particle.y, particle.size, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// Cometa Milo J
export class CometaMiloJ extends Sprite {
    constructor(x, y, size) {
        super(x, y, size * 2, size * 2);
        this.size = size;
        this.trail = [];
        this.speedX = -0.5;
        this.speedY = 0.2;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Agregar punto a la estela
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 30) {
            this.trail.shift();
        }
        
        // Resetear posición si sale de pantalla
        if (this.x < -this.size) {
            this.x = window.innerWidth + this.size;
            this.y = Math.random() * window.innerHeight;
        }
    }

    render(ctx) {
        // Estela
        for (let i = 0; i < this.trail.length; i++) {
            const point = this.trail[i];
            const alpha = i / this.trail.length * 0.6;
            ctx.fillStyle = `rgba(138, 43, 226, ${alpha})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, this.size * (i / this.trail.length), 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Cuerpo del cometa
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.size
        );
        gradient.addColorStop(0, '#9370db');
        gradient.addColorStop(1, '#8a2be2');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Luna Salchicha (perro salchicha orbitando)
export class LunaSalchicha extends Sprite {
    constructor(x, y, orbitRadius) {
        super(x, y, 60, 30);
        this.orbitCenterX = x;
        this.orbitCenterY = y;
        this.orbitRadius = orbitRadius;
        this.orbitAngle = 0;
        this.orbitSpeed = 0.005;
        this.rotation = 0;
    }

    update() {
        this.orbitAngle += this.orbitSpeed;
        this.rotation = this.orbitAngle + Math.PI / 2;
        this.x = this.orbitCenterX + Math.cos(this.orbitAngle) * this.orbitRadius;
        this.y = this.orbitCenterY + Math.sin(this.orbitAngle) * this.orbitRadius;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Cuerpo del perrito salchicha
        ctx.fillStyle = '#d2691e';
        ctx.beginPath();
        ctx.ellipse(0, 0, 25, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cabeza
        ctx.fillStyle = '#cd853f';
        ctx.beginPath();
        ctx.arc(-20, 0, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // Ojos
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-23, -3, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-23, 3, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Cola
        ctx.fillStyle = '#d2691e';
        ctx.beginPath();
        ctx.ellipse(20, 0, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Perrito Salchicha Oculto (para el minijuego)
export class PerritoOculto extends Sprite {
    constructor(x, y) {
        super(x, y, 40, 20);
        this.rotation = 0;
        this.rotationSpeed = 0.01;
        this.pulse = 0;
        this.pulseSpeed = 0.05;
    }

    update() {
        this.rotation += this.rotationSpeed;
        this.pulse += this.pulseSpeed;
    }

    render(ctx) {
        // Efecto de pulso sutil
        const scale = 1 + Math.sin(this.pulse) * 0.1;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        ctx.rotate(this.rotation);
        
        // Cuerpo pastel
        const gradient = ctx.createLinearGradient(-20, 0, 20, 0);
        gradient.addColorStop(0, '#ffb6c1');
        gradient.addColorStop(0.5, '#dda0dd');
        gradient.addColorStop(1, '#ffb6c1');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Cabeza
        ctx.fillStyle = '#ffc0cb';
        ctx.beginPath();
        ctx.arc(-15, 0, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Ojos brillantes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-17, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-17, 2, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Cola
        ctx.fillStyle = '#dda0dd';
        ctx.beginPath();
        ctx.ellipse(15, 0, 6, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Brillo mágico
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, 25, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }
}

// Estrella decorativa
export class Estrella extends Sprite {
    constructor(x, y, size) {
        super(x, y, size * 2, size * 2);
        this.size = size;
        this.twinkle = 0;
        this.twinkleSpeed = 0.02;
    }

    update() {
        this.twinkle += this.twinkleSpeed;
    }

    render(ctx) {
        const alpha = 0.5 + Math.sin(this.twinkle) * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Dibujar estrella de 5 puntas
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI / 5) - Math.PI / 2;
            const x = Math.cos(angle) * this.size;
            const y = Math.sin(angle) * this.size;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

// Nave espacial controlada por el jugador con imagen
export class Ship extends Sprite {
    constructor(x, y, image) {
        super(x, y, 50, 50);
        this.radius = 25;
        this.speed = 1.6; // Velocidad máxima aún más reducida
        this.velocityX = 0;
        this.velocityY = 0;
        this.friction = 0.92; // Mantener igual para conservar suavidad
        this.acceleration = 0.08; // Aceleración aún más reducida para movimiento más lento y preciso
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        this.rotation = 0;
        this.image = image;
        this.size = 50;
    }

    update(gamePaused = false) {
        // No actualizar si el juego está pausado
        if (gamePaused) return;
        
        // Aceleración basada en teclas
        let accelX = 0;
        let accelY = 0;
        
        if (this.keys.up) accelY -= this.acceleration;
        if (this.keys.down) accelY += this.acceleration;
        if (this.keys.left) accelX -= this.acceleration;
        if (this.keys.right) accelX += this.acceleration;
        
        // Aplicar aceleración a velocidad
        this.velocityX += accelX;
        this.velocityY += accelY;
        
        // Aplicar fricción
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;
        
        // Actualizar posición
        this.x += this.velocityX * this.speed;
        this.y += this.velocityY * this.speed;
        
        // Mantener la nave dentro de los límites
        this.x = Math.max(this.radius, Math.min(window.innerWidth - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(window.innerHeight - this.radius, this.y));
        
        // Calcular rotación hacia la dirección del movimiento con atan2
        if (Math.abs(this.velocityX) > 0.01 || Math.abs(this.velocityY) > 0.01) {
            this.rotation = Math.atan2(this.velocityY, this.velocityX);
        }
    }

    render(ctx) {
        if (!this.image || !this.image.complete) {
            // Fallback si la imagen no está cargada
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = '#ffb6c1';
            ctx.beginPath();
            ctx.ellipse(0, 0, this.radius * 0.8, this.radius * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            return;
        }
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Dibujar imagen de la nave
        const size = this.size;
        ctx.drawImage(this.image, -size / 2, -size / 2, size, size);
        
        ctx.restore();
    }

    getRadius() {
        return this.radius;
    }
}

// Objetivo coleccionable con imagen (móvil)
export class Target extends Sprite {
    constructor(x, y, type, message, image) {
        super(x, y, 60, 60);
        this.radius = 30;
        this.type = type; // 'choripan', 'odin', 'vino', 'antofagasta', 'ticket', 'planetaTierra'
        this.message = message;
        this.collected = false;
        this.pulse = 0;
        this.pulseSpeed = 0.05;
        this.rotation = 0;
        this.rotationSpeed = 0.01;
        this.image = image;
        this.baseScale = 1;
        this.wiggleOffset = { x: 0, y: 0 };
        this.wiggleTime = 0;
        
        // Movimiento
        this.startX = x;
        this.startY = y;
        this.moveTime = 0;
        this.moveSpeed = 0.02;
        this.moveRadiusX = 50;
        this.moveRadiusY = 30;
        this.bounceX = 0;
        this.bounceY = 0;
        this.bounceSpeedX = (Math.random() - 0.5) * 2;
        this.bounceSpeedY = (Math.random() - 0.5) * 2;
        
        // Velocidad de evasión
        this.vx = 0;
        this.vy = 0;
        this.maxTargetSpeed = 2.2;
    }

    update(shipDistance = Infinity, canvasWidth, canvasHeight, shipX = null, shipY = null) {
        if (!this.collected) {
            this.pulse += this.pulseSpeed;
            this.rotation += this.rotationSpeed;
            this.moveTime += this.moveSpeed;
            
            // Movimiento sinusoidal base
            let baseX = this.startX + Math.sin(this.moveTime) * this.moveRadiusX;
            let baseY = this.startY + Math.cos(this.moveTime * 0.7) * this.moveRadiusY;
            
            // Rebote contra bordes
            this.bounceX += this.bounceSpeedX;
            this.bounceY += this.bounceSpeedY;
            
            if (canvasWidth && canvasHeight) {
                if (baseX + this.bounceX < this.radius || baseX + this.bounceX > canvasWidth - this.radius) {
                    this.bounceSpeedX *= -1;
                }
                if (baseY + this.bounceY < this.radius || baseY + this.bounceY > canvasHeight - this.radius) {
                    this.bounceSpeedY *= -1;
                }
            }
            
            baseX += this.bounceX;
            baseY += this.bounceY;
            
            // COMPORTAMIENTO DE EVASIÓN: huir de la nave si está cerca
            if (shipX !== null && shipY !== null && shipDistance < 200) {
                const dx = this.x - shipX;
                const dy = this.y - shipY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist > 0 && dist < 200) {
                    const evadeSpeed = 1.4;
                    this.vx += (dx / dist) * evadeSpeed;
                    this.vy += (dy / dist) * evadeSpeed;
                }
            }
            
            // Limitar velocidad máxima del objetivo
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > this.maxTargetSpeed) {
                this.vx = (this.vx / speed) * this.maxTargetSpeed;
                this.vy = (this.vy / speed) * this.maxTargetSpeed;
            }
            
            // Aplicar fricción a la velocidad de evasión
            this.vx *= 0.95;
            this.vy *= 0.95;
            
            // Actualizar posición combinando movimiento base + evasión
            this.x = baseX + this.vx;
            this.y = baseY + this.vy;
            
            // Mantener dentro de límites
            if (canvasWidth && canvasHeight) {
                this.x = Math.max(this.radius, Math.min(canvasWidth - this.radius, this.x));
                this.y = Math.max(this.radius, Math.min(canvasHeight - this.radius, this.y));
            }
            
            // Highlight visual basado en distancia
            if (shipDistance < 140) {
                this.baseScale = 1.1;
            } else {
                this.baseScale = 1;
            }
            
            // Wiggle si está muy cerca
            if (shipDistance < 80) {
                this.wiggleTime += 0.2;
                this.wiggleOffset.x = Math.sin(this.wiggleTime * 3) * 3;
                this.wiggleOffset.y = Math.cos(this.wiggleTime * 2) * 3;
            } else {
                this.wiggleOffset.x = 0;
                this.wiggleOffset.y = 0;
            }
        }
    }

    render(ctx, shipDistance = Infinity) {
        if (this.collected) return;
        
        const scale = this.baseScale + Math.sin(this.pulse) * 0.1;
        
        // Glow pastel si está cerca
        if (shipDistance < 140) {
            const glowRadius = 50 + Math.sin(this.pulse * 2) * 10;
            const gradient = ctx.createRadialGradient(
                this.x + this.wiggleOffset.x,
                this.y + this.wiggleOffset.y,
                0,
                this.x + this.wiggleOffset.x,
                this.y + this.wiggleOffset.y,
                glowRadius
            );
            gradient.addColorStop(0, 'rgba(255, 182, 193, 0.4)');
            gradient.addColorStop(1, 'rgba(255, 182, 193, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x + this.wiggleOffset.x, this.y + this.wiggleOffset.y, glowRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.save();
        ctx.translate(this.x + this.wiggleOffset.x, this.y + this.wiggleOffset.y);
        ctx.scale(scale, scale);
        ctx.rotate(this.rotation);
        
        // Dibujar imagen si está disponible
        if (this.image && this.image.complete) {
            const size = this.radius * 2;
            ctx.drawImage(this.image, -size / 2, -size / 2, size, size);
        } else {
            // Fallback: círculo pastel
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.radius);
            gradient.addColorStop(0, '#ffb6c1');
            gradient.addColorStop(1, '#ff91a4');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Borde brillante
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.restore();
    }

    getRadius() {
        return this.radius;
    }

    collect() {
        this.collected = true;
        this.fadeOut(500);
    }
}

// Planeta Tierra (objetivo final)
export class PlanetaTierra extends Sprite {
    constructor(x, y, image) {
        super(x, y, 100, 100);
        this.radius = 50;
        this.image = image;
        this.pulse = 0;
        this.pulseSpeed = 0.03;
        this.rotation = 0;
        this.rotationSpeed = 0.002;
        this.collected = false;
    }

    update() {
        this.pulse += this.pulseSpeed;
        this.rotation += this.rotationSpeed;
    }

    render(ctx) {
        const scale = 1 + Math.sin(this.pulse) * 0.1;
        
        // Glow dorado
        const glowRadius = 80 + Math.sin(this.pulse * 2) * 15;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, glowRadius);
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 215, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(scale, scale);
        ctx.rotate(this.rotation);
        
        if (this.image && this.image.complete) {
            const size = this.radius * 2;
            ctx.drawImage(this.image, -size / 2, -size / 2, size, size);
        } else {
            // Fallback
            ctx.fillStyle = '#4a90e2';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }

    getRadius() {
        return this.radius;
    }

    collect() {
        this.collected = true;
    }
}

// Partícula de estrella para el fondo
export class StarParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.5 + 0.2;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.color = this.getRandomColor();
    }

    getRandomColor() {
        const colors = [
            'rgba(255, 255, 255, 1)',      // Blanco
            'rgba(255, 182, 193, 1)',     // Rosa pastel
            'rgba(221, 160, 221, 1)',      // Lila pastel
            'rgba(176, 224, 230, 1)'      // Celeste pastel
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update(canvasHeight) {
        this.y += this.speed;
        if (this.y > canvasHeight) {
            this.y = -5;
            this.x = Math.random() * window.innerWidth;
        }
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Partícula de recolección
export class CollectionParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.size = Math.random() * 4 + 2;
        this.opacity = 1;
        this.life = 1;
        this.decay = 0.02;
        this.colors = [
            '#fffacd',  // Amarillo suave
            '#ffb6c1',  // Rosa pastel
            '#b0e0e6'   // Celeste pastel
        ];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.opacity = Math.max(0, this.life);
    }

    render(ctx) {
        if (this.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.opacity <= 0;
    }
}

// Misil enemigo
export class Misil extends Sprite {
    constructor(x, y, targetX, targetY, speed = 2) {
        super(x, y, 32, 32);
        this.radius = 16; // Aumentado de 10 a 16 (tamaño total: 32px)
        this.speed = speed;
        this.targetX = targetX;
        this.targetY = targetY;
        this.vx = 0;
        this.vy = 0;
        this.image = null;
        this.rotation = 0;
        this.pursuitStrength = 0.05; // Fuerza de persecución
    }

    setImage(image) {
        this.image = image;
    }

    update(shipX, shipY) {
        // Perseguir levemente a la nave
        const dx = shipX - this.x;
        const dy = shipY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Movimiento hacia el objetivo con ligera persecución
            const targetDx = this.targetX - this.x;
            const targetDy = this.targetY - this.y;
            const targetDist = Math.sqrt(targetDx * targetDx + targetDy * targetDy);
            
            if (targetDist > 0) {
                this.vx = (targetDx / targetDist) * this.speed;
                this.vy = (targetDy / targetDist) * this.speed;
            }
            
            // Agregar persecución suave hacia la nave
            this.vx += (dx / distance) * this.pursuitStrength * this.speed;
            this.vy += (dy / distance) * this.pursuitStrength * this.speed;
            
            // Normalizar velocidad
            const velMag = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (velMag > this.speed) {
                this.vx = (this.vx / velMag) * this.speed;
                this.vy = (this.vy / velMag) * this.speed;
            }
        }
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Rotación hacia la dirección del movimiento
        if (Math.abs(this.vx) > 0.01 || Math.abs(this.vy) > 0.01) {
            this.rotation = Math.atan2(this.vy, this.vx);
        }
    }

    render(ctx) {
        if (this.image && this.image.complete) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            // Dibujar misil con tamaño aumentado (32px)
            const missileSize = 32;
            ctx.drawImage(this.image, -missileSize / 2, -missileSize / 2, missileSize, missileSize);
            ctx.restore();
        } else {
            // Fallback
            ctx.fillStyle = '#ff6b6b';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getRadius() {
        return this.radius;
    }
}

// Enemigo genérico (centro)
export class Enemigo extends Sprite {
    constructor(x, y, image) {
        super(x, y, 60, 60);
        this.radius = 30;
        this.image = image;
        this.rotation = 0;
        this.rotationSpeed = 0.01;
        this.lastShot = 0;
        this.shootInterval = 2000; // 2 segundos
    }

    update(currentTime) {
        this.rotation += this.rotationSpeed;
        this.lastShot = currentTime;
    }

    canShoot(currentTime) {
        return currentTime - this.lastShot >= this.shootInterval;
    }

    shoot(shipX, shipY) {
        this.lastShot = performance.now();
        return new Misil(this.x, this.y, shipX, shipY, 2);
    }

    render(ctx) {
        if (this.image && this.image.complete) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.restore();
        } else {
            // Fallback
            ctx.fillStyle = '#8b0000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getRadius() {
        return this.radius;
    }
}

// Diente malvado (enemigo final nivel 5)
export class DienteMalvado extends Sprite {
    constructor(x, y, image) {
        super(x, y, 100, 100);
        this.radius = 50;
        this.image = image;
        this.rotation = 0;
        this.rotationSpeed = 0.02;
        this.lastShot = 0;
        this.shootInterval = 800; // Más rápido
        this.pulse = 0;
        this.pulseSpeed = 0.1;
        this.exploded = false;
    }

    update(currentTime) {
        if (!this.exploded) {
            this.rotation += this.rotationSpeed;
            this.pulse += this.pulseSpeed;
            this.lastShot = currentTime;
        }
    }

    canShoot(currentTime) {
        return !this.exploded && currentTime - this.lastShot >= this.shootInterval;
    }

    shoot(shipX, shipY) {
        this.lastShot = performance.now();
        // Disparo caótico - dirección aleatoria con ligera persecución
        const angle = Math.random() * Math.PI * 2;
        const targetX = this.x + Math.cos(angle) * 500;
        const targetY = this.y + Math.sin(angle) * 500;
        return new Misil(this.x, this.y, targetX, targetY, 3);
    }

    explode() {
        this.exploded = true;
    }

    render(ctx) {
        if (this.exploded) return;
        
        const scale = 1 + Math.sin(this.pulse) * 0.1;
        
        if (this.image && this.image.complete) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(scale, scale);
            ctx.rotate(this.rotation);
            ctx.drawImage(this.image, -this.radius, -this.radius, this.radius * 2, this.radius * 2);
            ctx.restore();
        } else {
            // Fallback
            ctx.fillStyle = '#8b0000';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius * scale, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    getRadius() {
        return this.radius;
    }
}

// Partícula de explosión
export class ExplosionParticle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.size = Math.random() * 6 + 3;
        this.opacity = 1;
        this.life = 1;
        this.decay = 0.015;
        this.colors = [
            '#fffacd',  // Amarillo suave
            '#ffb6c1',  // Rosa pastel
            '#b0e0e6',  // Celeste pastel
            '#dda0dd',  // Lila pastel
            '#f0e68c'   // Khaki pastel
        ];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= this.decay;
        this.opacity = Math.max(0, this.life);
    }

    render(ctx) {
        if (this.opacity <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.opacity <= 0;
    }
}

