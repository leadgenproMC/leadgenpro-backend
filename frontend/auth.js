// LeadGenPro - Autenticación
const API_URL = 'http://localhost:8001';

// Cambiar entre tabs
function switchTab(tab) {
    // Actualizar botones
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Mostrar formulario correspondiente
    document.querySelectorAll('.form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(tab + '-form').classList.add('active');
    
    // Limpiar mensajes
    hideMessage();
}

// Mostrar mensaje
function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
}

function hideMessage() {
    const messageEl = document.getElementById('message');
    messageEl.className = 'message';
    messageEl.textContent = '';
}

// Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberSession = document.getElementById('remember-session').checked;
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar token
            if (rememberSession) {
                localStorage.setItem('leadgenpro_token', data.token);
                localStorage.setItem('leadgenpro_user', JSON.stringify(data.user));
            } else {
                sessionStorage.setItem('leadgenpro_token', data.token);
                sessionStorage.setItem('leadgenpro_user', JSON.stringify(data.user));
            }
            
            showMessage(`¡Bienvenido ${data.user.name}! Redirigiendo...`, 'success');
            
            // Redirigir al dashboard después de 1 segundo
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage(data.error || 'Error al iniciar sesión', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión con el servidor', 'error');
    }
});

// Registro
document.getElementById('register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const company = document.getElementById('register-company').value;
    const agreedToTerms = document.getElementById('agreed-to-terms').checked;
    const rememberSession = document.getElementById('remember-session-register').checked;
    
    // Validar checkbox de condiciones (doble validación)
    if (!agreedToTerms) {
        showMessage('Debes aceptar las Condiciones de Uso para crear la cuenta', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                name,
                company,
                agreed_to_terms: agreedToTerms
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Guardar token si se creó sesión
            if (data.token) {
                if (rememberSession) {
                    localStorage.setItem('leadgenpro_token', data.token);
                    localStorage.setItem('leadgenpro_user', JSON.stringify(data.user));
                } else {
                    sessionStorage.setItem('leadgenpro_token', data.token);
                    sessionStorage.setItem('leadgenpro_user', JSON.stringify(data.user));
                }
            }
            
            showMessage(`¡Cuenta creada exitosamente! Bienvenido ${data.user?.name || name}`, 'success');
            
            // Redirigir al dashboard después de 1.5 segundos
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        } else {
            showMessage(data.error || 'Error al crear la cuenta', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Error de conexión con el servidor', 'error');
    }
});

// Verificar si ya hay sesión iniciada
function checkExistingSession() {
    const token = localStorage.getItem('leadgenpro_token') || sessionStorage.getItem('leadgenpro_token');
    if (token && window.location.pathname.includes('index.html')) {
        // Redirigir al dashboard si ya está logueado
        window.location.href = 'dashboard.html';
    }
}

// Logout
function logout() {
    localStorage.removeItem('leadgenpro_token');
    localStorage.removeItem('leadgenpro_user');
    localStorage.removeItem('leadgenpro_session');
    sessionStorage.removeItem('leadgenpro_token');
    sessionStorage.removeItem('leadgenpro_user');
    window.location.href = 'index.html';
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    checkExistingSession();
});
