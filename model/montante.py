import numpy as np

class montante:
    
    def __init__(self,matriz_coeficientes, matriz_independientes):
        self.matriz = np.hstack((matriz_coeficientes, matriz_independientes))
        self.filas,self.columnas = self.matriz.shape
        self.iteraciones = []

    def calcular_montante(self):
        if self.columnas != self.filas + 1:
            raise ValueError("La matriz aumentada debe tener n filas y n + 1 columnas.")

        #Convertimos la matriz a tipo float para evitar problemas de división entera.
        self.matriz = self.matriz.astype(float)
        pivote_anterior = 1.0
        self.iteraciones = []

        for k in range(self.filas):  # k indica la posición del pivote e iteracion.
            intercambio = None
            if self.matriz[k][k] == 0:
                # intercambiamos filas para evitar un pivote 0.
                for fila in range(k + 1, self.filas):
                    if self.matriz[fila][k] != 0:
                        self.matriz[[k, fila]] = self.matriz[[fila, k]]
                        intercambio = [k + 1, fila + 1]
                        break
                else:
                    raise ValueError("El sistema no tiene una solución única.")

            anterior = self.matriz.copy()
            pivote = anterior[k][k]

            for i in range(self.filas):  # i recorre las filas.
                if i == k:
                    continue  # La fila del pivote se conserva en este paso.

                for j in range(self.columnas):  # Incluye los términos independientes.
                    if j != k:
                        self.matriz[i][j] = (
                            pivote * anterior[i][j]
                            - anterior[i][k] * anterior[k][j]
                        ) / pivote_anterior

                self.matriz[i][k] = 0

            # Guardamos una instantánea para mostrar este paso en el navegador.
            self.iteraciones.append({
                "numero": k + 1,
                "pivote": float(pivote),
                "pivote_anterior": float(pivote_anterior),
                "intercambio": intercambio,
                "matriz": self.matriz.tolist(),
            })
            pivote_anterior = pivote

        return self.matriz
            
#print(montante(np.array([[-6, 4, 5], [-2, 1, 2], [5, -3, -4]]), np.array([[17], [6], [-13]])).calcular_montante())
#print(montante(np.array([[0, 2, 1], [3, 1, 2], [1, 4, 3]]), np.array([[8], [13], [6]])).calcular_montante())
#print(montante(np.array([ [2, 3, 1],[4, 1, 2],[3, 2, 5] ]),np.array([  [10],[11],[17]])).calcular_montante())
