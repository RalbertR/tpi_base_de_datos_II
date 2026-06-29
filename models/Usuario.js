import mongoose from 'mongoose';

const usuarioSchema = new mongoose.Schema({
	username: { type: String, required: true },
	email: { type: String, required: true },
	fecha_registro: { type: Date, default: Date.now },
	estado_cuenta: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
});

const Usuario = mongoose.model('usuarios', usuarioSchema);

export default Usuario;
