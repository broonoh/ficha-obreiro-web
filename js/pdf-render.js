// js/pdf-render.js
// Monta a view de impressão (somente leitura) dentro de #view-impressao,
// replicando fielmente o layout do formulário original em papel da ICM
// (mesma estrutura usada em app/templates/ficha.html no app Python) —
// mesmas seções, mesma tabela de Dados Pessoais, mesmas duas colunas de
// Vida Espiritual, mesmos títulos verdes.

function v(valor) {
  if (valor === undefined || valor === null || valor === "") return "";
  return escaparHtml(String(valor));
}

/** <input type="date"> guarda "AAAA-MM-DD" — exibe como "DD/MM/AAAA". */
function formatarData(valor) {
  if (!valor) return valor;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : valor;
}

function escaparHtml(s) {
  const div = document.createElement("div");
  div.textContent = s;
  return div.innerHTML;
}

function checkHtml(valor) {
  if (valor === true || valor === "true") return '<span class="check check-yes">✓ Sim</span>';
  if (valor === false || valor === "false") return '<span class="check check-no">✓ Não</span>';
  return "";
}

function simNaoHtml(sim, nao) {
  if (sim) return '<span class="check check-yes">✓ Sim</span>';
  if (nao) return '<span class="check check-no">✓ Não</span>';
  return "";
}

/** Linha de item numerado (rótulo à esquerda + resposta à direita). */
function item(texto, valorHtml, full = false) {
  return `<div class="item${full ? " full" : ""}"><span class="texto">${escaparHtml(texto)}</span><span class="resp">${valorHtml}</span></div>`;
}
function itemV(texto, valor, full = false) {
  return item(texto, v(valor), full);
}
function itemCheck(texto, valor) {
  return item(texto, checkHtml(valor));
}

/** Dois campos lado a lado na mesma linha, cada um com seu rótulo. */
function itemPar(l1, v1, l2, v2) {
  return `<div class="item-par">
    <div class="meio"><span class="texto">${escaparHtml(l1)}</span><span class="resp">${v(v1)}</span></div>
    <div class="meio"><span class="texto">${escaparHtml(l2)}</span><span class="resp">${v(v2)}</span></div>
  </div>`;
}

/** Linha da tabela de Dados Pessoais: 2 ou 3 células rótulo+valor. */
function linha2(l_esq, v_esq, l_dir, v_dir) {
  return `<div class="linha-campo">
    <div class="celula" style="flex:0 0 46%;"><span class="rotulo">${escaparHtml(l_esq)}</span><span class="valor">${v(v_esq)}</span></div>
    <div class="celula" style="flex:1 1 auto;"><span class="rotulo">${escaparHtml(l_dir)}</span><span class="valor">${v(v_dir)}</span></div>
  </div>`;
}
function linha3(l1, v1, l2, v2, l3, v3) {
  return `<div class="linha-campo">
    <div class="celula" style="flex:0 0 46%;"><span class="rotulo">${escaparHtml(l1)}</span><span class="valor">${v(v1)}</span></div>
    <div class="celula" style="flex:0 0 27%;"><span class="rotulo">${escaparHtml(l2)}</span><span class="valor">${v(v2)}</span></div>
    <div class="celula" style="flex:1 1 auto;"><span class="rotulo">${escaparHtml(l3)}</span><span class="valor">${v(v3)}</span></div>
  </div>`;
}

function listaMarcados(pares) {
  return pares.filter(([ativo]) => ativo).map(([, label]) => label).join(", ") || null;
}

function situacaoOpcoesHtml(valor) {
  const opcoes = ["Aprovado", "Não Aprovado", "Rever", "Aguardar"];
  const labels = { "Aprovado": "APROVADO", "Não Aprovado": "NÃO APROVADO", "Rever": "REVER", "Aguardar": "AGUARDAR" };
  return `<div class="situacao-linha">
    <span class="rot">SITUAÇÃO:</span>
    ${opcoes.map(o => `<span class="situacao-opcao${o === valor ? " marcada" : ""}"><span class="caixa"></span>${labels[o]}</span>`).join("")}
  </div>`;
}

const LOGO_SRC = "assets/logo_icm.png";

function cabecalhoP1() {
  return `<div class="cabecalho-p1">
    <img class="logo" src="${LOGO_SRC}">
    <div class="titulo">
      <div class="l1">IGREJA CRISTÃ MARANATA</div>
      <div class="l2">FORMULÁRIO DE OBREIROS <span class="aviso-pdf">(todos os campos são de preenchimento obrigatório e nenhum item deve ser alterado)</span></div>
    </div>
  </div>`;
}

function cabecalhoVerde(titulo, subtitulo) {
  return `<div class="cabecalho-verde">
    <img class="logo" src="${LOGO_SRC}">
    <div class="titulo">${escaparHtml(titulo)}${subtitulo ? `<div>${escaparHtml(subtitulo)}</div>` : ""}</div>
  </div>`;
}

function campoNomeTopo(label, valor) {
  return `<div class="campo-nome-topo">${escaparHtml(label)} <span class="valor">${v(valor)}</span></div>`;
}

function blocoTexto(titulo, valor) {
  return `<div class="bloco-titulo">${escaparHtml(titulo)}</div><div class="bloco-texto">${v(valor)}</div>`;
}

/** Monta a view de impressão a partir dos dados da ficha. */
function renderizarImpressao(container, d) {
  const foto = d.foto_base64 || d.foto_url;
  const ehUngido = d.funcao_atual === "Ungido";

  container.innerHTML = `
  <!-- ═══ PÁGINA 1 — DADOS PESSOAIS + VIDA ESPIRITUAL ═══ -->
  <div class="pagina pagina-1">
    ${cabecalhoP1()}

    <div class="barra-titulo">DADOS PESSOAIS</div>
    <div class="dados-pessoais">
      <div class="colunas">
        ${linha2("Nome", d.nome, "Idade", d.idade)}
        ${linha2("Rua", d.endereco_rua, "Bairro", d.endereco_bairro)}
        ${linha3("Cidade", d.endereco_cidade, "UF", d.endereco_uf, "CEP", d.endereco_cep)}
        ${linha2("E-mail", d.email, "Tel", d.telefone)}
        ${linha2("Estado Civil", d.estado_civil, "Data Nascimento", formatarData(d.data_nascimento))}
        ${linha3("Carteira de Identidade", d.rg, "OE", d.oe_orgao_emissor, "C.P.F.", d.cpf)}
        <div class="linha-campo">
          <div class="celula" style="flex:0 0 46%;"><span class="rotulo">Empregado</span><span class="valor">${v(d.empregado)}</span></div>
          <div class="celula" style="flex:0 0 13%;"><span class="rotulo">Ano(s)</span><span class="valor">${v(d.tempo_emprego_anos)}</span></div>
          <div class="celula" style="flex:0 0 13%;"><span class="rotulo">Mês(es)</span><span class="valor">${v(d.tempo_emprego_meses)}</span></div>
          <div class="celula" style="flex:1 1 auto;"><span class="rotulo">Profissão</span><span class="valor">${v(d.profissao)}</span></div>
        </div>
        ${linha2("Se Militar: Qual Patente", d.militar_patente, "Arma", d.arma)}
        ${linha2("Se aposentado (motivo aposentadoria)", d.aposentado_motivo, "Empresa", d.empresa)}
        ${linha3("Escolaridade", d.escolaridade, "Data de Preenchimento", formatarData(d.data_preenchimento), "Nº", d.numero)}
      </div>
      <div class="foto-box">
        ${foto ? `<img src="${foto}">` : "Foto<br>(terno e gravata)<br>3 X 4"}
      </div>
    </div>

    <div class="barra-titulo">VIDA ESPIRITUAL</div>
    <div class="duas-colunas">
      <div class="coluna esquerda">
        <div class="sub-header">ÁREA RESERVADA AO PREENCHIMENTO DO &quot;OBREIRO&quot; APRESENTADO</div>

        ${itemV("01) FUNÇÃO ATUAL: EVANGELISTA, OBREIRO, DIÁCONO OU UNGIDO?", d.funcao_atual)}
        ${itemPar("02) TEMPO NA FUNÇÃO? ANO(S)", d.tempo_funcao_anos, "MÊS(ES)", d.tempo_funcao_meses)}
        ${itemCheck("03) GRUPO DE INTERCESSÃO?", d.grupo_intercessao)}
        ${itemCheck("04) É RESPONSÁVEL POR TRABALHO/IGREJA?", d.responsavel_trabalho)}
        ${itemV("    SE SIM, QUAL?", d.responsavel_trabalho_qual, true)}
        ${itemV("05) CRESCIMENTO (OU NÃO) DE SEU GRUPO ASSISTÊNCIA OU IGREJA (%)", d.crescimento_grupo_pct)}
        ${itemV("06) FAZ QUANTAS VISITAS POR MÊS AOS IRMÃOS DA IGREJA?", d.visitas_mes)}
        ${itemCheck("07) É DIZIMISTA FIEL?", d.dizimista_fiel)}
        ${itemPar("08) TEMPO NA ICM? ANO(S)", d.tempo_icm_anos, "MÊS(ES)", d.tempo_icm_meses)}
        ${item("09) JÁ AFASTOU-SE DA IGREJA POR ALGUM MOTIVO?", simNaoHtml(d.afastou_igreja_sim, d.afastou_igreja_nao))}
        ${itemV("    MOTIVO", d.afastou_igreja_motivo, true)}
        ${itemPar("    DATA", formatarData(d.afastou_data1), "DATA", formatarData(d.afastou_data2))}
        ${itemV("    DATA", formatarData(d.afastou_data3))}
        ${itemCheck("10) FOI PROVADO? (FOLHA ANEXA)", d.foi_provado)}
        ${itemV("    QUAIS?", d.foi_provado_qual, true)}
        ${itemCheck("11) TEM EXPERIÊNCIA? (FOLHA ANEXA)", d.tem_experiencia)}
        ${item("12) TEM SEQÜELAS DO PASSADO?", simNaoHtml(d.tem_sequelas_passado_sim, d.tem_sequelas_passado_nao))}
        ${itemPar("13) 1º SEMINÁRIO", formatarData(d.ultimo_seminario1), "2º SEMINÁRIO", formatarData(d.ultimo_seminario2))}
        ${itemV("    3º SEMINÁRIO", formatarData(d.ultimo_seminario3))}
        ${itemV("14) PARTICIPAÇÃO NO MAANAIM/IGREJA", listaMarcados([
          [d.participa_maanaim_voluntario, "Voluntário"],
          [d.participa_maanaim_meio_semana, "Meio Semana"],
          [d.participa_maanaim_final_semana, "Final de Semana"],
        ]), true)}
        ${itemCheck("15) PARTICIPA DOS CULTOS DE MADRUGADA?", d.participa_madrugada)}
        ${itemCheck("16) É INTEGRADO AO CULTO PROFÉTICO?", d.integrado_culto_profetico)}
        ${itemCheck("17) TEM GOVERNO NO LAR E NA IGREJA?", d.tem_governo_lar)}
        ${itemCheck("18) A FAMÍLIA É INTEGRADA NA ICM?", d.familia_integrada)}
        ${itemCheck("19) RESPEITA O PASTOR E AO PRESBITÉRIO?", d.respeita_pastor_presbiterio)}
        ${itemCheck("20) É ZELOSO COM OS BENS DA ICM?", d.zelo_bens_icm)}
        ${item("21) É USADO NOS DONS: LÍNGUAS, INTERPR., CIÊNCIA, SONHO, VISÃO, REVELAÇÃO?", [
          v(listaMarcados([
            [d.dons_linguas, "Línguas"], [d.dons_interpretacao, "Interpretação"], [d.dons_ciencia, "Ciência"],
            [d.dons_sonho, "Sonho"], [d.dons_visao, "Visão"], [d.dons_revelacao, "Revelação"],
          ])),
          d.dons_nenhum ? '<span class="check check-no">✓ Não</span>' : "",
        ].filter(Boolean).join(" "), true)}
        ${item("22) VEIO DE OUTRA IGREJA (DENOMINAÇÃO)?", simNaoHtml(d.veio_outra_igreja_sim, d.veio_outra_igreja_nao))}
        ${itemV("    QUAL?", d.veio_outra_igreja_qual, true)}
        ${itemCheck("23) É CUMPRIDOR DE SUAS OBRIGAÇÕES NO SEU TRABALHO?", d.cumpridor_obrigacoes)}
        ${itemCheck("24) TEM DÍVIDA COM IRMÃOS DA IGREJA?", d.divida_irmaos)}
        ${itemV("25) TEMPO DE CASADO (ANOS)", d.tempo_casado)}
        ${itemV("26) NOME DA ESPOSA:", d.nome_esposa, true)}
        ${itemV("27) FUNÇÃO DA ESPOSA NA IGREJA:", d.funcao_esposa, true)}
        ${itemV("28) PROFISSÃO DA ESPOSA", d.profissao_esposa, true)}
        ${itemV("29) ESTADO CIVIL DO CANDIDATO ANTES DO CASAMENTO", d.estado_civil_antes_candidato)}
        ${itemV("30) ESTADO CIVIL DA ESPOSA ANTES DO CASAMENTO", d.estado_civil_antes_esposa)}
        ${itemPar("31) QUANTOS FILHOS TEM?", d.quantos_filhos, "MEMBROS IGREJA?", d.quantos_membros_igreja)}
        ${itemV("32) CASO NÃO TENHA FILHOS, QUAL MOTIVO?", d.filhos_motivo_sem, true)}
        ${itemCheck("33) DISPOSTO A DESEMPENHAR MINISTÉRIO VOLUNTÁRIO?", d.disposto_ministerio_voluntario)}
        ${itemCheck("34) LEU TODA A BÍBLIA?", d.leu_toda_biblia)}
        ${itemV("    CASO NÃO TENHA LIDO, QUANTOS LIVROS LEU?", d.livros_lidos, true)}
        ${itemCheck("35) COLOCA EM PRÁTICA ENSINOS DO SATÉLITE E EBD?", d.pratica_ensinos_satelite)}
        ${itemCheck("36) APLICA OS ASSUNTOS DO SATÉLITE NA IGREJA?", d.aplica_satelite_igreja)}
        ${itemCheck("37) CONCLUIU O CURSO DO INSTITUTO BÍBLICO?", d.concluiu_instituto_biblico)}
        ${itemV("    QUAL CURSO?", d.curso_realizado)}
        ${itemV("38) FREQUÊNCIA MÉDIA DA SUA IGREJA:", d.frequencia_media_igreja)}
        ${item("39) ESTUDA NOITE? SIM / NÃO?", simNaoHtml(d.estuda_noite_sim, d.estuda_noite_nao), true)}
        ${itemCheck("40) DISPOSTO A REALIZAR VIAGEM?", d.disposto_viagem)}
        ${itemV("41) ENVIA QUANTAS CONTRIBUIÇÕES DA EBD POR MÊS?", d.contribuicoes_ebd_mes, true)}

        <div class="assinatura-rodape">ASSINATURA DO &quot;OBREIRO&quot; (INDISPENSÁVEL)</div>
      </div>

      <div class="coluna">
        <div class="sub-header">ÁREA RESERVADA AO PREENCHIMENTO DO PASTOR RESPONSÁVEL<br>(INFORMAÇÕES SOBRE O CANDIDATO)</div>

        ${itemV("01) FUNÇÃO A SER APRESENTADO", d.funcao_apresentada)}
        ${itemV("02) CARACTERÍSTICA DO MINISTÉRIO", d.caracteristica_ministerio, true)}
        ${itemCheck("03) TEM MENSAGEM REVELADA? (FOLHA ANEXA)", d.tem_mensagem_revelada)}
        ${itemCheck("04) TRANSMITE BEM A MENSAGEM?", d.transmite_bem_mensagem)}
        ${itemV("05) DEFEITO (TÍMIDO/AFOITO/LENTO/RÍGIDO, ETC)", d.defeito, true)}
        ${itemCheck("06) TEM BOM TESTEMUNHO?", d.tem_bom_testemunho)}
        ${itemCheck("07) TEM MATURIDADE NOS DONS?", d.maturidade_dons)}
        ${itemCheck("08) GOSTA DE IMITAR MOVIMENTOS?", d.gosta_imitar_movimentos)}
        ${itemCheck("09) É GASTADOR?", d.e_gastador)}
        ${itemCheck("10) É DADO A COMENTÁRIOS DEPRECIATIVOS?", d.dado_comentarios_depreciativos)}
        ${itemV("    QUAIS?", d.comentarios_depreciativos_quais, true)}
        ${itemCheck("11) É PONTUAL?", d.pontual)}
        ${itemCheck("12) É SÓBRIO NO VESTIR?", d.sobrio_vestir)}
        ${itemV("13) NÚMERO DE IGREJAS NO BAIRRO OU CIDADE?", d.numero_igrejas_bairro)}
        ${itemV("14) NÚMERO DE PASTORES NO BAIRRO OU CIDADE?", d.numero_pastores_bairro)}
        ${itemCheck("15) OBEDIENTE AOS DONS RELACIONADOS À SUA VIDA OU FAMÍLIA?", d.obediente_dons)}
        ${itemV("    OUTRA(S)? QUAIS?", d.obediente_dons_quais, true)}
        ${itemCheck("16) JÁ FOI APRESENTADO ALGUMA VEZ PARA ESTA FUNÇÃO?", d.ja_apresentado_antes)}
        ${itemPar("    SE SIM, QUANTAS?", d.quantas_vezes_apresentado, "ANO?", d.ano_apresentacao)}
        ${itemV("    CASO NÃO TENHA SIDO APROVADO, FAVOR INFORMAR O MOTIVO:", d.motivo_nao_aprovado, true)}
        ${itemV("17) QUAL IGREJA O CANDIDATO IRÁ ASSUMIR EM CASO DE ORDENAÇÃO?", d.igreja_assumira, true)}
        ${itemV("OBSERVAÇÃO DO PASTOR RESPONSÁVEL / DOM DA IGREJA:", d.observacao_pastor, true)}

        ${itemV("IGREJA", d.pastor_igreja, true)}
        ${itemPar("CIDADE", d.pastor_cidade, "UF", d.pastor_uf)}

        <div class="assinatura-rodape">ASSINATURA DO PASTOR RESPONSÁVEL (INDISPENSÁVEL)<br>${d.assinatura_pastor ? v(d.assinatura_pastor) : ""}</div>

        <div class="dom-bloco">
          <div class="dom-titulo">DOM NA COMISSÃO DA ÁREA / PÓLO - 1 dom resumido</div>
          <div class="dom-texto">${v(d.dom_comissao_area)}</div>
          ${situacaoOpcoesHtml(d.situacao_area)}
        </div>

        <div class="dom-bloco">
          <div class="dom-titulo">DOM NA COMISSÃO DA REGIÃO / COORDENADORES - 1 dom resumido</div>
          <div class="dom-texto">${v(d.dom_comissao_regiao)}</div>
          ${situacaoOpcoesHtml(d.situacao_regiao)}
        </div>

        <div class="dom-bloco">
          <div class="dom-titulo">CONSELHO PRESBITERAL</div>
          <div class="dom-texto">${v(d.dom_conselho_presbiteral)}</div>
          ${situacaoOpcoesHtml(d.situacao_presbiterial)}
          <div class="data-assinatura">
            <div>DATA<br>${v(d.data_conselho_presbiteral)}</div>
            <div>ASSINATURA</div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ═══ PÁGINA 2 — EXPERIÊNCIAS COM RECURSOS DA GRAÇA ═══ -->
  <div class="pagina pagina-2">
    ${cabecalhoVerde("EXPERIÊNCIAS COM RECURSOS DA GRAÇA (MEIOS DE GRAÇA)")}
    ${campoNomeTopo("NOME:", d.nome)}
    ${blocoTexto("EXPERIÊNCIA COM CLAMOR PELO SANGUE DE JESUS / ORAÇÃO", d.experiencia_clamor)}
    ${blocoTexto("EXPERIÊNCIA COM JEJUM", d.experiencia_jejum)}
    ${blocoTexto("EXPERIÊNCIA COM MADRUGADA", d.experiencia_madrugada)}
    ${blocoTexto("EXPERIÊNCIA COM CONSULTA A PALAVRA OU A PALAVRA", d.experiencia_palavra)}
    ${blocoTexto("EXPERIÊNCIA COM LOUVOR", d.experiencia_louvor)}
  </div>

  <!-- ═══ PÁGINA 3 — EXPERIÊNCIAS DO OBREIRO 2 ═══ -->
  <div class="pagina pagina-3">
    ${cabecalhoVerde("EXPERIÊNCIAS DO OBREIRO 2")}
    ${campoNomeTopo("NOME:", d.nome)}
    ${blocoTexto("DONS (ENTREGUES PELO OBREIRO) QUE SE CUMPRIRAM", d.dons_cumpridos)}
    ${blocoTexto("PROVAS VIVIDAS PELO OBREIRO", d.provas_vividas)}
    ${blocoTexto("EXPERIÊNCIAS VIVIDAS PELO OBREIRO", d.experiencias_vividas)}
  </div>

  <!-- ═══ PÁGINA 4 — MENSAGENS REVELADAS ═══ -->
  <div class="pagina pagina-4">
    ${cabecalhoVerde("MENSAGENS REVELADAS")}
    ${campoNomeTopo("NOME:", d.nome)}
    <div class="msg-bloco-titulo">1ª MENSAGEM - MENSAGEM RESUMIDA ALCANÇADA PELO OBREIRO - DESCREVER O TEXTO DA MENSAGEM</div>
    <div class="msg-linha">TEXTO: <span class="valor">${v(d.msg1_texto)}</span></div>
    <div class="msg-linha">TEMA: <span class="valor">${v(d.msg1_tema)}</span></div>
    <div class="msg-descricao">${v(d.msg1_descricao)}</div>
    <div class="msg-bloco-titulo">2ª MENSAGEM - MENSAGEM RESUMIDA - DESCREVER O TEXTO DA MENSAGEM</div>
    <div class="msg-linha">TEXTO: <span class="valor">${v(d.msg2_texto)}</span></div>
    <div class="msg-linha">TEMA: <span class="valor">${v(d.msg2_tema)}</span></div>
    <div class="msg-descricao">${v(d.msg2_descricao)}</div>
  </div>

  <!-- ═══ PÁGINA 5 — QUESTIONÁRIO ═══ -->
  <div class="pagina pagina-5">
    ${cabecalhoVerde("QUESTIONÁRIO", "FAZER BREVE COMENTÁRIO SOBRE TEMAS ABAIXO")}
    ${campoNomeTopo("NOME:", d.nome)}
    ${blocoTexto("PALAVRA REVELADA", d.palavra_revelada)}
    ${blocoTexto("CLAMOR PELO PODER DO SANGUE DE JESUS", d.clamor_sangue_jesus)}
    ${blocoTexto("IGREJA CORPO DE CRISTO", d.igreja_corpo_cristo)}
    ${blocoTexto("SALVAÇÃO", d.salvacao)}
    ${blocoTexto("ORIGENS DA FÉ OU FÉ HISTÓRICA E PROFÉTICA", d.origens_fe)}
    ${blocoTexto("SACERDÓCIO UNIVERSAL DO CRENTE", d.sacerdocio_universal)}
    ${blocoTexto("OBJETIVO DAS TRANSMISSÕES VIA SATÉLITE ÀS IGREJAS", d.objetivo_satelite)}
  </div>

  <!-- ═══ PÁGINA 6 — QUESTIONÁRIO PARA ESPOSAS DOS UNGIDOS ═══ -->
  <div class="pagina pagina-6">
    ${cabecalhoVerde("QUESTIONÁRIO PARA ESPOSAS DOS UNGIDOS", "FAZER BREVE COMENTÁRIO SOBRE OS ITENS ABAIXO")}
    ${campoNomeTopo("NOME DO UNGIDO:", ehUngido ? d.nome : null)}
    ${campoNomeTopo("NOME DA ESPOSA:", ehUngido ? d.nome_esposa : null)}
    <div class="pergunta-titulo">1-Você está de acordo com a ordenação de seu esposo e o seu propósito para o ministério? Faça um breve comentário.</div>
    <div class="bloco-texto">${v(d.q1_acordo_ordenacao)}</div>
    <div class="pergunta-titulo">2-Você concorda com as doutrinas e orientações do Presbitério? Faça um breve comentário.</div>
    <div class="bloco-texto">${v(d.q2_concorda_doutinas)}</div>
    <div class="pergunta-titulo">3-Você concorda com o ministério voluntário? Faça um breve comentário.</div>
    <div class="bloco-texto">${v(d.q3_ministerio_voluntario)}</div>
    <div class="pergunta-titulo">4-Você entende que não deve interferir no ministério do seu esposo? Faça um breve comentário.</div>
    <div class="bloco-texto">${v(d.q4_nao_interferir)}</div>
    <div class="pergunta-titulo">5-Faça outros comentários, se achar necessário.</div>
    <div class="bloco-texto">${v(d.q5_outros)}</div>
    <div class="assinatura-esposa">Assinatura da esposa: <span class="linha">${d.assinatura_esposa ? v(d.assinatura_esposa) : ""}</span></div>
  </div>
  `;
}
