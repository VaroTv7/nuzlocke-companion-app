/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                glass: {
                    100: 'rgba(255, 255, 255, 0.1)',
                    200: 'rgba(255, 255, 255, 0.15)',
                    300: 'rgba(255, 255, 255, 0.2)',
                },
                cyber: {
                    primary: '#00f3ff',
                    secondary: '#bc13fe',
                    dark: '#0a0a0f',
                    panel: '#151520',
                    success: '#00ff9d',
                    warning: '#ffb86c',
                    danger: '#ff5555',
                },
                type: {
                    normal: '#A8A77A',
                    fire: '#EE8130',
                    water: '#6390F0',
                    electric: '#F7D02C',
                    grass: '#7AC74C',
                    ice: '#96D9D6',
                    fighting: '#C22E28',
                    poison: '#A33EA1',
                    ground: '#E2BF65',
                    flying: '#A98FF3',
                    psychic: '#F95587',
                    bug: '#A6B91A',
                    rock: '#B6A136',
                    ghost: '#735797',
                    dragon: '#6F35FC',
                    dark: '#705746',
                    steel: '#B7B7CE',
                    fairy: '#D685AD',
                }
            },
            fontFamily: {
                cyber: ['Rajdhani', 'sans-serif'],
                retro: ['"Press Start 2P"', 'cursive'],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
}
