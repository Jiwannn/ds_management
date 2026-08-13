// DAKS SYSTEM - Admin Dashboard (With Nickname Edit)

let currentUser = null;
let currentTeams = [];
let currentCertificates = [];
let currentTournaments = [];
let uploadedLogoUrl = null;

document.addEventListener('DOMContentLoaded', function() {
  console.log('🔍 Admin initializing...');
  
  const sessionData = JSON.parse(localStorage.getItem('daksSystemSession') || 'null');
  
  if (!sessionData) {
    window.location.replace('login.html');
    return;
  }
  
  currentUser = sessionData;
  document.getElementById('adminName').textContent = sessionData.name || 'Admin';
  document.getElementById('adminAccountName').value = sessionData.name || '';
  document.getElementById('adminAccountEmail').value = sessionData.email || '';
  document.getElementById('nicknameInput').value = sessionData.name || '';
  
  loadTeams();
  loadCertificates();
  loadTournaments();
  setupForms();
});

function setupForms() {
  const teamForm = document.getElementById('teamForm');
  if (teamForm) teamForm.addEventListener('submit', saveTeam);
  
  const certificateForm = document.getElementById('certificateForm');
  if (certificateForm) certificateForm.addEventListener('submit', saveCertificate);
  
  const tournamentForm = document.getElementById('tournamentForm');
  if (tournamentForm) tournamentForm.addEventListener('submit', saveTournament);
  
  // Nickname form
  const nicknameForm = document.getElementById('nicknameForm');
  if (nicknameForm) nicknameForm.addEventListener('submit', saveNickname);
}

// SAVE NICKNAME
async function saveNickname(e) {
  e.preventDefault();
  
  const newNickname = document.getElementById('nicknameInput').value.trim();
  
  if (!newNickname || newNickname.length < 2) {
    alert('Please enter a valid nickname (at least 2 characters)');
    return;
  }
  
  try {
    // Get current session
    const sessionData = JSON.parse(localStorage.getItem('daksSystemSession') || '{}');
    
    // Update session in localStorage
    sessionData.name = newNickname;
    localStorage.setItem('daksSystemSession', JSON.stringify(sessionData));
    
    // Update in Firestore if user exists
    if (sessionData.userId && typeof db !== 'undefined') {
      try {
        await db.collection('admins').doc(sessionData.userId).update({
          name: newNickname,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Firestore updated');
      } catch (firestoreError) {
        console.warn('⚠️ Firestore update failed:', firestoreError.message);
      }
    }
    
    // Update UI
    document.getElementById('adminName').textContent = newNickname;
    document.getElementById('adminAccountName').value = newNickname;
    
    alert('✅ Nickname updated successfully!');
    
  } catch (error) {
    console.error('Error updating nickname:', error);
    alert('Error: ' + error.message);
  }
}

// LOAD TEAMS
async function loadTeams() {
  const tbody = document.getElementById('teamsTableBody');
  if (!tbody) return;
  
  try {
    const snapshot = await db.collection('teams').get();
    
    if (snapshot.empty) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#999;">No teams</td></tr>';
      return;
    }
    
    tbody.innerHTML = '';
    snapshot.forEach(doc => {
      const team = doc.data();
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${team.logoUrl ? `<img src="${team.logoUrl}" style="width:40px;height:40px;object-fit:cover;border-radius:8px;">` : '🏆'}</td>
        <td>${team.name}</td>
        <td>${team.captain}</td>
        <td>${team.members ? team.members.length : 0}</td>
        <td>
          <button onclick="deleteTeam('${doc.id}')" style="background:rgba(220,53,69,0.1);border:1px solid rgba(220,53,69,0.3);color:#ff6b7a;padding:0.3rem 0.8rem;border-radius:0.3rem;cursor:pointer;">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
    
    document.getElementById('totalTeams').textContent = snapshot.size;
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:red;">Error: ${error.message}</td></tr>`;
  }
}

async function loadCertificates() {
  try {
    const snapshot = await db.collection('certificates').get();
    currentCertificates = [];
    snapshot.forEach(doc => currentCertificates.push({ id: doc.id, ...doc.data() }));
    
    const grid = document.getElementById('certificatesGrid');
    if (grid) {
      grid.innerHTML = currentCertificates.length === 0 ? '<p style="color:#999;">No certificates</p>' : 
        currentCertificates.map(cert => `
          <div style="background:#1a1a1a;border:1px solid #d4af37;border-radius:0.5rem;padding:1rem;margin-bottom:0.5rem;">
            <h3 style="color:#d4af37;">${cert.title}</h3>
            <p>${cert.teamName}</p>
            <button onclick="deleteCertificate('${cert.id}')" style="background:#dc3545;color:white;border:none;padding:0.3rem 0.8rem;border-radius:0.3rem;cursor:pointer;">Delete</button>
          </div>
        `).join('');
    }
    document.getElementById('totalCertificates').textContent = currentCertificates.length;
  } catch (error) {
    console.error('Error:', error);
  }
}

async function loadTournaments() {
  try {
    const snapshot = await db.collection('tournaments').get();
    currentTournaments = [];
    snapshot.forEach(doc => currentTournaments.push({ id: doc.id, ...doc.data() }));
    
    const list = document.getElementById('tournamentsList');
    if (list) {
      list.innerHTML = currentTournaments.length === 0 ? '<p style="color:#999;">No tournaments</p>' :
        currentTournaments.map(t => `
          <div style="background:#1a1a1a;border:1px solid #d4af37;border-radius:0.5rem;padding:1rem;margin-bottom:0.5rem;">
            <h3 style="color:#d4af37;">${t.name}</h3>
            <p>${t.startDate} - ${t.endDate}</p>
            <button onclick="deleteTournament('${t.id}')" style="background:#dc3545;color:white;border:none;padding:0.3rem 0.8rem;border-radius:0.3rem;cursor:pointer;">Delete</button>
          </div>
        `).join('');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

async function deleteTeam(teamId) {
  if (confirm('Delete this team?')) {
    await db.collection('teams').doc(teamId).delete();
    loadTeams();
  }
}

async function deleteCertificate(certId) {
  if (confirm('Delete this certificate?')) {
    await db.collection('certificates').doc(certId).delete();
    loadCertificates();
  }
}

async function deleteTournament(tournamentId) {
  if (confirm('Delete this tournament?')) {
    await db.collection('tournaments').doc(tournamentId).delete();
    loadTournaments();
  }
}

async function saveTeam(e) {
  e.preventDefault();
  const teamData = {
    name: document.getElementById('teamNameInput').value,
    captain: document.getElementById('captainNameInput').value,
    members: document.getElementById('teamMembersInput').value.split(',').map(m => m.trim()),
    wins: 0,
    rating: 4.5,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  await db.collection('teams').add(teamData);
  closeModal('teamModal');
  alert('✅ Team added!');
  loadTeams();
}

function openTeamModal() {
  document.getElementById('teamModal').style.display = 'block';
  document.getElementById('teamForm').reset();
}

function openCertificateModal() {
  document.getElementById('certificateModal').style.display = 'block';
  document.getElementById('certificateForm').reset();
  document.getElementById('certDate').value = new Date().toISOString().split('T')[0];
}

function openTournamentModal() {
  document.getElementById('tournamentModal').style.display = 'block';
  document.getElementById('tournamentForm').reset();
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function showSection(sectionName, event) {
  document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
  document.getElementById(sectionName).classList.add('active');
  document.querySelectorAll('.admin-nav-link').forEach(l => l.classList.remove('active'));
  if (event && event.target) event.target.classList.add('active');
}

function logout() {
  localStorage.removeItem('daksSystemSession');
  if (typeof auth !== 'undefined') {
    auth.signOut().catch(() => {});
  }
  window.location.replace('login.html');
}

window.onclick = function(event) {
  if (event.target.classList.contains('modal')) {
    event.target.style.display = 'none';
  }
}