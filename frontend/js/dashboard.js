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
        end_date: form.end_date.value,
        budget: form.budget.value
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
        .catch(() => showMessage('Something went wrong. Please try again.', true));
});

function budgetLine(trip) {
    if (trip.budget === null) return `Estimated cost: ${money(trip.total_cost)}`;
    const diff = Number(trip.budget) - Number(trip.total_cost);
    if (diff < 0) {
        return `Estimated cost: ${money(trip.total_cost)} <strong class="over-budget">Over budget by ${money(-diff)}</strong>`;
    }
    return `Estimated cost: ${money(trip.total_cost)} of ${money(trip.budget)} budget`;
}

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
                const count = Number(trip.destination_count);
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                    <h3>${esc(trip.trip_name)} ${Number(trip.is_shared) ? '<span class="badge">Shared</span>' : ''}</h3>
                    <p>${esc(formatDates(trip.start_date, trip.end_date))} &middot; ${count} destination${count === 1 ? '' : 's'}</p>
                    <p>${budgetLine(trip)}</p>
                    <a href="detail.html?trip_id=${encodeURIComponent(trip.trip_id)}" class="btn-link">View</a>
                    <button class="btn-secondary" data-action="edit">Edit</button>
                    <button class="btn-danger" data-action="delete">Delete</button>
                `;
                div.querySelector('[data-action="edit"]').addEventListener('click', () => editTrip(trip));
                div.querySelector('[data-action="delete"]').addEventListener('click', () => deleteTrip(trip));
                tripList.appendChild(div);
            });
        })
        .catch(error => console.error('Something went wrong:', error));
}

function editTrip(trip) {
    openFormDialog({
        title: 'Edit trip',
        fields: [
            { name: 'trip_name', label: 'Trip name', value: trip.trip_name, required: true, maxlength: 150 },
            { name: 'start_date', label: 'Start date', type: 'date', value: trip.start_date ?? '' },
            { name: 'end_date', label: 'End date', type: 'date', value: trip.end_date ?? '' },
            { name: 'budget', label: 'Budget ($, optional)', type: 'number', value: trip.budget ?? '', min: 0, step: '0.01' }
        ],
        onSubmit: values => postJson('../backend/trips/update_trip.php', { trip_id: trip.trip_id, ...values })
            .then(data => {
                if (data.success) loadTrips();
                return data;
            })
    });
}

function deleteTrip(trip) {
    if (!confirm(`Delete "${trip.trip_name}" and everything in it?`)) return;
    postJson('../backend/trips/delete_trip.php', { trip_id: trip.trip_id })
        .then(data => {
            if (data.success) {
                showMessage('Trip deleted.');
                loadTrips();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(() => showMessage('Something went wrong. Please try again.', true));
}

loadTrips();
