// Validation.js
function setupFormValidation(formType) {
    const emailField = document.getElementById(`${formType}Email`);
    const passwordField = document.getElementById(`${formType}Password`);
    // More specific button selector
    const submitButton = document.querySelector(`.${formType === 'login' ? 'Footer' : 'Middle'} .GreenButton`);

    // Error elements
    const emailErrorElement = document.getElementById(`${formType}EmailError`);
    const passwordErrorElement = document.getElementById(`${formType}PasswordError`);
    const originalEmailError = emailErrorElement ? emailErrorElement.textContent : '';
    const originalPasswordError = passwordErrorElement ? passwordErrorElement.textContent : '';

    if (!emailField || !passwordField || !submitButton) {
        console.error('Form elements not found');
        return;
    }

    // Email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Event handlers for focus/blur
    emailField.addEventListener('focus', function () {
        this.parentElement.style.borderColor = '#ffffff';
    });

    passwordField.addEventListener('focus', function () {
        this.parentElement.style.borderColor = '#ffffff';
    });

    emailField.addEventListener('blur', function () {
        this.parentElement.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        validateEmail();
    });

    passwordField.addEventListener('blur', function () {
        this.parentElement.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        validatePassword();
    });

    function validateEmail() {
        const email = emailField.value;
        const isValid = emailRegex.test(email);
        const isEmpty = email.trim() === '';

        if (emailErrorElement) {
            emailErrorElement.textContent = originalEmailError;
        }

        if (isEmpty) {
            if (emailErrorElement) emailErrorElement.style.display = 'none';
            emailField.parentElement.classList.remove('FormError');
            return false;
        } else if (!isValid) {
            if (emailErrorElement) emailErrorElement.style.display = 'block';
            emailField.parentElement.classList.add('FormError');
            return false;
        } else {
            if (emailErrorElement) emailErrorElement.style.display = 'none';
            emailField.parentElement.classList.remove('FormError');
            return true;
        }
    }

    function validatePassword() {
        const password = passwordField.value;
        const isValid = password.length >= 8;
        const isEmpty = password.trim() === '';

        if (passwordErrorElement) {
            passwordErrorElement.textContent = originalPasswordError;
        }

        if (isEmpty) {
            if (passwordErrorElement) passwordErrorElement.style.display = 'none';
            passwordField.parentElement.classList.remove('FormError');
            return false;
        } else if (!isValid) {
            if (passwordErrorElement) passwordErrorElement.style.display = 'block';
            passwordField.parentElement.classList.add('FormError');
            return false;
        } else {
            if (passwordErrorElement) passwordErrorElement.style.display = 'none';
            passwordField.parentElement.classList.remove('FormError');
            return true;
        }
    }

    function validateForm(event) {
        if (event) event.preventDefault();

        const isEmailEmpty = emailField.value.trim() === '';
        const isPasswordEmpty = passwordField.value.trim() === '';

        if (isEmailEmpty && emailErrorElement) {
            emailErrorElement.textContent = 'Email is required';
            emailErrorElement.style.display = 'block';
            emailField.parentElement.classList.add('FormError');
        }

        if (isPasswordEmpty && passwordErrorElement) {
            passwordErrorElement.textContent = 'Password is required';
            passwordErrorElement.style.display = 'block';
            passwordField.parentElement.classList.add('FormError');
        }

        if (isEmailEmpty || isPasswordEmpty) {
            return false;
        }

        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();

        if (isEmailValid && isPasswordValid) {
            window.location.href = 'HomePage.html';
            return true; // Allow the redirect to happen
        }
        return false;
    }

    // Real-time validation
    emailField.addEventListener('input', function () {
        if (this.value.trim() !== '' && emailErrorElement) {
            emailErrorElement.textContent = originalEmailError;
        }
        validateEmail();
    });

    passwordField.addEventListener('input', function () {
        if (this.value.trim() !== '' && passwordErrorElement) {
            passwordErrorElement.textContent = originalPasswordError;
        }
        validatePassword();
    });

    // Form submission
    submitButton.addEventListener('click', validateForm);
}

// Initialize based on which page we're on
document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('loginEmail')) {
        setupFormValidation('login');
    } else if (document.getElementById('signupEmail')) {
        setupFormValidation('signup');
    }
});