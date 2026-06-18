<template>
  <div class="max-w-4xl mx-auto">
    <button @click="$emit('go-home')" class="mb-6 text-xs uppercase tracking-widest text-[var(--sd-muted)] hover:text-[var(--sd-gold)] transition">← Back to Collections</button>
    
    <div class="bg-[var(--sd-surface)] p-8 border border-[var(--sd-border)] mb-8">
      <h3 class="sd-serif text-2xl mb-6">{{ editingCardId ? 'Modify Concept' : 'Add New Flashcard Element' }}</h3>
      <form @submit.prevent="saveCard" class="space-y-4">
        <input v-model="form.question" required class="sd-input" placeholder="Question or Code Snippet Front...">
        <textarea v-model="form.answer" required class="sd-input h-28" placeholder="Answer Breakdown Details..."></textarea>
        <div class="grid grid-cols-2 gap-4">
          <input v-model="form.topic" required class="sd-input" placeholder="Topic Tag (e.g. Arrays)">
          <select v-model="form.difficulty" class="sd-input">
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
        <div class="flex gap-4 pt-4">
          <button type="submit" class="sd-btn fill">{{ editingCardId ? 'Save Edits' : 'Commit Card' }}</button>
          <button type="button" @click="resetForm" class="sd-btn">Cancel</button>
        </div>
      </form>
    </div>

    <!-- Active List -->
    <h4 class="sd-serif text-xl mb-4">Deck Catalog Structure ({{ deck.cards.length }})</h4>
    <div class="space-y-3">
      <div v-for="card in deck.cards" :key="card.id" class="p-6 bg-[var(--sd-surface)] border border-[var(--sd-border)] flex justify-between items-center">
        <div>
          <div class="text-sm font-semibold mb-1 text-[var(--sd-txt)]">{{ card.question }}</div>
          <div class="text-xs text-[var(--sd-muted)]">{{ card.topic }} · Tier: {{ card.difficulty }}</div>
        </div>
        <div class="flex gap-4 text-xs">
          <button @click="startEdit(card)" class="text-[var(--sd-gold)] hover:underline">Modify</button>
          <button @click="store.deleteCard(deck.id, card.id)" class="text-red-400 hover:underline">Remove</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useFlashStore } from '../stores/flashStore'

const props = defineProps(['deckId'])
const emit = defineEmits(['go-home'])
const store = useFlashStore()
const deck = store.decks.find(d => d.id === props.deckId)

const editingCardId = ref(null)
const form = reactive({ question: '', answer: '', topic: '', difficulty: 'Easy' })

function saveCard() {
  if (editingCardId.value) {
    store.updateCard(props.deckId, editingCardId.value, { ...form })
  } else {
    store.addCard(props.deckId, { ...form })
  }
  resetForm()
}

function startEdit(card) {
  editingCardId.value = card.id
  Object.assign(form, { question: card.question, answer: card.answer, topic: card.topic, difficulty: card.difficulty })
}

function resetForm() {
  editingCardId.value = null
  Object.assign(form, { question: '', answer: '', topic: '', difficulty: 'Easy' })
}
</script>