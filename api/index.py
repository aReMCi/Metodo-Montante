import sys
from pathlib import Path

import numpy as np
from flask import Flask, jsonify, render_template, request

# Permite iniciar tanto con Flask como ejecutando directamente api/index.py.
if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from model.montante import montante

app = Flask(__name__, template_folder= '../templates', static_folder= '../static')

@app.route('/')
def home():
    return render_template('index.html')


@app.post('/calcular')
def calcular():
    datos = request.get_json(silent=True)
    if not isinstance(datos, dict):
        return jsonify(error="Envía ambas matrices en formato JSON."), 400

    try:
        coeficientes = np.asarray(datos["coeficientes"])
        independientes = np.asarray(datos["independientes"])
    except (KeyError, TypeError, ValueError, OverflowError):
        return jsonify(error="Debes enviar dos matrices de números."), 400

    if (coeficientes.ndim != 2 or independientes.ndim != 2
            or coeficientes.dtype.kind not in "iuf"
            or independientes.dtype.kind not in "iuf"):
        return jsonify(error="Las matrices deben contener únicamente números."), 400

    n = coeficientes.shape[0]
    if not 1 <= n <= 10 or coeficientes.shape != (n, n) or independientes.shape != (n, 1):
        return jsonify(error="Se necesita una matriz A de n × n y una matriz b de n × 1, con n entre 1 y 10."), 400

    if not np.isfinite(coeficientes).all() or not np.isfinite(independientes).all():
        return jsonify(error="Todos los valores deben ser números finitos."), 400

    metodo = montante(coeficientes, independientes)
    try:
        with np.errstate(over='raise', divide='raise', invalid='raise'):
            resultado = metodo.calcular_montante()
    except ValueError as error:
        return jsonify(error=str(error)), 422
    except FloatingPointError:
        return jsonify(error="No se pudo completar el cálculo con estos valores. Revisa la escala de los números."), 422

    # Las listas y los float de Python se pueden enviar al navegador como JSON.
    return jsonify(
        iteraciones=metodo.iteraciones,
        matriz_final=resultado.tolist(),
        soluciones=metodo.soluciones.tolist(),
    )


if __name__ == '__main__':
    # Permite probar desde otros dispositivos de la misma red local.
    app.run(host='0.0.0.0', port=5000, debug=False)
