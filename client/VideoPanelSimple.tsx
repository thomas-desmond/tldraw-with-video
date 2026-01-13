import { useEffect, useState, useRef, useCallback } from 'react'
// @ts-ignore - RealtimeKit doesn't have type declarations
import { useRealtimeKitClient } from '@cloudflare/realtimekit-react'
import { RtkUiProvider, RtkParticipantsAudio, RtkParticipantTile } from '@cloudflare/realtimekit-react-ui'

// In production, get this from your auth API
const AUTH_TOKEN = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdJZCI6IjdlNjZiYjY3LWEzZTItNDYxYi05ZWFkLWQzZTQzMThlNDBhZCIsIm1lZXRpbmdJZCI6ImJiYjRhNGU5LTgwMmMtNGQyMy1iNjIxLTg0YjIwNGE3YjY2ZCIsInBhcnRpY2lwYW50SWQiOiJhYWFlYjdmZi03NmQ1LTQxMTYtYjliNS03MmVlYjZkNWY4NTkiLCJwcmVzZXRJZCI6IjI4YzViYjY2LTU4OWYtNGUwZi04N2JmLTFkMTc0Nzg1ODUxMCIsImlhdCI6MTc2ODMyNDg3MCwiZXhwIjoxNzY4OTI5NjcwfQ.HsSymNm0ZMcQHAcHER5rt9kurFTGeDtWOdVledrjUpxXeRqiXXNNJzLl9XTyKczrtEvbOm_goJkATyhwOLhqFj6vH4V-S3jpYwAuWZkQ_z7Su7Rvd9oBQAQ3IzlvSJAQ8dGdo9qHmJsmHx6_Np1uiqGMWwZkuYjd0EUKGLo3v7QZKUTSIu9beR5q8tdE2ygK4gsTXRyp7XAeiTSf3pv9rQlHVuVj1xnYdgof1rkIFZ--W7r03xhH-J0-AJJ-leNUwWxxZyLDmgXtu1fg_P6-4BNJwl2UR1vZR_2crthQfh4h7yeZYN7gHALNKvfwi5AJQvWe3O3R2iuq5etgJfxzrg'

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

	return (
		<div style={{
			display: 'grid',
			gridTemplateColumns: participants.length <= 1 ? '1fr' : participants.length <= 4 ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
			gap: 6, padding: 6, flex: 1, overflow: 'auto', alignContent: 'start',
		}}>
			{participants.map(p => (
				<div key={p.id} style={{
					aspectRatio: '4/3', background: '#2a2a2a', borderRadius: 8, overflow: 'hidden', position: 'relative',
				}}>
					<RtkParticipantTile participant={p} />
					<div style={{
						position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.6)',
						color: 'white', padding: '2px 6px', borderRadius: 4, fontSize: 10,
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

	// Draggable state
	const [pos, setPos] = useState({ x: 80, y: 80 })
	const [dragging, setDragging] = useState(false)
	const dragRef = useRef({ x: 0, y: 0 })

	// Initialize meeting
	useEffect(() => {
		if (isOpen && !meeting) {
			initMeeting({ authToken: AUTH_TOKEN, defaults: { audio: true, video: true } })
		}
	}, [isOpen, meeting, initMeeting])

	// Join and enable media
	useEffect(() => {
		if (meeting && isOpen && !isJoined) {
			meeting.join().then(async () => {
				await meeting.self.enableVideo()
				await meeting.self.enableAudio()
				setIsJoined(true)
			}).catch(console.error)
		}
	}, [meeting, isOpen, isJoined])

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

	// Draggable modal
	return (
		<div
			onMouseMove={onDragMove} onMouseUp={onDragEnd} onMouseLeave={onDragEnd}
			style={{
				position: 'fixed', left: pos.x, top: pos.y, width: 400, zIndex: 2000,
				borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
				display: 'flex', flexDirection: 'column', background: '#1a1a1a',
			}}
		>
			{/* Header - drag handle */}
			<div onMouseDown={onDragStart} style={{
				padding: '10px 14px', background: '#252525', cursor: dragging ? 'grabbing' : 'grab',
				display: 'flex', justifyContent: 'space-between', alignItems: 'center',
				userSelect: 'none', borderBottom: '1px solid #333',
			}}>
				<span style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}>
					Video Call {isJoined && '• Live'}
				</span>
				<button onClick={handleClose} style={{
					background: 'transparent', border: 'none', color: '#999', fontSize: 20, cursor: 'pointer',
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

			{/* Controls */}
			{isJoined && (
				<div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 10, borderTop: '1px solid #333' }}>
					<button onClick={toggleAudio} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: audioOn ? '#333' : '#555', color: 'white', cursor: 'pointer' }}>
						{audioOn ? '🎤' : '🔇'}
					</button>
					<button onClick={toggleVideo} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: videoOn ? '#333' : '#555', color: 'white', cursor: 'pointer' }}>
						{videoOn ? '📹' : '📷'}
					</button>
					<button onClick={handleClose} style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#dc3545', color: 'white', cursor: 'pointer' }}>
						Leave
					</button>
				</div>
			)}
		</div>
	)
}
