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
    container.innerHTML = '';

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

    // Ability Scores
    let statsInfo = document.createElement('table');
    for (const key in data.main.stats) {
        const score = data.main.stats[key]?.score || 10;
        const modifier = Math.floor((score - 10) / 2);
        let row = document.createElement('tr');
        row.innerHTML = `<th>${formatKey(key)}</th><td>${score} (${modifier >= 0 ? '+' : ''}${modifier})</td>`;
        statsInfo.appendChild(row);
    }
    container.appendChild(createSection('Ability Scores', statsInfo));

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
        const score = data.main.stats[stat]?.score || 10;
        const modifier = Math.floor((score - 10) / 2);
        const isProficient = data.main.skillsprof[skill] === 1;
        const proficiency = isProficient ? proficiencyBonus : 0;
        const skillValue = modifier + proficiency;

        let row = document.createElement('tr');
        let cell = document.createElement('td');
        cell.innerHTML = `${skillValue >= 0 ? '+' : ''}${skillValue}`;

        let checkbox = createCheckbox(`prof_${skill}`, isProficient, (checked) => {
            data.main.skillsprof[skill] = checked ? 1 : 0;
            displayCharacterSheet(data);
        });

        row.innerHTML = `<th>${formatKey(skill)}</th>`;
        cell.appendChild(document.createTextNode(' '));
        cell.appendChild(checkbox);
        row.appendChild(cell);
        skillsInfo.appendChild(row);
    }

    container.appendChild(createSection('Skills', skillsInfo));

    // Death Saves
    let deathSaves = document.createElement('table');
    ['success', 'failure'].forEach(type => {
        let row = document.createElement('tr');
        let label = document.createElement('th');
        label.innerText = `Death Saves (${type})`;
        
        let cell = document.createElement('td');
        for (let i = 1; i <= 3; i++) {
            let checkbox = createCheckbox(`deathSave_${type}_${i}`, data.main.combat.deathSaves[type] >= i, (checked) => {
                data.main.combat.deathSaves[type] = checked ? i : i - 1;
                displayCharacterSheet(data);
            });
            cell.appendChild(checkbox);
        }
        row.appendChild(label);
        row.appendChild(cell);
        deathSaves.appendChild(row);
    });

    container.appendChild(createSection('Death Saves', deathSaves));
}
