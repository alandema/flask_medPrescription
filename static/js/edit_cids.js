document.addEventListener('DOMContentLoaded', function () {
    const cidSelect = document.getElementById('cid-select');
    const cidForm = document.getElementById('cidForm');
    const cidIdInput = document.getElementById('cid_id');
    const codeInput = document.getElementById('code');
    const descriptionInput = document.getElementById('description');

    cidSelect.addEventListener('change', function () {
        const selectedCidId = this.value;
        if (selectedCidId === 'new_cid') {
            cidForm.reset();
            cidIdInput.value = '';
            document.getElementById('deleteButton').hidden = true;
        } else {
            // Fetch CID data and populate form
            fetch(`/get_cid/${selectedCidId}`)
                .then(response => response.json())
                .then(data => {
                    cidIdInput.value = data.id;
                    codeInput.value = data.code;
                    descriptionInput.value = data.description;
                })
            document.getElementById('deleteButton').hidden = false;
        }

    });
});
