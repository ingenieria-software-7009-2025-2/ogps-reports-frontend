# ogps-reports-frontend

Este es el repositorio del frontend.

## Framework Utilizado
- *React.js*: Biblioteca de JavaScript para la construcción de interfaces de usuario.

## Instalación y Ejecución en Local

### 1. Prerrequisitos
Asegúrate de tener instalado:
- [Node.js](https://nodejs.org/) (versión recomendada: 18+)
- npm (viene incluido con Node.js)

### 2. Clonar el repositorio

git clone https://github.com/tu-usuario/ogps-reports-frontend.git
cd ogps-reports-frontend


### 3. Instalar dependencias

npm install


### 4. Ejecutar en entorno local

npm start


## Posibles Errores y Soluciones

### El puerto 3000 está ocupado
- Solución: Ejecuta el siguiente comando para ver qué proceso lo está usando:

#### Windows (CMD)

netstat -ano | findstr :3000


#### Mac/Linux

lsof -i :3000


- Matar el proceso con:

#### Windows (CMD)

taskkill /F /PID <PID>


#### Mac/Linux

kill -9 <PID>


- O ejecutar React en otro puerto:
```
PORT=3001 npm start
