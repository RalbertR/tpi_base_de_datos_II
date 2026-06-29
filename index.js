import express from 'express';
import cors from 'cors';
import './db.js';

import juegosRouter from './routes/juegos.js';
import usuariosRouter from './routes/usuarios.js';
import transaccionesRouter from './routes/transacciones.js';
import bibliotecaRouter from './routes/biblioteca.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/juegos', juegosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/transacciones', transaccionesRouter);
app.use('/api/biblioteca', bibliotecaRouter);

app.listen(PORT, () => {
	console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
