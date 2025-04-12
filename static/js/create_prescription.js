function deleteObject(select) {
    let objectId = select.value;
    let objectName = select.options[select.selectedIndex].text;

    let data = {
        id: objectId,
        name: objectName
    };

    fetch('/delete_object', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            select.remove(objectId);
        })
        .catch(error => console.log(error));
}

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
        // Use dataset to access the data-med-information attribute
        infoInput.value = select.options[select.selectedIndex].dataset.medInformation;
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

function printDiv(divName) {

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

        return isValid;
    }

    if (!validateForm()) {
        alert('Por favor, preencha todos os campos antes de salvar a prescrição.');
        return false;
    }

    // Get print contents before modifying DOM
    const printContents = document.getElementById(divName).innerHTML;
    const originalContents = document.body.innerHTML;

    // Get patient data for saving
    const patientSelect = document.getElementById('patient');
    const cidSelect = document.getElementById('cid');
    const currentDate = new Date().toLocaleDateString('pt-BR');



    // Set default filename for PDF print
    window.addEventListener('beforeprint', function () {
        const patientName = patientSelect.options[patientSelect.selectedIndex].text;
        const filename = `${patientName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[\/\s]/g, '_')}_${currentDate.replace(/\//g, '_')}`;
        document.title = filename;
    });

    const cidId = cidSelect.options[cidSelect.selectedIndex].value;
    const medicationEntries = document.querySelectorAll('.medication-entry');
    const medications = Array.from(medicationEntries).map(entry => {
        const select = entry.querySelector('.medication-select');
        return {
            medicationId: select.value,
            medicationName: select.options[select.selectedIndex].text,
            medicationInfo: select.options[select.selectedIndex].dataset.medInformation
        };
    });

    const prescriptionData = {
        patientId: patientSelect.value,
        currentDate: currentDate,
        cidId: cidId,
        medications: medications
    };

    // First print
    document.body.innerHTML = printContents;
    window.print();

    // Restore original content
    document.body.innerHTML = originalContents;

    try {
        fetch('/save_prescription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prescriptionData)
        })
            .then(response => response.json())
    } catch (error) {
        console.error(error);
        // Expected output: ReferenceError: nonExistentFunction is not defined
        // (Note: the exact output may be browser-dependent)
    }

    document.getElementById("prescriptionForm").reset();

    // Reload the page
    window.location.reload();
    return true; // Prevent form submission
}

function loadSavedPrescription(data) {
    // Set patient
    document.getElementById('patient').value = data.patientId;
    
    // Set prescription type and show/hide CID section
    if (data.cidId) {
        document.getElementById('prescription-type').value = 'hormonal';
        document.getElementById('cid').value = data.cidId;
        document.getElementById('cid_section').classList.remove('hidden');
        document.getElementById('preview_cid').classList.remove('hidden');
    } else {
        document.getElementById('prescription-type').value = 'non_hormonal';
        document.getElementById('cid_section').classList.add('hidden');
        document.getElementById('preview_cid').classList.add('hidden');
    }
    

    // Add medication entries from saved data
    if (data.medications && data.medications.length > 0) {
        data.medications.forEach(med => {
            addMedication();
            const entries = document.querySelectorAll('.medication-entry');
            const lastEntry = entries[entries.length - 1];
            
            const select = lastEntry.querySelector('.medication-select');
            const infoInput = lastEntry.querySelector('.medication-info');
            
            select.value = med.medicationId;
            infoInput.value = med.medicationInfo || '';
        });
    } else {
        // Add at least one empty medication entry
        addMedication();
    }
    
    // Update preview
    updatePreview();
}