<template>
  <div>
    <div class="flex justify-between items-center mb-10">
      <h2 class="sd-serif text-4xl text-[var(--sd-txt)]">Your Study <em class="italic text-[var(--sd-gold)]">Collections.</em></h2>
      <button @click="promptNewDeck" class="sd-btn fill">New Deck</button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="deck in store.decks" :key="deck.id" class="sd-interactive-card p-8 flex flex-col justify-between min-h-[220px]">
        <div>
          <div class="text-[var(--sd-muted)] text-[10px] tracking-widest uppercase mb-2">{{ deck.cards.length }} Cards Added</div>
          <h3 class="sd-serif text-2xl mb-4 text-[var(--sd-txt)]">{{ deck.name }}</h3>
        </div>
        <div class="flex gap-3 pt-6 border-t border-[var(--sd-border)] z-10">
          <button @click="$emit('select-deck', { deckId: deck.id, mode: 'manage' })" class="text-[11px] uppercase tracking-wider text-[var(--sd-muted)] hover:text-[var(--sd-gold)] transition">Questions</button>
          <span class="text-[var(--sd-border)]">/</span>
          <button @click="$emit('select-deck', { deckId: deck.id, mode: 'study' })" class="text-[11px] uppercase tracking-wider text-[var(--sd-gold)] hover:text-white transition font-bold">Start</button>
          <span class="text-[var(--sd-border)]">/</span>
          <button @click="store.deleteDeck(deck.id)" class="text-[11px] uppercase tracking-wider text-red-400/60 hover:text-red-400 transition ml-auto">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useFlashStore } from '../stores/flashStore'
const store = useFlashStore()
defineEmits(['select-deck'])

function promptNewDeck() {
  const name = prompt('Enter a title for your custom flashcard deck:')
  if (name && name.trim()) store.createDeck(name.trim())
}
</script>