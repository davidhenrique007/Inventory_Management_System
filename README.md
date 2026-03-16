📦 Inventory Management System

Sistema profissional de gestão de estoque desenvolvido com Angular, Node.js e MySQL.

🚀 Tecnologias

Backend
- Node.js + Express
- MySQL com Sequelize
- JWT para autenticação
- Docker + CI/CD

Frontend
- Angular 17+
- RxJS para estado reativo
- Angular Material
- Gráficos com Chart.js

DevOps
- Docker Compose
- GitHub Actions
- Conventional Commits

📁 Estrutura do Projeto


## 🛠️ Como Executar

inventory-management/
├── backend/ # API Node.js + Express
├── frontend/ # Aplicação Angular
├── docker/ # Configurações Docker
├── database/ # Migrations e Seeds
└── docs/ # Documentação

### Pré-requisitos
- Node.js 18+
- npm 9+
- Angular CLI 17+
- Docker (opcional)

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Configure suas variáveis no .env
npm run dev