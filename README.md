# Captain's Log — Personal Operating System

## Setup

### 1. Install dependencies
```
npm install
```

### 2. Add Waypoint database to your Skipper server.js

Open `waypoint-endpoints.js` — it contains step-by-step instructions and all the code you need to paste into your existing `server.js`.

**In your `.env`, add:**
```
WAYPOINT_DATABASE_URL=your_waypoint_neon_pooled_connection_string
```

### 3. Run the dashboard
Make sure `node server.js` is running in your skipper-pipeline folder, then:
```
npm run dev
```

Open `http://localhost:5173`

---

## What's on each page

**Daily Brief** — Two gauges (habits today + content execution), open todos from Waypoint, quick capture for ideas and notes

**Pipeline** — Content pipeline board across 5 stages, today's habits, pillar balance

**Performance** — Top content table, audience growth chart, subscriber counts

**Weekly Review** — Log your week, view history

**Process Health** — All-time execution gauge, weekly bar chart, milestone tracker

---

## Notes
- Todos and habits come from your Waypoint database via the new endpoints
- Ideas saved via Quick Capture go to your Skipper `ideas` table
- Notes saved via Quick Capture go to Waypoint's `logs` table
- If Waypoint endpoints aren't set up yet, those panels show graceful empty states
