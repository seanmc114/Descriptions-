/* Turbo Descriptions — i18n SOLO build
   - Spanish/French/German toggle
   - Optional Text-to-Speech (🔊) + Voice dictation (🎤) using Web Speech APIs
   - Turbo scoring: time + (wrong * penalty). Blanks count wrong.
   - Insane-speed marking buttons
*/

(function () {
  "use strict";

  const PROMPTS_PER_ROUND = 10;

  // ----------------- Language options -----------------
  // UI + voice dictation language (SpeechRecognition).
  const LANGS = {
    es: {
      label: "Spanish",
      placeholder: "Write your answer in Spanish…",
      speech: "es-ES",
      chipLabels: { ser: "ser", estar: "estar", accent: "accents", structure: "connectors" },
    },
    fr: {
      label: "French",
      placeholder: "Write your answer in French…",
      speech: "fr-FR",
      chipLabels: { ser: "être", estar: "avoir", accent: "accents", structure: "connectors" },
    },
    de: {
      label: "German",
      placeholder: "Write your answer in German…",
      speech: "de-DE",
      chipLabels: { ser: "sein", estar: "haben", accent: "Umlauts/ß", structure: "connectors" },
    },
  };

  function safeLang(l) {
    return LANGS[l] ? l : "es";
  }

  // ----------------- Data -----------------
  // NOTE: This is a lightweight prompt bank. Add more prompts per level to expand.
  // Each prompt can have: { text, badge, chips }
  const LEVEL_INFO = [
    { title: "Basics", hint: "Short sentences. Clear subject + verb + 1 detail." },
    { title: "Daily life", hint: "Use time phrases (every day, on Mondays...). Add 2 details." },
    { title: "People", hint: "Describe appearance/personality. Use connectors (and, but, because)." },
    { title: "Places", hint: "Describe a place + activities. Use there is/are style structures." },
    { title: "Past routine", hint: "Use past time markers. Keep agreements consistent." },
    { title: "Opinions", hint: "Give reasons (because, so). Add examples." },
    { title: "Comparisons", hint: "More/less than, as…as. Add 3 details." },
    { title: "Plans", hint: "Future/intentions. Use will/going to equivalents." },
    { title: "Story", hint: "Sequence (first, then, after that). Maintain tense." },
    { title: "Boss", hint: "Longer answer. Use variety: connectors, opinions, details." },
  ];

  // Chips: ser/estar/accent/structure. Badge is just a small label (e.g., “ser”, “estar”, “accents”).
  const PROMPT_BANK = [
    // Level 1
    [
      { text: "Describe your classroom.", badge: "structure", chips: ["structure"] },
      { text: "Describe your best friend.", badge: "ser", chips: ["ser"] },
      { text: "Describe your bedroom.", badge: "structure", chips: ["structure"] },
      { text: "Describe your school.", badge: "structure", chips: ["structure"] },
      { text: "Describe your family.", badge: "ser", chips: ["ser"] },
      { text: "Describe your town.", badge: "structure", chips: ["structure"] },
      { text: "Describe your routine on a school day.", badge: "structure", chips: ["structure"] },
      { text: "Describe what you like to eat.", badge: "structure", chips: ["structure"] },
      { text: "Describe a teacher you like.", badge: "ser", chips: ["ser"] },
      { text: "Describe your favourite subject.", badge: "ser", chips: ["ser"] },
      { text: "Describe your favourite sport.", badge: "ser", chips: ["ser"] },
      { text: "Describe your favourite place in your house.", badge: "structure", chips: ["structure"] },
    ],
    // Level 2
    [
      { text: "Describe what you do after school.", badge: "structure", chips: ["structure"] },
      { text: "Describe a typical weekend.", badge: "structure", chips: ["structure"] },
      { text: "Describe your morning routine.", badge: "structure", chips: ["structure"] },
      { text: "Describe your lunch.", badge: "structure", chips: ["structure"] },
      { text: "Describe your favourite day of the week.", badge: "structure", chips: ["structure"] },
      { text: "Describe what you do on Fridays.", badge: "structure", chips: ["structure"] },
      { text: "Describe your hobbies.", badge: "ser", chips: ["ser"] },
      { text: "Describe your favourite film or series.", badge: "ser", chips: ["ser"] },
      { text: "Describe your phone (and why).", badge: "ser", chips: ["ser"] },
      { text: "Describe your pets (or ideal pet).", badge: "ser", chips: ["ser"] },
      { text: "Describe your favourite food.", badge: "accent", chips: ["accent"] },
      { text: "Describe a café/restaurant you like.", badge: "structure", chips: ["structure"] },
    ],
    // Level 3
    [
      { text: "Describe your personality.", badge: "ser", chips: ["ser"] },
      { text: "Describe your appearance.", badge: "ser", chips: ["ser"] },
      { text: "Describe your best friend’s personality.", badge: "ser", chips: ["ser"] },
      { text: "Describe your favourite celebrity.", badge: "ser", chips: ["ser"] },
      { text: "Describe a classmate.", badge: "ser", chips: ["ser"] },
      { text: "Describe what makes someone a good friend.", badge: "structure", chips: ["structure"] },
      { text: "Describe your favourite outfit.", badge: "accent", chips: ["accent"] },
      { text: "Describe your teacher (and their class).", badge: "ser", chips: ["ser"] },
      { text: "Describe a person you admire.", badge: "ser", chips: ["ser"] },
      { text: "Describe your strengths and weaknesses.", badge: "structure", chips: ["structure"] },
      { text: "Describe what you like about your school.", badge: "structure", chips: ["structure"] },
      { text: "Describe your best friend’s family.", badge: "ser", chips: ["ser"] },
    ],
    // Level 4
    [
      { text: "Describe your town and what there is to do.", badge: "structure", chips: ["structure"] },
      { text: "Describe a holiday destination.", badge: "structure", chips: ["structure"] },
      { text: "Describe your favourite shop.", badge: "structure", chips: ["structure"] },
      { text: "Describe a park near you.", badge: "structure", chips: ["structure"] },
      { text: "Describe a restaurant in your town.", badge: "structure", chips: ["structure"] },
      { text: "Describe your school canteen.", badge: "structure", chips: ["structure"] },
      { text: "Describe your house from outside.", badge: "structure", chips: ["structure"] },
      { text: "Describe your local area in winter.", badge: "structure", chips: ["structure"] },
      { text: "Describe your favourite city.", badge: "structure", chips: ["structure"] },
      { text: "Describe your bedroom in detail.", badge: "structure", chips: ["structure"] },
      { text: "Describe your classroom in detail.", badge: "structure", chips: ["structure"] },
      { text: "Describe what you can do in your town at night.", badge: "structure", chips: ["structure"] },
    ],
    // Level 5
    [
      { text: "Describe what you did yesterday.", badge: "structure", chips: ["structure"] },
      { text: "Describe your last weekend.", badge: "structure", chips: ["structure"] },
      { text: "Describe a holiday you had.", badge: "structure", chips: ["structure"] },
      { text: "Describe a party you went to.", badge: "structure", chips: ["structure"] },
      { text: "Describe what you did last summer.", badge: "structure", chips: ["structure"] },
      { text: "Describe your best day ever.", badge: "structure", chips: ["structure"] },
      { text: "Describe what you ate yesterday.", badge: "structure", chips: ["structure"] },
      { text: "Describe a match/game you watched or played.", badge: "structure", chips: ["structure"] },
      { text: "Describe an embarrassing moment.", badge: "structure", chips: ["structure"] },
      { text: "Describe a day out with friends.", badge: "structure", chips: ["structure"] },
      { text: "Describe what you studied last night.", badge: "structure", chips: ["structure"] },
      { text: "Describe your last birthday.", badge: "structure", chips: ["structure"] },
    ],
    // Level 6
    [
      { text: "Describe your favourite subject and why.", badge: "structure", chips: ["structure"] },
      { text: "Describe your favourite sport and why.", badge: "structure", chips: ["structure"] },
      { text: "Describe social media: good and bad.", badge: "structure", chips: ["structure"] },
      { text: "Describe the best place to live (and why).", badge: "structure", chips: ["structure"] },
      { text: "Describe school uniforms: your opinion.", badge: "structure", chips: ["structure"] },
      { text: "Describe the ideal weekend.", badge: "structure", chips: ["structure"] },
      { text: "Describe what makes a good teacher.", badge: "structure", chips: ["structure"] },
      { text: "Describe the pros/cons of homework.", badge: "structure", chips: ["structure"] },
      { text: "Describe your favourite music (and why).", badge: "structure", chips: ["structure"] },
      { text: "Describe healthy vs unhealthy eating.", badge: "structure", chips: ["structure"] },
      { text: "Describe how you relax after school.", badge: "structure", chips: ["structure"] },
      { text: "Describe your opinion on exams.", badge: "structure", chips: ["structure"] },
    ],
    // Level 7
    [
      { text: "Describe your town compared to Dublin.", badge: "structure", chips: ["structure"] },
      { text: "Describe your school compared to primary school.", badge: "structure", chips: ["structure"] },
      { text: "Describe the best and worst day of the week.", badge: "structure", chips: ["structure"] },
      { text: "Describe a friend who is more… than you.", badge: "structure", chips: ["structure"] },
      { text: "Describe summer vs winter in Ireland.", badge: "structure", chips: ["structure"] },
      { text: "Describe city life vs country life.", badge: "structure", chips: ["structure"] },
      { text: "Describe two hobbies and which you prefer.", badge: "structure", chips: ["structure"] },
      { text: "Describe school rules: which are better/worse.", badge: "structure", chips: ["structure"] },
      { text: "Describe your favourite food vs least favourite.", badge: "structure", chips: ["structure"] },
      { text: "Describe two holidays and compare them.", badge: "structure", chips: ["structure"] },
      { text: "Describe the best sport: compare options.", badge: "structure", chips: ["structure"] },
      { text: "Describe which app is most useful and why.", badge: "structure", chips: ["structure"] },
    ],
    // Level 8
    [
      { text: "Describe your plans for next weekend.", badge: "structure", chips: ["structure"] },
      { text: "Describe your plans for the summer.", badge: "structure", chips: ["structure"] },
      { text: "Describe your dream holiday.", badge: "structure", chips: ["structure"] },
      { text: "Describe your future job (and why).", badge: "structure", chips: ["structure"] },
      { text: "Describe what you will do tonight.", badge: "structure", chips: ["structure"] },
      { text: "Describe your goals for this year.", badge: "structure", chips: ["structure"] },
      { text: "Describe what you want to improve at school.", badge: "structure", chips: ["structure"] },
      { text: "Describe how you will stay healthy.", badge: "structure", chips: ["structure"] },
      { text: "Describe a trip you want to take.", badge: "structure", chips: ["structure"] },
      { text: "Describe what you will do after exams.", badge: "structure", chips: ["structure"] },
      { text: "Describe a skill you want to learn.", badge: "structure", chips: ["structure"] },
      { text: "Describe your ideal future house.", badge: "structure", chips: ["structure"] },
    ],
    // Level 9
    [
      { text: "Tell a short story about a surprise.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about getting lost.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about a funny moment at school.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about meeting someone new.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about a problem you solved.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about a holiday disaster.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about a competition.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about helping a friend.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about a strange day.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about a new hobby.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about a lesson you learned.", badge: "structure", chips: ["structure"] },
      { text: "Tell a story about an unexpected message.", badge: "structure", chips: ["structure"] },
    ],
    // Level 10
    [
      { text: "Describe your ideal day: morning, afternoon, night.", badge: "structure", chips: ["structure"] },
      { text: "Describe your school: buildings, people, subjects, opinion.", badge: "structure", chips: ["structure"] },
      { text: "Describe a holiday: place, activities, opinion, best moment.", badge: "structure", chips: ["structure"] },
      { text: "Describe technology in your life: pros/cons and examples.", badge: "structure", chips: ["structure"] },
      { text: "Describe a person you admire: appearance, personality, why.", badge: "ser", chips: ["ser"] },
      { text: "Describe your town: what it’s like, what you do, improvements.", badge: "structure", chips: ["structure"] },
      { text: "Describe healthy living: food, sport, sleep, routines.", badge: "structure", chips: ["structure"] },
      { text: "Describe your future: job, place, hobbies, goals.", badge: "structure", chips: ["structure"] },
      { text: "Describe friendships: what matters, problems, solutions.", badge: "structure", chips: ["structure"] },
      { text: "Describe school life: pressure, supports, what you’d change.", badge: "structure", chips: ["structure"] },
      { text: "Describe your family and your role in it.", badge: "ser", chips: ["ser"] },
      { text: "Describe an unforgettable day: before, during, after.", badge: "structure", chips: ["structure"] },
    ],
  ];

  function poolForLevel(level) {
    const idx = Math.max(1, Math.min(10, level)) - 1;
    const pool = PROMPT_BANK[idx] || PROMPT_BANK[0];
    return Array.isArray(pool) ? pool : PROMPT_BANK[0];
  }

  // ----------------- Helpers -----------------
  function $(id) {
    return document.getElementById(id);
  }

  function showScreen(name) {
    const screens = {
      home: $("screenHome"),
      game: $("screenGame"),
      results: $("screenResults"),
    };
    Object.values(screens).forEach((s) => s.classList.add("hidden"));
    screens[name].classList.remove("hidden");
  }

  function fmtTime(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const m = Math.floor(s / 60);
    const r = s % 60;
    return `${m}:${String(r).padStart(2, "0")}`;
  }

  function penaltyForLevel(level) {
    // simple scaling: keep 30s default; increase a bit at higher levels if you want
    return 30;
  }

  function sprintCapForLevel(level) {
    // optional cap in seconds for sprint mode
    return Math.max(35, 70 - level * 3);
  }

  function labelMode(mode) {
    switch (mode) {
      case "classic": return "Classic";
      case "sprint": return "Sprint";
      case "survival": return "Survival";
      case "relay": return "Relay";
      default: return "Classic";
    }
  }

  function shuffleInPlace(arr, rng) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // Deterministic RNG for fair selection inside a round
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // (Multiplayer/Match Code removed — solo play only)

  // ----------------- Build round -----------------
  function localizePromptText(text, lang) {
    const L = LANGS[safeLang(lang)] || LANGS.es;
    // Light-touch localisation: swap “Spanish” for selected language label.
    return String(text || "").replace(/\bSpanish\b/g, L.label);
  }

  function buildRound({ level, seed, lang }) {
    const pool = poolForLevel(level);
    const rng = mulberry32(seed + level * 9991);

    const idx = Array.from({ length: pool.length }, (_, i) => i);
    shuffleInPlace(idx, rng);

    const chosen = idx.slice(0, PROMPTS_PER_ROUND).map((k) => pool[k]);

    // Give each prompt a number
    return chosen.map((p, i) => ({
      n: i + 1,
      badge: p.badge,
      text: localizePromptText(p.text, lang),
      chips: p.chips || [],
    }));
  }

  // ----------------- Speech (TTS + Dictation) -----------------
  const canTTS = typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined";
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const canDictate = !!SpeechRecognition;

  function speak(text, lang) {
    if (!canTTS) {
      alert("Text-to-speech isn't available on this browser/device.");
      return;
    }
    const utter = new SpeechSynthesisUtterance(String(text || ""));
    // Use a BCP-47 tag like es-ES / fr-FR / de-DE.
    const L = LANGS[safeLang(lang)] || LANGS.es;
    utter.lang = L.speech || "es-ES";
    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch {
      alert("Text-to-speech failed on this browser/device.");
    }
  }

  function makeRecognizer(lang) {
    if (!canDictate) return null;
    const rec = new SpeechRecognition();
    const L = LANGS[safeLang(lang)] || LANGS.es;
    rec.lang = L.speech || "es-ES";
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 1;
    return rec;
  }

  // ----------------- State -----------------
  const state = {
    level: 1,
    mode: "classic",
    lang: "es",
    seed: 0,
    prompts: [],
    idx: 0,
    answers: [],
    wrongMarks: [],
    startedAt: 0,
    elapsedMs: 0,
    timer: null,
    relayTurn: "A", // "A" then "B"
  };

  // ----------------- DOM -----------------
  const el = {
    screenHome: $("screenHome"),
    screenGame: $("screenGame"),

    pillLevel: $("pillLevel"),
    pillMode: $("pillMode"),
    pillLang: $("pillLang"),
    pillPenalty: $("pillPenalty"),

    levelSelect: $("levelSelect"),
    modeSelect: $("modeSelect"),
    langSelect: $("langSelect"),
    langHint: $("langHint"),
    subtitle: $("subtitle"),

    levelHint: $("levelHint"),
    modeHintHome: $("modeHintHome"),

    soloBtn: $("soloBtn"),

    pbOut: $("pbOut"),
    roundsOut: $("roundsOut"),

    gameTitle: $("gameTitle"),
    tagCap: $("tagCap"),
    tagTips: $("tagTips"),

    promptArea: $("promptArea"),
    prevBtn: $("prevBtn"),
    nextBtn: $("nextBtn"),
    quitBtn: $("quitBtn"),
    modeHint: $("modeHint"),

    // Results
    timeOut: $("timeOut"),
    wrongOut: $("wrongOut"),
    scoreOut: $("scoreOut"),

    markGrid: $("markGrid"),
    answersWrap: $("answersWrap"),

    allCorrectBtn: $("allCorrectBtn"),
    blanksWrongBtn: $("blanksWrongBtn"),
    expandBtn: $("expandBtn"),
    copyBtn: $("copyBtn"),

    playAgainBtn: $("playAgainBtn"),
    homeBtn: $("homeBtn"),
    pbBanner: $("pbBanner"),
  };

  // ----------------- Personal best (per level+mode+lang) -----------------
  function setupKey(s) {
    return `TD_PB_v2_${safeLang(s.lang)}_L${s.level}_${s.mode}`;
  }

  function roundsKey() {
    return "TD_ROUNDS_v1";
  }

  function loadPB(s) {
    try {
      const raw = localStorage.getItem(setupKey(s));
      if (!raw) return null;
      const obj = JSON.parse(raw);
      if (!obj || typeof obj.bestScore !== "number") return null;
      return obj;
    } catch { return null; }
  }

  function savePBIfBetter(s, scoreSec, wrong, timeMs) {
    const key = setupKey(s);
    const current = loadPB(s);
    const entry = { bestScore: scoreSec, bestWrong: wrong, bestTimeMs: timeMs, at: Date.now() };

    if (!current || scoreSec < current.bestScore) {
      localStorage.setItem(key, JSON.stringify(entry));
      return true;
    }
    return false;
  }

  function incRounds() {
    const k = roundsKey();
    const v = Number(localStorage.getItem(k) || "0") || 0;
    localStorage.setItem(k, String(v + 1));
  }

  function getRounds() {
    return Number(localStorage.getItem(roundsKey()) || "0") || 0;
  }

  // ----------------- UI sync -----------------
  function syncPills() {
    const pen = penaltyForLevel(state.level);
    const L = LANGS[safeLang(state.lang)] || LANGS.es;
    el.pillLevel.textContent = `Level: ${state.level}`;
    el.pillMode.textContent = `Mode: ${labelMode(state.mode)}`;
    el.pillLang.textContent = `Language: ${L.label}`;
    el.pillPenalty.textContent = `Penalty: +${pen}s`;
  }

  function syncHints() {
    const info = LEVEL_INFO[state.level - 1] || LEVEL_INFO[0];
    el.levelHint.textContent = `${info.title} — ${info.hint}`;

    const L = LANGS[safeLang(state.lang)] || LANGS.es;
    if (el.langHint) el.langHint.textContent = `Answers should be in ${L.label}. Voice dictation (🎤) uses ${L.speech} if your browser supports it.`;
    if (el.subtitle) el.subtitle.textContent = `Junior Cycle — describe people, places & routines (${L.label})`;

    // Home mode hint
    el.modeHintHome.textContent =
      state.mode === "classic" ? "No cap. Finish all 10."
      : state.mode === "sprint" ? `Time cap: ${sprintCapForLevel(state.level)}s. Submit fast.`
      : state.mode === "survival" ? "One wrong ends the round. Be precise."
      : "Relay: write answers twice (A then B).";
  }

  function syncHomeStats() {
    const pb = loadPB(state);
    if (!pb) {
      el.pbOut.textContent = "—";
    } else {
      el.pbOut.textContent = `${pb.bestScore.toFixed(1)}s (wrong: ${pb.bestWrong})`;
    }
    el.roundsOut.textContent = String(getRounds());
  }

  function buildLevelOptions() {
    el.levelSelect.innerHTML = "";
    for (let i = 1; i <= 10; i++) {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = `Level ${i}`;
      el.levelSelect.appendChild(opt);
    }
  }

  // ----------------- Game flow -----------------
  function startTimer() {
    state.startedAt = performance.now();
    state.elapsedMs = 0;
    if (state.timer) clearInterval(state.timer);
    state.timer = setInterval(() => {
      state.elapsedMs = performance.now() - state.startedAt;
      if (state.mode === "sprint") {
        const cap = sprintCapForLevel(state.level) * 1000;
        if (state.elapsedMs >= cap) {
          state.elapsedMs = cap;
          stopTimer();
          // Auto-finish into results when cap hits
          goToResults();
        }
      }
    }, 100);
  }

  function stopTimer() {
    if (state.timer) clearInterval(state.timer);
    state.timer = null;
  }

  function resetRun() {
    state.answers = Array(PROMPTS_PER_ROUND).fill("");
    state.wrongMarks = Array(PROMPTS_PER_ROUND).fill(false);
    state.idx = 0;
    state.relayTurn = "A";
  }

  function startRound(seed) {
    resetRun();
    state.seed = seed;
    state.prompts = buildRound({ level: state.level, seed: state.seed, lang: state.lang });

    syncPills();
    renderGame();
    showScreen("game");
    startTimer();
  }

  function startSolo() {
    const seed = Math.floor(Math.random() * 1296);
    startRound(seed);
  }

  // ----------------- Render game -----------------
  function renderGame() {
    const info = LEVEL_INFO[state.level - 1] || LEVEL_INFO[0];
    const L = LANGS[safeLang(state.lang)] || LANGS.es;
    el.gameTitle.textContent = `Level ${state.level} — ${info.title}`;
    el.tagCap.textContent = state.mode === "sprint" ? `Sprint cap: ${sprintCapForLevel(state.level)}s` : "Sprint cap: —";
    el.tagTips.textContent = `Tips: ${info.hint}`;

    el.modeHint.textContent =
      state.mode === "classic" ? "Write 10 answers. Then mark wrong fast."
      : state.mode === "sprint" ? "Time cap mode: go fast."
      : state.mode === "survival" ? "One wrong ends the round."
      : "Relay: answer twice (A then B).";

    renderPrompt();
  }

  function makeChip(label, klass) {
    const d = document.createElement("span");
    d.className = `chip ${klass || ""}`.trim();
    d.textContent = label;
    return d;
  }

  function renderPrompt() {
    el.promptArea.innerHTML = "";

    const p = state.prompts[state.idx];
    const L = LANGS[safeLang(state.lang)] || LANGS.es;

    const card = document.createElement("div");
    card.className = "promptCard";

    const top = document.createElement("div");
    top.className = "promptTop";

    const left = document.createElement("div");
    const text = document.createElement("div");
    text.className = "promptText";
    text.textContent = `${p.n}. ${p.text}`;
    left.appendChild(text);

    const badge = document.createElement("div");
    badge.className = "badge";
    const b = p.badge || "";
    badge.textContent = b || "prompt";
    if (b === "ser") badge.classList.add("green");
    if (b === "estar") badge.classList.add("purple");

    top.appendChild(left);
    top.appendChild(badge);

    const chips = document.createElement("div");
    chips.className = "chips";
    const chipLabels = L.chipLabels || LANGS.es.chipLabels;

    (p.chips || []).forEach((c) => {
      const label = chipLabels[c] || c;
      chips.appendChild(makeChip(label, c));
    });

    const row = document.createElement("div");
    row.className = "answerRow";

    const input = document.createElement("input");
    input.type = "text";
    input.value = state.answers[state.idx] || "";
    input.placeholder = L.placeholder || "Write your answer…";
    input.autocomplete = "off";
    input.spellcheck = true;

    input.addEventListener("input", () => {
      state.answers[state.idx] = input.value;
    });

    // Read aloud button
    const speakBtn = document.createElement("button");
    speakBtn.className = "iconBtn";
    speakBtn.type = "button";
    speakBtn.title = canTTS ? "Read prompt aloud" : "Text-to-speech not supported";
    speakBtn.textContent = "🔊";
    if (!canTTS) speakBtn.disabled = true;
    speakBtn.addEventListener("click", () => speak(p.text, state.lang));

    // Dictation button
    const micBtn = document.createElement("button");
    micBtn.className = "iconBtn";
    micBtn.type = "button";
    micBtn.title = canDictate ? "Dictate answer" : "Voice dictation not supported";
    micBtn.textContent = "🎤";
    if (!canDictate) micBtn.disabled = true;

    let activeRec = null;
    micBtn.addEventListener("click", () => {
      if (!canDictate) return;

      if (activeRec) {
        try { activeRec.stop(); } catch {}
        activeRec = null;
        micBtn.textContent = "🎤";
        return;
      }

      const rec = makeRecognizer(state.lang);
      if (!rec) return;

      activeRec = rec;
      micBtn.textContent = "⏺️";

      let finalText = "";

      rec.onresult = (e) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const r = e.results[i];
          const t = r[0] && r[0].transcript ? r[0].transcript : "";
          if (r.isFinal) finalText += t;
          else interim += t;
        }
        const combined = (finalText + " " + interim).trim().replace(/\s+/g, " ");
        input.value = combined;
        state.answers[state.idx] = combined;
      };

      rec.onerror = () => {
        activeRec = null;
        micBtn.textContent = "🎤";
        alert("Dictation failed (browser permission or support issue).");
      };

      rec.onend = () => {
        activeRec = null;
        micBtn.textContent = "🎤";
      };

      try {
        rec.start();
      } catch {
        activeRec = null;
        micBtn.textContent = "🎤";
        alert("Dictation couldn't start on this browser/device.");
      }
    });

    row.appendChild(input);
    row.appendChild(speakBtn);
    row.appendChild(micBtn);

    card.appendChild(top);
    if ((p.chips || []).length) card.appendChild(chips);
    card.appendChild(row);

    el.promptArea.appendChild(card);

    // Buttons state
    el.prevBtn.disabled = state.idx === 0;
    el.nextBtn.textContent = state.idx === PROMPTS_PER_ROUND - 1 ? "Finish" : "Next";
  }

  function next() {
    if (state.idx >= PROMPTS_PER_ROUND - 1) {
      // Relay mode: run twice
      if (state.mode === "relay" && state.relayTurn === "A") {
        state.relayTurn = "B";
        // keep same prompts and seed; reset answers
        state.answers = Array(PROMPTS_PER_ROUND).fill("");
        state.wrongMarks = Array(PROMPTS_PER_ROUND).fill(false);
        state.idx = 0;
        renderGame();
        return;
      }
      goToResults();
      return;
    }
    state.idx++;
    renderPrompt();
  }

  function prev() {
    if (state.idx <= 0) return;
    state.idx--;
    renderPrompt();
  }

  function quitToHome() {
    stopTimer();
    showScreen("home");
    syncPills();
    syncHints();
    syncHomeStats();
  }

  // ----------------- Scoring + marking -----------------
  function computeScore() {
    const pen = penaltyForLevel(state.level);
    const wrong = state.wrongMarks.reduce((a, b) => a + (b ? 1 : 0), 0);
    const base = state.elapsedMs / 1000;
    const score = base + wrong * pen;
    return { wrong, score };
  }

  function renderMarkGrid() {
    el.markGrid.innerHTML = "";
    for (let i = 0; i < PROMPTS_PER_ROUND; i++) {
      const cell = document.createElement("div");
      cell.className = "markCell";
      cell.textContent = String(i + 1);

      const isWrong = !!state.wrongMarks[i];
      cell.classList.add(isWrong ? "bad" : "good");

      cell.addEventListener("click", () => {
        // Survival mode: first wrong ends? (still allow marking)
        state.wrongMarks[i] = !state.wrongMarks[i];
        renderResults(false);
      });

      el.markGrid.appendChild(cell);
    }
  }

  function renderAnswers(expanded) {
    el.answersWrap.innerHTML = "";
    if (!expanded) return;

    state.prompts.forEach((p, i) => {
      const item = document.createElement("div");
      item.className = "answerItem";

      const n = document.createElement("div");
      n.className = "answerN";
      n.textContent = String(i + 1);

      const prompt = document.createElement("div");
      prompt.className = "answerPrompt";
      prompt.textContent = p.text;

      const ans = document.createElement("div");
      ans.className = "answerGiven";
      const txt = String(state.answers[i] || "").trim();
      ans.textContent = txt ? `Your answer: ${txt}` : "Your answer: (blank)";

      item.appendChild(n);
      item.appendChild(prompt);
      item.appendChild(ans);
      el.answersWrap.appendChild(item);
    });
  }

  function renderResults(firstRender) {
    const { wrong, score } = computeScore();

    el.timeOut.textContent = fmtTime(state.elapsedMs);
    el.wrongOut.textContent = String(wrong);
    el.scoreOut.textContent = `${score.toFixed(1)}s`;

    renderMarkGrid();
    if (firstRender) renderAnswers(false);

    if (firstRender) {
      const becamePB = savePBIfBetter(state, score, wrong, state.elapsedMs);
      incRounds();
      syncHomeStats();

      if (becamePB) {
        el.pbBanner.classList.remove("hidden");
        setTimeout(() => el.pbBanner.classList.add("hidden"), 2200);
      } else {
        el.pbBanner.classList.add("hidden");
      }
    }
  }

  function goToResults() {
    stopTimer();

    // Survival mode: auto-mark all blanks wrong + 1 wrong ends
    if (state.mode === "survival") {
      const anyBlank = state.answers.some((a) => !String(a || "").trim());
      if (anyBlank) {
        for (let i = 0; i < PROMPTS_PER_ROUND; i++) {
          if (!String(state.answers[i] || "").trim()) state.wrongMarks[i] = true;
        }
      }
    }

    // Auto-mark blanks wrong for all modes to keep score fair
    for (let i = 0; i < PROMPTS_PER_ROUND; i++) {
      if (!String(state.answers[i] || "").trim()) state.wrongMarks[i] = true;
    }

    showScreen("results");
    renderResults(true);
  }

  // ----------------- Buttons -----------------
  el.prevBtn.addEventListener("click", prev);
  el.nextBtn.addEventListener("click", next);
  el.quitBtn.addEventListener("click", quitToHome);

  el.soloBtn.addEventListener("click", startSolo);

  el.playAgainBtn.addEventListener("click", () => startSolo());
  el.homeBtn.addEventListener("click", quitToHome);

  el.allCorrectBtn.addEventListener("click", () => {
    state.wrongMarks = Array(PROMPTS_PER_ROUND).fill(false);
    renderResults(false);
  });

  el.blanksWrongBtn.addEventListener("click", () => {
    for (let i = 0; i < PROMPTS_PER_ROUND; i++) {
      if (!String(state.answers[i] || "").trim()) state.wrongMarks[i] = true;
    }
    renderResults(false);
  });

  let expanded = false;
  el.expandBtn.addEventListener("click", () => {
    expanded = !expanded;
    if (expanded) el.answersWrap.classList.remove("hidden");
    else el.answersWrap.classList.add("hidden");
    renderAnswers(expanded);
    el.expandBtn.textContent = expanded ? "Hide answers" : "Expand answers";
  });

  el.copyBtn.addEventListener("click", async () => {
    const info = LEVEL_INFO[state.level - 1] || LEVEL_INFO[0];
    const { wrong, score } = computeScore();

    const txt =
      `Turbo Descriptions
` +
      `Level ${state.level} (${info.title}) | Mode: ${labelMode(state.mode)}
` +
      `Language: ${(LANGS[safeLang(state.lang)] || LANGS.es).label}
` +
      `Time: ${fmtTime(state.elapsedMs)} | Wrong: ${wrong} | Score: ${score.toFixed(1)}s`;

    try {
      await navigator.clipboard.writeText(txt);
      alert("Copied!");
    } catch {
      alert("Copy failed on this browser/device.");
    }
  });

  // ----------------- Select changes -----------------
  el.levelSelect.addEventListener("change", () => {
    state.level = Number(el.levelSelect.value) || 1;
    syncPills();
    syncHints();
    syncHomeStats();
  });

  el.modeSelect.addEventListener("change", () => {
    state.mode = String(el.modeSelect.value || "classic");
    syncPills();
    syncHints();
    syncHomeStats();
  });

  if (el.langSelect) {
    el.langSelect.addEventListener("change", () => {
      state.lang = safeLang(el.langSelect.value);
      syncPills();
      syncHints();
      syncHomeStats();
    });
  }

  // ----------------- Init -----------------
  function init() {
    buildLevelOptions();
    el.levelSelect.value = "1";
    el.modeSelect.value = "classic";
    if (el.langSelect) el.langSelect.value = "es";

    state.level = 1;
    state.mode = "classic";
    state.lang = "es";

    syncPills();
    syncHints();
    syncHomeStats();

    showScreen("home");
  }

  init();
})();
