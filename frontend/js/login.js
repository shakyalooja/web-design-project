document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const email = document.querySelector('input[name="email"]').value;
    const password = document.querySelector('input[name="password"]').value;

    fetch('../backend/auth/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.success) {
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => {
        console.error("Something went wrong:", error);
    });
});