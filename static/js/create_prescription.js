function toggleCIDSection() {
    const cidSection = document.getElementById('cid_section');
    const previewCID = document.getElementById('preview_cid');
    if (document.getElementById('prescription-type').value === 'hormonal') {
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
    const template = document.getElementById('medication-entry-template');
    const newEntry = document.importNode(template.content, true);

    // Reset values if needed
    newEntry.querySelector('.medication-select').value = '';
    newEntry.querySelector('.medication-info').value = '';

    document.getElementById('medications_list').appendChild(newEntry);
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

let patientsData = {};

function updatePreview() {
    // Update patient info
    const patient = document.getElementById('patient');
    const selectedPatient = patient.options[patient.selectedIndex];

    if (selectedPatient.value) {

        const patientId = selectedPatient.value;
        fetch(`/get_patient/${patientId}`).then(function (response) {
            response.json().then(function (data) {
                const patientName = data.name;
                const patientCPF = data.cpf;
                const patientPhone = data.phone;
                const patientStreet = data.street;
                const patientHouseNumber = data.house_number;
                const patientAdditionalInfo = data.additional_info;
                const patientCountry = data.country;
                const patientState = data.state;
                const patientCity = data.city;

                let addressPreview = `${patientStreet}, ${patientHouseNumber}`;
                if (patientAdditionalInfo) {
                    addressPreview += `, ${patientAdditionalInfo}, ${patientCity} - ${patientState}`;
                }
                if (patientCity) {
                    addressPreview += `, ${patientCity} - ${patientState}`;
                }

                document.getElementById('preview_patient').innerHTML = `
                    <h4>Paciente:</h4>
                    <p> ${patientName}</p>
                    <p>CPF: ${patientCPF}</p>
                    <p>Endereço: ${addressPreview}</p>
                    <p>Fone: ${patientPhone}</p>
                `;
            })
        })

    } else {
        document.getElementById('preview_patient').innerHTML = '';
    }

    // Update date
    const currentDate = new Date().toLocaleDateString('pt-BR');
    document.getElementById('preview_date').innerHTML = `<p>Data: ${currentDate}</p>`;

    // Update CID if hormonal
    const cidSelect = document.getElementById('cid');
    const selectedCID = cidSelect.options[cidSelect.selectedIndex];
    document.getElementById('preview_cid').innerHTML = selectedCID.value ?
        `<h4>CID: ${selectedCID.text}</h4>` : '';

    // Update medications
    const medicationsPreview = document.getElementById('preview_medications');
    medicationsPreview.innerHTML = '<h4>Prescrição:</h4>';

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

document.querySelector('.medication-info').addEventListener('focusout', function () {
    updatePreview();
});

function printDiv(divName) {
    const printContents = document.getElementById(divName).innerHTML;
    const originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
}