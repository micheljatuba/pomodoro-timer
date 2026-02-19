# 📖 Guia de Instalação — Pomodoro Timer

**MJ Cloud Tecnologia © 2026 — Todos os direitos reservados.**

---

## Índice

- [Pré-requisitos](#pré-requisitos)
- [Instalação no Windows](#-instalação-no-windows)
- [Instalação no Linux](#-instalação-no-linux)
- [Executando o Projeto](#-executando-o-projeto)
- [Build para Produção](#-build-para-produção)
- [Solução de Problemas](#-solução-de-problemas)

---

## Pré-requisitos

Antes de instalar, certifique-se de ter os seguintes softwares:

| Software | Versão Mínima | Download |
|---|---|---|
| **Node.js** | 18.x ou superior | [nodejs.org](https://nodejs.org) |
| **npm** | 9.x ou superior | Incluído com Node.js |
| **Git** | 2.x ou superior | [git-scm.com](https://git-scm.com) |

> 💡 Para verificar se já estão instalados, abra o terminal e execute:
> ```
> node --version
> npm --version
> git --version
> ```

---

## 🪟 Instalação no Windows

### Passo 1 — Instalar o Node.js

1. Acesse [https://nodejs.org](https://nodejs.org)
2. Clique em **"LTS"** (versão recomendada, ex: 20.x LTS)
3. Baixe o instalador `.msi` para Windows
4. Execute o instalador e siga os passos:
   - Aceite os termos de licença
   - Mantenha o diretório padrão (`C:\Program Files\nodejs\`)
   - ✅ Marque a opção **"Add to PATH"** — isso é essencial!
   - Clique em **Install** e aguarde

5. Após a instalação, **reinicie o computador**

6. Abra o **Prompt de Comando** (`Win + R` → digite `cmd` → Enter) e confirme:

   ```cmd
   node --version
   npm --version
   ```

   Saída esperada (versões podem variar):
   ```
   v20.11.0
   10.2.4
   ```

---

### Passo 2 — Instalar o Git

1. Acesse [https://git-scm.com/download/win](https://git-scm.com/download/win)
2. O download iniciará automaticamente
3. Execute o instalador `.exe`
4. Durante a instalação, mantenha as configurações padrão
5. Na etapa **"Adjusting your PATH environment"**, selecione:
   - ✅ **"Git from the command line and also from 3rd-party software"**
6. Clique em **Next** até finalizar e clique em **Install**

7. Confirme a instalação:
   ```cmd
   git --version
   ```

---

### Passo 3 — Clonar o Repositório

1. Abra o **Prompt de Comando** ou **PowerShell**

2. Navegue até a pasta onde deseja instalar o projeto.  
   Exemplo: área de trabalho:
   ```cmd
   cd %USERPROFILE%\Desktop
   ```

3. Clone o repositório:
   ```cmd
   git clone https://github.com/mjcloud-tecnologia/pomodoro-timer.git
   ```

4. Entre na pasta do projeto:
   ```cmd
   cd pomodoro-timer
   ```

---

### Passo 4 — Instalar as Dependências

Dentro da pasta do projeto, execute:

```cmd
npm install
```

Aguarde o processo finalizar. Você verá uma saída similar a:
```
added 142 packages in 8s
```

---

### Passo 5 — Iniciar o Servidor de Desenvolvimento

```cmd
npm run dev
```

O terminal exibirá:
```
  VITE v5.x.x  ready in 300ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abra seu navegador e acesse: **http://localhost:5173**

🎉 **Pronto! O Pomodoro Timer está rodando no seu Windows.**

---

## 🐧 Instalação no Linux

> As instruções abaixo funcionam para **Ubuntu, Debian, Linux Mint** e distribuições derivadas.  
> Para outras distribuições, consulte a seção correspondente abaixo.

---

### Passo 1 — Instalar o Node.js

Recomendamos instalar via **NVM** (Node Version Manager) — a forma mais segura e flexível:

```bash
# Instalar o NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Recarregar o shell (ou abra um novo terminal)
source ~/.bashrc

# Verificar se o NVM foi instalado
nvm --version
```

Agora instale a versão LTS do Node.js:

```bash
# Instalar a versão LTS mais recente
nvm install --lts

# Usar a versão instalada
nvm use --lts

# Confirmar
node --version
npm --version
```

#### Alternativa — Instalar via apt (Ubuntu/Debian)

```bash
# Atualizar repositórios
sudo apt update

# Instalar o curl (se não tiver)
sudo apt install -y curl

# Adicionar o repositório oficial do Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -

# Instalar o Node.js
sudo apt install -y nodejs

# Confirmar
node --version
npm --version
```

---

#### Para outras distribuições

<details>
<summary><strong>Fedora / Red Hat / CentOS</strong></summary>

```bash
# Fedora
sudo dnf install nodejs npm git

# CentOS / RHEL (com repositório NodeSource)
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs
```
</details>

<details>
<summary><strong>Arch Linux / Manjaro</strong></summary>

```bash
sudo pacman -S nodejs npm git
```
</details>

<details>
<summary><strong>openSUSE</strong></summary>

```bash
sudo zypper install nodejs20 npm git
```
</details>

---

### Passo 2 — Instalar o Git

```bash
# Ubuntu / Debian
sudo apt install -y git

# Fedora
sudo dnf install git

# Arch Linux
sudo pacman -S git
```

Confirme:
```bash
git --version
```

---

### Passo 3 — Clonar o Repositório

1. Abra o terminal

2. Navegue até a pasta desejada. Exemplo, pasta home:
   ```bash
   cd ~
   ```

3. Clone o repositório:
   ```bash
   git clone https://github.com/mjcloud-tecnologia/pomodoro-timer.git
   ```

4. Entre na pasta do projeto:
   ```bash
   cd pomodoro-timer
   ```

---

### Passo 4 — Instalar as Dependências

```bash
npm install
```

Aguarde a conclusão:
```
added 142 packages in 6s
```

> **Permissão negada?** Nunca use `sudo npm install`.  
> Se encontrar erros de permissão, corrija com:
> ```bash
> sudo chown -R $USER ~/.npm
> npm install
> ```

---

### Passo 5 — Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

Saída esperada:
```
  VITE v5.x.x  ready in 250ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Abra o navegador em: **http://localhost:5173**

🎉 **Pronto! O Pomodoro Timer está rodando no seu Linux.**

---

## ▶️ Executando o Projeto

Após a instalação, para iniciar o app nas próximas vezes:

```bash
# Entre na pasta do projeto
cd pomodoro-timer

# Inicie o servidor
npm run dev
```

Para parar o servidor, pressione `Ctrl + C` no terminal.

---

## 📦 Build para Produção

Para gerar os arquivos otimizados prontos para deploy:

```bash
npm run build
```

Os arquivos serão gerados na pasta `dist/`. Para pré-visualizar o build:

```bash
npm run preview
```

---

## 🔧 Solução de Problemas

### ❌ `node: command not found` ou `npm: command not found`

O Node.js não foi adicionado ao PATH.

**Windows:** Reinstale o Node.js e certifique-se de marcar **"Add to PATH"** durante a instalação.

**Linux (NVM):** Execute `source ~/.bashrc` e tente novamente.

---

### ❌ `EACCES: permission denied` no npm install

**Linux:** Nunca use `sudo npm install`. Corrija as permissões:
```bash
sudo chown -R $USER ~/.npm
npm install
```

---

### ❌ Porta 5173 já está em uso

O Vite tentará automaticamente a próxima porta disponível (5174, 5175...).  
Ou encerre o processo na porta:

**Windows:**
```cmd
netstat -ano | findstr :5173
taskkill /PID <número_do_PID> /F
```

**Linux:**
```bash
lsof -ti:5173 | xargs kill -9
```

---

### ❌ Erros durante `npm install`

Limpe o cache e reinstale:
```bash
# Limpar cache
npm cache clean --force

# Remover a pasta de dependências
rm -rf node_modules          # Linux/Mac
rd /s /q node_modules        # Windows (CMD)

# Reinstalar
npm install
```

---

### ❌ Versão do Node.js incompatível

Verifique a versão:
```bash
node --version
```

Se for menor que v18, atualize:

**Via NVM (recomendado):**
```bash
nvm install --lts
nvm use --lts
```

**Windows:** Baixe e instale a versão LTS em [nodejs.org](https://nodejs.org).

---

## 📞 Suporte

Se os problemas persistirem, entre em contato:

📧 **contato@mjcloud.com.br**  
🌐 **https://mjcloud.com.br**

---

<div align="center">

© 2026 **MJ Cloud Tecnologia**. Todos os direitos reservados.

</div>
