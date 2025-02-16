document.getElementById('delete-medication').addEventListener('click', function () {
    if (confirm('Tem certeza que deseja excluir este medicamento?')) {
        var medicationId = document.getElementById('medication_id').value;
        fetch('/delete_medication/' + medicationId, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Medicamento excluído com sucesso');
                    window.location.reload();
                } else {
                    alert('Erro ao excluir medicamento');
                }
            });
    }
});