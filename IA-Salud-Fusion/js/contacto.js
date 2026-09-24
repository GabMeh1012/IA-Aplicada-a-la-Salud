"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("formContacto");
  if (!form) return;

  var estado = document.getElementById("mensajeEstado");

  var campos = {
    motivo: {
      error: document.getElementById("errorMotivo"),
      validar: function () {
        var marcado = form.querySelector('input[name="motivo"]:checked');
        if (!marcado) return "Selecciona sobre qué quieres hablar.";
        return "";
      }
    },
    nombre: {
      input: document.getElementById("nombre"),
      error: document.getElementById("errorNombre"),
      validar: function (valor) {
        if (!valor.trim()) return "El nombre es obligatorio.";
        if (valor.trim().length < 3) return "Debe tener al menos 3 caracteres.";
        if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(valor.trim())) return "Solo se permiten letras y espacios.";
        return "";
      }
    },
    correo: {
      input: document.getElementById("correo"),
      error: document.getElementById("errorCorreo"),
      validar: function (valor) {
        var limpio = valor.trim();
        if (!limpio) return "El correo es obligatorio.";
        var arroba = limpio.indexOf("@");
        var usuario = arroba === -1 ? "" : limpio.slice(0, arroba);
        var dominio = arroba === -1 ? "" : limpio.slice(arroba + 1);
        var formatoValido = usuario.length > 0 && /^[^\s@]+$/.test(usuario) && /^[^\s@.]+(\.[^\s@.]+)+$/.test(dominio);
        if (!formatoValido) return "Ingresa un correo válido.";
        return "";
      }
    },
    telefono: {
      input: document.getElementById("telefono"),
      error: document.getElementById("errorTelefono"),
      validar: function (valor) {
        var soloDigitos = valor.replace(/\D/g, "");
        if (!valor.trim()) return "El teléfono es obligatorio.";
        if (soloDigitos.length < 7 || soloDigitos.length > 15) return "Debe tener entre 7 y 15 dígitos.";
        return "";
      }
    },
    mensaje: {
      input: document.getElementById("mensaje"),
      error: document.getElementById("errorMensaje"),
      validar: function (valor) {
        if (!valor.trim()) return "El mensaje es obligatorio.";
        if (valor.trim().length < 20) return "Debe tener al menos 20 caracteres.";
        return "";
      }
    }
  };

  function validarCampo(clave) {
    var campo = campos[clave];
    var valorActual = campo.input ? campo.input.value : null;
    var mensajeError = campo.validar(valorActual);
    campo.error.textContent = mensajeError;
    if (campo.input) campo.input.setAttribute("aria-invalid", mensajeError ? "true" : "false");
    return mensajeError === "";
  }

  Object.keys(campos).forEach(function (clave) {
    var campo = campos[clave];
    if (!campo.input) return;
    var evento = campo.input.tagName === "SELECT" ? "change" : "input";
    campo.input.addEventListener(evento, function () {
      validarCampo(clave);
    });
    campo.input.addEventListener("blur", function () {
      validarCampo(clave);
    });
  });

  form.querySelectorAll('input[name="motivo"]').forEach(function (radio) {
    radio.addEventListener("change", function () {
      validarCampo("motivo");
    });
  });

  function mostrarEstado(texto, tipo) {
    estado.textContent = texto;
    estado.className = "show " + tipo;
  }

  function descargarJSON(datos) {
    var blob = new Blob([JSON.stringify(datos, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = "contactos.json";
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }

  function limpiarErrores() {
    Object.keys(campos).forEach(function (clave) {
      campos[clave].error.textContent = "";
      if (campos[clave].input) campos[clave].input.setAttribute("aria-invalid", "false");
    });
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var claves = Object.keys(campos);
    var esValido = claves.map(validarCampo).every(Boolean);

    if (!esValido) {
      mostrarEstado("Revisa los campos marcados en rojo antes de enviar.", "error");
      return;
    }

    var motivoMarcado = form.querySelector('input[name="motivo"]:checked');
    var preferenciaMarcada = form.querySelector('input[name="preferencia"]:checked');

    var registro = {
      motivo: motivoMarcado.value,
      nombre: campos.nombre.input.value.trim(),
      correo: campos.correo.input.value.trim(),
      telefono: campos.telefono.input.value.trim(),
      preferencia: preferenciaMarcada ? preferenciaMarcada.value : "",
      mensaje: campos.mensaje.input.value.trim(),
      acepto: document.getElementById("acepto").checked,
      fecha: new Date().toISOString()
    };

    var contactosPrevios = JSON.parse(localStorage.getItem("contactos") || "[]");
    contactosPrevios.push(registro);
    localStorage.setItem("contactos", JSON.stringify(contactosPrevios));

    descargarJSON(contactosPrevios);

    form.reset();
    limpiarErrores();
    actualizarContador();
    ocultarSugerencia();

    mostrarEstado("Datos guardados correctamente. Se descargó el archivo contactos.json.", "success");
  });

  form.addEventListener("reset", function () {
    limpiarErrores();
    estado.className = "";
    estado.textContent = "";
    window.setTimeout(function () {
      actualizarContador();
      ocultarSugerencia();
    }, 0);
  });

  /* ---------- Atajo Ctrl/Cmd + Enter para enviar ---------- */
  form.addEventListener("keydown", function (evento) {
    if ((evento.ctrlKey || evento.metaKey) && evento.key === "Enter") {
      evento.preventDefault();
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit", { cancelable: true }));
    }
  });

  /* ---------- Contador de caracteres del mensaje ---------- */
  var mensajeInput = campos.mensaje.input;
  var contador = document.getElementById("contadorMensaje");

  function actualizarContador() {
    if (!mensajeInput || !contador) return;
    var largo = mensajeInput.value.trim().length;
    var estadoClase = "";
    if (largo >= 20) {
      estadoClase = " ok";
    } else if (largo > 0) {
      estadoClase = " warn";
    }
    contador.textContent = mensajeInput.value.length + " / 500 · mínimo 20";
    contador.className = "char-counter" + estadoClase;
  }

  if (mensajeInput) {
    mensajeInput.addEventListener("input", actualizarContador);
    actualizarContador();
  }

  /* ---------- Sugerencia de corrección de correo ---------- */
  var correoInput = campos.correo.input;
  var sugerenciaBox = document.getElementById("sugerenciaCorreo");
  var btnSugerencia = document.getElementById("btnAplicarSugerencia");

  var dominiosConocidos = {
    "gmial.com": "gmail.com",
    "gmai.com": "gmail.com",
    "gnail.com": "gmail.com",
    "gmail.con": "gmail.com",
    "hotmial.com": "hotmail.com",
    "hotmai.com": "hotmail.com",
    "hotmail.con": "hotmail.com",
    "yaho.com": "yahoo.com",
    "yahoo.con": "yahoo.com",
    "outlok.com": "outlook.com",
    "outlook.con": "outlook.com",
    "utp.com": "utp.ac.pa",
    "utp.edu.pa": "utp.ac.pa",
    "utp.pa": "utp.ac.pa"
  };

  function sugerirDominio(valor) {
    var arroba = valor.lastIndexOf("@");
    if (arroba === -1) return null;
    var usuario = valor.slice(0, arroba);
    var dominio = valor.slice(arroba + 1).toLowerCase();
    if (!dominio) return null;

    if (dominiosConocidos[dominio]) {
      return usuario + "@" + dominiosConocidos[dominio];
    }
    if (dominio === "utp") {
      return usuario + "@utp.ac.pa";
    }
    return null;
  }

  function ocultarSugerencia() {
    sugerenciaBox.classList.remove("show");
  }

  if (correoInput) {
    correoInput.addEventListener("input", function () {
      var sugerido = sugerirDominio(correoInput.value.trim());
      if (sugerido) {
        btnSugerencia.textContent = sugerido;
        sugerenciaBox.classList.add("show");
      } else {
        ocultarSugerencia();
      }
    });

    btnSugerencia.addEventListener("click", function () {
      correoInput.value = btnSugerencia.textContent;
      ocultarSugerencia();
      validarCampo("correo");
      correoInput.focus();
    });
  }

  /* ---------- Copiar correo del equipo ---------- */
  var btnCopiar = document.getElementById("btnCopiarCorreo");
  var correoEquipo = document.getElementById("correoEquipo");
  var tooltip = document.getElementById("copyTooltip");

  function mostrarTooltipCopiado() {
    tooltip.classList.add("show");
    window.setTimeout(function () {
      tooltip.classList.remove("show");
    }, 1600);
  }

  if (btnCopiar) {
    btnCopiar.addEventListener("click", function () {
      var texto = correoEquipo.textContent.trim();
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(texto).then(mostrarTooltipCopiado).catch(mostrarTooltipCopiado);
      } else {
        mostrarTooltipCopiado();
      }
    });
  }


  /* ---------- Acordeón de preguntas frecuentes ---------- */
  document.querySelectorAll("[data-accordion-trigger]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      var item = trigger.closest("[data-accordion-item]");
      var wasOpen = item.classList.contains("open");
      item.parentElement.querySelectorAll("[data-accordion-item]").forEach(function (i) {
        i.classList.remove("open");
      });
      if (!wasOpen) item.classList.add("open");
    });
  });
});
