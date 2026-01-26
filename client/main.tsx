import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AudiencePage } from './AudiencePage.tsx'
import './index.css'

// Simple path-based routing
function Router() {
	const path = window.location.pathname

	if (path === '/audience') {
		return <AudiencePage />
	}

	// Default: tldraw app with video panel
	return <App />
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
	<React.StrictMode>
		<Router />
	</React.StrictMode>
)
