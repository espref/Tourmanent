// Admin JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Sample data - in a real app, this would come from a backend
    let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [
        {
            id: 1,
            title: 'DOTA 2. Турнир №1',
            date: '2023-12-01',
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
            date: '2023-12-15',
            status: 'Регистрация закрыта',
            format: 'Double Elimination',
            type: 'Онлайн',
            description: 'Второй турнир серии студенческих турниров',
            maxTeams: 16,
            registeredTeams: 16
        }
    ];

    let teams = JSON.parse(localStorage.getItem('teams')) || [
        {
            id: 1,
            tournamentId: 1,
            name: 'Team A',
            groupNumber: 'ИСТ-101',
            captainSteam: 'https://steamcommunity.com/id/teamacaptain',
            members: [
                { role: 'Керри (1 позиция)', tg: '@carry1' },
                { role: 'Мид (2 позиция)', tg: '@mid2' },
                { role: 'Оффлейнер (3 позиция)', tg: '@offlane3' },
                { role: 'Четвёртый (4 позиция)', tg: '@fourth4' },
                { role: 'Пятый (5 позиция)', tg: '@fifth5' }
            ]
        },
        {
            id: 2,
            tournamentId: 1,
            name: 'Team B',
            groupNumber: 'ИСТ-102',
            captainSteam: 'https://steamcommunity.com/id/teamBcaptain',
            members: [
                { role: 'Керри (1 позиция)', tg: '@carry1b' },
                { role: 'Мид (2 позиция)', tg: '@mid2b' },
                { role: 'Оффлейнер (3 позиция)', tg: '@offlane3b' },
                { role: 'Четвёртый (4 позиция)', tg: '@fourth4b' },
                { role: 'Пятый (5 позиция)', tg: '@fifth5b' }
            ]
        }
    ];

    let brackets = JSON.parse(localStorage.getItem('brackets')) || {};

    // Tab functionality
    setupTabs();

    // Load tournaments for admin
    loadAdminTournaments();

    // Load teams
    loadTeams();

    // Setup tournament select for bracket
    setupTournamentSelect();

    // Add tournament modal
    setupAddTournamentModal();

    // Edit tournament modal
    setupEditTournamentModal();

    // Match result modal
    setupMatchResultModal();

    // Logout button
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('adminLoggedIn');
            window.location.href = 'index.html';
        });
    }

    // Check if admin is logged in
    if (!localStorage.getItem('adminLoggedIn') && window.location.pathname.includes('admin.html')) {
        window.location.href = 'index.html';
    }

    // Tab functionality
    function setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Update active tab content
                tabContents.forEach(content => content.classList.remove('active'));
                document.getElementById(`${tabId}-tab`).classList.add('active');
            });
        });
    }

    // Load tournaments for admin
    function loadAdminTournaments() {
        const activeContainer = document.getElementById('active-tournaments');
        const pastContainer = document.getElementById('past-tournaments-admin');
        
        if (!activeContainer) return;
        
        activeContainer.innerHTML = '';
        pastContainer.innerHTML = '';
        
        tournaments.forEach(tournament => {
            const item = document.createElement('div');
            item.className = 'tournament-item';
            
            const isActive = tournament.status === 'Открыт прием заявок' || 
                            tournament.status === 'Регистрация закрыта' || 
                            tournament.status === 'Идет турнир';
            
            item.innerHTML = `
                <div>
                    <h4>${tournament.title}</h4>
                    <p>${tournament.date} | ${tournament.status} | ${tournament.registeredTeams}/${tournament.maxTeams} команд</p>
                </div>
                <div class="tournament-item-actions">
                    <button class="btn edit-tournament" data-id="${tournament.id}">Редактировать</button>
                    <button class="btn btn-danger delete-tournament" data-id="${tournament.id}">Удалить</button>
                </div>
            `;
            
            if (isActive) {
                activeContainer.appendChild(item);
            } else {
                pastContainer.appendChild(item);
            }
        });
        
        // Add event listeners to edit buttons
        document.querySelectorAll('.edit-tournament').forEach(btn => {
            btn.addEventListener('click', function() {
                const tournamentId = this.getAttribute('data-id');
                editTournament(tournamentId);
            });
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-tournament').forEach(btn => {
            btn.addEventListener('click', function() {
                const tournamentId = this.getAttribute('data-id');
                if (confirm('Вы уверены, что хотите удалить этот турнир?')) {
                    deleteTournament(tournamentId);
                }
            });
        });
    }

    // Load teams
    function loadTeams() {
        const container = document.getElementById('teams-container');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (teams.length === 0) {
            container.innerHTML = '<p>Нет зарегистрированных команд</p>';
            return;
        }
        
        teams.forEach(team => {
            const tournament = tournaments.find(t => t.id == team.tournamentId);
            const tournamentTitle = tournament ? tournament.title : 'Неизвестный турнир';
            
            const item = document.createElement('div');
            item.className = 'team-item';
            
            let membersHtml = '';
            team.members.forEach(member => {
                membersHtml += `
                    <div class="team-member">
                        <span class="member-role">${member.role}:</span>
                        <span>${member.tg}</span>
                    </div>
                `;
            });
            
            item.innerHTML = `
                <div class="team-header">
                    <div class="team-name">${team.name} (${tournamentTitle})</div>
                </div>
                <div class="team-details">
                    <p>Группа: ${team.groupNumber}</p>
                    <p>Steam капитана: <a href="${team.captainSteam}" target="_blank">${team.captainSteam}</a></p>
                </div>
                <div class="team-members">
                    <h4>Состав команды:</h4>
                    ${membersHtml}
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    // Setup tournament select for bracket
    function setupTournamentSelect() {
        const select = document.getElementById('select-tournament');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Выберите турнир --</option>';
        
        tournaments.forEach(tournament => {
            const option = document.createElement('option');
            option.value = tournament.id;
            option.textContent = tournament.title;
            select.appendChild(option);
        });
        
        select.addEventListener('change', function() {
            const tournamentId = this.value;
            const generateBtn = document.getElementById('generate-bracket-btn');
            const updateBtn = document.getElementById('update-bracket-btn');
            
            if (tournamentId) {
                generateBtn.disabled = false;
                updateBtn.disabled = false;
                
                // Check if bracket already exists
                if (brackets[tournamentId]) {
                    generateBtn.textContent = 'Обновить сетку';
                    renderBracket(tournamentId);
                } else {
                    generateBtn.textContent = 'Сгенерировать сетку';
                    document.getElementById('bracket-container').innerHTML = '<p>Сетка ещё не сгенерирована</p>';
                }
            } else {
                generateBtn.disabled = true;
                updateBtn.disabled = true;
                document.getElementById('bracket-container').innerHTML = '<p>Выберите турнир для просмотра сетки</p>';
            }
        });
        
        // Generate bracket button
        document.getElementById('generate-bracket-btn').addEventListener('click', function() {
            const tournamentId = document.getElementById('select-tournament').value;
            if (tournamentId) {
                generateBracket(tournamentId);
            }
        });
        
        // Update bracket button
        document.getElementById('update-bracket-btn').addEventListener('click', function() {
            const tournamentId = document.getElementById('select-tournament').value;
            if (tournamentId && brackets[tournamentId]) {
                renderBracket(tournamentId);
            }
        });
    }

    // Generate bracket for a tournament
    function generateBracket(tournamentId) {
        const tournament = tournaments.find(t => t.id == tournamentId);
        if (!tournament) return;
        
        // Get teams for this tournament
        const tournamentTeams = teams.filter(t => t.tournamentId == tournamentId);
        
        if (tournamentTeams.length < 2) {
            alert('Для генерации сетки нужно как минимум 2 команды');
            return;
        }
        
        // Create bracket structure
        const bracket = {
            tournamentId: tournamentId,
            format: tournament.format,
            upperBracket: [],
            lowerBracket: [],
            grandFinal: null,
            teams: tournamentTeams
        };
        
        // For Double Elimination, we need to create upper and lower brackets
        if (tournament.format === 'Double Elimination') {
            // Create initial upper bracket matches (first round)
            const upperFirstRound = createMatches(tournamentTeams, 'upper', 1);
            bracket.upperBracket.push(upperFirstRound);
            
            // Create initial lower bracket (will be populated as teams lose)
            bracket.lowerBracket = [];
            
            // Save bracket
            brackets[tournamentId] = bracket;
            localStorage.setItem('brackets', JSON.stringify(brackets));
            
            // Update tournament status
            tournament.status = 'Идет турнир';
            localStorage.setItem('tournaments', JSON.stringify(tournaments));
            
            // Render bracket
            renderBracket(tournamentId);
            
            alert('Сетка турнира успешно сгенерирована!');
        }
    }

    // Create matches for a round
    function createMatches(teams, bracketType, roundNumber) {
        const matches = [];
        const shuffledTeams = [...teams].sort(() => 0.5 - Math.random()); // Simple shuffle
        
        for (let i = 0; i < shuffledTeams.length; i += 2) {
            if (i + 1 < shuffledTeams.length) {
                matches.push({
                    id: Date.now() + i,
                    round: roundNumber,
                    bracket: bracketType,
                    team1: shuffledTeams[i].name,
                    team2: shuffledTeams[i + 1].name,
                    winner: null,
                    score: null
                });
            } else {
                // Odd number of teams - one gets a bye
                matches.push({
                    id: Date.now() + i,
                    round: roundNumber,
                    bracket: bracketType,
                    team1: shuffledTeams[i].name,
                    team2: 'BYE',
                    winner: shuffledTeams[i].name,
                    score: 'BYE'
                });
            }
        }
        
        return matches;
    }

    // Render bracket
    function renderBracket(tournamentId) {
        const bracket = brackets[tournamentId];
        if (!bracket) return;
        
        const container = document.getElementById('bracket-container');
        container.innerHTML = '';
        
        if (bracket.format === 'Double Elimination') {
            renderDoubleEliminationBracket(bracket, container);
        }
    }

    // Render Double Elimination bracket
    function renderDoubleEliminationBracket(bracket, container) {
        const wrapper = document.createElement('div');
        wrapper.className = 'double-elimination';
        
        // Upper Bracket
        const upperDiv = document.createElement('div');
        upperDiv.className = 'upper-bracket';
        upperDiv.innerHTML = '<h3 class="bracket-title">Верхняя сетка</h3>';
        
        const upperRounds = document.createElement('div');
        upperRounds.className = 'bracket';
        
        // Group matches by round
        const upperRoundsMap = {};
        bracket.upperBracket.forEach(round => {
            round.forEach(match => {
                if (!upperRoundsMap[match.round]) {
                    upperRoundsMap[match.round] = [];
                }
                upperRoundsMap[match.round].push(match);
            });
        });
        
        // Create rounds
        Object.keys(upperRoundsMap).forEach(roundNum => {
            const roundDiv = document.createElement('div');
            roundDiv.className = 'round';
            
            const roundTitle = document.createElement('div');
            roundTitle.className = 'round-title';
            roundTitle.textContent = `Раунд ${roundNum}`;
            roundDiv.appendChild(roundTitle);
            
            upperRoundsMap[roundNum].forEach(match => {
                roundDiv.appendChild(createMatchElement(match));
            });
            
            upperRounds.appendChild(roundDiv);
        });
        
        upperDiv.appendChild(upperRounds);
        wrapper.appendChild(upperDiv);
        
        // Lower Bracket
        if (bracket.lowerBracket.length > 0) {
            const lowerDiv = document.createElement('div');
            lowerDiv.className = 'lower-bracket';
            lowerDiv.innerHTML = '<h3 class="bracket-title">Нижняя сетка</h3>';
            
            const lowerRounds = document.createElement('div');
            lowerRounds.className = 'bracket';
            
            // Group matches by round
            const lowerRoundsMap = {};
            bracket.lowerBracket.forEach(match => {
                if (!lowerRoundsMap[match.round]) {
                    lowerRoundsMap[match.round] = [];
                }
                lowerRoundsMap[match.round].push(match);
            });
            
            // Create rounds
            Object.keys(lowerRoundsMap).forEach(roundNum => {
                const roundDiv = document.createElement('div');
                roundDiv.className = 'round';
                
                const roundTitle = document.createElement('div');
                roundTitle.className = 'round-title';
                roundTitle.textContent = `Раунд ${roundNum}`;
                roundDiv.appendChild(roundTitle);
                
                lowerRoundsMap[roundNum].forEach(match => {
                    roundDiv.appendChild(createMatchElement(match));
                });
                
                lowerRounds.appendChild(roundDiv);
            });
            
            lowerDiv.appendChild(lowerRounds);
            wrapper.appendChild(lowerDiv);
        }
        
        // Grand Final
        if (bracket.grandFinal) {
            const finalDiv = document.createElement('div');
            finalDiv.className = 'grand-final';
            finalDiv.innerHTML = '<h3 class="bracket-title">Гранд-финал</h3>';
            
            const finalMatch = document.createElement('div');
            finalMatch.className = 'match final-match';
            finalMatch.appendChild(createMatchElement(bracket.grandFinal));
            
            finalDiv.appendChild(finalMatch);
            wrapper.appendChild(finalDiv);
        }
        
        container.appendChild(wrapper);
    }

    // Create match element
    function createMatchElement(match) {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        matchDiv.setAttribute('data-id', match.id);
        
        const team1Div = document.createElement('div');
        team1Div.className = `match-team ${match.winner === match.team1 ? 'winner' : ''}`;
        team1Div.textContent = match.team1;
        
        const team2Div = document.createElement('div');
        team2Div.className = `match-team ${match.winner === match.team2 ? 'winner' : ''}`;
        team2Div.textContent = match.team2;
        
        if (match.score) {
            const scoreSpan1 = document.createElement('span');
            scoreSpan1.className = 'match-score';
            scoreSpan1.textContent = match.score.includes('-') ? match.score.split('-')[0] : '';
            team1Div.appendChild(scoreSpan1);
            
            const scoreSpan2 = document.createElement('span');
            scoreSpan2.className = 'match-score';
            scoreSpan2.textContent = match.score.includes('-') ? match.score.split('-')[1] : '';
            team2Div.appendChild(scoreSpan2);
        }
        
        matchDiv.appendChild(team1Div);
        matchDiv.appendChild(team2Div);
        
        // Add click event for admin to set results
        if (match.winner === null && match.team2 !== 'BYE') {
            matchDiv.addEventListener('click', function() {
                openMatchResultModal(match);
            });
            matchDiv.style.cursor = 'pointer';
        }
        
        return matchDiv;
    }

    // Setup add tournament modal
    function setupAddTournamentModal() {
        const modal = document.getElementById('add-tournament-modal');
        const btn = document.getElementById('add-tournament-btn');
        const form = document.getElementById('add-tournament-form');
        
        if (!btn || !modal) return;
        
        btn.addEventListener('click', function() {
            modal.style.display = 'block';
        });
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const newTournament = {
                id: Date.now(),
                title: document.getElementById('tournament-title').value,
                date: document.getElementById('tournament-date').value,
                status: 'Открыт прием заявок',
                format: document.getElementById('tournament-format').value,
                type: document.getElementById('tournament-type').value,
                description: document.getElementById('tournament-description').value,
                maxTeams: parseInt(document.getElementById('tournament-max-teams').value),
                registeredTeams: 0
            };
            
            tournaments.push(newTournament);
            localStorage.setItem('tournaments', JSON.stringify(tournaments));
            
            modal.style.display = 'none';
            form.reset();
            loadAdminTournaments();
        });
    }

    // Setup edit tournament modal
    function setupEditTournamentModal() {
        const modal = document.getElementById('edit-tournament-modal');
        const form = document.getElementById('edit-tournament-form');
        
        if (!form || !modal) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const tournamentId = parseInt(document.getElementById('edit-tournament-id').value);
            const tournament = tournaments.find(t => t.id === tournamentId);
            
            if (tournament) {
                tournament.title = document.getElementById('edit-tournament-title').value;
                tournament.date = document.getElementById('edit-tournament-date').value;
                tournament.status = document.getElementById('edit-tournament-status').value;
                tournament.format = document.getElementById('edit-tournament-format').value;
                tournament.type = document.getElementById('edit-tournament-type').value;
                tournament.description = document.getElementById('edit-tournament-description').value;
                tournament.maxTeams = parseInt(document.getElementById('edit-tournament-max-teams').value);
                
                localStorage.setItem('tournaments', JSON.stringify(tournaments));
                modal.style.display = 'none';
                loadAdminTournaments();
            }
        });
    }

    // Edit tournament
    function editTournament(tournamentId) {
        const modal = document.getElementById('edit-tournament-modal');
        const tournament = tournaments.find(t => t.id == tournamentId);
        
        if (tournament && modal) {
            document.getElementById('edit-tournament-id').value = tournament.id;
            document.getElementById('edit-tournament-title').value = tournament.title;
            document.getElementById('edit-tournament-date').value = tournament.date;
            document.getElementById('edit-tournament-status').value = tournament.status;
            document.getElementById('edit-tournament-format').value = tournament.format;
            document.getElementById('edit-tournament-type').value = tournament.type;
            document.getElementById('edit-tournament-description').value = tournament.description || '';
            document.getElementById('edit-tournament-max-teams').value = tournament.maxTeams;
            
            modal.style.display = 'block';
        }
    }

    // Delete tournament
    function deleteTournament(tournamentId) {
        tournaments = tournaments.filter(t => t.id != tournamentId);
        localStorage.setItem('tournaments', JSON.stringify(tournaments));
        loadAdminTournaments();
    }

    // Setup match result modal
    function setupMatchResultModal() {
        const modal = document.getElementById('match-result-modal');
        const form = document.getElementById('match-result-form');
        
        if (!form || !modal) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const matchId = parseInt(document.getElementById('match-id').value);
            const round = parseInt(document.getElementById('match-round').value);
            const bracketType = document.getElementById('match-bracket').value;
            const winner = document.querySelector('input[name="winner"]:checked').value;
            const score = document.getElementById('match-score').value;
            
            const tournamentId = document.getElementById('select-tournament').value;
            const bracket = brackets[tournamentId];
            
            if (bracket) {
                // Find the match and update it
                let matchFound = false;
                
                // Check upper bracket
                bracket.upperBracket.forEach(roundMatches => {
                    roundMatches.forEach(match => {
                        if (match.id === matchId) {
                            match.winner = winner === 'team1' ? match.team1 : match.team2;
                            match.score = score;
                            matchFound = true;
                        }
                    });
                });
                
                // Check lower bracket if not found
                if (!matchFound) {
                    bracket.lowerBracket.forEach(match => {
                        if (match.id === matchId) {
                            match.winner = winner === 'team1' ? match.team1 : match.team2;
                            match.score = score;
                            matchFound = true;
                        }
                    });
                }
                
                // Check grand final if not found
                if (!matchFound && bracket.grandFinal && bracket.grandFinal.id === matchId) {
                    bracket.grandFinal.winner = winner === 'team1' ? bracket.grandFinal.team1 : bracket.grandFinal.team2;
                    bracket.grandFinal.score = score;
                    matchFound = true;
                }
                
                if (matchFound) {
                    // Save updated bracket
                    localStorage.setItem('brackets', JSON.stringify(brackets));
                    
                    // Close modal and refresh bracket view
                    modal.style.display = 'none';
                    renderBracket(tournamentId);
                    
                    // TODO: Advance winners to next rounds
                    advanceWinners(tournamentId, matchId, winner === 'team1' ? 'team1' : 'team2', round, bracketType);
                }
            }
        });
    }

    // Open match result modal
    function openMatchResultModal(match) {
        const modal = document.getElementById('match-result-modal');
        
        document.getElementById('match-id').value = match.id;
        document.getElementById('match-round').value = match.round;
        document.getElementById('match-bracket').value = match.bracket;
        document.getElementById('team1-name').value = match.team1;
        document.getElementById('team2-name').value = match.team2;
        document.getElementById('winner-team1-label').textContent = match.team1;
        document.getElementById('winner-team2-label').textContent = match.team2;
        
        // Reset form
        document.querySelector('input[name="winner"]').checked = false;
        document.getElementById('match-score').value = '';
        
        modal.style.display = 'block';
    }

    // Advance winners to next rounds (simplified for demo)
    function advanceWinners(tournamentId, matchId, winnerTeam, round, bracketType) {
        const bracket = brackets[tournamentId];
        if (!bracket) return;
        
        // In a real implementation, this would:
        // 1. For upper bracket: advance winner to next upper bracket round
        // 2. For lower bracket: advance winner to next lower bracket round
        // 3. For losers from upper bracket: add them to appropriate lower bracket round
        // 4. Check for grand final conditions
        
        console.log(`Team ${winnerTeam} advanced to next round`);
    }
});
