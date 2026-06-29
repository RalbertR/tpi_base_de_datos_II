import { Router } from 'express';
import Biblioteca from '../models/Biblioteca.js';

const router = Router();

// CREATE
router.post('/', async (req, res) => {
	try {
		const entrada = await Biblioteca.create(req.body);
		res.status(201).json(entrada);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// READ — toda la biblioteca
router.get('/', async (req, res) => {
	try {
		const biblioteca = await Biblioteca.find();
		res.json(biblioteca);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// READ — por ID de entrada
router.get('/:id', async (req, res) => {
	try {
		const entrada = await Biblioteca.findById(req.params.id);
		if (!entrada) return res.status(404).json({ error: 'Entrada no encontrada' });
		res.json(entrada);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// READ — juegos de un usuario
router.get('/usuario/:id_usuario', async (req, res) => {
	try {
		const juegos = await Biblioteca.find({ id_usuario: req.params.id_usuario });
		res.json(juegos);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// UPDATE — cambiar estado (activo/removido)
router.patch('/:id/estado', async (req, res) => {
	try {
		const { estado } = req.body;
		const entrada = await Biblioteca.findByIdAndUpdate(
			req.params.id,
			{ estado },
			{ new: true, runValidators: true }
		);
		if (!entrada) return res.status(404).json({ error: 'Entrada no encontrada' });
		res.json(entrada);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

export default router;
