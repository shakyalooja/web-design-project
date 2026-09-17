document.getElementById('tripForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const tripName = document.getElementById('tripName').value;

    alert("You typed: " + tripName);
});