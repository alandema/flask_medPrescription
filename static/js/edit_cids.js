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

    const deleteButton = document.getElementById('deleteButton');
    deleteButton.addEventListener('click', function () {
        const cidSelect = document.getElementById('cid-select');
        if (confirm('Are you sure you want to delete this CID?')) {
            deleteObject(cidSelect);
        }
    });
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
            document.getElementById('cidForm').reset();
            document.getElementById('cid_id').value = '';
            // Hide the delete button
            document.getElementById('deleteButton').hidden = true;
            // Select the "new cid" option
            select.value = 'new_cid';
        })
        .catch(error => console.log(error));
}