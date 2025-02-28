let characterData = {};

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            characterData = JSON.parse(e.target.result);
            displayCharacterSheet();
        } catch (error) {
            alert('Invalid JSON file');
        }
    };
    reader.readAsText(file);
});

// Returns the proficiency bonus based on character level
function getProficiencyBonus(level) {
    return Math.ceil(level / 4) + 1;
}

// Mapping skills to ability scores
const skillAbilities = {
    acrobatics: "dexterity",
    animalHandling: "wisdom",
    arcana: "intelligence",
    athletics: "strength",
    deception: "charisma",
    history: "intelligence",
    insight: "wisdom",
    intimidation: "charisma",
    investigation: "intelligence",
    medicine: "wisdom",
    nature: "intelligence",
    perception: "wisdom",
    performance: "charisma",
    persuasion: "charisma",
    religion: "intelligence",
    sleightOfHand: "dexterity",
    stealth: "dexterity",
    survival: "wisdom"
};

// Creates an editable cell
function createEditableCell(value, path, isNumber = false) {
    const cell = document.createElement('td');
    cell.textContent = value;
    cell.dataset.path = path;
    cell.dataset.isNumber = isNumber;

    cell.addEventListener('dblclick', function() {
        const input = document.createElement('input');
        input.value = value;
        input.type = isNumber ? 'number' : 'text';
        input.addEventListener('blur', function() {
            let newValue = isNumber ? parseFloat(input.value) : input.value;
            if (isNumber && isNaN(newValue)) newValue = 0;

            updateData(path, newValue);
            displayCharacterSheet();
        });
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') input.blur();
        });

        cell.textContent = '';
        cell.appendChild(input);
        input.focus();
    });

    return cell;
}

// Updates the character data
function updateData(path, value) {
    const keys = path.split('.');
    let obj = characterData;
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
}

// Display Character Sheet
function displayCharacterSheet() {
    const container = document.getElementById('sheetContainer');
    container.innerHTML = '';

    function createSection(title, content) {
        const section = document.createElement('div');
        section.classList.add('section');
        section.innerHTML = `<h3>${title}</h3>`;
        section.appendChild(content);
        return section;
    }

    // Core Information
    let coreTable = document.createElement('table');
    for (const key in characterData.main.core) {
        const row = document.createElement('tr');
        row.appendChild(document.createElement('th')).textContent = key;
        row.appendChild(createEditableCell(characterData.main.core[key], `main.core.${key}`, typeof characterData.main.core[key] === 'number'));
        coreTable.appendChild(row);
    }
    
    // Add Proficiency Bonus
    let profRow = document.createElement('tr');
    profRow.appendChild(document.createElement('th')).textContent = "Proficiency Bonus";
    profRow.appendChild(document.createElement('td')).textContent = `+${getProficiencyBonus(characterData.main.core.level)}`;
    coreTable.appendChild(profRow);

    container.appendChild(createSection('Core Information', coreTable));

    // Skills Table
    let skillsTable = document.createElement('table');
    for (const skill in characterData.main.skillsprof) {
        const row = document.createElement('tr');
        const ability = skillAbilities[skill] || "intelligence";
        const abilityScore = characterData.main.stats[ability].score || 10;
        const abilityMod = Math.floor((abilityScore - 10) / 2);
        const proficiencyBonus = getProficiencyBonus(characterData.main.core.level);
        const isProficient = characterData.main.skillsprof[skill] > 0;
        const skillTotal = abilityMod + (isProficient ? proficiencyBonus : 0);

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isProficient;
        checkbox.addEventListener('change', function() {
            updateData(`main.skillsprof.${skill}`, this.checked ? 1 : 0);
            displayCharacterSheet();
        });

        row.appendChild(document.createElement('th')).textContent = skill;
        row.appendChild(document.createElement('td')).textContent = skillTotal;
        let checkCell = document.createElement('td');
        checkCell.appendChild(checkbox);
        row.appendChild(checkCell);
        skillsTable.appendChild(row);
    }

    container.appendChild(createSection('Skills', skillsTable));
}

// Download JSON
document.getElementById('downloadButton').addEventListener('click', function() {
    const json = JSON.stringify(characterData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = "character_sheet.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
