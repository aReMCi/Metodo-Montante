const configuracion = document.getElementById('configuracion');
const dimension = document.getElementById('dimension');
const formulario = document.getElementById('formulario');
const revision = document.getElementById('revision');
const estado = document.getElementById('estado');
const resultados = document.getElementById('resultados');
const botonCalcular = document.getElementById('calcular');
let tamano = 0;
let solicitudActual = null;

function cancelarCalculo() {
    if (solicitudActual) solicitudActual.abort();
    solicitudActual = null;
    botonCalcular.disabled = false;
    botonCalcular.textContent = 'Calcular Montante';
    formulario.setAttribute('aria-busy', 'false');
    resultados.hidden = true;
    estado.classList.remove('error');
}

// Una fila corresponde a una ecuación; una columna de A, a una incógnita.
function crearMatriz(contenedor, prefijo, filas, columnas, valoresAnteriores) {
    const tabla = document.createElement('table');
    const descripcion = tabla.createCaption();
    descripcion.textContent = `${filas} filas × ${columnas} columnas`;

    const encabezado = tabla.createTHead().insertRow();
    for (let j = 0; j <= columnas; j++) {
        const celda = document.createElement('th');
        celda.scope = 'col';
        celda.textContent = j === 0 ? 'Ecuación' : (prefijo === 'a' ? `x${j}` : 'b');
        encabezado.append(celda);
    }

    const cuerpo = tabla.createTBody();
    for (let i = 0; i < filas; i++) {
        const fila = cuerpo.insertRow();
        const etiqueta = document.createElement('th');
        etiqueta.scope = 'row';
        etiqueta.textContent = i + 1;
        fila.append(etiqueta);

        for (let j = 0; j < columnas; j++) {
            const entrada = document.createElement('input');
            entrada.type = 'number';
            entrada.step = 'any';
            entrada.required = true;
            entrada.id = `${prefijo}-${i}-${j}`;
            entrada.name = entrada.id;
            entrada.setAttribute('aria-label', prefijo === 'a'
                ? `Coeficiente de x${j + 1} en la ecuación ${i + 1}`
                : `Término independiente de la ecuación ${i + 1}`);
            entrada.value = valoresAnteriores.get(entrada.id) ?? '';
            fila.insertCell().append(entrada);
        }
    }
    contenedor.replaceChildren(tabla);
}

configuracion.addEventListener('submit', (evento) => {
    evento.preventDefault();
    if (!configuracion.reportValidity()) return;
    cancelarCalculo();

    // Conservamos los datos que ya se escribieron si cambia el tamaño.
    const valoresAnteriores = new Map(
        Array.from(formulario.querySelectorAll('input'), entrada => [entrada.id, entrada.value])
    );
    tamano = dimension.valueAsNumber;
    crearMatriz(document.getElementById('coeficientes'), 'a', tamano, tamano, valoresAnteriores);
    crearMatriz(document.getElementById('independientes'), 'b', tamano, 1, valoresAnteriores);
    formulario.hidden = false;
    revision.hidden = true;
    estado.textContent = `Matrices listas para un sistema de ${tamano} incógnitas.`;
    formulario.querySelector('input').focus();
});

function leerMatriz(prefijo, filas, columnas) {
    const matriz = [];
    for (let i = 0; i < filas; i++) {
        const fila = [];
        for (let j = 0; j < columnas; j++) {
            fila.push(document.getElementById(`${prefijo}-${i}-${j}`).valueAsNumber);
        }
        matriz.push(fila);
    }
    return matriz;
}

function formatearNumero(valor) {
    // Se redondea únicamente la presentación; Python conserva la precisión del cálculo.
    return Number(valor.toPrecision(10)).toString();
}

function mostrarMatriz(contenedor, matriz, filaPivote = null) {
    const tabla = document.createElement('table');
    if (filaPivote !== null) {
        tabla.classList.add('matriz-aumentada');
        const encabezado = tabla.createTHead().insertRow();
        for (let j = 0; j < matriz[0].length; j++) {
            const titulo = document.createElement('th');
            titulo.scope = 'col';
            titulo.textContent = j === matriz[0].length - 1 ? 'b' : `x${j + 1}`;
            encabezado.append(titulo);
        }
    }
    const cuerpo = tabla.createTBody();
    for (const [i, valores] of matriz.entries()) {
        const fila = cuerpo.insertRow();
        for (const [j, valor] of valores.entries()) {
            const celda = fila.insertCell();
            celda.textContent = formatearNumero(valor);
            if (i === filaPivote && j === filaPivote) {
                celda.classList.add('pivote');
                celda.title = 'Pivote de esta iteración';
            }
        }
    }
    contenedor.replaceChildren(tabla);
}

function mostrarResultados(datos) {
    const iteraciones = document.getElementById('iteraciones');
    iteraciones.replaceChildren();

    for (const paso of datos.iteraciones) {
        const tarjeta = document.createElement('section');
        tarjeta.className = 'panel iteracion';
        const titulo = document.createElement('h3');
        titulo.textContent = `Iteración ${paso.numero}`;
        const detalle = document.createElement('p');
        detalle.textContent = `Pivote: ${formatearNumero(paso.pivote)} · Pivote anterior: ${formatearNumero(paso.pivote_anterior)}`;
        tarjeta.append(titulo, detalle);

        if (paso.intercambio) {
            const intercambio = document.createElement('p');
            intercambio.textContent = `Se intercambiaron las filas ${paso.intercambio[0]} y ${paso.intercambio[1]} para evitar un pivote cero.`;
            tarjeta.append(intercambio);
        }

        const contenedor = document.createElement('div');
        contenedor.className = 'tabla-contenedor';
        mostrarMatriz(contenedor, paso.matriz, paso.numero - 1);
        tarjeta.append(contenedor);
        iteraciones.append(tarjeta);
    }

    const soluciones = document.getElementById('soluciones');
    soluciones.replaceChildren();
    datos.soluciones.forEach((valor, i) => {
        const elemento = document.createElement('li');
        elemento.textContent = `x${i + 1} = ${formatearNumero(valor)}`;
        soluciones.append(elemento);
    });
    resultados.hidden = false;
    document.getElementById('titulo-resultados').focus();
}

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    if (!formulario.reportValidity()) return;
    cancelarCalculo();

    // b se mantiene como matriz n × 1, tal como espera la clase de Python.
    const coeficientes = leerMatriz('a', tamano, tamano);
    const independientes = leerMatriz('b', tamano, 1);
    mostrarMatriz(document.getElementById('resumen-coeficientes'), coeficientes);
    mostrarMatriz(document.getElementById('resumen-independientes'), independientes);
    revision.hidden = false;
    estado.textContent = 'Calculando las iteraciones…';
    botonCalcular.disabled = true;
    botonCalcular.textContent = 'Calculando…';
    formulario.setAttribute('aria-busy', 'true');

    const controlador = new AbortController();
    solicitudActual = controlador;
    try {
        const respuesta = await fetch('/calcular', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ coeficientes, independientes }),
            signal: controlador.signal,
        });
        const datos = await respuesta.json();
        if (solicitudActual !== controlador) return;
        if (!respuesta.ok) throw new Error(datos.error || 'No se pudo calcular el sistema.');
        mostrarResultados(datos);
        estado.textContent = `Cálculo completado: ${datos.iteraciones.length} iteraciones.`;
    } catch (error) {
        if (controlador.signal.aborted || solicitudActual !== controlador) return;
        estado.classList.add('error');
        estado.textContent = error instanceof TypeError || error instanceof SyntaxError
            ? 'No se pudo conectar con el cálculo. Comprueba que la aplicación Flask esté ejecutándose y vuelve a intentarlo.'
            : error.message;
    } finally {
        if (solicitudActual === controlador) {
            solicitudActual = null;
            botonCalcular.disabled = false;
            botonCalcular.textContent = 'Calcular Montante';
            formulario.setAttribute('aria-busy', 'false');
        }
    }
});

formulario.addEventListener('input', () => {
    cancelarCalculo();
    revision.hidden = true;
    estado.textContent = '';
});
