# Ficha de Obreiro — Web

Versão web da Ficha de Obreiro (Igreja Cristã Maranata): formulário em
HTML/CSS/JS puro, hospedado de graça no GitHub Pages, com Firestore
(Firebase) como banco de dados. Cada ficha tem um link único — o
obreiro preenche sua parte e manda o link pro pastor, que abre o mesmo
link e completa a parte dele ("Área do Pastor Responsável"), sem
precisar exportar/importar nenhum arquivo.

A foto é salva como base64 dentro do próprio documento Firestore (igual
o app Python já faz pro PDF), em vez de Firebase Storage — o Storage
passou a exigir o plano pago (Blaze, com cartão cadastrado) mesmo para
uso dentro da faixa gratuita, e assim o projeto inteiro roda 100% no
plano gratuito (Spark), sem cartão.

## 1. Criar o projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com) e clique em **"Adicionar projeto"**.
2. Dê um nome (ex.: `ficha-obreiro-icm`) e siga o assistente (pode desativar o Google Analytics, não é necessário).
3. Dentro do projeto, vá em **Compilação → Firestore Database** → **Criar banco de dados** → escolha uma região (ex.: `southamerica-east1` - São Paulo) → inicie em **modo de produção** (vamos colar nossas próprias regras no passo 2).
4. Vá em **⚙️ Configurações do projeto** (ícone de engrenagem, no topo do menu lateral) → role até **Seus apps** → clique no ícone **`</>`** (Web) → dê um apelido (ex.: `ficha-web`) → **Registrar app**.
5. Você verá um bloco `const firebaseConfig = { ... }`. Copie esses valores para o arquivo `js/firebase-config.js` deste projeto, substituindo os valores de exemplo.

## 2. Publicar as regras de segurança

No console do Firebase, vá em **Firestore Database → Regras**, apague o conteúdo e cole o conteúdo do arquivo `firestore.rules` deste projeto. Clique em **Publicar**.

> **Sobre segurança:** essas regras liberam leitura/escrita pra qualquer
> pessoa que souber o ID exato de uma ficha (ex.: alguém com o link).
> Ninguém consegue listar todas as fichas existentes, mas quem tem o
> link tem acesso total àquela ficha — é o mesmo nível de confiança que
> hoje existe ao mandar o `.json` por WhatsApp. Se no futuro quiser mais
> segurança (login, só o próprio obreiro podendo editar sua ficha), dá
> pra evoluir pra Firebase Authentication depois.

## 3. Testar localmente

Não dá pra abrir os arquivos `.html` direto no navegador (`file://`) porque
os módulos JS não carregam assim. Suba um servidor local simples:

```bash
cd ficha_obreiro_web
python3 -m http.server 8000
```

Abra `http://localhost:8000` no navegador, clique em **"Nova Ficha"**,
preencha alguns campos e confira no console do Firebase
(**Firestore Database → Dados**) se o documento foi criado/atualizado.

## 4. Publicar no GitHub Pages

1. Crie um repositório novo no GitHub (pode ser público ou privado — Pages funciona nos dois, mas em repositório privado precisa de plano GitHub Pro).
2. Suba os arquivos deste projeto pra esse repositório:
   ```bash
   cd ficha_obreiro_web
   git init
   git add .
   git commit -m "Primeira versão da ficha web"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
3. No GitHub, vá em **Settings → Pages**, em "Source" escolha a branch `main` e a pasta `/ (root)`, clique em **Save**.
4. Em alguns minutos o site fica disponível em `https://SEU_USUARIO.github.io/SEU_REPOSITORIO/`.

## 5. Usar no dia a dia

- **Obreiro**: acessa o site, clica em "Nova Ficha", preenche sua parte, clica em "🔗 Copiar Link" e manda pro pastor (WhatsApp, e-mail etc.).
- **Pastor**: abre o link recebido, preenche a seção destacada em dourado ("Área do Pastor Responsável").
- **Qualquer um dos dois**: pode clicar em "📄 Baixar PDF" a qualquer momento — abre a tela de impressão do navegador, escolha **"Salvar como PDF"** como destino.
- Os dados salvam sozinhos (autosave) a cada campo alterado — não precisa clicar em "salvar".

## Estrutura do projeto

| Arquivo | O que faz |
|---|---|
| `index.html` | Tela inicial — criar ficha nova ou abrir por link/ID |
| `ficha.html` | Formulário da ficha (lê `?id=` da URL) |
| `js/schema.js` | **Fonte única de verdade**: todos os campos, seções, tipos e rótulos |
| `js/form-render.js` | Constrói o formulário editável a partir do schema |
| `js/pdf-render.js` | Constrói a view de impressão/PDF, espelhando o layout do app original |
| `js/storage.js` | Ler/salvar no Firestore, redimensionar e comprimir a foto |
| `js/app.js` | Liga tudo: roteamento, autosave, PDF, link |
| `js/firebase-config.js` | Suas chaves do Firebase (editar no passo 1) |
