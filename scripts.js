// scripts.js

const clientId = "a8d951c9a7764fd0ba2ad2ceda8d8404";
const clientSecret = "869ff777db2146c99f44ed2513587899";
const playlistId = '722wUkph9TqYEEUB0647mL';

// Function to get an access token from Spotify
async function getAccessToken() {
  const result = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
    },
    body: 'grant_type=client_credentials'
  });

  const data = await result.json();
  return data.access_token;
}

// Function to get songs from the playlist using the Spotify API
async function getSongs(accessToken) {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  const data = await response.json();
  return data.items;
}

// Function to format time from milliseconds to MM:SS
function formatTime(milliseconds) {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

// Function to update progress bar
function updateProgressBar(audioElement, progressBar) {
    const duration = audioElement.duration;
    audioElement.addEventListener('timeupdate', () => {
      const progressPercent = (audioElement.currentTime / duration) * 100;
      progressBar.style.width = `${progressPercent}%`;
    });
  }
  
  // Function to display the songs on the webpage
  function displaySongs(songs) {
    const songList = document.getElementById('song-list');
    songList.innerHTML = '';
  
    songs.forEach(song => {
      const songItem = document.createElement('div');
      songItem.classList.add('song-item');
  
      const songImage = song.track.album.images[0]?.url || '';
      const previewUrl = song.track.preview_url || '';
      const songLength = formatTime(song.track.duration_ms);
  
      songItem.innerHTML = `
        <div class="image-container">
          <img src="${songImage}" alt="${song.track.name}">
          <i class="fas fa-play play-button"></i>
        </div>
        <h3>${song.track.name}</h3>
        <p>${song.track.artists[0].name}</p>
        <p>Length: ${songLength}</p>
        ${previewUrl ? `<audio id="audio-${song.track.id}" src="${previewUrl}"></audio>` : '<p>No preview available</p>'}
        <div class="progress-bar-container" style="display: none;">
          <div class="progress-bar"></div>
        </div>
      `;
  
      // Play/pause preview on image click
      const imageContainer = songItem.querySelector('.image-container');
      const playButton = songItem.querySelector('.play-button');
      const audioElement = songItem.querySelector(`audio`);
      const progressBarContainer = songItem.querySelector('.progress-bar-container');
      const progressBar = songItem.querySelector('.progress-bar');
  
      let isPlaying = false;
      if (previewUrl) {
        imageContainer.addEventListener('click', () => {
          if (isPlaying) {
            audioElement.pause();
            playButton.classList.replace('fa-pause', 'fa-play');
            progressBarContainer.style.display = 'none';  // Hide progress bar on pause
          } else {
            audioElement.play();
            playButton.classList.replace('fa-play', 'fa-pause');
            progressBarContainer.style.display = 'block';  // Show progress bar on play
            updateProgressBar(audioElement, progressBar);
          }
          isPlaying = !isPlaying;
        });
      }
  
      songList.appendChild(songItem);
    });
  }

// Initialize the app and fetch the songs when the page loads
async function init() {
  const accessToken = await getAccessToken();  // Get the access token first
  const songs = await getSongs(accessToken);   // Fetch songs using the token
  displaySongs(songs);                         // Display the songs
}

document.addEventListener('DOMContentLoaded', init);
