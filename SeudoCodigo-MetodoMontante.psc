Algoritmo MetodoMontante
	Definir n, i, j, k, fila, filaCambio Como Entero
	Definir matriz, anterior Como Real
	Definir pivote, pivoteAnterior, auxiliar Como Real
	Definir solucion Como Real
	Definir sistemaValido Como Lógico
	Dimensionar matriz(101,102)
	Dimensionar anterior(101,102)
	Dimensionar solucion(101)
	Repetir
		Escribir 'Ingrese la cantidad de incognitas (1 a 100):'
		Leer n
	Hasta Que n>=1 Y n<=100
	Para i<-1 Hasta n Hacer
		Para j<-1 Hasta n Hacer
			Escribir 'Coeficiente de la fila ', i, ', columna ', j, ':'
			Leer matriz[i,j]
		FinPara
		Escribir 'Termino independiente de la fila ', i, ':'
		Leer matriz[i,n+1]
	FinPara
	pivoteAnterior <- 1
	sistemaValido <- Verdadero
	k <- 1
	Mientras k<=n Y sistemaValido Hacer
		Si matriz[k,k]=0 Entonces
			filaCambio <- 0
			fila <- k+1
			Mientras fila<=n Y filaCambio=0 Hacer
				Si matriz[fila,k]<>0 Entonces
					filaCambio <- fila
				FinSi
				fila <- fila+1
			FinMientras
			Si filaCambio=0 Entonces
				sistemaValido <- Falso
			SiNo
				Para j<-1 Hasta n+1 Hacer
					auxiliar <- matriz[k,j]
					matriz[k,j]<-matriz[filaCambio,j]
					matriz[filaCambio,j]<-auxiliar
				FinPara
				Escribir 'Intercambio de filas: ', k, ' y ', filaCambio
			FinSi
		FinSi
		Si sistemaValido Entonces
			Para i<-1 Hasta n Hacer
				Para j<-1 Hasta n+1 Hacer
					anterior[i,j]<-matriz[i,j]
				FinPara
			FinPara
			pivote <- anterior[k,k]
			Para i<-1 Hasta n Hacer
				Si i<>k Entonces
					Para j<-1 Hasta n+1 Hacer
						Si j<>k Entonces
							matriz[i,j]<-(pivote*anterior[i,j]-anterior[i,k]*anterior[k,j])/pivoteAnterior
						FinSi
					FinPara
					matriz[i,k]<-0
				FinSi
			FinPara
			Escribir 'Iteracion ', k
			Escribir 'Pivote: ', pivote
			Escribir 'Pivote anterior: ', pivoteAnterior
			Para i<-1 Hasta n Hacer
				Para j<-1 Hasta n+1 Hacer
					Escribir matriz[i,j], '  'Sin Saltar
				FinPara
				Escribir ''
			FinPara
			pivoteAnterior <- pivote
		FinSi
		k <- k+1
	FinMientras
	Si sistemaValido Entonces
		Escribir 'Soluciones:'
		Para i<-1 Hasta n Hacer
			solucion[i] <- matriz[i,n+1]/matriz[i,i]
			Escribir 'x', i, ' = ', solucion[i]
		FinPara
	SiNo
		Escribir 'El sistema no tiene una solucion unica.'
	FinSi
FinAlgoritmo
