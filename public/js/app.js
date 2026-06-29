const API = {
	juegos: '/api/juegos',
	usuarios: '/api/usuarios',
	transacciones: '/api/transacciones',
	biblioteca: '/api/biblioteca',
};

let juegosCache = [];
let usuariosCache = [];
let bibliotecaCache = [];

// --- Utilidades ---

async function request(url, options = {}) {
	const res = await fetch(url, {
		headers: { 'Content-Type': 'application/json' },
		...options,
	});
	const data = await res.json().catch(() => ({}));
	if (!res.ok) throw new Error(data.error || 'Error en la solicitud');
	return data;
}

function escapeHtml(text) {
	return String(text ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

function formatDate(dateStr) {
	if (!dateStr) return '-';
	return new Date(dateStr).toLocaleDateString('es-AR');
}

function formatDateInput(dateStr) {
	if (!dateStr) return '';
	return new Date(dateStr).toISOString().slice(0, 10);
}

function dateInputToISO(value) {
	if (!value) return undefined;
	return new Date(`${value}T12:00:00`).toISOString();
}

function parseList(str) {
	return String(str ?? '').split(',').map((s) => s.trim()).filter(Boolean);
}

function formatList(arr) {
	return Array.isArray(arr) ? arr.join(', ') : '';
}

function setStatus(id, message, isError = false) {
	const el = document.getElementById(id);
	el.textContent = message;
	el.classList.toggle('error', isError);
}

function shortId(id) {
	return id ? `${String(id).slice(-6)}` : '-';
}

function normalizeId(id) {
	if (id == null) return '';
	if (typeof id === 'object' && id.$oid) return id.$oid;
	return String(id);
}

function fillSelect(select, items, labelFn) {
	select.innerHTML = items.length
		? items.map((item) => `<option value="${normalizeId(item._id)}">${escapeHtml(labelFn(item))}</option>`).join('')
		: '<option value="">— Sin datos —</option>';
}

function setSelectValue(select, value, label = null) {
	const id = normalizeId(value);
	if (!id) return;
	const exists = [...select.options].some((o) => o.value === id);
	if (!exists) {
		const opt = document.createElement('option');
		opt.value = id;
		opt.textContent = label ?? id;
		select.appendChild(opt);
	}
	select.value = id;
}

async function findForEdit(api, id, cache = []) {
	const normalized = normalizeId(id);
	const fromCache = cache.find((item) => normalizeId(item._id) === normalized);
	return fromCache ?? request(`${api}/${normalized}`);
}

async function loadTransaccionSelects() {
	const [usuariosTodos, juegosTodos] = await Promise.all([
		request(`${API.usuarios}?todos=true`),
		request(`${API.juegos}?todos=true`),
	]);
	usuariosCache = usuariosTodos;
	juegosCache = juegosTodos;
	fillSelect(transaccionUsuario, usuariosTodos, (u) => `${u.username}${u.estado_cuenta !== 'activo' ? ' (inactivo)' : ''}`);
	fillSelect(transaccionJuego, juegosTodos, (j) => `${j.titulo} ($${j.precio})${!j.disponible_en_tienda ? ' (de baja)' : ''}`);
}

async function loadBibliotecaSelects() {
	const [usuariosTodos, juegosTodos] = await Promise.all([
		request(`${API.usuarios}?todos=true`),
		request(`${API.juegos}?todos=true`),
	]);
	usuariosCache = usuariosTodos;
	juegosCache = juegosTodos;
	fillSelect(bibliotecaUsuario, usuariosTodos, (u) => `${u.username}${u.estado_cuenta !== 'activo' ? ' (inactivo)' : ''}`);
	fillSelect(bibliotecaJuego, juegosTodos, (j) => `${j.titulo}${!j.disponible_en_tienda ? ' (de baja)' : ''}`);
}

function usuarioLabel(id) {
	const u = usuariosCache.find((item) => normalizeId(item._id) === normalizeId(id));
	return u ? u.username : shortId(id);
}

function juegoLabel(id) {
	const j = juegosCache.find((item) => normalizeId(item._id) === normalizeId(id));
	return j ? j.titulo : shortId(id);
}

function getRequisitos(prefix) {
	const fields = ['so', 'procesador', 'ram', 'graficos', 'almacenamiento'];
	const req = {};
	fields.forEach((f) => {
		const val = document.getElementById(`${prefix}-${f}`).value.trim();
		if (val) req[f] = val;
	});
	return req;
}

function setRequisitos(prefix, data = {}) {
	['so', 'procesador', 'ram', 'graficos', 'almacenamiento'].forEach((f) => {
		document.getElementById(`${prefix}-${f}`).value = data[f] ?? '';
	});
}

function buildJuegoBody() {
	return {
		titulo: document.getElementById('juego-titulo').value.trim(),
		precio: Number(document.getElementById('juego-precio').value),
		desarrollador: document.getElementById('juego-desarrollador').value.trim(),
		disponible_en_tienda: document.getElementById('juego-disponible').checked,
		requisitos_sistema: {
			minimos: getRequisitos('juego-min'),
			recomendados: getRequisitos('juego-rec'),
		},
		idiomas_soportados: {
			audio: parseList(document.getElementById('juego-audio').value),
			subtitulos: parseList(document.getElementById('juego-subtitulos').value),
		},
	};
}

function fillJuegoForm(j) {
	document.getElementById('juego-titulo').value = j.titulo ?? '';
	document.getElementById('juego-precio').value = j.precio ?? '';
	document.getElementById('juego-desarrollador').value = j.desarrollador ?? '';
	document.getElementById('juego-disponible').checked = j.disponible_en_tienda !== false;
	setRequisitos('juego-min', j.requisitos_sistema?.minimos);
	setRequisitos('juego-rec', j.requisitos_sistema?.recomendados);
	document.getElementById('juego-audio').value = formatList(j.idiomas_soportados?.audio);
	document.getElementById('juego-subtitulos').value = formatList(j.idiomas_soportados?.subtitulos);
}

function fillUsuarioForm(u) {
	usuarioId.value = normalizeId(u._id);
	usuarioUsername.value = u.username ?? '';
	usuarioEmail.value = u.email ?? '';
	usuarioFecha.value = formatDateInput(u.fecha_registro);
	usuarioEstado.value = u.estado_cuenta ?? 'activo';
}

function fillTransaccionForm(t) {
	transaccionId.value = normalizeId(t._id);
	setSelectValue(transaccionUsuario, t.id_usuario, usuarioLabel(t.id_usuario));
	setSelectValue(transaccionJuego, t.id_juego, juegoLabel(t.id_juego));
	transaccionFecha.value = formatDateInput(t.fecha_compra);
	transaccionMonto.value = t.monto_pagado ?? '';
	transaccionMetodo.value = t.metodo_pago ?? 'tarjeta_credito';
}

function fillBibliotecaForm(b) {
	bibliotecaId.value = normalizeId(b._id);
	setSelectValue(bibliotecaUsuario, b.id_usuario, usuarioLabel(b.id_usuario));
	setSelectValue(bibliotecaJuego, b.id_juego, juegoLabel(b.id_juego));
	bibliotecaFecha.value = formatDateInput(b.fecha_adquisicion);
	bibliotecaEstado.value = b.estado ?? 'activo';
}

function startEditMode({ formTitle, submitBtn, cancelBtn, title, submitText, form }) {
	formTitle.textContent = title;
	submitBtn.textContent = submitText;
	cancelBtn.hidden = false;
	form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function resetJuegoFormExtra() {
	document.getElementById('juego-disponible').checked = true;
	setRequisitos('juego-min', {});
	setRequisitos('juego-rec', {});
	document.getElementById('juego-audio').value = '';
	document.getElementById('juego-subtitulos').value = '';
}

// --- Tabs ---

document.querySelectorAll('.tab').forEach((btn) => {
	btn.addEventListener('click', () => {
		document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
		document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
		btn.classList.add('active');
		document.getElementById(`panel-${btn.dataset.tab}`).classList.add('active');
		if (btn.dataset.tab === 'transacciones') loadTransaccionesPanel();
		if (btn.dataset.tab === 'biblioteca') loadBibliotecaPanel();
	});
});

document.querySelectorAll('.refresh').forEach((btn) => {
	btn.addEventListener('click', () => {
		if (btn.dataset.refresh === 'juegos') loadJuegos();
		if (btn.dataset.refresh === 'usuarios') loadUsuarios();
		if (btn.dataset.refresh === 'transacciones') loadTransaccionesPanel();
		if (btn.dataset.refresh === 'biblioteca') loadBibliotecaPanel();
	});
});

// --- Juegos ---

const juegoForm = document.getElementById('juego-form');
const juegoId = document.getElementById('juego-id');
const juegoSubmit = document.getElementById('juego-submit');
const juegoCancel = document.getElementById('juego-cancel');
const juegoFormTitle = document.getElementById('juego-form-title');
const juegosBody = document.getElementById('juegos-body');
const juegosMostrarBaja = document.getElementById('juegos-mostrar-baja');

function resetJuegoForm() {
	juegoForm.reset();
	juegoId.value = '';
	resetJuegoFormExtra();
	juegoFormTitle.textContent = 'Nuevo juego';
	juegoSubmit.textContent = 'Crear';
	juegoCancel.hidden = true;
}

async function loadJuegos() {
	setStatus('juegos-status', 'Cargando...');
	try {
		const url = juegosMostrarBaja.checked ? `${API.juegos}?todos=true` : API.juegos;
		juegosCache = await request(url);
		renderJuegos();
		const activos = juegosCache.filter((j) => j.disponible_en_tienda !== false).length;
		const msg = juegosMostrarBaja.checked
			? `${juegosCache.length} juego(s) (${activos} activos, ${juegosCache.length - activos} de baja)`
			: `${juegosCache.length} juego(s) en tienda`;
		setStatus('juegos-status', msg);
	} catch (error) {
		juegosBody.innerHTML = '';
		setStatus('juegos-status', error.message, true);
	}
}

function renderJuegos() {
	if (!juegosCache.length) {
		juegosBody.innerHTML = '<tr><td colspan="6" class="empty">No hay juegos</td></tr>';
		return;
	}
	juegosBody.innerHTML = juegosCache.map((j) => {
		const activo = j.disponible_en_tienda !== false;
		const idiomas = [
			j.idiomas_soportados?.audio?.length ? `audio: ${j.idiomas_soportados.audio.join(', ')}` : '',
			j.idiomas_soportados?.subtitulos?.length ? `sub: ${j.idiomas_soportados.subtitulos.join(', ')}` : '',
		].filter(Boolean).join(' | ') || '-';
		return `
		<tr class="${activo ? '' : 'inactive'}">
			<td>${escapeHtml(j.titulo)}</td>
			<td>$${Number(j.precio).toFixed(2)}</td>
			<td>${escapeHtml(j.desarrollador)}</td>
			<td>${escapeHtml(idiomas)}</td>
			<td><span class="badge ${activo ? 'active' : 'inactive'}">${activo ? 'Activo' : 'De baja'}</span></td>
			<td class="actions">
				<button type="button" data-juego-edit="${j._id}">Editar</button>
				${activo
					? `<button type="button" class="danger" data-juego-delete="${j._id}">Eliminar</button>`
					: `<button type="button" data-juego-restore="${j._id}">Reactivar</button>`}
			</td>
		</tr>`;
	}).join('');
}

juegoForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const body = buildJuegoBody();
	try {
		if (juegoId.value) {
			await request(`${API.juegos}/${juegoId.value}`, { method: 'PUT', body: JSON.stringify(body) });
			setStatus('juegos-status', 'Juego actualizado');
		} else {
			await request(API.juegos, { method: 'POST', body: JSON.stringify(body) });
			setStatus('juegos-status', 'Juego creado');
		}
		resetJuegoForm();
		loadJuegos();
	} catch (error) {
		setStatus('juegos-status', error.message, true);
	}
});

juegoCancel.addEventListener('click', resetJuegoForm);
juegosMostrarBaja.addEventListener('change', loadJuegos);

juegosBody.addEventListener('click', async (e) => {
	const editId = e.target.dataset.juegoEdit;
	const deleteId = e.target.dataset.juegoDelete;
	const restoreId = e.target.dataset.juegoRestore;

	if (editId) {
		try {
			const j = await findForEdit(API.juegos, editId, juegosCache);
			juegoId.value = normalizeId(j._id);
			fillJuegoForm(j);
			startEditMode({
				formTitle: juegoFormTitle,
				submitBtn: juegoSubmit,
				cancelBtn: juegoCancel,
				title: 'Editar juego',
				submitText: 'Guardar',
				form: juegoForm,
			});
		} catch (error) {
			setStatus('juegos-status', error.message, true);
		}
	}

	if (deleteId && confirm('¿Dar de baja este juego? (baja lógica)')) {
		try {
			await request(`${API.juegos}/${deleteId}`, { method: 'DELETE' });
			setStatus('juegos-status', 'Juego dado de baja');
			loadJuegos();
		} catch (error) {
			setStatus('juegos-status', error.message, true);
		}
	}

	if (restoreId && confirm('¿Reactivar este juego en la tienda?')) {
		try {
			await request(`${API.juegos}/${restoreId}`, {
				method: 'PUT',
				body: JSON.stringify({ disponible_en_tienda: true }),
			});
			setStatus('juegos-status', 'Juego reactivado');
			loadJuegos();
		} catch (error) {
			setStatus('juegos-status', error.message, true);
		}
	}
});

// --- Usuarios ---

const usuarioForm = document.getElementById('usuario-form');
const usuarioId = document.getElementById('usuario-id');
const usuarioUsername = document.getElementById('usuario-username');
const usuarioEmail = document.getElementById('usuario-email');
const usuarioFecha = document.getElementById('usuario-fecha');
const usuarioEstado = document.getElementById('usuario-estado');
const usuarioSubmit = document.getElementById('usuario-submit');
const usuarioCancel = document.getElementById('usuario-cancel');
const usuarioFormTitle = document.getElementById('usuario-form-title');
const usuariosBody = document.getElementById('usuarios-body');
const usuariosMostrarBaja = document.getElementById('usuarios-mostrar-baja');

function resetUsuarioForm() {
	usuarioForm.reset();
	usuarioId.value = '';
	usuarioEstado.value = 'activo';
	usuarioFormTitle.textContent = 'Nuevo usuario';
	usuarioSubmit.textContent = 'Crear';
	usuarioCancel.hidden = true;
}

function buildUsuarioBody() {
	const body = {
		username: usuarioUsername.value.trim(),
		email: usuarioEmail.value.trim(),
		estado_cuenta: usuarioEstado.value,
	};
	if (usuarioFecha.value) {
		body.fecha_registro = dateInputToISO(usuarioFecha.value);
	}
	return body;
}

async function loadUsuarios() {
	setStatus('usuarios-status', 'Cargando...');
	try {
		const url = usuariosMostrarBaja.checked ? `${API.usuarios}?todos=true` : API.usuarios;
		usuariosCache = await request(url);
		renderUsuarios();
		const activos = usuariosCache.filter((u) => u.estado_cuenta === 'activo').length;
		const msg = usuariosMostrarBaja.checked
			? `${usuariosCache.length} usuario(s) (${activos} activos, ${usuariosCache.length - activos} de baja)`
			: `${usuariosCache.length} usuario(s) activo(s)`;
		setStatus('usuarios-status', msg);
	} catch (error) {
		usuariosBody.innerHTML = '';
		setStatus('usuarios-status', error.message, true);
	}
}

function renderUsuarios() {
	if (!usuariosCache.length) {
		usuariosBody.innerHTML = '<tr><td colspan="5" class="empty">No hay usuarios</td></tr>';
		return;
	}
	usuariosBody.innerHTML = usuariosCache.map((u) => {
		const activo = u.estado_cuenta === 'activo';
		return `
		<tr class="${activo ? '' : 'inactive'}">
			<td>${escapeHtml(u.username)}</td>
			<td>${escapeHtml(u.email)}</td>
			<td>${formatDate(u.fecha_registro)}</td>
			<td><span class="badge ${activo ? 'active' : 'inactive'}">${escapeHtml(u.estado_cuenta)}</span></td>
			<td class="actions">
				<button type="button" data-usuario-edit="${u._id}">Editar</button>
				${activo
					? `<button type="button" class="danger" data-usuario-delete="${u._id}">Eliminar</button>`
					: `<button type="button" data-usuario-restore="${u._id}">Reactivar</button>`}
			</td>
		</tr>`;
	}).join('');
}

usuarioForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const body = buildUsuarioBody();
	try {
		if (usuarioId.value) {
			await request(`${API.usuarios}/${usuarioId.value}`, { method: 'PUT', body: JSON.stringify(body) });
			setStatus('usuarios-status', 'Usuario actualizado');
		} else {
			await request(API.usuarios, { method: 'POST', body: JSON.stringify(body) });
			setStatus('usuarios-status', 'Usuario creado');
		}
		resetUsuarioForm();
		loadUsuarios();
	} catch (error) {
		setStatus('usuarios-status', error.message, true);
	}
});

usuarioCancel.addEventListener('click', resetUsuarioForm);
usuariosMostrarBaja.addEventListener('change', loadUsuarios);

usuariosBody.addEventListener('click', async (e) => {
	const editId = e.target.dataset.usuarioEdit;
	const deleteId = e.target.dataset.usuarioDelete;
	const restoreId = e.target.dataset.usuarioRestore;

	if (editId) {
		try {
			const u = await findForEdit(API.usuarios, editId, usuariosCache);
			fillUsuarioForm(u);
			startEditMode({
				formTitle: usuarioFormTitle,
				submitBtn: usuarioSubmit,
				cancelBtn: usuarioCancel,
				title: 'Editar usuario',
				submitText: 'Guardar',
				form: usuarioForm,
			});
		} catch (error) {
			setStatus('usuarios-status', error.message, true);
		}
	}

	if (deleteId && confirm('¿Desactivar este usuario? (baja lógica)')) {
		try {
			await request(`${API.usuarios}/${deleteId}`, { method: 'DELETE' });
			setStatus('usuarios-status', 'Usuario desactivado');
			loadUsuarios();
		} catch (error) {
			setStatus('usuarios-status', error.message, true);
		}
	}

	if (restoreId && confirm('¿Reactivar este usuario?')) {
		try {
			await request(`${API.usuarios}/${restoreId}`, {
				method: 'PUT',
				body: JSON.stringify({ estado_cuenta: 'activo' }),
			});
			setStatus('usuarios-status', 'Usuario reactivado');
			loadUsuarios();
		} catch (error) {
			setStatus('usuarios-status', error.message, true);
		}
	}
});

// --- Transacciones ---

const transaccionForm = document.getElementById('transaccion-form');
const transaccionId = document.getElementById('transaccion-id');
const transaccionFormTitle = document.getElementById('transaccion-form-title');
const transaccionUsuario = document.getElementById('transaccion-usuario');
const transaccionJuego = document.getElementById('transaccion-juego');
const transaccionFecha = document.getElementById('transaccion-fecha');
const transaccionMonto = document.getElementById('transaccion-monto');
const transaccionMetodo = document.getElementById('transaccion-metodo');
const transaccionSubmit = document.getElementById('transaccion-submit');
const transaccionCancel = document.getElementById('transaccion-cancel');
const transaccionesBody = document.getElementById('transacciones-body');

function resetTransaccionForm() {
	transaccionForm.reset();
	transaccionId.value = '';
	transaccionFormTitle.textContent = 'Nueva transacción';
	transaccionSubmit.textContent = 'Registrar compra';
	transaccionCancel.hidden = true;
}

function buildTransaccionBody() {
	const body = {
		id_usuario: transaccionUsuario.value,
		id_juego: transaccionJuego.value,
		monto_pagado: Number(transaccionMonto.value),
		metodo_pago: transaccionMetodo.value,
	};
	if (transaccionFecha.value) {
		body.fecha_compra = dateInputToISO(transaccionFecha.value);
	}
	return body;
}

async function loadTransaccionesPanel() {
	setStatus('transacciones-status', 'Cargando...');
	try {
		await loadTransaccionSelects();
		const transacciones = await request(API.transacciones);
		renderTransacciones(transacciones);
		setStatus('transacciones-status', `${transacciones.length} transacción(es)`);
	} catch (error) {
		transaccionesBody.innerHTML = '';
		setStatus('transacciones-status', error.message, true);
	}
}

function renderTransacciones(transacciones) {
	if (!transacciones.length) {
		transaccionesBody.innerHTML = '<tr><td colspan="6" class="empty">No hay transacciones</td></tr>';
		return;
	}

	const usuarioMap = Object.fromEntries(usuariosCache.map((u) => [normalizeId(u._id), u.username]));
	const juegoMap = Object.fromEntries(juegosCache.map((j) => [normalizeId(j._id), j.titulo]));

	transaccionesBody.innerHTML = transacciones.map((t) => `
		<tr>
			<td>${escapeHtml(usuarioMap[normalizeId(t.id_usuario)] || shortId(t.id_usuario))}</td>
			<td>${escapeHtml(juegoMap[normalizeId(t.id_juego)] || shortId(t.id_juego))}</td>
			<td>${formatDate(t.fecha_compra)}</td>
			<td>$${Number(t.monto_pagado).toFixed(2)}</td>
			<td>${escapeHtml(t.metodo_pago)}</td>
			<td class="actions">
				<button type="button" data-transaccion-edit="${normalizeId(t._id)}">Editar</button>
				<button type="button" class="danger" data-transaccion-delete="${normalizeId(t._id)}">Eliminar</button>
			</td>
		</tr>
	`).join('');
}

transaccionJuego.addEventListener('change', () => {
	const juego = juegosCache.find((j) => normalizeId(j._id) === transaccionJuego.value);
	if (juego && !transaccionId.value) transaccionMonto.value = juego.precio;
});

transaccionForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const body = buildTransaccionBody();
	try {
		if (transaccionId.value) {
			await request(`${API.transacciones}/${transaccionId.value}`, { method: 'PUT', body: JSON.stringify(body) });
			setStatus('transacciones-status', 'Transacción actualizada');
		} else {
			await request(API.transacciones, { method: 'POST', body: JSON.stringify(body) });
			setStatus('transacciones-status', 'Transacción registrada');
		}
		resetTransaccionForm();
		loadTransaccionesPanel();
	} catch (error) {
		setStatus('transacciones-status', error.message, true);
	}
});

transaccionCancel.addEventListener('click', resetTransaccionForm);

transaccionesBody.addEventListener('click', async (e) => {
	const editId = e.target.dataset.transaccionEdit;
	const deleteId = e.target.dataset.transaccionDelete;

	if (editId) {
		try {
			await loadTransaccionSelects();
			const t = await findForEdit(API.transacciones, editId);
			fillTransaccionForm(t);
			startEditMode({
				formTitle: transaccionFormTitle,
				submitBtn: transaccionSubmit,
				cancelBtn: transaccionCancel,
				title: 'Editar transacción',
				submitText: 'Guardar',
				form: transaccionForm,
			});
		} catch (error) {
			setStatus('transacciones-status', error.message, true);
		}
	}

	if (deleteId && confirm('¿Eliminar esta transacción? (borrado físico)')) {
		try {
			await request(`${API.transacciones}/${deleteId}`, { method: 'DELETE' });
			setStatus('transacciones-status', 'Transacción eliminada');
			loadTransaccionesPanel();
		} catch (error) {
			setStatus('transacciones-status', error.message, true);
		}
	}
});

// --- Biblioteca ---

const bibliotecaForm = document.getElementById('biblioteca-form');
const bibliotecaId = document.getElementById('biblioteca-id');
const bibliotecaFormTitle = document.getElementById('biblioteca-form-title');
const bibliotecaUsuario = document.getElementById('biblioteca-usuario');
const bibliotecaJuego = document.getElementById('biblioteca-juego');
const bibliotecaFecha = document.getElementById('biblioteca-fecha');
const bibliotecaEstado = document.getElementById('biblioteca-estado');
const bibliotecaSubmit = document.getElementById('biblioteca-submit');
const bibliotecaCancel = document.getElementById('biblioteca-cancel');
const bibliotecaMostrarBaja = document.getElementById('biblioteca-mostrar-baja');
const bibliotecaBody = document.getElementById('biblioteca-body');

function resetBibliotecaForm() {
	bibliotecaForm.reset();
	bibliotecaId.value = '';
	bibliotecaEstado.value = 'activo';
	bibliotecaFormTitle.textContent = 'Agregar a biblioteca';
	bibliotecaSubmit.textContent = 'Agregar';
	bibliotecaCancel.hidden = true;
}

function buildBibliotecaBody() {
	return {
		id_usuario: bibliotecaUsuario.value,
		id_juego: bibliotecaJuego.value,
		fecha_adquisicion: dateInputToISO(bibliotecaFecha.value),
		estado: bibliotecaEstado.value,
	};
}

async function loadBibliotecaPanel() {
	setStatus('biblioteca-status', 'Cargando...');
	try {
		await loadBibliotecaSelects();
		const url = bibliotecaMostrarBaja.checked ? `${API.biblioteca}?todos=true` : API.biblioteca;
		bibliotecaCache = await request(url);
		renderBiblioteca();
		const activos = bibliotecaCache.filter((b) => b.estado === 'activo').length;
		const msg = bibliotecaMostrarBaja.checked
			? `${bibliotecaCache.length} entrada(s) (${activos} activas, ${bibliotecaCache.length - activos} removidas)`
			: `${bibliotecaCache.length} juego(s) en biblioteca`;
		setStatus('biblioteca-status', msg);
	} catch (error) {
		bibliotecaBody.innerHTML = '';
		setStatus('biblioteca-status', error.message, true);
	}
}

function renderBiblioteca() {
	if (!bibliotecaCache.length) {
		bibliotecaBody.innerHTML = '<tr><td colspan="5" class="empty">No hay entradas en biblioteca</td></tr>';
		return;
	}

	const usuarioMap = Object.fromEntries(usuariosCache.map((u) => [normalizeId(u._id), u.username]));
	const juegoMap = Object.fromEntries(juegosCache.map((j) => [normalizeId(j._id), j.titulo]));

	bibliotecaBody.innerHTML = bibliotecaCache.map((b) => {
		const activo = b.estado === 'activo';
		return `
		<tr class="${activo ? '' : 'inactive'}">
			<td>${escapeHtml(usuarioMap[normalizeId(b.id_usuario)] || shortId(b.id_usuario))}</td>
			<td>${escapeHtml(juegoMap[normalizeId(b.id_juego)] || shortId(b.id_juego))}</td>
			<td>${formatDate(b.fecha_adquisicion)}</td>
			<td><span class="badge ${activo ? 'active' : 'inactive'}">${escapeHtml(b.estado)}</span></td>
			<td class="actions">
				<button type="button" data-biblioteca-edit="${normalizeId(b._id)}">Editar</button>
				${activo
					? `<button type="button" class="danger" data-biblioteca-delete="${normalizeId(b._id)}">Reembolsar</button>`
					: `<button type="button" data-biblioteca-restore="${normalizeId(b._id)}">Reactivar</button>`}
			</td>
		</tr>`;
	}).join('');
}

bibliotecaForm.addEventListener('submit', async (e) => {
	e.preventDefault();
	const body = buildBibliotecaBody();
	try {
		if (bibliotecaId.value) {
			await request(`${API.biblioteca}/${bibliotecaId.value}`, { method: 'PUT', body: JSON.stringify(body) });
			setStatus('biblioteca-status', 'Entrada actualizada');
		} else {
			await request(API.biblioteca, { method: 'POST', body: JSON.stringify(body) });
			setStatus('biblioteca-status', 'Juego agregado a biblioteca');
		}
		resetBibliotecaForm();
		loadBibliotecaPanel();
	} catch (error) {
		setStatus('biblioteca-status', error.message, true);
	}
});

bibliotecaCancel.addEventListener('click', resetBibliotecaForm);
bibliotecaMostrarBaja.addEventListener('change', loadBibliotecaPanel);

bibliotecaBody.addEventListener('click', async (e) => {
	const editId = e.target.dataset.bibliotecaEdit;
	const deleteId = e.target.dataset.bibliotecaDelete;
	const restoreId = e.target.dataset.bibliotecaRestore;

	if (editId) {
		try {
			await loadBibliotecaSelects();
			const b = await findForEdit(API.biblioteca, editId, bibliotecaCache);
			fillBibliotecaForm(b);
			startEditMode({
				formTitle: bibliotecaFormTitle,
				submitBtn: bibliotecaSubmit,
				cancelBtn: bibliotecaCancel,
				title: 'Editar entrada',
				submitText: 'Guardar',
				form: bibliotecaForm,
			});
		} catch (error) {
			setStatus('biblioteca-status', error.message, true);
		}
	}

	if (deleteId && confirm('¿Marcar como removido? (reembolso — baja lógica)')) {
		try {
			await request(`${API.biblioteca}/${deleteId}`, { method: 'DELETE' });
			setStatus('biblioteca-status', 'Juego removido de biblioteca');
			loadBibliotecaPanel();
		} catch (error) {
			setStatus('biblioteca-status', error.message, true);
		}
	}

	if (restoreId && confirm('¿Reactivar este juego en la biblioteca?')) {
		try {
			await request(`${API.biblioteca}/${restoreId}`, {
				method: 'PUT',
				body: JSON.stringify({ estado: 'activo' }),
			});
			setStatus('biblioteca-status', 'Entrada reactivada');
			loadBibliotecaPanel();
		} catch (error) {
			setStatus('biblioteca-status', error.message, true);
		}
	}
});

// --- Init ---

function initDatePickers() {
	document.querySelectorAll('input[type="date"]').forEach((input) => {
		input.addEventListener('click', () => {
			if (typeof input.showPicker === 'function') {
				try {
					input.showPicker();
				} catch {
					// El navegador bloqueó showPicker; el click nativo sigue funcionando
				}
			}
		});
	});
}

initDatePickers();
loadJuegos();
loadUsuarios();
