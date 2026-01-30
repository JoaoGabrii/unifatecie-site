function qs(sel, root = document) { return root.querySelector(sel); }
function qsa(sel, root = document) { return [...root.querySelectorAll(sel)]; }

function initSlider(root) {
  const track = qs("[data-track]", root);
  const slides = qsa(".slide", root);
  const prev = qs("[data-prev]", root);
  const next = qs("[data-next]", root);
  const dotsWrap = qs("[data-dots]", root);

  let idx = 0;
  let timer = null;

  dotsWrap.innerHTML = "";
  slides.forEach((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "dot" + (i === 0 ? " is-active" : "");
    b.setAttribute("aria-label", `Ir para o slide ${i + 1}`);
    b.addEventListener("click", () => go(i));
    dotsWrap.appendChild(b);
  });

  const dots = qsa(".dot", dotsWrap);

  function paint() {
    dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
    track.style.transform = `translateX(${idx * -100}%)`;
  }

  function go(i) {
    idx = (i + slides.length) % slides.length;
    paint();
    restart();
  }

  function restart() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => go(idx + 1), 6500);
  }

  prev.addEventListener("click", () => go(idx - 1));
  next.addEventListener("click", () => go(idx + 1));

  // swipe
  let startX = 0;
  track.addEventListener("touchstart", (e) => startX = e.touches[0].clientX, { passive: true });
  track.addEventListener("touchend", (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = endX - startX;
    if (Math.abs(diff) > 45) go(idx + (diff < 0 ? 1 : -1));
  });

  paint();
  restart();
}

(function init() {
  const slider = document.querySelector("[data-slider]");
  if (slider) initSlider(slider);
})();

