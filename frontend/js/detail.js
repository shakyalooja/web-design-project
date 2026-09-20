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
const urlParams = new URLSearchParams(window.location.search);
const tripId = urlParams.get('trip_id');

if (!tripId) {
    alert("No trip selected.");
    window.location.href = "dashboard.html";
}

function loadTripInfo() {
    fetch(`../backend/trips/get_trip.php?trip_id=${tripId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                document.getElementById('tripNameHeading').textContent = data.trip.trip_name;
            } else {
                alert("Error: " + data.error);
            }
        })
        .catch(error => console.error("Something went wrong:", error));
}

loadTripInfo();
document.getElementById('shareTripBtn').addEventListener('click', function() {
    fetch('../backend/trips/toggle_share.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trip_id: tripId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            if (data.is_shared) {
                const shareUrl = `${window.location.origin}/trip-planner/frontend/shared-trip.html?trip_id=${tripId}`;
                prompt("Trip is now shared! Copy this link:", shareUrl);
            } else {
                alert("Trip is no longer shared.");
            }
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Something went wrong:", error));
});
loadDestinations();

document.getElementById('destinationForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const locationName = document.getElementById('locationName').value;
    const arrivalDate = document.getElementById('arrivalDate').value;
    const departureDate = document.getElementById('departureDate').value;
    const notes = document.getElementById('notes').value;

    fetch('../backend/destinations/create_destination.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            trip_id: tripId,
            location_name: locationName,
            arrival_date: arrivalDate,
            departure_date: departureDate,
            notes: notes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Destination added!");
            document.getElementById('destinationForm').reset();
            loadDestinations();
        }
    })
    .catch(error => console.error("Something went wrong:", error));
});

function loadDestinations() {
    fetch(`../backend/destinations/get_destinations.php?trip_id=${tripId}`)
        .then(response => response.json())
        .then(data => {
            const destinationList = document.getElementById('destinationList');
            const destinationDropdown = document.getElementById('activityDestination');

            destinationList.innerHTML = '';
            destinationDropdown.innerHTML = '';

            if (data.destinations.length === 0) {
                destinationList.innerHTML = '<p>No destinations yet. Add one below.</p>';
                destinationDropdown.innerHTML = '<option value="">Add a destination first</option>';
                return;
            }

            data.destinations.forEach(dest => {
                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                    <h4>${dest.location_name}</h4>
                    <p>${dest.arrival_date ?? ''} to ${dest.departure_date ?? ''}</p>
                    <p>${dest.notes ?? ''}</p>
                    <button onclick="editDestination(${dest.destination_id}, '${dest.location_name}', '${dest.arrival_date ?? ''}', '${dest.departure_date ?? ''}', '${dest.notes ?? ''}')">Edit</button>
                    <button onclick="deleteDestination(${dest.destination_id})">Delete</button>
                `;
                destinationList.appendChild(div);

                const option = document.createElement('option');
                option.value = dest.destination_id;
                option.textContent = dest.location_name;
                destinationDropdown.appendChild(option);
            });
            loadActivities();

        })
        .catch(error => console.error("Something went wrong:", error));
}

function editDestination(destId, currentName, currentArrival, currentDeparture, currentNotes) {
    const newName = prompt("Location name:", currentName);
    if (newName === null) return;

    const newArrival = prompt("Arrival date (YYYY-MM-DD):", currentArrival);
    const newDeparture = prompt("Departure date (YYYY-MM-DD):", currentDeparture);
    const newNotes = prompt("Notes:", currentNotes);

    fetch('../backend/destinations/update_destination.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            destination_id: destId,
            location_name: newName,
            arrival_date: newArrival,
            departure_date: newDeparture,
            notes: newNotes
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadDestinations();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Something went wrong:", error));
}

function deleteDestination(destId) {
    if (!confirm("Delete this destination?")) return;

    fetch('../backend/destinations/delete_destination.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_id: destId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadDestinations();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Something went wrong:", error));
}
document.getElementById('activityForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const destinationId = document.getElementById('activityDestination').value;
    const activityName = document.getElementById('activityName').value;
    const category = document.getElementById('category').value;
    const estimatedCost = document.getElementById('estimatedCost').value;

    if (!destinationId) {
        alert("Please add a destination first.");
        return;
    }

    fetch('../backend/activities/create_activity.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            destination_id: destinationId,
            activity_name: activityName,
            category: category,
            estimated_cost: estimatedCost
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Activity added!");
            document.getElementById('activityForm').reset();
            loadActivities();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Something went wrong:", error));
});

function loadActivities() {
    const destinationId = document.getElementById('activityDestination').value;

    if (!destinationId) {
        document.getElementById('activityList').innerHTML = '<p>No destinations yet.</p>';
        return;
    }

    fetch(`../backend/activities/get_activities.php?destination_id=${destinationId}`)
        .then(response => response.json())
        .then(data => {
            const activityList = document.getElementById('activityList');
            activityList.innerHTML = '';

            if (data.activities.length === 0) {
                activityList.innerHTML = '<p>No activities yet for this destination.</p>';
                document.getElementById('totalCost').textContent = '$0';
                return;
            }

            let total = 0;
            data.activities.forEach(act => {
                total += parseFloat(act.estimated_cost);

                const div = document.createElement('div');
                div.className = 'card';
                div.innerHTML = `
                    <h4>${act.activity_name}</h4>
                    <p>Category: ${act.category ?? ''}</p>
                    <p>Cost: $${act.estimated_cost}</p>
                    <button onclick="editActivity(${act.activity_id}, '${act.activity_name}', '${act.category ?? ''}', ${act.estimated_cost})">Edit</button>
                    <button onclick="deleteActivity(${act.activity_id})">Delete</button>
                `;
                activityList.appendChild(div);
            });

            document.getElementById('totalCost').textContent = `$${total.toFixed(2)}`;
        })
        .catch(error => console.error("Something went wrong:", error));
}

function editActivity(activityId, currentName, currentCategory, currentCost) {
    const newName = prompt("Activity name:", currentName);
    if (newName === null) return;

    const newCategory = prompt("Category (transport/accommodation/food/sightseeing/other):", currentCategory);
    const newCost = prompt("Estimated cost:", currentCost);

    fetch('../backend/activities/update_activity.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            activity_id: activityId,
            activity_name: newName,
            category: newCategory,
            estimated_cost: newCost
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadActivities();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Something went wrong:", error));
}

function deleteActivity(activityId) {
    if (!confirm("Delete this activity?")) return;

    fetch('../backend/activities/delete_activity.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activity_id: activityId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            loadActivities();
        } else {
            alert("Error: " + data.error);
        }
    })
    .catch(error => console.error("Something went wrong:", error));
}

// Reload activities whenever the selected destination changes
document.getElementById('activityDestination').addEventListener('change', loadActivities);