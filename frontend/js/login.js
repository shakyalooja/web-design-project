if (new URLSearchParams(window.location.search).get('registered')) {
    showMessage('Account created. Please log in.');
}

document.getElementById('loginForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;

    postJson('../backend/auth/login.php', {
        email: form.email.value,
        password: form.password.value
    })
        .then(data => {
            if (data.success) {
                window.location.href = 'dashboard.html';
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(() => showMessage('Something went wrong. Please try again.', true));
});
