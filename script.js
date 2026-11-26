/* ============================================================
   STORAGE
   ============================================================ */
const STORE_FLIGHTS  = 'skyhigh_flights';
const STORE_BOOKINGS = 'skyhigh_bookings';

let flights  = JSON.parse(localStorage.getItem(STORE_FLIGHTS))  || [];
let bookings = JSON.parse(localStorage.getItem(STORE_BOOKINGS)) || [];

function persist() {
  localStorage.setItem(STORE_FLIGHTS,  JSON.stringify(flights));
  localStorage.setItem(STORE_BOOKINGS, JSON.stringify(bookings));
}

/* ============================================================
   SEED DATA
   ============================================================ */
function dateOffset(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function seedFlights() {
  if (flights.length) return;
  flights = [
    { id:'FL001', airline:'SkyHigh Airlines', from:'New York',    to:'Los Angeles', date:dateOffset(1), time:'08:00', price:299, seats:150, booked:0 },
    { id:'FL002', airline:'SkyHigh Airlines', from:'Los Angeles', to:'New York',    date:dateOffset(1), time:'14:30', price:349, seats:150, booked:0 },
    { id:'FL003', airline:'SkyHigh Airlines', from:'Chicago',     to:'Miami',       date:dateOffset(2), time:'10:15', price:199, seats:120, booked:0 },
    { id:'FL004', airline:'SkyHigh Airlines', from:'Miami',       to:'Chicago',     date:dateOffset(2), time:'16:45', price:219, seats:120, booked:0 },
    { id:'FL005', airline:'SkyHigh Airlines', from:'New York',    to:'London',      date:dateOffset(3), time:'19:00', price:599, seats:200, booked:0 },
    { id:'FL006', airline:'SkyHigh Airlines', from:'London',      to:'New York',    date:dateOffset(3), time:'21:30', price:649, seats:200, booked:0 },
    { id:'FL007', airline:'SkyHigh Airlines', from:'Paris',       to:'Tokyo',       date:dateOffset(4), time:'11:00', price:799, seats:180, booked:0 },
    { id:'FL008', airline:'SkyHigh Airlines', from:'Tokyo',       to:'Paris',       date:dateOffset(4), time:'23:00', price:849, seats:180, booked:0 },
    { id:'FL009', airline:'SkyHigh Airlines', from:'Dubai',       to:'New York',    date:dateOffset(5), time:'02:00', price:699, seats:250, booked:0 },
    { id:'FL010', airline:'SkyHigh Airlines', from:'Los Angeles', to:'Chicago',     date:dateOffset(5), time:'12:00', price:249, seats:140, booked:0 }
  ];
  persist();
}

/* ============================================================
   NAVIGATION
   ============================================================ */
function goPage(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  if (btn) btn.classList.add('active');

  if (page === 'bookings') renderBookings();
  if (page === 'admin')    renderAdmin();
}

/* ============================================================
   TOAST
   ============================================================ */
let toastTimer = null;
function toast(msg, type = 'success') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className = 'toast show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3500);
}

/* ============================================================
   HELPERS
   ============================================================ */
function arrivalTime(t) {
  const [h, m] = t.split(':').map(Number);
  const d = new Date();
  d.setHours(h + 5, m + 30);
  return d.toTimeString().slice(0, 5);
}

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric' });
}

function seatClass(avail) {
  if (avail === 0) return 'pill-red';
  if (avail < 20)  return 'pill-amber';
  return 'pill-green';
}

function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));
}

/* ============================================================
   SEARCH
   ============================================================ */
function doSearch() {
  const from = document.getElementById('from').value;
  const to   = document.getElementById('to').value;
  const date = document.getElementById('date').value;
  const pax  = parseInt(document.getElementById('pax').value, 10);
  const out  = document.getElementById('results');

  if (!from || !to) { toast('Please select both cities.', 'error'); return; }
  if (from === to)  { toast('Departure and destination must differ.', 'error'); return; }

  let list = flights.filter(f =>
    f.from === from &&
    f.to === to &&
    (f.seats - f.booked) >= pax
  );
  if (date) list = list.filter(f => f.date === date);

  if (!list.length) {
    out.innerHTML = `
      <div class="empty">
        <div class="empty-icon">✈</div>
        <h3>No flights match your search</h3>
        <p>Try a different route or date.</p>
      </div>`;
    return;
  }

  out.innerHTML = `
    <div class="results-header">
      <div class="section-title">Available flights</div>
      <div class="results-count">${list.length} result${list.length > 1 ? 's' : ''} · ${pax} passenger${pax > 1 ? 's' : ''}</div>
    </div>
    ${list.map(f => {
      const avail = f.seats - f.booked;
      return `
        <div class="flight-row">
          <div class="flight-top">
            <div class="flight-name">${esc(f.airline)}<span class="flight-code">${f.id}</span></div>
            <div class="flight-price">$${f.price}</div>
          </div>
          <div class="flight-route">
            <div class="route-point">
              <div class="route-time">${f.time}</div>
              <div class="route-city">${esc(f.from)}</div>
            </div>
            <div class="route-line"></div>
            <div class="route-point to">
              <div class="route-time">${arrivalTime(f.time)}</div>
              <div class="route-city">${esc(f.to)}</div>
            </div>
          </div>
          <div class="flight-bottom">
            <div class="flight-info">
              <span><strong>${fmtDate(f.date)}</strong></span>
              <span class="pill ${seatClass(avail)}">${avail} seats left</span>
            </div>
            <button class="btn btn-primary btn-sm" onclick="startBooking('${f.id}', ${pax})">Book</button>
          </div>
        </div>`;
    }).join('')}
  `;
}

/* ============================================================
   BOOKING FLOW
   ============================================================ */
let pending = null;

function startBooking(flightId, pax) {
  const flight = flights.find(f => f.id === flightId);
  if (!flight) return;

  const avail = flight.seats - flight.booked;
  if (avail < pax) { toast('Not enough seats available.', 'error'); return; }

  pending = { flight, pax };

  const summary = `
    <div class="summary-panel">
      <h4>Flight summary</h4>
      <div class="summary-row"><span>Flight</span><strong>${flight.id}</strong></div>
      <div class="summary-row"><span>Route</span><strong>${esc(flight.from)} → ${esc(flight.to)}</strong></div>
      <div class="summary-row"><span>Date</span><strong>${fmtDate(flight.date)}</strong></div>
      <div class="summary-row"><span>Departure</span><strong>${flight.time}</strong></div>
      <div class="summary-row"><span>Passengers</span><strong>${pax}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>$${flight.price * pax}</strong></div>
    </div>
  `;

  let forms = '';
  for (let i = 0; i < pax; i++) {
    forms += `
      <div class="passenger-card">
        <h5>Passenger ${i + 1}</h5>
        <div class="passenger-grid">
         