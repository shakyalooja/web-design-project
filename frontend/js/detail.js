const tripId = new URLSearchParams(window.location.search).get('trip_id');
let currentTrip = null;

const messageEl = document.getElementById('message');

function showMessage(text, isError = false) {
    messageEl.textContent = text;
    messageEl.className = isError ? 'msg-error' : 'msg-ok';
}

if (!tripId) {
    window.location.href = 'dashboard.html';
}

function formatDates(start, end) {
    if (!start && !end) return 'No dates set';
    return `${start || '?'} to ${end || '?'}`;
}

function loadTripInfo() {
    fetch(`../backend/trips/get_trip.php?trip_id=${encodeURIComponent(tripId)}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                showMessage(data.error, true);
                return;
            }
            currentTrip = data.trip;
            document.title = `${data.trip.trip_name} - TripPlanner`;
            document.getElementById('tripNameHeading').textContent = data.trip.trip_name;
            document.getElementById('tripDates').textContent = formatDates(data.trip.start_date, data.trip.end_date);
            document.getElementById('totalCost').textContent = `$${Number(data.trip.total_cost).toFixed(2)}`;
        })
        .catch(error => console.error('Something went wrong:', error));
}

document.getElementById('editTripBtn').addEventListener('click', () => {
    if (!currentTrip) return;
    const name = prompt('Trip name:', currentTrip.trip_name);
    if (name === null) return;
    const start = prompt('Start date (YYYY-MM-DD, or empty):', currentTrip.start_date ?? '');
    if (start === null) return;
    const end = prompt('End date (YYYY-MM-DD, or empty):', currentTrip.end_date ?? '');
    if (end === null) return;

    postJson('../backend/trips/update_trip.php', {
        trip_id: tripId, trip_name: name, start_date: start, end_date: end
    })
        .then(data => {
            if (data.success) {
                showMessage('Trip updated.');
                loadTripInfo();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
});

document.getElementById('deleteTripBtn').addEventListener('click', () => {
    if (!confirm('Delete this trip and everything in it?')) return;
    postJson('../backend/trips/delete_trip.php', { trip_id: tripId })
        .then(data => {
            if (data.success) {
                window.location.href = 'dashboard.html';
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
});

document.getElementById('shareTripBtn').addEventListener('click', () => {
    postJson('../backend/trips/toggle_share.php', { trip_id: tripId })
        .then(data => {
            if (!data.success) {
                showMessage(data.error, true);
                return;
            }
            if (data.is_shared) {
                const shareUrl = new URL(`shared-trip.html?trip_id=${tripId}`, window.location.href).href;
                prompt('Trip is now shared! Copy this link:', shareUrl);
            } else {
                showMessage('Trip is no longer shared.');
            }
        })
        .catch(error => console.error('Something went wrong:', error));
});

document.getElementById('destinationForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;

    postJson('../backend/destinations/create_destination.php', {
        trip_id: tripId,
        location_name: form.location_name.value,
        arrival_date: form.arrival_date.value,
        departure_date: form.departure_date.value,
        notes: form.notes.value
    })
        .then(data => {
            if (data.success) {
                showMessage('Destination added.');
                form.reset();
                loadDestinations();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
});

function loadDestinations() {
    const selected = document.getElementById('activityDestination').value;

    fetch(`../backend/destinations/get_destinations.php?trip_id=${encodeURIComponent(tripId)}`)
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById('destinationList');
            const dropdown = document.getElementById('activityDestination');
            list.innerHTML = '';
            dropdown.innerHTML = '';

            if (!data.success) {
                showMessage(data.error, true);
                return;
            }

            if (data.destinations.length === 0) {
                list.innerHTML = '<p>No destinations yet. Add one below.</p>';
                dropdown.innerHTML = '<option value="">Add a destination first</option>';
                loadActivities();
                return;
            }

            data.destinations.forEach(dest => {
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                    <h4>${esc(dest.location_name)}</h4>
                    <p>${esc(formatDates(dest.arrival_date, dest.departure_date))}</p>
                    <p>${esc(dest.notes)}</p>
                    <button class="btn-secondary" data-action="edit">Edit</button>
                    <button class="btn-danger" data-action="delete">Delete</button>
                `;
                div.querySelector('[data-action="edit"]').addEventListener('click', () => editDestination(dest));
                div.querySelector('[data-action="delete"]').addEventListener('click', () => deleteDestination(dest.destination_id));
                list.appendChild(div);

                const option = document.createElement('option');
                option.value = dest.destination_id;
                option.textContent = dest.location_name;
                dropdown.appendChild(option);
            });

            if (selected && [...dropdown.options].some(o => o.value === selected)) {
                dropdown.value = selected;
            }
            loadActivities();
        })
        .catch(error => console.error('Something went wrong:', error));
}

function editDestination(dest) {
    const name = prompt('Location name:', dest.location_name);
    if (name === null) return;
    const arrival = prompt('Arrival date (YYYY-MM-DD, or empty):', dest.arrival_date ?? '');
    if (arrival === null) return;
    const departure = prompt('Departure date (YYYY-MM-DD, or empty):', dest.departure_date ?? '');
    if (departure === null) return;
    const notes = prompt('Notes:', dest.notes ?? '');
    if (notes === null) return;

    postJson('../backend/destinations/update_destination.php', {
        destination_id: dest.destination_id,
        location_name: name,
        arrival_date: arrival,
        departure_date: departure,
        notes: notes
    })
        .then(data => {
            if (data.success) {
                loadDestinations();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
}

function deleteDestination(destId) {
    if (!confirm('Delete this destination and its activities?')) return;
    postJson('../backend/destinations/delete_destination.php', { destination_id: destId })
        .then(data => {
            if (data.success) {
                loadDestinations();
                loadTripInfo();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
}

document.getElementById('activityForm').addEventListener('submit', event => {
    event.preventDefault();
    const form = event.target;

    if (!form.destination_id.value) {
        showMessage('Please add a destination first.', true);
        return;
    }

    postJson('../backend/activities/create_activity.php', {
        destination_id: form.destination_id.value,
        activity_name: form.activity_name.value,
        category: form.category.value,
        estimated_cost: form.estimated_cost.value
    })
        .then(data => {
            if (data.success) {
                showMessage('Activity added.');
                form.activity_name.value = '';
                form.estimated_cost.value = '0';
                loadActivities();
                loadTripInfo();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
});

function loadActivities() {
    const destinationId = document.getElementById('activityDestination').value;
    const list = document.getElementById('activityList');

    if (!destinationId) {
        list.innerHTML = '<p>No destinations yet.</p>';
        return;
    }

    fetch(`../backend/activities/get_activities.php?destination_id=${encodeURIComponent(destinationId)}`)
        .then(response => response.json())
        .then(data => {
            list.innerHTML = '';
            if (!data.success) {
                showMessage(data.error, true);
                return;
            }
            if (data.activities.length === 0) {
                list.innerHTML = '<p>No activities yet for this destination.</p>';
                return;
            }

            data.activities.forEach(act => {
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                    <h4>${esc(act.activity_name)}</h4>
                    <p>Category: ${esc(act.category)}</p>
                    <p>Cost: $${Number(act.estimated_cost).toFixed(2)}</p>
                    <button class="btn-secondary" data-action="edit">Edit</button>
                    <button class="btn-danger" data-action="delete">Delete</button>
                `;
                div.querySelector('[data-action="edit"]').addEventListener('click', () => editActivity(act));
                div.querySelector('[data-action="delete"]').addEventListener('click', () => deleteActivity(act.activity_id));
                list.appendChild(div);
            });
        })
        .catch(error => console.error('Something went wrong:', error));
}

function editActivity(act) {
    const name = prompt('Activity name:', act.activity_name);
    if (name === null) return;
    const category = prompt('Category (transport/accommodation/food/sightseeing/other):', act.category ?? '');
    if (category === null) return;
    const cost = prompt('Estimated cost:', act.estimated_cost);
    if (cost === null) return;

    postJson('../backend/activities/update_activity.php', {
        activity_id: act.activity_id,
        activity_name: name,
        category: category,
        estimated_cost: cost
    })
        .then(data => {
            if (data.success) {
                loadActivities();
                loadTripInfo();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
}

function deleteActivity(activityId) {
    if (!confirm('Delete this activity?')) return;
    postJson('../backend/activities/delete_activity.php', { activity_id: activityId })
        .then(data => {
            if (data.success) {
                loadActivities();
                loadTripInfo();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(error => console.error('Something went wrong:', error));
}

document.getElementById('activityDestination').addEventListener('change', loadActivities);

loadTripInfo();
loadDestinations();
