const API_URL = "https://codequantum.tech/api";

// --- OAUTH2 TOKEN CATCHER ---
// If we just got redirected back from Google, grab the token and log in!
const urlParams = new URLSearchParams(window.location.search);
const auth_token = urlParams.get('token');
const user_avatar = urlParams.get('avatar')

if (auth_token) {
    localStorage.setItem('token', auth_token);
    localStorage.setItem('userName', urlParams.get('name'));
    localStorage.setItem('userEmail', urlParams.get('email'));
    localStorage.setItem('userAvatar', user_avatar);
    // Clean the URL so the token doesn't sit up there, then go to chat
    window.history.replaceState({}, document.title, "/");
    window.location.href = 'chat.html';
}


let isResetStepTwo = false;

function showMessage(id, text, isError) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = 'status-message ' + (isError ? 'error-text' : 'success-text');
}

function switchTab(tabName) {
    isResetStepTwo = false;
    document.getElementById('authTabs').style.display = 'flex';
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active-form'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    if (tabName === 'login') {
        document.getElementById('loginForm').classList.add('active-form');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else {
        document.getElementById('signupForm').classList.add('active-form');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    }
}

function showForgotPassword() {
    document.getElementById('authTabs').style.display = 'none';
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active-form'));
    document.getElementById('resetForm').classList.add('active-form');
    isResetStepTwo = false;
    document.getElementById('resetOtpFields').style.display = 'none';
    document.getElementById('resetSubmitBtn').textContent = "Send Reset Code";
}

// --- SIGNUP LOGIC (STEP 1) ---
document.getElementById('signupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('signupConfirmPassword').value;

    // Frontend validation before hitting the server
    if (password !== confirmPassword) {
        return showMessage('signupMessage', "Passwords do not match!", true);
    }

    const btn = e.target.querySelector('button');
    btn.textContent = "Processing...";

    try {
        const res = await fetch(`${API_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email, 
                password: password, 
                confirm_password: confirmPassword 
            })
        });
        
        if (res.ok) {
            // Move to Step 2
            document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active-form'));
            document.getElementById('otpForm').classList.add('active-form');
        } else { 
            const error = await res.json();
            showMessage('signupMessage', error.detail || "Signup failed", true); 
        }
    } catch (e) { 
        showMessage('signupMessage', "Connection Error", true); 
    } finally {
        btn.textContent = "Next: Verification";
    }
});

// --- OTP VERIFY LOGIC (STEP 2) ---
document.getElementById('otpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value; // Grabbed from Step 1
    const otp = document.getElementById('otpCode').value;
    const name = document.getElementById('otpName').value; // NEW: Grabbing the name

    const btn = e.target.querySelector('button');
    btn.textContent = "Verifying...";

    try {
        const res = await fetch(`${API_URL}/verify-otp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: email, 
                otp: otp, 
                name: name 
            })
        });
        
        if (res.ok) { 
            switchTab('login'); 
            // Auto-fill the login email for convenience
            document.getElementById('loginEmail').value = email;
            showMessage('loginMessage', "Account created! Please log in.", false); 
        } else { 
            const error = await res.json();
            showMessage('otpMessage', error.detail || "Invalid OTP", true); 
        }
    } catch (e) { 
        showMessage('otpMessage', "Error connecting to server", true); 
    } finally {
        btn.textContent = "Complete Setup";
    }
});

// --- SECURE LOGIN LOGIC ---
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const btn = e.target.querySelector('button');
    btn.textContent = "Authenticating...";

    try {
        // MUST use URLSearchParams for OAuth2 Form Data
        const params = new URLSearchParams();
        params.append('username', email); // Map email to OAuth 'username'
        params.append('password', password);

        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });
        
        if (res.ok) { 
            const data = await res.json();
            
            // 🔒 THE VAULT: Save the JWT token and user info to the browser!
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userEmail', data.email);
            
            window.location.href = '/chat.html'; 
        } else { 
            const error = await res.json();
            showMessage('loginMessage', error.detail || "Incorrect credentials", true); 
        }
    } catch (e) { 
        showMessage('loginMessage', "Connection Error", true); 
    } finally {
        btn.textContent = "Log In";
    }
});

// --- RESET PASSWORD LOGIC ---
document.getElementById('resetForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('resetEmail').value;
    const btn = document.getElementById('resetSubmitBtn');
    const otpFields = document.getElementById('resetOtpFields');

    if (!isResetStepTwo) {
        btn.textContent = "Processing...";
        try {
            const res = await fetch(`${API_URL}/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            if (res.ok) {
                otpFields.style.display = 'flex';
                btn.textContent = "Update Password";
                isResetStepTwo = true;
                showMessage('resetMessage', "OTP Sent! Check your email.", false);
            } else {
                showMessage('resetMessage', "User not found", true);
            }
        } catch (e) { showMessage('resetMessage', "Server Error", true); }
        finally { if(!isResetStepTwo) btn.textContent = "Send Reset Code"; }
    } else {
        const otp = document.getElementById('resetOtp').value;
        const new_password = document.getElementById('resetNewPassword').value;
        try {
            const res = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, new_password })
            });
            if (res.ok) {
                showMessage('resetMessage', "Password Updated! Redirecting...", false);
                setTimeout(() => switchTab('login'), 2000);
            } else { showMessage('resetMessage', "Invalid OTP", true); }
        } catch (e) { showMessage('resetMessage', "Error", true); }
    }
});