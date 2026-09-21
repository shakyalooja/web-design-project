document.getElementById('registerForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;

    if (form.password.value !== form.confirm_password.value) {
        showMessage('Passwords do not match.', true);
        form.confirm_password.focus();
        return;
    }

    postJson('../backend/auth/register.php', {
        full_name: form.full_name.value,
        email: form.email.value,
        password: form.password.value
    })
        .then(data => {
            if (data.success) {
                window.location.href = 'login.html?registered=1';
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(() => showMessage('Something went wrong. Please try again.', true));
});
