// DAKS SYSTEM - Main Website JavaScript (COMPLETE WORKING)

let currentTeamsData = [];
let currentCertificatesData = [];
let currentTournamentsData = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Page loaded');
  checkSession();
  loadData();
  initializeScrollReveal();
  setupListeners();
});

// Check if admin is logged in
function checkSession() {
  const session = localStorage.getItem('daksSystemSession');
  const adminPanelBtn = document.getElementById('adminPanelBtn');
  const loginBtn = document.getElementById('loginBtn');
  
  if (session) {
    if (adminPanelBtn) adminPanelBtn.style.display = 'flex';
    if (loginBtn) loginBtn.style.display = 'none';
  } else {
    if (adminPanelBtn) adminPanelBtn.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'flex';
  }
}

// Load all data from Firestore
async function loadData() {
  try {
    if (typeof db === 'undefined') {
      console.error('❌ Firebase not initialized');
      return;
    }
    
    console.log('📊 Loading data...');
    
    // Load teams
    const teamsSnapshot = await db.collection('teams').get();
    currentTeamsData = [];
    teamsSnapshot.forEach(doc => {
      currentTeamsData.push({ id: doc.id, ...doc.data() });
    });
    console.log('✅ Teams loaded:', currentTeamsData.length);
    displayTeams(currentTeamsData);
    
    // Load certificates
    const certsSnapshot = await db.collection('certificates').get();
    currentCertificatesData = [];
    certsSnapshot.forEach(doc => {
      currentCertificatesData.push({ id: doc.id, ...doc.data() });
    });
    console.log('✅ Certificates loaded:', currentCertificatesData.length);
    displayCertificates(currentCertificatesData);
    
    // Load tournaments
    const tournamentsSnapshot = await db.collection('tournaments').get();
    currentTournamentsData = [];
    tournamentsSnapshot.forEach(doc => {
      currentTournamentsData.push({ id: doc.id, ...doc.data() });
    });
    console.log('✅ Tournaments loaded:', currentTournamentsData.length);
    displayTournaments(currentTournamentsData);
    
  } catch (error) {
    console.error('❌ Error loading data:', error);
  }
}

// Display Teams
function displayTeams(teams) {
  const grid = document.getElementById('teamsGrid');
  if (!grid) {
    console.error('❌ teamsGrid not found');
    return;
  }
  
  if (!teams || teams.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--muted-gold);">
        <i class="fas fa-users" style="font-size:4rem;margin-bottom:1rem;"></i>
        <p style="font-size:1.2rem;">No teams available yet</p>
      </div>
    `;
    return;
  }
  
  grid.innerHTML = teams.map((team) => {
    const logo = team.logoUrl 
      ? `<img src="${team.logoUrl}" alt="${team.name}" style="width:100%;height:100%;object-fit:cover;">`
      : `<i class="fas fa-users banner-logo"></i>`;
    
    return `
      <div class="team-card" onclick="showTeamDetails('${team.id}')" style="cursor:pointer;">
        <div class="banner-placeholder">${logo}</div>
        <div class="team-info">
          <div class="team-name">${team.name}</div>
          <div class="team-leader"><i class="fas fa-user-tie"></i> Captain: ${team.captain}</div>
          <div class="team-stats">
            <span>🏆 ${team.wins || 0} Wins</span>
            <span>⭐ ${team.rating || 0} Rating</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  console.log('✅ Teams displayed');
}

// Show Team Details Modal
function showTeamDetails(teamId) {
  console.log('🖱️ Team clicked:', teamId);
  
  const team = currentTeamsData.find(t => t.id === teamId);
  
  if (!team) {
    console.error('❌ Team not found:', teamId);
    alert('Team not found');
    return;
  }
  
  console.log('✅ Showing team:', team.name);
  
  const modal = document.getElementById('teamModal');
  const modalContent = document.getElementById('modalContent');
  
  if (!modal || !modalContent) {
    console.error('❌ Modal elements not found');
    alert('Modal not found. Check your HTML.');
    return;
  }
  
  const members = team.members || [];
  const wins = team.wins || 0;
  const rating = team.rating || 0;
  
  modalContent.innerHTML = `
    <h2 style="color:var(--gold);margin-bottom:1rem;font-size:1.5rem;">${team.name}</h2>
    
    ${team.logoUrl ? `
      <img src="${team.logoUrl}" alt="${team.name}" 
        style="width:100%;height:250px;object-fit:contain;background:#0b0b0b;border-radius:10px;margin-bottom:1rem;">
    ` : ''}
    
    <div style="margin-bottom:1rem;">
      <p style="margin-bottom:0.3rem;"><strong>Captain:</strong> ${team.captain}</p>
      <p style="margin-bottom:0.3rem;"><strong>Wins:</strong> ${wins}</p>
      <p style="margin-bottom:0.3rem;"><strong>Rating:</strong> ⭐ ${rating}/5.0</p>
    </div>
    
    ${members.length > 0 ? `
      <div>
        <h3 style="color:var(--gold-soft);margin-bottom:0.5rem;font-size:1.1rem;">Team Roster</h3>
        ${members.map(member => `<p style="margin-bottom:0.2rem;">• ${member}</p>`).join('')}
      </div>
    ` : ''}
  `;
  
  modal.style.display = 'block';
}

// Close Modal
function closeModal() {
  const modal = document.getElementById('teamModal');
  if (modal) modal.style.display = 'none';
}

// Close modal on outside click
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
}

// Close modal with Escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});

// Display Certificates
function displayCertificates(certificates) {
  const container = document.getElementById('achievementsContainer');
  if (!container) return;
  
  if (!certificates || certificates.length === 0) {
    container.innerHTML = '<p style="text-align:center;padding:2rem;color:#999;">No certificates issued yet</p>';
    return;
  }
  
  const icons = ['fa-certificate', 'fa-award', 'fa-star', 'fa-trophy'];
  
  container.innerHTML = certificates.slice(0, 6).map((cert, i) => `
    <div class="achievement-card">
      <i class="fas ${icons[i % 4]} achievement-icon"></i>
      <div class="achievement-content">
        <h3>${cert.title}</h3>
        <p>${cert.description}</p>
        <span class="certificate-badge">${cert.teamName || 'DAKS'}</span>
      </div>
    </div>
  `).join('');
}

// Display Tournaments - WITH EMBEDDED CHALLONGE IFRAME
function displayTournaments(tournaments) {
  const currentBracket = document.getElementById('currentBracket');
  const upcomingDiv = document.getElementById('upcomingTournament');
  const pastDiv = document.getElementById('pastTournament');
  
  if (!tournaments || tournaments.length === 0) {
    if (currentBracket) currentBracket.innerHTML = '<p style="text-align:center;color:#999;">No tournaments</p>';
    if (upcomingDiv) upcomingDiv.innerHTML = '<p style="text-align:center;color:#999;">No upcoming</p>';
    if (pastDiv) pastDiv.innerHTML = '<p style="text-align:center;color:#999;">No past tournaments</p>';
    return;
  }
  
  // CURRENT/ACTIVE - Show Challonge iframe directly
  if (currentBracket) {
    const active = tournaments.filter(t => t.status === 'active');
    
    if (active.length > 0 && active[0].challongeUrl) {
      const t = active[0];
      let challongeUrl = t.challongeUrl.trim().replace(/\/$/, '');
      if (!challongeUrl.includes('/module')) {
        challongeUrl += '/module';
      }
      
      currentBracket.innerHTML = `
        <div style="background:#111;border:2px solid var(--gold);border-radius:1rem;overflow:hidden;">
          <div style="padding:1rem;text-align:center;border-bottom:2px solid var(--gold);background:#1a1a1a;">
            <h3 style="color:var(--gold);margin:0;">🏆 ${t.name}</h3>
          </div>
          <iframe src="${challongeUrl}" width="100%" height="600" frameborder="0" scrolling="auto" allowtransparency="true" style="display:block;background:white;border:none;"></iframe>
        </div>
      `;
    } else if (active.length > 0) {
      currentBracket.innerHTML = `<p style="text-align:center;color:#999;padding:2rem;">No bracket URL for ${active[0].name}</p>`;
    } else {
      currentBracket.innerHTML = '<p style="text-align:center;color:#999;padding:2rem;">No active tournament</p>';
    }
  }
  
  // PAST - Show Challonge iframe directly
  if (pastDiv) {
    const completed = tournaments.filter(t => t.status === 'completed');
    
    if (completed.length > 0) {
      pastDiv.innerHTML = completed.map(t => {
        let challongeUrl = t.challongeUrl ? t.challongeUrl.trim().replace(/\/$/, '') : '';
        if (challongeUrl && !challongeUrl.includes('/module')) {
          challongeUrl += '/module';
        }
        
        return `
          <div style="background:#111;border:1px solid rgba(212,175,55,0.3);border-radius:1rem;overflow:hidden;margin-bottom:1rem;">
            <div style="padding:0.75rem;text-align:center;border-bottom:1px solid rgba(212,175,55,0.3);background:#1a1a1a;">
              <h3 style="color:var(--gold);margin:0;font-size:1rem;">🏆 ${t.name}</h3>
            </div>
            ${challongeUrl ? `
              <iframe src="${challongeUrl}" width="100%" height="500" frameborder="0" scrolling="auto" allowtransparency="true" style="display:block;background:white;border:none;"></iframe>
            ` : '<p style="text-align:center;color:#ff6b7a;padding:1rem;">No bracket URL set</p>'}
          </div>
        `;
      }).join('');
    } else {
      pastDiv.innerHTML = '<p style="text-align:center;color:#999;">No past tournaments</p>';
    }
  }
  
  // UPCOMING
  if (upcomingDiv) {
    const upcoming = tournaments.filter(t => t.status === 'upcoming');
    if (upcoming.length > 0) {
      upcomingDiv.innerHTML = `
        <i class="fas fa-calendar-alt upcoming-icon"></i>
        <h3>${upcoming[0].name}</h3>
        <p>Starts: ${upcoming[0].startDate}</p>
      `;
    } else {
      upcomingDiv.innerHTML = '<p style="text-align:center;color:#999;">No upcoming tournaments</p>';
    }
  }
}

// Scroll to Section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) section.scrollIntoView({ behavior: 'smooth' });
}

// Switch Tournament Tab
function switchTournament(tab, event) {
  document.querySelectorAll('.tournament-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const selected = document.getElementById(`${tab}-tournament`);
  if (selected) selected.classList.add('active');
  if (event && event.target) event.target.classList.add('active');
}

// Initialize Scroll Reveal
function initializeScrollReveal() {
  window.checkReveal = function() {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => {
      const top = el.getBoundingClientRect().top;
      if (top < window.innerHeight - 100) {
        el.classList.add('visible');
      }
    });
  };
  window.addEventListener('scroll', window.checkReveal);
  window.checkReveal();
}

// Setup Real-time Listeners
function setupListeners() {
  if (typeof db === 'undefined') return;
  
  db.collection('teams').onSnapshot(() => {
    console.log('🔄 Teams updated');
    loadData();
  });
  
  db.collection('tournaments').onSnapshot(() => {
    console.log('🔄 Tournaments updated');
    loadData();
  });
  
  db.collection('certificates').onSnapshot(() => {
    console.log('🔄 Certificates updated');
    loadData();
  });
}