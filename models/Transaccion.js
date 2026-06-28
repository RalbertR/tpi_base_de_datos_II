import mongoose from 'mongoose';

const transaccionSchema = new mongoose.Schema({
	id_usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'usuarios', required: true },
	id_juego: { type: mongoose.Schema.Types.ObjectId, ref: 'juegos', required: true },
	fecha_compra: { type: Date, default: Date.now },
	monto_pagado: { type: Number, required: true },
	metodo_pago: { type: String, required: true },
});

const Transaccion = mongoose.model('transacciones', transaccionSchema);

export default Transaccion;
