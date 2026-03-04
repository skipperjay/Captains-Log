const BASE = '/api'

async function req(path, opts = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  // ── Skipper ──
  dashboard:      ()      => req('/dashboard'),
  content:        ()      => req('/content'),
  ideas:          ()      => req('/ideas'),
  reviews:        ()      => req('/reviews'),
  growth:         (d=84)  => req(`/analytics/growth?days=${d}`),
  addIdea:        (b)     => req('/ideas',              { method:'POST', body:JSON.stringify(b) }),
  promoteIdea:    (id, opts) => req(`/ideas/${id}/promote`, { method:'POST', body:JSON.stringify(opts||{}) }),
  saveReview:     (b)     => req('/reviews',            { method:'POST', body:JSON.stringify(b) }),
  addContent:     (b)     => req('/content',            { method:'POST', body:JSON.stringify(b) }),
  moveContent:    (id, stage) => req(`/content/${id}`,  { method:'PATCH', body:JSON.stringify({ stage }) }),

  // ── Projects ──
  projects:           ()        => req('/projects'),
  createProject:      (b)       => req('/projects',                    { method:'POST',  body:JSON.stringify(b) }),
  updateProject:      (id, b)   => req(`/projects/${id}`,              { method:'PATCH', body:JSON.stringify(b) }),
  deleteProject:      (id)      => req(`/projects/${id}`,              { method:'DELETE' }),
  addMilestone:       (id, b)   => req(`/projects/${id}/milestones`,   { method:'POST',  body:JSON.stringify(b) }),
  updateMilestone:    (id, b)   => req(`/projects/milestones/${id}`,   { method:'PATCH', body:JSON.stringify(b) }),
  deleteMilestone:    (id)      => req(`/projects/milestones/${id}`,   { method:'DELETE' }),
  addProjectUpdate:   (id, b)   => req(`/projects/${id}/updates`,      { method:'POST',  body:JSON.stringify(b) }),
  deleteProjectUpdate:(id)      => req(`/projects/updates/${id}`,      { method:'DELETE' }),
  notes:          ()      => req('/waypoint/notes'),
  addNote:        (b)     => req('/waypoint/notes',    { method:'POST', body:JSON.stringify(b) }),
  deleteNote:     (id)    => req(`/waypoint/notes/${id}`,  { method:'DELETE' }),
  deleteIdea:     (id)    => req(`/ideas/${id}`,            { method:'DELETE' }),
  getContent:         (id)    => req(`/content/${id}`),
  updateContentFull:  (id, b) => req(`/content/${id}`, { method:'PATCH', body:JSON.stringify(b) }),
  deleteContent:      (id)    => req(`/content/${id}`,          { method:'DELETE' }),
  dailyReviews:    ()     => req('/daily-reviews'),
  saveDailyReview: (b)    => req('/daily-reviews',      { method:'POST', body:JSON.stringify(b) }),

  // ── Waypoint ──
  habitsToday:    ()      => req('/waypoint/habits/today'),
  logHabit:       (b)     => req('/waypoint/habits/log',          { method:'POST', body:JSON.stringify(b) }),
  todos:          ()      => req('/waypoint/todos'),
  completeTodo:   (id)    => req(`/waypoint/todos/${id}/complete`,{ method:'POST' }),
  deleteTodo:     (id)    => req(`/waypoint/todos/${id}`,         { method:'DELETE' }),
  snoozeTodo:     (id)    => req(`/waypoint/todos/${id}/snooze`,  { method:'POST' }),
  addWaypointTodo:(b)     => req('/waypoint/todos',               { method:'POST', body:JSON.stringify(b) }),
  capture:        (b)     => req('/waypoint/capture',             { method:'POST', body:JSON.stringify(b) }),
  logWorkoutSet:        (b)   => req('/waypoint/workouts/log-set',          { method:'POST', body:JSON.stringify(b) }),
  deleteWorkoutSession: (id)  => req(`/waypoint/workouts/sessions/${id}`,   { method:'DELETE' }),
  deleteWorkoutSet:     (id)  => req(`/waypoint/workouts/sets/${id}`,       { method:'DELETE' }),

  // ── Google Calendar ──
  calendarEvents: ()      => req('/calendar/events'),

  // ── Workouts ──
  workouts:        ()         => req('/waypoint/workouts'),
  workoutRecords:  ()         => req('/waypoint/workouts/records'),
  workoutProgress: (exercise) => req(`/waypoint/workouts/progress/${encodeURIComponent(exercise)}`),
}
