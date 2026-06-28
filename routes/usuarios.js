import { Router } from 'express';
import Usuario from '../models/Usuario.js';

const router = Router();

// CREATE
router.post('/', async (req, res) => {
	try {
		const usuario = await Usuario.create(req.body);
		res.status(201).json(usuario);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// READ — solo cuentas activas (baja lógica)
router.get('/', async (req, res) => {
	try {
		const usuarios = await Usuario.find({ estado_cuenta: 'activo' });
		res.json(usuarios);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// READ — uno por ID
router.get('/:id', async (req, res) => {
	try {
		const usuario = await Usuario.findById(req.params.id);
		if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
		res.json(usuario);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// UPDATE
router.put('/:id', async (req, res) => {
	try {
		const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
		if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
		res.json(usuario);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// DELETE — baja lógica
router.delete('/:id', async (req, res) => {
	try {
		const usuario = await Usuario.findByIdAndUpdate(
			req.params.id,
			{ estado_cuenta: 'inactivo' },
			{ new: true }
		);
		if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
		res.json(usuario);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
