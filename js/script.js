/* =========================
   INICIAR 
========================= */

document.addEventListener("DOMContentLoaded", function() {
    cargarDatos();

    var fechaInput = document.getElementById("fecha");
    if (fechaInput) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }

    if (document.getElementById("listaIngresos")) {
        mostrarIngresos();
    }
    if (document.getElementById("listaGastos")) {
        mostrarGastos();
    }
    if (document.getElementById("historialCompleto")) {
        mostrarHistorialCompleto();
    }
    if (document.getElementById("periodo")) {
        actualizarReportes();
    }
    if (document.getElementById("nombre")) {
        cargarConfig();
    }
});

/* =========================
   VARIABLES GLOBALES
========================= */

var saldo = 0;
var totalIngresos = 0;
var totalGastos = 0;
var comida = 0;
var transporte = 0;
var educacion = 0;
var ocio = 0;
var ropa = 0;
var salud = 0;
var otro = 0;

/* =========================
   CARGAR DATOS DESDE LOCALSTORAGE
========================= */

function cargarDatos() {
    var ingresos = JSON.parse(localStorage.getItem("ingresos") || "[]");
    totalIngresos = 0;
    ingresos.forEach(function(i) {
        totalIngresos += i.monto;
    });
    
    var gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
    totalGastos = 0;
    comida = 0;
    transporte = 0;
    educacion = 0;
    ocio = 0;
    ropa = 0;
    salud = 0;
    otro = 0;

    gastos.forEach(function(g) {
        totalGastos += g.monto;
        
        if (g.categoria === "Comida") comida += g.monto;
        else if (g.categoria === "Transporte") transporte += g.monto;
        else if (g.categoria === "Educacion") educacion += g.monto;
        else if (g.categoria === "Ocio") ocio += g.monto;
        else if (g.categoria === "Ropa") ropa += g.monto;
        else if (g.categoria === "Salud") salud += g.monto;
        else if (g.categoria === "Otro") otro += g.monto;
    });
    
    saldo = totalIngresos - totalGastos;
    
    mostrarUltimosMovimientos();
    cargarHistorial();
    actualizarSaldo();
}

/* =========================
   MOSTRAR ÚLTIMOS 3 MOVIMIENTOS
========================= */
function mostrarUltimosMovimientos() {
    var ultimos = document.getElementById("ultimosMovimientos");
    if (!ultimos) return;
    
    var ingresos = JSON.parse(localStorage.getItem("ingresos") || "[]");
    var gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
    
    ultimos.innerHTML = "";
    var todos = [];
    
    ingresos.forEach(function(i) {
        todos.push({ tipo: "ingreso", descripcion: "💰 " + (i.fuente || "Ingreso"), monto: i.monto, fecha: i.fecha, timestamp: i.timestamp });
    });
    gastos.forEach(function(g) {
        var emoji = "";
        if (g.categoria === "Comida") emoji = "🍔";
        else if (g.categoria === "Transporte") emoji = "🚌";
        else if (g.categoria === "Educacion") emoji = "📚";
        else if (g.categoria === "Ocio") emoji = "🎮";
        else if (g.categoria === "Ropa") emoji = "👕";
        else if (g.categoria === "Salud") emoji = "💊";
        else if (g.categoria === "Otro") emoji = "📦";
        
        todos.push({ tipo: "gasto", descripcion: emoji + " " + g.nombre, monto: g.monto, fecha: g.fecha, timestamp: g.timestamp });
    });
    
    todos.sort(function(a, b) {
        var tiempoA = a.timestamp ? new Date(a.timestamp) : (a.fecha ? new Date(a.fecha) : 0);
        var tiempoB = b.timestamp ? new Date(b.timestamp) : (b.fecha ? new Date(b.fecha) : 0);
        return tiempoB - tiempoA;
    });
    
    var ultimos3 = todos.slice(0, 3);
    
    if (ultimos3.length === 0) {
        ultimos.innerHTML = '<div class="movimiento"><span>Sin movimientos</span><span>$0.00</span></div>';
    } else {
        ultimos3.forEach(function(m) {
            var div = document.createElement("div");
            div.className = "movimiento";
            if (m.tipo === "ingreso") {
                div.innerHTML = '<span>' + m.descripcion + '</span><span style="color:#00C853;">+$' + m.monto.toFixed(2) + '</span>';
            } else {
                div.innerHTML = '<span>' + m.descripcion + '</span><span style="color:#E53935;">-$' + m.monto.toFixed(2) + '</span>';
            }
            ultimos.appendChild(div);
        });
    }
}

/* =========================
   CARGAR HISTORIAL (Solo 3)
========================= */
function cargarHistorial() {
    var lista = document.getElementById("lista");
    if (!lista) return;
    
    var ingresos = JSON.parse(localStorage.getItem("ingresos") || "[]");
    var gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
    
    lista.innerHTML = "";
    var todos = [];
    
    ingresos.forEach(function(i) {
        todos.push({ tipo: "ingreso", descripcion: i.fuente || "Ingreso", categoria: "Ingreso", monto: i.monto, fecha: i.fecha, timestamp: i.timestamp });
    });
    
    gastos.forEach(function(g) {
        todos.push({ tipo: "gasto", descripcion: g.nombre, categoria: g.categoria, monto: g.monto, fecha: g.fecha, timestamp: g.timestamp });
    });
    
    todos.sort(function(a, b) {
        var tiempoA = a.timestamp ? new Date(a.timestamp) : (a.fecha ? new Date(a.fecha) : 0);
        var tiempoB = b.timestamp ? new Date(b.timestamp) : (b.fecha ? new Date(b.fecha) : 0);
        return tiempoB - tiempoA;
    });
    
    var ultimos3 = todos.slice(0, 3);
    
    if (ultimos3.length === 0) {
        lista.innerHTML = '<tr><td colspan="4" class="sin-datos">No hay movimientos</td></tr>';
    } else {
        ultimos3.forEach(function(m) {
            var fila = document.createElement("tr");
            var claseCat = "cat-educacion";
            if (m.categoria === "Comida") claseCat = "cat-comida";
            else if (m.categoria === "Transporte") claseCat = "cat-transporte";
            else if (m.categoria === "Ocio") claseCat = "cat-ocio";
            
            if (m.tipo === "ingreso") {
                fila.innerHTML = '<td>' + m.descripcion + '</td><td><span class="categoria cat-educacion">' + m.categoria + '</span></td><td class="tipo-ingreso">Ingreso</td><td style="color:#00C853;font-weight:bold;">+$' + m.monto.toFixed(2) + '</td>';
            } else {
                fila.innerHTML = '<td>' + m.descripcion + '</td><td><span class="categoria ' + claseCat + '">' + m.categoria + '</span></td><td class="tipo-gasto">Gasto</td><td style="color:#E53935;font-weight:bold;">-$' + m.monto.toFixed(2) + '</td>';
            }
            lista.appendChild(fila);
        });
    }
}

/* =========================
   TOGGLE MENÚ
========================= */

function toggleMenu() {
    var menu = document.getElementById("menu");
    if (menu) {
        menu.classList.toggle("mostrar");
    }
}

/* =========================
   MENÚ (Cerrar al hacer clic afuera)
========================= */

document.addEventListener("click", function(event) {
    var menu = document.getElementById("menu");
    var boton = document.querySelector(".menu-toggle");
    
    if (menu && boton) {
        if (menu.classList.contains("mostrar") && !menu.contains(event.target) && !boton.contains(event.target)) {
            menu.classList.remove("mostrar");
        }
    }
});

/* =========================
   ACTUALIZAR SALDO - CORREGIDO
========================= */

function actualizarSaldo() {
    if (document.getElementById("saldo")) {
        document.getElementById("saldo").textContent = "$" + saldo.toFixed(2);
    }
    if (document.getElementById("totalIngresos")) {
        document.getElementById("totalIngresos").textContent = "$" + totalIngresos.toFixed(2);
    }
    if (document.getElementById("totalGastos")) {
        document.getElementById("totalGastos").textContent = "$" + totalGastos.toFixed(2);
    }
    if (document.getElementById("ahorro")) {
        document.getElementById("ahorro").textContent = "$" + saldo.toFixed(2);
    }
    
    if (document.getElementById("catComida")) document.getElementById("catComida").textContent = "$" + comida.toFixed(2);
    if (document.getElementById("catTransporte")) document.getElementById("catTransporte").textContent = "$" + transporte.toFixed(2);
    if (document.getElementById("catEducacion")) document.getElementById("catEducacion").textContent = "$" + educacion.toFixed(2);
    if (document.getElementById("catOcio")) document.getElementById("catOcio").textContent = "$" + ocio.toFixed(2);
    if (document.getElementById("catRopa")) document.getElementById("catRopa").textContent = "$" + ropa.toFixed(2);
    if (document.getElementById("catSalud")) document.getElementById("catSalud").textContent = "$" + salud.toFixed(2);
    if (document.getElementById("catOtro")) document.getElementById("catOtro").textContent = "$" + otro.toFixed(2);
    actualizarGraficoPastel();
    
    // ✅ CORREGIDO: Siempre ocultar la alerta permanente
    var alerta = document.getElementById("alerta");
    if (alerta) {
        alerta.style.display = "none";
    }
}

/* =========================
   GRAFICO PASTEL
========================= */

function actualizarGraficoPastel() {
    var grafico = document.getElementById("graficoPastel");
    if (!grafico) return;
    
    var total = comida + transporte + educacion + ocio + ropa + salud + otro;
    if (total <= 0) {
        grafico.style.background = "#ddd";
        return;
    }
    
    var pComida = (comida / total) * 100;
    var pTransporte = (transporte / total) * 100;
    var pEducacion = (educacion / total) * 100;
    var pOcio = (ocio / total) * 100;
    var pRopa = (ropa / total) * 100;
    var pSalud = (salud / total) * 100;
    
    grafico.style.background = 
        "conic-gradient(" +
        "#7B5DF5 0% " + pComida + "%, " +
        "#5B6CFF " + pComida + "% " + (pComida + pTransporte) + "%, " +
        "#00C896 " + (pComida + pTransporte) + "% " + (pComida + pTransporte + pEducacion) + "%, " +
        "#FFB300 " + (pComida + pTransporte + pEducacion) + "% " + (pComida + pTransporte + pEducacion + pOcio) + "%, " +
        "#FF6B6B " + (pComida + pTransporte + pEducacion + pOcio) + "% " + (pComida + pTransporte + pEducacion + pOcio + pRopa) + "%, " +
        "#FF9F43 " + (pComida + pTransporte + pEducacion + pOcio + pRopa) + "% " + (pComida + pTransporte + pEducacion + pOcio + pRopa + pSalud) + "%, " +
        "#A55EEA " + (pComida + pTransporte + pEducacion + pOcio + pRopa + pSalud) + "% 100%)";
}

/* =========================
   MODALES
========================= */

function abrirIngreso() {
    var modal = document.getElementById("modalIngreso");
    if (modal) modal.style.display = "flex";
}

function cerrarIngreso() {
    var modal = document.getElementById("modalIngreso");
    if (modal) modal.style.display = "none";
}

function abrirGasto() {
    var modal = document.getElementById("modalGasto");
    if (modal) modal.style.display = "flex";
}

function cerrarGasto() {
    var modal = document.getElementById("modalGasto");
    if (modal) modal.style.display = "none";
}

/* =========================
   GUARDAR INGRESO
========================= */

function guardarIngresoModal() {
    var input = document.getElementById("ingreso");
    if (!input) return;
    
    var ingreso = Number(input.value);
    
    if (isNaN(ingreso) || ingreso <= 0) {
        alert("El monto debe ser mayor a 0");
        input.focus();
        return;
    }
    
    var ingresos = JSON.parse(localStorage.getItem("ingresos") || "[]");
    ingresos.push({
        monto: ingreso,
        fuente: "Dashboard",
        descripcion: "Ingreso rápido",
        fecha: new Date().toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
        timestamp: Date.now()
    });
    localStorage.setItem("ingresos", JSON.stringify(ingresos));
    
    cargarDatos();
    input.value = "";
    cerrarIngreso();
}

/* =========================
   GUARDAR GASTO (Modal) - CORREGIDO
========================= */
function guardarGastoModal() {
    var nombreInput = document.getElementById("nombre");
    var gastoInput = document.getElementById("gasto");
    var catInput = document.getElementById("categoria");
    
    if (!nombreInput || !gastoInput || !catInput) return;
    
    var nombre = nombreInput.value;
    var gasto = Number(gastoInput.value);
    var categoria = catInput.value;
    
    if (nombre === "" || isNaN(gasto) || gasto <= 0) {
        alert("Complete todos los campos. El monto debe ser mayor a 0");
        return;
    }
    
    // ✅ NUEVA LÓGICA: Advertir si el gasto excede el saldo (pero permitir igual)
    var ingresos = JSON.parse(localStorage.getItem("ingresos") || "[]");
    var gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
    var totalIng = 0;
    var totalGas = 0;
    ingresos.forEach(function(i) { totalIng += i.monto; });
    gastos.forEach(function(g) { totalGas += g.monto; });
    var saldoActual = totalIng - totalGas;
    
    if (totalIng > 0 && gasto > saldoActual) {
        alert("⚠️ Nota: Este gasto excede tu saldo disponible.");
        return;
    }
    
    var gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
    gastos.push({
        nombre: nombre,
        monto: gasto,
        categoria: categoria,
        fecha: new Date().toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
        timestamp: Date.now()
    });
    localStorage.setItem("gastos", JSON.stringify(gastos));
    
    cargarDatos();
    mostrarGastos();
    
    nombreInput.value = "";
    gastoInput.value = "";
    cerrarGasto();
}
/* =========================
   PÁGINA INGRESOS
========================= */
function guardarIngreso(event) {
    event.preventDefault();

    var monto = Number(document.getElementById("monto").value);
    var fuente = document.getElementById("fuente").value;
    var descripcion = document.getElementById("descripcion").value;
    var fecha = document.getElementById("fecha").value;

    if (isNaN(monto) || monto <= 0) {
        alert("El monto debe ser mayor a 0");
        return;
    }

    // Evitar números absurdamente grandes
    if (monto > 999999999) {
        alert("Monto demasiado grande");
        return;
    }

    var ingreso = {
        monto: monto,
        fuente: fuente,
        descripcion: descripcion,
        fecha: new Date().toLocaleString('es-MX', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(',', ''),
        timestamp: Date.now()
    };

    var ingresos = JSON.parse(localStorage.getItem("ingresos") || "[]");
    ingresos.push(ingreso);
    localStorage.setItem("ingresos", JSON.stringify(ingresos));

    cargarDatos();
    mostrarIngresos();

    document.getElementById("formIngreso").reset();
    document.getElementById("fecha").value = new Date().toISOString().split('T')[0];

    alert("Ingreso guardado! ✅");
}
function mostrarIngresos() {

    var lista = document.getElementById("listaIngresos");
    if (!lista) return;

    var ingresos = JSON.parse(localStorage.getItem("ingresos") || "[]");

    var total = 0;
    var totalMes = 0;
    var ultimo = 0;

    lista.innerHTML = "";

    if (ingresos.length === 0) {

        lista.innerHTML =
            '<tr><td colspan="4" class="sin-datos">No hay ingresos registrados</td></tr>';

        if (document.getElementById("totalIngresado"))
            document.getElementById("totalIngresado").textContent = "$0.00";

        if (document.getElementById("totalMes"))
            document.getElementById("totalMes").textContent = "$0.00";

        if (document.getElementById("ultimoIngreso"))
            document.getElementById("ultimoIngreso").textContent = "$0.00";

        return;
    }

    // Ordenar por timestamp más reciente
    ingresos.sort(function(a, b) {
        return (b.timestamp || 0) - (a.timestamp || 0);
    });

    // Obtener el ingreso más reciente
    var ingresoMasReciente = ingresos.reduce(function(actual, siguiente) {

        return (siguiente.timestamp || 0) > (actual.timestamp || 0)
            ? siguiente
            : actual;

    });

    ultimo = Number(ingresoMasReciente.monto);

    console.log("Último ingreso detectado:", ingresoMasReciente);

    ingresos.forEach(function(ing) {

        total += Number(ing.monto);

        if (ing.fecha) {

            const fechaTexto = ing.fecha.split(" ")[0];
            const partes = fechaTexto.split("/");

            const dia = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10) - 1;
            const anio = parseInt(partes[2], 10);

            const fechaIngreso = new Date(anio, mes, dia);
            const hoy = new Date();

            if (
                fechaIngreso.getMonth() === hoy.getMonth() &&
                fechaIngreso.getFullYear() === hoy.getFullYear()
            ) {
                totalMes += Number(ing.monto);
            }
        }

        var fila = document.createElement("tr");

        fila.innerHTML =
            '<td>' + ing.fecha + '</td>' +
            '<td>' + ing.fuente + '</td>' +
            '<td>' + (ing.descripcion || '-') + '</td>' +
            '<td style="color:#00C853;font-weight:bold;">+$' +
            Number(ing.monto).toFixed(2) +
            '</td>';

        lista.appendChild(fila);
    });

    if (document.getElementById("totalIngresado"))
        document.getElementById("totalIngresado").textContent =
            "$" + total.toFixed(2);

    if (document.getElementById("totalMes"))
        document.getElementById("totalMes").textContent =
            "$" + totalMes.toFixed(2);

    if (document.getElementById("ultimoIngreso"))
        document.getElementById("ultimoIngreso").textContent =
            "$" + ultimo.toFixed(2);
}
/* =========================
   PÁGINA GASTOS 
========================= */
function guardarGasto(event) {
    event.preventDefault();
    var nombre = document.getElementById("nombreGasto").value;
    var monto = Number(document.getElementById("montoGasto").value);
    var categoria = document.getElementById("categoriaGasto").value;
    var fecha = document.getElementById("fechaGasto").value;
    
    if (nombre === "" || isNaN(monto) || monto <= 0) {
        alert("El monto debe ser mayor a 0");
        return;
    }
    
    // ✅ NUEVA LÓGICA: Advertir si el gasto excede el saldo (pero permitir igual)
    var ingresos = JSON.parse(localStorage.getItem("ingresos") || "[]");
    var gastosActuales = JSON.parse(localStorage.getItem("gastos") || "[]");
    var totalIng = 0;
    var totalGas = 0;
    ingresos.forEach(function(i) { totalIng += i.monto; });
    gastosActuales.forEach(function(g) { totalGas += g.monto; });
    var saldoActual = totalIng - totalGas;
    
    if (totalIng > 0 && monto > saldoActual) {
        alert("⚠️ Nota: Este gasto excede tu saldo disponible.");
        return;
    }
    
    var gasto = {
        nombre: nombre,
        monto: monto,
        categoria: categoria,
        fecha: new Date().toLocaleString('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', ''),
        timestamp: Date.now()
    };
    
    var gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
    gastos.push(gasto);
    localStorage.setItem("gastos", JSON.stringify(gastos));
    
    cargarDatos();
    mostrarGastos();
    
    document.getElementById("formGasto").reset();
    document.getElementById("fechaGasto").value = new Date().toISOString().split('T')[0];
    
    alert("Gasto guardado! ✅");
}

function mostrarGastos() {
    var lista = document.getElementById("listaGastos");
    if (!lista) return;

    var gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
    var total = 0;
    var totalMes = 0;
    var ultimo = 0;

    lista.innerHTML = "";

    if (gastos.length === 0) {
        lista.innerHTML = '<tr><td colspan="4" class="sin-datos">No hay gastos registrados</td></tr>';
        return;
    }

    gastos.sort(function(a, b) {
        return b.timestamp - a.timestamp;
    });

    gastos.forEach(function(g) {

        total += Number(g.monto);

        if (g.fecha) {

            const fechaTexto = g.fecha.split(" ")[0];
            const partes = fechaTexto.split("/");

            const dia = parseInt(partes[0], 10);
            const mes = parseInt(partes[1], 10) - 1;
            const anio = parseInt(partes[2], 10);

            const fechaGasto = new Date(anio, mes, dia);
            const hoy = new Date();

            if (
                fechaGasto.getMonth() === hoy.getMonth() &&
                fechaGasto.getFullYear() === hoy.getFullYear()
            ) {
                totalMes += Number(g.monto);
            }
        }

        if (ultimo === 0) {
            ultimo = Number(g.monto);
        }

        var claseCat = "cat-educacion";

        if (g.categoria === "Comida")
            claseCat = "cat-comida";
        else if (g.categoria === "Transporte")
            claseCat = "cat-transporte";
        else if (g.categoria === "Ocio")
            claseCat = "cat-ocio";

        var fila = document.createElement("tr");

        fila.innerHTML =
            '<td>' + g.fecha + '</td>' +
            '<td>' + g.nombre + '</td>' +
            '<td><span class="categoria ' + claseCat + '">' +
            g.categoria +
            '</span></td>' +
            '<td style="color:#E53935;font-weight:bold;">-$' +
            Number(g.monto).toFixed(2) +
            '</td>';

        lista.appendChild(fila);
    });

    if (document.getElementById("totalGastado"))
        document.getElementById("totalGastado").textContent =
            "$" + total.toFixed(2);

    if (document.getElementById("gastoMes"))
        document.getElementById("gastoMes").textContent =
            "$" + totalMes.toFixed(2);

    if (document.getElementById("ultimoGasto"))
        document.getElementById("ultimoGasto").textContent =
            "$" + ultimo.toFixed(2);
}
/* =========================
   CERRAR MODALES
========================= */

window.onclick = function(event) {
    if (event.target.id === "modalIngreso") cerrarIngreso();
    if (event.target.id === "modalGasto") cerrarGasto();
}

/* =========================
   HISTORIAL COMPLETO
========================= */
function mostrarHistorialCompleto() {
    var lista = document.getElementById("historialCompleto");
    if (!lista) return;
    
    var ingresos = JSON.parse(localStorage.getItem("ingresos") || "[]");
    var gastos = JSON.parse(localStorage.getItem("gastos") || "[]");
    var todos = [];
    
    ingresos.forEach(function(i) {
        todos.push({ tipo: "ingreso", descripcion: i.fuente || "Ingreso", categoria: "Ingreso", monto: i.monto, fecha: i.fecha, timestamp: i.timestamp });
    });
    
    gastos.forEach(function(g) {
        todos.push({ tipo: "gasto", descripcion: g.nombre, categoria: g.categoria, monto: g.monto, fecha: g.fecha, timestamp: g.timestamp });
    });
    
    todos.sort(function(a, b) {
        var tiempoA = a.timestamp ? new Date(a.timestamp) : (a.fecha ? new Date(a.fecha) : 0);
        var tiempoB = b.timestamp ? new Date(b.timestamp) : (b.fecha ? new Date(b.fecha) : 0);
        return tiempoB - tiempoA;
    });
    
    var filtroTipo = document.getElementById("filtroTipo");
    if (filtroTipo && filtroTipo.value !== "todos") {
        todos = todos.filter(function(t) { return t.tipo === filtroTipo.value; });
    }
    
    var filtroFecha = document.getElementById("filtroFecha");
    if (filtroFecha && filtroFecha.value !== "todos") {
        var ahora = new Date();
        var mesActual = ahora.toISOString().substring(0, 7);
        var mesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
        var mesAnteriorStr = mesAnterior.toISOString().substring(0, 7);
        
        var obtenerMes = function(fecha) {
            if (!fecha) return "";
            var fechaSolo = fecha.split(" ")[0];
            var partes = fechaSolo.split("/");
            if (partes.length === 3) return partes[2] + "-" + partes[1];
            return "";
        };
        
        todos = todos.filter(function(t) {
            var mesMov = obtenerMes(t.fecha);
            if (filtroFecha.value === "mes") return mesMov === mesActual;
            else if (filtroFecha.value === "anterior") return mesMov === mesAnteriorStr;
            return true;
        });
    }
    
    lista.innerHTML = "";
    var totalIngresos = 0;
    var totalGastos = 0;
    
    if (todos.length === 0) {
        lista.innerHTML = '<tr><td colspan="5" class="sin-datos">No hay movimientos</td></tr>';
    } else {
        todos.forEach(function(m) {
            if (m.tipo === "ingreso") totalIngresos += m.monto;
            else totalGastos += m.monto;
            
            var fila = document.createElement("tr");
            var claseCat = "cat-educacion";
            if (m.categoria === "Comida") claseCat = "cat-comida";
            else if (m.categoria === "Transporte") claseCat = "cat-transporte";
            else if (m.categoria === "Ocio") claseCat = "cat-ocio";
            else if (m.categoria === "Ropa") claseCat = "cat-ropa";
            else if (m.categoria === "Salud") claseCat = "cat-salud";
            
            if (m.tipo === "ingreso") {
                fila.innerHTML = '<td>' + m.fecha + '</td><td>' + m.descripcion + '</td><td><span class="categoria cat-educacion">' + m.categoria + '</span></td><td class="tipo-ingreso">Ingreso</td><td style="color:#00C853;font-weight:bold;">+$' + m.monto.toFixed(2) + '</td>';
            } else {
                fila.innerHTML = '<td>' + m.fecha + '</td><td>' + m.descripcion + '</td><td><span class="categoria ' + claseCat + '">' + m.categoria + '</span></td><td class="tipo-gasto">Gasto</td><td style="color:#E53935;font-weight:bold;">-$' + m.monto.toFixed(2) + '</td>';
            }
            lista.appendChild(fila);
        });
    }
    
    if (document.getElementById("totalIngresos")) document.getElementById("totalIngresos").textContent = "$" + totalIngresos.toFixed(2);
    if (document.getElementById("totalGastos")) document.getElementById("totalGastos").textContent = "$" + totalGastos.toFixed(2);
    if (document.getElementById("balance")) document.getElementById("balance").textContent = "$" + (totalIngresos - totalGastos).toFixed(2);
}

function filtrarHistorial() {
    mostrarHistorialCompleto();
}

/* =========================
   CONFIGURACIÓN
========================= */

function guardarConfig() {
    var config = {
        nombre: document.getElementById("nombre").value,
        email: document.getElementById("email").value,
        carrera: document.getElementById("carrera").value,
        moneda: document.getElementById("moneda").value,
        alertaSaldo: document.getElementById("alertaSaldo").checked,
        recordatorio: document.getElementById("recordatorio").checked
    };
    localStorage.setItem("config", JSON.stringify(config));
    alert("Configuración guardada! ✅");
}

function cargarConfig() {
    var config = JSON.parse(localStorage.getItem("config") || "{}");
    if (config.nombre) document.getElementById("nombre").value = config.nombre;
    if (config.email) document.getElementById("email").value = config.email;
    if (config.carrera) document.getElementById("carrera").value = config.carrera;
    if (config.moneda) document.getElementById("moneda").value = config.moneda;
    if (config.alertaSaldo !== undefined) document.getElementById("alertaSaldo").checked = config.alertaSaldo;
    if (config.recordatorio !== undefined) document.getElementById("recordatorio").checked = config.recordatorio;
}

function eliminarDatos() {
    if (confirm("¿Estás seguro de que quieres eliminar todos los datos? Esta acción no se puede deshacer.")) {
        if (confirm("¿REALMENTE quieres eliminar todo? No hay vuelta atrás.")) {
            localStorage.removeItem("ingresos");
            localStorage.removeItem("gastos");
            alert("Datos eliminados!");
            location.reload();
        }
    }
}

/* Inicializar */
if (document.getElementById("nombre")) {
    cargarConfig();
}