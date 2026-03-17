// FounderDash - Advanced Infrastructure
// Lead Software Engineer @ Bottle Code Agency

const GOOGLE_CLIENT_ID = '387613368123-60jmf18v6m894q3srsevo2f6ssu4mo19.apps.googleusercontent.com';
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycby0R25x7dwtNM53xaLIRxaKJlys9uoU6Amllma2u1-e3b8vNsYGs1iAaBItywVpiHch_Q/exec';

let userToken = null;
let salesChart = null;

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    setupDeviceDetection();
    setupAuthListeners();
    setupForm();
    checkExistingSession();
    registerServiceWorker();
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js').then(reg => {
                console.log('SW Registered at root scope');
            }).catch(err => {
                console.log('SW Registration failed', err);
            });
        });
    }
}

// --- Auth System ---
window.handleCredentialResponse = (response) => {
    const payload = parseJwt(response.credential);
    console.log('Login exitoso:', payload.name);
    
    // Request additional scope for Sheets
    requestSheetsPermission();
    
    updateUserUI(payload);
    transitionToDashboard();
};

function requestSheetsPermission() {
    const client = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        callback: (response) => {
            if (response.access_token) {
                userToken = response.access_token;
                localStorage.setItem('fd_access_token', userToken);
                showSnackbar('Permisos de Google Sheets activos');
            }
        },
    });
    client.requestAccessToken();
}

function updateUserUI(payload) {
    const avatar = document.getElementById('user-avatar');
    const profile = document.getElementById('user-profile');
    if (avatar && profile) {
        avatar.src = payload.picture;
        profile.classList.remove('hidden');
    }
    document.getElementById('welcome-msg').innerText = `Bienvenido, ${payload.given_name}`;
    localStorage.setItem('fd_user_name', payload.given_name);
}

function transitionToDashboard() {
    document.getElementById('landing-view').classList.remove('active');
    setTimeout(() => {
        document.getElementById('landing-view').style.display = 'none';
        const dash = document.getElementById('dashboard-view');
        dash.style.display = 'block';
        setTimeout(() => dash.classList.add('active'), 50);
        renderDashboard();
    }, 400);
}

function checkExistingSession() {
    const name = localStorage.getItem('fd_user_name');
    const token = localStorage.getItem('fd_access_token');
    if (name && token) {
        userToken = token;
        document.getElementById('welcome-msg').innerText = `Bienvenido, ${name}`;
        // Auto transition if already logged in (simple check)
        // transitionToDashboard();
    }
}

// --- Data Motor ---
async function enviarVenta(data) {
    const submitBtn = document.getElementById('submit-sale');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Sincronizando...';

    try {
        const response = await fetch(APPS_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors', // Standard for simple Apps Script redirects
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...data,
                timestamp: new Date().toISOString(),
                token: userToken // Sent to script for validation if needed
            })
        });

        // Since mode is no-cors, we don't get a proper response body, 
        // but we assume success if no error is thrown.
        showSnackbar('Venta registrada en la nube');
        document.getElementById('sale-form').reset();
        refreshChart(data);
    } catch (error) {
        console.error('Error al enviar venta:', error);
        showSnackbar('Error de conexión');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span>Enviar a Google Sheets</span><span class="material-symbols-rounded">send</span>';
    }
}

function setupForm() {
    const form = document.getElementById('sale-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {
                concepto: document.getElementById('concepto').value,
                monto: parseFloat(document.getElementById('monto').value),
                categoria: document.getElementById('categoria').value,
                negocioId: document.getElementById('negocio-id').value
            };
            enviarVenta(data);
        });
    }
}

// --- UI Components ---
function showSnackbar(message) {
    const sb = document.getElementById('snackbar');
    sb.innerText = message;
    sb.className = 'snackbar show';
    setTimeout(() => { sb.className = sb.className.replace('show', ''); }, 3000);
}

function renderDashboard() {
    initChart();
}

function initChart() {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    // Mock data for initialization (Last 10 rows simulation)
    const labels = ['Registro 1', 'Registro 2', 'Registro 3', 'Registro 4', 'Registro 5'];
    const dataPoints = [150, 230, 180, 400, 320];

    if (salesChart) salesChart.destroy();

    salesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Ventas ($)',
                data: dataPoints,
                borderColor: '#6750A4',
                backgroundColor: 'rgba(103, 80, 164, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointBackgroundColor: '#6750A4'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { grid: { color: '#F3EDF7' } },
                x: { grid: { display: false } }
            }
        }
    });
}

function refreshChart(newData) {
    if (salesChart) {
        salesChart.data.labels.push(`Nueva: ${newData.concepto}`);
        salesChart.data.datasets[0].data.push(newData.monto);
        if (salesChart.data.labels.length > 10) {
            salesChart.data.labels.shift();
            salesChart.data.datasets[0].data.shift();
        }
        salesChart.update();
    }
}

// --- Utilities ---
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function setupDeviceDetection() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 800;
    if (isMobile) {
        document.getElementById('mobile-install-section').classList.remove('hidden');
    } else {
        document.getElementById('desktop-pro-section').classList.remove('hidden');
    }
}

function setupAuthListeners() {
    const logout = (e) => {
        e.preventDefault();
        localStorage.clear();
        location.reload();
    };
    document.getElementById('logout-btn').addEventListener('click', logout);
    document.getElementById('mobile-logout-btn').addEventListener('click', logout);
}
