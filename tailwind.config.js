/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // Semáforo de Prioridades
        'sipa-urgent': '#D32F2F',
        'sipa-alert': '#F57C00',
        'sipa-important': '#1976D2',
        'sipa-normal': '#424242',

        // Estados de Validación
        'sipa-validated': '#2E7D32',
        'sipa-returned': '#C62828',
        'sipa-process': '#0288D1',
        'sipa-pending': '#757575',
        'sipa-unknown': '#9E9E9E',

        // Escenarios de Viabilidad
        'sipa-enabled': '#43A047',
        'sipa-pre-enabled': '#7CB342',
        'sipa-high-possibility': '#FDD835',
        'sipa-possibility': '#FFB300',
        'sipa-no-possibility': '#B0BEC5',

        // Marca Institucional
        'sipa-primary': '#0033A0',
        'sipa-secondary': '#D92330',
        'sipa-accent': '#00C3E3',
      }
    },
  },
  plugins: [],
}
