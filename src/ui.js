// Manejo de la interfaz de usuario
export class UIManager {
    constructor() {
        this.mainMenu = document.getElementById('main-menu');
        this.gameScreen = document.getElementById('game-screen');
        this.victoryScreen = document.getElementById('victory-screen');
        this.finalScreen = document.getElementById('final-screen');
        this.startBtn = document.getElementById('start-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.finalRestartBtn = document.getElementById('final-restart-btn');
        this.messagePanel = document.getElementById('message-panel');
        this.messageText = document.getElementById('message-text');
        this.closeMessageBtn = document.getElementById('close-message-btn');
        this.foundCount = document.getElementById('found-count');
        this.totalCount = document.getElementById('total-count');
        this.counterText = document.getElementById('counter-text');
        
        this.startGameCallback = null;
        this.startGameHandler = null;
        this.awaitingAdvance = false;
        this.advanceLevelCallback = null;
        
        console.log('UIManager inicializado');
        console.log('Botón start-btn encontrado:', !!this.startBtn);
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.closeMessageBtn) {
            this.closeMessageBtn.addEventListener('click', () => {
                // Si está esperando avanzar, ejecutar callback
                if (this.awaitingAdvance && this.advanceLevelCallback) {
                    this.awaitingAdvance = false;
                    this.advanceLevelCallback();
                } else {
                    this.hideMessage();
                }
            });
        }
        
        // Listener para ENTER cuando se espera avanzar
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && this.awaitingAdvance) {
                e.preventDefault();
                this.awaitingAdvance = false;
                if (this.advanceLevelCallback) {
                    this.advanceLevelCallback();
                }
            }
        });
    }

    showMainMenu() {
        this.hideAllScreens();
        this.mainMenu.classList.remove('hidden');
    }

    showGameScreen() {
        console.log('🖥️ showGameScreen() llamado');
        console.log('gameScreen existe:', !!this.gameScreen);
        this.hideAllScreens();
        if (this.gameScreen) {
            this.gameScreen.classList.remove('hidden');
            console.log('✅ Pantalla de juego mostrada (hidden removido)');
            console.log('Canvas visible:', !this.gameScreen.classList.contains('hidden'));
        } else {
            console.error('❌ gameScreen no existe');
        }
    }

    showVictoryScreen() {
        this.hideAllScreens();
        this.victoryScreen.classList.remove('hidden');
    }

    hideAllScreens() {
        this.mainMenu.classList.add('hidden');
        this.gameScreen.classList.add('hidden');
        this.victoryScreen.classList.add('hidden');
        if (this.finalScreen) {
            this.finalScreen.classList.add('hidden');
        }
    }

    showMessage(text, requiresEnter = false) {
        this.messageText.textContent = text;
        this.messagePanel.classList.remove('hidden');
        
        if (requiresEnter) {
            this.awaitingAdvance = true;
            // Cambiar texto del botón si existe
            if (this.closeMessageBtn) {
                this.closeMessageBtn.textContent = 'Presiona ENTER para continuar';
            }
        } else {
            this.awaitingAdvance = false;
            if (this.closeMessageBtn) {
                this.closeMessageBtn.textContent = 'Continuar';
            }
        }
    }

    hideMessage() {
        this.messagePanel.classList.add('hidden');
        this.awaitingAdvance = false;
        if (this.closeMessageBtn) {
            this.closeMessageBtn.textContent = 'Continuar';
        }
    }

    updateCounter(found, total) {
        if (this.foundCount) this.foundCount.textContent = found;
        if (this.totalCount) this.totalCount.textContent = total;
        if (this.counterText) {
            this.counterText.textContent = 'objetos encontrados';
        }
    }

    updateLevel(current, max) {
        if (this.counterText) {
            this.counterText.textContent = `Nivel ${current} / ${max}`;
        }
    }

    showFinalUnlocked() {
        if (this.counterText) {
            this.counterText.textContent = '¡Objetivo final desbloqueado! → Dirígete al Planeta Tierra';
        }
    }

    showFinalScreen() {
        this.hideAllScreens();
        if (this.finalScreen) {
            this.finalScreen.classList.remove('hidden');
        }
    }

    onStartGame(callback) {
        console.log('onStartGame llamado con callback:', !!callback);
        this.startGameCallback = callback;
        
        // Buscar el botón de nuevo por si no se encontró en el constructor
        if (!this.startBtn) {
            this.startBtn = document.getElementById('start-btn');
            console.log('Buscando botón start-btn de nuevo:', !!this.startBtn);
        }
        
        if (this.startBtn) {
            // Remover listener anterior si existe para evitar duplicados
            if (this.startGameHandler) {
                this.startBtn.removeEventListener('click', this.startGameHandler);
            }
            
            this.startGameHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('✅ Botón "Entrar al Universo" presionado - Handler ejecutado');
                this.showGameScreen();
                console.log('Pantalla de juego mostrada');
                if (this.startGameCallback) {
                    console.log('Ejecutando callback de inicio');
                    try {
                        this.startGameCallback();
                    } catch (error) {
                        console.error('Error al ejecutar callback:', error);
                    }
                } else {
                    console.warn('No hay callback configurado');
                }
            };
            
            this.startBtn.addEventListener('click', this.startGameHandler);
            console.log('✅ Event listener agregado al botón start-btn');
        } else {
            console.error('❌ ERROR: No se encontró el botón start-btn en el DOM');
            // Intentar agregar el listener directamente al botón si existe
            const btn = document.querySelector('#start-btn');
            if (btn) {
                console.log('Botón encontrado con querySelector, agregando listener');
                btn.addEventListener('click', () => {
                    console.log('Botón presionado (querySelector)');
                    this.showGameScreen();
                    if (this.startGameCallback) {
                        this.startGameCallback();
                    }
                });
            }
        }
    }

    onRestart(callback) {
        if (this.restartBtn) {
            this.restartBtn.addEventListener('click', () => {
                this.showMainMenu();
                if (callback) callback();
            });
        }
        if (this.finalRestartBtn) {
            this.finalRestartBtn.addEventListener('click', () => {
                if (callback) callback();
            });
        }
    }

    onAdvanceLevel(callback) {
        this.advanceLevelCallback = callback;
    }
}

