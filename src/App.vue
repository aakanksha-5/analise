<template>
  <div class="min-h-screen text-[var(--sd-txt)] relative">
    
    <!-- 1. SONDAVEN-STYLE HERO SPLASH -->
    <div v-if="currentView === 'home' && !hasSeenIntro" class="h-screen w-full flex flex-col items-center justify-center fixed inset-0 -z-10 overflow-hidden bg-[var(--sd-bg)]">
      
      <h1 
        class="sd-serif text-[18vw] leading-none tracking-tighter flex items-center z-10"
        :style="{ 
          transform: `translateY(${scrollY * 0.35}px) scale(${1 + scrollY * 0.0005})`, 
          opacity: 1 - scrollY / 700 
        }"
      >
        <span class="text-[var(--sd-txt)]">ANA</span>
        <em class="italic text-[var(--sd-gold)] pr-4">LISE</em>
      </h1>

      <div 
        class="absolute bottom-12 flex flex-col items-center gap-4 transition-opacity duration-300"
        :style="{ opacity: 1 - scrollY / 200 }"
      >
        <div class="h-12 w-[1px] bg-gradient-to-b from-[var(--sd-gold)] to-transparent"></div>
        <span class="text-[9px] tracking-[0.4em] text-[var(--sd-muted)] uppercase font-semibold">Begin Session</span>
      </div>
    </div>

    <!-- 2. MAIN APPLICATION WORKSPACE -->
    <main 
      :class="[
        'bg-[var(--sd-bg)] z-10 relative px-6 py-12 md:px-16 lg:px-24 min-h-screen animate-fade shadow-[0_-20px_50px_rgba(19,17,14,1)]',
        (currentView === 'home' && !hasSeenIntro) ? 'mt-[100vh]' : 'mt-0'
      ]"
    >
      <!-- Navigation Branding Strip -->
      <nav class="flex justify-between items-center border-b border-[var(--sd-border)] pb-6 mb-12">
        <h1 class="sd-serif text-3xl tracking-tight cursor-pointer hover:text-[var(--sd-gold)] transition" @click="routeToView({ deckId: null, mode: 'home' })">
          ANALISE <span class="text-[9px] font-sans tracking-[0.2em] text-[var(--sd-muted)] block uppercase font-bold mt-1">Flashcard Engine</span>
        </h1>
        
        <!-- Top Nav Streak Indicator -->
        <div class="hidden md:flex items-center gap-6">
          <div class="flex items-center gap-2 text-[var(--sd-gold)]">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path></svg>
            <span class="text-xs font-bold tracking-wider">{{ streakDays }} Day Streak</span>
          </div>
          <div class="text-[10px] tracking-widest text-[var(--sd-muted)] uppercase font-semibold">
            Modern Study System // 2026
          </div>
        </div>
      </nav>

      <!-- Viewport Switches -->
      <div class="transition-all duration-500">
        
        <!-- HOME DECK SELECTION HUB -->
        <div v-if="currentView === 'home'">
          
          <div class="flex flex-col lg:flex-row gap-12 justify-between mb-16 mt-4">
            <!-- Clean text intro -->
            <div class="max-w-xl">
              <h2 class="sd-serif text-4xl md:text-5xl text-[var(--sd-txt)] leading-tight mb-6">
                Master your <em class="italic text-[var(--sd-gold)]">Interviews.</em>
              </h2>
              <p class="text-[var(--sd-muted)] text-sm md:text-base leading-relaxed">
                A minimalist flashcard platform built to help you prepare for any interview. 
                Organize key concepts, manage custom decks, and review critical material to build confidence and sharp communication.
              </p>
            </div>

            <!-- Performance Analysis / Streak Stats -->
            <div class="grid grid-cols-2 gap-4 lg:w-[450px] shrink-0">
              <div class="bg-[var(--sd-surface)] border border-[var(--sd-border)] hover:border-[var(--sd-gold)] transition-colors p-5">
                <div class="text-[9px] uppercase tracking-widest text-[var(--sd-muted)] mb-3">Active Streak</div>
                <div class="text-3xl sd-serif text-[var(--sd-gold)] flex items-center gap-2">
                  <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"></path></svg>
                  {{ streakDays }}
                </div>
              </div>
              <div class="bg-[var(--sd-surface)] border border-[var(--sd-border)] hover:border-[var(--sd-gold)] transition-colors p-5">
                <div class="text-[9px] uppercase tracking-widest text-[var(--sd-muted)] mb-3">Cards Mastered</div>
                <div class="text-3xl sd-serif text-[var(--sd-txt)]">{{ cardsMastered }}</div>
              </div>
              <div class="bg-[var(--sd-surface)] border border-[var(--sd-border)] hover:border-[var(--sd-gold)] transition-colors p-5">
                <div class="text-[9px] uppercase tracking-widest text-[var(--sd-muted)] mb-3">Retention Rate</div>
                <div class="text-3xl sd-serif text-[var(--sd-txt)]">{{ retentionRate }}%</div>
              </div>
              <div class="bg-[var(--sd-surface)] border border-[var(--sd-border)] hover:border-[var(--sd-gold)] transition-colors p-5">
                <div class="text-[9px] uppercase tracking-widest text-[var(--sd-muted)] mb-3">Pending Reviews</div>
                <div class="text-3xl sd-serif text-[var(--sd-txt)]">{{ pendingReviews }}</div>
              </div>
            </div>
          </div>

          <DeckGrid @select-deck="routeToView" />
        </div>

        <CardStudio v-else-if="currentView === 'manage'" :deckId="activeDeckId" @go-home="routeToView({ deckId: null, mode: 'home' })" />

        <RevisionEngine v-else-if="currentView === 'study'" :deckId="activeDeckId" @exit="routeToView({ deckId: null, mode: 'home' })" />
      
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useFlashStore } from './stores/flashStore'
import DeckGrid from './components/DeckGrid.vue'
import CardStudio from './components/CardStudio.vue'
import RevisionEngine from './components/RevisionEngine.vue'

const store = useFlashStore()

// --- REAL-TIME CALCULATIONS (ROBUST PARSING) ---

// 1. Streak 
const streakDays = computed(() => store.streakDays || 0)

// 2. Cards Mastered (Fallback to intervalStep if interval is missing)
const cardsMastered = computed(() => {
  let count = 0
  if (!store.decks) return 0
  
  store.decks.forEach(deck => {
    if (deck.cards) {
      deck.cards.forEach(card => {
        // Mastered if interval is high OR if they reached step 3+ (7-30+ days)
        if (card.interval >= 21 || card.intervalStep >= 3 || card.isMastered) {
          count++
        }
      })
    }
  })
  return count
})

// 3. Pending Reviews (Safely handles string dates)
const pendingReviews = computed(() => {
  let count = 0
  const now = Date.now()
  if (!store.decks) return 0

  store.decks.forEach(deck => {
    if (deck.cards) {
      deck.cards.forEach(card => {
        if (!card.nextReviewDate) {
          count++
        } else {
          const reviewTime = Date.parse(card.nextReviewDate)
          if (isNaN(reviewTime) || reviewTime <= now) {
            count++
          }
        }
      })
    }
  })
  return count
})

// 4. Retention Rate
const retentionRate = computed(() => {
  const total = store.totalReviews || 0
  const correct = store.correctReviews || 0
  if (total === 0) return 0 
  return Math.round((correct / total) * 100)
})


// -- Routing & UI State --
const currentView = ref('home')
const activeDeckId = ref(null)
const hasSeenIntro = ref(false)

function routeToView({ deckId, mode }) {
  activeDeckId.value = deckId
  currentView.value = mode
  
  if (mode !== 'home') {
    hasSeenIntro.value = true 
    window.scrollTo({ top: 0, behavior: 'instant' })
  } else {
    nextTick(() => {
      window.scrollTo({ top: 0, behavior: 'instant' })
    })
  }
}

// -- Parallax Scroll Logic --
const scrollY = ref(0)

function handleScroll() {
  scrollY.value = window.scrollY
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style>
.animate-fade {
  animation: sdFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes sdFade {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>