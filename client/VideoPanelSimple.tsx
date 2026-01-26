import { useEffect, useState, useRef, useCallback } from 'react'
// @ts-ignore - RealtimeKit doesn't have type declarations
import { useRealtimeKitClient } from '@cloudflare/realtimekit-react'
import { RtkUiProvider, RtkParticipantsAudio, RtkParticipantTile } from '@cloudflare/realtimekit-react-ui'

// Fetch auth token from our backend Worker
async function getAuthToken(name?: string): Promise<string> {
	const response = await fetch('/api/rtk/auth', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ name: name || 'Anonymous' }),
	})
	if (!response.ok) {
		throw new Error(`Auth failed: ${response.status}`)
	}
	const data = await response.json() as { authToken: string }
	return data.authToken
}

// Video grid component - shows all participants
function VideoGrid({ meeting }: { meeting: any }) {
	const [participants, setParticipants] = useState<any[]>([])

	useEffect(() => {
		if (!meeting) return
		const update = () => {
			const joined = meeting.participants.joined.toArray?.() || Array.from(meeting.participants.joined)
			setParticipants([meeting.self, ...joined])
		}
		update()
		meeting.participants.joined.on('participantJoined', update)
		meeting.participants.joined.on('participantLeft', update)
		meeting.self.on('videoUpdate', update)
		return () => {
			meeting.participants.joined.off('participantJoined', update)
			meeting.participants.joined.off('participantLeft', update)
			meeting.self.off('videoUpdate', update)
		}
	}, [meeting])

	// Calculate grid layout - keep tiles big
	const getGridColumns = () => {
		if (participants.length <= 1) return '1fr'
		if (participants.length <= 2) return 'repeat(2, 1fr)'
		if (participants.length <= 4) return 'repeat(2, 1fr)'
		return 'repeat(3, 1fr)'
	}

	return (
		<div style={{
			display: 'grid',
			gridTemplateColumns: getGridColumns(),
			gap: 12,
			padding: 12,
			flex: 1,
			overflow: 'auto',
			alignContent: 'start',
			minHeight: 300,
		}}>
			{participants.map(p => (
				<div key={p.id} style={{
					aspectRatio: '4/3',
					background: '#2a2a2a',
					borderRadius: 10,
					overflow: 'hidden',
					position: 'relative',
					minWidth: 250,
					minHeight: 188,
				}}>
					<RtkParticipantTile participant={p} />
					<div style={{
						position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.7)',
						color: 'white', padding: '4px 10px', borderRadius: 6, fontSize: 14, fontWeight: 500,
					}}>
						{p.name || (p.id === meeting.self.id ? 'You' : 'Guest')}
					</div>
				</div>
			))}
		</div>
	)
}

export function VideoPanel() {
	const [meeting, initMeeting] = useRealtimeKitClient()
	const [isOpen, setIsOpen] = useState(false)
	const [isJoined, setIsJoined] = useState(false)
	const [audioOn, setAudioOn] = useState(true)
	const [videoOn, setVideoOn] = useState(true)
	const [captionsOn, setCaptionsOn] = useState(false)
	const [currentCaption, setCurrentCaption] = useState('')

	// Draggable state
	const [pos, setPos] = useState({ x: 80, y: 80 })
	const [dragging, setDragging] = useState(false)
	const dragRef = useRef({ x: 0, y: 0 })

	// Initialize meeting - fetch auth token from backend
	useEffect(() => {
		if (isOpen && !meeting) {
			getAuthToken().then((authToken) => {
				initMeeting({ authToken, defaults: { audio: true, video: true } })
			}).catch(console.error)
		}
	}, [isOpen, meeting, initMeeting])

	// Join and enable media
	useEffect(() => {
		if (meeting && isOpen && !isJoined) {
			meeting.join().then(async () => {
				await meeting.self.enableVideo()
				await meeting.self.enableAudio()
				setIsJoined(true)
				// Expose meeting to window for debugging
				;(window as any).meeting = meeting
				console.log('Meeting joined! Access via window.meeting')
				console.log('AI object:', meeting.ai)
			}).catch(console.error)
		}
	}, [meeting, isOpen, isJoined])

	// Listen for transcripts
	useEffect(() => {
		if (!meeting || !isJoined || !captionsOn) return
		
		const handleTranscript = (data: any) => {
			console.log('Transcript received:', data)
			const text = data.transcript || data.text || ''
			const name = data.name || 'Unknown'
			if (text) {
				setCurrentCaption(`${name}: ${text}`)
				// Clear caption after 5 seconds if no new one
				setTimeout(() => setCurrentCaption(prev => prev === `${name}: ${text}` ? '' : prev), 5000)
			}
		}
		
		meeting.ai?.on('transcript', handleTranscript)
		console.log('Transcript listener attached')
		
		return () => {
			meeting.ai?.off('transcript', handleTranscript)
		}
	}, [meeting, isJoined, captionsOn])

	// Handlers
	const onDragStart = useCallback((e: React.MouseEvent) => {
		setDragging(true)
		dragRef.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
	}, [pos])
	const onDragMove = useCallback((e: React.MouseEvent) => {
		if (dragging) setPos({ x: e.clientX - dragRef.current.x, y: e.clientY - dragRef.current.y })
	}, [dragging])
	const onDragEnd = useCallback(() => setDragging(false), [])

	const handleClose = useCallback(async () => {
		await meeting?.leave().catch(() => {})
		setIsJoined(false)
		setIsOpen(false)
	}, [meeting])

	const toggleAudio = async () => {
		audioOn ? await meeting?.self.disableAudio() : await meeting?.self.enableAudio()
		setAudioOn(!audioOn)
	}
	const toggleVideo = async () => {
		videoOn ? await meeting?.self.disableVideo() : await meeting?.self.enableVideo()
		setVideoOn(!videoOn)
	}

	// Join button
	if (!isOpen) {
		return (
			<button onClick={() => setIsOpen(true)} style={{
				position: 'absolute', bottom: 20, right: 20, zIndex: 1000,
				padding: '12px 24px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer',
				backgroundColor: '#F48120', color: 'white', border: 'none', borderRadius: 8,
				boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
			}}>
				Join Video Call
			</button>
		)
	}

	// Draggable modal - large size for demo visibility
	return (
		<div
			onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
			style={{
				position: 'fixed', left: pos.x, top: pos.y, width: 640, minHeight: 480, zIndex: 2000,
				borderRadius: 14, overflow: 'hidden', boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
				display: 'flex', flexDirection: 'column', background: '#1a1a1a',
			}}
		>
			{/* Header - drag handle */}
			<div onMouseDown={onDragStart} style={{
				padding: '14px 18px', background: '#252525', cursor: dragging ? 'grabbing' : 'grab',
				display: 'flex', justifyContent: 'space-between', alignItems: 'center',
				userSelect: 'none', borderBottom: '1px solid #333',
			}}>
				<span style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>
					Video Call {isJoined && '• Live'}
				</span>
				<button onClick={handleClose} style={{
					background: 'transparent', border: 'none', color: '#999', fontSize: 24, cursor: 'pointer',
				}}>×</button>
			</div>

			{/* Video content */}
			{meeting && isJoined ? (
				<RtkUiProvider meeting={meeting}>
					<RtkParticipantsAudio />
					<VideoGrid meeting={meeting} />
				</RtkUiProvider>
			) : (
				<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888' }}>
					{meeting ? 'Joining...' : 'Connecting...'}
				</div>
			)}

			{/* Captions display - large text for demo visibility */}
			{isJoined && captionsOn && currentCaption && (
				<div style={{
					padding: '14px 20px', background: 'rgba(0,0,0,0.9)', color: 'white',
					fontSize: 20, fontWeight: 500, textAlign: 'center', borderTop: '1px solid #333',
					lineHeight: 1.4,
				}}>
					{currentCaption}
				</div>
			)}

			{/* Controls - larger for demo visibility */}
			{isJoined && (
				<div style={{ display: 'flex', justifyContent: 'center', gap: 12, padding: 14, borderTop: '1px solid #333' }}>
					<button onClick={toggleAudio} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: audioOn ? '#333' : '#555', color: 'white', cursor: 'pointer', fontSize: 18 }}>
						{audioOn ? '🎤' : '🔇'}
					</button>
					<button onClick={toggleVideo} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: videoOn ? '#333' : '#555', color: 'white', cursor: 'pointer', fontSize: 18 }}>
						{videoOn ? '📹' : '📷'}
					</button>
					<button onClick={() => setCaptionsOn(!captionsOn)} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: captionsOn ? '#F48120' : '#333', color: 'white', cursor: 'pointer', fontSize: 16, fontWeight: 'bold' }}>
						CC
					</button>
					<button onClick={handleClose} style={{ padding: '12px 24px', borderRadius: 8, border: 'none', background: '#dc3545', color: 'white', cursor: 'pointer', fontSize: 16 }}>
						Leave
					</button>
				</div>
			)}
		</div>
	)
}
