"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("formContacto");
  if (!form) return;

  var estado = document.getElementById("mensajeEstado");

  var campos = {
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
        if (!valor.trim()) return "El correo es obligatorio.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor.trim())) return "Ingresa un correo válido.";
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
    tipoConsulta: {
      input: document.getElementById("tipoConsulta"),
      error: document.getElementById("errorTipoConsulta"),
      validar: function (valor) {
        if (!valor) return "Selecciona un asunto.";
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
    var mensajeError = campo.validar(campo.input.value);
    campo.error.textContent = mensajeError;
    campo.input.setAttribute("aria-invalid", mensajeError ? "true" : "false");
    return mensajeError === "";
  }

  Object.keys(campos).forEach(function (clave) {
    var evento = campos[clave].input.tagName === "SELECT" ? "change" : "input";
    campos[clave].input.addEventListener(evento, function () {
      validarCampo(clave);
    });
    campos[clave].input.addEventListener("blur", function () {
      validarCampo(clave);
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
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }

  form.addEventListener("submit", function (evento) {
    evento.preventDefault();

    var claves = Object.keys(campos);
    var esValido = claves.map(validarCampo).every(Boolean);

    if (!esValido) {
      mostrarEstado("Revisa los campos marcados en rojo antes de enviar.", "error");
      return;
    }

    var registro = {
      nombre: campos.nombre.input.value.trim(),
      correo: campos.correo.input.value.trim(),
      telefono: campos.telefono.input.value.trim(),
      asunto: campos.tipoConsulta.input.value,
      mensaje: campos.mensaje.input.value.trim(),
      acepto: document.getElementById("acepto").checked,
      fecha: new Date().toISOString()
    };

    var contactosPrevios = JSON.parse(localStorage.getItem("contactos") || "[]");
    contactosPrevios.push(registro);
    localStorage.setItem("contactos", JSON.stringify(contactosPrevios));

    descargarJSON(contactosPrevios);

    form.reset();
    claves.forEach(function (clave) {
      campos[clave].error.textContent = "";
      campos[clave].input.setAttribute("aria-invalid", "false");
    });

    mostrarEstado("Datos guardados correctamente. Se descargó el archivo contactos.json.", "success");
  });

  form.addEventListener("reset", function () {
    Object.keys(campos).forEach(function (clave) {
      campos[clave].error.textContent = "";
      campos[clave].input.setAttribute("aria-invalid", "false");
    });
    estado.className = "";
    estado.textContent = "";
  });
});
