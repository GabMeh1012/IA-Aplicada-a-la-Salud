"use strict";

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Stepper: ¿Cómo aprende una IA médica? ---------- */
  var stepperTrack = document.querySelector(".stepper-track");
  if (stepperTrack) {
    var stepItems = Array.prototype.slice.call(stepperTrack.querySelectorAll(".step-item"));
    var stepPanels = Array.prototype.slice.call(document.querySelectorAll("[data-step-panel]"));
    var stepLineFill = document.getElementById("stepLineFill");
    var totalSteps = stepItems.length;

    function goToStep(step) {
      stepItems.forEach(function (item) {
        var n = Number(item.dataset.step);
        item.classList.toggle("active", n === step);
        item.classList.toggle("done", n < step);
      });
      stepPanels.forEach(function (panel) {
        panel.hidden = Number(panel.dataset.stepPanel) !== step;
      });
      if (stepLineFill && totalSteps > 1) {
        var progress = ((step - 1) / (totalSteps - 1)) * 76;
        stepLineFill.style.width = progress + "%";
      }
    }

    stepItems.forEach(function (item) {
      item.addEventListener("click", function () {
        goToStep(Number(item.dataset.step));
      });
    });

    document.querySelectorAll("[data-step-next]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = Number(btn.closest("[data-step-panel]").dataset.stepPanel);
        if (current < totalSteps) goToStep(current + 1);
      });
    });

    document.querySelectorAll("[data-step-prev]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var current = Number(btn.closest("[data-step-panel]").dataset.stepPanel);
        if (current > 1) goToStep(current - 1);
      });
    });

    goToStep(1);
  }

  /* ---------- Áreas de aplicación: lista + panel de detalle ---------- */
  var areasList = document.querySelectorAll(".areas-list-item");
  var areasPanels = document.querySelectorAll("[data-area-panel]");

  areasList.forEach(function (item) {
    item.addEventListener("click", function () {
      var target = item.dataset.area;
      areasList.forEach(function (i) {
        i.classList.toggle("active", i === item);
      });
      areasPanels.forEach(function (panel) {
        panel.hidden = panel.dataset.areaPanel !== target;
      });
    });
  });

  /* ---------- Mito o realidad: tarjetas volteables ---------- */
  document.querySelectorAll(".flip-card").forEach(function (card) {
    card.addEventListener("click", function (evento) {
      if (evento.target.closest("a")) return;
      card.classList.toggle("flipped");
    });
    card.addEventListener("keydown", function (evento) {
      if (evento.target.closest("a")) return;
      if (evento.key === "Enter" || evento.key === " ") {
        evento.preventDefault();
        card.classList.toggle("flipped");
      }
    });
  });

  /* ---------- Acordeón: principios de la OMS ---------- */
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
