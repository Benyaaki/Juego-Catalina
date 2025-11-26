# Universo de Catalina - Feliz Cumpleaños ✨

Un juego 2D interactivo diseñado como saludo de cumpleaños personal, con estilo pastel minimalista y humor absurdo.

## 🎮 Características

- **Estilo Pastel Minimalista**: Colores suaves (rosa pastel, lavanda, beige, café pastel, celeste suave)
- **Universo Interactivo**: Planetas animados, cometas, nebulosas y más
- **Minijuego**: Busca perritos salchicha ocultos en el universo
- **Mensajes Absurdos**: Mensajes de cumpleaños con humor galáctico
- **Animaciones Suaves**: Todo animado con requestAnimationFrame

## 🚀 Instalación y Ejecución

### Opción 1: Servidor Local Simple (Python)

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Luego abre tu navegador en: `http://localhost:8000/public/`

### Opción 2: Servidor Local Simple (Node.js)

```bash
# Instalar http-server globalmente
npm install -g http-server

# Ejecutar en el directorio del proyecto
http-server -p 8000
```

Luego abre tu navegador en: `http://localhost:8000/public/`

### Opción 3: Live Server (VS Code)

1. Instala la extensión "Live Server" en VS Code
2. Haz clic derecho en `public/index.html`
3. Selecciona "Open with Live Server"

## 📁 Estructura del Proyecto

```
/
├── public/
│   ├── index.html          # Página principal
│   └── styles.css          # Estilos pastel
├── src/
│   ├── main.js            # Punto de entrada
│   ├── game.js            # Lógica principal del juego
│   ├── sprites.js         # Clases de sprites (planetas, perritos, etc.)
│   ├── messages.js        # Mensajes de humor absurdo
│   └── ui.js              # Manejo de interfaz de usuario
└── README.md
```

## 🎯 Cómo Jugar

1. Haz clic en "Entrar al Universo" en la pantalla principal
2. Explora el universo y busca perritos salchicha ocultos
3. Haz clic en cada perrito que encuentres
4. Lee los mensajes absurdos que aparecen
5. Encuentra todos los perritos para completar el universo

## 🪐 Elementos del Universo

- **Planeta Catalina**: El planeta central pastel rosa
- **Planeta Choripán**: Un choripán espacial orbitando
- **Nebulosa de Vino Chileno**: Nube morada pastel
- **Cometa Milo J**: Cometa con estela morada
- **Luna Salchicha**: Perro salchicha orbitando estilo cartoon
- **Perritos Ocultos**: 5-8 perritos salchicha pastel escondidos

## 🛠️ Tecnologías

- **JavaScript Vanilla**: Sin frameworks pesados
- **Canvas 2D**: Renderizado de gráficos
- **CSS3**: Estilos pastel y animaciones
- **Google Fonts**: Tipografía Nunito

## 📝 Notas

- El juego funciona completamente en el navegador sin dependencias externas
- Todos los sprites se dibujan con Canvas (no se requieren imágenes)
- Las animaciones son suaves gracias a requestAnimationFrame
- El juego es responsive y se adapta al tamaño de la ventana

## 🎨 Personalización

Puedes personalizar:
- Colores en `styles.css`
- Mensajes en `src/messages.js`
- Número de perritos en `src/game.js` (línea donde se define `totalPerritos`)
- Posiciones de elementos en `src/game.js`

---

¡Feliz cumpleaños Catalina! 🎉✨🐶🌭🍷💖

