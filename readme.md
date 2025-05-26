# 📊 Bot de Presença para Discord 

Um bot para registro de participação em canais de voz com relatórios e gráficos automáticos.

## 🚀 Funcionalidades
- **Registro automático** de presença em call
- **Relatório classificatório** de participantes
- **Gráficos personalizáveis** por período
- Armazenamento local em JSON
- Suporte a múltiplos servidores

## ⚙️ Pré-requisitos
- [Node.js](https://nodejs.org/) 18.x+
- [Discord Developer Application](https://discord.com/developers/)
- Servidor Discord com permissão para adicionar bots

## 🔧 Instalação
```bash
# Clone o repositório
git clone https://github.com/dayvidsonveiga/bot-discord-rollcall.git
cd bot-discord-rollcall

# Instale as dependências
npm install

# Crie seu arquivo .env
cp .env.example .env
🔐 Configuração
Edite o .env com suas credenciais:

ini
BOT_TOKEN=seu_token_aqui
CLIENT_ID=seu_client_id_aqui
TEXT_CHANNEL_NAME=logs-de-presenca
Permissões Necessárias do Bot:

View Channels

Connect

Send Messages

Read Message History

▶️ Uso
bash
# Modo desenvolvimento
npm start

# Modo produção (recomendado)
npm install -g pm2
pm2 start src/app.js --name "bot-presenca"
📋 Comandos
Comando	Descrição	Parâmetros
/chamada	Registra presença na call atual	-
/relatorio	Exibe ranking de participações	-
/grafico	Gera gráfico de presenças (PNG)	período (opcional)


🗂️ Estrutura de Arquivos
.
├── src/
│   ├── utils/attendance/    # Lógica de presenças
│   └── app.js               # Core do bot
├── data/                    # Dados persistentes
│   └── attendance.json
├── .env                     # Variáveis de ambiente
└── package.json


🚨 Troubleshooting
Problema: Comandos não aparecem
✅ Solução:
Verifique se o CLIENT_ID no .env está correto
Reinstale os comandos globais: npm run register-commands

Problema: Dados não persistem
✅ Solução:
Verifique permissões de escrita na pasta data/
Confira erros no console do bot


🤝 Contribuindo
Faça um Fork do projeto

Crie sua Branch (git checkout -b feature/incrivel)

Commit suas Mudanças (git commit -m 'Add feature incrível')

Push para a Branch (git push origin feature/incrivel)

Abra um Pull Request


📜 Licença
Distribuído sob licença MIT. Veja LICENSE para mais informações.

**Recursos Adicionais:**  
- [Convite do Bot para Seu Servidor](https://discord.com/oauth2/authorize?client_id=SEU_CLIENT_ID&permissions=2184252496&scope=bot%20applications.commands)  