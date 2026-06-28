import mongoose from 'mongoose';

const requisitosSchema = new mongoose.Schema({
	so: String,
	procesador: String,
	ram: String,
	graficos: String,
	almacenamiento: String,
}, { _id: false });

const juegoSchema = new mongoose.Schema({
	titulo: { type: String, required: true },
	precio: { type: Number, required: true },
	desarrollador: { type: String, required: true },
	disponible_en_tienda: { type: Boolean, default: true },
	requisitos_sistema: {
		minimos: requisitosSchema,
		recomendados: requisitosSchema,
	},
	idiomas_soportados: {
		audio: [String],
		subtitulos: [String],
	},
});

const Juego = mongoose.model('juegos', juegoSchema);

export default Juego;
