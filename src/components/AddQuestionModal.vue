<template>
  <div class="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#0c0a08]/70 backdrop-blur-sm mfade">
    
    <div class="mbody border border-[var(--b0)] p-8 rounded-[var(--r)] w-full max-w-lg shadow-2xl">
      
      <div class="flex items-center gap-2 mb-6">
        <span class="dot" style="background:var(--gd); width: 6px; height: 6px;"></span>
        <h2 class="mtitle">Add New Question</h2>
      </div>
      
      <form @submit.prevent="submitQuestion" class="space-y-5">
        <div>
          <label class="mlbl">Problem Title</label>
          <input v-model="form.title" required type="text" class="minp" placeholder="e.g. Two Sum">
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="mlbl">Platform</label>
            <div class="sel-wrapper">
              <select v-model="form.platform" class="minp msel">
                <option v-for="p in platforms" :key="p" :value="p">{{ p }}</option>
              </select>
            </div>
          </div>
          <div>
            <label class="mlbl">Topic</label>
            <div class="sel-wrapper">
              <select v-model="form.topic" class="minp msel">
                <option v-for="t in topics" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          <label class="mlbl" style="margin-bottom: 8px;">Difficulty</label>
          <div class="flex gap-2">
            <button v-for="d in difficulties" :key="d" type="button" 
              @click="form.difficulty = d"
              :class="[getDiffClass(d), form.difficulty === d ? 'active-pill' : '']"
              class="mpill">
              {{ d }}
            </button>
          </div>
        </div>

        <div>
          <label class="mlbl">Problem URL</label>
          <input v-model="form.url" type="url" class="minp" placeholder="https://leetcode.com/...">
        </div>

        <div class="flex gap-3 pt-4">
          <button type="button" @click="$emit('close')" class="mbtn secondary">Cancel</button>
          <button type="submit" class="mbtn primary">Add Question</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useTrackerStore, TOPICS, PLATFORMS, DIFFICULTIES } from '../stores/tracker'

const emit = defineEmits(['close'])
const store = useTrackerStore()

const topics = TOPICS
const platforms = PLATFORMS
const difficulties = DIFFICULTIES

const form = reactive({
  title: '',
  platform: 'LeetCode',
  topic: 'Arrays',
  difficulty: 'Easy',
  status: 'Not Started'
})

function getDiffClass(diff) {
  if (diff === 'Easy') return 'be'
  if (diff === 'Medium') return 'bm'
  return 'bh'
}

function submitQuestion() {
  store.addQuestion({
    title: form.title,
    platform: form.platform,
    topic: form.topic,
    difficulty: form.difficulty,
    status: form.status,
    url: form.url || ''
  })
  emit('close')
}
</script>