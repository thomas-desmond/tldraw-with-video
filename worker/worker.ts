import { handleUnfurlRequest } from 'cloudflare-workers-unfurl'
import { AutoRouter, error, IRequest } from 'itty-router'
import { handleAssetDownload, handleAssetUpload } from './assetUploads'

// make sure our sync durable object is made available to cloudflare
export { TldrawDurableObject } from './TldrawDurableObject'

// RealtimeKit configuration
const RTK_ACCOUNT_ID = 'd6850012d250c1600028b55d1d879b16'
const RTK_APP_ID = 'fad83e63-3310-4aa4-a778-2f2a29ef36c9'

// Demo meeting (tldraw whiteboard video)
const RTK_DEMO_MEETING_ID = 'bbbf7132-8f91-4f57-b9b5-ad5a91fd5aa1'
const RTK_DEMO_PRESET = 'group_call_host'

// Audience meeting (Tech Summit participation)
const RTK_AUDIENCE_MEETING_ID = 'bbb821a5-bfb3-498e-aaa3-f1f0a33277f4'
const RTK_AUDIENCE_PRESET = 'audience_preset'

// Helper function to create a participant in a meeting
async function createParticipant(request: IRequest, env: Env, meetingId: string, presetName: string) {
	const body = await request.json() as { name?: string }
	const participantName = body.name || 'Anonymous'

	// Get the API token from environment
	const apiToken = (env as any).CLOUDFLARE_API_TOKEN
	if (!apiToken) {
		return error(500, 'Missing CLOUDFLARE_API_TOKEN')
	}

	// Add participant to the meeting via RealtimeKit API
	const response = await fetch(
		`https://api.cloudflare.com/client/v4/accounts/${RTK_ACCOUNT_ID}/realtime/kit/${RTK_APP_ID}/meetings/${meetingId}/participants`,
		{
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${apiToken}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: participantName,
				preset_name: presetName,
				custom_participant_id: crypto.randomUUID(),
			}),
		}
	)

	if (!response.ok) {
		const errorText = await response.text()
		console.error('RealtimeKit API error:', response.status, errorText)
		return error(response.status, `RealtimeKit API error: ${errorText}`)
	}

	const data = await response.json() as {
		success: boolean
		data: { id: string; token: string }
	}

	if (!data.success || !data.data) {
		console.error('RealtimeKit API error response:', JSON.stringify(data))
		return error(500, 'RealtimeKit API returned unsuccessful response')
	}

	// Return the auth token to the client
	return {
		participantId: data.data.id,
		authToken: data.data.token,
		meetingId: meetingId,
	}
}

// we use itty-router (https://itty.dev/) to handle routing. in this example we turn on CORS because
// we're hosting the worker separately to the client. you should restrict this to your own domain.
const router = AutoRouter<IRequest, [env: Env, ctx: ExecutionContext]>({
	catch: (e) => {
		console.error(e)
		return error(e)
	},
})
	// requests to /connect are routed to the Durable Object, and handle realtime websocket syncing
	.get('/api/connect/:roomId', (request, env) => {
		const id = env.TLDRAW_DURABLE_OBJECT.idFromName(request.params.roomId)
		const room = env.TLDRAW_DURABLE_OBJECT.get(id)
		return room.fetch(request.url, { headers: request.headers, body: request.body })
	})

	// RealtimeKit auth endpoint - generates participant tokens for demo meeting
	.post('/api/rtk/auth', async (request, env) => {
		return createParticipant(request, env, RTK_DEMO_MEETING_ID, RTK_DEMO_PRESET)
	})

	// RealtimeKit auth endpoint for audience participation meeting
	.post('/api/rtk/audience-auth', async (request, env) => {
		return createParticipant(request, env, RTK_AUDIENCE_MEETING_ID, RTK_AUDIENCE_PRESET)
	})

	// assets can be uploaded to the bucket under /uploads:
	.post('/api/uploads/:uploadId', handleAssetUpload)

	// they can be retrieved from the bucket too:
	.get('/api/uploads/:uploadId', handleAssetDownload)

	// bookmarks need to extract metadata from pasted URLs:
	.get('/api/unfurl', handleUnfurlRequest)
	.all('*', () => {
		return new Response('Not found', { status: 404 })
	})

export default {
	fetch: router.fetch,
}
