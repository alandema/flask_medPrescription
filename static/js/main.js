async function sendMessage() {
    const input = document.getElementById('user-input');
    const message = input.value;
    if (!message) return;

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });
        
        const data = await response.json();
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML += `
            <div class="message user">${message}</div>
            <div class="message bot">${data.response}</div>
        `;
        
        input.value = '';
    } catch (error) {
        console.error('Error:', error);
    }
}