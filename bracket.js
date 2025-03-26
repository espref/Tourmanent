// Bracket viewing JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Sample data - in a real app, this would come from a backend
    let tournaments = JSON.parse(localStorage.getItem('tournaments')) || [];
    let brackets = JSON.parse(localStorage.getItem('brackets')) || {};

    // Load tournament select
    setupTournamentSelect();

    // Function to setup tournament select
    function setupTournamentSelect() {
        const select = document.getElementById('view-select-tournament');
        if (!select) return;
        
        select.innerHTML = '<option value="">-- Выберите турнир --</option>';
        
        tournaments.forEach(tournament => {
            const option = document.createElement('option');
            option.value = tournament.id;
            option.textContent = tournament.title;
            select.appendChild(option);
        });
        
        // Check if tournament ID is in URL
        const urlParams = new URLSearchParams(window.location.search);
        const tournamentId = urlParams.get('tournament');
        
        if (tournamentId) {
            select.value = tournamentId;
            loadBracket(tournamentId);
        }
        
        select.addEventListener('change', function() {
            const tournamentId = this.value;
            if (tournamentId) {
                // Update URL
                window.history.pushState({}, '', `bracket.html?tournament=${tournamentId}`);
                loadBracket(tournamentId);
            } else {
                document.getElementById('bracket-view-container').innerHTML = '<p>Выберите турнир для просмотра сетки</p>';
            }
        });
    }

    // Load bracket for a tournament
    function loadBracket(tournamentId) {
        const tournament = tournaments.find(t => t.id == tournamentId);
        if (!tournament) return;
        
        document.getElementById('bracket-tournament-name').textContent = tournament.title;
        
        const container = document.getElementById('bracket-view-container');
        container.innerHTML = '';
        
        const bracket = brackets[tournamentId];
        if (!bracket) {
            container.innerHTML = '<p>Сетка для этого турнира ещё не сгенерирована</p>';
            return;
        }
        
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

    // Create match element for viewing
    function createMatchElement(match) {
        const matchDiv = document.createElement('div');
        matchDiv.className = 'match';
        
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
        
        return matchDiv;
    }
});
