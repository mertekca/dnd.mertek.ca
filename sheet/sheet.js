document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            displayCharacterSheet(data);
        } catch (error) {
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(file);
});

function formatKey(key) {
    return key.replace(/([A-Z])/g, ' $1')
              .replace(/^./, str => str.toUpperCase())
              .replace("Hp", "HP");
}

function createCheckboxes(name, count) {
    let checkboxes = '';
    for (let i = 0; i < 3; i++) {
        checkboxes += `<input type="checkbox" name="${name}" ${i < count ? 'checked' : ''}>`;
    }
    return checkboxes;
}

function displayCharacterSheet(data) {
    const container = document.getElementById('sheetContainer');
    container.innerHTML = ''; // Clear the container before rendering new data

    // Calculate Proficiency Bonus (only once)
    const proficiencyBonus = Math.ceil(data.main.core.level / 4) + 1;

    // Function to create section with title and content
    function createSection(title, content) {
        const section = document.createElement('div');
        section.classList.add('section');
        section.innerHTML = `<h3>${title}</h3>${content}`;
        return section;
    }

    // Core Information
    let coreInfo = '<table>';
    for (const key in data.main.core) {
        coreInfo += `<tr><th>${formatKey(key)}</th><td>${data.main.core[key]}</td></tr>`;
    }
    coreInfo += `<tr><th>Proficiency Bonus</th><td>${proficiencyBonus}</td></tr>`;
    coreInfo += '</table>';
    container.appendChild(createSection('Core Information', coreInfo));

    // Combat Stats
    let combatInfo = '<table>';
    for (const key in data.main.combat) {
        if (key === 'deathSaves') {
            combatInfo += `<tr><th>Death Saves</th><td>Success: ${createCheckboxes('deathSuccess', data.main.combat.deathSaves.success)} Failure: ${createCheckboxes('deathFailure', data.main.combat.deathSaves.failure)}</td></tr>`;
        } else if (key === 'ammunition') {
            combatInfo += `<tr><th>Ammunition</th><td>Bullets: ${data.main.combat.ammunition.bullets}<br>Arrows: ${data.main.combat.ammunition.arrows}</td></tr>`;
        } else {
            combatInfo += `<tr><th>${formatKey(key)}</th><td>${data.main.combat[key]}</td></tr>`;
        }
    }
    combatInfo += '</table>';
    container.appendChild(createSection('Combat Stats', combatInfo));

    // Ability Scores
    let statsInfo = '<table>';
    for (const key in data.main.stats) {
        const modifier = Math.floor((data.main.stats[key].score - 10) / 2);
        statsInfo += `<tr><th>${formatKey(key)}</th></tr><tr><td>${data.main.stats[key].score}</td></tr><tr><td>${modifier >= 0 ? '+' : ''}${modifier}</td></tr>`;
    }
    statsInfo += '</table>';
    container.appendChild(createSection('Ability Scores', statsInfo));

    // Saving Throws
    let savingThrowsInfo = '<table>';
    for (const key in data.main.stats) {
        savingThrowsInfo += `<tr><th>${formatKey(key)}</th><td>Proficiency: ${data.main.stats[key].savingProf}, Misc: ${data.main.stats[key].savingMisc}</td></tr>`;
    }
    savingThrowsInfo += '</table>';
    container.appendChild(createSection('Saving Throws', savingThrowsInfo));

    // Skills Section
    let skillsInfo = '<table>';
    const skillsList = [
        'acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history', 'insight', 'intimidation',
        'investigation', 'medicine', 'nature', 'perception', 'performance', 'persuasion', 'religion',
        'sleightOfHand', 'stealth', 'survival'
    ];

    skillsList.forEach(skill => {
        const modifier = Math.floor((data.main.stats[skill]?.score - 10) / 2);
        const proficiency = data.main.skillsprof[skill] ? proficiencyBonus : 0;
        const skillValue = modifier + proficiency;
        skillsInfo += `<tr><th>${formatKey(skill)}</th><td>${skillValue >= 0 ? '+' : ''}${skillValue}</td></tr>`;
    });

    skillsInfo += '</table>';
    container.appendChild(createSection('Skills', skillsInfo));

    // Weapons Section
    let weaponsInfo = '<table>';
    for (const weapon in data.main.weapons) {
        const w = data.main.weapons[weapon];
        weaponsInfo += `<tr><th>${weapon}</th><td>Hit: ${w.hit}, Damage: ${w.damage.diceAmount}${w.damage.dice} + ${w.damage.bonusDamage}, Type: ${w.type}</td></tr>`;
    }
    weaponsInfo += '</table>';
    container.appendChild(createSection('Weapons', weaponsInfo));
}
