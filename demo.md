# RealtimeKit Demo - Practice Guide

## Overview

**Total Time**: ~15 minutes (after Josh's 10-minute intro)  
**Audience**: Account Executives  
**Goal**: Show how RealtimeKit makes video infrastructure disappear

---

## Pre-Demo Checklist

- [ ] Tldraw demo loaded (without video visible)
- [ ] Tldraw demo with video ready in separate tab
- [ ] SFU demo loaded: https://realtime-sfu.cf-dev-platform.com
- [ ] QR code ready for audience participation
- [ ] Short URL backup ready
- [ ] Test mic/camera permissions

---

## TRANSITION (0:00 - 0:30)

**[Standing ready, Josh wraps up]**

> "Thanks, Josh. So you just heard about all that complexity - the encoding protocols, the 'can you hear me now?' debugging, the challenge of supporting every device and network condition...
>
> Let me show you what it looks like when RealtimeKit handles all of that for you."

**[Open browser to tldraw demo]**

---

## ACT 2: THE TRANSFORMATION (0:30 - 3:30)

### The Setup

**[Tldraw whiteboard is open, no video yet]**

> "So here's a collaborative whiteboard. Works great. Product wants video calling added."

### The Moment

**[Refresh or switch to version with video working]**

> "First time I built this? Couple hours. Now that I've done it once? About 30 minutes. That's the learning curve we're talking about."

**[Let video show for a beat, wave at camera]**

### What's NOT Here

> "And let me tell you what's NOT in this codebase."

> "No TURN server setup. No regional failover logic. No transcoding pipeline. No certificate management."

### The Bigger Picture

**[Pause, then:]**

> "This is what we mean when we talk about developer experience at Cloudflare. We're not just giving you infrastructure - we're giving you time back. Developers ship product, not plumbing."

### Checkpoints

| Time | Action |
|------|--------|
| 0:30 | Show whiteboard working |
| 1:00 | Switch to version with video |
| 1:30 | "First time... couple hours. Now? 30 minutes." |
| 2:00 | List what's NOT in the codebase |
| 2:45 | "Developer experience at Cloudflare..." |
| 3:15 | "Ship product, not plumbing." |

---

## ACT 3: FEATURES (3:30 - 6:30)

### Live Transcription

**[Video panel still open]**

> "But RealtimeKit isn't just video. Let me show you what else comes out of the box."

**[Click CC button]**

> "Live transcription. Powered by Workers AI. I'm talking right now and..."

**[Point to transcript appearing]**

> "...there it is. Real-time captions. Accessibility, meeting notes, searchable recordings - all built in."

### The Build-It-Yourself Reality

**[Pause, let it sink in]**

> "Think about what it would take to build this yourself. Speech-to-text API, syncing with video timestamps, handling multiple speakers..."

### Dashboard (Optional)

**[If time permits]**

> "And from the dashboard, you get analytics, recording management, usage metrics. The stuff you'd normally spend months building."

### Checkpoints

| Time | Action |
|------|--------|
| 3:30 | "Not just video..." |
| 4:00 | Click CC button |
| 4:30 | Talk, show transcription working |
| 5:30 | "Think about building this yourself..." |
| 6:00 | Optional dashboard peek |

---

## ACT 4: THE INFRASTRUCTURE (6:30 - 10:30)

### Transition

**[Move to SFU demo]**

> "So that's what you see as a developer. But let me show you what's happening under the hood - why this actually works at scale."

### Open the SFU Demo

**[Open https://realtime-sfu.cf-dev-platform.com]**

> "This is Cloudflare's global network. 330+ datacenters worldwide."

### Add Participants

**[Click to add a participant in Austin/Texas area]**

> "Let's say I'm a user in Austin. I join a call."

**[Point to the line connecting to nearest DC]**

> "See that? My connection automatically routes to the nearest datacenter. That's Anycast at work."

**[Click to add participant in London]**

> "Now someone joins from London."

**[Click to add participant in Tokyo]**

> "Tokyo."

**[Click to add participant in Sydney]**

> "Sydney."

### Explain the Architecture

**[Let the mesh visualization form]**

> "Look at what's happening. There's no central server in Virginia routing everything. Each user connects to their nearest edge. The datacenters talk to each other over Cloudflare's backbone."

### Speaker Mode

**[Toggle to Speaker Mode, click a participant to make them speaker]**

> "And in speaker mode - when one person is presenting - watch how the routing optimizes."

**[Let visualization update]**

### The Punchline

> "This is what you'd have to build yourself. Global infrastructure, intelligent routing, redundancy... Or you just use RealtimeKit and it's handled."

### Checkpoints

| Time | Action |
|------|--------|
| 6:30 | Transition - "under the hood" |
| 7:00 | Open SFU demo |
| 7:30 | Add Austin participant, explain Anycast |
| 8:30 | Add London, Tokyo, Sydney |
| 9:00 | Explain mesh - "no central server" |
| 9:30 | Toggle Speaker Mode |
| 10:00 | "This is what you'd have to build..." |

---

## ACT 5: AUDIENCE PARTICIPATION (10:30 - 14:00)

### Invitation

**[Close SFU demo, prepare QR code]**

> "Alright, I've shown you what it can do. Now I want you to experience it."

### QR Code

**[Display QR code and short URL]**

> "Take out your phones. Scan this QR code - or if that's not working, go to [short-url]."

### Guide Them In

**[Wait, watch the audience]**

> "You'll see a setup screen. Enter your name, allow camera access, and join."

### Acknowledge Joiners

**[As people start appearing on screen]**

> "There's [name]... and [name]... welcome!"

### The Moment

**[Once several people have joined]**

> "Look at this. You just joined a global video call. Different devices, different networks, all connecting through Cloudflare's edge."

### Optional: Poll

**[If enabled]**

> "And for the product teams in the room - yes, polls and chat are built in too."

### Checkpoints

| Time | Action |
|------|--------|
| 10:30 | "I want you to experience it" |
| 11:00 | Show QR code + backup URL |
| 11:30 | Encourage scanning, wait |
| 12:30 | Acknowledge joiners by name |
| 13:00 | "You just joined a global video call" |
| 13:30 | Optional poll |

---

## CLOSE (14:00 - 15:00)

> "So to recap - Josh walked you through the complexity of building real-time video. I just showed you how RealtimeKit makes it disappear.
>
> One SDK. Global infrastructure. AI-powered features. And as you just experienced - it works.
>
> Questions?"

---

## Quick Reference Card

```
TIMING CHEAT SHEET
------------------
 0:00  "Thanks, Josh..." -> Open tldraw
 0:30  Act 2 - Show transformation, "30 minutes"
 3:30  Act 3 - Click CC, show transcription
 6:30  Act 4 - Open SFU demo, add global participants
10:30  Act 5 - QR code, audience joins
14:00  Close - Recap + Q&A

KEY LINES TO NAIL
-----------------
* "Let me show you what it looks like when RealtimeKit
   handles all of that for you."
* "First time? Couple hours. Now? 30 minutes."
* "Developers ship product, not plumbing."
* "This is what you'd have to build yourself."
* "You just joined a global video call."

URLS
----
* Main demo: [your-deployed-url]
* Audience: [your-deployed-url]/audience
* SFU viz: realtime-sfu.cf-dev-platform.com

IF SOMETHING BREAKS
-------------------
* Video won't connect: "Let me show you the backup..."
* QR won't scan: "Here's the short URL instead..."
* Transcription glitchy: "AI's still warming up..."
* SFU demo slow: "You get the idea - 330 cities."
```

---

## Practice Plan

| Day | Focus | Time |
|-----|-------|------|
| Day 1 | Transition + Act 2 (the transformation) | 10 min |
| Day 2 | Acts 3 + 4 (features + SFU) | 15 min |
| Day 3 | Act 5 (audience) - test QR code! | 10 min |
| Day 4 | Full run-through, no stops | 20 min |
| Day 5 | Full run-through, record yourself | 20 min |

---

## Practice Notes

*Use this section to track what's working and what needs refinement:*

### What's Working
- 

### What Needs Work
- 

### Timing Adjustments
- 

### Questions That Came Up
- 
