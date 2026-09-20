let places = [];

function loadFeaturedPlaces() {
    fetch('../backend/places/get_featured_places.php')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                places = data.places;
                renderCarousel();
            }
        })
        .catch(error => console.error("Something went wrong:", error));
}

function renderCarousel() {
    const track = document.getElementById('carouselTrack');

    if (places.length === 0) {
        track.innerHTML = '<p>No featured places yet.</p>';
        return;
    }

    track.innerHTML = places.map(place => `
        <div class="place-card">
            <img src="${place.image_url}" alt="${place.place_name}">
            <div class="place-card-info">
                <h4>${place.place_name}</h4>
                <p class="place-country">${place.country ?? ''}</p>
                <p class="place-desc">${place.description ?? ''}</p>
            </div>
        </div>
    `).join('');
}

document.getElementById('prevBtn').addEventListener('click', function() {
    document.getElementById('carouselTrack').scrollBy({ left: -220, behavior: 'smooth' });
});

document.getElementById('nextBtn').addEventListener('click', function() {
    document.getElementById('carouselTrack').scrollBy({ left: 220, behavior: 'smooth' });
});

loadFeaturedPlaces();