function toggleCIDSection() {
    const cidSection = document.getElementById('cid_section');
    const previewCID = document.getElementById('preview_cid');
    if (document.getElementById('hormonal').checked) {
        cidSection.classList.remove('hidden');
        previewCID.classList.remove('hidden');
    } else {
        cidSection.classList.add('hidden');
        previewCID.classList.add('hidden');
    }
    updatePreview();
}

function toggleCustomMedication(select) {
    const customInput = select.parentElement.querySelector('.custom-medication');
    if (select.value === 'custom') {
        customInput.classList.remove('hidden');
    } else {
        customInput.classList.add('hidden');
    }
    updatePreview();
}

function toggleCustomDosage(select) {
    const customInput = select.parentElement.querySelector('.custom-dosage');
    if (select.value === 'custom') {
        customInput.classList.remove('hidden');
    } else {
        customInput.classList.add('hidden');
    }
    updatePreview();
}

function addMedication() {
    const template = document.querySelector('.medication-entry').cloneNode(true);
    template.querySelector('.medication-select').value = '';
    template.querySelector('.dosage-select').value = '';
    template.querySelector('.usage-instructions').value = '';
    document.getElementById('medications_list').appendChild(template);
}

function removeMedication(button) {
    button.closest('.medication-entry').remove();
    updatePreview();
}

function updatePreview() {
    // Update patient info
    const patient = document.getElementById('patient');
    const selectedPatient = patient.options[patient.selectedIndex];
    document.getElementById('preview_patient').innerHTML = selectedPatient.value ?
        `<h4>Paciente: ${selectedPatient.text}</h4>` : '';

    // Update date
    const currentDate = new Date().toLocaleDateString('pt-BR');
    document.getElementById('preview_date').innerHTML = `<p>Data: ${currentDate}</p>`;

    // Update CID if hormonal
    const cidSelect = document.getElementById('cid');
    const selectedCID = cidSelect.options[cidSelect.selectedIndex];
    document.getElementById('preview_cid').innerHTML = selectedCID.value ?
        `<p>CID: ${selectedCID.text}</p>` : '';

    // Update medications
    const medicationsPreview = document.getElementById('preview_medications');
    medicationsPreview.innerHTML = '<h4><br /><br />Prescrição:</h4>';

    document.querySelectorAll('.medication-entry').forEach((entry, index) => {
        const medSelect = entry.querySelector('.medication-select');
        const customMed = entry.querySelector('.custom-medication');
        const dosageSelect = entry.querySelector('.dosage-select');
        const customDosage = entry.querySelector('.custom-dosage');
        const instructions = entry.querySelector('.usage-instructions');

        const medName = medSelect.value === 'custom' ? customMed.value :
            medSelect.options[medSelect.selectedIndex]?.text;
        const dosage = dosageSelect.value === 'custom' ? customDosage.value :
            dosageSelect.options[dosageSelect.selectedIndex]?.text;

        if (medName) {
            medicationsPreview.innerHTML += `
                <p>${index + 1}. ${medName}</p>
                ${dosage ? `<p>Dosagem: ${dosage}</p>` : ''}
                ${instructions.value ? `<p>Instruções: ${instructions.value}</p>` : ''}
                <br>
            `;
        }
    });
}

// Initial preview update
document.addEventListener('DOMContentLoaded', updatePreview);