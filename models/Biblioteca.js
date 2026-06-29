import mongoose from 'mongoose';

const bibliotecaSchema = new mongoose.Schema({
	id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios', required: true },
	id_juego: { type: mongoose.Schema.Types.ObjectId, ref: 'juegos', required: true },
	fecha_adquisicion: { type: Date, default: Date.now },
	estado: { type: String, enum: ['activo', 'removido'], default: 'activo' },
});

bibliotecaSchema.index({ id_usuario: 1, id_juego: 1 }, { unique: true });

const Biblioteca = mongoose.model('biblioteca', bibliotecaSchema);

export default Biblioteca;
