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

// READ — por defecto solo activos; ?todos=true incluye removidos
router.get('/', async (req, res) => {
	try {
		const filtro = req.query.todos === 'true' ? {} : { estado: 'activo' };
		const biblioteca = await Biblioteca.find(filtro);
		res.json(biblioteca);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// READ — uno por ID
router.get('/:id', async (req, res) => {
	try {
		const entrada = await Biblioteca.findById(req.params.id);
		if (!entrada) return res.status(404).json({ error: 'Entrada no encontrada' });
		res.json(entrada);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// UPDATE
router.put('/:id', async (req, res) => {
	try {
		const entrada = await Biblioteca.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!entrada) return res.status(404).json({ error: 'Entrada no encontrada' });
		res.json(entrada);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// DELETE — baja lógica (reembolso)
router.delete('/:id', async (req, res) => {
	try {
		const entrada = await Biblioteca.findByIdAndUpdate(
			req.params.id,
			{ estado: 'removido' },
			{ new: true }
		);
		if (!entrada) return res.status(404).json({ error: 'Entrada no encontrada' });
		res.json(entrada);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
