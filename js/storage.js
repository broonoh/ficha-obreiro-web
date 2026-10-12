// js/storage.js
// Camada de acesso a dados: tudo (dados da ficha + foto) persistido num
// único documento Firestore. Mantém a mesma ideia do storage.py do app
// Python (dict plano de chave->valor), só que no Firestore em vez de
// SQLite/arquivo .json local.
//
// A foto fica como base64 dentro do próprio documento (campo
// foto_base64) — mesma técnica já usada no app Python pro PDF — em vez
// de Firebase Storage, porque o Storage passou a exigir o plano pago
// (Blaze) mesmo para uso dentro da faixa gratuita. Documentos Firestore
// têm limite de 1MiB, por isso redimensionamos/comprimimos a imagem no
// navegador antes de salvar (ver processarFoto).

const FICHAS_COLECAO = "fichas";

/** Cria uma ficha nova e devolve o ID do documento (vira o link). */
async function criarFicha() {
  const doc = await db.collection(FICHAS_COLECAO).add({
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  return doc.id;
}

/** Lê os dados de uma ficha pelo ID. Devolve null se não existir. */
async function carregarFicha(id) {
  const snap = await db.collection(FICHAS_COLECAO).doc(id).get();
  if (!snap.exists) return null;
  return snap.data();
}

/** Salva um ou mais campos (merge — não apaga o resto do documento). */
async function salvarCampos(id, campos) {
  await db.collection(FICHAS_COLECAO).doc(id).set(
    { ...campos, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  );
}

/** Escuta mudanças em tempo real (usado pra refletir edições do obreiro
 * na tela do pastor, e vice-versa, sem precisar recarregar a página). */
function escutarFicha(id, callback) {
  return db.collection(FICHAS_COLECAO).doc(id).onSnapshot((snap) => {
    if (snap.exists) callback(snap.data());
  });
}

/** Redimensiona/comprime a foto no navegador e devolve um data URI
 * (data:image/jpeg;base64,...) pronto pra salvar no campo foto_base64 —
 * mesmo formato que o app Python já usa. Limite de 3x4 ampliado (320x427px,
 * ~4x o tamanho de impressão) é mais que suficiente pra qualidade de
 * impressão e mantém o arquivo bem abaixo do limite de 1MiB do Firestore. */
function processarFoto(arquivo) {
  return new Promise((resolve, reject) => {
    const imagem = new Image();
    const leitor = new FileReader();
    leitor.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    leitor.onload = () => {
      imagem.onerror = () => reject(new Error("Arquivo não é uma imagem válida."));
      imagem.onload = () => {
        const LARGURA_MAX = 320;
        const ALTURA_MAX = 427;
        let { width, height } = imagem;
        const escala = Math.min(LARGURA_MAX / width, ALTURA_MAX / height, 1);
        width = Math.round(width * escala);
        height = Math.round(height * escala);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(imagem, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      imagem.src = leitor.result;
    };
    leitor.readAsDataURL(arquivo);
  });
}
