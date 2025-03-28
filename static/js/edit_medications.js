document.addEventListener('DOMContentLoaded', function () {
    const medicationSelect = document.getElementById('medication-select');
    const medicationForm = document.getElementById('medicationForm');
    const medicationIdInput = document.getElementById('medication_id');
    const codeInput = document.getElementById('name');
    const descriptionInput = document.getElementById('information');

    medicationSelect.addEventListener('change', function () {
        const selectedmedicationId = this.value;
        if (selectedmedicationId === 'new_medication') {
            medicationForm.reset();
            medicationIdInput.value = '';
            document.getElementById('deleteButton').hidden = true;

        } else {

            // Fetch medication data and populate form
            fetch(`/get_medication/${selectedmedicationId}`)
                .then(response => response.json())
                .then(data => {
                    medicationIdInput.value = data.id;
                    codeInput.value = data.name;
                    descriptionInput.value = data.information;
                })
            document.getElementById('deleteButton').hidden = false;
        }

    });


    informationTextarea.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();

            // Insert a newline character at the cursor position
            const start = this.selectionStart;
            const end = this.selectionEnd;
            const value = this.value;
            this.value = value.substring(0, start) + '\n' + value.substring(end);

            // Move the cursor to the next line
            this.selectionStart = this.selectionEnd = start + 1;
        }
    });

});

const deleteButton = document.getElementById('deleteButton');
deleteButton.addEventListener('click', function () {
    const medicationSelect = document.getElementById('medication-select');
    if (confirm('Are you sure you want to delete this medication?')) {
        deleteObject(medicationSelect);
    }
});

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
            // Remove the option from the select element
            select.remove(select.selectedIndex);
            // Reset the form
            document.getElementById('medicationForm').reset();
            document.getElementById('medication_id').value = '';
            // Hide the delete button
            document.getElementById('deleteButton').hidden = true;
            // Select the "new medication" option
            select.value = 'new_medication';
        })
        .catch(error => console.log(error));
}