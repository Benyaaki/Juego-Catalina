import { Game } from './game.js';
import { UIManager } from './ui.js';

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM cargado, inicializando juego...');
    
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error('❌ No se encontró el canvas con id "game-canvas"');
        return;
    }
    console.log('✅ Canvas encontrado');
    
    const uiManager = new UIManager();
    const game = new Game(canvas, uiManager);
    
    console.log('✅ Game y UIManager creados');
    
    // Verificar que el botón existe ANTES de configurar el callback
    const startBtn = document.getElementById('start-btn');
    if (!startBtn) {
        console.error('❌ No se encontró el botón con id "start-btn"');
        console.log('Elementos disponibles:', document.querySelectorAll('button').length, 'botones');
    } else {
        console.log('✅ Botón start-btn encontrado en el DOM');
    }
    
    // Configurar eventos de UI
    console.log('Configurando callback onStartGame...');
    uiManager.onStartGame(() => {
        console.log('🎮 Callback onStartGame ejecutado - iniciando juego');
        try {
            game.start();
            console.log('✅ game.start() ejecutado correctamente');
        } catch (error) {
            console.error('❌ Error al ejecutar game.start():', error);
        }
    });
    
    // LISTENER DIRECTO COMO RESPALDO (por si acaso)
    if (startBtn) {
        const directHandler = () => {
            console.log('🔥 LISTENER DIRECTO: Botón presionado');
            uiManager.showGameScreen();
            game.start();
        };
        startBtn.addEventListener('click', directHandler);
        console.log('✅ Listener directo agregado como respaldo');
    }
    
    uiManager.onRestart(() => {
        console.log('🔄 Reiniciando juego...');
        game.restartGame();
    });
    
    // Configurar callback para avanzar nivel con ENTER
    uiManager.onAdvanceLevel(() => {
        console.log('⏭️ Avanzando al siguiente nivel...');
        game.resumeAfterMessage();
    });
    
    console.log('✅ Inicialización completa');
});

