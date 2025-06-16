
const express = require('express');
const app = express();
const path = require('path');

// Sirve archivos estáticos desde el directorio actual (incluye media, fonts, etc.)
app.use(express.static(path.join(__dirname)));

// Ruta principal que sirve el juego
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Escucha en el puerto 5000 (recomendado para Replit)
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ZType Trainer server running on port ${PORT}`);
  console.log('¡El juego está listo! Usa el botón Run para iniciar.');
});
