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
    // Add Proficiency Bonus
    const proficiencyBonus = Math.ceil(data.main.core.level / 4) + 1;
    coreInfo += `<tr><th>Proficiency Bonus</th><td>${proficiencyBonus}</td></tr>`;
    coreInfo += '</table>';
    container.appendChild(createSection('Core Information', coreInfo));

    // Combat Stats
    let combatInfo = '<table>';
    for (const key in data.main.combat) {
        if (key === 'deathSaves') {
            combatInfo += `<tr><th>Death Saves</th><td>Success: ${createCheckboxes('deathSuccess', data.main.combat.deathSaves.success)} Failure: ${createCheckboxes('deathFailure', data.main.combat.deathSaves.failure)}</td></tr>`;
        } else if (key === 'ammunition') {
            combatInfo += `<tr>
