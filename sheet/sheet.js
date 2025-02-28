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

function calculateProficiencyBonus(level) {
    return Math.ceil(level / 4) + 1;
}

function makeEditable(cell) {
    const originalValue = cell.innerText;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = originalValue;
    cell.innerHTML = '';
    cell.appendChild(input);

    input.addEventListener('blur', () => {
        cell.innerHTML = input.value;
    });
}

function displayCharacterSheet(data) {
    const container = document.getElementById('sheetContainer');
    container.innerHTML = '';

    const proficiencyBonus = calculateProficiencyBonus(data.main.core.level);

    // Core Information
    let coreInfo = '<table>';
    for (const key in data.main.core) {
        coreInfo += `<tr><th>${formatKey(key)}</th><td ${key !== "level" ? 'ondblclick="makeEditable(this)"' : ''}>${data.main.core[key]}</td></tr>`;
    }
    coreInfo += `<tr><th>Proficiency Bonus</th><td>${proficiencyBonus}</td></tr>`;
    coreInfo += '</table>';
    container.appendChild(createSection('Core Information', coreInfo));

    // Combat Info
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

    // Stats Info
    let statsInfo = '<table>';
    for (const key in data.main.stats) {
        const modifier = Math.floor((data.main.stats[key].score - 10) / 2);
        statsInfo += `<tr><th>${formatKey(key)}</th><td ${key !== "score" ? 'ondblclick="makeEditable(this)"' : ''}>${data.main.stats[key].score}</td></tr>`;
        statsInfo += `<tr><td>${modifier >= 0 ? '+' : ''}${modifier}</td></tr>`;
    }
    statsInfo += '</table>';
    container.appendChild(createSection('Ability Scores', statsInfo));

    // Skills Info
    let skillsInfo = '<table>';
    const skills = [
        'acrobatics', 'animalHandling', 'arcana', 'athletics', 'deception', 'history',
        'insight', 'intimidation', 'investigation', 'medicine', 'nature', 'perception',
        'performance', 'persuation', 'religion', 'sleightOfHand', 'stealth', 'survival'
    ];
    for (const skill of skills) {
        const skillModifier = Math.floor((data.main.stats[skill].score - 10) / 2);
        const proficiencyBonus = data.main.skillsprof[skill] ? calculateProficiencyBonus(data.main.core.level) : 0;
        const total = skillModifier + proficiencyBonus;

        skillsInfo += `<tr><th>${formatKey(skill)}</th><td ondblclick="makeEditable(this)">${total >= 0 ? '+' : ''}${total}</td></tr>`;
    }
    skillsInfo += '</table>';
    container.appendChild(createSection('Skills', skillsInfo));

    // Weapons Info
    let weaponsInfo = '<table>';
    for (const weapon in data.main.weapons) {
        const w = data.main.weapons[weapon];
        weaponsInfo += `<tr><th>${weapon}</th><td>Hit: ${w.hit}, Damage: ${w.damage.diceAmount}${w.damage.dice} + ${w.damage.bonusDamage}, Type: ${w.type}</td></tr>`;
    }
    weaponsInfo += '</table>';
    container.appendChild(createSection('Weapons', weaponsInfo));

    // Equipment and Wealth
    let equipmentInfo = '<table>';
    for (const key in data.equipmentAndWealth.equipment) {
        equipmentInfo += `<tr><th>${formatKey(key)}</th><td>${JSON.stringify(data.equipmentAndWealth.equipment[key])}</td></tr>`;
    }
    equipmentInfo += '</table>';
    container.appendChild(createSection('Equipment and Wealth', equipmentInfo));

    // Download Button
    document.getElementById('downloadBtn').style.display = 'block';
    document.getElementById('downloadBtn').addEventListener('click', () => {
        const newData = JSON.stringify(data, null, 2);
        const blob = new Blob([newData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'character_sheet.json';
        link.click();
        URL.revokeObjectURL(url);
    });
}

function createSection(title, content) {
    const section = document.createElement('div');
    section.classList.add('section');
    section.innerHTML = `<h3>${title}</h3>${content}`;
    return section;
}
