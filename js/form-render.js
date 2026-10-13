// js/form-render.js
// Constrói o formulário editável inteiro a partir de FICHA_SCHEMA — um
// único código genérico pra todos os ~110 campos (mesmo espírito do
// populate_screen()/to_dict() do app Python), em vez de escrever HTML
// fixo campo por campo.

/**
 * Renderiza o formulário dentro de `container`.
 * @param {HTMLElement} container
 * @param {object} dados - valores já salvos da ficha (pode ser {})
 * @param {(key: string, value: any) => void} onAlterar - chamado a cada
 *   mudança de campo (quem decide quando/como salvar é quem chama isso).
 * @param {(arquivo: File) => void} onFotoSelecionada
 */
function renderizarFormulario(container, dados, onAlterar, onFotoSelecionada) {
  container.innerHTML = "";

  for (const secao of FICHA_SCHEMA) {
    const secaoEl = document.createElement("div");
    secaoEl.className = "secao" + (secao.parte === "pastor" ? " parte-pastor" : "");

    const header = document.createElement("div");
    header.className = "secao-header";
    header.innerHTML = `
      <span class="icone">${secao.icone}</span>
      <span class="titulo">${secao.titulo}</span>
      ${secao.parte === "pastor" ? '<span class="secao-badge">Pastor</span>' : ""}
      <span class="chevron">▸</span>
    `;

    const corpo = document.createElement("div");
    corpo.className = "secao-corpo";

    for (const campo of secao.campos) {
      corpo.appendChild(renderizarCampo(campo, dados, onAlterar, onFotoSelecionada));
    }

    header.addEventListener("click", () => {
      header.classList.toggle("aberta");
      corpo.classList.toggle("aberta");
    });

    secaoEl.appendChild(header);
    secaoEl.appendChild(corpo);
    container.appendChild(secaoEl);
  }
}

function renderizarCampo(campo, dados, onAlterar, onFotoSelecionada) {
  if (campo.tipo === "titulo-grupo") {
    const titulo = document.createElement("div");
    titulo.className = "titulo-grupo";
    titulo.textContent = campo.label;
    return titulo;
  }

  const valor = dados[campo.key];

  if (campo.tipo === "foto") {
    return renderizarFoto(campo, dados, onFotoSelecionada);
  }

  if (campo.tipo === "checkbox") {
    const wrap = document.createElement("div");
    wrap.className = "campo-check";
    const id = `campo_${campo.key}`;
    wrap.innerHTML = `<input type="checkbox" id="${id}"><label for="${id}">${campo.label}</label>`;
    const input = wrap.querySelector("input");
    input.checked = valor === true || valor === "true";
    input.addEventListener("change", () => onAlterar(campo.key, input.checked));
    return wrap;
  }

  if (campo.tipo === "simnao") {
    const wrap = document.createElement("div");
    wrap.className = "campo-simnao";
    const nome = `campo_${campo.key}`;
    wrap.innerHTML = `
      <span class="rotulo">${campo.label}</span>
      <label><input type="radio" name="${nome}" value="sim"> Sim</label>
      <label><input type="radio" name="${nome}" value="nao"> Não</label>
    `;
    const radios = wrap.querySelectorAll("input");
    if (dados[`${campo.key}_sim`]) radios[0].checked = true;
    else if (dados[`${campo.key}_nao`]) radios[1].checked = true;
    radios.forEach((r) => {
      r.addEventListener("change", () => {
        onAlterar(`${campo.key}_sim`, r.value === "sim" && r.checked);
        onAlterar(`${campo.key}_nao`, r.value === "nao" && r.checked);
      });
    });
    return wrap;
  }

  const wrap = document.createElement("div");
  wrap.className = "campo";
  const id = `campo_${campo.key}`;
  const label = document.createElement("label");
  label.htmlFor = id;
  label.textContent = campo.label;
  wrap.appendChild(label);

  let input;
  if (campo.tipo === "textarea") {
    input = document.createElement("textarea");
  } else if (campo.tipo === "dropdown") {
    input = document.createElement("select");
    const vazio = document.createElement("option");
    vazio.value = "";
    vazio.textContent = "Selecione...";
    input.appendChild(vazio);
    for (const opcao of campo.opcoes) {
      const opt = document.createElement("option");
      opt.value = opcao;
      opt.textContent = opcao;
      input.appendChild(opt);
    }
  } else {
    input = document.createElement("input");
    input.type = campo.tipo === "numero" ? "number" : campo.tipo === "data" ? "date" : "text";
  }
  input.id = id;
  input.value = valor != null ? valor : "";
  input.addEventListener("input", () => onAlterar(campo.key, input.value));
  wrap.appendChild(input);
  return wrap;
}

function renderizarFoto(campo, dados, onFotoSelecionada) {
  const wrap = document.createElement("div");
  wrap.className = "foto-area";

  const preview = document.createElement("div");
  preview.className = "foto-preview";
  const url = dados.foto_url || dados.foto_base64;
  preview.innerHTML = url
    ? `<img src="${url}" id="foto-preview-img">`
    : `Sem foto<br>3x4 (terno e gravata)`;

  const botoes = document.createElement("div");
  botoes.className = "foto-botoes";
  botoes.innerHTML = `
    <button type="button" class="secundario" id="btn-selecionar-foto">📷 Selecionar Foto</button>
    <input type="file" id="input-foto" accept="image/*" style="display:none">
  `;

  wrap.appendChild(preview);
  wrap.appendChild(botoes);

  const inputFile = botoes.querySelector("#input-foto");
  botoes.querySelector("#btn-selecionar-foto").addEventListener("click", () => inputFile.click());
  inputFile.addEventListener("change", () => {
    const arquivo = inputFile.files[0];
    if (!arquivo) return;
    preview.innerHTML = `<img src="${URL.createObjectURL(arquivo)}">`;
    onFotoSelecionada(arquivo);
  });

  return wrap;
}
