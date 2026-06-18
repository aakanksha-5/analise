<template>
  <div class="shell">
    <nav class="sbar" aria-label="App navigation">
      <div class="logo" title="Analise" aria-label="Analise home">A</div>
      <div class="nav">
        <div class="nb on" aria-label="Dashboard" role="button">
          <i class="ti ti-layout-dashboard" aria-hidden="true"></i>
          <span class="tip">Dashboard</span>
        </div>
        <div class="nb" aria-label="Questions" role="button">
          <i class="ti ti-code" aria-hidden="true"></i>
          <span class="tip">Questions</span>
        </div>
        <div class="nb" aria-label="Flashcards" role="button">
          <i class="ti ti-cards" aria-hidden="true"></i>
          <span class="tip">Flashcards</span>
        </div>
        <div class="ndiv"></div>
        <div class="nb" aria-label="Revision Queue" role="button" style="position:relative">
          <i class="ti ti-clock-hour-4" aria-hidden="true"></i>
          <span class="tip">Revision Queue</span>
          <span class="nbadge" v-if="store.revisionQueue && store.revisionQueue.length > 0"></span>
        </div>
        <div class="nb" aria-label="Analytics" role="button">
          <i class="ti ti-chart-bar" aria-hidden="true"></i>
          <span class="tip">Analytics</span>
        </div>
      </div>
      <div class="nb" aria-label="Settings" role="button" style="margin-top:auto">
        <i class="ti ti-settings" aria-hidden="true"></i>
        <span class="tip">Settings</span>
      </div>
    </nav>

    <main class="main" aria-label="Dashboard content">
      <header class="hdr">
        <div>
          <div class="gtxt">Good evening, <em>let's prep.</em></div>
          <div class="gsub">{{ todayDate }}</div>
        </div>
        <div class="hr">
          <div class="schip" role="status" aria-label="Streak">
            <i class="ti ti-flame" aria-hidden="true" style="font-size:18px;color:var(--ab)"></i>
            <div class="si">
              <span class="sn">{{ store.streakData?.currentStreak || 0 }}</span>
              <span class="sl">Day Streak</span>
            </div>
          </div>
          <div @click="isModalOpen = true" class="abtn" role="button" aria-label="Add question">
          <i class="ti ti-plus" aria-hidden="true" style="font-size:14px"></i>
          Add Question
          </div>
        </div>
      </header>

      <div class="sgrid" role="list" aria-label="Preparation statistics">
        <div class="sc s1" role="listitem">
          <div class="slb"><span class="dot" style="background:var(--gd)"></span>Total Questions</div>
          <div class="sv">{{ store.questions?.length || 0 }}</div>
          <div class="ss"><span class="h">Managed Locally</span></div>
          <div class="bf"><div class="bff" style="width: 100%; background:var(--gd)"></div></div>
        </div>

        <div class="sc s2" role="listitem">
          <div class="slb"><span class="dot" style="background:var(--gn)"></span>Solved</div>
          <div class="sv">{{ solvedCount }}</div>
          <div class="ss"><span class="g">↑ {{ completionPct }}% complete</span></div>
          <div class="bf"><div class="bff" :style="`width: ${completionPct}%; background:var(--gn)`"></div></div>
        </div>

        <div class="sc s3" role="listitem">
          <div class="slb"><span class="dot" style="background:var(--rd);animation:pulse 2s infinite"></span>Due for Revision</div>
          <div class="sv">{{ store.revisionQueue?.length || 0 }}</div>
          <div class="ss"><span class="r">Spaced Repetition Items</span></div>
          <div class="bf"><div class="bff" style="width: 30%; background:var(--rd)"></div></div>
        </div>

        <div class="sc s4" role="listitem">
          <div class="slb"><span class="dot" style="background:var(--bl)"></span>Flashcards</div>
          <div class="sv">{{ store.flashcards?.length || 0 }}</div>
          <div class="ss"><span class="h">Theory & Concepts</span></div>
          <div class="bf"><div class="bff" style="width: 50%; background:var(--bl)"></div></div>
        </div>

        <div class="sc s5" role="listitem">
          <div class="slb"><span class="dot" style="background:var(--ab)"></span>Revision Accuracy</div>
          <div class="sv">{{ accuracy }}<span style="font-size:26px;vertical-align:middle">%</span></div>
          <div class="ss"><span class="g">Recall strength</span></div>
          <div class="bf"><div class="bff" :style="`width: ${accuracy}%; background:var(--ab)`"></div></div>
        </div>

        <div class="sc s6" role="listitem">
          <div class="slb"><span class="dot" style="background:#e07030"></span>Best Streak</div>
          <div class="sv">{{ store.streakData?.bestStreak || 0 }}</div>
          <div class="ss"><span class="h">days</span> · <span class="g">All time</span></div>
          <div class="bf"><div class="bff" style="width: 100%; background:#e07030"></div></div>
        </div>
      </div>

      <div class="bot">
        <div class="pnl p1" aria-label="Progress overview">
          <div class="pht">
            <div class="ptitle"><span class="dot" style="background:var(--gd);width:6px;height:6px"></span>Progress Overview</div>
            <div class="pbadge">{{ completionPct }}% done</div>
          </div>

          <div class="rring">
            <div class="rwrap" aria-hidden="true">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="6.5"/>
                <circle cx="48" cy="48" r="40" fill="none" stroke="var(--gd)" stroke-width="6.5" stroke-linecap="round" stroke-dasharray="251.2" :stroke-dashoffset="251.2 - (completionPct / 100 * 251.2)" transform="rotate(-90 48 48)" style="transition:stroke-dashoffset 1.4s cubic-bezier(.22,1,.36,1)"/>
              </svg>
              <div class="rcenter">
                <span class="rp">{{ completionPct }}%</span>
                <span class="rl">Solved</span>
              </div>
            </div>
            <div class="rrows">
              <div class="rrow"><span class="k"><span class="dot" style="background:var(--gn);width:5px;height:5px"></span>Solved</span><span class="v" style="color:var(--gn)">{{ solvedCount }}</span></div>
              <div class="rrow"><span class="k"><span class="dot" style="background:var(--ab);width:5px;height:5px"></span>Attempted</span><span class="v" style="color:var(--ab)">{{ attemptedCount }}</span></div>
              <div class="rrow"><span class="k"><span class="dot" style="background:var(--m2);width:5px;height:5px"></span>Pending</span><span class="v" style="color:var(--mu)">{{ pendingCount }}</span></div>
            </div>
          </div>
        </div>

        <div class="pnl p2" aria-label="Today's revision queue">
          <div class="pht">
            <div class="ptitle"><span class="dot pdot" style="background:var(--rd);width:6px;height:6px"></span>Today's Queue</div>
            <div class="qfil" role="group">
              <div class="qp" :class="{ 'on': activeFilter === 'all' }" @click="activeFilter = 'all'">All</div>
              <div class="qp" :class="{ 'on': activeFilter === 'Question' }" @click="activeFilter = 'Question'">Coding</div>
              <div class="qp" :class="{ 'on': activeFilter === 'Flashcard' }" @click="activeFilter = 'Flashcard'">Cards</div>
            </div>
          </div>
          
          <div class="qlist">
            <div v-if="filteredQueue.length === 0" class="text-sm text-center text-[var(--mu)] mt-8">
              No items due for revision today! You're all caught up.
            </div>
            
            <div v-for="(q, i) in filteredQueue" :key="q.id" class="qi" @click="handleReview(q)" :style="`animation:si .38s ease ${0.9 + i*0.09}s forwards`">
              <div class="qico" :class="q.type === 'Question' ? 't' : 'f'">
                <i class="ti" :class="q.type === 'Question' ? 'ti-code' : 'ti-cards'" style="font-size:16px" :style="q.type === 'Question' ? 'color:var(--bl)' : 'color:var(--gn)'"></i>
              </div>
              <div class="qinf">
                <div class="qtit">{{ q.title || q.question }}</div>
                <div class="qmeta">
                  <span class="bdg" :class="q.type === 'Question' ? 'bt' : 'bf2'">{{ q.type === 'Question' ? 'Coding' : 'Theory' }}</span>
                  <span class="dsep"></span>
                  <span style="font-size:11px;color:var(--mu)">{{ q.topic || q.category }}</span>
                  <span v-if="q.difficulty" class="dsep"></span>
                  <span v-if="q.difficulty" class="bdg" :class="getDiffClass(q.difficulty)">{{ q.difficulty }}</span>
                </div>
              </div>
              <span class="qarw" aria-hidden="true"><i class="ti ti-chevron-right" style="font-size:16px"></i></span>
            </div>
          </div>
          
          <div style="flex:1"></div>
          <button class="qsbtn" aria-label="Start revision session">
            <i class="ti ti-player-play" aria-hidden="true" style="font-size:14px"></i>
            Start Revision Session
          </button>
        </div>
        
      </div>
    </main>

    <AddQuestionModal v-if="isModalOpen" @close="isModalOpen = false" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useTrackerStore } from './stores/tracker'
import { useEngineStore } from './stores/engine' 
import AddQuestionModal from './components/AddQuestionModal.vue' // 👈 1. ADD THIS IMPORT LINE

const store = useTrackerStore()
const engine = useEngineStore()

// ─── Modal Control State ─────────────────────────────────────────────────────
const isModalOpen = ref(false) // 👈 2. ADD THIS ACCORDION TRACKER LINE

// Get beautifully formatted date for the header
const todayDate = new Date().toLocaleDateString('en-GB', { 
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
})

// Queue Filtering State
const activeFilter = ref('all')

const filteredQueue = computed(() => {
  if (!store.revisionQueue) return []
  if (activeFilter.value === 'all') return store.revisionQueue
  return store.revisionQueue.filter(q => q.type === activeFilter.value)
})

// Derived counts for the dashboard
const solvedCount = computed(() => store.questions?.filter(q => q.status === 'Solved').length || 0)
const attemptedCount = computed(() => store.questions?.filter(q => q.status === 'Attempted').length || 0)
const pendingCount = computed(() => store.questions?.filter(q => q.status === 'Not Started').length || 0)

const completionPct = computed(() => {
  const total = store.questions?.length || 0
  if (total === 0) return 0
  return Math.round((solvedCount.value / total) * 100)
})

const accuracy = computed(() => store.analyticsData?.accuracy || 0)

function getDiffClass(diff) {
  if(diff === 'Easy') return 'be'
  if(diff === 'Medium') return 'bm'
  return 'bh'
}

function handleReview(item) {
  if (item.revisionCount === undefined) item.revisionCount = 0;
  if (item.reinforcementMode === undefined) item.reinforcementMode = false;
  engine.processReview(item, true);

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  item.nextRevisionDate = tomorrow.toISOString();
  store.saveToStorage();
}

function injectDemoData() {
  store.resetAllData();
  const todayStr = new Date().toISOString();

  store.addQuestion({ title: 'Two Sum', platform: 'LeetCode', topic: 'Arrays', difficulty: 'Easy', status: 'Solved' });
  store.addQuestion({ title: 'Merge Intervals', platform: 'LeetCode', topic: 'Arrays', difficulty: 'Medium', status: 'Attempted' });
  store.addQuestion({ title: 'Binary Tree Level Order', platform: 'LeetCode', topic: 'Trees', difficulty: 'Medium', status: 'Not Started' });
  store.addFlashcard({ question: 'Four Pillars of OOP', answer: 'Encapsulation, Abstraction, Inheritance, Polymorphism', category: 'OOP' });

  store.questions.forEach(q => q.nextRevisionDate = todayStr);
  store.flashcards.forEach(f => f.nextRevisionDate = todayStr);
  store.saveToStorage();
}
</script>

<style scoped>
/* EXACT CSS EXTRACTED FROM analise_dashboard.html */
.shell{display:flex;min-height:100vh;background:var(--dk);color:var(--cr);font-family:'DM Sans',system-ui,sans-serif;-webkit-font-smoothing:antialiased}
.sbar{width:68px;flex-shrink:0;background:var(--sf);border-right:1px solid var(--b0);display:flex;flex-direction:column;align-items:center;padding:18px 0;position:sticky;top:0;height:100;z-index: 100;}
.logo{width:38px;height:38px;border-radius:10px;background:var(--gd);display:flex;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:600;color:var(--dk);margin-bottom:30px;cursor:pointer;transition:var(--T);user-select:none}
.logo:hover{transform:scale(1.08) rotate(-4deg)}
.logo:active{transform:scale(.95)}
.nav{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;width:100%;padding:0 10px}
.nb{position:relative;width:46px;height:46px;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:var(--T);color:var(--mu);border:1px solid transparent;font-size:20px}
.nb:hover{background:rgba(255,255,255,.04);color:var(--c2);border-color:var(--b0)}
.nb.on{background:rgba(184,154,106,.1);color:var(--gd);border-color:rgba(184,154,106,.18)}
.tip{position:absolute;left:calc(100% + 12px);top:50%;transform:translateY(-50%) translateX(-4px);background:var(--cd);border:1px solid var(--b0);border-radius:8px;padding:5px 10px;font-size:11.5px;color:var(--c2);white-space:nowrap;pointer-events:none;opacity:0;transition:opacity .18s,transform .18s; z-index:110;}
.nb:hover .tip{opacity:1;transform:translateY(-50%) translateX(0)}
.ndiv{width:26px;height:1px;background:var(--b0);margin:6px 0}
.nbadge{position:absolute;top:5px;right:5px;width:8px;height:8px;border-radius:50%;background:var(--rd);border:2px solid var(--sf)}
.main{flex:1;padding:28px 30px;min-width:0}
.hdr{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:30px;opacity:0;animation:fu .65s ease .05s forwards}
.gtxt{font-family:'Cormorant Garamond',serif;font-size:34px;font-weight:300;color:var(--cr);line-height:1.05;letter-spacing:-.3px}
.gtxt em{font-style:italic;color:var(--gl)}
.gsub{margin-top:5px;font-size:11px;color:var(--mu);letter-spacing:.1em;text-transform:uppercase}
.hr{display:flex;gap:8px;align-items:center}
.schip{display:flex;align-items:center;gap:8px;padding:9px 15px;border-radius:40px;background:var(--aa);border:1px solid rgba(196,136,74,.16);cursor:pointer;transition:var(--T)}
.schip:hover{background:rgba(196,136,74,.16);transform:scale(1.03)}
.schip:active{transform:scale(.97)}
.si{display:flex;flex-direction:column}
.sn{font-size:15px;font-weight:500;color:var(--gl);line-height:1}
.sl{font-size:10px;color:var(--ab);letter-spacing:.08em;text-transform:uppercase}
.abtn{display:flex;align-items:center;gap:7px;padding:9px 17px;border-radius:40px;background:rgba(184,154,106,.08);border:1px solid rgba(184,154,106,.2);color:var(--gd);font-size:13px;cursor:pointer;transition:var(--T);font-family:'DM Sans',sans-serif}
.abtn:hover{background:rgba(184,154,106,.15);transform:translateY(-1px)}
.abtn:active{transform:scale(.97)}
.sgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px}
.sc{background:var(--cd);border:1px solid var(--b0);border-radius:var(--r);padding:20px 22px;position:relative;overflow:hidden;cursor:pointer;transition:background var(--T),border-color var(--T),transform .22s ease,box-shadow var(--T);opacity:0}
.sc::after{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,var(--gd),transparent);opacity:0;transition:opacity .3s}
.sc:hover{background:var(--ch);border-color:rgba(184,154,106,.22);transform:translateY(-3px);box-shadow:0 10px 36px rgba(0,0,0,.35)}
.sc:hover::after{opacity:1}
.sc:active{transform:translateY(-1px)}
.s1{animation:fu .48s ease .16s forwards}.s2{animation:fu .48s ease .24s forwards}.s3{animation:fu .48s ease .31s forwards}.s4{animation:fu .48s ease .38s forwards}.s5{animation:fu .48s ease .44s forwards}.s6{animation:fu .48s ease .5s forwards}
.slb{display:flex;align-items:center;gap:6px;font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--mu);margin-bottom:12px}
.dot{width:5px;height:5px;border-radius:50%;flex-shrink:0}
.sv{font-family:'Cormorant Garamond',serif;font-size:52px;font-weight:300;line-height:1;color:var(--cr);margin-bottom:8px;transition:color .22s;letter-spacing:-1px}
.sc:hover .sv{color:var(--gl)}
.ss{font-size:11.5px;color:var(--mu)}
.ss .h{color:var(--c2)}.ss .g{color:var(--gn)}.ss .a{color:var(--ab)}.ss .r{color:var(--rd)}
.bf{position:absolute;bottom:0;left:0;right:0;height:2px;background:rgba(255,255,255,.04)}
.bff{height:100%;width:0;transition:width 1.3s cubic-bezier(.22,1,.36,1)}
.bot{display:grid;grid-template-columns:1fr 1.5fr;gap:12px}
.pnl{background:var(--cd);border:1px solid var(--b0);border-radius:var(--r);padding:24px;opacity:0}
.p1{animation:fu .52s ease .68s forwards}.p2{animation:fu .52s ease .8s forwards;display:flex;flex-direction:column}
.pht{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.ptitle{display:flex;align-items:center;gap:7px;font-size:10.5px;letter-spacing:.11em;text-transform:uppercase;color:var(--mu)}
.pbadge{background:rgba(184,154,106,.1);border:1px solid rgba(184,154,106,.18);border-radius:20px;padding:3px 9px;font-size:10px;color:var(--gd);letter-spacing:.04em}
.rring{display:flex;align-items:center;gap:22px;margin-bottom:22px}
.rwrap{position:relative;flex-shrink:0}
.rcenter{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:'Cormorant Garamond',serif}
.rp{font-size:26px;font-weight:300;color:var(--cr);line-height:1}
.rl{font-size:9px;color:var(--mu);letter-spacing:.1em;text-transform:uppercase;margin-top:1px}
.rrows{flex:1}
.rrow{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--b0);font-size:12.5px}
.rrow:last-child{border-bottom:none}
.rrow .k{color:var(--mu);display:flex;align-items:center;gap:6px}
.rrow .v{font-weight:500}
.divln{height:1px;background:var(--b0);margin-bottom:18px}
.qfil{display:flex;gap:7px}
.qp{padding:5px 11px;border-radius:20px;font-size:11px;border:1px solid var(--b0);color:var(--mu);cursor:pointer;transition:var(--T);user-select:none;font-family:'DM Sans',sans-serif}
.qp:hover{border-color:rgba(184,154,106,.2);color:var(--c2)}
.qp.on{background:rgba(184,154,106,.08);border-color:rgba(184,154,106,.2);color:var(--gd)}
.qlist{margin-top:4px;flex:1}
.qi {
  display: flex !important; /* 👈 Force layout */
  opacity: 1 !important;    /* 👈 Bypass any hidden animation states */
  transform: none !important; /* 👈 Prevent items from sliding off-screen */
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--b0);
  cursor: pointer;
  transition: padding-left .2s ease;
  border-radius: 6px;
}
.qi:last-child{border-bottom:none}
.qi:hover{padding-left:7px}
.qico{width:34px;height:34px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:17px;flex-shrink:0}
.qico.r{background:var(--ra)}.qico.o{background:var(--aa)}.qico.t{background:var(--ba)}.qico.f{background:var(--ga)}
.qinf{flex:1;min-width:0}
.qtit{font-size:13px;color:var(--c2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:3px;transition:color .18s}
.qi:hover .qtit{color:var(--cr)}
.qmeta{display:flex;gap:6px;align-items:center}
.bdg{padding:2px 6px;border-radius:4px;font-size:10px;letter-spacing:.04em;font-weight:500}
.br{background:var(--ra);color:#c47060}.bo{background:var(--aa);color:var(--ab)}.bt{background:var(--ba);color:var(--bl)}.bf2{background:var(--ga);color:var(--gn)}.be{background:rgba(90,138,102,.12);color:#70b882}.bm{background:rgba(196,136,74,.12);color:var(--ab)}.bh{background:rgba(154,88,72,.12);color:#d07060}
.dsep{width:3px;height:3px;border-radius:50%;background:var(--m2);flex-shrink:0}
.qarw{color:var(--m2);font-size:18px;transition:transform .18s,color .18s;line-height:1}
.qi:hover .qarw{transform:translateX(3px);color:var(--gd)}
.qsbtn{margin-top:16px;width:100%;padding:12px;border:1px solid rgba(184,154,106,.2);border-radius:10px;background:rgba(184,154,106,.07);color:var(--gd);font-size:13px;font-family:'DM Sans',sans-serif;letter-spacing:.04em;cursor:pointer;transition:var(--T);display:flex;align-items:center;justify-content:center;gap:8px}
.qsbtn:hover{background:rgba(184,154,106,.14);transform:translateY(-2px)}
.qsbtn:active{transform:scale(.97)}
.pdot{animation:pulse 2s infinite}
@keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes si{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
</style> 
