// DAKS SYSTEM - Admin Dashboard (COMPLETE WITH DELETE CERTIFICATE)

let currentUser = null;
let currentTeams = [];
let currentCertificates = [];
let currentTournaments = [];
let currentContent = null;
let uploadedLogoUrl = null;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  console.log('🔍 Initializing admin...');
  
  const sessionData = JSON.parse(localStorage.getItem('daksSystemSession') || 'null');
  
  if (!sessionData) {
    window.location.replace('login.html');
    return;
  }
  
  currentUser = sessionData;
  document.getElementById('adminName').textContent = sessionData.name || 'Admin';
  document.getElementById('adminAccountName').value = sessionData.name || '';
  document.getElementById('adminAccountEmail').value = sessionData.email || '';
  
  loadAllData();
  setupForms();
  console.log('✅ Admin initialized');
});

// Setup all form handlers
function setupForms() {
  const teamForm = document.getElementById('teamForm');
  if (teamForm) teamForm.addEventListener('submit', saveTeam);
  
  const certificateForm = document.getElementById('certificateForm');
  if (certificateForm) certificateForm.addEventListener('submit', saveCertificate);
  
  const tournamentForm = document.getElementById('tournamentForm');
  if (tournamentForm) tournamentForm.addEventListener('submit', saveTournament);
  
  const adminForm = document.getElementById('adminAccountForm');
  if (adminForm) adminForm.addEventListener('submit', changePassword);
  
  const heroForm = document.getElementById('heroContentForm');
  if (heroForm) heroForm.addEventListener('submit', saveHeroContent);
  
  const founderForm = document.getElementById('founderContentForm');
  if (founderForm) founderForm.addEventListener('submit', saveFounderContent);
  
  const regForm = document.getElementById('registrationContentForm');
  if (regForm) regForm.addEventListener('submit', saveRegistrationContent);
  
  const footerForm = document.getElementById('footerContentForm');
  if (footerForm) footerForm.addEventListener('submit', saveFooterContent);
}

// Load all data
async function loadAllData() {
  await loadTeams();
  await loadCertificates();
  await loadTournaments();
  await loadContent();
  updateStats();
}

// Load Teams
async function loadTeams() {
  try {
    const snapshot = await db.collection('teams').get();
    currentTeams = [];
    snapshot.forEach(doc => currentTeams.push({ id: doc.id, ...doc.data() }));
    renderTeams();
    populateTeamSelect();
  } catch (error) {
    console.error('Error loading teams:', error);
  }
}

// Load Certificates
async function loadCertificates() {
  try {
    const snapshot = await db.collection('certificates').get();
    currentCertificates = [];
    snapshot.forEach(doc => currentCertificates.push({ id: doc.id, ...doc.data() }));
    renderCertificates();
  } catch (error) {
    console.error('Error loading certificates:', error);
  }
}

// Load Tournaments
async function loadTournaments() {
  try {
    const snapshot = await db.collection('tournaments').get();
    currentTournaments = [];
    snapshot.forEach(doc => currentTournaments.push({ id: doc.id, ...doc.data() }));
    renderTournaments();
  } catch (error) {
    console.error('Error loading tournaments:', error);
  }
}

// Load Content
async function loadContent() {
  try {
    const doc = await db.collection('content').doc('website').get();
    if (doc.exists) {
      currentContent = doc.data();
    } else {
      currentContent = getDefaultContent();
    }
    loadContentForms();
  } catch (error) {
    console.error('Error loading content:', error);
  }
}

function getDefaultContent() {
  return {
    hero: {
      subtitle: 'premium esports management',
      title: 'FORGE YOUR',
      highlight: 'LEGACY',
      description: 'Six elite teams. One vision.',
      buttonText: 'Register for Tournament'
    },
    founder: {
      name: 'MYLYKES',
      quote: 'True leadership is measured by the strength of the teams you empower.',
      title: 'visionary founder',
      signature: 'Mylykes, Founding Visionary'
    },
    registration: {
      url: 'https://docs.google.com/forms/d/1hhS8IsiMIJGG_-Xv9SyOH_R9wcWcnhMHddG3Gvohi8A/edit',
      title: 'Register for Tournament',
      description: 'Click the button below to register',
      email: 'registration@dakssystem.com'
    },
    footer: {
      copyright: '© 2025 DAKS SYSTEM · All rights reserved',
      tagline: 'Premium Management & Esports Organization'
    }
  };
}

function loadContentForms() {
  if (!currentContent) return;
  
  document.getElementById('heroSubtitleInput').value = currentContent.hero?.subtitle || '';
  document.getElementById('heroTitleInput').value = currentContent.hero?.title || '';
  document.getElementById('heroHighlightInput').value = currentContent.hero?.highlight || '';
  document.getElementById('heroDescriptionInput').value = currentContent.hero?.description || '';
  document.getElementById('heroButtonTextInput').value = currentContent.hero?.buttonText || '';
  
  document.getElementById('founderNameInput').value = currentContent.founder?.name || '';
  document.getElementById('founderQuoteInput').value = currentContent.founder?.quote || '';
  document.getElementById('founderTitleInput').value = currentContent.founder?.title || '';
  document.getElementById('founderSignatureInput').value = currentContent.founder?.signature || '';
  
  document.getElementById('regFormUrlInput').value = currentContent.registration?.url || '';
  document.getElementById('regTitleInput').value = currentContent.registration?.title || '';
  document.getElementById('regDescriptionInput').value = currentContent.registration?.description || '';
  document.getElementById('regEmailInput').value = currentContent.registration?.email || '';
  
  document.getElementById('footerCopyrightInput').value = currentContent.footer?.copyright || '';
  document.getElementById('footerTaglineInput').value = currentContent.footer?.tagline || '';
}

// Update Stats
function updateStats() {
  document.getElementById('totalTeams').textContent = currentTeams.length;
  document.getElementById('totalCertificates').textContent = currentCertificates.length;
  document.getElementById('activeTournaments').textContent = currentTournaments.filter(t => t.status === 'active').length;
}

// Render Teams
function renderTeams() {
  const tbody = document.getElementById('teamsTableBody');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  
  if (currentTeams.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted-gold);">No teams. Click "Add Team"</td></tr>';
    return;
  }
  
  currentTeams.forEach(team => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${team.logoUrl ? `<img src="${team.logoUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;">` : '🏆'}</td>
      <td>${team.name}</td>
      <td>${team.captain}</td>
      <td>${team.members ? team.members.length : 0} members</td>
      <td>
        <button class="btn-edit" onclick="editTeam('${team.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn-danger" onclick="deleteTeam('${team.id}')"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Render Certificates WITH DELETE BUTTON
function renderCertificates() {
  const grid = document.getElementById('certificatesGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  if (currentCertificates.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted-gold);text-align:center;padding:2rem;">No certificates issued</p>';
    return;
  }
  
  currentCertificates.forEach(cert => {
    const card = document.createElement('div');
    card.className = 'certificate-card';
    card.innerHTML = `
      <i class="fas fa-certificate certificate-icon"></i>
      <h3 class="certificate-title">${cert.title}</h3>
      <p class="certificate-team">${cert.teamName}</p>
      <p style="color:var(--muted-gold);font-size:0.9rem;">${cert.description}</p>
      <p style="color:var(--muted-gold);font-size:0.8rem;">Issued: ${cert.date}</p>
      <button class="btn-danger" onclick="deleteCertificate('${cert.id}')" style="margin-top:1rem;width:100%;padding:0.6rem;border-radius:0.5rem;border:1px solid rgba(220,53,69,0.3);background:rgba(220,53,69,0.1);color:#ff6b7a;cursor:pointer;font-weight:600;font-size:0.85rem;">
        <i class="fas fa-trash"></i> Delete Certificate
      </button>
    `;
    grid.appendChild(card);
  });
}

// DELETE CERTIFICATE
async function deleteCertificate(certId) {
  console.log('🗑️ Deleting certificate:', certId);
  
  if (!confirm('Are you sure you want to delete this certificate?')) {
    return;
  }
  
  try {
    await db.collection('certificates').doc(certId).delete();
    console.log('✅ Certificate deleted');
    alert('Certificate deleted successfully!');
    await loadCertificates();
    updateStats();
  } catch (error) {
    console.error('❌ Error:', error);
    alert('Error: ' + error.message);
  }
}

// Render Tournaments
function renderTournaments() {
  const list = document.getElementById('tournamentsList');
  if (!list) return;
  
  list.innerHTML = '';
  
  if (currentTournaments.length === 0) {
    list.innerHTML = '<p style="color:var(--muted-gold);text-align:center;padding:2rem;">No tournaments yet</p>';
    return;
  }
  
  currentTournaments.forEach(tournament => {
    const card = document.createElement('div');
    card.className = 'tournament-card';
    const statusClass = `status-${tournament.status}`;
    const statusText = tournament.status.charAt(0).toUpperCase() + tournament.status.slice(1);
    
    card.innerHTML = `
      <div class="tournament-info">
        <h3>${tournament.name}</h3>
        <p>${tournament.startDate} to ${tournament.endDate}</p>
        ${tournament.challongeUrl ? `<p style="color:var(--gold);font-size:0.8rem;">🔗 ${tournament.challongeUrl}</p>` : '<p style="color:#ff6b7a;font-size:0.8rem;">No URL</p>'}
      </div>
      <div>
        <span class="tournament-status ${statusClass}">${statusText}</span>
        <button class="btn-edit" onclick="editTournament('${tournament.id}')" style="margin-top:0.5rem;display:block;width:100%;">Edit</button>
        <button class="btn-danger" onclick="deleteTournament('${tournament.id}')" style="margin-top:0.5rem;display:block;width:100%;">Delete</button>
      </div>
    `;
    list.appendChild(card);
  });
}

// Populate Team Select
function populateTeamSelect() {
  const select = document.getElementById('certTeamSelect');
  if (!select) return;
  
  select.innerHTML = '<option value="">Select Team</option>';
  currentTeams.forEach(team => {
    const opt = document.createElement('option');
    opt.value = team.id;
    opt.textContent = team.name;
    select.appendChild(opt);
  });
}

// Handle Logo Upload
function handleLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedLogoUrl = e.target.result;
    document.getElementById('teamLogoPreview').src = e.target.result;
    document.getElementById('teamLogoPreview').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

// Open Team Modal
function openTeamModal(teamId = null) {
  uploadedLogoUrl = null;
  document.getElementById('teamLogoPreview').style.display = 'none';
  document.getElementById('teamLogoInput').value = '';
  document.getElementById('teamForm').reset();
  
  if (teamId) {
    const team = currentTeams.find(t => t.id === teamId);
    if (team) {
      document.getElementById('teamModalTitle').textContent = 'Edit Team';
      document.getElementById('teamId').value = team.id;
      document.getElementById('teamNameInput').value = team.name;
      document.getElementById('captainNameInput').value = team.captain;
      document.getElementById('teamMembersInput').value = team.members ? team.members.join(', ') : '';
      document.getElementById('teamWinsInput').value = team.wins || 0;
      document.getElementById('teamRatingInput').value = team.rating || 4.5;
      if (team.logoUrl) {
        uploadedLogoUrl = team.logoUrl;
        document.getElementById('teamLogoPreview').src = team.logoUrl;
        document.getElementById('teamLogoPreview').style.display = 'block';
      }
    }
  } else {
    document.getElementById('teamModalTitle').textContent = 'Add Team';
  }
  
  document.getElementById('teamModal').style.display = 'block';
}

// Save Team
async function saveTeam(e) {
  e.preventDefault();
  const teamId = document.getElementById('teamId').value;
  const teamData = {
    name: document.getElementById('teamNameInput').value,
    captain: document.getElementById('captainNameInput').value,
    members: document.getElementById('teamMembersInput').value.split(',').map(m => m.trim()).filter(m => m),
    wins: parseInt(document.getElementById('teamWinsInput').value) || 0,
    rating: parseFloat(document.getElementById('teamRatingInput').value) || 4.5,
    logoUrl: uploadedLogoUrl || null,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  if (!teamData.name || !teamData.captain) {
    alert('Please fill in required fields');
    return;
  }
  
  try {
    if (teamId) {
      await db.collection('teams').doc(teamId).update(teamData);
    } else {
      teamData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('teams').add(teamData);
    }
    closeModal('teamModal');
    alert('✅ Team saved!');
    await loadTeams();
    updateStats();
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// Delete Team
async function deleteTeam(teamId) {
  if (confirm('Delete this team?')) {
    await db.collection('teams').doc(teamId).delete();
    await loadTeams();
    updateStats();
  }
}

function editTeam(teamId) {
  openTeamModal(teamId);
}

// Open Certificate Modal
function openCertificateModal() {
  document.getElementById('certificateModal').style.display = 'block';
  document.getElementById('certificateForm').reset();
  document.getElementById('certDate').value = new Date().toISOString().split('T')[0];
}

// Save Certificate
async function saveCertificate(e) {
  e.preventDefault();
  const teamId = document.getElementById('certTeamSelect').value;
  const team = currentTeams.find(t => t.id === teamId);
  if (!team) { alert('Select a team'); return; }
  
  await db.collection('certificates').add({
    teamName: team.name,
    title: document.getElementById('certTitle').value,
    description: document.getElementById('certDescription').value,
    date: document.getElementById('certDate').value,
    dateIssued: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  closeModal('certificateModal');
  alert('✅ Certificate issued!');
  await loadCertificates();
  updateStats();
}

// Open Tournament Modal
function openTournamentModal(tournamentId = null) {
  const modal = document.getElementById('tournamentModal');
  const form = document.getElementById('tournamentForm');
  const title = document.getElementById('tournamentModalTitle');
  
  form.reset();
  document.getElementById('tournamentId').value = '';
  
  if (tournamentId) {
    const tournament = currentTournaments.find(t => t.id === tournamentId);
    if (tournament) {
      title.textContent = 'Edit Tournament';
      document.getElementById('tournamentId').value = tournament.id;
      document.getElementById('tournamentNameInput').value = tournament.name || '';
      document.getElementById('challongeUrlInput').value = tournament.challongeUrl || '';
      document.getElementById('tournamentStartDate').value = tournament.startDate || '';
      document.getElementById('tournamentEndDate').value = tournament.endDate || '';
      document.getElementById('tournamentDescription').value = tournament.description || '';
      document.getElementById('tournamentStatus').value = tournament.status || 'upcoming';
    }
  } else {
    title.textContent = 'Create Tournament';
  }
  
  modal.style.display = 'block';
}

function editTournament(tournamentId) {
  openTournamentModal(tournamentId);
}

// Save Tournament
async function saveTournament(e) {
  e.preventDefault();
  const tournamentId = document.getElementById('tournamentId').value;
  const tournamentData = {
    name: document.getElementById('tournamentNameInput').value,
    challongeUrl: document.getElementById('challongeUrlInput').value || null,
    startDate: document.getElementById('tournamentStartDate').value,
    endDate: document.getElementById('tournamentEndDate').value,
    description: document.getElementById('tournamentDescription').value || '',
    status: document.getElementById('tournamentStatus').value,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  if (!tournamentData.name || !tournamentData.startDate) {
    alert('Please fill in required fields');
    return;
  }
  
  try {
    if (tournamentId) {
      await db.collection('tournaments').doc(tournamentId).update(tournamentData);
    } else {
      tournamentData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('tournaments').add(tournamentData);
    }
    closeModal('tournamentModal');
    alert('✅ Tournament saved!');
    await loadTournaments();
    updateStats();
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// Delete Tournament
async function deleteTournament(tournamentId) {
  if (confirm('Delete this tournament?')) {
    await db.collection('tournaments').doc(tournamentId).delete();
    await loadTournaments();
    updateStats();
  }
}

// Content Save Functions
async function saveHeroContent(e) {
  e.preventDefault();
  await db.collection('content').doc('website').set({ hero: {
    subtitle: document.getElementById('heroSubtitleInput').value,
    title: document.getElementById('heroTitleInput').value,
    highlight: document.getElementById('heroHighlightInput').value,
    description: document.getElementById('heroDescriptionInput').value,
    buttonText: document.getElementById('heroButtonTextInput').value
  }}, { merge: true });
  alert('✅ Hero saved!');
}

async function saveFounderContent(e) {
  e.preventDefault();
  await db.collection('content').doc('website').set({ founder: {
    name: document.getElementById('founderNameInput').value,
    quote: document.getElementById('founderQuoteInput').value,
    title: document.getElementById('founderTitleInput').value,
    signature: document.getElementById('founderSignatureInput').value
  }}, { merge: true });
  alert('✅ Founder saved!');
}

async function saveRegistrationContent(e) {
  e.preventDefault();
  await db.collection('content').doc('website').set({ registration: {
    url: document.getElementById('regFormUrlInput').value,
    title: document.getElementById('regTitleInput').value,
    description: document.getElementById('regDescriptionInput').value,
    email: document.getElementById('regEmailInput').value
  }}, { merge: true });
  alert('✅ Registration saved!');
}

async function saveFooterContent(e) {
  e.preventDefault();
  await db.collection('content').doc('website').set({ footer: {
    copyright: document.getElementById('footerCopyrightInput').value,
    tagline: document.getElementById('footerTaglineInput').value
  }}, { merge: true });
  alert('✅ Footer saved!');
}

// Change Password
async function changePassword(e) {
  e.preventDefault();
  const newPassword = document.getElementById('adminNewPassword').value;
  if (!newPassword || newPassword.length < 8) {
    alert('Password must be at least 8 characters');
    return;
  }
  try {
    const user = auth.currentUser;
    if (user) {
      await user.updatePassword(newPassword);
      alert('✅ Password updated!');
      document.getElementById('adminNewPassword').value = '';
    }
  } catch (error) {
    alert('❌ Error: ' + error.message);
  }
}

// Close Modal
function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

// Show Section
function showSection(sectionName, event) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionName).classList.add('active');
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
  
  const titles = {
    'dashboard': 'Dashboard',
    'teams': 'Teams Management',
    'achievements': 'E-Certificates',
    'tournaments': 'Tournaments',
    'content': 'Website Content',
    'settings': 'Settings'
  };
  document.getElementById('pageTitle').textContent = titles[sectionName] || 'Dashboard';
}

// Switch Content Tab
function switchContentTab(tabName, element) {
  document.querySelectorAll('.content-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`${tabName}-content`).classList.add('active');
  document.querySelectorAll('.content-tab').forEach(t => t.classList.remove('active'));
  element.classList.add('active');
}

// Logout
function logout() {
  localStorage.removeItem('daksSystemSession');
  auth.signOut();
  window.location.replace('login.html');
}

// Close modal on outside click
window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
}