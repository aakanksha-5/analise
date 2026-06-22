import { defineStore } from 'pinia'

export const useFlashStore = defineStore('flashStore', {
  state: () => {
    // Load statistics from localStorage to persist streaks & retention
    const savedStats = JSON.parse(localStorage.getItem('sd_stats')) || {
      streakDays: 0,
      totalReviews: 0,
      correctReviews: 0,
      lastStudyDate: null
    }

    return {
      decks: JSON.parse(localStorage.getItem('sd_decks')) || [
        {
          id: 'sys-design',
          name: 'System Design Frameworks',
          cards: [
            { id: 1, question: 'How does a Consistent Hashing ring prevent hot-spotting?', answer: 'By leveraging virtual nodes distributed evenly across the key hash ring space.', topic: 'Caching', difficulty: 'Hard', nextReviewDate: new Date().toISOString(), intervalStep: 0, interval: 0, reinforcementMode: false }
          ]
        }
      ],
      streakDays: savedStats.streakDays,
      totalReviews: savedStats.totalReviews,
      correctReviews: savedStats.correctReviews,
      lastStudyDate: savedStats.lastStudyDate
    }
  },
  
  actions: {
    save() {
      // Save decks
      localStorage.setItem('sd_decks', JSON.stringify(this.decks))
      
      // Save global user statistics
      localStorage.setItem('sd_stats', JSON.stringify({
        streakDays: this.streakDays,
        totalReviews: this.totalReviews,
        correctReviews: this.correctReviews,
        lastStudyDate: this.lastStudyDate
      }))
    },
    
    createDeck(name) {
      this.decks.push({ id: 'deck-' + Date.now(), name, cards: [] })
      this.save()
    },
    
    deleteDeck(deckId) {
      this.decks = this.decks.filter(d => d.id !== deckId)
      this.save()
    },
    
    addCard(deckId, cardData) {
      const deck = this.decks.find(d => d.id === deckId)
      if (deck) {
        deck.cards.push({
          id: 'card-' + Date.now(),
          ...cardData,
          nextReviewDate: new Date().toISOString(),
          intervalStep: 0,
          interval: 0, // Used for 'Cards Mastered' calculation
          reinforcementMode: false
        })
        this.save()
      }
    },
    
    updateCard(deckId, cardId, updatedFields) {
      const deck = this.decks.find(d => d.id === deckId)
      if (deck) {
        const card = deck.cards.find(c => c.id === cardId)
        if (card) {
          Object.assign(card, updatedFields)
          this.save()
        }
      }
    },
    
    deleteCard(deckId, cardId) {
      const deck = this.decks.find(d => d.id === deckId)
      if (deck) {
        deck.cards = deck.cards.filter(c => c.id !== cardId)
        this.save()
      }
    },
    
    processReview(deckId, cardId, isCorrect) {
      const deck = this.decks.find(d => d.id === deckId)
      if (!deck) return
      const card = deck.cards.find(c => c.id === cardId)
      if (!card) return

      // --- 1. Global Analytics Updates ---
      this.totalReviews++
      if (isCorrect) this.correctReviews++

      // --- 2. Streak Logic Calculation ---
      const today = new Date().toDateString() // e.g., "Mon Jun 22 2026"
      
      if (this.lastStudyDate !== today) {
        if (this.lastStudyDate) {
          const lastDate = new Date(this.lastStudyDate)
          const yesterday = new Date()
          yesterday.setDate(yesterday.getDate() - 1)

          // If the last study date was exactly yesterday, increment. Otherwise, reset to 1.
          if (lastDate.toDateString() === yesterday.toDateString()) {
            this.streakDays++
          } else {
            this.streakDays = 1
          }
        } else {
          this.streakDays = 1 // Very first time studying
        }
        this.lastStudyDate = today
      }

      // --- 3. Spaced Repetition Logic ---
      if (isCorrect) {
        // Step forward on intervals: Day 1 -> 3 -> 7 -> 30 -> 90
        const intervals = [1, 3, 7, 30, 90]
        const step = Math.min(card.intervalStep || 0, intervals.length - 1)
        const targetDays = intervals[step]
        
        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + targetDays)
        
        card.nextReviewDate = nextDate.toISOString()
        card.intervalStep = step + 1
        card.interval = targetDays // Save exact days so App.vue can check if it's >= 21 (Mastered)
        card.reinforcementMode = false
      } else {
        // Failed - lock inside reinforcement sequence (triggers daily re-reviews)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        card.nextReviewDate = tomorrow.toISOString()
        card.intervalStep = 0
        card.interval = 1 // Reset mastery check
        card.reinforcementMode = true
      }
      
      this.save()
    }
  }
})