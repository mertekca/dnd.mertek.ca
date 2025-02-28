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

// Function to create a checkbox with an event listener
function createCheckbox(id, checked, updateFunction) {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = id;
    checkbox.checked = checked;
    checkbox.addEventListener('change', () => updateFunction(checkbox.checked));
    return checkbox;
}

function displayCharacterSheet(data) {
    const container = document.getElementById('sheetContainer');
    container.innerHTML = ''; // Clear the container before rendering new data

    // Calculate Proficiency Bonus
    const proficiencyBonus = Math.ceil(data.main.core.level / 4) + 1;

    function createSection(title, content) {
        const section = document.createElement('div');
        section.classList.add('section');
        section.innerHTML = `<h3>${title}</h3>`;
        section.appendChild(content);
        return section;
    }

    // Core Information
    let coreInfo = document.createElement('table');
    for (const key in data.main.core) {
        let row = document.createElement('tr');
        row.innerHTML = `<th>${formatKey(key)}</th><td>${data.main.core[key]}</td>`;
        coreInfo.appendChild(row);
    }
    coreInfo.innerHTML += `<tr><th>Proficiency Bonus</th><td>${proficiencyBonus}</td></tr>`;
    container.appendChild(createSection('Core Information', coreInfo));

    // Combat Stats
    let combatInfo = document.createElement('table');
    for (const key in data.main.combat) {
        let row = document.createElement('tr');
        if (key === 'deathSaves') {
            let cell = document.createElement('td');
            cell.innerHTML = `Success: `;
            cell.appendChild(createCheckbox('deathSuccess', data.main.combat.deathSaves.success, (checked) => {
                data.main.combat.deathSaves.success = checked ? 1 : 0;
            }));
            cell.innerHTML += ` Failure: `;
            cell.appendChild(createCheckbox('deathFailure', data.main.combat.deathSaves.failure, (checked) => {
                data.main.combat.deathSaves.failure = checked ? 1 : 0;
            }));
            row.innerHTML = `<th>Death Saves</th>`;
            row.appendChild(cell);
        } else if (key === 'ammunition') {
            row.innerHTML = `<th>Ammunition</th><td>Bullets: ${data.main.combat.ammunition.bullets} | Arrows: ${data.main.combat.ammunition.arrows}</td>`;
        } else {
            row.innerHTML = `<th>${formatKey(key)}</th><td>${data.main.combat[key]}</td>`;
        }
        combatInfo.appendChild(row);
    }
    container.appendChild(createSection('Combat Stats', combatInfo));

    // Ability Scores
    let statsInfo = document.createElement('table');
    for (const key in data.main.stats) {
        const score = data.main.stats[key]?.score || 0;
        const modifier = Math.floor((score - 10) / 2);
        let row = document.createElement('tr');
        row.innerHTML = `<th>${formatKey(key)}</th><td>${score} (${modifier >= 0 ? '+' : ''}${modifier})</td>`;
        statsInfo.appendChild(row);
    }
    container.appendChild(createSection('Ability Scores', statsInfo));

    // Saving Throws
    let savingThrowsInfo = document.createElement('table');
    for (const key in data.main.stats) {
        let row = document.createElement('tr');
        row.innerHTML = `<th>${formatKey(key)}</th><td>Proficiency: ${data.main.stats[key].savingProf}, Misc: ${data.main.stats[key].savingMisc}</td>`;
        savingThrowsInfo.appendChild(row);
    }
    container.appendChild(createSection('Saving Throws', savingThrowsInfo));

    // Skills Section with Proficiency Checkbox
    let skillsInfo = document.createElement('table');
    const skillsList = {
        'acrobatics': 'dexterity', 'animalHandling': 'wisdom', 'arcana': 'intelligence',
        'athletics': 'strength', 'deception': 'charisma', 'history': 'intelligence',
        'insight': 'wisdom', 'intimidation': 'charisma', 'investigation': 'intelligence',
        'medicine': 'wisdom', 'nature': 'intelligence', 'perception': 'wisdom',
        'performance': 'charisma', 'persuasion': 'charisma', 'religion': 'intelligence',
        'sleightOfHand': 'dexterity', 'stealth': 'dexterity', 'survival': 'wisdom'
    };

    for (const skill in skillsList) {
        const stat = skillsList[skill];
        const score = data.main.stats[stat]?.score || 0;
        const modifier = Math.floor((score - 10) / 2);
        const isProficient = data.main.skillsprof[skill] === 1;
        const proficiency = isProficient ? proficiencyBonus : 0;
        const skillValue = modifier + proficiency;

        let row = document.createElement('tr');
        let cell = document.createElement('td');
        cell.innerHTML = `${modifier >= 0 ? '+' : ''}${modifier} + ${proficiency} = ${skillValue >= 0 ? '+' : ''}${skillValue}`;

        let checkbox = createCheckbox(`prof_${skill}`, isProficient, (checked) => {
            data.main.skillsprof[skill] = checked ? 1 : 0;
            displayCharacterSheet(data); // Re-render sheet after change
        });

        row.innerHTML = `<th>${formatKey(skill)}</th>`;
        cell.appendChild(document.createTextNode(' Proficient: '));
        cell.appendChild(checkbox);
        row.appendChild(cell);
        skillsInfo.appendChild(row);
    }

    container.appendChild(createSection('Skills', skillsInfo));

    // Weapons Section
    let weaponsInfo = document.createElement('table');
    for (const weapon in data.main.weapons) {
        const w = data.main.weapons[weapon];
        let row = document.createElement('tr');
        row.innerHTML = `<th>${weapon}</th><td>Hit: ${w.hit}, Damage: ${w.damage.diceAmount}${w.damage.dice} + ${w.damage.bonusDamage}, Type: ${w.type}</td>`;
        weaponsInfo.appendChild(row);
    }
    container.appendChild(createSection('Weapons', weaponsInfo));
}
