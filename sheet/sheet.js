let characterData = {}; // Store the character data globally

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            characterData = JSON.parse(e.target.result);
            displayCharacterSheet(characterData);
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

// Creates an editable table cell
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
            cell.textContent = newValue;
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

// Updates the character data based on input changes
function updateData(path, value) {
    const keys = path.split('.');
    let obj = characterData;
    for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
}

// Calculates proficiency bonus based on level
function calculateProficiencyBonus(level) {
    return Math.ceil(level / 4) + 1;
}

// Displays the character sheet
function displayCharacterSheet(data) {
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
    let coreInfo = document.createElement('table');
    for (const key in data.main.core) {
        const row = document.createElement('tr');
        row.appendChild(document.createElement('th')).textContent = formatKey(key);
        row.appendChild(createEditableCell(data.main.core[key], `main.core.${key}`, typeof data.main.core[key] === 'number'));
        coreInfo.appendChild(row);
    }
    
    // Add calculated proficiency bonus
    const profRow = document.createElement('tr');
    profRow.appendChild(document.createElement('th')).textContent = "Proficiency Bonus";
    profRow.appendChild(document.createElement('td')).textContent = `+${calculateProficiencyBonus(data.main.core.level)}`;
    coreInfo.appendChild(profRow);

    container.appendChild(createSection('Core Information', coreInfo));

    // Skills Section
    let skillsTable = document.createElement('table');
    let proficiencyBonus = calculateProficiencyBonus(data.main.core.level);

    for (const skill in data.main.skillsprof) {
        const row = document.createElement('tr');
        const skillModifier = Math.floor((data.main.stats[getAbilityFromSkill(skill)].score - 10) / 2);
        const isProficient = data.main.skillsprof[skill] > 0;
        const skillTotal = skillModifier + (isProficient ? proficiencyBonus : 0);

        let checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = isProficient;
        checkbox.addEventListener('change', function() {
            updateData(`main.skillsprof.${skill}`, this.checked ? 1 : 0);
            displayCharacterSheet(characterData);
        });

        row.appendChild(document.createElement('th')).textContent = formatKey(skill);
        let modCell = document.createElement('td');
        modCell.textContent = skillTotal;
        row.appendChild(modCell);
        let checkCell = document.createElement('td');
        checkCell.appendChild(checkbox);
        row.appendChild(checkCell);
        skillsTable.appendChild(row);
    }

    container.appendChild(createSection('Skills', skillsTable));

    // Add a download button
    const downloadButton = document.createElement('button');
    downloadButton.textContent = "Download Sheet";
    downloadButton.addEventListener('click', downloadCharacterSheet);
    container.appendChild(downloadButton);
}

// Helper function to determine which ability governs a skill
function getAbilityFromSkill(skill) {
    const skillMapping = {
        acrobatics: "dexterity",
        animalHandling: "wisdom",
        arcana: "inteligence",
        athletics: "strength",
        deception: "charisma",
        history: "inteligence",
        insight: "wisdom",
        intimidation: "charisma",
        investigation: "inteligence",
        medicine: "wisdom",
        nature: "inteligence",
        perception: "wisdom",
        performance: "charisma",
        persuation: "charisma",
        religion: "inteligence",
        sleightOfHand: "dexterity",
        stealth: "dexterity",
        survival: "wisdom"
    };
    return skillMapping[skill] || "inteligence";
}

// Downloads the edited sheet as a JSON file
function downloadCharacterSheet() {
    const json = JSON.stringify(characterData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = characterData.title ? `${characterData.title}.json` : "character_sheet.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}
