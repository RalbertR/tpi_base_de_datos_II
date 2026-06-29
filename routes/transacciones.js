import { Router } from 'express';
import Transaccion from '../models/Transaccion.js';

const router = Router();

// CREATE
router.post('/', async (req, res) => {
	try {
		const transaccion = await Transaccion.create(req.body);
		res.status(201).json(transaccion);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// READ — todas
router.get('/', async (req, res) => {
	try {
		const transacciones = await Transaccion.find();
		res.json(transacciones);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// READ — una por ID
router.get('/:id', async (req, res) => {
	try {
		const transaccion = await Transaccion.findById(req.params.id);
		if (!transaccion) return res.status(404).json({ error: 'Transaccion no encontrada' });
		res.json(transaccion);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// UPDATE
router.put('/:id', async (req, res) => {
	try {
		const transaccion = await Transaccion.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!transaccion) return res.status(404).json({ error: 'Transaccion no encontrada' });
		res.json(transaccion);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// DELETE
router.delete('/:id', async (req, res) => {
	try {
		const transaccion = await Transaccion.findByIdAndDelete(req.params.id);
		if (!transaccion) return res.status(404).json({ error: 'Transaccion no encontrada' });
		res.json(transaccion);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
