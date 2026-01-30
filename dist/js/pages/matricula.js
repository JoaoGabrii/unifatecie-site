import { fetchCursos, getCursoById } from "../shared/courses-api.js";

const ENDPOINT_URL = "https://script.google.com/macros/s/AKfycbxNHs7ROiP7CB8MfOrdCl-ouxieQ1sXSmxS-gl9Ew09tL-9TubOyyz8_ogrFDoYI_-HnQ/exec";

function getQueryParam(name) {
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}

function formToObj(form) {
  const fd = new FormData(form);
  const obj = {};
  for (const [k, v] of fd.entries()) obj[k] = String(v).trim();
  return obj;
}

// ===== Máscaras / validações =====
function onlyDigits(v){ return (v || "").replace(/\D/g, ""); }

function maskCPF(v){
  v = onlyDigits(v).slice(0,11);
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d)/, "$1.$2");
  v = v.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  return v;
}

function maskPhone(v){
  v = onlyDigits(v).slice(0,11);
  if (v.length <= 10){
    v = v.replace(/(\d{2})(\d)/, "($1) $2");
    v = v.replace(/(\d{4})(\d)/, "$1-$2");
    return v;
  }
  v = v.replace(/(\d{2})(\d)/, "($1) $2");
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v;
}

function maskCEP(v){
  v = onlyDigits(v).slice(0,8);
  v = v.replace(/(\d{5})(\d)/, "$1-$2");
  return v;
}

function setError(input, msg){
  if (!input) return;
  const field = input.closest(".field");
  if (!field) return;
  field.classList.add("has-error");
  input.classList.add("is-invalid");
  const small = field.querySelector("small");
  if (small && msg) small.textContent = msg;
}

function clearError(input){
  if (!input) return;
  const field = input.closest(".field");
  if (!field) return;
  field.classList.remove("has-error");
  input.classList.remove("is-invalid");
}

function validateCPF(cpfMasked){
  const cpf = onlyDigits(cpfMasked);
  return cpf.length === 11;
}
function validatePhone(phoneMasked){
  const n = onlyDigits(phoneMasked);
  return n.length === 10 || n.length === 11;
}
function validateCEP(cepMasked){
  const n = onlyDigits(cepMasked);
  return n.length === 8;
}

(async function init() {
  const form = document.querySelector("#form");
  const status = document.querySelector("#status");
  const btn = document.querySelector("#btnSubmit");
  const select = document.querySelector("#cursoSelect");

  const cpfEl = document.querySelector("#cpf");
  const telEl = document.querySelector("#telefone");
  const cepEl = document.querySelector("#cep");

  // listeners de máscara
  if (cpfEl){
    cpfEl.addEventListener("input", () => {
      cpfEl.value = maskCPF(cpfEl.value);
      clearError(cpfEl);
    });
    cpfEl.addEventListener("blur", () => {
      if (cpfEl.value && !validateCPF(cpfEl.value)) setError(cpfEl, "CPF inválido");
    });
  }

  if (telEl){
    telEl.addEventListener("input", () => {
      telEl.value = maskPhone(telEl.value);
      clearError(telEl);
    });
    telEl.addEventListener("blur", () => {
      if (telEl.value && !validatePhone(telEl.value)) setError(telEl, "Telefone inválido");
    });
  }

  if (cepEl){
    cepEl.addEventListener("input", () => {
      cepEl.value = maskCEP(cepEl.value);
      clearError(cepEl);
    });
    cepEl.addEventListener("blur", () => {
      if (cepEl.value && !validateCEP(cepEl.value)) setError(cepEl, "CEP inválido");
    });
  }

  // cursos
  const all = await fetchCursos();
  const ativos = all.filter(c => c.ativo !== false);

  ativos
    .slice()
    .sort((a, b) => a.nome.localeCompare(b.nome))
    .forEach(c => {
      const opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = `${c.nome} (${c.tipo === "pos" ? "Pós" : "Graduação"})`;
      select.appendChild(opt);
    });

  // pré-seleciona via ?curso=ads
  const pre = getQueryParam("curso");
  if (pre) select.value = pre;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "";

    // validações (antes de enviar)
    let ok = true;

    if (!validateCPF(cpfEl?.value || "")){
      setError(cpfEl, "CPF inválido");
      ok = false;
    }
    if (!validatePhone(telEl?.value || "")){
      setError(telEl, "Telefone inválido");
      ok = false;
    }
    if (!validateCEP(cepEl?.value || "")){
      setError(cepEl, "CEP inválido");
      ok = false;
    }

    if (!ok){
      status.textContent = "❌ Corrija os campos em vermelho.";
      return;
    }

    const payload = formToObj(form);
    const curso = getCursoById(all, payload.cursoId);

    payload.cursoNome = curso?.nome || "";
    payload.tipoCurso = curso?.tipo || "";
    payload.origemUrl = window.location.href;
    payload.userAgent = navigator.userAgent;

    btn.disabled = true;
    btn.textContent = "Enviando...";

    try {
      const res = await fetch(ENDPOINT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });

      const json = await res.json().catch(() => ({}));
      if (!json.ok) throw new Error(json.error || "Falha ao enviar");

      form.reset();
      if (pre) select.value = pre;

      status.textContent = "✅ Cadastro enviado! Em até 24h entraremos em contato.";
    } catch (err) {
      status.textContent = "❌ Não foi possível enviar agora. Tente novamente.";
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = "Enviar";
    }
  });
})();
