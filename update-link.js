// Dynamic content loader for main website
document.addEventListener('DOMContentLoaded', function() {
  // Load website data from localStorage
  const websiteData = JSON.parse(localStorage.getItem('mylykesWebsiteData') || '{}');
  
  if (websiteData && websiteData.content) {
    updateHeroContent(websiteData.content.hero);
    updateFounderContent(websiteData.content.founder);
    updateRegistrationContent(websiteData.content.registration);
    updateFooterContent(websiteData.content.footer);
    updateTeamsContent(websiteData.teams);
    updateTournamentsContent(websiteData.tournaments);
    updateCertificatesContent(websiteData.certificates);
  }
});

function updateHeroContent(hero) {
  if (!hero) return;
  
  const heroTitle = document.querySelector('.hero h1');
  if (heroTitle && hero.title && hero.highlight) {
    heroTitle.innerHTML = `${hero.title} <span class="gold-text">${hero.highlight}</span> VISION`;
  }
  
  const heroDesc = document.querySelector('.hero p');
  if (heroDesc && hero.description) {
    heroDesc.textContent = hero.description;
  }
  
  const heroBtn = document.querySelector('.cta-button');
  if (heroBtn && hero.buttonText) {
    heroBtn.innerHTML = `<i class="fas fa-trophy"></i> ${hero.buttonText}`;
  }
}

function updateFounderContent(founder) {
  if (!founder) return;
  
  const founderName = document.querySelector('.founder-name');
  if (founderName && founder.name) {
    founderName.textContent = `· ${founder.name}`;
  }
  
  const founderQuote = document.querySelector('.founder-text p');
  if (founderQuote && founder.quote) {
    founderQuote.textContent = `"${founder.quote}"`;
  }
}

function updateRegistrationContent(registration) {
  if (!registration) return;
  
  const formBtn = document.getElementById('googleFormLink');
  if (formBtn && registration.url) {
    formBtn.href = registration.url;
  }
  
  const formTitle = document.querySelector('.form-header h3');
  if (formTitle && registration.title) {
    formTitle.textContent = registration.title;
  }
  
  const formDesc = document.querySelector('.form-header p');
  if (formDesc && registration.description) {
    formDesc.textContent = registration.description;
  }
  
  const contactLink = document.querySelector('.contact-info a');
  if (contactLink && registration.email) {
    contactLink.href = `mailto:${registration.email}`;
    contactLink.innerHTML = `<i class="fas fa-envelope"></i> ${registration.email}`;
  }
}

function updateFooterContent(footer) {
  if (!footer) return;
  
  const footerDiv = document.querySelector('.footer div:first-child');
  if (footerDiv && footer.copyright) {
    footerDiv.textContent = footer.copyright;
  }
  
  const taglineDiv = document.querySelector('.footer div:last-child');
  if (taglineDiv && footer.tagline) {
    taglineDiv.innerHTML = `<i class="fas fa-gem gold"></i> ${footer.tagline}`;
  }
}

function updateTeamsContent(teams) {
  if (!teams || teams.length === 0) return;
  
  const teamsGrid = document.querySelector('.teams-grid');
  if (!teamsGrid) return;
  
  teamsGrid.innerHTML = teams.map((team, index) => {
    const delay = (index * 0.15) + 0.1;
    return `
      <div class="team-card reveal visible" style="--delay:${delay}s;" onclick="showTeamDetails('${team.name}')">
        <div class="banner-placeholder">
          <i class="fas fa-${team.icon} banner-logo"></i>
        </div>
        <div class="team-info">
          <div class="team-name">${team.name}</div>
          <div class="team-leader"><i class="fas fa-user-tie"></i> Team Captain: ${team.captain}</div>
          <div class="team-stats">
            <span>🏆 ${team.wins || 0} Wins</span>
            <span>⭐ ${team.rating || 0} Rating</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function updateTournamentsContent(tournaments) {
  if (!tournaments || tournaments.length === 0) return;
  
  const upcomingDiv = document.getElementById('upcoming-tournament');
  if (upcomingDiv) {
    const upcoming = tournaments.filter(t => t.status === 'upcoming');
    if (upcoming.length > 0) {
      const nextTournament = upcoming[0];
      upcomingDiv.innerHTML = `
        <i class="fas fa-calendar-alt upcoming-icon"></i>
        <h3>${nextTournament.name}</h3>
        <p>Starts: ${nextTournament.startDate}</p>
        ${nextTournament.description ? `<p>${nextTournament.description}</p>` : ''}
        <button class="cta-button" onclick="scrollToSection('register')">Register Now</button>
      `;
    }
  }
  
  const pastDiv = document.getElementById('past-tournament');
  if (pastDiv) {
    const completed = tournaments.filter(t => t.status === 'completed');
    if (completed.length > 0) {
      pastDiv.innerHTML = `
        <h3>Past Tournaments</h3>
        ${completed.map(t => `<p>🏆 ${t.name} - ${t.endDate}</p>`).join('')}
      `;
    }
  }
}

function updateCertificatesContent(certificates) {
  if (!certificates || certificates.length === 0) return;
  
  const achievementsContainer = document.querySelector('.achievements-container');
  if (!achievementsContainer) return;
  
  achievementsContainer.innerHTML = certificates.slice(0, 3).map((cert, index) => {
    const icons = ['fa-certificate', 'fa-award', 'fa-star'];
    const icon = icons[index] || 'fa-certificate';
    return `
      <div class="achievement-card reveal visible">
        <i class="fas ${icon} achievement-icon"></i>
        <div class="achievement-content">
          <h3>${cert.title}</h3>
          <p>${cert.description}</p>
          <span class="certificate-badge">E-Certificate #${cert.id.slice(-3)}</span>
        </div>
      </div>
    `;
  }).join('');
}