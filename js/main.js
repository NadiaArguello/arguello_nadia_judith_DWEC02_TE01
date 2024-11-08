// ------------------------------ 1. VARIABLES GLOBALES ------------------------------
let tarifasJSON = null;
let gastosJSON = null;
let tarifasJSONpath = '../json/tarifasCombustible.json';
let gastosJSONpath = '../json/gastosCombustible.json';

/* Sacamos esta parte de calcularGastoTotal y la convertimos en 
* variable global para almacenar los gastos acumulados
* Si no hacemos esto, no permite acumular los gastos porque reinicializa
* los valores del array cada vez que pulsamos el botón
*/
let aniosArray = {
    2010: 0,
    2011: 0,
    2012: 0,
    2013: 0,
    2014: 0,
    2015: 0,
    2016: 0,
    2017: 0,
    2018: 0,
    2019: 0,
    2020: 0
};

// ------------------------------ 2. CARGA INICIAL DE DATOS (NO TOCAR!) ------------------------------
// Esto inicializa los eventos del formulario y carga los datos iniciales
document.addEventListener('DOMContentLoaded', async () => {
    // Cargar los JSON cuando la página se carga, antes de cualquier interacción del usuario
    await cargarDatosIniciales();

    // mostrar datos en consola
    console.log('Tarifas JSON: ', tarifasJSON);
    console.log('Gastos JSON: ', gastosJSON);

    calcularGastoTotal();

    // Inicializar eventos el formularios
    document.getElementById('fuel-form').addEventListener('submit', guardarGasto);    
});

// Función para cargar ambos ficheros JSON al cargar la página
async function cargarDatosIniciales() {

    try {
        // Esperar a que ambos ficheros se carguen
        tarifasJSON = await cargarJSON(tarifasJSONpath);
        gastosJSON = await cargarJSON(gastosJSONpath);

    } catch (error) {
        console.error('Error al cargar los ficheros JSON:', error);
    }
}

// Función para cargar un JSON desde una ruta específica
async function cargarJSON(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Error al cargar el archivo JSON: ${path}`);
    }
    return await response.json();
}

// ------------------------------ 3. FUNCIONES ------------------------------

// Calcular gasto total por año al iniciar la aplicación
function calcularGastoTotal() {
    // array asociativo con clave=año y valor=gasto total
    gastosJSON.forEach(gasto => {
        const anio = new Date(gasto.date).getFullYear();
        if (!aniosArray[anio]) {
            aniosArray[anio] = 0;
        }
        aniosArray[anio] += gasto.precioViaje;
    });

    // Actualizar el DOM con los gastos totales por año
    for (let anio in aniosArray) {
        document.getElementById(`gasto${anio}`).textContent = aniosArray[anio].toFixed(2);
    }

}

// guardar gasto introducido y actualizar datos
function guardarGasto() {

    //Obtener los datos del formulario
        const vehiculo = document.getElementById('vehicle-type').value;
        const fecha = new Date(document.getElementById('date').value);
        const kilometros = parseFloat(document.getElementById('kilometers').value);
    
        const anio = fecha.getFullYear();

        // Encontrar la tarifa correspondiente al año y tipo de vehículo
        const tarifaAnio = tarifasJSON.tarifas.find(t => t.anio == anio).vehiculos;
        const tarifa = tarifaAnio[vehiculo];
        const gastoCalculado = tarifa * kilometros;
        const nuevoGasto = new GastoCombustible(vehiculo, fecha, kilometros, gastoCalculado);
            if (tarifa) {
                // Calcular el gasto y crear un nuevo objeto GastoCombustible

                aniosArray[anio] += gastoCalculado;
            }

    // Actualizar el DOM con los gastos totales por año
    for (let anio in aniosArray) {
        document.getElementById(`gasto${anio}`).textContent = aniosArray[anio].toFixed(2);
    }
    
    // Añadir el nuevo gasto a la lista de gastos recientes
    const expenseList = document.getElementById('expense-list');
    const li = document.createElement('li');
    li.textContent = nuevoGasto.convertToJSON();
    expenseList.appendChild(li);

    // Limpiar el formulario
    document.getElementById('fuel-form').reset();

}

