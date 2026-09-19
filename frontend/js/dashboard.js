document.getElementById('logoutBtn').addEventListener('click', function() {
    fetch('../backend/auth/logout.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                window.location.href = "login.html";
            }
        })
        .catch(error => console.error("Something went wrong:", error));
});

document.getElementById('tripForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const tripName = document.getElementById('tripName').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;

    fetch('../backend/trips/create_trip.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_name: tripName, start_date: startDate, end_date: endDate })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Trip saved!");
            document.getElementById('tripForm').reset();
            loadTrips();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Something went wrong:", error));
});

function loadTrips() {
    fetch('../backend/trips/get_trips.php')
        .then(response => response.json())
        .then(data => {
            const tripList = document.getElementById('tripList');
            tripList.innerHTML = '';

            if (data.trips.length === 0) {
                tripList.innerHTML = '<p>No trips yet. Add one above.</p>';
                return;
            }

            data.trips.forEach(trip => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <hr>
                    <h3>${trip.trip_name}</h3>
                    <p>${trip.start_date ?? ''} to ${trip.end_date ?? ''}</p>
                    <a href="detail.html?trip_id=${trip.trip_id}"><button type="button">View</button></a>
                    <button onclick="editTrip(${trip.trip_id}, '${trip.trip_name}', '${trip.start_date ?? ''}', '${trip.end_date ?? ''}')">Edit</button>
                    <button onclick="deleteTrip(${trip.trip_id})">Delete</button>
                `;
                tripList.appendChild(div);
            });
        })
        .catch(error => console.error("Something went wrong:", error));
}

function editTrip(tripId, currentName, currentStart, currentEnd) {
    const newName = prompt("Trip name:", currentName);
    if (newName === null) return; // user clicked Cancel

    const newStart = prompt("Start date (YYYY-MM-DD):", currentStart);
    const newEnd = prompt("End date (YYYY-MM-DD):", currentEnd);

    fetch('../backend/trips/update_trip.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_id: tripId, trip_name: newName, start_date: newStart, end_date: newEnd })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTrips();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Something went wrong:", error));
}

function deleteTrip(tripId) {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    fetch('../backend/trips/delete_trip.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_id: tripId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadTrips();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Something went wrong:", error));
}

loadTrips();