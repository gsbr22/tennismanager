// Variables globales
let currentDate = new Date("2025-01-01");
let gameLog = [];
let previousRankings = {};
let tournamentResults = [];
let rankingChanges = [];

// Initialisation du jeu
document.addEventListener('DOMContentLoaded', function() {
    // Sauvegarder les classements initiaux pour comparaison
    atpRankings.forEach(p => {
        previousRankings[p.name] = { rank: p.rank, points: p.points };
    });
    
    updateGame();
    
    // Événements des boutons
    document.getElementById('train-btn').addEventListener('click', trainPlayer);
    document.getElementById('play-tournament-btn').addEventListener('click', selectTournament);
    document.getElementById('negotiate-sponsor-btn').addEventListener('click', negotiateSponsor);
    document.getElementById('next-week-btn').addEventListener('click', nextWeek);
});

// Mise à jour de l'interface
function updateGame() {
    updateDateDisplay();
    updateATPTable();
    updateTournamentsTable();
    updatePlayerInfo();
    updateTournamentResults();
    updateRankingChanges();
}

// Mise à jour de la date
function updateDateDisplay() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('fr-FR', options);
}

// Mise à jour du classement ATP
function updateATPTable() {
    const tableBody = document.querySelector('#atp-table tbody');
    tableBody.innerHTML = '';
    
    atpRankings.forEach(player => {
        const row = document.createElement('tr');
        if (player.name === "Arthur Fils") {
            row.classList.add('highlight');
        }
        
        // Calculer la variation de classement
        const prevRank = previousRankings[player.name] ? previousRankings[player.name].rank : player.rank;
        const rankChange = prevRank - player.rank;
        let changeText = '';
        
        if (rankChange > 0) {
            changeText = `(+${rankChange})`;
            row.classList.add('rank-up');
        } else if (rankChange < 0) {
            changeText = `(${rankChange})`;
            row.classList.add('rank-down');
        }
        
        row.innerHTML = `
            <td>${player.rank}</td>
            <td>${player.name}</td>
            <td>${player.points}</td>
            <td>${changeText}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Mise à jour des tournois
function updateTournamentsTable() {
    const tableBody = document.querySelector('#tournaments-table tbody');
    tableBody.innerHTML = '';
    
    // Trier les tournois par date
    const sortedTournaments = [...tournaments].sort((a, b) => new Date(a.date) - new Date(b.date));
    
    sortedTournaments.forEach(tournament => {
        const row = document.createElement('tr');
        
        // Formater la date
        const dateObj = new Date(tournament.date);
        const formattedDate = dateObj.toLocaleDateString('fr-FR');
        
        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${tournament.name}</td>
            <td>${tournament.category}</td>
            <td>${tournament.surface}</td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Mise à jour des infos du joueur
function updatePlayerInfo() {
    document.getElementById('player-ranking').textContent = player.ranking;
    document.getElementById('player-points').textContent = player.points;
    document.getElementById('player-form').textContent = player.form;
    document.getElementById('player-sponsors').textContent = player.sponsors.join(', ');
    
    document.getElementById('serve-skill').textContent = player.skills.serve;
    document.getElementById('forehand-skill').textContent = player.skills.forehand;
    document.getElementById('backhand-skill').textContent = player.skills.backhand;
    document.getElementById('fitness-skill').textContent = player.skills.fitness;
    document.getElementById('mental-skill').textContent = player.skills.mental;
}

// Mise à jour des résultats de tournoi
function updateTournamentResults() {
    const matchesContainer = document.getElementById('tournament-matches');
    matchesContainer.innerHTML = '';
    
    if (tournamentResults.length === 0) {
        matchesContainer.innerHTML = '<p>Aucun résultat de tournoi récent.</p>';
        return;
    }
    
    tournamentResults.forEach(match => {
        const matchElement = document.createElement('div');
        matchElement.className = `match-result ${match.win ? 'match-win' : 'match-loss'}`;
        matchElement.innerHTML = `
            <strong>${match.round}:</strong> ${match.player1} vs ${match.player2} - 
            ${match.score} <strong>${match.win ? 'Victoire' : 'Défaite'}</strong>
        `;
        matchesContainer.appendChild(matchElement);
    });
}

// Mise à jour des changements de classement
function updateRankingChanges() {
    const changesContainer = document.getElementById('ranking-changes-content');
    changesContainer.innerHTML = '';
    
    if (rankingChanges.length === 0) {
        changesContainer.innerHTML = '<p>Aucun changement significatif cette semaine.</p>';
        return;
    }
    
    rankingChanges.forEach(change => {
        const changeElement = document.createElement('div');
        changeElement.className = 'ranking-change';
        
        if (change.type === 'best') {
            changeElement.innerHTML = `
                <strong>Meilleure progression:</strong> ${change.player} (${change.change > 0 ? '+' : ''}${change.change} places)
            `;
        } else {
            changeElement.innerHTML = `
                <strong>Pire chute:</strong> ${change.player} (${change.change} places)
            `;
        }
        
        changesContainer.appendChild(changeElement);
    });
}

// Ajouter un message au journal
function addLogMessage(message) {
    const logContent = document.getElementById('log-content');
    const messageElement = document.createElement('p');
    messageElement.textContent = `Semaine ${player.weeksPlayed}: ${message}`;
    logContent.prepend(messageElement);
    gameLog.unshift(message);
    
    // Limiter à 50 messages
    if (gameLog.length > 50) {
        gameLog.pop();
        if (logContent.children.length > 50) {
            logContent.removeChild(logContent.lastChild);
        }
    }
}

// S'entraîner
function trainPlayer() {
    // Amélioration aléatoire d'une compétence
    const skills = Object.keys(player.skills);
    const randomSkill = skills[Math.floor(Math.random() * skills.length)];
    
    // Gain entre 1 et 3 points
    const gain = Math.floor(Math.random() * 3) + 1;
    player.skills[randomSkill] = Math.min(100, player.skills[randomSkill] + gain);
    
    // Perte de forme
    player.form = Math.max(30, player.form - 5);
    
    addLogMessage(`Entraînement: +${gain} en ${randomSkill} (${player.skills[randomSkill]}/100), forme: ${player.form}/100`);
    updatePlayerInfo();
}

// Sélectionner un tournoi
function selectTournament() {
    // Trouver les tournois disponibles (dans les 2 prochaines semaines)
    const nextWeekDate = new Date(currentDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 14);
    
    const availableTournaments = tournaments.filter(t => {
        const tournamentDate = new Date(t.date);
        return tournamentDate >= currentDate && tournamentDate <= nextWeekDate;
    });
    
    if (availableTournaments.length === 0) {
        addLogMessage("Aucun tournoi disponible dans les 2 prochaines semaines.");
        return;
    }
    
    // Choisir un tournoi aléatoire pour la simplicité
    const selectedTournament = availableTournaments[Math.floor(Math.random() * availableTournaments.length)];
    player.currentTournament = selectedTournament;
    
    addLogMessage(`Inscription au tournoi: ${selectedTournament.name} (${selectedTournament.category})`);
}

// Jouer un tournoi
function playTournament() {
    if (!player.currentTournament) return;
    
    const tournament = player.currentTournament;
    const tournamentPoints = tournament.points;
    
    // Réinitialiser les résultats
    tournamentResults = [];
    
    // Déterminer la performance en fonction des compétences et de la forme
    const performanceScore = (
        player.skills.serve + 
        player.skills.forehand + 
        player.skills.backhand + 
        player.skills.fitness + 
        player.skills.mental + 
        player.form
    ) / 6;
    
    // Simuler les matchs
    const rounds = [
        "1er tour", "2ème tour", "1/8 de finale", 
        "Quart de finale", "Demi-finale", "Finale"
    ];
    
    let currentRound = 0;
    let pointsEarned = 0;
    let result = "1er tour";
    
    while (currentRound < rounds.length) {
        const roundName = rounds[currentRound];
        const opponentRank = Math.max(1, player.ranking + (Math.floor(Math.random() * 30) - 15);
        const opponent = atpRankings.find(p => p.rank === opponentRank) || atpRankings[Math.floor(Math.random() * atpRankings.length)];
        
        // Chance de victoire basée sur la performance
        const winProbability = performanceScore / 100;
        const isWin = Math.random() < winProbability;
        
        // Générer un score aléatoire
        const score = generateScore(isWin);
        
        tournamentResults.push({
            round: roundName,
            player1: "Arthur Fils",
            player2: opponent.name,
            score: score,
            win: isWin
        });
        
        if (!isWin) break;
        
        result = roundName;
        currentRound++;
    }
    
    // Calcul des points gagnés
    if (result === "Finale") {
        pointsEarned = tournamentPoints;
    } else if (result === "Demi-finale") {
        pointsEarned = tournamentPoints * 0.6;
    } else if (result === "Quart de finale") {
        pointsEarned = tournamentPoints * 0.36;
    } else if (result === "1/8 de finale") {
        pointsEarned = tournamentPoints * 0.18;
    } else if (result === "2ème tour") {
        pointsEarned = tournamentPoints * 0.09;
    }
    
    // Mettre à jour les points
    player.points += Math.round(pointsEarned);
    
    // Perte de forme
    player.form = Math.max(30, player.form - 15);
    
    addLogMessage(`${tournament.name}: ${result}! +${Math.round(pointsEarned)} points. Nouveau total: ${player.points} points. Forme: ${player.form}/100`);
    
    // Mettre à jour le classement
    updateAllPlayersRankings();
    
    // Réinitialiser le tournoi courant
    player.currentTournament = null;
    updateGame();
}

// Générer un score de match
function generateScore(isWin) {
    const sets = [];
    const totalSets = isWin ? Math.floor(Math.random() * 2) + 2 : Math.floor(Math.random() * 2) + 1;
    
    for (let i = 0; i < totalSets; i++) {
        if (isWin) {
            // Arthur gagne le set
            const opponentGames = Math.floor(Math.random() * 4);
            sets.push(`6-${opponentGames}`);
        } else {
            // Arthur perd le set
            const playerGames = Math.floor(Math.random() * 4);
            sets.push(`${playerGames}-6`);
        }
    }
    
    // Ajouter un tie-break si nécessaire
    if (isWin && Math.random() > 0.7) {
        sets[sets.length - 1] = `7-6`;
    } else if (!isWin && Math.random() > 0.7) {
        sets[sets.length - 1] = `6-7`;
    }
    
    return sets.join(' ');
}

// Négocier un sponsor
function negotiateSponsor() {
    // Vérifier si eligible pour de nouveaux sponsors
    const currentSponsors = player.sponsors.length;
    const maxSponsors = Math.floor(player.ranking / 20) + 1;
    
    if (currentSponsors >= maxSponsors) {
        addLogMessage(`Vous avez déjà ${currentSponsors} sponsors (maximum: ${maxSponsors}). Améliorez votre classement pour plus de sponsors.`);
        return;
    }
    
    // Trouver les sponsors éligibles
    const eligibleSponsors = sponsors.filter(sponsor => {
        if (player.sponsors.includes(sponsor.name)) return false;
        
        // Vérifier les conditions
        if (sponsor.requirement === "Top 5" && player.ranking > 5) return false;
        if (sponsor.requirement === "Top 10" && player.ranking > 10) return false;
        if (sponsor.requirement === "Top 20" && player.ranking > 20) return false;
        if (sponsor.requirement === "Top 30" && player.ranking > 30) return false;
        if (sponsor.requirement === "Top 50" && player.ranking > 50) return false;
        
        return true;
    });
    
    if (eligibleSponsors.length === 0) {
        addLogMessage("Aucun nouveau sponsor disponible pour votre classement actuel.");
        return;
    }
    
    // Choisir un sponsor aléatoire
    const newSponsor = eligibleSponsors[Math.floor(Math.random() * eligibleSponsors.length)];
    
    // Chance de réussite (60% de base + bonus mental)
    const successChance = 60 + (player.skills.mental - 50) / 2;
    const isSuccess = Math.random() * 100 < successChance;
    
    if (isSuccess) {
        player.sponsors.push(newSponsor.name);
        addLogMessage(`Nouveau sponsor: ${newSponsor.name} (${newSponsor.level})! Bonus: +${newSponsor.bonus}% sur les gains.`);
    } else {
        addLogMessage(`Échec de la négociation avec ${newSponsor.name}.`);
    }
    
    updatePlayerInfo();
}

// Mettre à jour tous les classements
function updateAllPlayersRankings() {
    // Sauvegarder les anciens classements
    const oldRankings = {};
    atpRankings.forEach(p => {
        oldRankings[p.name] = { rank: p.rank, points: p.points };
    });
    
    // Simuler les performances des autres joueurs
    atpRankings.forEach(p => {
        if (p.name !== "Arthur Fils") {
            // 30% de chance qu'un joueur participe à un tournoi cette semaine
            if (Math.random() < 0.3) {
                const performance = Math.random() * 100;
                let pointsGained = 0;
                
                if (performance > 85) {
                    pointsGained = 1000 * Math.random();
                } else if (performance > 70) {
                    pointsGained = 500 * Math.random();
                } else if (performance > 50) {
                    pointsGained = 250 * Math.random();
                }
                
                // Perte de points pour les anciens résultats
                const pointsLost = p.points * 0.02;
                
                p.points = Math.max(0, p.points + Math.round(pointsGained) - Math.round(pointsLost));
            } else {
                // Perte de points normale
                const pointsLost = p.points * 0.01;
                p.points = Math.max(0, p.points - Math.round(pointsLost));
            }
        }
    });
    
    // Mettre à jour notre joueur
    const playerIndex = atpRankings.findIndex(p => p.name === "Arthur Fils");
    if (playerIndex !== -1) {
        atpRankings[playerIndex].points = player.points;
    } else {
        atpRankings.push({ name: "Arthur Fils", points: player.points });
    }
    
    // Trier par points décroissants
    atpRankings.sort((a, b) => b.points - a.points);
    
    // Mettre à jour les rangs
    atpRankings.forEach((p, index) => {
        p.rank = index + 1;
        
        // Mettre à jour le rang du joueur
        if (p.name === "Arthur Fils") {
            player.ranking = p.rank;
        }
    });
    
    // Trouver les meilleures progressions et pires chutes
    calculateRankingChanges(oldRankings);
    
    // Mettre à jour les anciens classements pour la prochaine comparaison
    previousRankings = oldRankings;
}

// Calculer les changements de classement
function calculateRankingChanges(oldRankings) {
    rankingChanges = [];
    const changes = [];
    
    atpRankings.forEach(p => {
        const oldRank = oldRankings[p.name] ? oldRankings[p.name].rank : p.rank;
        const change = oldRank - p.rank;
        
        if (change !== 0) {
            changes.push({
                player: p.name,
                change: change,
                oldRank: oldRank,
                newRank: p.rank
            });
        }
    });
    
    // Trier par changement
    changes.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
    
    // Prendre les 3 meilleures progressions et pires chutes
    const best = changes.filter(c => c.change > 0).slice(0, 3);
    const worst = changes.filter(c => c.change < 0).slice(0, 3);
    
    best.forEach(c => rankingChanges.push({ type: 'best', player: c.player, change: c.change }));
    worst.forEach(c => rankingChanges.push({ type: 'worst', player: c.player, change: c.change }));
}

// Semaine suivante
function nextWeek() {
    player.weeksPlayed++;
    currentDate.setDate(currentDate.getDate() + 7);
    
    // Régénération de la forme (10% + bonus fitness)
    const formRecovery = 10 + (player.skills.fitness - 50) / 10;
    player.form = Math.min(100, player.form + formRecovery);
    
    // Jouer le tournoi si inscrit
    if (player.currentTournament) {
        const tournamentDate = new Date(player.currentTournament.date);
        if (tournamentDate <= currentDate) {
            playTournament();
        }
    }
    
    // Simuler les autres joueurs
    simulateOtherPlayers();
    
    addLogMessage(`Nouvelle semaine. Forme: ${player.form}/100`);
    updateGame();
}

// Simuler les autres joueurs
function simulateOtherPlayers() {
    // Cette fonction est déjà intégrée dans updateAllPlayersRankings()
    // On l'appelle ici pour s'assurer que les autres joueurs progressent/régressent
    updateAllPlayersRankings();
}
