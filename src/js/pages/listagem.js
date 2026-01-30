import { fetchCursos, filterCursosByTipo } from "../shared/courses-api.js";

const PER_PAGE = 10;

function renderCard(curso) {
  const mensalidade = (Number(curso.mensalidade) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });

  return `
    <article class="card" data-id="${curso.id}">
      <div class="card__thumb">
        <img src="/${curso.imagem || "assets/images/placeholder.jpg"}" alt="${curso.nome}">
      </div>
      <div class="card__body">
        <h3 class="card__title">${curso.nome}</h3>
        <p class="card__meta">${curso.duracao} • ${curso.modalidade}</p>
        <p class="card__price">${mensalidade}/mês</p>
        <button class="btn btn--primary card__btn" type="button">Ver detalhes</button>
      </div>
    </article>
  `;
}

function renderPages(container, totalPages, active) {
  container.innerHTML = "";
  for (let i = 1; i <= totalPages; i++) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "page" + (i === active ? " is-active" : "");
    b.textContent = String(i);
    b.dataset.page = String(i);
    container.appendChild(b);
  }
}

function slideSwap(grid, html) {
  // sai pra esquerda e entra da direita (leve e simples)
  grid.classList.remove("enter");
  grid.classList.add("exit");
  setTimeout(() => {
    grid.innerHTML = html;
    grid.classList.remove("exit");
    grid.classList.add("enter");
  }, 180);
}

export async function initListagem({ tipo }) {
  const grid = document.querySelector("#grid");
  const prev = document.querySelector("#prev");
  const next = document.querySelector("#next");
  const pagesEl = document.querySelector("#pages");

  const all = await fetchCursos();
  const cursos = filterCursosByTipo(all, tipo);

  let page = 1;
  const totalPages = Math.max(1, Math.ceil(cursos.length / PER_PAGE));

  function paint() {
    const start = (page - 1) * PER_PAGE;
    const items = cursos.slice(start, start + PER_PAGE);

    const html = items.map(renderCard).join("");
    slideSwap(grid, html);

    renderPages(pagesEl, totalPages, page);

    prev.disabled = page === 1;
    next.disabled = page === totalPages;
  }

  // navegação
  prev.addEventListener("click", () => {
    if (page > 1) { page--; paint(); }
  });

  next.addEventListener("click", () => {
    if (page < totalPages) { page++; paint(); }
  });

  pagesEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-page]");
    if (!btn) return;
    page = Number(btn.dataset.page);
    paint();
  });

  // clique no card -> curso.html?id=...
  grid.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    const id = card.dataset.id;
    window.location.href = `/pages/curso.html?id=${encodeURIComponent(id)}`;
  });

  paint();
}