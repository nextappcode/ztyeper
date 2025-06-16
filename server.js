const express = require('express');
const app = express();
const path = require('path');

// Sirve archivos estáticos desde el directorio actual
app.use(express.static(path.join(__dirname, '.')));

// Ruta para el archivo index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Escucha en el puerto que Glitch asigna (process.env.PORT)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
