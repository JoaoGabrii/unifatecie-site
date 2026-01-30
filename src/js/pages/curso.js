import { fetchCursos, getCursoById } from "../shared/courses-api.js";

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

(async function init() {
  const id = getQueryParam("id");
  const container = document.querySelector("#curso");

  if (!id) {
    container.innerHTML = "<p>Curso não encontrado.</p>";
    return;
  }

  const all = await fetchCursos();
  const curso = getCursoById(all, id);

  if (!curso) {
    container.innerHTML = "<p>Curso não encontrado.</p>";
    return;
  }

  const mensalidade = (Number(curso.mensalidade) || 0).toLocaleString("pt-BR", {
    style: "currency", currency: "BRL"
  });

  container.innerHTML = `
    <div class="curso__layout">
      <div class="curso__image">
        <img src="/${curso.imagem || "assets/images/placeholder.jpg"}" alt="${curso.nome}">
      </div>
      <div class="curso__info">
        <h1>${curso.nome}</h1>
        <p class="muted">${curso.duracao} • ${curso.modalidade}</p>
        <p class="price">${mensalidade}/mês</p>
        <p>${curso.descricao || ""}</p>

        <button class="btn btn--primary" id="matricular" type="button">
          Matricule-se
        </button>
      </div>
    </div>
  `;

  document.querySelector("#matricular").addEventListener("click", () => {
    window.location.href =
      `/pages/matricula.html?curso=${encodeURIComponent(curso.id)}`;
  });
})();