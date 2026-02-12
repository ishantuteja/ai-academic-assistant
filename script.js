document.addEventListener('DOMContentLoaded', () => {
    const fileUpload = document.getElementById('file-upload');
    const fileList = document.getElementById('file-list');
    const chatArea = document.getElementById('chat-area');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');

    // File Upload Handler
    fileUpload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            addFileToSidebar(file.name);
            // In a real app, we would upload the file to a server here
            simulateFileUpload(file.name);
        }
    });

    function addFileToSidebar(filename) {
        // Remove placeholder if it exists
        const placeholder = fileList.querySelector('.placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        const li = document.createElement('li');
        li.className = 'file-item';

        // PDF Icon SVG
        const icon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px; color: #e11d48;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`;

        li.innerHTML = `${icon} <span>${filename}</span>`;
        fileList.appendChild(li);
    }

    function simulateFileUpload(filename) {
        // Mock system message about upload
        // Can be added if needed, but sidebar update is usually enough
    }

    // Chat Logic
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender === 'user' ? 'user-message' : 'ai-message'}`;

        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        avatarDiv.textContent = sender === 'user' ? 'ME' : 'AI';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = text;

        messageDiv.appendChild(avatarDiv);
        messageDiv.appendChild(contentDiv);

        chatArea.appendChild(messageDiv);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function handleUserMessage() {
        const text = userInput.value.trim();
        if (!text) return;

        // Add user message
        addMessage(text, 'user');
        userInput.value = '';

        // Simulate AI thinking and response

        // Show typing indicator (optional, but good for UX) -> skipping for simple prototype

        setTimeout(() => {
            const aiResponse = "This is a prototype response generated using LLM + RAG architecture. In the full version, I would analyze your uploaded documents to answer: \"" + text + "\"";
            addMessage(aiResponse, 'ai');
        }, 1000); // 1 second delay
    }

    sendBtn.addEventListener('click', handleUserMessage);

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleUserMessage();
        }
    });
});
