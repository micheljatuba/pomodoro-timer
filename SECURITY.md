# Política de Segurança — MJ Cloud Tecnologia

## Versões Suportadas

| Versão | Suportada |
|--------|-----------|
| 1.0.x  | ✅ Sim     |

## Reportar Vulnerabilidades

Se você encontrar uma vulnerabilidade de segurança neste projeto,
**NÃO abra uma Issue pública**. Isso pode expor usuários a riscos.

### Como reportar

Envie um e-mail para: **contato@mjcloud.com.br**

Inclua no e-mail:
- Descrição detalhada da vulnerabilidade
- Passos para reproduzir o problema
- Impacto estimado
- Sua sugestão de correção (opcional)

### Prazo de resposta

Nos comprometemos a responder em até **72 horas úteis**.

---

## Boas Práticas Implementadas

- ✅ Nenhuma chave de API, token ou segredo no código-fonte
- ✅ Dados sensíveis do usuário armazenados apenas localmente (localStorage)
- ✅ Nenhuma requisição a servidores externos (exceto Google Fonts)
- ✅ `sourcemap: false` em produção — código-fonte não exposto no bundle
- ✅ `drop_console: true` — sem vazamento de logs em produção
- ✅ Sem dependências com vulnerabilidades conhecidas
- ✅ `.gitignore` configurado para nunca versionar arquivos `.env`

---

© 2026 MJ Cloud Tecnologia. Todos os direitos reservados.
