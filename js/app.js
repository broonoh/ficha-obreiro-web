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

/** Guarda o ID/nome da ficha no navegador, pra tela principal (index.html)
 * mostrar um atalho "Continuar ficha" sem precisar colar o link de novo. */
function lembrarFichaLocal() {
  localStorage.setItem("ultimaFicha", JSON.stringify({ id: FICHA_ID, nome: DADOS_ATUAIS.nome || "" }));
}

/** Salva um campo com debounce (evita gravar a cada tecla digitada). */
function agendarSalvar(key, valor) {
  DADOS_ATUAIS[key] = valor;
  marcarStatus("Salvando...");
  clearTimeout(TIMER_SALVAR);
  TIMER_SALVAR = setTimeout(async () => {
    try {
      await salvarCampos(FICHA_ID, { [key]: valor });
      lembrarFichaLocal();
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

/** "João da Silva" -> "joao-da-silva" (sem acento, só letras/números/hífen). */
function slugificar(texto) {
  return (texto || "")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Espera uma imagem terminar de carregar (ou falhar), sem travar pra sempre
 * se o evento nunca disparar por algum motivo. */
function esperarImagem(img) {
  if (img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    const limite = setTimeout(resolve, 2000);
    const pronto = () => { clearTimeout(limite); resolve(); };
    img.addEventListener("load", pronto, { once: true });
    img.addEventListener("error", pronto, { once: true });
  });
}

async function gerarPdf() {
  const view = document.getElementById("view-impressao");
  renderizarImpressao(view, DADOS_ATUAIS);
  view.classList.add("ativa");

  // O logo (e a foto do obreiro) são <img> recém-criados pelo innerHTML
  // acima — ainda estão buscando o arquivo pela rede nesse instante. Sem
  // esperar o carregamento de verdade, window.print() podia disparar com
  // a imagem ainda em branco, saindo sem o logo no PDF.
  await Promise.all([...view.querySelectorAll("img")].map(esperarImagem));

  // O nome sugerido pro arquivo (e o texto que o navegador imprime no
  // cabeçalho/rodapé da página, se a opção "Cabeçalhos e rodapés" estiver
  // marcada na caixa de impressão) vem do <title> da página no momento do
  // print — trocamos pra "ficha-obreiro-nome-sobrenome" e devolvemos ao
  // original depois.
  const tituloOriginal = document.title;
  const nomeArquivo = "ficha-obreiro" + (slugificar(DADOS_ATUAIS.nome) ? "-" + slugificar(DADOS_ATUAIS.nome) : "");
  document.title = nomeArquivo;

  // window.print() NÃO é garantido ser bloqueante em todo navegador — no
  // Chrome desktop o script pausa até a caixa fechar, mas em outros
  // (Firefox, Safari, navegadores de celular) o script continua rodando
  // com a caixa ainda aberta. Por isso o "esconder de novo" não pode ser
  // um setTimeout com tempo fixo (podia rodar ANTES da pessoa terminar de
  // salvar, apagando o conteúdo que seria impresso = PDF em branco) — tem
  // que esperar o evento "afterprint", que só dispara quando a impressão
  // realmente termina, não importa o navegador.
  const esconderDeNovo = () => {
    view.classList.remove("ativa");
    document.title = tituloOriginal;
    window.removeEventListener("afterprint", esconderDeNovo);
  };
  window.addEventListener("afterprint", esconderDeNovo);

  // Pequena espera antes de abrir a impressão: chamar window.print() na
  // sequência imediata do innerHTML podia capturar a página antes do
  // navegador terminar de desenhar o layout novo (ex.: logo ainda não
  // posicionado), saindo com páginas em branco.
  setTimeout(() => window.print(), 150);
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
  lembrarFichaLocal();

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
    lembrarFichaLocal();
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
