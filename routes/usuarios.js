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

// READ — por defecto solo activos; ?todos=true incluye dados de baja
router.get('/', async (req, res) => {
	try {
		const filtro = req.query.todos === 'true' ? {} : { estado_cuenta: 'activo' };
		const usuarios = await Usuario.find(filtro);
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
		const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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
			{ new: true, runValidators: true }
		);
		if (!usuario) return res.status(404).json({ error: 'Usuario no encontrado' });
		res.json(usuario);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
