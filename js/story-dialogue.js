/**
 * Interactive Senior-Junior Story Dialogue Engine
 * Handles the campus gate conversation:
 * 1. Name & Fresher status
 * 2. 4 official branches (CSE, CSE + Cyber Security, CSE + AI & Data Science, ECE) with error fallback
 * 3. Hometown / City
 * 4. Interests & matched events
 */

class StoryDialogue {
  constructor(options) {
    this.container = options.dialogueContainer;
    this.onInterestSelected = options.onInterestSelected || (() => {});
    this.onScrollToEvents = options.onScrollToEvents || (() => {});
    this.interestMap = window.INTEREST_MAP || {};

    this.profile = {
      name: '',
      isFresher: 'yes',
      branch: '',
      hometown: '',
      interest: '',
      category: null
    };

    this.selectedCategory = null;
    this.init();
  }

  init() {
    this.renderInitialGateDialogue();
  }

  escapeHTML(value) {
    if (value === null || value === undefined) return '';
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    };
    return String(value).replace(/[&<>"'/`=]/g, character => entities[character]);
  }

  parseBranchInput(input) {
    const raw = (input || '').trim().toLowerCase();
    if (!raw) return null;
    const clean = raw.replace(/[^a-z0-9+&/\s]/g, ' ').replace(/\s+/g, ' ').trim();

    if (clean.includes('cyber') || clean.includes('security') || clean.includes('cns') || clean.includes('infosec')) {
      return 'CSE + Cyber Security';
    }
    if (clean.includes('ai') || clean.includes('data science') || clean.includes('ds') || clean.includes('artificial') || clean.includes('intelligence') || clean.includes('ml')) {
      return 'CSE + AI & Data Science';
    }
    if (/\b(cse|cs|computer science|computer|comp sci|software)\b/.test(clean)) {
      return 'CSE';
    }
    if (/\b(ece|ec|electronics|electronics and communication|communication)\b/.test(clean)) {
      return 'ECE';
    }

    return null;
  }

  renderDialogueCard(seniorMessage, juniorMessage = '', controls = '') {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="dialogue-card rb-glass animate-fade-in p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto border border-amber-400/30 shadow-2xl relative space-y-4">
        ${juniorMessage ? `
          <div class="flex items-start justify-end gap-3">
            <div class="bg-forest-900/90 border border-amber-400/30 text-cream-100 text-sm px-5 py-3 rounded-2xl rounded-tr-none shadow-md max-w-[82%]">
              <span class="eyebrow-tag text-amber-300 block mb-1">You · Junior</span>
              <p>${this.escapeHTML(juniorMessage)}</p>
            </div>
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-terracotta-500 flex items-center justify-center text-base shadow-md shrink-0 border border-cream-200/30">🎒</div>
          </div>
        ` : ''}
        <div class="flex items-start gap-3">
          <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-500 flex items-center justify-center text-lg shadow-md shrink-0 border border-cream-200/30">🎓</div>
          <div class="bg-forest-950/90 border border-emerald-400/30 text-cream-100 text-sm px-5 py-3.5 rounded-2xl rounded-tl-none shadow-md max-w-[90%]">
            <div class="flex items-center gap-2 mb-1.5"><span class="eyebrow-tag text-emerald-300">Ashwin · Senior</span><span class="text-[10px] text-cream-300/60 font-mono">IIIT Kalyani</span></div>
            <p class="leading-relaxed">${seniorMessage}</p>
          </div>
        </div>
        ${controls ? `<div class="pt-3 border-t border-cream-200/15">${controls}</div>` : ''}
      </div>
    `;
  }

  renderInitialGateDialogue() {
    this.profile = { name: '', isFresher: 'yes', branch: '', hometown: '', interest: '', category: null };
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="dialogue-card rb-glass animate-fade-in p-6 sm:p-8 rounded-3xl max-w-2xl mx-auto border border-amber-400/30 shadow-2xl relative space-y-4">
        <p class="text-cream-50 text-base sm:text-lg leading-relaxed">Hey! I'm Ashwin, a senior here. Welcome to IIIT Kalyani. May I know your name? Are you a fresher?</p>
        <form id="junior-name-form" class="space-y-3">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label class="text-xs text-cream-300">Your name
              <input id="junior-name-input" required maxlength="40" autocomplete="given-name" class="mt-1 w-full bg-black/50 border border-cream-200/20 rounded-xl px-3.5 py-2.5 text-sm text-cream-50 focus:outline-none focus:border-amber-400" placeholder="Type your name" />
            </label>
            <label class="text-xs text-cream-300">Are you a fresher?
              <select id="junior-fresher-input" class="mt-1 w-full bg-forest-900 border border-cream-200/20 rounded-xl px-3.5 py-2.5 text-sm text-cream-50 focus:outline-none focus:border-amber-400">
                <option value="yes">Yes, I am a fresher</option>
                <option value="no">No, I am a junior</option>
              </select>
            </label>
          </div>
          <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-terracotta-500 text-forest-950 text-xs font-bold rounded-xl shadow-md">Send</button>
        </form>
      </div>
    `;

    const form = this.container.querySelector('#junior-name-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.profile.name = this.container.querySelector('#junior-name-input').value.trim();
        this.profile.isFresher = this.container.querySelector('#junior-fresher-input').value;
        this.renderBranchStep();
      });
    }
  }

  renderBranchStep(errorState = false, lastAttempt = '') {
    const name = this.escapeHTML(this.profile.name);
    const fresherReply = this.profile.isFresher === 'yes' ? 'Yes, I am a fresher.' : 'I am a junior here.';

    const branches = [
      { name: 'CSE', label: '💻 CSE' },
      { name: 'CSE + Cyber Security', label: '🛡️ CSE + Cyber Security' },
      { name: 'CSE + AI & Data Science', label: '🤖 CSE + AI &amp; DS' },
      { name: 'ECE', label: '⚡ ECE' }
    ];

    const controls = `
      <div class="space-y-3">
        <p class="text-xs text-cream-300">Choose your branch from the 4 offered at IIIT Kalyani, or type it below:</p>
        <div class="flex flex-wrap gap-2" id="branch-chips-group">
          ${branches.map(b => `
            <button type="button" data-branch="${this.escapeHTML(b.name)}" class="interest-chip font-semibold text-xs">
              ${b.label}
            </button>
          `).join('')}
        </div>
        <form id="junior-branch-form" class="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            id="junior-branch-input"
            maxlength="50"
            class="flex-1 bg-black/50 border border-cream-200/20 rounded-xl px-3.5 py-2.5 text-sm text-cream-50 focus:outline-none focus:border-amber-400"
            placeholder="Or type your branch (e.g. CSE, ECE...)"
          />
          <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-terracotta-500 text-forest-950 text-xs font-bold rounded-xl shadow-md">
            Send branch
          </button>
        </form>
      </div>
    `;

    let seniorMessage = '';
    let juniorMessage = '';

    if (errorState) {
      seniorMessage = `Sorry, I didn't get that! Please choose among these 4 branches offered at IIIT Kalyani:<br><span class="text-amber-300 font-semibold">• CSE<br>• CSE + Cyber Security<br>• CSE + AI &amp; Data Science<br>• ECE</span>`;
      juniorMessage = lastAttempt ? `${lastAttempt}` : '';
    } else {
      seniorMessage = `Nice to meet you, <b class="text-amber-300">${name}</b>! Which branch are you in? Here at IIIT Kalyani, we offer 4 branches:`;
      juniorMessage = `My name is ${this.profile.name}. ${fresherReply}`;
    }

    this.renderDialogueCard(seniorMessage, juniorMessage, controls);

    document.querySelectorAll('#branch-chips-group [data-branch]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.profile.branch = btn.dataset.branch;
        this.renderHometownStep();
      });
    });

    const form = document.getElementById('junior-branch-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const inputVal = document.getElementById('junior-branch-input').value.trim();
        const validatedBranch = this.parseBranchInput(inputVal);
        if (validatedBranch) {
          this.profile.branch = validatedBranch;
          this.renderHometownStep();
        } else {
          this.renderBranchStep(true, inputVal);
        }
      });
    }
  }

  renderHometownStep() {
    const branch = this.escapeHTML(this.profile.branch);
    const name = this.escapeHTML(this.profile.name);

    const controls = `
      <form id="junior-hometown-form" class="flex flex-col sm:flex-row gap-2">
        <input
          id="junior-hometown-input"
          required
          maxlength="50"
          class="flex-1 bg-black/50 border border-cream-200/20 rounded-xl px-3.5 py-2.5 text-sm text-cream-50 focus:outline-none focus:border-amber-400"
          placeholder="e.g. Kolkata, Patna, Lucknow, Delhi, Hyderabad..."
        />
        <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-terracotta-500 text-forest-950 text-xs font-bold rounded-xl shadow-md">
          Send hometown
        </button>
      </form>
    `;

    this.renderDialogueCard(
      `Awesome! <b class="text-amber-300">${branch}</b> has fantastic labs and an active club culture here at IIIT Kalyani. Which city or hometown are you joining us from, ${name}?`,
      `I am in ${this.profile.branch}.`,
      controls
    );

    const form = document.getElementById('junior-hometown-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const val = document.getElementById('junior-hometown-input').value.trim();
        if (val.length < 2) return;
        this.profile.hometown = val;
        this.renderInterestStep();
      });
    }
  }

  renderInterestStep() {
    const hometown = this.escapeHTML(this.profile.hometown || 'your city');
    const name = this.escapeHTML(this.profile.name);

    const controls = `
      <div class="space-y-3">
        <p class="text-xs text-cream-300">Tap an interest below or type what you're passionate about:</p>
        <div class="flex flex-wrap gap-2" id="interest-quick-chips">
          <button type="button" data-cat="robotics" class="interest-chip">🤖 Robotics</button>
          <button type="button" data-cat="coding" class="interest-chip">💻 Coding &amp; Hackathons</button>
          <button type="button" data-cat="sports" class="interest-chip">⚽ Sports &amp; Futsal</button>
          <button type="button" data-cat="drawing" class="interest-chip">🎨 Drawing &amp; Art</button>
          <button type="button" data-cat="music" class="interest-chip">🎵 Music &amp; Bands</button>
          <button type="button" data-cat="esports" class="interest-chip">🎮 Gaming &amp; Esports</button>
          <button type="button" data-cat="all" class="interest-chip font-bold text-amber-300">✨ Show Me All</button>
        </div>
        <form id="junior-interest-form" class="flex flex-col sm:flex-row gap-2 pt-1">
          <input
            id="junior-interest-input"
            required
            maxlength="120"
            class="flex-1 bg-black/50 border border-cream-200/20 rounded-xl px-3.5 py-2.5 text-sm text-cream-50 focus:outline-none focus:border-amber-400"
            placeholder="Type an interest, like robotics, AI, or music"
          />
          <button type="submit" class="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-terracotta-500 text-forest-950 text-xs font-bold rounded-xl shadow-md">
            Send interest
          </button>
        </form>
      </div>
    `;

    this.renderDialogueCard(
      `A big welcome from <b class="text-amber-300">${hometown}</b> to IIIT Kalyani, ${name}! We have a thriving senior and peer community here from ${hometown}. Now tell me, what activities, technical fields, or fests are you most interested in?`,
      `I'm from ${this.profile.hometown}.`,
      controls
    );

    document.querySelectorAll('#interest-quick-chips [data-cat]').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.cat;
        this.profile.interest = btn.textContent.trim();
        this.handleUserInterest(cat, this.profile.interest);
      });
    });

    const form = document.getElementById('junior-interest-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = document.getElementById('junior-interest-input').value.trim();
        this.profile.interest = text;
        const lower = text.toLowerCase();
        let matchedCat = 'all';
        if (lower.includes('robot') || lower.includes('hardware') || lower.includes('circuit')) matchedCat = 'robotics';
        else if (lower.includes('code') || lower.includes('hack') || lower.includes('ai') || lower.includes('web')) matchedCat = 'coding';
        else if (lower.includes('sport') || lower.includes('football') || lower.includes('cricket')) matchedCat = 'sports';
        else if (lower.includes('draw') || lower.includes('art') || lower.includes('paint')) matchedCat = 'drawing';
        else if (lower.includes('music') || lower.includes('band') || lower.includes('song')) matchedCat = 'music';
        else if (lower.includes('game') || lower.includes('esport') || lower.includes('valorant')) matchedCat = 'esports';

        this.handleUserInterest(matchedCat, text);
      });
    }
  }

  handleUserInterest(category, label) {
    this.selectedCategory = category;
    const info = (this.interestMap && this.interestMap[category]) || {
      label: 'All Campus Events',
      botResponse: "Awesome! IIIT Kalyani has a packed calendar with 12+ curated events across robotics, fests, hackathons, music, and food. You're going to love it here!"
    };

    const controls = `
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-cream-200/15">
        <button id="btn-reselect-interest" class="text-xs text-cream-300/80 hover:text-cream-100 underline underline-offset-4">
          ← Change interest
        </button>
        <button id="btn-ok-lemme-see" class="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-terracotta-500 hover:from-amber-400 text-forest-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
          <span>Ok, lemme see matched events!</span>
          <span>↓</span>
        </button>
      </div>
    `;

    this.renderDialogueCard(
      info.botResponse,
      `I'm interested in ${this.escapeHTML(label)}!`,
      controls
    );

    this.onInterestSelected(category);

    const btnLemmeSee = document.getElementById('btn-ok-lemme-see');
    if (btnLemmeSee) {
      btnLemmeSee.addEventListener('click', () => {
        this.onScrollToEvents(category);
      });
    }

    const btnBack = document.getElementById('btn-reselect-interest');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.renderInterestStep();
      });
    }
  }
}

window.StoryDialogue = StoryDialogue;
