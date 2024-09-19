const clientId = "d5fb03ab9e1f4e0e94bf081387cca7c9";
const clientSecret = "ecb4f50449a14dfb929a1d2572530a68";
const tokenUrl = "https://accounts.spotify.com/api/token";
const playlistUrl = "https://api.spotify.com/v1/playlists/722wUkph9TqYEEUB0647mL/tracks";
let currentAudio = null;
let currentlyPlayingItem = null;

// Fetch a token for Spotify API
async function fetchToken() {
    const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
        },
        body: new URLSearchParams({ grant_type: 'client_credentials' })
    });
    const data = await response.json();
    return data.access_token;
}

// Fetch playlist tracks from Spotify
async function fetchPlaylistTracks() {
    const token = await fetchToken();
    const response = await fetch(playlistUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    return data.items;  // Return the array of track items
}

// Create a collab item (song) to display
function createCollabItem(track) {
    if (!track || !track.track.preview_url || !track.track.album || !track.track.album.images || !track.track.album.images[0] || !track.track.artists) {
        console.warn(`Skipping track with no preview: ${track ? track.track.id : 'unknown track'}`);
        return null; // Return null to skip track without preview
    }

    const item = document.createElement('div');
    item.className = 'collab-item';

    // Set up the HTML structure for the item (album cover, track name, artist, etc.)
    item.innerHTML = `
        <img src="${track.track.album.images[0].url}" class="cover-img" data-preview="${track.track.preview_url}" alt="${track.track.name}">
        <div class="play-pause-container">
            <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45"></circle>
            </svg>
            <i class="fa fa-play"></i>
        </div>
        <h3><a href="https://open.spotify.com/track/${track.track.id}" target="_blank">${track.track.name}</a></h3>
        <p>Artist(s): ${track.track.artists.map(artist => artist.name).join(', ')}</p>
        <p>Length: ${Math.floor(track.track.duration_ms / 60000)}:${(Math.floor((track.track.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}</p>
    `;

    // Enable preview audio playback when clicking the cover image
    item.querySelector('.cover-img').addEventListener('click', function () {
        togglePreview(track.track.preview_url, item);
    });

    // Also enable preview audio playback when clicking the play/pause button
    item.querySelector('.play-pause-container').addEventListener('click', function () {
        togglePreview(track.track.preview_url, item);
    });

    return item;
}

// Handle the preview audio playback and update progress bar
function togglePreview(url, item) {
    const playPauseIcon = item.querySelector('.play-pause-container i');
    const progressCircle = item.querySelector('.play-pause-container circle');

    if (currentAudio) {
        if (currentAudio.src === url) {
            if (currentAudio.paused) {
                currentAudio.play();
                playPauseIcon.className = 'fa fa-pause';
                item.classList.add('playing'); // Show progress bar
            } else {
                currentAudio.pause();
                playPauseIcon.className = 'fa fa-play';
                item.classList.remove('playing'); // Hide progress bar
            }
        } else {
            stopCurrentAudio(); // Stop any currently playing audio
            currentAudio = new Audio(url);
            currentAudio.play();
            playPauseIcon.className = 'fa fa-pause';
            item.classList.add('playing');
            currentlyPlayingItem = item;

            // Update progress bar
            currentlyPlayingItem.progressInterval = setInterval(() => {
                const progress = (currentAudio.currentTime / currentAudio.duration) * 283;
                progressCircle.style.strokeDashoffset = 283 - progress;
            }, 100);

            currentAudio.addEventListener('ended', () => {
                playPauseIcon.className = 'fa fa-play';
                clearInterval(currentlyPlayingItem.progressInterval);
                progressCircle.style.strokeDashoffset = 283; // Reset progress
                item.classList.remove('playing'); // Hide progress bar
            });
        }
    } else {
        currentAudio = new Audio(url);
        currentAudio.play();
        playPauseIcon.className = 'fa fa-pause';
        item.classList.add('playing');
        currentlyPlayingItem = item;

        // Update progress bar
        currentlyPlayingItem.progressInterval = setInterval(() => {
            const progress = (currentAudio.currentTime / currentAudio.duration) * 283;
            progressCircle.style.strokeDashoffset = 283 - progress;
        }, 100);

        currentAudio.addEventListener('ended', () => {
            playPauseIcon.className = 'fa fa-play';
            clearInterval(currentlyPlayingItem.progressInterval);
            progressCircle.style.strokeDashoffset = 283; // Reset progress
            item.classList.remove('playing'); // Hide progress bar
        });
    }
}

// Helper function to stop currently playing audio
function stopCurrentAudio() {
    if (currentAudio) {
        currentAudio.pause();
        if (currentlyPlayingItem) {
            currentlyPlayingItem.querySelector('.play-pause-container i').className = 'fa fa-play';
            currentlyPlayingItem.classList.remove('playing');
            clearInterval(currentlyPlayingItem.progressInterval);
        }
    }
}

// Search functionality
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', filterCollabs);

// Function to filter the collab items
function filterCollabs() {
    const searchQuery = searchInput.value.toLowerCase();
    const collabs = document.querySelectorAll('.collab-item');

    collabs.forEach(collab => {
        const collabName = collab.querySelector('h3 a').textContent.toLowerCase();
        const matchesSearch = searchQuery === '' || collabName.includes(searchQuery);

        if (matchesSearch) {
            collab.style.display = 'block';
        } else {
            collab.style.display = 'none';
        }
    });
}

// Fetch and display the playlist tracks
async function loadPlaylistTracks() {
    const tracks = await fetchPlaylistTracks();
    tracks.forEach(track => {
        const collabItem = createCollabItem(track);
        if (collabItem) {
            document.getElementById('collab-list').appendChild(collabItem);
        }
    });
}

// Load playlist tracks when the page loads
window.onload = loadPlaylistTracks;
