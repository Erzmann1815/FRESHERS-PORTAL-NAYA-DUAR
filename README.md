# IIIT Kalyani · Junior Events & Orientation Portal 🎓

An interactive campus orientation and events experience designed for college juniors and freshers at **Indian Institute of Information Technology, Kalyani (IIIT Kalyani)**, branded as **Naya Dau (नया दुअर)**.

---

## 🌟 Key Features

### 1. Interactive 3D Campus Gate & Scrollytelling (Three.js)
- **3D IIIT Kalyani Main Entrance:** Real-time campus pillars, a marigold-draped archway, road, low-poly trees, animated flowerbeds, and academic blocks.
- **Automatic Arrival Flight:** An 11.5-second aerial camera approaches the arrival car and follows the junior through the gate. Page scrolling is locked until the arrival completes.
- **Scroll-Driven Campus Camera:** After the opening flight, the camera follows the page through the gate, campus quad, and events arena.
- **Day and Dusk Themes:** Light mode uses daylight, visible building windows, and garden flowers; dark mode restores the dusk lighting.
- **Mouse Parallax:** Natural 3D tilt tracking cursor motion.

### 2. Conversational Senior-Junior Icebreaker
- **Scene:** A fresher stands at the campus gate with a backpack. A senior guide approaches with a warm greeting:
  > *"Hey there! Welcome to IIIT Kalyani! First time walking through the campus gates? What are you most into or excited about?"*
- **Interactive Interest Selection:** Quick chips for *Technical, Cultural, and Sports* events.
- **Senior Guide Response:** The guide recommends matching events from the supplied event guide.
- **Explore Events:** Move to the Events Arena with matching events highlighted.

### 3. Events From the Registration Guide
The page lists 10 events across Technical, Cultural, and Sports categories:
- **Technical:** DEVSprint, BOTClash, HackShield, Circuit Sprint
- **Cultural:** Sonic Glow, ArtCafe, Stage Strike
- **Sports:** Moonlight Hoops, RunFor5K, Pixel Playoff
- Each event shows the guide's description, date and time, venue, fee, prize pool, and registration instructions.
- The guide does not provide registration deadlines or detailed schedules for every event; the page marks missing information rather than inventing it.

### 4. Registration, Student Verification & Pass Wallet
- Paid-event registration checks the student's name, roll number, institute registration number, and email ID together against the private roster before showing the payment summary.
- Case, spacing, and common punctuation differences are normalized; all four fields still must match the same roster record.
- A mismatch leaves the form open with an error. Free-entry registrations create a local demo pass.
- **"My Passes" Wallet:** Visitors can view and remove records saved in the current browser.
- A payment provider is not configured; the payment summary does not take money or issue a paid pass.
- Razorpay test checkout creates orders and verifies captured payments on the Node server. Demo registrations are still stored only in the current browser.

### 5. Background Audio
- `assets/background-audio.mp3` provides looping campus background audio with a play/pause toggle in the navbar.
- The page attempts autoplay and retries on the name-form submission, a user gesture browsers allow to start sound. If the bundled track cannot be decoded, a quiet synthesized ambience is used instead.
- Browsers can block audible autoplay before the first user gesture; a website cannot bypass that policy.
- Share the whole project folder, including `assets/background-audio.mp3`, or deploy the whole folder. Sharing `index.html` alone will not include the track.

---

## 🚀 How to Run

### Option 1: Run the Verification Server Locally
Node.js 20 or newer is required. Keep both roster PDFs in the ignored `private-roster/` folder; never commit or publish them.

```bash
npm install
npm start
```

Open `http://localhost:3000`. The server reads only Name, Roll no, and Registration no from the roster PDFs, ignores the password/email columns, and serves an explicit public-file allowlist.
Open `http://localhost:3000`. The server reads only Name, Roll no, Registration no, and email ID from the roster PDFs and serves an explicit public-file allowlist. To use Razorpay's test checkout, set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` in the server environment before starting it. Use test-mode credentials only; the server rejects live key IDs. Keep the secret off the client and out of source control.

Opening `index.html` directly or hosting it on GitHub Pages does not provide secure verification. Paid registration will not work without the Node server.

### Production Hosting
Deploy the Node server to a private backend host with HTTPS. Set `HOST=0.0.0.0`, configure `PORT` as required by the host, and provision the two PDFs in a private directory outside the served files. Set `ROSTER_DIR` to that directory. Do not deploy this verification flow to GitHub Pages; GitHub Pages cannot run the API.

### Custom Domain & Production Security
- To use a custom domain, register the exact domain name, add it in the hosting provider's custom-domain settings, and configure the DNS records that provider specifies. The deployed URL cannot be changed from the page's HTML.
- Enable HTTPS in the hosting provider after DNS verification. Security headers such as Content-Security-Policy and Strict-Transport-Security must be configured by the host or a reverse proxy.
- Registration records remain in the visitor's browser; only paid-event identity verification is server-side.
- Section A and Section B are private student rosters. The server ignores their password/email columns, and `.gitignore` excludes `private-roster/`. Keep them out of public repositories and static hosting directories.
- No payment provider or payment gateway is configured. Do not accept real payments through this portal until checkout and server-side payment confirmation are integrated.
- The checkout integration is test-mode only. It is a demo, not a production registration system: registrations remain in browser storage, and payment-to-student registration persistence and operational reconciliation are not implemented. Never use live Razorpay credentials or accept real payments through this portal.
- The background audio attempts autoplay, but browsers may block audible autoplay and the bundled audio file should be verified in the target browser before deployment.

---

## 📁 Project Structure

```
iiit-kalyani-juniors/
├── index.html           # Main semantic HTML structure & sections
├── README.md            # Documentation & deployment guide
├── css/
│   └── style.css        # Naya Dau color palette, glassmorphism & 3D styling
├── js/
│   ├── events-data.js   # Legacy event dataset (the active page uses inline guide data)
│   ├── three-scene.js   # Three.js 3D campus gate, characters & camera physics
│   ├── story-dialogue.js# Interactive senior guide dialogue engine
│   └── main.js          # App controller, event filtering, modals & pass wallet
└── assets/              # Icons and media
```

---

*Crafted with pride by seniors for IIIT Kalyani juniors.*
