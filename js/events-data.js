/**
 * IIIT Kalyani - Junior Events & Orientation Showcase Data
 * Comprehensive dataset covering diverse categories:
 * Robotics, Coding, Sports, Art, Fashion, Food, Music, Hardware, Esports, Drama, Debate, Photography
 */

const CATEGORIES = [
  { id: 'all', name: 'All Events', icon: 'sparkles', count: 12 },
  { id: 'robotics', name: 'Robotics & Hardware', icon: 'cpu', count: 2 },
  { id: 'coding', name: 'Hackathons & Coding', icon: 'code', count: 1 },
  { id: 'sports', name: 'Sports & Games', icon: 'trophy', count: 1 },
  { id: 'drawing', name: 'Drawing & Art', icon: 'palette', count: 1 },
  { id: 'fashion', name: 'Fashion & Style', icon: 'shirt', count: 1 },
  { id: 'food', name: 'Food Festival', icon: 'utensils', count: 1 },
  { id: 'music', name: 'Music & Bands', icon: 'music', count: 1 },
  { id: 'esports', name: 'Esports & Gaming', icon: 'gamepad-2', count: 1 },
  { id: 'drama', name: 'Drama & Cultural', icon: 'clapperboard', count: 1 },
  { id: 'literary', name: 'Debate & Literary', icon: 'book-open', count: 1 },
  { id: 'photo', name: 'Photography & Film', icon: 'camera', count: 1 }
];

const EVENTS = [
  {
    id: 'event-1',
    eventNum: 'Event 01',
    title: 'RoboClash: Autonomous Rover Challenge',
    category: 'robotics',
    categoryLabel: 'Robotics & Hardware',
    tagline: 'Design, code, and battle your custom line-follower and obstacle-avoiding bots.',
    description: 'RoboClash is the flagship robotics challenge organized by the Robotics and Automation Club of IIIT Kalyani. Juniors get hands-on experience interfacing microcontrollers (Arduino/ESP32), motor drivers, and IR sensors. Teams navigate a dynamically obstacle-laden maze against the clock.',
    when: 'November 14, 2026 · 10:00 AM - 4:00 PM',
    timeline: '10:00 AM Check-in & Calibration | 11:30 AM Time Trials | 2:30 PM Grand Finals',
    deadline: 'Registration closes Nov 10, 2026 (11:59 PM IST)',
    venue: 'Robotics & Embedded Systems Lab, Academic Block 2',
    teamSize: '2 - 4 Members (Solo entries paired on spot)',
    fees: '₹120 / team (Free hardware starter kit provided for 1st years)',
    isFreeForFreshers: true,
    benefits: [
      'Cash prize pool of ₹15,000 + Memento',
      'Direct fast-track interview for IIIT Kalyani Robotics Club',
      'Hardware development kits & sponsored components',
      'Official Certificate of Merit signed by Faculty In-Charge'
    ],
    howToRegister: 'Click the "Register Now" button below, enter your team lead and member roll numbers, select your microcontroller preference, and download your entry QR pass.',
    status: 'Open',
    featured: true,
    color: '#06b6d4'
  },
  {
    id: 'event-2',
    eventNum: 'Event 02',
    title: 'HackKalyani: 24-Hour Junior Hackathon',
    category: 'coding',
    categoryLabel: 'Hackathons & Coding',
    tagline: 'Turn your wildest software and Web3 ideas into working prototypes in 24 hours.',
    description: 'IIIT Kalyani\'s premier annual sprint where freshers and sophomores team up to solve real-world problems. Tracks include AI/ML for Social Good, Smart Campus Solutions, FinTech, and Open Innovation. Seniors act as round-the-clock mentors providing debugging assistance, snacks, and code reviews.',
    when: 'November 20-21, 2026 · Starts 11:00 AM (24 Hours)',
    timeline: 'Day 1 (11 AM Kickoff, 4 PM Mentor Check-in 1, 10 PM Midnight Jam) | Day 2 (11 AM Code Freeze, 1 PM Pitches)',
    deadline: 'Registration closes Nov 16, 2026',
    venue: 'Main Central Computing Center & Virtual Discord',
    teamSize: '2 - 4 Members',
    fees: 'Free of Cost (Sponsored by Tech Club)',
    isFreeForFreshers: true,
    benefits: [
      '₹25,000 Total Prize Bounty + Cloud Credits ($100 each)',
      '1-on-1 mentorship from Google & Microsoft placed seniors',
      'Exclusive HackKalyani swags, stickers, and t-shirts',
      'Verified GitHub project to supercharge your resume'
    ],
    howToRegister: 'Submit your team details and GitHub handles via the registration portal below. Solo participants will be grouped in the pre-hack team mixer.',
    status: 'Open',
    featured: true,
    color: '#3b82f6'
  },
  {
    id: 'event-3',
    eventNum: 'Event 03',
    title: 'Futsal & Box Cricket Night League',
    category: 'sports',
    categoryLabel: 'Sports & Games',
    tagline: 'High-intensity floodlit 5-a-side football and box cricket under campus lights.',
    description: 'Unwind from academics and battle it out on the turf! The Annual IIIT Kalyani Sports Council League brings high-energy 5-a-side futsal and box cricket under the floodlights. Commentary, roaring crowd, dynamic power-plays, and spirited inter-batch rivalry.',
    when: 'November 24-26, 2026 · Every Evening 5:30 PM - 9:30 PM',
    timeline: 'League matches on Day 1 & 2; Semis and Grand Final under floodlights on Day 3',
    deadline: 'Registration closes Nov 21, 2026',
    venue: 'College Sports Ground & Multi-Purpose Turf',
    teamSize: '5 Players + 2 Substitutes',
    fees: '₹200 per team (Includes match jerseys & hydration)',
    isFreeForFreshers: false,
    benefits: [
      'Championship Trophy + Medals + ₹8,000 Cash Prize',
      'Selection trials for IIIT Inter-Institute Sports Meet',
      'Free energy drinks & custom team badges',
      'Best Striker, Best Goalkeeper & MVP awards'
    ],
    howToRegister: 'Register your team captain and submit your playing 7. Captains must attend the fixture draw meeting on Nov 22nd at the sports room.',
    status: 'Open',
    featured: false,
    color: '#10b981'
  },
  {
    id: 'event-4',
    eventNum: 'Event 04',
    title: 'Canvas Royale: Digital Art & Live Speed Sketching',
    category: 'drawing',
    categoryLabel: 'Drawing & Art',
    tagline: 'Unleash your imagination on digital canvas, charcoal, and acrylic boards.',
    description: 'Whether you paint in Procreate/Photoshop, sketch with graphite, or splash acrylics, Canvas Royale is your creative playground. Prompts are revealed on the spot (e.g. "Cyberpunk Bengal", "Dystopian Campus 2099", "Life in 404"). Artworks will be exhibited in the campus gallery.',
    when: 'November 18, 2026 · 2:00 PM - 5:30 PM',
    timeline: '2:00 PM Theme Release & Canvas Prep | 2:30 PM Live Creation (2.5 hrs) | 5:00 PM Exhibition & Judging',
    deadline: 'Registration closes Nov 16, 2026',
    venue: 'Design Studio & Open-Air Amphitheatre',
    teamSize: 'Individual Participation',
    fees: 'Free for all students (Art supplies provided for traditional category)',
    isFreeForFreshers: true,
    benefits: [
      'Wacom Drawing Tablet for 1st Place + ₹5,000 cash',
      'Art pieces permanently displayed in the Student Activity Center',
      'Certificate of Artistic Excellence',
      'Membership into the IIIT Kalyani Creative & Design Guild'
    ],
    howToRegister: 'Click Register, choose your track (Traditional Medium vs. Digital Graphics Tablet), and reserve your studio easel/desk.',
    status: 'Open',
    featured: false,
    color: '#ec4899'
  },
  {
    id: 'event-5',
    eventNum: 'Event 05',
    title: 'Vogue Nexus: Eco-Futurism Campus Fashion Walk',
    category: 'fashion',
    categoryLabel: 'Fashion & Style',
    tagline: 'Strut the runway with sustainable aesthetics, bold streetwear, and futuristic couture.',
    description: 'Vogue Nexus challenges students to express personality through sustainable design, thrifted retro-tech aesthetics, and high-energy runway choreography. Curate your outfit, choose your soundtrack, and walk the illuminated campus ramp in front of cheering peers and guest judges.',
    when: 'November 27, 2026 · 6:30 PM - 9:00 PM',
    timeline: '5:00 PM Green Room & Makeup | 6:30 PM Round 1: Casual Streetwear | 7:45 PM Round 2: Avant-Garde Futuristic',
    deadline: 'Registration closes Nov 23, 2026',
    venue: 'Main Auditorium Ramp Stage',
    teamSize: 'Solo or Duos (Couples / Stylist + Model)',
    fees: '₹100 per entry (Covers green room amenities & photography)',
    isFreeForFreshers: false,
    benefits: [
      'Mr. & Ms. Vogue Nexus Crowns + ₹10,000 Fashion Voucher',
      'Professional portfolio shoot by the Photography Club',
      'Featured on the official college cultural magazine cover',
      'Best Styled Outfit and Best Ramp Walk individual titles'
    ],
    howToRegister: 'Register online with your proposed outfit concept and audio track. Rehearsal schedules will be shared via email.',
    status: 'Open',
    featured: false,
    color: '#f43f5e'
  },
  {
    id: 'event-6',
    eventNum: 'Event 06',
    title: 'Zaika Street: The Annual Culinary & Food Expo',
    category: 'food',
    categoryLabel: 'Food Festival',
    tagline: 'Cook, taste, critique! 15+ student stalls featuring regional delights & street food.',
    description: 'Food brings the entire campus together! Zaika Street transforms the hostel promenade into a vibrant food carnival. Student teams set up live cooking or mocktail stalls representing cuisines from across India—from Kolkata Kathi rolls and Momos to South Indian Dosas and homemade desserts.',
    when: 'November 28, 2026 · 4:00 PM - 10:00 PM',
    timeline: '3:00 PM Stall Setup | 4:30 PM Food Tasting Carnival Opens | 8:30 PM MasterChef Tasting & People\'s Choice Award',
    deadline: 'Stall booking closes Nov 20, 2026 (Limited 16 stalls)',
    venue: 'Hostel Promenade & Central Quadrangle Lawn',
    teamSize: 'Stall Teams: 3-5 Members (Visitors: Open for all)',
    fees: '₹300 stall license deposit (Fully refundable based on zero-waste compliance)',
    isFreeForFreshers: true,
    benefits: [
      'Teams keep 100% of their stall sales profits!',
      'Golden Spatula Award + ₹6,000 cash for Best Dish',
      'Free food coupons for all registered freshers',
      'Hygiene & Innovation special certification'
    ],
    howToRegister: 'Register your stall theme, intended food menu, and electrical/burner requirements using the form below.',
    status: 'Filling Fast',
    featured: true,
    color: '#f97316'
  },
  {
    id: 'event-7',
    eventNum: 'Event 07',
    title: 'Acoustica: Battle of the Bands & Acoustic Jam',
    category: 'music',
    categoryLabel: 'Music & Bands',
    tagline: 'Electric solos, soulful acoustic harmonies, beatboxing, and thunderous campus jams.',
    description: 'From rock riffs and classic melodies to rap battles and unplugged acoustic sets, Acoustica is the heartbeat of the cultural fest. Backline drums, amps, and microphones are set up for full bands as well as solo acoustic singer-songwriters.',
    when: 'November 29, 2026 · 5:00 PM - 10:30 PM',
    timeline: '5:00 PM Acoustic & Solo Vocals | 7:30 PM Beatboxing & Instrumental | 8:30 PM Full Band Headliners',
    deadline: 'Registration closes Nov 24, 2026',
    venue: 'Open-Air Amphitheatre Stage',
    teamSize: 'Solo Vocalists / Duos / Full Bands (up to 6 members)',
    fees: 'Free Entry for all campus performers',
    isFreeForFreshers: true,
    benefits: [
      'Best Band Title + ₹12,000 cash + Studio Recording Session',
      'Slots to perform at the annual cultural fest main stage',
      'Soundcheck and stage assistance by senior musicians',
      'Direct inclusion in the College Music Society'
    ],
    howToRegister: 'Submit your band/performer details along with a 1-minute audio/video sample or past clip for stage scheduling.',
    status: 'Open',
    featured: false,
    color: '#8b5cf6'
  },
  {
    id: 'event-8',
    eventNum: 'Event 08',
    title: 'Circuits & Silicon: Junior Hardware Project Expo',
    category: 'robotics',
    categoryLabel: 'Robotics & Hardware',
    tagline: 'Showcase your circuit designs, embedded IoT projects, and smart hardware builds.',
    description: 'A special exhibition platform crafted exclusively for 1st and 2nd year students to display DIY electronics, IoT smart home devices, PCB designs, and FPGA/VLSI prototypes. Senior engineers and faculty evaluate projects with constructive feedback rather than harsh grading.',
    when: 'December 02, 2026 · 11:00 AM - 3:30 PM',
    timeline: '10:30 AM Booth Setup | 11:30 AM Public & Junior Walkthrough | 2:00 PM Faculty Evaluation & Grants',
    deadline: 'Registration closes Nov 26, 2026',
    venue: 'Electronics & VLSI Lab, 3rd Floor',
    teamSize: '1 - 3 Members',
    fees: 'Free of Cost (Component funding grants available)',
    isFreeForFreshers: true,
    benefits: [
      'Seed Funding up to ₹10,000 for top 3 innovative prototypes',
      'Direct guidance to publish conference research papers',
      'Complimentary multi-meter and soldering toolkit for winners',
      'Letter of Recommendation for summer research internships'
    ],
    howToRegister: 'Provide a 150-word abstract of your project, components required, and team details in the registration form.',
    status: 'Open',
    featured: false,
    color: '#0ea5e9'
  },
  {
    id: 'event-9',
    eventNum: 'Event 09',
    title: 'FragFest: Valorant & BGMI Inter-College Esports',
    category: 'esports',
    categoryLabel: 'Esports & Gaming',
    tagline: '5v5 tactical shooter mayhem on 144Hz monitors and high-speed campus LAN.',
    description: 'The gaming society hosts FragFest with dedicated low-latency LAN servers and spectator shoutcasting. Featuring Valorant (5v5 Spike Rush + Competitive) and BGMI (Squad Battle Royale). Live stream on Discord and campus screens with student commentators.',
    when: 'December 04-05, 2026 · 6:00 PM onwards',
    timeline: 'Day 1: Knockout Qualifiers (Online/LAN) | Day 2: Semis & Grand Finals on Main Screen',
    deadline: 'Registration closes Nov 30, 2026',
    venue: 'Computer Lab 3 & Campus Discord Stream',
    teamSize: 'Valorant: 5 Members | BGMI: 4 Members',
    fees: '₹100 per team',
    isFreeForFreshers: false,
    benefits: [
      'Total Prize Pool ₹10,000 + Custom Gaming Mousepads',
      'Official MVP Medals and Bragging Rights',
      'Represent IIIT Kalyani in All-India Inter-IIIT Esports meets',
      'Live streamed cast with clips posted on YouTube/Instagram'
    ],
    howToRegister: 'Enter your in-game Riot IDs / BGMI UIDs and team tag via the registration modal below.',
    status: 'Open',
    featured: false,
    color: '#a855f7'
  },
  {
    id: 'event-10',
    eventNum: 'Event 10',
    title: 'Nukkad Natak: Street Theatre & Mono-Acts',
    category: 'drama',
    categoryLabel: 'Drama & Cultural',
    tagline: 'Raw voices, beating dholaks, satirical dialogues, and impactful social storytelling.',
    description: 'Nukkad Natak is the heartbeat of Indian street theatre. Student circles write and enact hard-hitting, funny, and emotional plays in a 360-degree open circle around the campus crowd. Topics range from mental health and engineering stereotypes to digital privacy and environmental action.',
    when: 'December 08, 2026 · 4:30 PM - 7:00 PM',
    timeline: '4:30 PM Gathering & Dholak Beats | 5:00 PM 15-minute Street Plays | 6:45 PM Mono-Acting Spotlights',
    deadline: 'Registration closes Dec 03, 2026',
    venue: 'Academic Block Fountain Circle',
    teamSize: 'Team Street Play: 6-12 Members | Mono-act: Solo',
    fees: 'Free of Cost',
    isFreeForFreshers: true,
    benefits: [
      'Best Production Trophy + ₹8,000 Cash',
      'Best Actor & Best Scriptwriter special citations',
      'Professional acting workshop by Kolkata Theatre alumni',
      'Permanent slot in the college annual drama squad'
    ],
    howToRegister: 'Register your team coordinator and submit a short synopsis of your street play theme.',
    status: 'Open',
    featured: false,
    color: '#eab308'
  },
  {
    id: 'event-11',
    eventNum: 'Event 11',
    title: 'Wordsmith: Parliamentary Debate & Model UN',
    category: 'literary',
    categoryLabel: 'Debate & Literary',
    tagline: 'Sharp wit, persuasive arguments, and fiery rebuttals on global affairs and tech policy.',
    description: 'Whether you are a seasoned debater or speaking in public for the first time, Wordsmith welcomes fresh voices. Formats include 3v3 Asian Parliamentary Debate and a mini Crisis Committee on "Ethics of Autonomous AI & Surveillance". Seniors provide orientation on debate etiquette and rebuttal tactics.',
    when: 'December 11, 2026 · 1:30 PM - 6:00 PM',
    timeline: '1:30 PM Motion Disclosure & Prep | 2:30 PM Round 1 Debates | 4:30 PM Grand Final Debate',
    deadline: 'Registration closes Dec 07, 2026',
    venue: 'Seminar Hall 1, Admin Building',
    teamSize: 'Teams of 3 (Solo registrations will be assigned a team)',
    fees: 'Free for Freshers (₹50 for senior batches)',
    isFreeForFreshers: true,
    benefits: [
      'Best Speaker Gavel + ₹6,000 Cash Prize',
      'Sponsored entry to National Parliamentary Debates',
      'Public speaking and leadership certification',
      'Free high-tea and networking session with judges'
    ],
    howToRegister: 'Click Register, choose your preference (Debater / Adjudicator), and enter your roll number.',
    status: 'Open',
    featured: false,
    color: '#14b8a6'
  },
  {
    id: 'event-12',
    eventNum: 'Event 12',
    title: 'Golden Hour: Campus Photo-Walk & Short Film Sprint',
    category: 'photo',
    categoryLabel: 'Photography & Film',
    tagline: 'Capture the soul of IIIT Kalyani through your lens, smartphone, or DSLR.',
    description: 'A 48-hour visual storytelling sprint! Walk around the Kalyani campus and township during the golden hour to capture architecture, student friendships, candid hostel life, or shoot a 60-second micro-short film. All entries will be screened in a special campus cinema night.',
    when: 'December 15-17, 2026 · Submission Deadline Dec 17, 8:00 PM',
    timeline: 'Dec 15 Theme Announcement | Dec 16 Golden Hour Photo Walk | Dec 17 8 PM Upload Freeze | Dec 18 Screening',
    deadline: 'Registration closes Dec 14, 2026',
    venue: 'Campus Grounds & Screening in Mini-Auditorium',
    teamSize: 'Photography: Solo | Short Film: 1-4 Members',
    fees: 'Free of Cost',
    isFreeForFreshers: true,
    benefits: [
      'DJI Smartphone Gimbal for Best Film + ₹5,000 Photography Prize',
      'Winners featured on official IIIT Kalyani social handles',
      'Prints exhibited at the Annual Convocation Gallery',
      'Direct induction into the Media & PR Committee'
    ],
    howToRegister: 'Fill in your name, camera or phone model, and select your category (Mobile Photography / DSLR / 60s Reel).',
    status: 'Open',
    featured: true,
    color: '#6366f1'
  }
];

const INTEREST_MAP = {
  robotics: {
    label: 'Robotics & Hardware',
    eventIds: ['event-1', 'event-8'],
    botResponse: "Robotics and hardware are huge here! With our dedicated IoT & robotics labs, you'll love RoboClash (Event 01) and Circuits & Silicon (Event 08). Let me take you right to them!"
  },
  coding: {
    label: 'Hackathons & Coding',
    eventIds: ['event-2'],
    botResponse: "A true coder! HackKalyani (Event 02) is our legendary 24-hour sprint where freshers team up with senior mentors, build crazy prototypes, and win prize bounties. Let's check it out!"
  },
  sports: {
    label: 'Sports & Football',
    eventIds: ['event-3'],
    botResponse: "Love sports? Our floodlit Futsal & Box Cricket Night League (Event 03) has insane energy under the campus lights. Get your boots ready!"
  },
  drawing: {
    label: 'Drawing & Art',
    eventIds: ['event-4'],
    botResponse: "An artist in our midst! Canvas Royale (Event 04) has both digital tablet and acrylic traditional categories with themes like Cyberpunk Bengal. Check out the details below!"
  },
  fashion: {
    label: 'Fashion & Style',
    eventIds: ['event-5'],
    botResponse: "Fashion & aesthetics! Vogue Nexus (Event 05) is our eco-futuristic runway where students showcase sustainable streetwear and futuristic couture on the auditorium ramp. You can't miss this!"
  },
  food: {
    label: 'Food Festival',
    eventIds: ['event-6'],
    botResponse: "Foodie alert! Zaika Street (Event 06) is our annual food carnival where you can run your own cooking stall or taste 15+ regional cuisines. Plus, freshers get free tasting coupons!"
  },
  music: {
    label: 'Music & Bands',
    eventIds: ['event-7'],
    botResponse: "Music is life here! Acoustica (Event 07) features electric rock bands, acoustic duos, and beatboxers in the open-air amphitheatre. You definitely need to see this!"
  },
  esports: {
    label: 'Esports & Gaming',
    eventIds: ['event-9'],
    botResponse: "Gamer spotted! FragFest (Event 09) features 5v5 Valorant on LAN and BGMI tournaments with live shoutcasting on Discord and big campus screens. Let's see the bracket!"
  },
  drama: {
    label: 'Drama & Theatre',
    eventIds: ['event-10'],
    botResponse: "Theatre lovers unite! Nukkad Natak (Event 10) brings raw dholak beats, street drama, and mono-acts right into the campus fountain circle. Check out the registration below!"
  },
  literary: {
    label: 'Debate & MUN',
    eventIds: ['event-11'],
    botResponse: "Love debates and diplomacy? Wordsmith (Event 11) features Parliamentary Debates and Model UN with free training sessions for freshers to build stage confidence!"
  },
  photo: {
    label: 'Photography & Film',
    eventIds: ['event-12'],
    botResponse: "Visual storyteller! Golden Hour (Event 12) is our campus photo-walk and 60-second micro film sprint with screenings in the mini-auditorium. Let's check it out!"
  }
};

// Expose on window for direct file:// or global script support
window.CATEGORIES = CATEGORIES;
window.EVENTS = EVENTS;
window.INTEREST_MAP = INTEREST_MAP;
