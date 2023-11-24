const aspiradora = document.querySelector(".aspiradora");
const bodegas = document.querySelectorAll(".bodega");
const statusDiv = document.createElement("div");
const batteryStatusDiv = document.getElementById("batteryStatus");
const bodegasLimpiasDiv = document.getElementById("bodegasLimpias");
const startButton = document.getElementById("startButton");

let bodegasLimpiadas = 0;
let bateria = 2.5;
let estadoAspiradora = "inactiva";
const bodegasContadas = new Set();

startButton.addEventListener("click", estadosInicialesAleatorios);
document.body.appendChild(statusDiv);
statusDiv.innerText = "Esperando...";

//funcion generar delay
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Función para generar movimiento de la aspiradora
async function moverAspiradora(destX, destY) {
  aspiradora.style.transform = `translate(${destX - 515}px, ${destY - 210}px)`;
  await sleep(4000);
}

// Función para generar estados iniciales de bodegas
function estadosInicialesAleatorios() {
  bodegas.forEach((bodega) => {
    const estadosPosibles = ["limpia", "sucia", "libre-limpiar", "ocupada"];
    const estadoAleatorio =
      estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)];
    bodega.className = `bodega ${estadoAleatorio}`;
    bodega.innerText =
      estadoAleatorio.charAt(0).toUpperCase() + estadoAleatorio.slice(1);

    if (estadoAleatorio === "sucia") bodega.innerText += " 💩";
    else if (estadoAleatorio === "libre-limpiar") bodega.innerText += " 🆓";
    else if (estadoAleatorio === "ocupada") bodega.innerText += " 🚧";

    if (estadoAleatorio === "limpia") {
      bodega.innerText += " 🌟";
      bodegasLimpiadas++;
      bodegasContadas.add(bodega);
    }
  });
  document.getElementById("startButton").disabled = true;
  actualizarBodegasLimpias();
  ejecutarSimulacion();
}

// Función para actualizar el contador de bodegas limpias
function actualizarBodegasLimpias() {
  bodegasLimpiasDiv.innerText = `${bodegasContadas.size}`;
}

// Función para actualizar el estado de la batería
function actualizarEstadoBateria() {
  const porcentajeBateria = (bateria / 2.5) * 100;
  batteryStatusDiv.innerText = `${porcentajeBateria.toFixed(0)}%`;
}

// Función para cargar la batería
async function cargarBateria() {
  statusDiv.innerText = "En espera.";
  await moverAspiradora(515, 210);
  await sleep(2000);
  statusDiv.innerText = "Cargando...";
  await sleep(2000);
  bateria = 2.5;
  actualizarEstadoBateria();
  statusDiv.innerText = "Reanuda la limpieza";
  await sleep(1500);
  await moverAspiradora(bodegas[0].offsetLeft, bodegas[0].offsetTop);
  await ejecutarSimulacion();
  actualizarBodegasLimpias();
}

// Función para cargar la batería baja de la aspiradora
async function cargarBateriaBaja() {
  statusDiv.innerText = "Batería baja, regresando a la estación de carga.";
  await moverAspiradora(515, 210);
  await sleep(2000);
  statusDiv.innerText = "Cargando...";
  await sleep(2000);
  statusDiv.innerText = "Reanudando la limpieza.";
  bateria = 2.5;
  actualizarEstadoBateria();
  // await moverAspiradora(bodegas[0].offsetLeft, bodegas[0].offsetTop);
  // await ejecutarSimulacion();
  actualizarBodegasLimpias();
}

// Función para cambiar el estado de las bodegas limpias
async function cambiarEstadoBodegasLimpias() {
  await sleep(10000);

  bodegasContadas.forEach((bodega) => {
    const estadosPosibles = ["sucia", "libre-limpiar", "ocupada"];
    const estadoAleatorio =
      estadosPosibles[Math.floor(Math.random() * estadosPosibles.length)];
    bodega.classList.remove("limpia");
    bodega.classList.add(estadoAleatorio);
    bodega.innerText =
      estadoAleatorio.charAt(0).toUpperCase() + estadoAleatorio.slice(1);

    if (estadoAleatorio === "sucia") bodega.innerText += " 💩";
    else if (estadoAleatorio === "libre-limpiar") bodega.innerText += " 🆓";
    else if (estadoAleatorio === "ocupada") bodega.innerText += " 🚧";
  });
  bodegasContadas.clear();
  actualizarBodegasLimpias();
}

// Función para limpiar bodegas
async function limpiarBodega(bodega) {
  if (
    bodega.classList.contains("libre-limpiar") ||
    bodega.classList.contains("sucia")
  ) {
    aspiradora.style.transform = `translate(${bodega.offsetLeft - 515}px, ${
      bodega.offsetTop - 210
    }px)`;
    await sleep(1000);

    if (bodega.classList.contains("sucia")) {
      bodega.classList.remove("sucia");
    }
    bodega.classList.remove("libre-limpiar");
    bodega.classList.add("limpia");
    bodega.innerText = "Limpia 🌟";
    bateria -= 1;

    if (!bodegasContadas.has(bodega)) {
      bodegasContadas.add(bodega);
      actualizarBodegasLimpias();

      if (bodegasContadas.size % 4 === 0) {
        cambiarEstadoBodegasLimpias();
      }
    }

    actualizarEstadoBateria();
    statusDiv.innerText = `Limpiando Bodega ${bodega.textContent}`;
  }
}

// Función para ejecutar la simulación
async function ejecutarSimulacion() {

  while (true) {

    for (let i = 0; i < bodegas.length; i++) {
      const bodega = bodegas[i];
      const estadoBodega = bodega.className.split(" ")[1];
      
      aspiradora.style.transform = `translate(${bodega.offsetLeft - 515}px, ${
        bodega.offsetTop - 210
      }px)`;
      await sleep(2000);
      
      if ((bateria <= 0.5) & (estadoBodega !== "limpia")) {
        estadoAspiradora = "inactiva";
        await cargarBateriaBaja();
        estadoAspiradora = "limpiando";
      }
      
      if (estadoBodega !== "limpia") {
        statusDiv.innerText = `Limpiando Bodega ${bodega.textContent}`;
      }
      
      switch (estadoBodega) {
        case "libre-limpiar":
          case "sucia":
            if (bateria > 0.5) {
              await limpiarBodega(bodega);
            }
            break;
            case "ocupada":
              statusDiv.innerText = `Bodega Ocupada - Continuando limpieza.`;
              setTimeout(() => {
                bodega.classList.remove("ocupada");
                bodega.classList.add("libre-limpiar");
                bodega.innerText = "Libre-limpiar 🆓";
              }, 3000);
              break;
              case "limpia":
                statusDiv.innerText = `Bodega ya limpia.`;
                break;
              }
            }
          }
            
            // if (bateria > 0) {
              //   statusDiv.innerText = "En la base de carga";
              //   await cargarBateria();
              //   await sleep(2000);
              // }
            }
            