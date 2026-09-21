const messageEl = document.getElementById('message');

function showMessage(text, isError = false) {
    messageEl.textContent = text;
    messageEl.className = isError ? 'msg-error' : 'msg-ok';
}

document.getElementById('newTripBtn').addEventListener('click', () => {
    document.getElementById('tripName').focus();
    document.getElementById('tripForm').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('tripForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;

    postJson('../backend/trips/create_trip.php', {
        trip_name: form.trip_name.value,
        start_date: form.start_date.value,
        end_date: form.end_date.value
    })
        .then(data => {
            if (data.success) {
                showMessage('Trip saved.');
                form.reset();
                loadTrips();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
});

function loadTrips() {
    fetch('../backend/trips/get_trips.php')
        .then(response => response.json())
        .then(data => {
            const tripList = document.getElementById('tripList');
            tripList.innerHTML = '';

            if (!data.success) {
                showMessage(data.error, true);
                return;
            }
            if (data.trips.length === 0) {
                tripList.innerHTML = '<p>No trips yet. Add one below.</p>';
                return;
            }

            data.trips.forEach(trip => {
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                    <h3>${esc(trip.trip_name)}</h3>
                    <p>${esc(trip.start_date ?? '?')} to ${esc(trip.end_date ?? '?')}</p>
                    <a href="detail.html?trip_id=${encodeURIComponent(trip.trip_id)}" class="btn-link">View</a>
                    <button class="btn-secondary" data-action="edit">Edit</button>
                    <button class="btn-danger" data-action="delete">Delete</button>
                `;
                div.querySelector('[data-action="edit"]').addEventListener('click', () => editTrip(trip));
                div.querySelector('[data-action="delete"]').addEventListener('click', () => deleteTrip(trip.trip_id));
                tripList.appendChild(div);
            });
        })
        .catch(error => console.error('Something went wrong:', error));
}

function editTrip(trip) {
    const name = prompt('Trip name:', trip.trip_name);
    if (name === null) return;
    const start = prompt('Start date (YYYY-MM-DD, or empty):', trip.start_date ?? '');
    if (start === null) return;
    const end = prompt('End date (YYYY-MM-DD, or empty):', trip.end_date ?? '');
    if (end === null) return;

    postJson('../backend/trips/update_trip.php', {
        trip_id: trip.trip_id, trip_name: name, start_date: start, end_date: end
    })
        .then(data => {
            if (data.success) {
                loadTrips();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
}

function deleteTrip(tripId) {
    if (!confirm('Are you sure you want to delete this trip?')) return;
    postJson('../backend/trips/delete_trip.php', { trip_id: tripId })
        .then(data => {
            if (data.success) {
                loadTrips();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
}

loadTrips();
