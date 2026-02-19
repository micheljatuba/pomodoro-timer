# 🍅 Pomodoro Timer — MJ Cloud Tecnologia

<div align="center">

![MJ Cloud Tecnologia](https://img.shields.io/badge/MJ_Cloud-Tecnologia-e05c5c?style=for-the-badge&logoColor=white)
![Versão](https://img.shields.io/badge/Versão-1.0.0-f4a261?style=for-the-badge)
![Licença](https://img.shields.io/badge/Licença-Proprietária-red?style=for-the-badge)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**Aplicação de produtividade com timer Pomodoro, gamificação e ciclos de foco personalizáveis.**

</div>

---

> ⚠️ **AVISO DE COPYRIGHT**
> Este repositório é público apenas para fins de **visualização e portfólio**.
> O código-fonte é propriedade exclusiva da **MJ Cloud Tecnologia** e **não pode
> ser copiado, modificado ou redistribuído** sem autorização prévia por escrito.
> Consulte o arquivo [LICENSE](./LICENSE) para os termos completos.

---

## ✨ Funcionalidades

- **⏱️ Timer Pomodoro** — Trabalho, Pausa Curta e Pausa Longa totalmente configuráveis
- **🔄 Ciclos de Foco** — Crie sequências automáticas personalizadas com modo auto-avanço e loop
- **🌙☀️ Tema Escuro / Claro** — Alternância instantânea com persistência de preferência
- **🎮 Gamificação** — Sistema de XP, 6 níveis (Iniciante → Lendário) e 8 conquistas desbloqueáveis
- **📊 Dashboard** — Acompanhamento de foco por dia, semana e mês com gráficos interativos
- **🔔 Sons de Notificação** — Bell, Digital, Soft ou silencioso
- **👤 Perfil de Usuário** — Badge personalizado com nome e nível atual
- **💾 Persistência Local** — Todas as preferências e estatísticas salvas no navegador

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| React 18+ | Interface e gerenciamento de estado |
| Web Audio API | Sons de notificação gerados sinteticamente |
| localStorage | Persistência de dados sem backend |
| CSS-in-JS (inline styles) | Estilização responsiva e temática |
| Google Fonts | Tipografia (DM Serif Display + DM Sans) |

## 🚀 Como Executar Localmente

> Apenas para avaliação técnica. Veja os termos da [LICENSE](./LICENSE).

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

> 📖 **Guia completo passo a passo:** [INSTALL.md](./INSTALL.md)
> Instruções detalhadas para **Windows** e **Linux** com solução de problemas.

```bash
# 1. Clone o repositório
git clone https://github.com/mjcloud-tecnologia/pomodoro-timer.git
cd pomodoro-timer

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:5173` no navegador.

### Build para produção

```bash
npm run build
```

## 📁 Estrutura do Projeto

```
pomodoro-timer/
├── public/
│   └── index.html
├── src/
│   └── App.jsx          # Aplicação principal (componente único)
├── .gitignore
├── LICENSE              # ⚠️ Licença proprietária — leia antes de usar
├── README.md
├── package.json
└── vite.config.js
```

## 📸 Telas

| Tema Escuro | Tema Claro |
|---|---|
| Timer principal com modo Trabalho | Painel de configurações |
| Dashboard de gamificação | Criador de ciclos |

## 🏢 Sobre

Desenvolvido por **MJ Cloud Tecnologia** — empresa especializada em soluções digitais modernas.

- 🌐 Website: [mjcloud.com.br](https://mjcloud.com.br)
- 📧 Contato: contato@mjcloud.com.br

---

<div align="center">

© 2026 **MJ Cloud Tecnologia**. Todos os direitos reservados.

*O uso não autorizado deste software está sujeito às penalidades previstas
na Lei nº 9.610/1998 e na Lei nº 9.279/1996.*

</div>
