const tripId = new URLSearchParams(window.location.search).get('trip_id');
let currentTrip = null;

if (!tripId) {
    window.location.href = 'dashboard.html';
}

document.getElementById('category').innerHTML =
    CATEGORIES.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');

function renderTrip(trip) {
    document.title = `${trip.trip_name} - TripPlanner`;
    document.getElementById('tripNameHeading').textContent = trip.trip_name;
    document.getElementById('tripDates').textContent = formatDates(trip.start_date, trip.end_date);
    document.getElementById('totalCost').textContent = money(trip.total_cost);
    document.getElementById('shareTripBtn').textContent = Number(trip.is_shared) ? 'Shared - manage link' : 'Share Trip';
    renderBreakdown(document.getElementById('breakdownList'), trip.cost_by_category, trip.total_cost);

    const line = document.getElementById('budgetLine');
    if (trip.budget === null) {
        line.className = 'muted';
        line.textContent = 'No budget set. Use Edit Trip to add one.';
        return;
    }
    const diff = Number(trip.budget) - Number(trip.total_cost);
    if (diff < 0) {
        line.className = 'msg-error';
        line.textContent = `Over budget by ${money(-diff)} (budget ${money(trip.budget)}).`;
    } else {
        line.className = 'msg-ok';
        line.textContent = `Budget ${money(trip.budget)}: ${money(diff)} left.`;
    }
}

function loadTripInfo() {
    return fetch(`../backend/trips/get_trip.php?trip_id=${encodeURIComponent(tripId)}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                showMessage(data.error, true);
                return;
            }
            currentTrip = data.trip;
            renderTrip(currentTrip);
        })
        .catch(error => console.error('Something went wrong:', error));
}

document.getElementById('editTripBtn').addEventListener('click', () => {
    if (!currentTrip) return;
    openFormDialog({
        title: 'Edit trip',
        fields: [
            { name: 'trip_name', label: 'Trip name', value: currentTrip.trip_name, required: true, maxlength: 150 },
            { name: 'start_date', label: 'Start date', type: 'date', value: currentTrip.start_date ?? '' },
            { name: 'end_date', label: 'End date', type: 'date', value: currentTrip.end_date ?? '' },
            { name: 'budget', label: 'Budget ($, optional)', type: 'number', value: currentTrip.budget ?? '', min: 0, step: '0.01' }
        ],
        onSubmit: values => postJson('../backend/trips/update_trip.php', { trip_id: tripId, ...values })
            .then(data => {
                if (data.success) {
                    showMessage('Trip updated.');
                    loadTripInfo();
                }
                return data;
            })
    });
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
        .catch(() => showMessage('Something went wrong. Please try again.', true));
});

document.getElementById('shareTripBtn').addEventListener('click', () => {
    if (!currentTrip) return;
    const { dialog, body } = createDialog('Share this trip');

    function render() {
        if (Number(currentTrip.is_shared)) {
            const link = new URL(`shared-trip.html?code=${currentTrip.share_code}`, window.location.href).href;
            body.innerHTML = `
                <p>Anyone with this link can view this trip. They cannot change it.</p>
                <label for="shareLink">Share link</label>
                <input type="text" id="shareLink" readonly value="${esc(link)}">
                <p id="copyStatus" role="status" class="msg-ok"></p>
                <div class="modal-actions">
                    <button type="button" data-act="copy">Copy link</button>
                    <button type="button" class="btn-danger" data-act="toggle">Stop sharing</button>
                    <button type="button" class="btn-secondary" data-act="close">Close</button>
                </div>`;
        } else {
            body.innerHTML = `
                <p>This trip is private. Create a link to let other people view it.</p>
                <p id="copyStatus" role="status" class="msg-error"></p>
                <div class="modal-actions">
                    <button type="button" data-act="toggle">Create share link</button>
                    <button type="button" class="btn-secondary" data-act="close">Close</button>
                </div>`;
        }
        body.querySelector('[data-act]').focus();
    }

    function setStatus(text) {
        body.querySelector('#copyStatus').textContent = text;
    }

    body.addEventListener('click', event => {
        const act = event.target.dataset.act;
        if (act === 'close') {
            dialog.close();
        } else if (act === 'copy') {
            const input = body.querySelector('#shareLink');
            input.select();
            (navigator.clipboard ? navigator.clipboard.writeText(input.value) : Promise.reject())
                .then(() => setStatus('Link copied.'))
                .catch(() => setStatus('Press Ctrl+C to copy the selected link.'));
        } else if (act === 'toggle') {
            postJson('../backend/trips/toggle_share.php', { trip_id: tripId })
                .then(data => {
                    if (!data.success) {
                        setStatus(data.error);
                        return;
                    }
                    currentTrip.is_shared = data.is_shared;
                    currentTrip.share_code = data.share_code;
                    renderTrip(currentTrip);
                    render();
                })
                .catch(() => setStatus('Something went wrong. Please try again.'));
        }
    });

    render();
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
        .catch(() => showMessage('Something went wrong. Please try again.', true));
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
                    <h3>${esc(dest.location_name)}</h3>
                    <p>${esc(formatDates(dest.arrival_date, dest.departure_date))}</p>
                    <p>${esc(dest.notes)}</p>
                    <button class="btn-secondary" data-action="edit">Edit</button>
                    <button class="btn-danger" data-action="delete">Delete</button>
                `;
                div.querySelector('[data-action="edit"]').addEventListener('click', () => editDestination(dest));
                div.querySelector('[data-action="delete"]').addEventListener('click', () => deleteDestination(dest));
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
    openFormDialog({
        title: 'Edit destination',
        fields: [
            { name: 'location_name', label: 'Location name', value: dest.location_name, required: true, maxlength: 150 },
            { name: 'arrival_date', label: 'Arrival date', type: 'date', value: dest.arrival_date ?? '' },
            { name: 'departure_date', label: 'Departure date', type: 'date', value: dest.departure_date ?? '' },
            { name: 'notes', label: 'Notes', type: 'textarea', value: dest.notes ?? '', maxlength: 2000 }
        ],
        onSubmit: values => postJson('../backend/destinations/update_destination.php', {
            destination_id: dest.destination_id, ...values
        }).then(data => {
            if (data.success) loadDestinations();
            return data;
        })
    });
}

function deleteDestination(dest) {
    if (!confirm(`Delete "${dest.location_name}" and its activities?`)) return;
    postJson('../backend/destinations/delete_destination.php', { destination_id: dest.destination_id })
        .then(data => {
            if (data.success) {
                loadDestinations();
                loadTripInfo();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(() => showMessage('Something went wrong. Please try again.', true));
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
        .catch(() => showMessage('Something went wrong. Please try again.', true));
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
                    <h3>${esc(act.activity_name)}</h3>
                    <p>Category: ${esc(categoryLabel(act.category))}</p>
                    <p>Cost: ${money(act.estimated_cost)}</p>
                    <button class="btn-secondary" data-action="edit">Edit</button>
                    <button class="btn-danger" data-action="delete">Delete</button>
                `;
                div.querySelector('[data-action="edit"]').addEventListener('click', () => editActivity(act));
                div.querySelector('[data-action="delete"]').addEventListener('click', () => deleteActivity(act));
                list.appendChild(div);
            });
        })
        .catch(error => console.error('Something went wrong:', error));
}

function editActivity(act) {
    openFormDialog({
        title: 'Edit activity',
        fields: [
            { name: 'activity_name', label: 'Activity name', value: act.activity_name, required: true, maxlength: 150 },
            { name: 'category', label: 'Category', type: 'select', value: act.category, options: CATEGORIES },
            { name: 'estimated_cost', label: 'Estimated cost ($)', type: 'number', value: act.estimated_cost, min: 0, step: '0.01' }
        ],
        onSubmit: values => postJson('../backend/activities/update_activity.php', {
            activity_id: act.activity_id, ...values
        }).then(data => {
            if (data.success) {
                loadActivities();
                loadTripInfo();
            }
            return data;
        })
    });
}

function deleteActivity(act) {
    if (!confirm(`Delete "${act.activity_name}"?`)) return;
    postJson('../backend/activities/delete_activity.php', { activity_id: act.activity_id })
        .then(data => {
            if (data.success) {
                loadActivities();
                loadTripInfo();
            } else {
                showMessage(data.error, true);
            }
        })
        .catch(() => showMessage('Something went wrong. Please try again.', true));
}

document.getElementById('activityDestination').addEventListener('change', loadActivities);

loadTripInfo();
loadDestinations();
