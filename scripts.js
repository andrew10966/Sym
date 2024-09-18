// scripts.js

const clientId = "d5fb03ab9e1f4e0e94bf081387cca7c9";
const clientSecret = "ecb4f50449a14dfb929a1d2572530a68";
const playlistId = '722wUkph9TqYEEUB0647mL';
const redirectUri = 'http://127.0.0.1:5500/index.html'; // Change this to your actual redirect URI
let accessToken = '';
let currentAudioElement = null; // Track the currently playing audio element
let currentPlayButton = null; // Track the currently playing play button
let currentProgressBarContainer = null; // Track the currently displaying progress bar container

// Function to get access token from Spotify
async function getAccessToken() {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials'
    })
  });

  const data = await response.json();
  console.log('Access Token:', data.access_token); // Debugging line
  return data.access_token;
}

// Function to update progress bar
function updateProgressBar(audioElement, progressBar) {
  const duration = audioElement.duration;
  audioElement.addEventListener('timeupdate', () => {
    const progressPercent = (audioElement.currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
  });
}

// Function to handle the end of the audio
function handleAudioEnd(audioElement, progressBarContainer, playButton) {
  audioElement.addEventListener('ended', () => {
    audioElement.currentTime = 0;
    progressBarContainer.style.display = 'none'; // Hide progress bar when song ends
    playButton.classList.replace('fa-pause', 'fa-play');
    currentAudioElement = null; // Reset current audio element
    currentPlayButton = null; // Reset current play button
    currentProgressBarContainer = null; // Reset current progress bar container
  });
}

// Function to reset the previous audio and play new one
function resetPreviousAudio() {
  if (currentAudioElement) {
    currentAudioElement.pause();
    currentAudioElement.currentTime = 0; // Reset progress
    if (currentPlayButton) {
      currentPlayButton.classList.replace('fa-pause', 'fa-play');
    }
    if (currentProgressBarContainer) {
      currentProgressBarContainer.style.display = 'none'; // Hide progress bar
    }
    currentAudioElement = null; // Reset current audio element
    currentPlayButton = null; // Reset current play button
    currentProgressBarContainer = null; // Reset current progress bar container
  }
}

// Function to display songs on the webpage
async function displaySongs() {
  const songList = document.getElementById('song-list');
  songList.innerHTML = '';

  const tracks = await getAllTracks(accessToken, playlistId);
  console.log('Tracks:', tracks); // Debugging line

  tracks.forEach(song => {
    const songImage = song.track.album.images[0]?.url || '';
    const previewUrl = song.track.preview_url || '';
    const songLength = formatTime(song.track.duration_ms);

    const songItem = document.createElement('div');
    songItem.classList.add('song-item');
    
    songItem.innerHTML = `
      <div class="image-container">
        <img src="${songImage}" alt="${song.track.name}">
        <i class="fas fa-play play-button" data-track-id="${song.track.id}"></i>
      </div>
      <h3>${song.track.name}</h3>
      <p>${song.track.artists[0].name}</p>
      <p>Length: ${songLength}</p>
      ${previewUrl ? `<audio id="audio-${song.track.id}" src="${previewUrl}"></audio>` : '<p>No preview available</p>'}
      <div class="progress-bar-container" style="display: none;">
        <div class="progress-bar"></div>
      </div>
    `;

    const imageContainer = songItem.querySelector('.image-container');
    const playButton = songItem.querySelector('.play-button');
    const audioElement = songItem.querySelector(`audio`);
    const progressBarContainer = songItem.querySelector('.progress-bar-container');
    const progressBar = songItem.querySelector('.progress-bar');

    if (previewUrl) {
      imageContainer.addEventListener('click', () => {
        if (currentAudioElement && currentAudioElement !== audioElement) {
          resetPreviousAudio(); // Stop and reset the currently playing audio
        }

        if (audioElement.paused) {
          audioElement.play();
          playButton.classList.replace('fa-play', 'fa-pause');
          progressBarContainer.style.display = 'block'; // Show progress bar on play
          updateProgressBar(audioElement, progressBar);
          currentAudioElement = audioElement; // Set current audio element
          currentPlayButton = playButton; // Set current play button
          currentProgressBarContainer = progressBarContainer; // Set current progress bar container
        } else {
          audioElement.pause();
          progressBarContainer.style.display = 'none'; // Hide progress bar on pause
          playButton.classList.replace('fa-pause', 'fa-play');
          currentAudioElement = null; // Reset current audio element
          currentPlayButton = null; // Reset current play button
          currentProgressBarContainer = null; // Reset current progress bar container
        }
      });

      handleAudioEnd(audioElement, progressBarContainer, playButton);
    }

    songList.appendChild(songItem);
  });
}

// Function to format time in MM:SS
function formatTime(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Function to get all tracks from a playlist
async function getAllTracks(accessToken, playlistId) {
  let tracks = [];
  let url = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

  while (url) {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const data = await response.json();
    console.log('API Response:', data); // Debugging line
    tracks = tracks.concat(data.items);
    url = data.next; // Move to the next page of tracks
  }

  return tracks;
}

// Initialize the app
async function init() {
  accessToken = await getAccessToken();
  await displaySongs();
}

// Run the app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', init);
