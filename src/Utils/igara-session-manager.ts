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
	config: IgaraSessionConfig,
): AuthenticationState & { igaraMeta: IgaraSessionConfig } {
	return { ...state, igaraMeta: config }
}
