// js/schema.js
// Fonte única de verdade: todas as seções/campos da ficha. Usado tanto
// por form-render.js (formulário editável) quanto por pdf-render.js
// (view de impressão) — extraído campo a campo do app Python original
// (app/ui/screens/*.py e app/templates/ficha.html), pra manter as
// mesmas chaves, rótulos e numeração.
//
// Tipos de campo suportados:
//   texto       — texto curto (input)
//   numero      — input numérico
//   textarea    — texto longo (várias linhas)
//   data        — data (DD/MM/AAAA)
//   checkbox    — sim/não
//   simnao      — par de checkbox mutuamente exclusivo (duas chaves: key_sim/key_nao)
//   dropdown    — lista de opções
//   foto        — upload de imagem (só existe em "dados_pessoais")
//
// `parte` marca quem preenche: "obreiro" (padrão) ou "pastor" — só
// controla o destaque visual na tela, não bloqueia edição (não há login).

const FICHA_SCHEMA = [
  {
    id: "dados_pessoais",
    titulo: "Dados Pessoais",
    icone: "👤",
    parte: "obreiro",
    campos: [
      { key: "foto_base64", label: "Foto 3x4 (terno e gravata)", tipo: "foto" },
      { key: "nome", label: "Nome", tipo: "texto" },
      { key: "idade", label: "Idade", tipo: "numero" },
      { key: "data_nascimento", label: "Data de Nascimento", tipo: "data" },
      { key: "estado_civil", label: "Estado Civil", tipo: "texto" },
      { key: "escolaridade", label: "Escolaridade", tipo: "texto" },
      { key: "profissao", label: "Profissão", tipo: "texto" },

      { key: "endereco_rua", label: "Rua", tipo: "texto" },
      { key: "endereco_bairro", label: "Bairro", tipo: "texto" },
      { key: "endereco_cidade", label: "Cidade", tipo: "texto" },
      { key: "endereco_uf", label: "UF", tipo: "texto" },
      { key: "endereco_cep", label: "CEP", tipo: "texto" },
      { key: "email", label: "E-mail", tipo: "texto" },
      { key: "telefone", label: "Telefone", tipo: "texto" },

      { key: "rg", label: "Carteira de Identidade", tipo: "texto" },
      { key: "oe_orgao_emissor", label: "OE (Órgão Emissor)", tipo: "texto" },
      { key: "cpf", label: "C.P.F.", tipo: "texto" },
      { key: "empregado", label: "Empregado", tipo: "texto" },
      { key: "tempo_emprego_anos", label: "Tempo de Emprego (ano(s))", tipo: "numero" },
      { key: "tempo_emprego_meses", label: "Tempo de Emprego (mês(es))", tipo: "numero" },
      { key: "empresa", label: "Empresa", tipo: "texto" },

      { key: "militar_patente", label: "Se Militar — Qual Patente", tipo: "texto" },
      { key: "arma", label: "Arma", tipo: "texto" },
      { key: "aposentado_motivo", label: "Se Aposentado (motivo aposentadoria)", tipo: "texto" },

      { key: "data_preenchimento", label: "Data de Preenchimento", tipo: "data" },
      { key: "numero", label: "Nº", tipo: "texto" },
    ],
  },

  {
    id: "vida_espiritual",
    titulo: "Vida Espiritual",
    icone: "📖",
    parte: "obreiro",
    campos: [
      {
        key: "funcao_atual", label: "01) Função Atual", tipo: "dropdown",
        opcoes: ["Evangelista", "Obreiro", "Diácono", "Ungido"],
      },
      { key: "tempo_funcao_anos", label: "02) Tempo na Função (ano(s))", tipo: "numero" },
      { key: "tempo_funcao_meses", label: "Tempo na Função (mês(es))", tipo: "numero" },

      { key: "grupo_intercessao", label: "03) Grupo de Intercessão?", tipo: "checkbox" },
      { key: "responsavel_trabalho", label: "04) É responsável por trabalho/igreja?", tipo: "checkbox" },
      { key: "responsavel_trabalho_qual", label: "Se sim, qual?", tipo: "texto" },
      { key: "crescimento_grupo_pct", label: "05) Crescimento (ou não) de seu grupo assistência ou igreja (%)", tipo: "numero" },
      { key: "visitas_mes", label: "06) Faz quantas visitas por mês aos irmãos da igreja?", tipo: "numero" },
      { key: "dizimista_fiel", label: "07) É dizimista fiel?", tipo: "checkbox" },

      { key: "tempo_icm_anos", label: "08) Tempo na ICM (ano(s))", tipo: "numero" },
      { key: "tempo_icm_meses", label: "Tempo na ICM (mês(es))", tipo: "numero" },
      { key: "afastou_igreja", label: "09) Já afastou-se da igreja por algum motivo?", tipo: "simnao" },
      { key: "afastou_igreja_motivo", label: "Motivo", tipo: "texto" },
      { key: "afastou_data1", label: "Data do afastamento 1", tipo: "data" },
      { key: "afastou_data2", label: "Data do afastamento 2", tipo: "data" },
      { key: "afastou_data3", label: "Data do afastamento 3", tipo: "data" },

      { key: "foi_provado", label: "10) Foi provado? (folha anexa)", tipo: "checkbox" },
      { key: "foi_provado_qual", label: "Quais?", tipo: "texto" },
      { key: "tem_experiencia", label: "11) Tem experiência? (folha anexa)", tipo: "checkbox" },
      { key: "tem_sequelas_passado", label: "12) Tem sequelas do passado?", tipo: "simnao" },
      { key: "ultimo_seminario1", label: "13) 1º Seminário", tipo: "data" },
      { key: "ultimo_seminario2", label: "2º Seminário", tipo: "data" },
      { key: "ultimo_seminario3", label: "3º Seminário", tipo: "data" },

      { tipo: "titulo-grupo", label: "14) Participação no Maanaim/Igreja", n: 3 },
      { key: "participa_maanaim_voluntario", label: "Voluntário", tipo: "checkbox" },
      { key: "participa_maanaim_meio_semana", label: "Meio Semana", tipo: "checkbox" },
      { key: "participa_maanaim_final_semana", label: "Final de Semana", tipo: "checkbox" },

      { key: "participa_madrugada", label: "15) Participa dos cultos de madrugada?", tipo: "checkbox" },
      { key: "integrado_culto_profetico", label: "16) É integrado ao culto profético?", tipo: "checkbox" },
      { key: "tem_governo_lar", label: "17) Tem governo no lar e na igreja?", tipo: "checkbox" },
      { key: "familia_integrada", label: "18) A família é integrada na ICM?", tipo: "checkbox" },
      { key: "respeita_pastor_presbiterio", label: "19) Respeita o pastor e ao presbitério?", tipo: "checkbox" },
      { key: "zelo_bens_icm", label: "20) É zeloso com os bens da ICM?", tipo: "checkbox" },

      { tipo: "titulo-grupo", label: "21) Dons Espirituais", n: 7 },
      { key: "dons_linguas", label: "Línguas", tipo: "checkbox" },
      { key: "dons_interpretacao", label: "Interpretação", tipo: "checkbox" },
      { key: "dons_ciencia", label: "Ciência", tipo: "checkbox" },
      { key: "dons_sonho", label: "Sonho", tipo: "checkbox" },
      { key: "dons_visao", label: "Visão", tipo: "checkbox" },
      { key: "dons_revelacao", label: "Revelação", tipo: "checkbox" },
      { key: "dons_nenhum", label: "Não", tipo: "checkbox" },

      { key: "veio_outra_igreja", label: "22) Veio de outra igreja (denominação)? Qual?", tipo: "texto" },
      { key: "cumpridor_obrigacoes", label: "23) É cumpridor de suas obrigações no seu trabalho?", tipo: "checkbox" },
      { key: "divida_irmaos", label: "24) Tem dívida com irmãos da igreja?", tipo: "checkbox" },

      { key: "tempo_casado", label: "25) Tempo de Casado (candidato e esposa)", tipo: "texto" },
      { key: "nome_esposa", label: "26) Nome da Esposa", tipo: "texto" },
      { key: "funcao_esposa", label: "27) Função da Esposa na Igreja", tipo: "texto" },
      { key: "profissao_esposa", label: "28) Profissão da Esposa", tipo: "texto" },
      { key: "estado_civil_antes_candidato", label: "29) Estado civil do candidato antes do casamento atual", tipo: "texto" },
      { key: "estado_civil_antes_esposa", label: "30) Estado civil da esposa antes do casamento atual", tipo: "texto" },
      { key: "quantos_filhos", label: "31) Quantos filhos tem?", tipo: "numero" },
      { key: "quantos_membros_igreja", label: "Quantos são membros igreja?", tipo: "numero" },
      { key: "filhos_motivo_sem", label: "32) Caso não tenha filhos, qual motivo?", tipo: "texto" },

      { key: "disposto_ministerio_voluntario", label: "33) Disposto a desempenhar ministério voluntário?", tipo: "checkbox" },
      { key: "leu_toda_biblia", label: "34) Leu toda a Bíblia?", tipo: "checkbox" },
      { key: "livros_lidos", label: "Caso não tenha lido, quantos livros leu?", tipo: "numero" },
      { key: "pratica_ensinos_satelite", label: "35) Coloca em prática ensinos do satélite e EBD?", tipo: "checkbox" },
      { key: "aplica_satelite_igreja", label: "36) Aplica os assuntos do satélite na igreja?", tipo: "checkbox" },
      { key: "concluiu_instituto_biblico", label: "37) Concluiu o curso do Instituto Bíblico?", tipo: "checkbox" },
      { key: "curso_realizado", label: "Qual curso", tipo: "texto" },
      { key: "frequencia_media_igreja", label: "38) Frequência média da sua igreja", tipo: "numero" },
      { key: "estuda_noite", label: "39) Estuda à noite?", tipo: "simnao" },
      { key: "disposto_viagem", label: "40) Disposto a realizar viagem?", tipo: "checkbox" },
      { key: "contribuicoes_ebd_mes", label: "41) Envia quantas contribuições da EBD por mês?", tipo: "numero" },
    ],
  },

  {
    id: "area_pastor",
    titulo: "Área do Pastor Responsável",
    icone: "📋",
    parte: "pastor",
    campos: [
      { key: "pastor_igreja", label: "Igreja", tipo: "texto" },
      { key: "pastor_cidade", label: "Cidade", tipo: "texto" },
      { key: "pastor_uf", label: "UF", tipo: "texto" },

      { key: "funcao_apresentada", label: "01) Função a ser apresentado", tipo: "texto" },
      { key: "caracteristica_ministerio", label: "02) Característica do ministério", tipo: "textarea" },
      { key: "tem_mensagem_revelada", label: "03) Tem mensagem revelada? (folha anexa)", tipo: "checkbox" },
      { key: "transmite_bem_mensagem", label: "04) Transmite bem a mensagem?", tipo: "checkbox" },

      { key: "defeito", label: "05) Defeito (tímido/afoito/lento/rígido, etc)", tipo: "texto" },
      { key: "tem_bom_testemunho", label: "06) Tem bom testemunho?", tipo: "checkbox" },
      { key: "maturidade_dons", label: "07) Tem maturidade nos dons?", tipo: "checkbox" },
      { key: "gosta_imitar_movimentos", label: "08) Gosta de imitar movimentos?", tipo: "checkbox" },
      { key: "e_gastador", label: "09) É gastador?", tipo: "checkbox" },
      { key: "dado_comentarios_depreciativos", label: "10) É dado a comentários depreciativos?", tipo: "checkbox" },
      { key: "comentarios_depreciativos_quais", label: "Quais?", tipo: "texto" },

      { key: "pontual", label: "11) É pontual?", tipo: "checkbox" },
      { key: "sobrio_vestir", label: "12) É sóbrio no vestir?", tipo: "checkbox" },
      { key: "numero_igrejas_bairro", label: "13) Nº igrejas no bairro ou cidade?", tipo: "numero" },
      { key: "numero_pastores_bairro", label: "14) Nº pastores no bairro ou cidade?", tipo: "numero" },

      { key: "obediente_dons", label: "15) Obediente aos dons relacionados à sua vida ou família?", tipo: "checkbox" },
      { key: "obediente_dons_quais", label: "Outra(s)? Quais?", tipo: "texto" },
      { key: "ja_apresentado_antes", label: "16) Já foi apresentado alguma vez para esta função?", tipo: "checkbox" },
      { key: "quantas_vezes_apresentado", label: "Se sim, quantas?", tipo: "numero" },
      { key: "ano_apresentacao", label: "Ano da apresentação?", tipo: "numero" },
      { key: "motivo_nao_aprovado", label: "Caso não tenha sido aprovado, favor informar o motivo", tipo: "textarea" },

      { key: "igreja_assumira", label: "17) Qual igreja o candidato irá assumir em caso de ordenação?", tipo: "texto" },
      { key: "observacao_pastor", label: "Observação do Pastor Responsável / Dom da Igreja", tipo: "textarea" },
      { key: "assinatura_pastor", label: "Assinatura do Pastor Responsável (indispensável)", tipo: "texto" },
    ],
  },

  {
    id: "experiencias_graca",
    titulo: "Experiências com Recursos da Graça",
    icone: "💧",
    parte: "obreiro",
    campos: [
      { key: "experiencia_clamor", label: "Experiência com Clamor pelo Sangue de Jesus / Oração", tipo: "textarea" },
      { key: "experiencia_jejum", label: "Experiência com Jejum", tipo: "textarea" },
      { key: "experiencia_madrugada", label: "Experiência com Madrugada", tipo: "textarea" },
      { key: "experiencia_palavra", label: "Experiência com Consulta à Palavra", tipo: "textarea" },
      { key: "experiencia_louvor", label: "Experiência com Louvor", tipo: "textarea" },
    ],
  },

  {
    id: "experiencias_obreiro",
    titulo: "Experiências do Obreiro",
    icone: "📜",
    parte: "obreiro",
    campos: [
      { key: "dons_cumpridos", label: "Dons (entregues pelo obreiro) que se cumpriram", tipo: "textarea" },
      { key: "provas_vividas", label: "Provas vividas pelo obreiro", tipo: "textarea" },
      { key: "experiencias_vividas", label: "Experiências vividas pelo obreiro", tipo: "textarea" },
    ],
  },

  {
    id: "mensagens",
    titulo: "Mensagens Reveladas",
    icone: "🔥",
    parte: "obreiro",
    campos: [
      { key: "msg1_texto", label: "1ª Mensagem — Texto (referência bíblica)", tipo: "texto" },
      { key: "msg1_tema", label: "1ª Mensagem — Tema", tipo: "texto" },
      { key: "msg1_descricao", label: "Descreva aqui a 1ª mensagem revelada", tipo: "textarea" },
      { key: "msg2_texto", label: "2ª Mensagem — Texto (referência bíblica)", tipo: "texto" },
      { key: "msg2_tema", label: "2ª Mensagem — Tema", tipo: "texto" },
      { key: "msg2_descricao", label: "Descreva aqui a 2ª mensagem revelada", tipo: "textarea" },
    ],
  },

  {
    id: "questionario",
    titulo: "Questionário",
    icone: "🎓",
    parte: "obreiro",
    campos: [
      { key: "palavra_revelada", label: "Palavra Revelada", tipo: "textarea" },
      { key: "clamor_sangue_jesus", label: "Clamor pelo Poder do Sangue de Jesus", tipo: "textarea" },
      { key: "igreja_corpo_cristo", label: "Igreja Corpo de Cristo", tipo: "textarea" },
      { key: "salvacao", label: "Salvação", tipo: "textarea" },
      { key: "origens_fe", label: "Origens da Fé ou Fé Histórica e Profética", tipo: "textarea" },
      { key: "sacerdocio_universal", label: "Sacerdócio Universal do Crente", tipo: "textarea" },
      { key: "objetivo_satelite", label: "Objetivo das Transmissões via Satélite às Igrejas", tipo: "textarea" },
    ],
  },

  {
    id: "questionario_esposa",
    titulo: "Questionário para Esposas dos Ungidos",
    icone: "👥",
    parte: "obreiro",
    // Visível/preenchível sempre, mas no PDF o "Nome da Esposa" só é
    // exibido quando funcao_atual = "Ungido" (mesma regra do app Python).
    campos: [
      { key: "q1_acordo_ordenacao", label: "1- Você está de acordo com a ordenação de seu esposo e o seu propósito para o ministério? Faça um breve comentário.", tipo: "textarea" },
      { key: "q2_concorda_doutinas", label: "2- Você concorda com as doutrinas e orientações do Presbitério? Faça um breve comentário.", tipo: "textarea" },
      { key: "q3_ministerio_voluntario", label: "3- Você concorda com o ministério voluntário? Faça um breve comentário.", tipo: "textarea" },
      { key: "q4_nao_interferir", label: "4- Você entende que não deve interferir no ministério do seu esposo? Faça um breve comentário.", tipo: "textarea" },
      { key: "q5_outros", label: "5- Faça outros comentários, se achar necessário.", tipo: "textarea" },
      { key: "assinatura_esposa", label: "Assinatura da Esposa", tipo: "texto" },
    ],
  },
];

// Lookup rápido: chave -> {secaoId, campo}
const FICHA_CAMPOS_POR_CHAVE = {};
for (const secao of FICHA_SCHEMA) {
  for (const campo of secao.campos) {
    if (!campo.key) {
      continue;
    } else if (campo.tipo === "simnao") {
      FICHA_CAMPOS_POR_CHAVE[`${campo.key}_sim`] = { secaoId: secao.id, campo };
      FICHA_CAMPOS_POR_CHAVE[`${campo.key}_nao`] = { secaoId: secao.id, campo };
    } else {
      FICHA_CAMPOS_POR_CHAVE[campo.key] = { secaoId: secao.id, campo };
    }
  }
}
