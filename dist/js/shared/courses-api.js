const cursosUrl = new URL("../../data/cursos.json", import.meta.url);

export async function fetchCursos() {
  const res = await fetch(cursosUrl, { cache: "no-store" });
  if (!res.ok) throw new Error("Não foi possível carregar cursos.json");
  return await res.json();
}

export function getCursoById(cursos, id) {
  return cursos.find(c => String(c.id) === String(id));
}

export function filterCursosByTipo(cursos, tipo) {
  return cursos.filter(c => c.ativo !== false && c.tipo === tipo);
}