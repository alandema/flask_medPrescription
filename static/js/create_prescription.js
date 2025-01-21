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
    template.querySelector('.medication-info').value = '';
    document.getElementById('medications_list').appendChild(template);
    updatePreview();
}

function removeMedication(button) {
    button.closest('.medication-entry').remove();
    updatePreview();
}

function updateMedicationInfo(select) {
    const infoInput = select.closest('.medication-entry').querySelector('.medication-info');
    if (select.value) {
        // Fetch medication info based on selected value and update the text input
        // For now, we'll just use the medication name as an example
        infoInput.value = select.options[select.selectedIndex].text;
    } else {
        infoInput.value = '';
    }
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
        const medInfo = entry.querySelector('.medication-info');

        const medName = medSelect.options[medSelect.selectedIndex]?.text || 'Medicamento personalizado';
        const info = medInfo.value;

        if (info) {
            medicationsPreview.innerHTML += `
                <p>${index + 1}. ${medName}</p>
                <p>Informações: ${info}</p>
                <br>
            `;
        }
    });
}

// Initial preview update
document.addEventListener('DOMContentLoaded', updatePreview);

document.querySelector('.medication-info').addEventListener('focusout', function() {
    updatePreview();
});