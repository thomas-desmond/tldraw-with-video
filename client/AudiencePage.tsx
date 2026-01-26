import { useEffect, useState } from 'react'
// @ts-ignore - types missing from published package
import { useRealtimeKitClient } from '@cloudflare/realtimekit-react'
import { RtkMeeting } from '@cloudflare/realtimekit-react-ui'

// Fetch auth token from our backend Worker (audience endpoint)
async function getAudienceAuthToken(name?: string): Promise<string> {
	const response = await fetch('/api/rtk/audience-auth', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name: name || 'Audience Member' }),
	})
	if (!response.ok) {
		throw new Error(`Auth failed: ${response.status}`)
	}
	const data = await response.json() as { authToken: string }
	return data.authToken
}

export function AudiencePage() {
	const [meeting, initMeeting] = useRealtimeKitClient()
	const [error, setError] = useState<string | null>(null)

	// Initialize meeting on page load
	useEffect(() => {
		if (!meeting) {
			getAudienceAuthToken()
				.then((authToken) => {
					initMeeting({ 
						authToken, 
						defaults: { 
							audio: false,  // Audio OFF by default
							video: true    // Video ON by default
						} 
					})
				})
				.catch((err) => {
					console.error('Auth error:', err)
					setError(err.message)
				})
		}
	}, [meeting, initMeeting])

	if (error) {
		return (
			<div style={{
				height: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: '#1a1a1a',
				color: 'white',
				flexDirection: 'column',
				gap: 16,
			}}>
				<h1>Unable to Join</h1>
				<p>{error}</p>
			</div>
		)
	}

	if (!meeting) {
		return (
			<div style={{
				height: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: '#1a1a1a',
				color: 'white',
			}}>
				<p>Connecting to meeting...</p>
			</div>
		)
	}

	// RtkMeeting provides the full experience:
	// - Setup screen with name input and camera preview
	// - Video grid with all participants
	// - Controls, chat, polls, etc.
	return (
		<div style={{ height: '100vh', width: '100vw' }}>
			<RtkMeeting meeting={meeting} />
		</div>
	)
}
