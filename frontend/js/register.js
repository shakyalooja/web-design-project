document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    fetch('../backend/auth/register.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email: email, password: password })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Registered successfully!");
            window.location.href = "login.html";
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Something went wrong:", error));
});