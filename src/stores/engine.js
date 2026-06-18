import { defineStore } from 'pinia'
import { useTrackerStore } from './tracker'

export const useEngineStore = defineStore('engine', {
  state: () => ({
    // The standard spaced repetition interval pattern (in days)
    spacedIntervals: [1, 3, 7, 30, 90]
  }),
  
  actions: {
    /**
     * Core Spaced Repetition Scheduling Algorithm
     * @param {Object} item - The question or flashcard object from tracker.js
     * @param {boolean} isCorrect - User's self-reported result
     */
    processReview(item, isCorrect) {
      const trackerStore = useTrackerStore()
      
      // 1. Ensure the item has the necessary tracking properties
      if (item.revisionCount === undefined) item.revisionCount = 0
      if (item.reinforcementMode === undefined) item.reinforcementMode = false
      
      const now = new Date()
      let daysToAdd = 1

      // 2. Calculate the next interval based on the user's performance
      if (isCorrect) {
        // Answered Correctly: Turn off reinforcement mode if it was active
        item.reinforcementMode = false
        
        // Find the next interval based on current streak (max out at 90 days/index 4)
        const intervalIndex = Math.min(item.revisionCount, this.spacedIntervals.length - 1)
        daysToAdd = this.spacedIntervals[intervalIndex]
        
        // Increment successful consecutive revision count
        item.revisionCount++
      } else {
        // Answered Incorrectly: Trigger Reinforcement Mode
        item.reinforcementMode = true
        
        // Reset the revision sequence (or hold it steady) and force a daily review
        item.revisionCount = 0 
        daysToAdd = 1
      }

      // 3. Apply the calculated days to the current timestamp
      const nextDate = new Date(now)
      nextDate.setDate(now.getDate() + daysToAdd)
      item.nextRevisionDate = nextDate.toISOString()
      
      // 4. Force the tracker store to update localStorage with the new dates
      trackerStore.saveState()
    }
  }
})