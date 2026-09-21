const code = new URLSearchParams(window.location.search).get('code');
const heading = document.getElementById('tripNameHeading');

if (!code) {
    heading.textContent = 'No trip specified.';
} else {
    fetch(`../backend/trips/get_shared_trip.php?code=${encodeURIComponent(code)}`)
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                heading.textContent = 'Trip not found or not shared.';
                return;
            }

            const trip = data.trip;
            document.title = `${trip.trip_name} - TripPlanner`;
            heading.textContent = trip.trip_name;
            document.getElementById('tripDates').textContent = formatDates(trip.start_date, trip.end_date);
            document.getElementById('totalCost').textContent = money(trip.total_cost);
            document.getElementById('totalLine').hidden = false;
            document.getElementById('breakdownSection').hidden = false;
            renderBreakdown(document.getElementById('breakdownList'), trip.cost_by_category, trip.total_cost);

            const destinationList = document.getElementById('destinationList');
            if (data.destinations.length === 0) {
                destinationList.innerHTML = '<p>No destinations added yet.</p>';
                return;
            }

            data.destinations.forEach(dest => {
                const div = document.createElement('div');
                div.className = 'card';
                const activitiesHtml = dest.activities.length === 0
                    ? '<p>No activities yet.</p>'
                    : '<ul>' + dest.activities.map(act =>
                        `<li>${esc(act.activity_name)} (${esc(categoryLabel(act.category))}) - ${money(act.estimated_cost)}</li>`
                    ).join('') + '</ul>';

                div.innerHTML = `
                    <h3>${esc(dest.location_name)}</h3>
                    <p>${esc(formatDates(dest.arrival_date, dest.departure_date))}</p>
                    <p>${esc(dest.notes)}</p>
                    ${activitiesHtml}
                `;
                destinationList.appendChild(div);
            });
        })
        .catch(error => console.error('Something went wrong:', error));
}
