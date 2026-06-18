<template>
  <div class="min-h-screen text-[var(--sd-txt)] relative">
    
    <!-- 1. SONDAVEN-STYLE HERO SPLASH -->
    <!-- Changed from 'sticky' to 'fixed inset-0' so it locks to the window background -->
    <div v-if="currentView === 'home'" class="h-screen w-full flex flex-col items-center justify-center fixed inset-0 -z-10 overflow-hidden bg-[var(--sd-bg)]">
      
      <!-- Massive Typography with Scroll Parallax Binding -->
      <h1 
        class="sd-serif text-[18vw] leading-none tracking-tighter flex items-center z-10"
        :style="{ 
          transform: `translateY(${scrollY * 0.35}px) scale(${1 + scrollY * 0.0005})`, 
          opacity: 1 - scrollY / 700 
        }"
      >
        <span class="text-[var(--sd-txt)]">ANA</span>
        <em class="italic text-[var(--sd-gold)] pr-4">LISE.</em>
      </h1>

      <!-- Minimalist Scroll Indicator -->
      <div 
        class="absolute bottom-12 flex flex-col items-center gap-4 transition-opacity duration-300"
        :style="{ opacity: 1 - scrollY / 200 }"
      >
        <div class="h-12 w-[1px] bg-gradient-to-b from-[var(--sd-gold)] to-transparent"></div>
        <span class="text-[9px] tracking-[0.4em] text-[var(--sd-muted)] uppercase font-semibold">Begin Session</span>
      </div>
    </div>

    <!-- 2. MAIN APPLICATION WORKSPACE -->
    <!-- Added a dynamic class binding: `mt-[100vh]` pushes this entire block below the hero screen -->
    <main 
      :class="[
        'bg-[var(--sd-bg)] z-10 relative px-6 py-12 md:px-16 lg:px-24 min-h-screen animate-fade shadow-[0_-20px_50px_rgba(19,17,14,1)]',
        currentView === 'home' ? 'mt-[100vh]' : 'mt-0'
      ]"
    >
      <!-- Navigation Branding Strip -->
      <nav class="flex justify-between items-center border-b border-[var(--sd-border)] pb-6 mb-12">
        <h1 class="sd-serif text-3xl tracking-tight cursor-pointer hover:text-[var(--sd-gold)] transition" @click="routeToView({ deckId: null, mode: 'home' })">
          ANALISE <span class="text-[9px] font-sans tracking-[0.2em] text-[var(--sd-muted)] block uppercase font-bold mt-1">Flashcard Engine</span>
        </h1>
        <div class="text-[10px] tracking-widest text-[var(--sd-muted)] uppercase font-semibold hidden md:block">
          Modern Ethnic Study System // 2026
        </div>
      </nav>

      <!-- Viewport Switches -->
      <div class="transition-all duration-500">
        
        <!-- HOME DECK SELECTION HUB -->
        <div v-if="currentView === 'home'">
          <div class="max-w-2xl mb-14">
            <h2 class="sd-serif text-4xl md:text-5xl text-[var(--sd-txt)] leading-tight mb-6">
              Master your <em class="italic text-[var(--sd-gold)]">Interviews.</em>
            </h2>
            <p class="text-[var(--sd-muted)] text-sm md:text-base leading-relaxed max-w-lg">
              A minimalist workspace leveraging targeted tracking intervals to build permanent comprehension paths. 
              Build collections, commit core concepts, and run daily evaluation cycles.
            </p>
          </div>
          <DeckGrid @select-deck="routeToView" />
        </div>

        <!-- MANAGE INDIVIDUAL DECK CARD CATALOG -->
        <CardStudio v-else-if="currentView === 'manage'" :deckId="activeDeckId" @go-home="routeToView({ deckId: null, mode: 'home' })" />

        <!-- ACTIVE SPACED REPETITION STUDY RUNNER -->
        <RevisionEngine v-else-if="currentView === 'study'" :deckId="activeDeckId" @exit="routeToView({ deckId: null, mode: 'home' })" />
      
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import DeckGrid from './components/DeckGrid.vue'
import CardStudio from './components/CardStudio.vue'
import RevisionEngine from './components/RevisionEngine.vue'

// -- Routing State --
const currentView = ref('home')
const activeDeckId = ref(null)

function routeToView({ deckId, mode }) {
  activeDeckId.value = deckId
  currentView.value = mode
  // Scroll to top of the workspace when changing views
  window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })
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
/* Micro fade translation animation wrapper */
.animate-fade {
  animation: sdFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes sdFade {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Ensure smooth scrolling across the entire document */
html {
  scroll-behavior: smooth;
}
</style>