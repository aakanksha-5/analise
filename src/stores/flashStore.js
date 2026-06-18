import { defineStore } from 'pinia'

export const useFlashStore = defineStore('flashStore', {
  state: () => ({
    decks: JSON.parse(localStorage.getItem('sd_decks')) || [
      {
        id: 'sys-design',
        name: 'System Design Frameworks',
        cards: [
          { id: 1, question: 'How does a Consistent Hashing ring prevent hot-spotting?', answer: 'By leveraging virtual nodes distributed evenly across the key hash ring space.', topic: 'Caching', difficulty: 'Hard', nextReviewDate: new Date().toISOString(), intervalStep: 0, reinforcementMode: false }
        ]
      }
    ]
  }),
  actions: {
    save() {
      localStorage.setItem('sd_decks', JSON.stringify(this.decks))
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

      if (isCorrect) {
        // Step forward on intervals: Day 1 -> 3 -> 7 -> 30 -> 90
        const intervals = [1, 3, 7, 30, 90]
        const step = Math.min(card.intervalStep || 0, intervals.length - 1)
        const targetDays = intervals[step]
        
        const nextDate = new Date()
        nextDate.setDate(nextDate.getDate() + targetDays)
        
        card.nextReviewDate = nextDate.toISOString()
        card.intervalStep = step + 1
        card.reinforcementMode = false
      } else {
        // Failed - lock inside reinforcement sequence (triggers daily re-reviews)
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        card.nextReviewDate = tomorrow.toISOString()
        card.intervalStep = 0
        card.reinforcementMode = true
      }
      this.save()
    }
  }
})
