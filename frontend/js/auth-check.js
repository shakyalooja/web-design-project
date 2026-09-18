fetch('../backend/auth/check_session.php')
    .then(response => response.json())
    .then(data => {
        if (!data.logged_in) {
            window.location.href = "login.html";
        }
    })
    .catch(error => console.error("Something went wrong:", error));
    