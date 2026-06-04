let saldo = 0;

let totalIngresos = 0;
let totalGastos = 0;

let comida = 0;
let transporte = 0;
let educacion = 0;
let ocio = 0;

const saldoTexto = document.getElementById("saldo");
const lista = document.getElementById("lista");

/* ACTUALIZAR DATOS */

function actualizarSaldo() {

    saldoTexto.textContent =
        "$" + saldo.toFixed(2);

    document.getElementById("totalIngresos")
        .textContent =
        "$" + totalIngresos.toFixed(2);

    document.getElementById("totalGastos")
        .textContent =
        "$" + totalGastos.toFixed(2);

    document.getElementById("ahorro")
        .textContent =
        "$" + saldo.toFixed(2);

    document.getElementById("catComida")
        .textContent =
        "$" + comida.toFixed(2);

    document.getElementById("catTransporte")
        .textContent =
        "$" + transporte.toFixed(2);

    document.getElementById("catEducacion")
        .textContent =
        "$" + educacion.toFixed(2);

    document.getElementById("catOcio")
        .textContent =
        "$" + ocio.toFixed(2);

    actualizarGraficoPastel();
    actualizarGraficoBarras();

    const alerta =
        document.getElementById("alerta");

    if (saldo <= 0) {
        alerta.style.display = "block";
    } else {
        alerta.style.display = "none";
    }
}

/* GRAFICO PASTEL */

function actualizarGraficoPastel() {

    const total =
        comida +
        transporte +
        educacion +
        ocio;

    const grafico =
        document.getElementById("graficoPastel");

    if (!grafico) return;

    if (total <= 0) {

        grafico.style.background = "#ddd";
        return;
    }

    const pComida =
        (comida / total) * 100;

    const pTransporte =
        (transporte / total) * 100;

    const pEducacion =
        (educacion / total) * 100;

    const pOcio =
        (ocio / total) * 100;

    const c1 = pComida;
    const c2 = c1 + pTransporte;
    const c3 = c2 + pEducacion;

    grafico.style.background =
        `conic-gradient(
            #7B5DF5 0% ${c1}%,
            #5B6CFF ${c1}% ${c2}%,
            #00C896 ${c2}% ${c3}%,
            #FFB300 ${c3}% 100%
        )`;
}

/* GRAFICO BARRAS */

function actualizarGraficoBarras(){

    const total =
    comida +
    transporte +
    educacion +
    ocio;

    if(total<=0)return;

    const pComida =
    (comida/total)*100;

    const pTransporte =
    (transporte/total)*100;

    const pEducacion =
    (educacion/total)*100;

    const pOcio =
    (ocio/total)*100;


    document.getElementById(
    "barraComida"
    ).style.width =
    pComida+"%";

    document.getElementById(
    "barraTransporte"
    ).style.width =
    pTransporte+"%";

    document.getElementById(
    "barraEducacion"
    ).style.width =
    pEducacion+"%";

    document.getElementById(
    "barraOcio"
    ).style.width =
    pOcio+"%";

}

/* AGREGAR INGRESO */

function agregarIngreso() {

    const ingreso =
        Number(
            document.getElementById("ingreso").value
        );

    if (ingreso <= 0) {
        alert("Ingrese un monto válido");
        return;
    }

    saldo += ingreso;
    totalIngresos += ingreso;

    const movimiento =
        document.createElement("div");

    movimiento.classList.add("movimiento");

    movimiento.innerHTML = `
        <span>💰 Ingreso agregado</span>
        <span style="color:green">
            +$${ingreso.toFixed(2)}
        </span>
    `;

    document
        .getElementById("ultimosMovimientos")
        .prepend(movimiento);

    actualizarSaldo();

    document.getElementById("ingreso").value = "";
}

/* AGREGAR GASTO */

function agregarGasto() {

    const nombre =
        document.getElementById("nombre").value;

    const gasto =
        Number(
            document.getElementById("gasto").value
        );

    const categoria =
        document.getElementById("categoria").value;

    if (nombre === "" || gasto <= 0) {

        alert("Complete todos los campos");
        return;
    }

    saldo -= gasto;
    totalGastos += gasto;

    switch (categoria) {

        case "Comida":
            comida += gasto;
            break;

        case "Transporte":
            transporte += gasto;
            break;

        case "Educacion":
            educacion += gasto;
            break;

        case "Ocio":
            ocio += gasto;
            break;
    }

    const fila =
        document.createElement("tr");

let claseCategoria = "";

switch(categoria){

    case "Comida":
        claseCategoria = "cat-comida";
        break;

    case "Transporte":
        claseCategoria = "cat-transporte";
        break;

    case "Educacion":
        claseCategoria = "cat-educacion";
        break;

    case "Ocio":
        claseCategoria = "cat-ocio";
        break;
}

fila.innerHTML = `
    <td>${nombre}</td>

    <td>
        <span class="categoria ${claseCategoria}">
            ${categoria}
        </span>
    </td>

    <td>$${gasto.toFixed(2)}</td>

    <td>
        <button class="eliminar">
            Eliminar
        </button>
    </td>
`;

    fila.querySelector(".eliminar")
        .addEventListener("click", () => {

            fila.remove();

            saldo += gasto;
            totalGastos -= gasto;

            switch (categoria) {

                case "Comida":
                    comida -= gasto;
                    break;

                case "Transporte":
                    transporte -= gasto;
                    break;

                case "Educacion":
                    educacion -= gasto;
                    break;

                case "Ocio":
                    ocio -= gasto;
                    break;
            }

            actualizarSaldo();
        });

    lista.appendChild(fila);

    const movimiento =
        document.createElement("div");

    movimiento.classList.add("movimiento");

    movimiento.innerHTML = `
        <span>
            ${nombre} (${categoria})
        </span>

        <span style="color:red">
            -$${gasto.toFixed(2)}
        </span>
    `;

    document
        .getElementById("ultimosMovimientos")
        .prepend(movimiento);

    actualizarSaldo();

    document.getElementById("nombre").value = "";
    document.getElementById("gasto").value = "";
}
function abrirIngreso(){

    document.getElementById(
        "modalIngreso"
    ).style.display = "flex";
}

function cerrarIngreso(){

    document.getElementById(
        "modalIngreso"
    ).style.display = "none";
}

function abrirGasto(){

    document.getElementById(
        "modalGasto"
    ).style.display = "flex";
}

function cerrarGasto(){

    document.getElementById(
        "modalGasto"
    ).style.display = "none";
}

function guardarIngresoModal(){

    agregarIngreso();
    cerrarIngreso();
}

function guardarGastoModal(){

    agregarGasto();
    cerrarGasto();
}



