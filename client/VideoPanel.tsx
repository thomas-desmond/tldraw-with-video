import { useEffect, useState, useCallback } from 'react'
// @ts-ignore - RealtimeKit doesn't have type declarations
import { useRealtimeKitClient } from '@cloudflare/realtimekit-react'
import {
	RtkUiProvider,
	RtkParticipantsAudio,
	RtkParticipantTile,
} from '@cloudflare/realtimekit-react-ui'

// Demo auth tokens - in production these would come from your auth worker
// Token 1 (host): Open in first browser window
const DEMO_TOKEN_1 = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdJZCI6IjdlNjZiYjY3LWEzZTItNDYxYi05ZWFkLWQzZTQzMThlNDBhZCIsIm1lZXRpbmdJZCI6ImJiYjRhNGU5LTgwMmMtNGQyMy1iNjIxLTg0YjIwNGE3YjY2ZCIsInBhcnRpY2lwYW50SWQiOiJhYWFlYjdmZi03NmQ1LTQxMTYtYjliNS03MmVlYjZkNWY4NTkiLCJwcmVzZXRJZCI6IjI4YzViYjY2LTU4OWYtNGUwZi04N2JmLTFkMTc0Nzg1ODUxMCIsImlhdCI6MTc2ODMyNDg3MCwiZXhwIjoxNzY4OTI5NjcwfQ.HsSymNm0ZMcQHAcHER5rt9kurFTGeDtWOdVledrjUpxXeRqiXXNNJzLl9XTyKczrtEvbOm_goJkATyhwOLhqFj6vH4V-S3jpYwAuWZkQ_z7Su7Rvd9oBQAQ3IzlvSJAQ8dGdo9qHmJsmHx6_Np1uiqGMWwZkuYjd0EUKGLo3v7QZKUTSIu9beR5q8tdE2ygK4gsTXRyp7XAeiTSf3pv9rQlHVuVj1xnYdgof1rkIFZ--W7r03xhH-J0-AJJ-leNUwWxxZyLDmgXtu1fg_P6-4BNJwl2UR1vZR_2crthQfh4h7yeZYN7gHALNKvfwi5AJQvWe3O3R2iuq5etgJfxzrg'

// Token 2 (participant): Open in second browser window  
const DEMO_TOKEN_2 = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcmdJZCI6IjdlNjZiYjY3LWEzZTItNDYxYi05ZWFkLWQzZTQzMThlNDBhZCIsIm1lZXRpbmdJZCI6ImJiYjRhNGU5LTgwMmMtNGQyMy1iNjIxLTg0YjIwNGE3YjY2ZCIsInBhcnRpY2lwYW50SWQiOiJhYWE5NjM4My02YjgxLTRmMGItOGUzOC1mZmQyNDQ4MzM2Y2UiLCJwcmVzZXRJZCI6IjYxMDQ1NTgzLTBhM2YtNDA3MC05MTk4LTBjYTBiNDIzMGQ2MCIsImlhdCI6MTc2ODMyNDg3NywiZXhwIjoxNzY4OTI5Njc3fQ.uLF0DMVJ-nIcCfPr4-Au_HkSLyGvHUfjpASMsrwHeWzo-1N3DUoy8qrY2s_ZYRWwmjQJX-pyXpLoiWq803CTnM-BgBor5zjGRmpkPnsRaEoIHO3GpIZBonPlHK_aosVuSyBMguNjdVoB8Mc3ebB2ywD44E9aFGXCJxUlNKtsb9QSiaApjZaTnTLnN8gD7cw9hndomyXqNG5Uib8NSbpQy3cejDfwuRDqek8wTYJJYJ6sbAEtCHGXyYzu1aLHLmVkXZ2FAenq-xjCMl8FRt2ZDRKDcwsCqkyr3Xi-WeAe-E0SMM4mi1CiBh_SjyDEY4rqjhEsOW3467MuWAmHiB9lRg'

// For demo: use ?user=2 in URL to use second token
const getAuthToken = () => {
	const params = new URLSearchParams(window.location.search)
	return params.get('user') === '2' ? DEMO_TOKEN_2 : DEMO_TOKEN_1
}

// Custom component to render video grid
function VideoGrid({ meeting }: { meeting: any }) {
	const [participants, setParticipants] = useState<any[]>([])
	const [, forceUpdate] = useState({})

	useEffect(() => {
		if (!meeting) return

		const updateParticipants = () => {
			// Get all participants including self
			const joined = meeting.participants.joined.toArray ? 
				meeting.participants.joined.toArray() : 
				Array.from(meeting.participants.joined)
			const all = [meeting.self, ...joined]
			console.log('Participants updated:', all.length, all.map((p: any) => p.name || p.id))
			setParticipants([...all])
		}

		updateParticipants()

		// Listen for participant changes
		meeting.participants.joined.on('participantJoined', updateParticipants)
		meeting.participants.joined.on('participantLeft', updateParticipants)
		
		// Also listen for video updates
		meeting.self.on('videoUpdate', () => forceUpdate({}))

		return () => {
			meeting.participants.joined.off('participantJoined', updateParticipants)
			meeting.participants.joined.off('participantLeft', updateParticipants)
			meeting.self.off('videoUpdate', () => forceUpdate({}))
		}
	}, [meeting])

	if (participants.length === 0) {
		return (
			<div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
				No participants yet
			</div>
		)
	}

	return (
		<div
			style={{
				display: 'grid',
				gridTemplateColumns: participants.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(140px, 1fr))',
				gap: '8px',
				padding: '8px',
				flex: 1,
				overflow: 'auto',
				alignContent: 'start',
			}}
		>
			{participants.map((participant) => (
				<div
					key={participant.id}
					style={{
						aspectRatio: '4/3',
						minHeight: '100px',
						maxHeight: '180px',
						background: '#2a2a2a',
						borderRadius: '8px',
						overflow: 'hidden',
						position: 'relative',
					}}
				>
					<RtkParticipantTile participant={participant} />
					<div
						style={{
							position: 'absolute',
							bottom: '4px',
							left: '4px',
							background: 'rgba(0,0,0,0.6)',
							color: 'white',
							padding: '2px 6px',
							borderRadius: '4px',
							fontSize: '11px',
						}}
					>
						{participant.name || (participant.id === meeting.self.id ? 'You' : 'Guest')}
					</div>
				</div>
			))}
		</div>
	)
}

// Simple custom control bar
function ControlBar({ meeting, onLeave }: { meeting: any; onLeave: () => void }) {
	const [audioEnabled, setAudioEnabled] = useState(true)
	const [videoEnabled, setVideoEnabled] = useState(true)

	const toggleAudio = useCallback(async () => {
		try {
			if (audioEnabled) {
				await meeting.self.disableAudio()
			} else {
				await meeting.self.enableAudio()
			}
			setAudioEnabled(!audioEnabled)
		} catch (e) {
			console.log('Audio toggle error:', e)
		}
	}, [meeting, audioEnabled])

	const toggleVideo = useCallback(async () => {
		try {
			if (videoEnabled) {
				await meeting.self.disableVideo()
			} else {
				await meeting.self.enableVideo()
			}
			setVideoEnabled(!videoEnabled)
		} catch (e) {
			console.log('Video toggle error:', e)
		}
	}, [meeting, videoEnabled])

	const handleLeave = useCallback(async () => {
		try {
			await meeting.leave()
		} catch (e) {
			console.log('Leave error:', e)
		}
		onLeave()
	}, [meeting, onLeave])

	const buttonStyle = (active: boolean): React.CSSProperties => ({
		padding: '10px 16px',
		border: 'none',
		borderRadius: '8px',
		cursor: 'pointer',
		fontSize: '14px',
		fontWeight: 500,
		background: active ? '#333' : '#555',
		color: 'white',
		display: 'flex',
		alignItems: 'center',
		gap: '6px',
	})

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				gap: '8px',
				padding: '12px',
				background: '#1a1a1a',
				borderTop: '1px solid #333',
			}}
		>
			<button onClick={toggleAudio} style={buttonStyle(audioEnabled)} title={audioEnabled ? 'Mute' : 'Unmute'}>
				{audioEnabled ? '🎤' : '🔇'}
			</button>
			<button onClick={toggleVideo} style={buttonStyle(videoEnabled)} title={videoEnabled ? 'Stop Video' : 'Start Video'}>
				{videoEnabled ? '📹' : '📷'}
			</button>
			<button
				onClick={handleLeave}
				style={{
					...buttonStyle(false),
					background: '#dc3545',
				}}
				title="Leave Call"
			>
				Leave
			</button>
		</div>
	)
}

interface VideoPanelProps {
	isOpen: boolean
	onToggle: (open: boolean) => void
	width: number
}

export function VideoPanel({ isOpen, onToggle, width }: VideoPanelProps) {
	const [meeting, initMeeting] = useRealtimeKitClient()
	const [isJoined, setIsJoined] = useState(false)

	useEffect(() => {
		if (isOpen && !meeting) {
			initMeeting({
				authToken: getAuthToken(),
				defaults: {
					audio: true,
					video: true,
				},
			})
		}
	}, [isOpen, initMeeting, meeting])

	// Auto-join when meeting is ready and enable video/audio
	useEffect(() => {
		if (meeting && !isJoined && isOpen) {
			meeting.join().then(async () => {
				// Enable video and audio after joining
				try {
					await meeting.self.enableVideo()
					await meeting.self.enableAudio()
				} catch (e) {
					console.log('Could not enable media:', e)
				}
				setIsJoined(true)
			})
		}
	}, [meeting, isJoined, isOpen])

	const handleLeave = useCallback(async () => {
		if (meeting) {
			try {
				await meeting.leave()
			} catch (e) {
				console.log('Leave error:', e)
			}
		}
		setIsJoined(false)
		onToggle(false)
	}, [meeting, onToggle])

	// Join Video button when panel is closed
	if (!isOpen) {
		return (
			<button
				onClick={() => onToggle(true)}
				style={{
					position: 'absolute',
					bottom: 20,
					right: 20,
					zIndex: 1000,
					padding: '12px 24px',
					fontSize: '16px',
					fontWeight: 'bold',
					cursor: 'pointer',
					backgroundColor: '#F48120',
					color: 'white',
					border: 'none',
					borderRadius: '8px',
					boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
				}}
			>
				Join Video Call
			</button>
		)
	}

	// Video panel when open
	return (
		<div
			style={{
				width: `${width}px`,
				flexShrink: 0,
				display: 'flex',
				flexDirection: 'column',
				background: '#1a1a1a',
				borderLeft: '2px solid #444',
			}}
		>
			{/* Header with close button */}
			<div
				style={{
					padding: '12px 16px',
					borderBottom: '1px solid #333',
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					flexShrink: 0,
					background: '#1a1a1a',
				}}
			>
				<span style={{ color: 'white', fontWeight: 'bold' }}>
					Video Call {isJoined && '• Live'}
				</span>
				<button
					onClick={handleLeave}
					style={{
						background: 'transparent',
						border: 'none',
						color: '#999',
						fontSize: '20px',
						cursor: 'pointer',
					}}
					title="Close panel"
				>
					×
				</button>
			</div>

			{/* Video content area */}
			<div
				style={{
					flex: 1,
					minHeight: 0,
					display: 'flex',
					flexDirection: 'column',
					background: '#1a1a1a',
					overflow: 'hidden',
				}}
			>
				{meeting && isJoined ? (
					<RtkUiProvider meeting={meeting}>
						{/* Audio for all participants */}
						<RtkParticipantsAudio />
						
						{/* Video grid - takes remaining space */}
						<VideoGrid meeting={meeting} />
						
						{/* Custom control bar at bottom */}
						<ControlBar meeting={meeting} onLeave={handleLeave} />
					</RtkUiProvider>
				) : (
					<div style={{ 
						flex: 1, 
						display: 'flex', 
						alignItems: 'center', 
						justifyContent: 'center',
						color: 'white' 
					}}>
						{meeting ? 'Joining call...' : 'Connecting...'}
					</div>
				)}
			</div>
		</div>
	)
}
