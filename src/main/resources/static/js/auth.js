// Authentication functionality
class AuthService {
    constructor() {
        this.baseUrl = '';
        this.token = localStorage.getItem('jwt_token');
        this.currentUser = JSON.parse(localStorage.getItem('current_user') || 'null');
        this.init();
    }

    init() {
        // Check if user is already logged in and on login/register page
        if (this.isLoggedIn() && (window.location.pathname === '/login' || window.location.pathname === '/register')) {
            window.location.href = '/chat';
            return;
        }

        // Check if user is not logged in and on chat page
        if (!this.isLoggedIn() && window.location.pathname === '/chat') {
            window.location.href = '/login';
            return;
        }

        this.bindEvents();
    }

    bindEvents() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const loginData = {
            username: formData.get('username'),
            password: formData.get('password')
        };

        this.showLoading('login');
        this.hideMessage();

        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                // Store token and user data
                localStorage.setItem('jwt_token', data.accessToken);
                localStorage.setItem('current_user', JSON.stringify({
                    id: data.id,
                    username: data.username,
                    email: data.email,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    roles: data.roles
                }));

                this.showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect to chat page
                setTimeout(() => {
                    window.location.href = '/chat';
                }, 1000);
            } else {
                this.showMessage(data.message || 'Login failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading('login');
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        
        // Password confirmation check
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        if (password !== confirmPassword) {
            this.showMessage('Passwords do not match.', 'error');
            return;
        }

        const registerData = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: password,
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName')
        };

        this.showLoading('register');
        this.hideMessage();

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registerData)
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('Registration successful! Please login.', 'success');
                
                // Redirect to login page
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                this.showMessage(data.message || 'Registration failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage('Network error. Please try again.', 'error');
        } finally {
            this.hideLoading('register');
        }
    }

    async logout() {
        try {
            if (this.token) {
                await fetch('/api/auth/signout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('current_user');
            
            // Redirect to home page
            window.location.href = '/';
        }
    }

    isLoggedIn() {
        return this.token && this.currentUser;
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    getCurrentUser() {
        return this.currentUser;
    }

    showLoading(type) {
        const loadingEl = document.getElementById(`${type}-loading`);
        const textEl = document.getElementById(`${type}-text`);
        
        if (loadingEl && textEl) {
            loadingEl.classList.remove('hidden');
            textEl.classList.add('hidden');
        }
    }

    hideLoading(type) {
        const loadingEl = document.getElementById(`${type}-loading`);
        const textEl = document.getElementById(`${type}-text`);
        
        if (loadingEl && textEl) {
            loadingEl.classList.add('hidden');
            textEl.classList.remove('hidden');
        }
    }

    showMessage(message, type) {
        const errorEl = document.getElementById('error-message');
        const successEl = document.getElementById('success-message');
        
        // Hide both first
        if (errorEl) errorEl.classList.add('hidden');
        if (successEl) successEl.classList.add('hidden');
        
        // Show the appropriate one
        if (type === 'error' && errorEl) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
        } else if (type === 'success' && successEl) {
            successEl.textContent = message;
            successEl.classList.remove('hidden');
        }
    }

    hideMessage() {
        const errorEl = document.getElementById('error-message');
        const successEl = document.getElementById('success-message');
        
        if (errorEl) errorEl.classList.add('hidden');
        if (successEl) successEl.classList.add('hidden');
    }
}

// Initialize auth service
window.authService = new AuthService();
