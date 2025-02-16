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
