/**
 * Main Application Controller for IIIT Kalyani Junior Events Hub
 * Coordinates 3D Scene, Story Dialogue, Event Filters, Modals & Registrations
 */

const EVENTS = window.EVENTS || [];
const CATEGORIES = window.CATEGORIES || [];
const Campus3DScene = window.Campus3DScene;
const StoryDialogue = window.StoryDialogue;

class App {
  constructor() {
    this.scene3D = null;
    this.story = null;
    this.currentCategory = 'all';
    this.searchQuery = '';
    this.onlyFreeFilter = false;
    this.highlightedEventIds = [];
    this.activeModalEvent = null;
    this.registeredEvents = JSON.parse(localStorage.getItem('iiitk_junior_registrations') || '[]');
    this.audioEnabled = false;
    this.audioCtx = null;

    this.init();
  }

  init() {
    // 1. Initialize 3D Canvas
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer && window.THREE) {
      try {
        this.scene3D = new Campus3DScene(canvasContainer);
      } catch (err) {
        console.warn('Three.js failed to initialize, continuing in 2D mode:', err);
      }
    }

    // 2. Initialize Story Dialogue at Gate
    const dialogueContainer = document.getElementById('dialogue-container');
    if (dialogueContainer) {
      this.story = new StoryDialogue({
        dialogueContainer,
        onInterestSelected: (category) => this.handleInterestSelected(category),
        onScrollToEvents: (category) => this.scrollToEventsSection(category)
      });
    }

    // 3. Render Category Filter Bar
    this.renderCategoryPills();

    // 4. Render Initial Events Grid
    this.renderEvents();

    // 5. Setup UI Event Listeners
    this.bindEvents();

    // 6. Setup Side Rail Tracker
    this.setupScrollSpy();

    // 7. Update Registration Counter
    this.updateRegistrationBadge();
  }

  renderCategoryPills() {
    const container = document.getElementById('category-pills');
    if (!container) return;

    container.innerHTML = CATEGORIES.map(cat => `
      <button
        data-cat="${cat.id}"
        class="cat-pill ${cat.id === this.currentCategory ? 'active' : ''}"
      >
        <span>${cat.name}</span>
      </button>
    `).join('');

    container.querySelectorAll('.cat-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentCategory = btn.dataset.cat;
        this.highlightedEventIds = []; // clear highlight when manually changing
        this.renderCategoryPills();
        this.renderEvents();
      });
    });
  }

  renderEvents() {
    const grid = document.getElementById('events-grid');
    const countBadge = document.getElementById('visible-events-count');
    if (!grid) return;

    // Filter events
    let filtered = EVENTS.filter(evt => {
      // Category filter
      const matchesCat = this.currentCategory === 'all' || evt.category === this.currentCategory;

      // Free events toggle
      const matchesFree = !this.onlyFreeFilter || evt.isFreeForFreshers;

      // Search query
      const query = this.searchQuery.toLowerCase();
      const matchesSearch = !query || 
        evt.title.toLowerCase().includes(query) ||
        evt.description.toLowerCase().includes(query) ||
        evt.categoryLabel.toLowerCase().includes(query) ||
        evt.venue.toLowerCase().includes(query);

      return matchesCat && matchesFree && matchesSearch;
    });

    if (countBadge) {
      countBadge.textContent = `${filtered.length} of ${EVENTS.length} Events Listed`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center rb-glass rounded-2xl p-8 border border-white/10">
          <span class="text-4xl block mb-3">🔍</span>
          <h3 class="text-lg font-semibold text-gray-200">No events matched your search</h3>
          <p class="text-gray-400 text-sm mt-1">Try selecting "All Events" or clearing your search keywords.</p>
          <button id="btn-reset-filters" class="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition">
            Show All Events
          </button>
        </div>
      `;
      const btnReset = document.getElementById('btn-reset-filters');
      if (btnReset) {
        btnReset.addEventListener('click', () => {
          this.currentCategory = 'all';
          this.searchQuery = '';
          this.onlyFreeFilter = false;
          const searchInput = document.getElementById('events-search-input');
          if (searchInput) searchInput.value = '';
          const freeToggle = document.getElementById('free-filter-toggle');
          if (freeToggle) freeToggle.checked = false;
          this.renderCategoryPills();
          this.renderEvents();
        });
      }
      return;
    }

    grid.innerHTML = filtered.map(evt => {
      const isHighlighted = this.highlightedEventIds.includes(evt.id);
      const isRegistered = this.registeredEvents.some(r => r.eventId === evt.id);

      return `
        <div 
          class="event-card rb-glass rounded-2xl p-6 border flex flex-col justify-between relative group ${
            isHighlighted ? 'recommended-glow border-emerald-400' : 'border-white/10'
          }"
          data-id="${evt.id}"
        >
          <!-- Free for Freshers Ribbon -->
          ${evt.isFreeForFreshers ? `
            <div class="absolute -top-3 right-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 font-bold text-[10px] tracking-wider uppercase px-3 py-0.5 rounded-full shadow-lg">
              Free for Freshers
            </div>
          ` : ''}

          <!-- Senior Recommendation Badge -->
          ${isHighlighted ? `
            <div class="mb-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-semibold">
              <span class="animate-pulse">⭐</span> Recommended by Senior Guide
            </div>
          ` : ''}

          <div>
            <!-- Header: Event Number & Category -->
            <div class="flex items-center justify-between mb-3">
              <span class="text-xs font-mono font-bold text-gray-400 tracking-wider">${evt.eventNum}</span>
              <span class="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-emerald-300">
                ${evt.categoryLabel}
              </span>
            </div>

            <!-- Title & Tagline -->
            <h3 class="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
              ${evt.title}
            </h3>
            <p class="text-gray-300 text-sm mt-2 line-clamp-2 leading-relaxed">
              ${evt.tagline}
            </p>

            <!-- Key Info Pill Matrix -->
            <div class="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs text-gray-300">
              <div class="flex items-center gap-2">
                <span class="text-emerald-400 text-sm">📅</span>
                <span class="font-medium text-gray-200">${evt.when}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-emerald-400 text-sm">📍</span>
                <span>${evt.venue}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-emerald-400 text-sm">👥</span>
                <span>Team: <b>${evt.teamSize}</b></span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-amber-400 text-sm">🎟️</span>
                <span class="font-semibold text-amber-300">${evt.fees}</span>
              </div>
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="mt-6 pt-4 border-t border-white/10 flex items-center gap-2">
            <button
              class="btn-view-details flex-1 py-2.5 px-3 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold rounded-xl border border-white/15 transition flex items-center justify-center gap-1.5"
              data-id="${evt.id}"
            >
              <span>View Details</span>
              <span>→</span>
            </button>

            <button
              class="btn-register-trigger py-2.5 px-4 font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-md ${
                isRegistered
                  ? 'bg-emerald-950 border border-emerald-400 text-emerald-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }"
              data-id="${evt.id}"
            >
              ${isRegistered ? '✓ Registered' : 'Register Now'}
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bind card buttons
    grid.querySelectorAll('.btn-view-details').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const evt = EVENTS.find(e => e.id === id);
        if (evt) this.openEventDetailModal(evt);
      });
    });

    grid.querySelectorAll('.btn-register-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const evt = EVENTS.find(e => e.id === id);
        if (evt) this.openRegistrationModal(evt);
      });
    });
  }

  handleInterestSelected(category) {
    this.currentCategory = category;
    
    // Highlight relevant event IDs
    if (category === 'robotics') {
      this.highlightedEventIds = ['event-1', 'event-8'];
    } else if (category === 'coding') {
      this.highlightedEventIds = ['event-2'];
    } else if (category === 'sports') {
      this.highlightedEventIds = ['event-3'];
    } else if (category === 'drawing') {
      this.highlightedEventIds = ['event-4'];
    } else if (category === 'fashion') {
      this.highlightedEventIds = ['event-5'];
    } else if (category === 'food') {
      this.highlightedEventIds = ['event-6'];
    } else if (category === 'music') {
      this.highlightedEventIds = ['event-7'];
    } else if (category === 'esports') {
      this.highlightedEventIds = ['event-9'];
    } else if (category === 'drama') {
      this.highlightedEventIds = ['event-10'];
    } else if (category === 'literary') {
      this.highlightedEventIds = ['event-11'];
    } else if (category === 'photo') {
      this.highlightedEventIds = ['event-12'];
    } else {
      this.highlightedEventIds = [];
    }

    this.renderCategoryPills();
    this.renderEvents();
  }

  scrollToEventsSection(category) {
    const section = document.getElementById('events-arena');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
    if (this.scene3D) {
      this.scene3D.setExplicitProgress(0.75);
    }
  }

  openEventDetailModal(evt) {
    this.activeModalEvent = evt;
    const modal = document.getElementById('detail-modal');
    const container = document.getElementById('detail-modal-content');
    if (!modal || !container) return;

    container.innerHTML = `
      <!-- Modal Header -->
      <div class="flex items-start justify-between border-b border-white/10 pb-4">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="text-xs font-mono font-bold text-emerald-400">${evt.eventNum}</span>
            <span class="text-xs px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 font-medium">${evt.categoryLabel}</span>
            ${evt.isFreeForFreshers ? '<span class="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">Free for Freshers</span>' : ''}
          </div>
          <h2 class="text-2xl font-bold text-white leading-tight font-display">${evt.title}</h2>
          <p class="text-emerald-300/90 text-sm mt-1">${evt.tagline}</p>
        </div>
        <button id="btn-close-detail" class="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition">
          ✕
        </button>
      </div>

      <!-- Modal Body -->
      <div class="py-6 space-y-6 max-h-[70vh] overflow-y-auto pr-1">
        <!-- What It Is -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">What It Is</h4>
          <p class="text-gray-200 text-sm leading-relaxed">${evt.description}</p>
        </div>

        <!-- Matrix: When, Where, Team, Fees -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-black/40 p-4 rounded-xl border border-white/10 text-xs">
          <div>
            <span class="text-gray-400 block mb-0.5">📅 Date & Time</span>
            <span class="font-semibold text-white">${evt.when}</span>
          </div>
          <div>
            <span class="text-gray-400 block mb-0.5">⏰ Registration Deadline</span>
            <span class="font-semibold text-amber-300">${evt.deadline}</span>
          </div>
          <div>
            <span class="text-gray-400 block mb-0.5">📍 Venue</span>
            <span class="font-semibold text-white">${evt.venue}</span>
          </div>
          <div>
            <span class="text-gray-400 block mb-0.5">👥 Team Composition</span>
            <span class="font-semibold text-white">${evt.teamSize}</span>
          </div>
          <div class="sm:col-span-2 pt-2 border-t border-white/10 flex items-center justify-between">
            <span class="text-gray-400">Entry & Kit Fee:</span>
            <span class="text-sm font-bold text-emerald-300">${evt.fees}</span>
          </div>
        </div>

        <!-- Schedule Timeline -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Event Schedule & Flow</h4>
          <p class="text-xs font-mono text-gray-300 bg-white/5 p-3 rounded-xl border border-white/10 leading-relaxed">${evt.timeline}</p>
        </div>

        <!-- Benefits & Why You Should Join -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">Benefits & What You Gain</h4>
          <ul class="space-y-1.5 text-xs text-gray-200">
            ${evt.benefits.map(b => `
              <li class="flex items-start gap-2">
                <span class="text-emerald-400">✔</span>
                <span>${b}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- How To Register -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">How To Register</h4>
          <p class="text-xs text-gray-300 bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/20 leading-relaxed">
            ${evt.howToRegister}
          </p>
        </div>
      </div>

      <!-- Modal Footer -->
      <div class="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
        <button id="btn-cancel-detail" class="px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-white transition">
          Close
        </button>
        <button id="btn-proceed-register" class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-gray-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
          <span>Proceed to Register</span>
          <span>→</span>
        </button>
      </div>
    `;

    modal.classList.add('open');

    // Bind Close buttons
    container.querySelector('#btn-close-detail').addEventListener('click', () => modal.classList.remove('open'));
    container.querySelector('#btn-cancel-detail').addEventListener('click', () => modal.classList.remove('open'));
    container.querySelector('#btn-proceed-register').addEventListener('click', () => {
      modal.classList.remove('open');
      this.openRegistrationModal(evt);
    });
  }

  openRegistrationModal(evt) {
    const modal = document.getElementById('registration-modal');
    const container = document.getElementById('registration-modal-content');
    if (!modal || !container) return;

    container.innerHTML = `
      <div class="flex items-start justify-between border-b border-white/10 pb-4">
        <div>
          <span class="text-xs font-mono font-bold text-emerald-400 uppercase">Registration Portal</span>
          <h2 class="text-2xl font-bold text-white font-display">${evt.title}</h2>
          <p class="text-xs text-gray-300 mt-0.5">Entry Fee: <span class="font-bold text-emerald-300">${evt.fees}</span></p>
        </div>
        <button id="btn-close-reg" class="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition">
          ✕
        </button>
      </div>

      <form id="junior-reg-form" class="py-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Your Full Name *</label>
          <input
            type="text"
            id="reg-name"
            required
            placeholder="e.g. Rahul Sharma"
            class="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">Roll Number / College ID *</label>
            <input
              type="text"
              id="reg-roll"
              required
              placeholder="e.g. 2026/ECE/024"
              class="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">Branch & Year *</label>
            <select
              id="reg-branch"
              class="w-full bg-black/70 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
            >
              <option value="ECE 1st Year">ECE · 1st Year (Fresher)</option>
              <option value="CSE 1st Year">CSE · 1st Year (Fresher)</option>
              <option value="ECE 2nd Year">ECE · 2nd Year</option>
              <option value="CSE 2nd Year">CSE · 2nd Year</option>
              <option value="Other Department">Other</option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">Institute Email *</label>
            <input
              type="email"
              id="reg-email"
              required
              placeholder="rahul.ece26@iiitkalyani.ac.in"
              class="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-300 mb-1">WhatsApp / Phone *</label>
            <input
              type="tel"
              id="reg-phone"
              required
              placeholder="+91 9876543210"
              class="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-300 mb-1">Team Name (Leave blank if participating solo)</label>
          <input
            type="text"
            id="reg-team"
            placeholder="e.g. Silicon Sparks / ByteBusters"
            class="w-full bg-black/40 border border-white/15 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div class="p-3 bg-emerald-950/40 border border-emerald-500/20 rounded-xl text-[11px] text-emerald-300 leading-relaxed">
          💡 <b>Senior Note:</b> After registration, your official digital entry ticket will be generated instantly and added to your pass wallet!
        </div>

        <div class="border-t border-white/10 pt-4 flex items-center justify-between gap-3">
          <button type="button" id="btn-cancel-reg" class="px-4 py-2.5 text-xs font-semibold text-gray-400 hover:text-white transition">
            Cancel
          </button>
          <button type="submit" class="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-gray-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2">
            <span>Confirm & Get Ticket</span>
            <span>✓</span>
          </button>
        </div>
      </form>
    `;

    modal.classList.add('open');

    container.querySelector('#btn-close-reg').addEventListener('click', () => modal.classList.remove('open'));
    container.querySelector('#btn-cancel-reg').addEventListener('click', () => modal.classList.remove('open'));

    container.querySelector('#junior-reg-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const name = container.querySelector('#reg-name').value;
      const roll = container.querySelector('#reg-roll').value;
      const branch = container.querySelector('#reg-branch').value;
      const email = container.querySelector('#reg-email').value;
      const phone = container.querySelector('#reg-phone').value;
      const team = container.querySelector('#reg-team').value || 'Solo Participant';

      let registrationNo;
      do {
        registrationNo = `IIITK-REG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      } while (this.registeredEvents.some(reg => reg.registrationNo === registrationNo));

      const passId = `IIITK-${Math.floor(1000 + Math.random() * 9000)}`;

      const newReg = {
        registrationNo,
        passId,
        eventId: evt.id,
        eventTitle: evt.title,
        eventNum: evt.eventNum,
        when: evt.when,
        venue: evt.venue,
        name,
        roll,
        branch,
        email,
        phone,
        team,
        registeredAt: new Date().toLocaleDateString()
      };

      this.registeredEvents.push(newReg);
      localStorage.setItem('iiitk_junior_registrations', JSON.stringify(this.registeredEvents));

      // Show ticket confirmation
      this.showTicketConfirmation(newReg, evt);
      this.updateRegistrationBadge();
      this.renderEvents();
    });
  }

  showTicketConfirmation(reg, evt) {
    const modal = document.getElementById('registration-modal');
    const container = document.getElementById('registration-modal-content');
    if (!container) return;

    container.innerHTML = `
      <div class="text-center py-6 animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-4 border border-emerald-400/40">
          ✓
        </div>
        <span class="text-xs font-mono uppercase tracking-widest text-emerald-400 font-bold">Registration Confirmed!</span>
        <h2 class="text-2xl font-bold text-white font-display mt-1">You're on the list, ${reg.name.split(' ')[0]}!</h2>
        <p class="text-gray-300 text-xs mt-1">Here is your digital entry pass for <b>${evt.title}</b></p>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-left max-w-md mx-auto">
          <div class="bg-black/40 border border-white/10 rounded-xl p-3 sm:col-span-1">
            <span class="text-gray-400 text-[10px] block">REGISTRATION NO.</span>
            <span class="font-mono font-bold text-amber-300 text-xs break-all">${reg.registrationNo}</span>
          </div>
          <div class="bg-black/40 border border-white/10 rounded-xl p-3">
            <span class="text-gray-400 text-[10px] block">STUDENT NAME</span>
            <span class="font-semibold text-white text-xs">${reg.name}</span>
          </div>
          <div class="bg-black/40 border border-white/10 rounded-xl p-3">
            <span class="text-gray-400 text-[10px] block">ROLL NUMBER</span>
            <span class="font-mono font-semibold text-white text-xs">${reg.roll}</span>
          </div>
        </div>

        <!-- Ticket Card -->
        <div class="mt-6 text-left bg-gradient-to-br from-emerald-950/90 to-gray-900 p-6 rounded-2xl border-2 border-dashed border-emerald-500/40 shadow-2xl relative max-w-md mx-auto">
          <div class="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <span class="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">IIIT KALYANI · JUNIOR PASS</span>
              <span class="font-bold text-white text-sm">${evt.eventNum} · ${evt.title}</span>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-400 block font-mono">PASS ID</span>
              <span class="text-xs font-mono font-bold text-amber-300">${reg.passId}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 py-4 text-xs">
            <div>
              <span class="text-gray-400 text-[10px] block">PARTICIPANT</span>
              <span class="font-semibold text-white">${reg.name}</span>
            </div>
            <div>
              <span class="text-gray-400 text-[10px] block">ROLL NUMBER</span>
              <span class="font-semibold text-white font-mono">${reg.roll}</span>
            </div>
            <div>
              <span class="text-gray-400 text-[10px] block">BRANCH & YEAR</span>
              <span class="font-semibold text-white">${reg.branch}</span>
            </div>
            <div>
              <span class="text-gray-400 text-[10px] block">TEAM</span>
              <span class="font-semibold text-emerald-300">${reg.team}</span>
            </div>
            <div class="col-span-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px]">
              <span class="text-gray-300">📍 ${evt.venue}</span>
              <span class="text-emerald-400 font-semibold">📅 ${evt.when.split('·')[0]}</span>
            </div>
          </div>

          <div class="bg-black/60 p-3 rounded-xl flex items-center justify-between text-[10px] text-gray-400">
            <span>Show this pass or QR at the gate check-in</span>
            <span class="font-mono text-emerald-400 font-bold">STATUS: VERIFIED</span>
          </div>
        </div>

        <div class="mt-6 flex items-center justify-center gap-3">
          <button id="btn-done-ticket" class="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl transition">
            Close & Back to Events
          </button>
        </div>
      </div>
    `;

    container.querySelector('#btn-done-ticket').addEventListener('click', () => {
      modal.classList.remove('open');
    });
  }

  updateRegistrationBadge() {
    const badge = document.getElementById('my-passes-count');
    if (badge) {
      badge.textContent = this.registeredEvents.length;
      badge.classList.toggle('hidden', this.registeredEvents.length === 0);
    }
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('events-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.renderEvents();
      });
    }

    // Free filter checkbox
    const freeToggle = document.getElementById('free-filter-toggle');
    if (freeToggle) {
      freeToggle.addEventListener('change', (e) => {
        this.onlyFreeFilter = e.target.checked;
        this.renderEvents();
      });
    }

    // Audio toggle
    const audioBtn = document.getElementById('audio-toggle-btn');
    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        this.toggleAmbientSound();
      });
    }

    // My Passes Modal trigger
    const myPassesBtn = document.getElementById('btn-my-passes');
    if (myPassesBtn) {
      myPassesBtn.addEventListener('click', () => {
        this.openMyPassesModal();
      });
    }
  }

  openMyPassesModal() {
    const modal = document.getElementById('detail-modal');
    const container = document.getElementById('detail-modal-content');
    if (!modal || !container) return;

    container.innerHTML = `
      <div class="flex items-start justify-between border-b border-white/10 pb-4">
        <div>
          <span class="text-xs font-mono font-bold text-emerald-400 uppercase">My Registrations</span>
          <h2 class="text-2xl font-bold text-white font-display">Your Event Passes</h2>
        </div>
        <button id="btn-close-passes" class="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition">
          ✕
        </button>
      </div>

      <div class="py-5 max-h-[65vh] overflow-y-auto space-y-3">
        ${this.registeredEvents.length === 0 ? `
          <div class="text-center py-12 text-gray-400 text-sm">
            You haven't registered for any events yet.<br>
            Scroll down to explore the events and register!
          </div>
        ` : this.registeredEvents.map(r => `
          <div class="p-4 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between gap-4">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-mono font-bold text-amber-300">${r.registrationNo || r.passId}</span>
                <span class="text-xs text-gray-400">· Registered on ${r.registeredAt}</span>
              </div>
              <h4 class="font-bold text-white text-sm">${r.eventTitle}</h4>
              <p class="text-xs text-gray-400 mt-1">📍 ${r.venue} | 👤 ${r.name} (${r.roll})</p>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold text-xs shrink-0">
              Pass Active
            </span>
          </div>
        `).join('')}
      </div>

      <div class="border-t border-white/10 pt-4 text-right">
        <button id="btn-dismiss-passes" class="px-5 py-2 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-xl transition">
          Close
        </button>
      </div>
    `;

    modal.classList.add('open');
    container.querySelector('#btn-close-passes').addEventListener('click', () => modal.classList.remove('open'));
    container.querySelector('#btn-dismiss-passes').addEventListener('click', () => modal.classList.remove('open'));
  }

  toggleAmbientSound() {
    this.audioEnabled = !this.audioEnabled;
    const btn = document.getElementById('audio-toggle-btn');
    const label = document.getElementById('audio-toggle-label');

    if (this.audioEnabled) {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        this.startGentleDrone();
      } else if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      if (btn) btn.innerHTML = '🔊';
      if (label) label.textContent = 'Audio: ON';
    } else {
      if (this.audioCtx) {
        this.audioCtx.suspend();
      }
      if (btn) btn.innerHTML = '🔇';
      if (label) label.textContent = 'Audio: OFF';
    }
  }

  startGentleDrone() {
    if (!this.audioCtx) return;
    try {
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(146.83, this.audioCtx.currentTime); // D3 note

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(220, this.audioCtx.currentTime); // A3 note

      gain.gain.setValueAtTime(0.04, this.audioCtx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc1.start();
      osc2.start();
    } catch (e) {
      console.warn('Audio synthesis issue:', e);
    }
  }

  setupScrollSpy() {
    const dots = document.querySelectorAll('.rb-rail-dot');
    const sections = ['hero-gate', 'story-encounter', 'events-arena', 'senior-community'];

    window.addEventListener('scroll', () => {
      const scrollPos = window.scrollY + window.innerHeight / 3;

      sections.forEach((id, idx) => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            dots.forEach(d => d.classList.remove('active'));
            if (dots[idx]) dots[idx].classList.add('active');
          }
        }
      });
    }, { passive: true });

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        const targetId = sections[idx];
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }
}

// Bootstrap once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.__IIITK_APP__ = new App();
});
