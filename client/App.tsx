import { useState } from 'react'
import { useSync } from '@tldraw/sync'
import { Tldraw } from 'tldraw'
import { getBookmarkPreview } from './getBookmarkPreview'
import { multiplayerAssetStore } from './multiplayerAssetStore'
import { VideoPanel } from './VideoPanel'

// In this example, the room ID is hard-coded. You can set this however you like though.
const roomId = 'test-room'

const VIDEO_PANEL_WIDTH = 350

function App() {
	const [videoPanelOpen, setVideoPanelOpen] = useState(false)

	// Create a store connected to multiplayer.
	const store = useSync({
		// We need to know the websockets URI...
		uri: `${window.location.origin}/api/connect/${roomId}`,
		// ...and how to handle static assets like images & videos
		assets: multiplayerAssetStore,
	})

	return (
		<div style={{ position: 'fixed', inset: 0, display: 'flex' }}>
			{/* Canvas area - shrinks when video panel is open */}
			<div
				style={{
					flex: 1,
					position: 'relative',
					transition: 'all 0.2s ease',
				}}
			>
				<Tldraw
					// we can pass the connected store into the Tldraw component which will handle
					// loading states & enable multiplayer UX like cursors & a presence menu
					store={store}
					onMount={(editor) => {
						// when the editor is ready, we need to register our bookmark unfurling service
						editor.registerExternalAssetHandler('url', getBookmarkPreview)
					}}
				/>
			</div>

			{/* RealtimeKit Video Panel - adds live video calling */}
			<VideoPanel
				isOpen={videoPanelOpen}
				onToggle={setVideoPanelOpen}
				width={VIDEO_PANEL_WIDTH}
			/>
		</div>
	)
}

export default App
