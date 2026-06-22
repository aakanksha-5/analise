<template>
  <div class="max-w-2xl mx-auto text-center py-12">
    <div class="flex justify-between items-center mb-10">
      <span class="text-xs uppercase tracking-widest text-[var(--sd-muted)]">Active Session: {{ currentIdx + 1 }} / {{ queue.length }}</span>
      <button @click="$emit('exit')" class="text-xs uppercase tracking-widest text-red-400 hover:underline">Exit Session</button>
    </div>

    <div v-if="queue.length === 0" class="p-12 bg-[var(--sd-surface)] border border-[var(--sd-border)]">
      <h3 class="sd-serif text-3xl mb-4 text-[var(--sd-gold)]">All Caught Up!</h3>
      <p class="text-[var(--sd-muted)] text-sm mb-6">No cards are currently scheduled for review in this collection today.</p>
      <button @click="$emit('exit')" class="sd-btn fill">Return Home</button>
    </div>

    <div v-else-if="currentCard" class="space-y-6">
      <!-- Flashcard Layer Layout -->
      <div class="min-h-[300px] bg-[var(--sd-panel)] border border-[var(--sd-border)] p-10 flex flex-col justify-between text-left relative">
        <div class="absolute top-4 right-4 text-[9px] bg-[var(--sd-gold-dim)] text-[var(--sd-gold)] px-3 py-1 uppercase tracking-wider font-bold">
          {{ currentCard.difficulty }}
        </div>
        
        <div>
          <span class="text-[10px] text-[var(--sd-muted)] tracking-widest uppercase block mb-2">{{ currentCard.topic }}</span>
          <h2 class="text-xl md:text-2xl font-medium text-[var(--sd-txt)] leading-relaxed">{{ currentCard.question }}</h2>
        </div>

        <div v-if="revealed" class="mt-8 pt-8 border-t border-[var(--sd-border)] transition-all">
          <span class="text-[10px] text-[var(--sd-gold)] tracking-widest uppercase block mb-2">Verification Metric</span>
          <p class="text-[var(--sd-txt)] whitespace-pre-wrap leading-relaxed">{{ currentCard.answer }}</p>
        </div>

        <div v-else class="mt-8 text-center">
          <button @click="revealed = true" class="w-full py-4 border border-dashed border-[var(--sd-border)] text-xs uppercase tracking-widest text-[var(--sd-muted)] hover:text-[var(--sd-gold)] hover:border-[var(--sd-gold)] transition">
            Reveal Answer
          </button>
        </div>
      </div>

      <!-- Action Response Modifiers -->
      <div v-if="revealed" class="flex gap-4 pt-4">
        <button @click="submitScore(false)" class="flex-1 py-4 bg-red-950/40 border border-red-900/60 text-red-400 text-xs uppercase tracking-widest font-bold hover:bg-red-900/40 transition">
          Wrong (Daily Review)
        </button>
        <button @click="submitScore(true)" class="flex-1 py-4 bg-green-950/40 border border-green-900/60 text-green-400 text-xs uppercase tracking-widest font-bold hover:bg-green-900/40 transition">
          Correct (Advance Space)
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useFlashStore } from '../stores/flashStore'

const props = defineProps(['deckId'])
const emit = defineEmits(['exit'])
const store = useFlashStore()
const deck = store.decks.find(d => d.id === props.deckId)

// Pull due cards and completely randomize their sequence order arrays
const queue = ref(
  (deck?.cards || [])
    .filter(c => new Date(c.nextReviewDate) <= new Date())
    .sort(() => Math.random() - 0.5)
)

const currentIdx = ref(0)
const revealed = ref(false)
const currentCard = computed(() => queue.value[currentIdx.value] || null)

function submitScore(isCorrect) {
  store.processReview(props.deckId, currentCard.value.id, isCorrect)
  revealed.value = false
  
  if (currentIdx.value + 1 < queue.value.length) {
    currentIdx.value++
  } else {
    alert('Session Completed!')
    emit('exit')
  }
}
</script>