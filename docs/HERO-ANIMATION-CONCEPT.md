# PomoBorrow Hero Animation — Creative Brief

## The Concept: "In One Ear, Out the Other"

### The Emotional Arc

**Act 1 — The Loss (fear)**
A translucent 3D wireframe head in profile. Red/orange particle streams (representing time data — moments, hours, days) flow INTO the left ear. They swirl chaotically inside the skull for a moment, then pour OUT the right ear and dissolve into nothing. The particles are labeled with faint text: "2 hours", "Tuesday morning", "gym session", "deep work block" — all dissolving into void.

Counter at bottom: "23 hours, 47 minutes lost today" — counting up in real-time.

This is visceral. The viewer FEELS their time evaporating.

**Act 2 — The Intervention (hope)**
As the user scrolls (or after 4 seconds), a glowing blue ring materializes at the right ear. Instead of dissolving into nothing, the red particles hit the ring and GET CAPTURED. They swirl into the ring's circumference, changing color as they're sorted:
- Red chaos → Blue (Work) 
- Red chaos → Orange (Gym)
- Red chaos → Green (Leisure)
- Red chaos → Dark blue (Sleep)

The ring fills up with organized, color-coded segments. The head becomes calm — the particles inside the skull slow down, organize.

**Act 3 — The Product (confidence)**  
The head fades. The ring zooms to center screen, now fully filled with a beautiful day visualization. It's the PomoBorrow ring — YOUR day, captured, organized, yours.

Text appears: **"Stop losing your day. Start owning it."**

### Technical Implementation

**Three.js scene:**
1. Wireframe head geometry (low-poly, ~500 faces, translucent white wireframe on black)
2. Particle system: 500-1000 small spheres with velocity + turbulence
3. Particle emitter at left ear position
4. Particle attractor/drain at right ear position (Act 1: drain to void, Act 2: drain to ring)
5. Torus geometry (the ring) materializes with emission animation
6. Particle color transition: red → activity colors when captured by ring
7. Scroll-driven timeline OR auto-play with scroll trigger

**Fallback for mobile/low-GPU:**
Pre-rendered video loop (MP4/WebM), 10-15 seconds, same concept but as video rather than real-time 3D.

### Product Video (for App Store / social)

Same concept but as a 30-second produced video:

0-10s: Head in profile, red particles flowing in and out. Unsettling. Text: "Every day, your time flows through you. Untracked. Unremembered. Gone."

10-20s: Ring appears. Particles captured. Colors organize. Text: "PomoBorrow catches what you'd forget."

20-30s: Ring zoom, filled with a beautiful day. App UI shown on iPhone. Text: "Your day. Tracked automatically. Download PomoBorrow."

### Assets Needed
- 3D head model (wireframe, can use Three.js BufferGeometry or import a low-poly OBJ)
- Particle system with physics (velocity, turbulence, attraction)
- Torus ring with segment coloring
- Scroll timeline or auto-play controller
