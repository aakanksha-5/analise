// src/stores/tracker.js
// ─────────────────────────────────────────────────────────────────────────────
// Analise — Interview Question Tracker
// Pinia store: Coding Questions + Flashcards + Spaced Repetition Engine
// ─────────────────────────────────────────────────────────────────────────────

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

// ─── Storage key ─────────────────────────────────────────────────────────────

const STORAGE_KEY = 'analise_v1'

// ─── Spaced-repetition schedule (days) ───────────────────────────────────────
// Pattern from PRD: Day 1 → Day 3 → Day 7 → Day 30 → Day 90
// revisionCount is used as the index; capped at the last interval after that.

const SRS_INTERVALS = [1, 3, 7, 30, 90]

// ─── Domain constants (exported for use in form components) ───────────────────

export const TOPICS = [
  'Arrays',
  'Strings',
  'Linked Lists',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Recursion',
  'Backtracking',
  'Heap',
  'Stack',
  'Queue',
  'Bit Manipulation',
  'Greedy',
  'System Design',
  'Others',
]

export const PLATFORMS = [
  'LeetCode',
  'HackerRank',
  'Codeforces',
  'GeeksforGeeks',
  'CodeChef',
  'InterviewBit',
  'Others',
]

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard']

export const STATUSES = ['Not Started', 'Attempted', 'Solved', 'Needs Revision']

export const FLASHCARD_CATEGORIES = [
  'Operating Systems',
  'DBMS',
  'Computer Networks',
  'OOP',
  'Software Engineering',
  'System Design',
  'HR Questions',
  'Leadership',
  'Teamwork',
  'Conflict Resolution',
  'Resume-Based Questions',
  'Project Questions',
  'Internship Questions',
  'Custom',
]

// ─── Pure helpers (no store dependency) ──────────────────────────────────────

/** YYYY-MM-DD string for today */
const todayStr = () => new Date().toISOString().split('T')[0]

/** YYYY-MM-DD string for N days from now (negative = past) */
function dateOffsetStr(dayOffset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + dayOffset)
  return d.toISOString().split('T')[0]
}

/** Collision-resistant ID */
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

/**
 * Next revision date string using spaced-repetition intervals.
 * @param {number} revisionCount - number of completed correct revisions
 * @param {Date}   [from]        - base date (defaults to today)
 * @returns {string} YYYY-MM-DD
 */
function nextRevisionDate(revisionCount, from = new Date()) {
  const days = SRS_INTERVALS[Math.min(revisionCount, SRS_INTERVALS.length - 1)]
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/** ISO week key, e.g. "2026-W24" — used for weekly analytics */
function isoWeekKey(date) {
  const d = new Date(date)
  // Sunday-based week number
  const jan1 = new Date(d.getFullYear(), 0, 1)
  const weekNo = Math.ceil(((d - jan1) / 86_400_000 + jan1.getDay() + 1) / 7)
  return `${d.getFullYear()}-W${String(weekNo).padStart(2, '0')}`
}

// ─── Default object factories (exported for use in forms / tests) ─────────────

/**
 * Create a blank coding-question object matching the PRD data model.
 * Pass any overrides to pre-fill fields.
 */
export function makeQuestion(overrides = {}) {
  return {
    id: generateId(),
    type: 'coding',
    // Core identity
    title: '',
    platform: '',
    topic: '',
    difficulty: 'Easy',
    problemUrl: '',
    // Progress
    status: 'Not Started',
    // Free-form notes (Question Details page fields)
    notes: '',
    approach: '',
    timeComplexity: '',
    spaceComplexity: '',
    commonMistakes: '',
    alternativeSolutions: '',
    // Revision tracking
    dateAdded: todayStr(),
    dateSolved: null,
    lastRevised: null,
    nextRevision: null,   // set when status → Solved, if revisionMode is ON
    revisionCount: 0,
    reinforcementMode: false,
    // Merge caller overrides last so they win
    ...overrides,
  }
}

/**
 * Create a blank flashcard object matching the PRD data model.
 * Flashcards are always revision-eligible from creation.
 */
export function makeFlashcard(overrides = {}) {
  return {
    id: generateId(),
    type: 'flashcard',
    question: '',
    answer: '',
    category: '',
    difficulty: 'Medium',
    tags: [],               // string[]
    // Revision tracking
    dateCreated: todayStr(),
    lastRevised: null,
    nextRevision: null,     // set immediately when revisionMode is ON
    revisionCount: 0,
    reinforcementMode: false,
    ...overrides,
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useTrackerStore = defineStore('tracker', () => {

  // ── Reactive state ──────────────────────────────────────────────────────────

  /** @type {import('vue').Ref<ReturnType<typeof makeQuestion>[]>} */
  const questions = ref([])

  /** @type {import('vue').Ref<ReturnType<typeof makeFlashcard>[]>} */
  const flashcards = ref([])

  /**
   * Global revision mode.
   * OFF → app works as plain tracker, no scheduling.
   * ON  → revision queue is live, SRS scheduling active.
   */
  const revisionMode = ref(true)

  /** UI theme preference (used by App.vue / Settings) */
  const theme = ref('dark')

  /**
   * Revision event log — enables streak calculation and accuracy stats.
   * Each entry: { date: 'YYYY-MM-DD', itemId: string, itemType: 'coding'|'flashcard', correct: boolean }
   */
  const revisionLog = ref([])

  // ── Persistence ─────────────────────────────────────────────────────────────

  function saveToStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          questions:    questions.value,
          flashcards:   flashcards.value,
          revisionMode: revisionMode.value,
          theme:        theme.value,
          revisionLog:  revisionLog.value,
        })
      )
    } catch (err) {
      console.error('[Analise] localStorage write failed:', err)
    }
  }

  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const data = JSON.parse(raw)
      questions.value    = data.questions    ?? []
      flashcards.value   = data.flashcards   ?? []
      revisionMode.value = data.revisionMode ?? true
      theme.value        = data.theme        ?? 'dark'
      revisionLog.value  = data.revisionLog  ?? []
    } catch (err) {
      console.error('[Analise] localStorage read failed:', err)
    }
  }

  // ── Coding Question CRUD ────────────────────────────────────────────────────

  /**
   * Add a new coding question.
   * If status is already "Solved", immediately schedules the first revision.
   * @param {Partial<ReturnType<typeof makeQuestion>>} fields
   * @returns {ReturnType<typeof makeQuestion>} The saved question
   */
  function addQuestion(fields = {}) {
    const q = makeQuestion(fields)

    // Auto-schedule when added as Solved
    if (q.status === 'Solved') {
      q.dateSolved   = q.dateSolved ?? todayStr()
      if (revisionMode.value) {
        q.nextRevision = nextRevisionDate(q.revisionCount)
      }
    }

    questions.value.push(q)
    saveToStorage()
    return q
  }

  /**
   * Edit an existing coding question by ID.
   * Handles revision scheduling when status transitions to "Solved".
   * @param {string} id
   * @param {Partial<ReturnType<typeof makeQuestion>>} updates
   * @returns {ReturnType<typeof makeQuestion> | null}
   */
  function editQuestion(id, updates = {}) {
    const idx = questions.value.findIndex(q => q.id === id)
    if (idx === -1) return null

    const prev    = questions.value[idx]
    const updated = { ...prev, ...updates }

    // Status just changed to Solved → start revision schedule
    const justSolved = updates.status === 'Solved' && prev.status !== 'Solved'
    if (justSolved) {
      updated.dateSolved = updated.dateSolved ?? todayStr()
      if (revisionMode.value && !updated.nextRevision) {
        updated.nextRevision = nextRevisionDate(updated.revisionCount)
      }
    }

    questions.value[idx] = updated
    saveToStorage()
    return updated
  }

  /**
   * Permanently delete a question by ID.
   * @param {string} id
   */
  function deleteQuestion(id) {
    questions.value = questions.value.filter(q => q.id !== id)
    saveToStorage()
  }

  /**
   * Get a single question by ID.
   * @param {string} id
   * @returns {ReturnType<typeof makeQuestion> | null}
   */
  function getQuestion(id) {
    return questions.value.find(q => q.id === id) ?? null
  }

  // ── Flashcard CRUD ──────────────────────────────────────────────────────────

  /**
   * Add a new flashcard.
   * Flashcards are immediately scheduled for revision when revisionMode is ON.
   * @param {Partial<ReturnType<typeof makeFlashcard>>} fields
   * @returns {ReturnType<typeof makeFlashcard>}
   */
  function addFlashcard(fields = {}) {
    const f = makeFlashcard(fields)

    if (revisionMode.value) {
      f.nextRevision = nextRevisionDate(f.revisionCount)
    }

    flashcards.value.push(f)
    saveToStorage()
    return f
  }

  /**
   * Edit an existing flashcard by ID.
   * @param {string} id
   * @param {Partial<ReturnType<typeof makeFlashcard>>} updates
   * @returns {ReturnType<typeof makeFlashcard> | null}
   */
  function editFlashcard(id, updates = {}) {
    const idx = flashcards.value.findIndex(f => f.id === id)
    if (idx === -1) return null
    flashcards.value[idx] = { ...flashcards.value[idx], ...updates }
    saveToStorage()
    return flashcards.value[idx]
  }

  /**
   * Permanently delete a flashcard by ID.
   * @param {string} id
   */
  function deleteFlashcard(id) {
    flashcards.value = flashcards.value.filter(f => f.id !== id)
    saveToStorage()
  }

  /**
   * Get a single flashcard by ID.
   * @param {string} id
   * @returns {ReturnType<typeof makeFlashcard> | null}
   */
  function getFlashcard(id) {
    return flashcards.value.find(f => f.id === id) ?? null
  }

  // ── Revision Engine ─────────────────────────────────────────────────────────

  /**
   * Record a revision result for a coding question.
   *
   * Correct  → advance SRS count, calculate next revision date, exit reinforcement.
   * Incorrect → enter Reinforcement Mode (daily repetition until correct).
   *
   * @param {string}  id      - Question ID
   * @param {boolean} correct - Whether the user answered correctly
   */
  function markQuestionRevision(id, correct) {
    const idx = questions.value.findIndex(q => q.id === id)
    if (idx === -1) return

    const q   = questions.value[idx]
    const now = todayStr()

    // Append to revision log for streak / accuracy calculations
    revisionLog.value.push({ date: now, itemId: id, itemType: 'coding', correct })

    if (correct) {
      // Coming out of reinforcement: restart from interval 0 so mastery is re-confirmed
      const newCount = q.reinforcementMode ? 0 : q.revisionCount + 1
      questions.value[idx] = {
        ...q,
        lastRevised:       now,
        revisionCount:     newCount,
        nextRevision:      nextRevisionDate(newCount),
        reinforcementMode: false,
        // Restore Solved if it was in Needs Revision
        status: q.status === 'Needs Revision' ? 'Solved' : q.status,
      }
    } else {
      // Enter / stay in Reinforcement Mode — show again tomorrow
      questions.value[idx] = {
        ...q,
        lastRevised:       now,
        nextRevision:      dateOffsetStr(1),  // tomorrow
        reinforcementMode: true,
        status:            'Needs Revision',
      }
    }

    saveToStorage()
  }

  /**
   * Record a revision result for a flashcard.
   * Same Correct / Incorrect logic as coding questions.
   *
   * @param {string}  id
   * @param {boolean} correct
   */
  function markFlashcardRevision(id, correct) {
    const idx = flashcards.value.findIndex(f => f.id === id)
    if (idx === -1) return

    const f   = flashcards.value[idx]
    const now = todayStr()

    revisionLog.value.push({ date: now, itemId: id, itemType: 'flashcard', correct })

    if (correct) {
      const newCount = f.reinforcementMode ? 0 : f.revisionCount + 1
      flashcards.value[idx] = {
        ...f,
        lastRevised:       now,
        revisionCount:     newCount,
        nextRevision:      nextRevisionDate(newCount),
        reinforcementMode: false,
      }
    } else {
      flashcards.value[idx] = {
        ...f,
        lastRevised:       now,
        nextRevision:      dateOffsetStr(1),
        reinforcementMode: true,
      }
    }

    saveToStorage()
  }

  // ── Computed Getters ────────────────────────────────────────────────────────

  /**
   * Revision queue — the single source of truth for what the user needs to revise.
   *
   * Priority order (matches PRD §6.6):
   *   1. Reinforcement items (missed answers, daily)
   *   2. Overdue items (past due date, not in reinforcement)
   *   3. Today's scheduled items
   *
   * Returns empty when revisionMode is OFF.
   */
  const revisionQueue = computed(() => {
    const EMPTY = { reinforcement: [], overdue: [], today: [], all: [], totalCount: 0 }
    if (!revisionMode.value) return EMPTY

    const today = todayStr()

    // Only include questions that are actively being revised
    const revisableQuestions = questions.value.filter(
      q => q.status === 'Solved' || q.status === 'Needs Revision'
    )

    const allItems = [
      ...revisableQuestions,
      ...flashcards.value,
    ].filter(item => item.nextRevision !== null)

    // ── Bucket 1: Reinforcement (missed answers — show daily) ──────────────
    const reinforcement = allItems.filter(
      item => item.reinforcementMode && item.nextRevision <= today
    )

    // ── Bucket 2: Overdue (past due date, normal schedule) ─────────────────
    const overdue = allItems.filter(
      item => !item.reinforcementMode && item.nextRevision < today
    )

    // ── Bucket 3: Due today (normal schedule) ─────────────────────────────
    const todayItems = allItems.filter(
      item => !item.reinforcementMode && item.nextRevision === today
    )

    const all = [...reinforcement, ...overdue, ...todayItems]

    return {
      reinforcement,
      overdue,
      today: todayItems,
      all,
      totalCount: all.length,
    }
  })

  /**
   * Dashboard summary metrics (PRD §6.7).
   * Used by the Dashboard view for at-a-glance stats.
   */
  const dashboardMetrics = computed(() => {
    const q     = questions.value
    const f     = flashcards.value
    const today = todayStr()
    const log   = revisionLog.value

    // Question breakdown
    const totalQuestions       = q.length
    const solved               = q.filter(x => x.status === 'Solved').length
    const attempted            = q.filter(x => x.status === 'Attempted').length
    const pending              = q.filter(x => x.status === 'Not Started').length
    const needsRevision        = q.filter(x => x.status === 'Needs Revision').length
    const completionPercentage = totalQuestions > 0
      ? Math.round((solved / totalQuestions) * 100)
      : 0

    // Flashcard breakdown
    const totalFlashcards    = f.length
    const flashcardsDueToday = f.filter(
      x => x.nextRevision && x.nextRevision <= today
    ).length

    // Reinforcement counts
    const questionsInReinforcement  = q.filter(x => x.reinforcementMode).length
    const flashcardsInReinforcement = f.filter(x => x.reinforcementMode).length
    const itemsInReinforcement      = questionsInReinforcement + flashcardsInReinforcement

    // Revision accuracy (from log)
    const totalRevisions   = log.length
    const correctRevisions = log.filter(r => r.correct).length
    const revisionAccuracy = totalRevisions > 0
      ? Math.round((correctRevisions / totalRevisions) * 100)
      : 0

    return {
      totalQuestions,
      solved,
      attempted,
      pending,
      needsRevision,
      completionPercentage,
      totalFlashcards,
      flashcardsDueToday,
      itemsInReinforcement,
      questionsInReinforcement,
      flashcardsInReinforcement,
      revisionAccuracy,
      totalRevisions,
      correctRevisions,
    }
  })

  /**
   * Analytics data for charts (PRD §6.8).
   * Returns plain objects ready to feed into Chart.js.
   */
  const analyticsData = computed(() => {
    const q = questions.value
    const f = flashcards.value

    // ── Topic distribution (pie chart) ────────────────────────────────────
    const topicDistribution = {}
    q.forEach(item => {
      if (item.topic) topicDistribution[item.topic] = (topicDistribution[item.topic] ?? 0) + 1
    })

    // ── Difficulty distribution (bar chart) ───────────────────────────────
    const difficultyDistribution = { Easy: 0, Medium: 0, Hard: 0 }
    q.forEach(item => {
      if (item.difficulty in difficultyDistribution) difficultyDistribution[item.difficulty]++
    })

    // ── Platform distribution ─────────────────────────────────────────────
    const platformDistribution = {}
    q.forEach(item => {
      if (item.platform)
        platformDistribution[item.platform] = (platformDistribution[item.platform] ?? 0) + 1
    })

    // ── Weak topics — questions in reinforcement or Needs Revision ─────────
    const weakTopics = {}
    q.filter(item => item.reinforcementMode || item.status === 'Needs Revision').forEach(item => {
      if (item.topic) weakTopics[item.topic] = (weakTopics[item.topic] ?? 0) + 1
    })

    // ── Weak flashcard categories ─────────────────────────────────────────
    const weakCategories = {}
    f.filter(item => item.reinforcementMode).forEach(item => {
      if (item.category) weakCategories[item.category] = (weakCategories[item.category] ?? 0) + 1
    })

    // ── Flashcard category distribution ───────────────────────────────────
    const categoryDistribution = {}
    f.forEach(item => {
      if (item.category)
        categoryDistribution[item.category] = (categoryDistribution[item.category] ?? 0) + 1
    })

    // ── Weekly progress — solved per ISO week, last 8 weeks (line chart) ──
    const weeklySolved = buildWeeklySolved(q)

    // ── Status distribution for question list ─────────────────────────────
    const statusDistribution = { 'Not Started': 0, Attempted: 0, Solved: 0, 'Needs Revision': 0 }
    q.forEach(item => {
      if (item.status in statusDistribution) statusDistribution[item.status]++
    })

    return {
      topicDistribution,
      difficultyDistribution,
      platformDistribution,
      statusDistribution,
      weakTopics,
      weakCategories,
      categoryDistribution,
      weeklySolved,
    }
  })

  /**
   * Streak and accuracy stats derived from revisionLog (PRD §6.9).
   */
  const streakData = computed(() => {
    const log = revisionLog.value
    if (log.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalDaysActive: 0 }
    }

    // Unique days with at least one revision, sorted ascending
    const days = [...new Set(log.map(r => r.date))].sort()

    if (days.length === 0)
      return { currentStreak: 0, longestStreak: 0, totalDaysActive: 0 }

    // ── Longest streak ────────────────────────────────────────────────────
    let longestStreak = 1
    let tempStreak    = 1

    for (let i = 1; i < days.length; i++) {
      const gap = _daysBetween(days[i - 1], days[i])
      if (gap === 1) {
        tempStreak++
        if (tempStreak > longestStreak) longestStreak = tempStreak
      } else {
        tempStreak = 1
      }
    }

    // ── Current streak (must end today or yesterday to be alive) ──────────
    const lastDay = days[days.length - 1]
    const today   = todayStr()
    const yesterday = dateOffsetStr(-1)

    let currentStreak = 0
    if (lastDay === today || lastDay === yesterday) {
      currentStreak = 1
      for (let i = days.length - 2; i >= 0; i--) {
        if (_daysBetween(days[i], days[i + 1]) === 1) currentStreak++
        else break
      }
    }

    return { currentStreak, longestStreak, totalDaysActive: days.length }
  })

  // ── Search / Filter helpers ─────────────────────────────────────────────────
  // Synchronous functions for real-time search in components.
  // Called from <script setup> with reactive query refs.

  /**
   * Filter coding questions by any combination of criteria.
   * All params are optional — omit to skip that filter.
   *
   * @param {object} opts
   * @param {string} [opts.query]      - Full-text search across title, topic, platform, notes
   * @param {string} [opts.topic]
   * @param {string} [opts.difficulty]
   * @param {string} [opts.status]
   * @param {string} [opts.platform]
   * @returns {ReturnType<typeof makeQuestion>[]}
   */
  function filterQuestions({ query = '', topic = '', difficulty = '', status = '', platform = '' } = {}) {
    const q = query.trim().toLowerCase()
    return questions.value.filter(item => {
      if (q && !(
        item.title.toLowerCase().includes(q)    ||
        item.topic.toLowerCase().includes(q)    ||
        item.platform.toLowerCase().includes(q) ||
        item.notes.toLowerCase().includes(q)
      )) return false
      if (topic      && item.topic      !== topic)      return false
      if (difficulty && item.difficulty !== difficulty) return false
      if (status     && item.status     !== status)     return false
      if (platform   && item.platform   !== platform)   return false
      return true
    })
  }

  /**
   * Filter flashcards by any combination of criteria.
   *
   * @param {object} opts
   * @param {string} [opts.query]      - Full-text search across question, answer, tags
   * @param {string} [opts.category]
   * @param {string} [opts.difficulty]
   * @returns {ReturnType<typeof makeFlashcard>[]}
   */
  function filterFlashcards({ query = '', category = '', difficulty = '' } = {}) {
    const q = query.trim().toLowerCase()
    return flashcards.value.filter(item => {
      if (q && !(
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q)   ||
        item.tags.some(t => t.toLowerCase().includes(q))
      )) return false
      if (category   && item.category   !== category)   return false
      if (difficulty && item.difficulty !== difficulty) return false
      return true
    })
  }

  // ── Settings actions ────────────────────────────────────────────────────────

  /**
   * Toggle the global revision mode ON / OFF.
   * Turning ON schedules any items that don't yet have a nextRevision date.
   */
  function toggleRevisionMode() {
    revisionMode.value = !revisionMode.value

    if (revisionMode.value) {
      // Schedule previously un-scheduled solved questions
      questions.value = questions.value.map(q => {
        if ((q.status === 'Solved' || q.status === 'Needs Revision') && !q.nextRevision) {
          return { ...q, nextRevision: nextRevisionDate(q.revisionCount) }
        }
        return q
      })
      // Schedule previously un-scheduled flashcards
      flashcards.value = flashcards.value.map(f => {
        if (!f.nextRevision) {
          return { ...f, nextRevision: nextRevisionDate(f.revisionCount) }
        }
        return f
      })
    }

    saveToStorage()
  }

  /** Set UI theme and persist. */
  function setTheme(newTheme) {
    theme.value = newTheme
    saveToStorage()
  }

  /** Wipe all data — requires confirmation in the UI before calling. */
  function resetAllData() {
    questions.value    = []
    flashcards.value   = []
    revisionLog.value  = []
    revisionMode.value = true
    saveToStorage()
  }

  /**
   * Export all data as a formatted JSON string.
   * @returns {string} JSON string (pretty-printed)
   */
  function exportData() {
    return JSON.stringify(
      {
        questions:    questions.value,
        flashcards:   flashcards.value,
        revisionLog:  revisionLog.value,
        revisionMode: revisionMode.value,
        theme:        theme.value,
        exportedAt:   new Date().toISOString(),
        version:      '1.0',
      },
      null,
      2
    )
  }

  /**
   * Import data from a JSON string (produced by exportData or manual backup).
   * @param {string} jsonString
   * @returns {{ success: boolean, error?: string }}
   */
  function importData(jsonString) {
    try {
      const data = JSON.parse(jsonString)
      if (Array.isArray(data.questions))                   questions.value    = data.questions
      if (Array.isArray(data.flashcards))                  flashcards.value   = data.flashcards
      if (Array.isArray(data.revisionLog))                 revisionLog.value  = data.revisionLog
      if (typeof data.revisionMode === 'boolean')          revisionMode.value = data.revisionMode
      if (typeof data.theme === 'string')                  theme.value        = data.theme
      saveToStorage()
      return { success: true }
    } catch (err) {
      console.error('[Analise] Import failed:', err)
      return { success: false, error: err.message }
    }
  }

  // ── Private helpers ─────────────────────────────────────────────────────────

  /** Days between two YYYY-MM-DD strings (b − a) */
  function _daysBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86_400_000)
  }

  /**
   * Build a week-keyed map of how many questions were solved per week
   * for the last 8 weeks. Used by the weekly-progress line chart.
   * @param {ReturnType<typeof makeQuestion>[]} qs
   * @returns {Record<string, number>} e.g. { '2026-W23': 4, '2026-W24': 7 }
   */
  function buildWeeklySolved(qs) {
    const weeks = {}
    // Pre-fill last 8 weeks with 0 so the chart always has a full x-axis
    for (let i = 7; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i * 7)
      weeks[isoWeekKey(d)] = 0
    }
    qs
      .filter(q => q.status === 'Solved' && q.dateSolved)
      .forEach(q => {
        const key = isoWeekKey(new Date(q.dateSolved))
        if (key in weeks) weeks[key]++
      })
    return weeks
  }

  // ── Initialise ──────────────────────────────────────────────────────────────

  loadFromStorage()

  // ── Public API ──────────────────────────────────────────────────────────────

  return {
    // ── Raw state (readable by components; prefer computed for derived data) ──
    questions,
    flashcards,
    revisionMode,
    theme,
    revisionLog,

    // ── Question CRUD ─────────────────────────────────────────────────────────
    addQuestion,
    editQuestion,
    deleteQuestion,
    getQuestion,

    // ── Flashcard CRUD ────────────────────────────────────────────────────────
    addFlashcard,
    editFlashcard,
    deleteFlashcard,
    getFlashcard,

    // ── Revision engine ───────────────────────────────────────────────────────
    markQuestionRevision,
    markFlashcardRevision,

    // ── Search / filter ───────────────────────────────────────────────────────
    filterQuestions,
    filterFlashcards,

    // ── Computed / derived ────────────────────────────────────────────────────
    revisionQueue,
    dashboardMetrics,
    analyticsData,
    streakData,

    // ── Settings ──────────────────────────────────────────────────────────────
    toggleRevisionMode,
    setTheme,
    resetAllData,
    exportData,
    importData,

    // ── Factory re-exports (handy for form components) ────────────────────────
    makeQuestion,
    makeFlashcard,

    // ── Storage (useful in edge cases like service-worker sync) ───────────────
    saveToStorage,
    loadFromStorage,
  }
})