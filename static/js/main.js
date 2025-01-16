function generateResponse() {
    const prompt = document.getElementById('prompt').value;
    
    fetch('/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: prompt })
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById('response').textContent = data.response;
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('response').textContent = 'Error generating response';
    });
}