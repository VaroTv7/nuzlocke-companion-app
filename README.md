# VaroPokemon CompanioTool 🎮⚡

**Tu herramienta definitiva de Pokémon** — Companion app para Nuzlockes, partidas libres, y análisis competitivo. Soporta **todas las generaciones** (Gen 1-9 + Legends Z-A) con mecánicas avanzadas de batalla.

---

## ✨ Features

### 🎯 Modos de Juego
- **Nuzlocke** — Seguimiento de vidas, muertes, reglas activas, y objetivos
- **Libre** — Companion general sin restricciones para cualquier partida
- **Competitivo** — Enfocado en teambuilding y análisis de matchups

### ⚔️ Combat Tool
- **Matchups defensivos** — Calcula debilidades y resistencias por tipo
- **Teracristalización** — Override defensivo + STAB analysis (Gen 9)
- **Mega Evolución** — Base de datos completa con cambios de tipo, habilidad y stats
- **Movimientos Z** — Tabla de Z-Moves por tipo con base power
- **Dynamax/Gigantamax** — Max Moves con efectos secundarios
- **Battle Prep** — Añade el equipo rival y recibe análisis de counters automático

### 👥 Rival Lookup
- Equipos de **Líderes de Gimnasio**, **Alto Mando** y **Campeones** por juego
- Análisis de debilidades de cada equipo rival
- Disponible para: FRLG, Platino, ORAS, USUM, Espada/Escudo, Escarlata/Púrpura

### 🔨 Team Builder
- Construye equipos de 6 Pokémon (manualmente o desde tu PC)
- **Puntuación de equipo** (0-100) basada en cobertura
- **Debilidades compartidas** — Detecta tipos que golpean a 3+ miembros
- **Cobertura ofensiva** — Identifica tipos sin cubrir
- **Mapa defensivo** — Grid visual de resistencias vs debilidades por tipo

### 📱 PC Box
- Gestión de Pokémon con drag & drop entre cajas
- Información detallada: tipos, habilidad, ataques, objeto, naturaleza
- Soporte para Shiny tracking

### 🤖 AI Coach (Gemini)
- Coach adaptativo según el modo de juego
- Análisis contextual del equipo, medallas, y estado de la partida
- Modelos disponibles: Gemini 2.5 Pro, 2.5 Flash, 2.0 Flash

### 🎮 25+ Juegos Soportados
Todas las generaciones desde Red/Blue hasta Legends Z-A, incluyendo:
- Un modo **"Fan Game — Todas las Mecánicas"** para fan games que incluyen todo

---

## 🚀 Quick Start (Desarrollo)

```bash
# Frontend
cd nuzlocke-app
npm install
npm run dev       # http://localhost:8085

# Backend (opcional, para saves del servidor)
cd backend
npm install
npm start         # http://localhost:8086
```

## 🐋 Docker Deploy

```bash
docker compose up -d --build
# Frontend: http://localhost:8085
# Backend API: http://localhost:8086
```

---

## 🛠️ Tech Stack

| Componente | Tecnología |
|-----------|-----------|
| Frontend | React 19, TypeScript, Vite 7 |
| Routing | React Router v7 |
| Animaciones | Framer Motion |
| State | Zustand (persist + migration) |
| Estilos | Tailwind CSS 3 (Cyberpunk theme) |
| AI | Google Gemini API |
| Backend | Node.js, Express, SQLite |
| Deploy | Docker, Nginx |

---

## 📁 Estructura

```
├── nuzlocke-app/              # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Builder/       # Team Builder
│   │   │   ├── Combat/        # CombatView + RivalLookup
│   │   │   ├── Dashboard/     # Dashboard + AI Coach + Notes
│   │   │   ├── Dex/           # Pokédex + MoveDex
│   │   │   ├── Layout/        # AppLayout (sidebar + bottom nav)
│   │   │   ├── PC/            # PC Box management
│   │   │   ├── Rules/         # Nuzlocke rules
│   │   │   └── Shared/        # Skeleton, CustomSelect, CustomInput, etc.
│   │   ├── store/             # Zustand store (v4)
│   │   └── utils/             # gameRegistry, mechanicsData, rivalTeams, typeChart, gemini
│   └── Dockerfile
├── backend/                   # Node.js API
├── docker-compose.yml
├── nginx.conf
└── README.md
```

---

## 👤 Créditos

Desarrollado por **ElVarto** (VaroTv7)

> ⚠️ Este proyecto es un fan-project sin fines comerciales. Pokémon es marca registrada de Nintendo/Game Freak/The Pokémon Company.
