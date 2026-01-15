# ⚡ VaroLocke Companion App v2.0

Aplicación web progresiva (PWA) diseñada para gestionar tus partidas de **Pokémon Nuzlocke**, optimizada específicamente para cualquier juego de la franquicia.

Construida con **React + TypeScript + Vite + TailwindCSS** y un backend ligero en **Node.js**.

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## ✨ Características Principales

### 📊 Dashboard Táctico
- **Contador de Vidas**: Gestión visual de tus 10 vidas.
- **Medallero**: Seguimiento de progreso por gimnasios.
- **Equipo Activo**: Vista rápida de tu "Team" actual con niveles y estados.

### 💻 Sistema de PC Avanzado
- **Gestión de Cajas**: Organiza tus Pokémon en cajas, equipo activo o cementerio.
- **Editor Completo**: Modifica estadísticas, movimientos, objetos, naturaleza y habilidad.
- **Sprite Automático**: Al escribir la especie, busca automáticamente el sprite oficial.

### ⚔️ Calculadora de Combate 2.0
- **Doble Tipo Defensivo**: Selecciona hasta 2 tipos defensores.
- **Multiplicadores Reales**: Calcula debilidades (x2, x4) y resistencias (x0.5, x0.25, x0).
- **Traducción al Español**: Nombres de tipos y estados localizados.

### 💾 Sistema de Guardado Multi-Slot
- **Backend Node.js**: Sincronización de partidas en servidor local.
- **Smart Import (NUEVO)**: ⚡ Importa datos desde JSON simplificado.
- **Guardar Como...**: Clona tu partida actual sin perder progreso.
- **Exportar/Importar**: Descarga tu partida como archivo `.json` para backups en USB.

## 🚀 Despliegue e Instalación

### Requisitos
- Node.js (v18+)
- Docker & Docker Compose (Recomendado para servidor)

### Desarrollo Local
```bash
cd nuzlocke-app
npm install
npm run dev
```

### Despliegue en Servidor (Docker)
Utiliza el script de PowerShell incluido para construir y levantar los contenedores:

```powershell
./deploy_final.ps1
```

Esto levantará:
- **Frontend** en el puerto `8085`
- **Backend API** en el puerto `8086`

## ⚡ Smart Import (Cómo usar)
1. Ve al menú de "Partidas Guardadas" (icono carpeta).
2. Pulsa el botón del rayo (⚡).
3. Pega tu JSON con el formato (Ejemplo Profesional):

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

4. ¡Listo! La app generará tu partida.

---
*Developed by VaroSobremesa for Project Cobalt Supernova*
