import { Router } from 'express';
import Juego from '../models/Juego.js';

const router = Router();

// CREATE
router.post('/', async (req, res) => {
	try {
		const juego = await Juego.create(req.body);
		res.status(201).json(juego);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// READ — por defecto solo activos; ?todos=true incluye dados de baja
router.get('/', async (req, res) => {
	try {
		const filtro = req.query.todos === 'true' ? {} : { disponible_en_tienda: true };
		const juegos = await Juego.find(filtro);
		res.json(juegos);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// READ — uno por ID
router.get('/:id', async (req, res) => {
	try {
		const juego = await Juego.findById(req.params.id);
		if (!juego) return res.status(404).json({ error: 'Juego no encontrado' });
		res.json(juego);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

// UPDATE
router.put('/:id', async (req, res) => {
	try {
		const juego = await Juego.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		if (!juego) return res.status(404).json({ error: 'Juego no encontrado' });
		res.json(juego);
	} catch (error) {
		res.status(400).json({ error: error.message });
	}
});

// DELETE — baja lógica
router.delete('/:id', async (req, res) => {
	try {
		const juego = await Juego.findByIdAndUpdate(
			req.params.id,
			{ disponible_en_tienda: false },
			{ new: true, runValidators: true }
		);
		if (!juego) return res.status(404).json({ error: 'Juego no encontrado' });
		res.json(juego);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
