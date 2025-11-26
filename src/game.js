import {
    Ship,
    Target,
    PlanetaTierra,
    StarParticle,
    CollectionParticle,
    Misil,
    Enemigo,
    DienteMalvado,
    ExplosionParticle
} from './sprites.js';
import { getTargetMessage } from './messages.js';
import { AssetLoader, drawBackground } from './assets.js';

export class Game {
    constructor(canvas, uiManager) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.uiManager = uiManager;
        
        this.assetLoader = new AssetLoader();
        this.assetsLoaded = false;
        
        this.level = 1;
        this.maxLevel = 7; // Actualizado para incluir nivel Pokémon
        
        this.sprites = [];
        this.misiles = [];
        this.enemigo = null;
        this.target = null;
        this.ship = null;
        this.starParticles = [];
        this.collectionParticles = [];
        this.explosionParticles = [];
        
        this.isRunning = false;
        this.lastTime = 0;
        this.lastShotTime = 0;
        this.missileRate = 1300; // Tasa de spawn de misiles en ms
        this.missileSpawner = null; // Intervalo de spawn de misiles
        this.pausedForMessage = false; // Bandera para pausar cuando se captura un objetivo
        
        this.setupCanvas();
        this.setupEventListeners();
        this.setupKeyboard();
        this.loadAssets();
    }

    async loadAssets() {
        await this.assetLoader.loadAll();
        this.assetsLoaded = true;
    }

    setupCanvas() {
        this.resizeCanvas();
        window.addEventListener('resize', () => {
            this.resizeCanvas();
            // Recalcular posiciones relativas si es necesario
            if (this.ship) {
                this.ship.x = Math.min(this.ship.x, this.canvas.width - this.ship.radius);
                this.ship.y = Math.min(this.ship.y, this.canvas.height - this.ship.radius);
            }
        });
        
        // Prevenir zoom en doble toque en móviles
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        // Asegurar que el canvas se renderice correctamente en móviles
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
    }

    setupEventListeners() {
        // Detectar si es móvil
        this.isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                       (window.innerWidth <= 768 && 'ontouchstart' in window);
        
        // Controles táctiles para móvil
        if (this.isMobile) {
            this.setupTouchControls();
        }
    }
    
    setupTouchControls() {
        // Prevenir scroll y zoom
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            
            if (!this.ship || this.pausedForMessage || !this.isRunning) return;
            
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            
            // Calcular posición relativa al canvas
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            // Mover la nave hacia el punto táctil con suavidad
            const dx = touchX - this.ship.x;
            const dy = touchY - this.ship.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 5) {
                // Normalizar dirección y aplicar velocidad
                const speed = 3.5; // Velocidad de seguimiento táctil
                this.ship.velocityX = (dx / distance) * speed;
                this.ship.velocityY = (dy / distance) * speed;
                this.ship.externalVelocity = true; // Marcar como velocidad externa
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            // Reducir velocidad gradualmente al soltar
            if (this.ship) {
                this.ship.externalVelocity = true; // Mantener flag para fricción suave
            }
        }, { passive: false });
    }

    setupKeyboard() {
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };

        // Solo configurar teclado si no es móvil
        if (!this.isMobile) {
            window.addEventListener('keydown', (e) => {
                if (this.keys.hasOwnProperty(e.key)) {
                    e.preventDefault();
                    this.keys[e.key] = true;
                    if (this.ship) {
                        this.updateShipKeys();
                    }
                }
            });

            window.addEventListener('keyup', (e) => {
                if (this.keys.hasOwnProperty(e.key)) {
                    e.preventDefault();
                    this.keys[e.key] = false;
                    if (this.ship) {
                        this.updateShipKeys();
                    }
                }
            });
        }
    }

    updateShipKeys() {
        if (this.ship && !this.isMobile) {
            this.ship.keys = {
                up: this.keys.ArrowUp,
                down: this.keys.ArrowDown,
                left: this.keys.ArrowLeft,
                right: this.keys.ArrowRight
            };
        }
    }
    
    getMobileScale() {
        // Escala para móviles: reducir tamaño de sprites en pantallas pequeñas
        if (window.innerWidth < 600) {
            return 0.7;
        } else if (window.innerWidth < 900) {
            return 0.85;
        }
        return 1;
    }

    clearLevel() {
        // Detener spawner de misiles
        if (this.missileSpawner) {
            clearInterval(this.missileSpawner);
            this.missileSpawner = null;
        }
        
        // Resetear pausa
        this.pausedForMessage = false;
        
        // Limpiar nivel anterior
        this.misiles = [];
        this.explosionParticles = [];
        this.collectionParticles = [];
        this.enemigo = null;
        this.target = null;
    }

    initLevel() {
        console.log('🔧 initLevel() llamado para nivel', this.level);
        
        if (!this.assetsLoaded) {
            console.log('⏳ Assets no cargados, esperando...');
            setTimeout(() => this.initLevel(), 100);
            return;
        }

        console.log('🧹 Limpiando nivel anterior...');
        this.clearLevel();
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        console.log('🚀 Creando nave espacial...');
        // Nave espacial (posición inicial - resetear siempre)
        const naveImg = this.assetLoader.getImage('nave');
        if (!naveImg) {
            console.error('❌ No se encontró la imagen de la nave');
        }
        // Ajustar posición inicial en móviles
        const startX = this.isMobile ? Math.min(100, this.canvas.width * 0.15) : 100;
        this.ship = new Ship(startX, centerY, naveImg);
        
        // Aplicar escala móvil a la nave
        if (this.isMobile) {
            const scale = this.getMobileScale();
            this.ship.size = this.ship.size * scale;
            this.ship.radius = this.ship.radius * scale;
        }
        
        this.updateShipKeys();
        console.log('✅ Nave creada en posición:', this.ship.x, this.ship.y);
        
        // Crear partículas de estrellas
        if (this.starParticles.length === 0) {
            const numParticles = Math.floor(Math.random() * 71) + 80;
            for (let i = 0; i < numParticles; i++) {
                this.starParticles.push(new StarParticle(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height
                ));
            }
        }
        
        // Configurar nivel específico
        this.setupLevel();
    }

    setupLevel() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Configurar tasa de misiles según el nivel
        switch(this.level) {
            case 1:
                this.missileRate = 1300;
                break;
            case 2:
                this.missileRate = 1100;
                break;
            case 3:
                this.missileRate = 950;
                break;
            case 4:
                this.missileRate = 950;
                break;
            case 5:
                this.missileRate = 900; // Nivel Pokémon
                break;
            case 6:
                this.missileRate = 800; // Nivel Odín (diente malvado)
                break;
            default:
                this.missileRate = 0; // Nivel final sin misiles
        }
        
        switch(this.level) {
            case 1: // Choripán
                this.setupLevel1(centerX, centerY);
                break;
            case 2: // Vino
                this.setupLevel2(centerX, centerY);
                break;
            case 3: // Ticket
                this.setupLevel3(centerX, centerY);
                break;
            case 4: // Antofagasta (nivel normal)
                this.setupLevel4(centerX, centerY);
                break;
            case 5: // Pokémon (NUEVO)
                this.setupLevel5(centerX, centerY);
                break;
            case 6: // Odín (diente malvado)
                this.setupLevel6(centerX, centerY);
                break;
            case 7: // Planeta Tierra (final)
                this.setupLevel7(centerX, centerY);
                break;
        }
        
        // Iniciar spawner de misiles si no es el nivel final
        if (this.level !== this.maxLevel && this.missileRate > 0) {
            this.startMissileSpawner();
        }
        
        this.uiManager.updateLevel(this.level, this.maxLevel);
    }

    startMissileSpawner() {
        // Detener spawner anterior si existe
        if (this.missileSpawner) {
            clearInterval(this.missileSpawner);
        }
        
        // Crear nuevo spawner con la tasa del nivel
        this.missileSpawner = setInterval(() => {
            // No disparar si está pausado
            if (this.pausedForMessage) return;
            
            if (this.enemigo && this.ship && this.isRunning) {
                const misil = this.enemigo.shoot(this.ship.x, this.ship.y);
                const misilImg = this.assetLoader.getImage('misil');
                if (misilImg) {
                    misil.setImage(misilImg);
                }
                this.misiles.push(misil);
            }
        }, this.missileRate);
    }

    setupLevel1(centerX, centerY) {
        // Ajustar posiciones para móviles
        const mobileScale = this.getMobileScale();
        const offsetX = this.isMobile ? this.canvas.width * 0.3 : 300;
        const offsetY = this.isMobile ? this.canvas.height * 0.2 : 200;
        
        // Enemigo genérico en el centro
        const enemigoImg = this.assetLoader.getImage('dienteMalvado');
        this.enemigo = new Enemigo(centerX, centerY, enemigoImg);
        if (this.isMobile && this.enemigo.radius) {
            this.enemigo.radius *= mobileScale;
        }
        
        // Objetivo: Choripán (alejado del centro)
        const targetX = centerX + offsetX;
        const targetY = centerY - offsetY;
        const choripanImg = this.assetLoader.getImage('choripan');
        this.target = new Target(targetX, targetY, 'choripan', getTargetMessage('choripan'), choripanImg);
        if (this.isMobile && this.target.radius) {
            this.target.radius *= mobileScale;
        }
    }

    setupLevel2(centerX, centerY) {
        const mobileScale = this.getMobileScale();
        const offsetX = this.isMobile ? this.canvas.width * 0.3 : 300;
        const offsetY = this.isMobile ? this.canvas.height * 0.2 : 200;
        
        // Enemigo genérico
        const enemigoImg = this.assetLoader.getImage('dienteMalvado');
        this.enemigo = new Enemigo(centerX, centerY, enemigoImg);
        if (this.isMobile && this.enemigo.radius) {
            this.enemigo.radius *= mobileScale;
        }
        
        // Objetivo: Vino
        const targetX = centerX - offsetX;
        const targetY = centerY + offsetY;
        const vinoImg = this.assetLoader.getImage('vino');
        this.target = new Target(targetX, targetY, 'vino', getTargetMessage('vino'), vinoImg);
        if (this.isMobile && this.target.radius) {
            this.target.radius *= mobileScale;
        }
    }

    setupLevel3(centerX, centerY) {
        const mobileScale = this.getMobileScale();
        const offsetX = this.isMobile ? this.canvas.width * 0.25 : 250;
        const offsetY = this.isMobile ? this.canvas.height * 0.25 : 250;
        
        // Enemigo genérico
        const enemigoImg = this.assetLoader.getImage('dienteMalvado');
        this.enemigo = new Enemigo(centerX, centerY, enemigoImg);
        if (this.isMobile && this.enemigo.radius) {
            this.enemigo.radius *= mobileScale;
        }
        
        // Objetivo: Ticket
        const targetX = centerX + offsetX;
        const targetY = centerY + offsetY;
        const ticketImg = this.assetLoader.getImage('ticket');
        this.target = new Target(targetX, targetY, 'ticket', getTargetMessage('ticket'), ticketImg);
        if (this.isMobile && this.target.radius) {
            this.target.radius *= mobileScale;
        }
    }

    setupLevel4(centerX, centerY) {
        const mobileScale = this.getMobileScale();
        const offsetX = this.isMobile ? this.canvas.width * 0.2 : 200;
        const offsetY = this.isMobile ? this.canvas.height * 0.15 : 150;
        
        // Nivel normal con enemigo y misiles
        const enemigoImg = this.assetLoader.getImage('dienteMalvado');
        this.enemigo = new Enemigo(centerX, centerY, enemigoImg);
        if (this.isMobile && this.enemigo.radius) {
            this.enemigo.radius *= mobileScale;
        }
        
        // Objetivo: Antofagasta
        const targetX = centerX + offsetX;
        const targetY = centerY - offsetY;
        const antofagastaImg = this.assetLoader.getImage('antofagasta');
        this.target = new Target(targetX, targetY, 'antofagasta', '¡¡Amiga ten cuidado!! Has llegado a Antofagasta. Tierra de nadie, te recomiendo huyas de inmediato ☀🏜️', antofagastaImg);
        if (this.isMobile && this.target.radius) {
            this.target.radius *= mobileScale;
        }
    }

    setupLevel5(centerX, centerY) {
        const mobileScale = this.getMobileScale();
        const offsetX = this.isMobile ? this.canvas.width * 0.3 : 300;
        const offsetY = this.isMobile ? this.canvas.height * 0.15 : 150;
        
        // Nivel Pokémon - enemigo genérico con misiles
        const enemigoImg = this.assetLoader.getImage('dienteMalvado');
        this.enemigo = new Enemigo(centerX, centerY, enemigoImg);
        if (this.isMobile && this.enemigo.radius) {
            this.enemigo.radius *= mobileScale;
        }
        
        // Objetivo: Pokémon
        const targetX = centerX - offsetX;
        const targetY = centerY + offsetY;
        const pokemonImg = this.assetLoader.getImage('pokemon');
        this.target = new Target(targetX, targetY, 'pokemon', getTargetMessage('pokemon'), pokemonImg);
        if (this.isMobile && this.target.radius) {
            this.target.radius *= mobileScale;
        }
    }

    setupLevel6(centerX, centerY) {
        const mobileScale = this.getMobileScale();
        const offsetX = this.isMobile ? this.canvas.width * 0.35 : 350;
        
        // Diente malvado como enemigo final
        const dienteImg = this.assetLoader.getImage('dienteMalvado');
        this.enemigo = new DienteMalvado(centerX, centerY, dienteImg);
        if (this.isMobile && this.enemigo.radius) {
            this.enemigo.radius *= mobileScale;
        }
        
        // Objetivo: Odín
        const targetX = centerX - offsetX;
        const targetY = centerY;
        const odinImg = this.assetLoader.getImage('odin');
        this.target = new Target(targetX, targetY, 'odin', getTargetMessage('odin'), odinImg);
        if (this.isMobile && this.target.radius) {
            this.target.radius *= mobileScale;
        }
    }

    setupLevel7(centerX, centerY) {
        const mobileScale = this.getMobileScale();
        
        // Sin enemigos - nivel final
        // Objetivo: Planeta Tierra
        const targetX = centerX;
        const targetY = centerY;
        const planetaImg = this.assetLoader.getImage('planetaTierra');
        
        // Verificar que la imagen se cargó correctamente
        if (!planetaImg) {
            console.error('❌ No se pudo cargar la imagen del planeta tierra');
        } else {
            console.log('✅ Imagen del planeta tierra cargada:', planetaImg.complete, planetaImg.width, planetaImg.height);
        }
        
        this.target = new PlanetaTierra(targetX, targetY, planetaImg);
        
        // Aplicar escala móvil solo si es necesario, pero asegurar tamaño mínimo
        if (this.isMobile && this.target.radius) {
            const newRadius = this.target.radius * mobileScale;
            this.target.radius = Math.max(newRadius, 30); // Tamaño mínimo de 30px
        }
        
        // Asegurar que el target sea visible
        this.target.visible = true;
        this.target.opacity = 1;
        this.target.collected = false;
        
        this.target.message = '¡Llegaste al Planeta Tierra!';
        
        console.log('✅ Planeta Tierra creado en:', targetX, targetY, 'radius:', this.target.radius);
    }

    checkCollisions() {
        if (!this.ship || this.pausedForMessage) return; // No verificar colisiones si está pausado
        
        // Colisión nave - objetivo
        if (this.target && !this.target.collected) {
            const dx = this.ship.x - this.target.x;
            const dy = this.ship.y - this.target.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = this.ship.getRadius() + this.target.getRadius();
            
            if (distance < minDistance) {
                this.foundTarget();
            }
        }
        
        // Colisión nave - misiles (solo si no está pausado)
        if (!this.pausedForMessage) {
            for (let i = this.misiles.length - 1; i >= 0; i--) {
                const misil = this.misiles[i];
                const dx = this.ship.x - misil.x;
                const dy = this.ship.y - misil.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = this.ship.getRadius() + misil.getRadius();
                
                if (distance < minDistance) {
                    // Impacto - reiniciar solo el nivel actual
                    this.restartCurrentLevel();
                    break;
                }
            }
        }
    }

    foundTarget() {
        if (!this.target || this.target.collected || this.pausedForMessage) return;
        
        // PAUSAR EL JUEGO
        this.pausedForMessage = true;
        
        // Crear partículas de recolección
        for (let i = 0; i < 20; i++) {
            this.collectionParticles.push(new CollectionParticle(this.target.x, this.target.y));
        }
        
        this.target.collect();
        
        // Manejo especial por tipo de objetivo
        if (this.target.type === 'antofagasta') {
            this.uiManager.showMessage('Advertencia: has llegado a Antofagasta. Se recomienda huir inmediatamente ☀🏜️', true);
        } else if (this.target.type === 'pokemon') {
            this.uiManager.showMessage('¡Te felicito amiga, has encontrado la carta mas cara (Según chatgpt, no tengo puta idea) 🎴🔥', true);
        } else if (this.target.type === 'odin') {
            this.explodeDiente();
            this.uiManager.showMessage('¡Catalina! Has rescatado al gordito Odin! Es hora de volver a casa, nos esperan 💖', true);
        } else if (this.level === 7) {
            // Nivel final: completar juego
            this.uiManager.showMessage(this.target.message || '¡Llegaste al Planeta Tierra!', true);
        } else {
            const message = this.target.message || getTargetMessage(this.target.type);
            this.uiManager.showMessage(message, true);
        }
    }

    resumeAfterMessage() {
        // Reanudar el juego y avanzar al siguiente nivel
        this.pausedForMessage = false;
        this.uiManager.hideMessage();
        
        if (this.level === 4) {
            // Avanzar al nivel 5 (Pokémon)
            this.level = 5;
            this.initLevel();
        } else if (this.level === 5) {
            // Avanzar al nivel 6 (Odín)
            this.level = 6;
            this.initLevel();
        } else if (this.level === 6) {
            // Avanzar al nivel final (Planeta Tierra)
            this.level = 7;
            this.initLevel();
        } else if (this.level === 7) {
            // Completar juego
            setTimeout(() => {
                this.uiManager.showFinalScreen();
                this.stop();
            }, 500);
        } else {
            // Avanzar al siguiente nivel (niveles 1, 2, 3)
            if (this.level < this.maxLevel) {
                this.level++;
                this.initLevel();
            } else {
                setTimeout(() => {
                    this.uiManager.showFinalScreen();
                    this.stop();
                }, 500);
            }
        }
    }

    explodeDiente() {
        if (this.enemigo instanceof DienteMalvado) {
            this.enemigo.explode();
            
            // Crear partículas de explosión
            for (let i = 0; i < 50; i++) {
                this.explosionParticles.push(new ExplosionParticle(this.enemigo.x, this.enemigo.y));
            }
            
            // Detener todos los misiles
            this.misiles = [];
        }
    }

    restartCurrentLevel() {
        // Reiniciar solo el nivel actual
        console.log('🔄 Reiniciando nivel actual:', this.level);
        this.clearLevel();
        this.initLevel();
    }

    start() {
        console.log('🎮 Game.start() llamado');
        console.log('Assets cargados:', this.assetsLoaded);
        
        // Asegurarse de que los assets estén cargados
        if (!this.assetsLoaded) {
            console.log('⏳ Esperando a que los assets se carguen...');
            setTimeout(() => this.start(), 100);
            return;
        }
        
        console.log('✅ Assets cargados, inicializando nivel 1...');
        this.level = 1;
        this.initLevel();
        console.log('✅ Nivel 1 inicializado');
        this.isRunning = true;
        this.lastTime = performance.now();
        this.lastShotTime = performance.now();
        console.log('✅ Iniciando game loop...');
        this.gameLoop();
        console.log('✅ Game loop iniciado');
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop(currentTime = performance.now()) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime, currentTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    update(deltaTime, currentTime) {
        // Si está pausado, no actualizar nada excepto partículas visuales
        if (this.pausedForMessage) {
            // Solo actualizar partículas visuales (recolección y explosión)
            this.collectionParticles = this.collectionParticles.filter(p => {
                p.update();
                return !p.isDead();
            });
            this.explosionParticles = this.explosionParticles.filter(p => {
                p.update();
                return !p.isDead();
            });
            return; // No actualizar nada más
        }
        
        // Actualizar partículas de estrellas
        this.starParticles.forEach(particle => {
            particle.update(this.canvas.height);
        });
        
        // Actualizar partículas de recolección
        this.collectionParticles = this.collectionParticles.filter(p => {
            p.update();
            return !p.isDead();
        });
        
        // Actualizar partículas de explosión
        this.explosionParticles = this.explosionParticles.filter(p => {
            p.update();
            return !p.isDead();
        });
        
        // Actualizar nave (solo si no está pausado)
        if (this.ship) {
            this.ship.update(this.pausedForMessage);
        }
        
        // Actualizar objetivo
        if (this.target) {
            if (this.target instanceof Target) {
                const shipDistance = this.ship ? 
                    Math.sqrt((this.ship.x - this.target.x) ** 2 + (this.ship.y - this.target.y) ** 2) : Infinity;
                const shipX = this.ship ? this.ship.x : null;
                const shipY = this.ship ? this.ship.y : null;
                this.target.update(shipDistance, this.canvas.width, this.canvas.height, shipX, shipY);
            } else if (this.target.update) {
                this.target.update();
            }
        }
        
        // Actualizar enemigo (el disparo de misiles se maneja con el spawner)
        if (this.enemigo && this.enemigo.update) {
            this.enemigo.update(currentTime);
        }
        
        // Actualizar misiles (solo si no está pausado)
        const mobileScale = this.getMobileScale();
        this.misiles.forEach(misil => {
            if (this.ship) {
                misil.update(this.ship.x, this.ship.y);
            }
            // Aplicar escala móvil a misiles
            if (this.isMobile && misil.radius) {
                misil.radius = 16 * mobileScale; // Tamaño base * escala
            }
        });
        
        // Eliminar misiles fuera de pantalla
        this.misiles = this.misiles.filter(misil => {
            return misil.x > -50 && misil.x < this.canvas.width + 50 &&
                   misil.y > -50 && misil.y < this.canvas.height + 50;
        });
        
        // Verificar colisiones
        this.checkCollisions();
    }

    render() {
        // Dibujar fondo de galaxia
        const fondoImg = this.assetLoader.getImage('fondo');
        if (fondoImg && fondoImg.complete) {
            drawBackground(this.ctx, fondoImg, this.canvas.width, this.canvas.height);
        } else {
            // Fallback
            this.ctx.fillStyle = '#1a0a2e';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        }
        
        // Dibujar partículas de estrellas
        this.starParticles.forEach(particle => {
            particle.render(this.ctx);
        });
        
        // Dibujar enemigo
        if (this.enemigo && this.enemigo.draw) {
            this.enemigo.draw(this.ctx);
        }
        
        // Dibujar objetivo
        if (this.target) {
            if (this.target instanceof Target && this.ship) {
                const shipDistance = Math.sqrt(
                    (this.ship.x - this.target.x) ** 2 + (this.ship.y - this.target.y) ** 2
                );
                this.target.render(this.ctx, shipDistance);
            } else if (this.target instanceof PlanetaTierra) {
                // PlanetaTierra tiene su propio método draw() que llama a render()
                if (this.target.draw) {
                    this.target.draw(this.ctx);
                } else if (this.target.render) {
                    this.target.render(this.ctx);
                }
            } else if (this.target.draw) {
                this.target.draw(this.ctx);
            } else if (this.target.render) {
                this.target.render(this.ctx);
            }
        }
        
        // Dibujar misiles
        this.misiles.forEach(misil => {
            misil.render(this.ctx);
        });
        
        // Dibujar nave
        if (this.ship && this.ship.draw) {
            this.ship.draw(this.ctx);
        }
        
        // Dibujar partículas de recolección
        this.collectionParticles.forEach(particle => {
            particle.render(this.ctx);
        });
        
        // Dibujar partículas de explosión
        this.explosionParticles.forEach(particle => {
            particle.render(this.ctx);
        });
    }

    restartGame() {
        // Reinicio completo desde pantalla final
        console.log('🔄 Reinicio completo del juego');
        this.stop();
        this.level = 1;
        this.clearLevel();
        this.ship = null;
        this.starParticles = [];
        this.collectionParticles = [];
        this.explosionParticles = [];
        this.uiManager.showGameScreen();
        this.start();
    }

    reset() {
        // Mantener compatibilidad con código existente
        this.restartGame();
    }
}
