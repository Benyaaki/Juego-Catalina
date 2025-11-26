// Sistema de carga de imágenes
export class AssetLoader {
    constructor() {
        this.images = {};
        this.loaded = false;
    }

    async loadAll() {
        const imagePaths = {
            fondo: '../img/Nueva galaxia.png',
            nave: '../img/Nave espacial.png',
            choripan: '../img/Choripan.png',
            vino: '../img/Vino.png',
            antofagasta: '../img/Antofagasta.png',
            ticket: '../img/Ticket.png',
            pokemon: '../img/pokemon.png',
            planetaTierra: '../img/Planeta Tierra 2.png',
            todosEsperando: '../img/Todos esperando.png',
            misil: '../img/Misil.png',
            dienteMalvado: '../img/Diente malvado.png',
            odin: '../img/Odin.png'
        };

        const loadPromises = Object.entries(imagePaths).map(([key, path]) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.images[key] = img;
                    resolve();
                };
                img.onerror = () => {
                    console.warn(`No se pudo cargar: ${path}`);
                    // Crear imagen placeholder si falla
                    this.images[key] = this.createPlaceholder();
                    resolve();
                };
                img.src = path;
            });
        });

        await Promise.all(loadPromises);
        this.loaded = true;
    }

    createPlaceholder() {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffb6c1';
        ctx.fillRect(0, 0, 100, 100);
        const img = new Image();
        img.src = canvas.toDataURL();
        return img;
    }

    getImage(key) {
        return this.images[key] || null;
    }
}

// Funciones de utilidad para dibujar sprites
export function drawSprite(ctx, img, x, y, size, options = {}) {
    if (!img || !img.complete) return;
    
    const {
        rotation = 0,
        opacity = 1,
        scale = 1,
        offsetX = 0,
        offsetY = 0
    } = options;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.globalAlpha = opacity;
    
    const width = (size || img.width) * scale;
    const height = (size || img.height) * scale;
    
    ctx.drawImage(
        img,
        -width / 2 + offsetX,
        -height / 2 + offsetY,
        width,
        height
    );
    
    ctx.restore();
}

export function drawBackground(ctx, img, canvasWidth, canvasHeight) {
    if (!img || !img.complete) return;
    
    // Escalar imagen para cubrir todo el canvas
    const scale = Math.max(
        canvasWidth / img.width,
        canvasHeight / img.height
    );
    
    const width = img.width * scale;
    const height = img.height * scale;
    const x = (canvasWidth - width) / 2;
    const y = (canvasHeight - height) / 2;
    
    ctx.drawImage(img, x, y, width, height);
}

export function drawParticle(ctx, p) {
    ctx.save();
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

export function drawGlow(ctx, x, y, radius, color = 'rgba(255, 182, 193, 0.5)') {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'rgba(255, 182, 193, 0)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
}

