// LeadBot - Chatbot flotante persistente
const API_BASE_URL = 'http://localhost:8001';

// Estado del LeadBot
let leadbotSessionId = localStorage.getItem('leadbot_session_id') || generateSessionId();
let leadbotUserId = localStorage.getItem('leadbot_user_id') || generateUserId();
let isLeadbotMinimized = localStorage.getItem('leadbot_minimized') === 'true';

function generateSessionId() {
    const id = 'sess_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('leadbot_session_id', id);
    return id;
}

function generateUserId() {
    const id = 'user_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('leadbot_user_id', id);
    return id;
}

// Toggle LeadBot
function toggleLeadbot() {
    const widget = document.getElementById('leadbot-widget');
    widget.classList.toggle('minimized');
    isLeadbotMinimized = widget.classList.contains('minimized');
    localStorage.setItem('leadbot_minimized', isLeadbotMinimized);
    
    const toggleBtn = document.querySelector('.leadbot-toggle');
    toggleBtn.textContent = isLeadbotMinimized ? '+' : '−';
}

// Enviar mensaje al LeadBot
async function sendLeadbotMessage() {
    const input = document.getElementById('leadbot-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Mostrar mensaje del usuario
    addMessageToLeadbot(message, 'user');
    input.value = '';
    
    try {
        const response = await fetch(`${API_BASE_URL}/chat/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                user_id: leadbotUserId,
                session_id: leadbotSessionId,
                locale: 'es'
            })
        });
        
        const data = await response.json();
        
        if (data.response) {
            addMessageToLeadbot(data.response, 'bot');
        } else {
            addMessageToLeadbot('Lo siento, hubo un error. Inténtalo de nuevo.', 'bot');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessageToLeadbot('Lo siento, no puedo conectar con el servidor en este momento.', 'bot');
    }
}

// Agregar mensaje al chat
function addMessageToLeadbot(text, sender) {
    const messagesContainer = document.getElementById('leadbot-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const time = new Date().toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        <div class="message-content">${escapeHtml(text)}</div>
        <div class="message-time">${time}</div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Escape HTML para seguridad
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Manejar tecla Enter
function handleLeadbotKeypress(event) {
    if (event.key === 'Enter') {
        sendLeadbotMessage();
    }
}

// Inicializar LeadBot
function initLeadbot() {
    // Restaurar estado minimizado
    if (isLeadbotMinimized) {
        document.getElementById('leadbot-widget').classList.add('minimized');
        document.querySelector('.leadbot-toggle').textContent = '+';
    }
    
    // Mensaje de bienvenida personalizado si es nueva sesión
    if (!localStorage.getItem('leadbot_welcomed')) {
        setTimeout(() => {
            addMessageToLeadbot('¡Bienvenido a LeadGenPro! 🚀 Soy LeadBot, tu asistente virtual. Puedo ayudarte a entender cómo capturar más leads con IA. ¿Tienes alguna pregunta?', 'bot');
            localStorage.setItem('leadbot_welcomed', 'true');
        }, 1000);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initLeadbot);
