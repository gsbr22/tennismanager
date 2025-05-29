// Initialisation du jeu
document.addEventListener('DOMContentLoaded', function() {
    updateATPTable();
    updateTournamentsTable();
    updatePlayerInfo();
    
    // Événements des boutons
    document.getElementById('train-btn').addEventListener('click', trainPlayer);
    document.getElementById('play-tournament-btn').addEventListener('click', selectTournament);
    document.getElementById('negotiate-sponsor-btn').addEventListener('click', negotiateSponsor);
    document.getElementById('next-week-btn').addEventListener('click', nextWeek);
});

// Mise à jour du classement ATP
function updateATPTable() {
    const tableBody = document.querySelector('#atp-table tbody');
    tableBody.innerHTML = '';
    
    atpRankings.forEach(player => {
        const row = document.createElement('tr');
        if (player.name === "Arthur Fils") {
            row.classList.add('highlight');
        }
        
        row.innerHTML = `
            <td>${player.rank}</td>
            <td>${player.name}</td>
            <td>${player.points}</td>
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
    
    // Déterminer la performance en fonction des compétences et de la forme
    const performanceScore = (
        player.skills.serve + 
        player.skills.forehand + 
        player.skills.backhand + 
        player.skills.fitness + 
        player.skills.mental + 
        player.form
    ) / 6;
    
    // Déterminer le résultat
    let result, pointsEarned;
    if (performanceScore > 90) {
        result = "Victoire";
        pointsEarned = tournamentPoints;
    } else if (performanceScore > 80) {
        result = "Finale";
        pointsEarned = tournamentPoints * 0.6;
    } else if (performanceScore > 70) {
        result = "Demi-finale";
        pointsEarned = tournamentPoints * 0.36;
    } else if (performanceScore > 60) {
        result = "Quart de finale";
        pointsEarned = tournamentPoints * 0.18;
    } else if (performanceScore > 50) {
        result = "1/8 de finale";
        pointsEarned = tournamentPoints * 0.09;
    } else {
        result = "1er tour";
        pointsEarned = 0;
    }
    
    // Mettre à jour les points
    player.points += Math.round(pointsEarned);
    
    // Mettre à jour le classement
    updateRanking();
    
    // Perte de forme
    player.form = Math.max(30, player.form - 15);
    
    addLogMessage(`${tournament.name}: ${result}! +${Math.round(pointsEarned)} points. Nouveau total: ${player.points} points. Forme: ${player.form}/100`);
    
    // Réinitialiser le tournoi courant
    player.currentTournament = null;
    updatePlayerInfo();
    updateATPTable();
}

// Négocier un sponsor
function negotiateSponsor() {
    // Vérifier si eligible pour de nouveaux sponsors
    const currentSponsors = player.sponsors.length;
    const maxSponsors = Math.floor(player.ranking / 20) + 1; // 1 sponsor par tranche de 20 rangs
    
    if (currentSponsors >= maxSponsors) {
        addLogMessage(`Vous avez déjà ${currentSponsors} sponsors (maximum: ${maxSponsors}). Améliorez votre classement pour plus de sponsors.`);
        return;
    }
    
    // Trouver les sponsors éligibles
    const eligibleSponsors = sponsors.filter(sponsor => {
        if (player.sponsors.includes(sponsor.name)) return false;
        
        // Vérifier les conditions (simplifié)
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

// Mettre à jour le classement
function updateRanking() {
    // Trier tous les joueurs par points
    const allPlayers = [...atpRankings];
    const playerIndex = allPlayers.findIndex(p => p.name === "Arthur Fils");
    
    if (playerIndex !== -1) {
        allPlayers[playerIndex].points = player.points;
    } else {
        allPlayers.push({ name: "Arthur Fils", points: player.points });
    }
    
    // Trier par points décroissants
    allPlayers.sort((a, b) => b.points - a.points);
    
    // Mettre à jour les rangs
    allPlayers.forEach((p, index) => {
        p.rank = index + 1;
        
        // Mettre à jour le rang du joueur
        if (p.name === "Arthur Fils") {
            player.ranking = p.rank;
        }
    });
    
    // Mettre à jour le classement ATP
    atpRankings.length = 0;
    allPlayers.slice(0, 100).forEach(p => atpRankings.push(p));
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
    
    addLogMessage(`Nouvelle semaine. Forme: ${player.form}/100`);
    updatePlayerInfo();
    updateTournamentsTable();
}
