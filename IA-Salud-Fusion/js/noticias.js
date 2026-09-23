"use strict";

document.addEventListener("DOMContentLoaded", function () {
  var carousel = document.querySelector(".news-carousel");
  if (!carousel) return;

  var track = carousel.querySelector(".carousel-track");
  var slides = Array.prototype.slice.call(carousel.querySelectorAll(".carousel-slide"));
  var thumbs = Array.prototype.slice.call(carousel.querySelectorAll(".thumb"));
  var filterPills = document.querySelectorAll(".filter-pill");
  var AUTOPLAY_MS = 6000;

  var currentFilter = "todas";
  var activeIndex = 0;
  var autoplayTimer = null;

  function eligibleIndices() {
    var result = [];
    slides.forEach(function (slide, i) {
      if (currentFilter === "todas" || slide.dataset.category === currentFilter) {
        result.push(i);
      }
    });
    return result;
  }

  function restartProgress(thumb) {
    var bar = thumb.querySelector(".thumb-progress");
    if (!bar) return;
    bar.classList.remove("animating");
    // forzar reflow para poder reiniciar la animación
    void bar.offsetWidth;
    bar.style.setProperty("--autoplay-duration", AUTOPLAY_MS + "ms");
    bar.classList.add("animating");
  }

  function stopProgress(thumb) {
    var bar = thumb.querySelector(".thumb-progress");
    if (!bar) return;
    bar.classList.remove("animating");
  }

  function showSlide(index) {
    slides.forEach(function (slide, i) {
      slide.classList.toggle("active", i === index);
    });
    thumbs.forEach(function (thumb, i) {
      thumb.classList.toggle("active", i === index);
      if (i === index) {
        restartProgress(thumb);
      } else {
        stopProgress(thumb);
      }
    });
    activeIndex = index;
  }

  function applyFilter(filter) {
    currentFilter = filter;
    var eligible = eligibleIndices();

    thumbs.forEach(function (thumb, i) {
      thumb.hidden = eligible.indexOf(i) === -1;
    });

    if (eligible.indexOf(activeIndex) === -1 && eligible.length) {
      showSlide(eligible[0]);
    } else if (eligible.length) {
      showSlide(activeIndex);
    }
    restartAutoplay();
  }

  function step(direction) {
    var eligible = eligibleIndices();
    if (!eligible.length) return;
    var pos = eligible.indexOf(activeIndex);
    if (pos === -1) pos = 0;
    var nextPos = (pos + direction + eligible.length) % eligible.length;
    showSlide(eligible[nextPos]);
  }

  function restartAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(function () {
      step(1);
    }, AUTOPLAY_MS);
  }

  track.addEventListener("click", function (evento) {
    var arrow = evento.target.closest(".carousel-arrow");
    if (!arrow) return;
    step(arrow.classList.contains("next") ? 1 : -1);
    restartAutoplay();
  });

  thumbs.forEach(function (thumb, i) {
    thumb.addEventListener("click", function () {
      showSlide(i);
      restartAutoplay();
    });
  });

  filterPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      filterPills.forEach(function (p) {
        p.classList.remove("active");
      });
      pill.classList.add("active");
      applyFilter(pill.dataset.filter);
    });
  });

  carousel.addEventListener("mouseenter", function () {
    if (autoplayTimer) clearInterval(autoplayTimer);
  });
  carousel.addEventListener("mouseleave", restartAutoplay);

  showSlide(0);
  restartAutoplay();

  // Pestañas de "Más noticias"
  var sidebarTabs = document.querySelectorAll(".sidebar-tabs .tab");
  var sidebarItems = document.querySelectorAll(".sidebar-list > li");

  sidebarTabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      sidebarTabs.forEach(function (t) {
        t.classList.remove("active");
      });
      tab.classList.add("active");
      var target = tab.dataset.tab;
      sidebarItems.forEach(function (item) {
        var tags = (item.dataset.tags || "").split(" ");
        item.hidden = tags.indexOf(target) === -1;
      });
    });
  });
});
