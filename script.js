// Main JavaScript for the frontend
document.addEventListener('DOMContentLoaded', function() {
    // Sample tournaments data - in a real app, this would come from a backend
    const tournaments = [
        {
            id: 1,
            title: 'DOTA 2. Турнир №1',
            date: 'Дата будет объявлена позже',
            status: 'Открыт прием заявок',
            format: 'Double Elimination',
            type: 'Онлайн',
            description: 'Первый студенческий турнир по Dota 2 в этом сезоне!',
            maxTeams: 8,
            registeredTeams: 3
        },
        {
            id: 2,
            title: 'DOTA 2. Турнир №2',
            date: '15.12.2023',
            status: 'Регистрация закрыта',
            format: 'Double Elimination',
            type: 'Онлайн',
            description: 'Второй турнир серии студенческих турниров',
            maxTeams: 16,
            registeredTeams: 16
        }
    ];

    // Load tournaments on the main page
    if (document.getElementById('tournaments-container')) {
        loadTournaments();
    }

    // Load registration form for a specific tournament
    if (document.getElementById('registration-form')) {
        setupRegistrationForm();
    }

    // Modal functionality
    setupModals();

    // Function to load tournaments
    function loadTournaments() {
        const container = document.getElementById('tournaments-container');
        const pastContainer = document.getElementById('past-tournaments-container');
        
        if (!container) return;
        
        container.innerHTML = '';
        pastContainer.innerHTML = '';
        
        tournaments.forEach(tournament => {
            const card = createTournamentCard(tournament);
            
            if (tournament.status === 'Открыт прием заявок' || tournament.status === 'Регистрация закрыта') {
                container.appendChild(card);
            } else {
                pastContainer.appendChild(card);
            }
        });
    }
    
    // Create a tournament card
    function createTournamentCard(tournament) {
        const card = document.createElement('div');
        card.className = 'tournament-card';
        
        const statusClass = getStatusClass(tournament.status);
        
        card.innerHTML = `
            <div class="tournament-header">
                <h3>${tournament.title}</h3>
            </div>
            <div class="tournament-body">
                <div class="tournament-info">
                    <p><i class="fas fa-calendar-alt"></i> Дата: ${tournament.date}</p>
                    <p><i class="fas fa-info-circle"></i> Статус: <span class="tournament-status ${statusClass}">${tournament.status}</span></p>
                    <p><i class="fas fa-trophy"></i> Формат: ${tournament.format}</p>
                    <p><i class="fas fa-globe"></i> Тип: ${tournament.type}</p>
                    <p><i class="fas fa-users"></i> Команд: ${tournament.registeredTeams}/${tournament.maxTeams}</p>
                    ${tournament.description ? `<p><i class="fas fa-align-left"></i> ${tournament.description}</p>` : ''}
                </div>
                ${tournament.status === 'Открыт прием заявок' ? 
                    `<a href="register.html?tournament=${tournament.id}" class="btn">Участвовать</a>` : 
                    `<button class="btn" disabled>Регистрация закрыта</button>`}
                <a href="bracket.html?tournament=${tournament.id}" class="btn" style="margin-top: 10px; background-color: var(--primary-color)">Турнирная сетка</a>
            </div>
        `;
        
        return card;
    }
    
    // Get CSS class for tournament status
    function getStatusClass(status) {
        switch(status) {
            case 'Открыт прием заявок': return 'status-open';
            case 'Регистрация закрыта': return 'status-closed';
            case 'Идет турнир': return 'status-in-progress';
            case 'Завершен': return 'status-completed';
            default: return '';
        }
    }
    
    // Setup registration form
    function setupRegistrationForm() {
        const urlParams = new URLSearchParams(window.location.search);
        const tournamentId = urlParams.get('tournament');
        
        if (tournamentId) {
            const tournament = tournaments.find(t => t.id == tournamentId);
            if (tournament) {
                document.getElementById('tournament-name').textContent = tournament.title;
            }
        }
        
        const form = document.getElementById('registration-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // In a real app, this would send data to a backend
            const successModal = document.getElementById('success-modal');
            successModal.style.display = 'block';
            
            // Simulate sending data to Telegram
            sendToTelegram({
                tournament: tournamentId ? tournament.title : 'Неизвестный турнир',
                teamName: document.getElementById('team-name').value,
                groupNumber: document.getElementById('group-number').value,
                captainSteam: document.getElementById('captain-steam').value,
                carryTg: document.getElementById('carry-tg').value,
                midTg: document.getElementById('mid-tg').value,
                offlaneTg: document.getElementById('offlane-tg').value,
                fourthTg: document.getElementById('fourth-tg').value,
                fifthTg: document.getElementById('fifth-tg').value
            });
        });
    }
    
    // 
    async function sendToTelegram(data) {
    const botToken = "7566216856:AAGcB9UeyPDkPERnle7UW45dhhzZYSz8yd8";
    const chatId = "1221814162";
    const text = `Новая заявка!\nКоманда: ${data.teamName}\nКапитан: ${data.captainSteam}`;
    
    const url = `https://api.telegram.org/bot${botToken}/sendMessage?chat_id=${chatId}&text=${encodeURIComponent(text)}`;
    await fetch(url);
}
    // Setup modals
    function setupModals() {
        const loginBtn = document.getElementById('admin-login');
        const loginModal = document.getElementById('login-modal');
        
        if (loginBtn && loginModal) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                loginModal.style.display = 'block';
            });
        }
        
        // Close modal when clicking X
        const closeButtons = document.querySelectorAll('.close');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        // Admin login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                const username = document.getElementById('admin-username').value;
                const password = document.getElementById('admin-password').value;
                
                // Hardcoded credentials for demo
                if (username === 'admin' && password === 'admin123') {
                    window.location.href = 'admin.html';
                } else {
                    alert('Неверные логин или пароль');
                }
            });
        }
    }
});
