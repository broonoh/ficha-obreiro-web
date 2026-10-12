// js/app.js
// Liga schema + storage + renderizadores na página ficha.html: lê o ?id=
// da URL, carrega/salva no Firestore (autosave com debounce), cuida da
// foto e do botão de gerar PDF.

let FICHA_ID = null;
let DADOS_ATUAIS = {};
let TIMER_SALVAR = null;
let CANCELAR_ESCUTA = null;

function mostrarToast(mensagem, erro = false) {
  const toast = document.getElementById("toast");
  toast.textContent = mensagem;
  toast.className = "toast visivel" + (erro ? " erro" : "");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("visivel"), 2200);
}

function marcarStatus(texto, salvo = false) {
  const status = document.getElementById("status-topo");
  status.textContent = texto;
  status.className = "status" + (salvo ? " salvo" : "");
}

/** Salva um campo com debounce (evita gravar a cada tecla digitada). */
function agendarSalvar(key, valor) {
  DADOS_ATUAIS[key] = valor;
  marcarStatus("Salvando...");
  clearTimeout(TIMER_SALVAR);
  TIMER_SALVAR = setTimeout(async () => {
    try {
      await salvarCampos(FICHA_ID, { [key]: valor });
      marcarStatus("Salvo ✓", true);
    } catch (e) {
      console.error(e);
      marcarStatus("Erro ao salvar");
      mostrarToast("❌ Erro ao salvar: " + e.message, true);
    }
  }, 800);
}

async function tratarFotoSelecionada(arquivo) {
  marcarStatus("Processando foto...");
  try {
    const base64 = await processarFoto(arquivo);
    DADOS_ATUAIS.foto_base64 = base64;
    await salvarCampos(FICHA_ID, { foto_base64: base64 });
    marcarStatus("Salvo ✓", true);
    mostrarToast("✅ Foto salva");
  } catch (e) {
    console.error(e);
    mostrarToast("❌ Erro ao enviar foto: " + e.message, true);
  }
}

function gerarPdf() {
  const view = document.getElementById("view-impressao");
  renderizarImpressao(view, DADOS_ATUAIS);
  view.classList.add("ativa");
  window.print();
  // Some de novo depois de imprimir, pra não atrapalhar quem continua editando.
  setTimeout(() => view.classList.remove("ativa"), 500);
}

function copiarLink() {
  const input = document.getElementById("campo-link");
  input.select();
  navigator.clipboard.writeText(input.value).then(
    () => mostrarToast("🔗 Link copiado!"),
    () => mostrarToast("Não foi possível copiar — selecione e copie manualmente", true)
  );
}

async function iniciar() {
  const params = new URLSearchParams(window.location.search);
  FICHA_ID = params.get("id");

  if (!FICHA_ID) {
    document.body.innerHTML = `<main><div class="aviso">
      Link inválido: falta o identificador da ficha (parâmetro <code>?id=</code>).
      Volte para a <a href="index.html">página inicial</a> e crie uma nova ficha.
    </div></main>`;
    return;
  }

  document.getElementById("campo-link").value = window.location.href;

  const dados = await carregarFicha(FICHA_ID);
  if (dados === null) {
    document.body.innerHTML = `<main><div class="aviso">
      Essa ficha não existe mais (ID: ${FICHA_ID}). Verifique o link ou crie uma
      <a href="index.html">nova ficha</a>.
    </div></main>`;
    return;
  }
  DADOS_ATUAIS = dados;

  const container = document.getElementById("secoes");
  renderizarFormulario(container, DADOS_ATUAIS, agendarSalvar, tratarFotoSelecionada);
  marcarStatus("Carregado", true);

  // Abre a primeira seção (Dados Pessoais) por padrão.
  const primeiroHeader = container.querySelector(".secao-header");
  if (primeiroHeader) primeiroHeader.click();

  // Reflete em tempo real edições feitas pela outra pessoa (obreiro/pastor
  // no mesmo link, em abas/aparelhos diferentes) — só repinta se a mudança
  // não veio deste mesmo cliente (evita apagar o que a pessoa está digitando).
  CANCELAR_ESCUTA = escutarFicha(FICHA_ID, (novosDados) => {
    const temFocoEmCampo = document.activeElement && document.activeElement.tagName !== "BODY";
    if (temFocoEmCampo) return;
    DADOS_ATUAIS = novosDados;
    const abertas = [...container.querySelectorAll(".secao-header.aberta")].map((h) => h.querySelector(".titulo").textContent);
    renderizarFormulario(container, DADOS_ATUAIS, agendarSalvar, tratarFotoSelecionada);
    container.querySelectorAll(".secao-header").forEach((h) => {
      if (abertas.includes(h.querySelector(".titulo").textContent)) h.click();
    });
  });

  document.getElementById("btn-pdf").addEventListener("click", gerarPdf);
  document.getElementById("btn-copiar-link").addEventListener("click", copiarLink);
}

window.addEventListener("DOMContentLoaded", iniciar);
window.addEventListener("beforeunload", () => {
  if (CANCELAR_ESCUTA) CANCELAR_ESCUTA();
});
