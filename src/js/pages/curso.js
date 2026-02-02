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
  <div class="curso-hero">
    <div class="curso-hero__image">
      <img src="/${curso.imagem || "assets/images/placeholder.jpg"}" alt="${curso.nome}" loading="lazy" decoding="async">
    </div>

    <div class="curso-hero__card">
      <h1 class="curso-title">${curso.nome}</h1>
      <p class="curso-meta">${curso.duracao} • ${curso.modalidade} • ${curso.tipo}</p>
      <div class="curso-price">${mensalidade}/mês</div>

      <div class="curso-actions">
        <button class="btn btn--primary" id="matricular" type="button">Matricule-se</button>
        <a class="btn" href="javascript:history.back()">Voltar</a>
      </div>
    </div>
  </div>

  <div class="curso-sections">
    <section class="curso-section">
      <h2>Sobre o curso</h2>
      <p>${curso.sobre || "Em breve mais informações do curso."}</p>
    </section>

    <section class="curso-section">
    <h2>Saiba mais ...</h2>
    <p>${curso.saibaMais || "Mais informações em breve."}</p>
    </section>
    
    <section class="curso-section">
      <h2>Como funciona o EAD</h2>
      <p>${curso.comoFunciona || "O curso EAD oferece formação completa com flexibilidade para o estudante organizar seus horários, mantendo a qualidade e a credibilidade acadêmica. As disciplinas são realizadas integralmente no ambiente virtual de aprendizagem, que disponibiliza aulas gravadas, materiais interativos, fóruns e biblioteca digital. Aulas ao vivo e atividades síncronas garantem interação em tempo real para debates, esclarecimento de dúvidas e aplicação prática dos conteúdos."}</p>
    </section>
  </div>
`;

  document.querySelector("#matricular").addEventListener("click", () => {
    window.location.href =
      `/pages/matricula.html?curso=${encodeURIComponent(curso.id)}`;
  });
})();