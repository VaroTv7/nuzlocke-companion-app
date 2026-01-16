# ⚡ VaroLocke Companion App v2.0.1

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

**VaroLocke** es la herramienta definitiva de gestión para tus partidas de **Pokémon Nuzlocke**. Diseñada con una estética **Cyberpunk / Glassmorphism**, ofrece un control total sobre tu equipo, estadísticas y progreso en tiempo real.

---

## ✨ Características Principales

### 📊 Dashboard Táctico
- **Seguimiento Real**: Contador de vidas dinámico y medallero interactivo.
- **Vista de Equipo**: Visualización rápida del nivel, tipos y estado de tus Pokémon activos.

### 💻 Sistema de PC "Pro" (Novedades v2.0.1)
- **Editor de Movimientos Avanzado**:
    - 🏷️ **Iconos de Tipo**: Identificación visual instantánea.
    - 💥 **Categorías de Daño**: Diferenciación clara entre Físico, Especial y Estado.
    - 🔢 **Stats Detallados**: Visualización de PP, Potencia y Precisión.
    - ❓ **Diccionario de Ataques**: Haz clic en el icono de ayuda para ver la explicación completa del movimiento.
- **Gestión de Cajas Inteligente**: 
    - Organización lógica donde el **Equipo** es la base y el almacenamiento empieza en la **Caja 2**.
    - Evita confusiones de duplicidad entre el equipo y la primera caja.
- **Auto-Fill de PokeAPI**: Generación automática de sprites, tipos y habilidades al escribir la especie.

### ⚔️ Combat Tool v2.0
- **Calculadora de Debilidades**: Soporta doble tipo defensivo con multiplicadores de daño precisos (x4, x2, x0.5, x0.25, x0).
- **Localización Completa**: Todo en español para una experiencia fluida.

### 💾 Persistencia y Sincronización
- **Backend Robusto**: Sincronización automática con servidor local mediante Docker.
- **Smart Import**: Carga masiva de datos mediante JSON (ideal para migrar desde otras herramientas o backups).
- **Multi-Slot**: Gestiona varias partidas simultáneas sin sobrescribir datos.

---

## 🚀 Instalación y Despliegue

### 🛠️ Requisitos
- Node.js (v18+)
- Docker y Docker Compose (Recomendado para producción)

### 📦 Desarrollo Local
```bash
# Servidor de desarrollo
cd nuzlocke-app
npm install
npm run dev
```

### 🐳 Despliegue con Docker (Servidor)
Docker expondrá el **Frontend** en el puerto `8085` y la **API** en el `8086`.

```bash
# Usando script de despliegue
./deploy_final.ps1

# O manualmente
docker compose build
docker compose up -d
```

---

## ⚡ Formato del Smart Import
Puedes importar tu equipo pegando un JSON con el siguiente esquema en el menú de partidas guardadas:

```json
{
  "name": "Partida Maestra",
  "game": "Pokémon Nuzlocke",
  "team": ["Ignis", "Leviathan", "Sparky", "Spectre", "Mountain", "IQ"],
  "box_details": {
    "Ignis": {
      "name": "Charizard",
      "nickname": "Ignis",
      "level": 60,
      "item": "Carbón",
      "moves": ["Lanzallamas", "Tajo Aéreo", "Pulso Dragón", "Respiro"]
    },
    "Leviathan": {
      "name": "Gyarados",
      "nickname": "Leviathan",
      "level": 58,
      "item": "Agua Mística",
      "moves": ["Cascada", "Triturar", "Danza Dragón", "Colmillo Hielo"]
    },
    "Sparky": {
      "name": "Jolteon",
      "nickname": "Sparky",
      "level": 57,
      "item": "Imán",
      "moves": ["Rayo", "Voltiocambio", "Bola Sombra", "Onda Trueno"]
    },
    "Spectre": {
      "name": "Gengar",
      "nickname": "Spectre",
      "level": 59,
      "item": "Lodo Negro",
      "moves": ["Bola Sombra", "Bomba Lodo", "Brillo Mágico", "Mismo Destino"]
    },
    "Mountain": {
      "name": "Tyranitar",
      "nickname": "Mountain",
      "level": 62,
      "item": "Restos",
      "moves": ["Roca Afilada", "Triturar", "Terremoto", "Puño Hielo"]
    },
    "IQ": {
      "name": "Alakazam",
      "nickname": "IQ",
      "level": 58,
      "item": "Cuchara Torcida",
      "moves": ["Psíquico", "Onda Certera", "Recuperación", "Paz Mental"]
    }
  }
}
```

---

*Desarrollado con ❤️ por **VaroSobremesa** para el Proyecto Cobalt Supernova.*
