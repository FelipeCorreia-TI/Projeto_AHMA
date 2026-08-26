# PROJETO A.H.M.A 🌱🤖

**A.H.M.A** (Automação Horta Mello Ayres) é uma aplicação web (PWA) para gestão e monitoramento de hortas: controle de acesso de usuários, catálogo de espécies de plantas (Plantopédia) e, em desenvolvimento, o monitoramento de sensores instalados em cada horta.

[![Acessar o Aplicativo](https://img.shields.io/badge/ACESSAR_O_APLICATIVO-007acc?style=for-the-badge)](https://felipecorreia-ti.github.io/Projeto_AHMA/Client)
[![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-green?style=for-the-badge)](LICENSE)

> ⚠️ Projeto em desenvolvimento ativo. Funcionalidades, estrutura e stack ainda estão sendo ajustadas.

---

## 📖 Sobre o projeto

O A.H.M.A nasceu com a proposta de facilitar o cuidado com hortas por meio de tecnologia: identificar rapidamente as espécies cultivadas, controlar quem pode acessar e alterar os dados, e, futuramente, acompanhar em tempo real as condições do solo (umidade, temperatura etc.) coletadas por sensores.

Hoje o repositório contém a camada de **cliente (front-end)** da aplicação, já publicada como um PWA instalável, com autenticação e um CRUD funcional de plantas. A camada de coleta de dados dos sensores (hardware/IoT) ainda está em fase de planejamento/estruturação.

## ✅ Estado atual do projeto

| Módulo | Status | Descrição |
|---|---|---|
| Autenticação e controle de acesso | 🟢 Funcional | Login via Supabase Auth, com níveis de acesso (`TI`, `AGRO`, usuário comum) validados contra a tabela de cadastro |
| Plantopédia (catálogo de espécies) | 🟢 Funcional | CRUD completo: cadastro, listagem por categoria, exclusão e upload/exclusão de fotos no Supabase Storage |
| PWA (instalável / offline) | 🟢 Funcional | `manifest.json` e `service worker` configurados, com cache de assets estáticos |
| Hub / navegação principal | 🟢 Funcional | Tela inicial (hub) com acesso às demais áreas do sistema |
| Monitoramento de solo/sensores | 🟡 Em construção | Telas de navegação (`sensores.html` e páginas por horta) já existem, mas ainda **sem integração de dados** — o conteúdo principal está vazio, aguardando a definição da fonte de dados dos sensores |
| Coleta de dados via sensores (IoT) | 🔴 Não iniciado | Ainda não há hardware ou serviço integrado captando dados reais das hortas |

## 🧱 Stack utilizada

- **Front-end:** HTML5, CSS3 e JavaScript (Vanilla, ES Modules) — sem frameworks
- **PWA:** `manifest.json` + Service Worker (`sw.js`) para instalação e cache offline
- **Backend as a Service:** [Supabase](https://supabase.com/) — Autenticação, banco de dados (PostgreSQL) e Storage de imagens

## 📂 Estrutura do repositório

```
Projeto_AHMA/
├── LICENSE
├── README.md
└── Client/                # Aplicação front-end (PWA)
    ├── index.html         # Login
    ├── hub.html           # Tela inicial
    ├── plantopedia.html   # Catálogo de espécies
    ├── sensores.html      # Acesso ao monitoramento
    ├── monitoramento/     # Dashboards por horta
    ├── manifest.json      # Configuração do PWA
    ├── sw.js              # Service Worker
    ├── assets/            # CSS, ícones e imagens
    └── src/               # Código-fonte da aplicação
        ├── auth/
        ├── config/
        ├── components/
        ├── pages/
        └── services/
```

**Páginas principais (`Client/`)**
- `index.html` — tela de login
- `hub.html` — página inicial após o login, com acesso aos demais módulos
- `plantopedia.html` — catálogo de espécies de plantas
- `sensores.html` — porta de entrada para o monitoramento das hortas
- `monitoramento/` — uma página por horta (`horta_soja`, `horta_dois`, `horta_tres`)

**Código-fonte (`Client/src/`)**
- `auth/` — proteção de rotas autenticadas
- `config/` — configuração e cliente do Supabase
- `components/` — componentes reutilizáveis, como o menu hambúrguer
- `pages/` — lógica específica de cada página (login, plantopédia)
- `services/` — comunicação com o Supabase (autenticação, plantas)

## 🚀 Como executar localmente

O projeto atual é 100% estático (não requer build), então basta servir a pasta `Client`:

```bash
git clone https://github.com/FelipeCorreia-TI/Projeto_AHMA.git
cd Projeto_AHMA/Client

# usando qualquer servidor estático, por exemplo:
npx serve .
# ou
python3 -m http.server 8080
```

Depois, acesse `http://localhost:<porta>/index.html` no navegador.

> A aplicação já está publicada via GitHub Pages e pode ser acessada diretamente pelo botão no topo deste README.

## 🔐 Sobre o Supabase

O front-end se conecta diretamente ao Supabase (`Client/src/config/supabase.js`) usando a URL do projeto e uma chave pública (*anon/publishable key*), própria para uso no navegador. Para rodar com seus próprios dados, é necessário criar um projeto no Supabase e ajustar as tabelas utilizadas: cadastro de usuários (com coluna de nível de acesso), espécies de plantas e categorias, além de um bucket de Storage para as fotos.

## 🗺️ Próximos passos

- [ ] Integrar dados reais dos sensores de solo nas telas de monitoramento
- [ ] Implementar a captação e o envio dos dados das hortas (IoT)

## 👥 Desenvolvedores

Projeto desenvolvido por **Felipe Correia**, **Yago Montouro** e **Pedro Hiago**.

## 📄 Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.