// scripts.js

const clientId = "a8d951c9a7764fd0ba2ad2ceda8d8404";
const clientSecret = "869ff777db2146c99f44ed2513587899";
const playlistId = '0wCikTVwYGaSvppCFG75C1';

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
  
  // Function to display the songs on the webpage
  function displaySongs(songs) {
    const songList = document.getElementById('song-list');
    songList.innerHTML = '';
  
    songs.forEach(song => {
      const songItem = document.createElement('div');
      songItem.classList.add('song-item');
  
      const songImage = song.track.album.images[0]?.url || '';
      const previewUrl = song.track.preview_url || '';
  
      songItem.innerHTML = `
        <img src="${songImage}" alt="${song.track.name}">
        <h3>${song.track.name}</h3>
        <p>${song.track.artists[0].name}</p>
        <p>Length: ${(song.track.duration_ms / 60000).toFixed(2)} min</p>
        ${previewUrl ? `<audio controls src="${previewUrl}"></audio>` : '<p>No preview available</p>'}
      `;
  
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