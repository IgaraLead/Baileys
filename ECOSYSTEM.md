# Baileys — Ecossistema IgaraLead

## Papel

Baileys é a **camada de transporte WhatsApp** (API Web - vínculo via QR code) usada como sidecar do Nexus. Não é produto final — é infraestrutura.

## Referências

- [ECOSYSTEM_SDD.md](../Nexus/ECOSYSTEM_SDD.md) — Documento de design do ecossistema
- [IGARALEAD_INTEGRATION.md](IGARALEAD_INTEGRATION.md) — Documentação de integração específica

## Princípios

1. **Baileys é transporte, não domínio de negócio** — regras ficam no Nexus
2. **Isolamento multi-tenant imposto pelo Nexus** — sessões carregam `client_slug`
3. **Sessões segregadas por cliente** — diretório `/sessions/{slug}/{id}/`
4. **Deve permanecer fino** — menos regra de negócio = menos custo de manutenção

## Stack

- Node.js / TypeScript
- WebSocket (protocolo WhatsApp Web)
- libsignal (E2E encryption)
- protobufjs (serialização)

## Integração com Nexus

### Webhooks (Baileys → Nexus)
| Webhook | Descrição |
|---------|-----------|
| `POST /webhooks/baileys/message` | Mensagem recebida |
| `POST /webhooks/baileys/status` | Status da mensagem (sent/delivered/read) |
| `POST /webhooks/baileys/qr` | QR code gerado |
| `POST /webhooks/baileys/connection` | Conexão aberta/fechada |
| `POST /webhooks/baileys/contact` | Atualização de contato |
| `POST /webhooks/baileys/group` | Atualização de grupo |

### REST API (Nexus → Baileys)
| Endpoint | Descrição |
|----------|-----------|
| `POST /sessions/start` | Iniciar sessão (QR code) |
| `POST /messages/send` | Enviar mensagem |

### Autenticação
- `BAILEYS_SIDECAR_API_KEY` para comunicação bidirecional

## Política de API

**Sem APIs abertas.** O Baileys é infraestrutura interna — sua API é consumida exclusivamente pelo Nexus via `BAILEYS_SIDECAR_API_KEY`. Nenhum endpoint é exposto externamente.

## Session Manager IgaraLead

- `src/Utils/igara-session-manager.ts`
- `tagSession()` injeta `client_slug` + `sessionId` no auth state
- Validação de slug feita pelo Nexus antes de qualquer operação
