import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import './db.js';

import juegosRouter from './routes/juegos.js';
import usuariosRouter from './routes/usuarios.js';
import transaccionesRouter from './routes/transacciones.js';
import bibliotecaRouter from './routes/biblioteca.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, 'public');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(publicDir));

app.get('/', (_req, res) => {
	res.sendFile(path.join(publicDir, 'index.html'));
});

app.use('/api/juegos', juegosRouter);
app.use('/api/usuarios', usuariosRouter);
app.use('/api/transacciones', transaccionesRouter);
app.use('/api/biblioteca', bibliotecaRouter);

app.listen(PORT, () => {
	console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
