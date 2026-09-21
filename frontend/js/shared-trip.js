const urlParams = new URLSearchParams(window.location.search);
const tripId = urlParams.get('trip_id');

if (!tripId) {
    document.getElementById('tripNameHeading').textContent = "No trip specified.";
} else {
    fetch(`../backend/trips/get_shared_trip.php?trip_id=${encodeURIComponent(tripId)}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                document.getElementById('tripNameHeading').textContent = "Trip not found or not shared.";
                return;
            }

            document.getElementById('tripNameHeading').textContent = data.trip.trip_name;
            document.getElementById('tripDates').textContent = `${data.trip.start_date ?? ''} to ${data.trip.end_date ?? ''}`;

            const destinationList = document.getElementById('destinationList');

            if (data.destinations.length === 0) {
                destinationList.innerHTML = '<p>No destinations added yet.</p>';
                return;
            }

            data.destinations.forEach(dest => {
                const div = document.createElement('div');
                div.className = 'card';
                let activitiesHtml = '<p>No activities yet.</p>';
                if (dest.activities.length > 0) {
                    activitiesHtml = '<ul>' + dest.activities.map(act =>
                        `<li>${esc(act.activity_name)} (${esc(act.category)}) - $${Number(act.estimated_cost).toFixed(2)}</li>`
                    ).join('') + '</ul>';
                }

                div.innerHTML = `
                    <h3>${esc(dest.location_name)}</h3>
                    <p>${esc(dest.arrival_date ?? '?')} to ${esc(dest.departure_date ?? '?')}</p>
                    <p>${esc(dest.notes)}</p>
                    ${activitiesHtml}
                `;
                destinationList.appendChild(div);
            });
        })
        .catch(error => console.error("Something went wrong:", error));
}