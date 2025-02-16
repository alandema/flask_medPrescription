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
        } else {
            // Fetch medication data and populate form
            fetch(`/get_medication/${selectedmedicationId}`)
                .then(response => response.json())
                .then(data => {
                    medicationIdInput.value = data.id;
                    codeInput.value = data.name;
                    descriptionInput.value = data.information;
                })
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
