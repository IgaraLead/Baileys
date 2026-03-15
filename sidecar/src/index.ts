import express from 'express'
import { SessionManager } from './session-manager.js'
import { logger } from './logger.js'
import { getMediaDir, cleanupOldMedia } from './message-utils.js'

const app = express()
app.use(express.json({ limit: '10mb' }))

// Serve downloaded media files so Nexus can fetch them
app.use('/media', express.static(getMediaDir()))

const API_KEY = process.env.BAILEYS_SIDECAR_API_KEY || ''
const PORT = parseInt(process.env.PORT || '3500', 10)
const NEXUS_WEBHOOK_URL = process.env.NEXUS_WEBHOOK_URL || 'http://localhost:3000'

// API key auth middleware
function authenticate(req: express.Request, res: express.Response, next: express.NextFunction): void {
  if (API_KEY) {
    const provided = req.headers['x-api-key']
    if (provided !== API_KEY) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
  }
  next()
}

app.use(authenticate)

const manager = new SessionManager(NEXUS_WEBHOOK_URL, API_KEY)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', sessions: manager.getActiveSessions() })
})

// Start a session (generates QR code)
app.post('/sessions/start', async (req, res) => {
  const { session_id } = req.body
  if (!session_id) {
    res.status(400).json({ error: 'session_id is required' })
    return
  }

  try {
    const result = await manager.startSession(session_id)
    res.json(result)
  } catch (err: any) {
    logger.error({ err, session_id }, 'Failed to start session')
    res.status(500).json({ error: err.message })
  }
})

// Get session status
app.get('/sessions/:session_id/status', (req, res) => {
  const { session_id } = req.params
  const status = manager.getSessionStatus(session_id)
  res.json({ session_id, status })
})

// Disconnect a session
app.post('/sessions/disconnect', async (req, res) => {
  const { session_id } = req.body
  if (!session_id) {
    res.status(400).json({ error: 'session_id is required' })
    return
  }

  try {
    await manager.disconnectSession(session_id)
    res.json({ status: 'disconnected' })
  } catch (err: any) {
    logger.error({ err, session_id }, 'Failed to disconnect session')
    res.status(500).json({ error: err.message })
  }
})

// Send a message
app.post('/messages/send', async (req, res) => {
  const { session_id, jid, message, quoted_message_id } = req.body
  if (!session_id || !jid || !message) {
    res.status(400).json({ error: 'session_id, jid, and message are required' })
    return
  }

  try {
    const result = await manager.sendMessage(session_id, jid, message, quoted_message_id)
    res.json(result)
  } catch (err: any) {
    logger.error({ err, session_id, jid }, 'Failed to send message')
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, '0.0.0.0', async () => {
  logger.info({ port: PORT, nexus: NEXUS_WEBHOOK_URL }, 'Baileys sidecar started')

  // Clean up expired media files every 5 minutes
  setInterval(cleanupOldMedia, 5 * 60 * 1000)

  // Restore previously authenticated sessions
  await manager.restoreSessions()
})
