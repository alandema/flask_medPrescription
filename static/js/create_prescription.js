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
                const patientDistrict = data.district;
                const patientAdditionalInfo = data.additional_info;
                const patientCountry = data.country;
                const patientState = data.state;
                const patientCity = data.city;

                let addressPreview = `${patientStreet}, ${patientHouseNumber}, ${patientDistrict}`;
                if (patientAdditionalInfo) addressPreview += `, ${patientAdditionalInfo}`;
                if (patientCountry === 'BR') addressPreview += `, ${patientCity} - ${patientState}`;


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

        const medName = medSelect.options[medSelect.selectedIndex]?.text || 'Receita:';
        const info = medInfo.value;

        if (info) {
            // Convert line breaks to <br> tags and preserve whitespace
            const formattedInfo = info.split('\n').map(line =>
                `<span style="white-space: pre-wrap">${line}</span>`
            ).join('<br>');

            if (medSelect.options[medSelect.selectedIndex]?.value === 'custom') {
                medicationsPreview.innerHTML += `
                    <p></p>
                    <div class="medication-info-preview">${formattedInfo}</div>
                    <br>
                `;
            } else {
                medicationsPreview.innerHTML += `
                    <p>${index + 1}. ${medName}</p>
                    <div class="medication-info-preview">${formattedInfo}</div>
                    <br>
                `;
            }
        }
    });
}

// Initial preview update
document.addEventListener('DOMContentLoaded', updatePreview);


function renderPdf(divName) {
    const form = document.getElementById('prescriptionForm');
    function validateForm() {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        let isHormonal = false;

        inputs.forEach(input => {
            if (input.id === 'prescription-type' && input.value === 'hormonal') {
                isHormonal = true;
            }
        });

        inputs.forEach(input => {
            if (input.id === 'cid') {
                if (input.value.trim() === '' && isHormonal) {
                    isValid = false;
                }
            } else {
                if (input.value.trim() === '') {
                    isValid = false;
                }
            }
        });

        const medications = document.querySelectorAll('.medication-entry');
        if (medications.length === 0) isValid = false;

        return isValid;
    }

    if (validateForm()) {
        const printContents = document.getElementById(divName).innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = printContents;

        window.print();

        document.body.innerHTML = originalContents;


        document.body.appendChild(form);
        form.submit();
        form.reset();


    } else {
        alert('Por favor, preencha todos os campos antes de salvar a prescrição.');
    }
}
function save_pdf(printContents, patientSelect, currentDate) {

    fetch('/save_prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            patientId: patientSelect.value,
            currentDate: currentDate,
            printContents: printContents
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Reset form
                document.getElementById('prescriptionForm').reset();
                // Hide CID section again
                document.getElementById('cid_section').classList.add('hidden');
                document.getElementById('preview_cid').classList.add('hidden');
                // Clear medications list
                document.getElementById('medications_list').innerHTML = '';
                // Trigger download
                window.location = `/download_prescription/${data.prescription_id}`;
                // Force preview update
                updatePreview();
            }
        })
        .catch(error => console.error('Error:', error));
}


