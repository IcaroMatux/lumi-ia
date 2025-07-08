# 🚀 Meu Projeto de Chat IA

Chatbot IA interativo com **React**, **TailwindCSS** no frontend e **Node.js + Express** no backend.  
Permite análise de texto e imagem usando **Google Gemini API**.

## 📁 Estrutura do projeto
📦 Lumi
├── lumi-frontend/ # Frontend React + Tailwind
└── lumi-backend/ # Backend Node.js + Express

## ✨ Funcionalidades

✅ Múltiplas conversas com histórico separado
✅ Criação e exclusão de chats
✅ Renomeio automático baseado no assunto da resposta
✅ Feedback de satisfação (like/dislike) por mensagem
✅ Copiar mensagem facilmente
✅ Anexar imagens com pré-visualização
✅ Modo claro/escuro com persistência
✅ Histórico salvo localmente (localStorage)
✅ Simulação de digitação do bot

## ⚙️ Tecnologias usadas

* Vercel/Railway para deploy
* React (Hooks)
* Tailwind CSS
* Lucide React Icons
* Backend em Node.js/Express
* API do Google Gemini
* Fetch API para requisições

## 🚀 Tecnologias do FrontEnd

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
</p>
<p>
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
</p>
<p>
<img src="https://img.shields.io/badge/Vercel-000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>
<p>
<img src="https://img.shields.io/badge/Fetch%20API-ffde57?style=for-the-badge&logo=javascript&logoColor=black" />
</p>

## 🚀 Tecnologias do Backend

<p>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
</p>
<p>
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white"/>
</p>
<p>
  <img src="https://img.shields.io/badge/CORS-006400?style=for-the-badge&logoColor=white"/>
</p>
<p>
  <img src="https://img.shields.io/badge/dotenv-8DD6F9?style=for-the-badge&logo=dotenv&logoColor=black"/>
</p>
<p>
  <img src="https://img.shields.io/badge/Multer-FF0000?style=for-the-badge&logoColor=white"/>
</p>
<p>
  <img src="https://img.shields.io/badge/Google%20Generative%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white"/>
</p>
<p>
  <img src="https://img.shields.io/badge/Railway-000000?style=for-the-badge&logo=railway&logoColor=white"/>
</p>

## 🏃‍♂️ Como rodar localmente

🔹 BackEnd

```bash
# Clone o repositório
git clone https://github.com/IcaroMatux/lumi-api.git
cd lumi-backend

# Instale as dependências
npm install

# Crie o arquivo .env
# touch .env
# GOOGLE_API_KEY=...

# Rode o servidor
node server.js

```

🔹 FrontEnd

```bash
# Clone o repositório
git clone https://github.com/IcaroMatux/lumi-ia.git
cd lumi-frontend

# Instale as dependências
npm install

# Crie o .env com a URL do backend deployado:
# REACT_APP_API_URL=https://seu-backend-production.up.railway.app

# Rode o servidor
npm start
```

## ✨ Funcionalidades

🔍 Análise de texto via Gemini
🖼️ Análise de imagem com prompt customizado
🌐 Comunicação via API REST
⚙️ CORS configurado para conexão frontend-backend em produção

## ✨ Funcionalidades futuras (backlog)

🔒 Login e autenticação
📄 Exportar histórico em PDF/Markdown
📊 Métricas em tempo real e feedback

## 📄 Licença

MIT License.
Feito com 💚 por [Icaro].
