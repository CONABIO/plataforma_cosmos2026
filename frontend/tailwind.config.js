/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        musgo: { 50:"#eef3ef",100:"#d6e3da",300:"#7fa78d",500:"#3e6b4f",700:"#2a4937",900:"#1f3d2b" },
        ocre:  { 400:"#c97f44",500:"#b6622b",700:"#8a4a20" },
        arena: { 100:"#faf7f0",200:"#efe7d8",300:"#e2d6bf" },
        carbon:{ 800:"#27271f",900:"#1b1b18" },
        conabio:{ 50:"#f1f8f1",600:"#2a722a",700:"#235a23",800:"#1f481f" },
      },
      fontFamily: {
        display: ["Fraunces","ui-serif","Georgia","serif"],
        sans:    ["Inter","ui-sans-serif","system-ui","sans-serif"],
        mono:    ["IBM Plex Mono","ui-monospace","monospace"],
      },
    },
  },
  plugins: [],
}
