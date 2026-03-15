# Baileys — Integração com IgaraLead Ecosystem

## Visão Geral

Baileys é a camada de transporte WhatsApp usada pelo **Nexus** (fork Chatwoot)
para envio e recebimento de mensagens via WhatsApp Web.

A biblioteca é consumida como dependência — o Nexus instancia `makeWASocket` e
gerencia sessões.  O Baileys **não armazena dados de negócio** nem autentica
usuários; portanto, as mudanças pré-Hub são mínimas.

## Escopo de mudanças pré-Hub

| Item | Descrição |
|------|-----------|
| **SessionManager wrapper** | Camada fina em `src/Socket/` que injeta `client_slug` nos metadados de sessão, permitindo ao Nexus identificar a qual cliente pertence cada conexão |
| **Nenhuma mudança no protocolo** | O Baileys continua lidando exclusivamente com o protocolo WA; isolamento de dados é responsabilidade do Nexus |

## Padrão recomendado (SessionManager wrapper)

```typescript
// src/Utils/IgaraSessionManager.ts

import type { AuthenticationState } from '../Types'

export interface IgaraSessionConfig {
  /** client_slug from JWT / URL (e.g. "acme") */
  clientSlug: string
  /** unique session identifier within the client */
  sessionId: string
}

/**
 * Wraps the auth state with IgaraLead metadata so the calling
 * application (Nexus) can scope sessions per client.
 */
export function tagSession(
  state: AuthenticationState,
  config: IgaraSessionConfig
): AuthenticationState & { igaraMeta: IgaraSessionConfig } {
  return { ...state, igaraMeta: config }
}
```

O Nexus utiliza esse wrapper ao criar cada socket:

```typescript
import makeWASocket from 'baileys'
import { tagSession } from 'baileys/Utils/IgaraSessionManager'

const { state, saveCreds } = await useMultiFileAuthState(`sessions/${clientSlug}/${sessionId}`)
const taggedState = tagSession(state, { clientSlug, sessionId })

const sock = makeWASocket({
  auth: taggedState,
  // ...
})
```

## Isolamento de sessões

- Cada cliente (`client_slug`) mantém sessões em diretório/store próprio:
  `sessions/{client_slug}/{session_id}/`
- O Nexus valida que a `client_slug` no JWT bate com o path da sessão antes de
  permitir operações (envio, leitura, desconexão).
- O Baileys em si não faz essa validação — ela é responsabilidade do Nexus.

## Checklist de implementação

- [ ] Criar `src/Utils/IgaraSessionManager.ts` com `tagSession`
- [ ] Exportar em `src/Utils/index.ts`
- [ ] Documentar no README que integrations devem usar `tagSession` para
      ambientes multi-cliente
- [ ] Nexus: atualizar o channel provider WhatsApp para usar `tagSession`

## Notas

- **Versão atual**: 7.0.0-rc.9
- **Entry point**: `src/index.ts` → `makeWASocket`
- **Licença**: MIT
- Nenhuma tabela de banco nem endpoint HTTP — o Baileys é pura biblioteca
  de protocolo WA.
