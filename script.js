const appState = {
  isDJ: false,
  activeRoomId: 'room-1',
  rooms: [
    {
      id: 'room-1',
      name: 'Late Night Synths',
      listeners: 24,
      chat: ['🪩', '✨', '🌙'],
      fallbackTracks: [
        { title: 'Neon Skyline', artist: 'Cloud Arcade', duration: '3:47', videoId: 'ktvTqknDobU' },
        { title: 'Signals in Rain', artist: 'Lux Pilot', duration: '4:02', videoId: '2Vv-BfVoq4g' },
        { title: 'Static Hearts', artist: 'Polaroid Drive', duration: '3:36', videoId: 'JGwWNGJdvx8' }
      ],
      fallbackIndex: 0,
      queue: [],
      nowPlaying: null
    },
    {
      id: 'room-2',
      name: 'Coffeehouse Sunday',
      listeners: 11,
      chat: ['☕', '🎧', '🤎'],
      fallbackTracks: [
        { title: 'Paper Cup Lullaby', artist: 'Ivy North', duration: '2:54', videoId: 'kJQP7kiw5Fk' },
        { title: 'Porchlight', artist: 'Fable Oaks', duration: '3:21', videoId: 'fRh_vgS2dFE' }
      ],
      fallbackIndex: 0,
      queue: [],
      nowPlaying: null
    },
    {
      id: 'room-3',
      name: 'Bounce Room',
      listeners: 31,
      chat: ['🔥', '😤', '🕺'],
      fallbackTracks: [
        { title: 'Crush Mode', artist: 'DYN-4', duration: '2:43', videoId: '09R8_2nJtjg' },
        { title: 'Tilt Shift', artist: 'Vector Bloom', duration: '3:08', videoId: 'hT_nvWreIhg' }
      ],
      fallbackIndex: 0,
      queue: [],
      nowPlaying: null
    }
  ],
  friends: ['Ari', 'Mina', 'Dev', 'Sam', 'Luca', 'Rin']
};

const roomList = document.getElementById('room-list');
const friendList = document.getElementById('friend-list');
const roomName = document.getElementById('room-name');
const trackTitle = document.getElementById('track-title');
const trackMeta = document.getElementById('track-meta');
const listenersCount = document.getElementById('listeners-count');
const likesCount = document.getElementById('likes-count');
const dislikesCount = document.getElementById('dislikes-count');
const roleLabel = document.getElementById('role-label');
const toggleDjButton = document.getElementById('toggle-dj');
const nextTrackButton = document.getElementById('next-track');
const djPanel = document.getElementById('dj-panel');
const likeBtn = document.getElementById('like-btn');
const dislikeBtn = document.getElementById('dislike-btn');
const chatLog = document.getElementById('chat-log');
const chatForm = document.getElementById('chat-form');
const emojiInput = document.getElementById('emoji-input');
const queueForm = document.getElementById('queue-form');
const queueInput = document.getElementById('queue-input');
const queueList = document.getElementById('queue-list');
const playerFrameContainer = document.getElementById('embed-frame');
const youtubePlayer = document.getElementById('youtube-player');
const emptyState = document.getElementById('empty-state');
const playOverlay = document.getElementById('play-overlay');

function getActiveRoom() {
  return appState.rooms.find((room) => room.id === appState.activeRoomId);
}

function getEmbedUrl(videoId, autoplay = true) {
  const autoplayFlag = autoplay ? '1' : '0';
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplayFlag}&mute=0&playsinline=1`;
}

function extractVideoId(rawInput) {
  const input = rawInput.trim();
  if (!input) {
    return null;
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);
    const host = url.hostname.replace('www.', '');

    if (host === 'youtu.be') {
      const id = url.pathname.replace('/', '').trim();
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const watchId = url.searchParams.get('v');
      if (watchId && /^[a-zA-Z0-9_-]{11}$/.test(watchId)) {
        return watchId;
      }

      if (url.pathname.startsWith('/embed/')) {
        const id = url.pathname.split('/embed/')[1]?.split('/')[0];
        return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function createTrackFromVideoId(videoId) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    videoId,
    title: `YouTube track ${videoId}`,
    artist: 'Queued by DJ',
    duration: 'Unknown',
    likes: 0,
    dislikes: 0
  };
}

function promoteToNowPlaying(room, nextItem, sourceLabel) {
  room.nowPlaying = {
    ...nextItem,
    likes: nextItem.likes ?? 0,
    dislikes: nextItem.dislikes ?? 0
  };
  room.chat.push(`DJ: ▶️ ${sourceLabel}`);
}

function playNextForRoom(room) {
  if (room.queue.length > 0) {
    const queueItem = room.queue.shift();
    promoteToNowPlaying(room, queueItem, `Now playing ${queueItem.title}`);
    return;
  }

  const fallback = room.fallbackTracks[room.fallbackIndex];
  room.fallbackIndex = (room.fallbackIndex + 1) % room.fallbackTracks.length;
  promoteToNowPlaying(room, fallback, `Fallback track ${fallback.title}`);
}

function renderRooms() {
  roomList.innerHTML = '';

  appState.rooms.forEach((room) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    button.className = `room-item ${room.id === appState.activeRoomId ? 'active' : ''}`;
    button.type = 'button';
    button.innerHTML = `<strong>${room.name}</strong><br><small>${room.listeners} in room</small>`;
    button.addEventListener('click', () => {
      appState.activeRoomId = room.id;
      render();
    });

    item.appendChild(button);
    roomList.appendChild(item);
  });
}

function renderFriends() {
  friendList.innerHTML = '';

  appState.friends.forEach((friend) => {
    const item = document.createElement('li');
    item.className = 'friend';
    item.textContent = `● ${friend}`;
    friendList.appendChild(item);
  });
}

function renderTrackPanel() {
  const activeRoom = getActiveRoom();
  const currentTrack = activeRoom.nowPlaying;

  roomName.textContent = activeRoom.name;
  listenersCount.textContent = activeRoom.listeners;

  if (!currentTrack) {
    trackTitle.textContent = 'Nothing live yet';
    trackMeta.textContent = 'Queue a YouTube link to start the room vibe.';
    likesCount.textContent = '0';
    dislikesCount.textContent = '0';
    likeBtn.disabled = true;
    dislikeBtn.disabled = true;
    playerFrameContainer.hidden = true;
    emptyState.hidden = false;
    return;
  }

  trackTitle.textContent = currentTrack.title;
  trackMeta.textContent = `${currentTrack.artist} • ${currentTrack.duration}`;
  likesCount.textContent = currentTrack.likes;
  dislikesCount.textContent = currentTrack.dislikes;
  likeBtn.disabled = false;
  dislikeBtn.disabled = false;
  emptyState.hidden = true;
  playerFrameContainer.hidden = false;
  youtubePlayer.src = getEmbedUrl(currentTrack.videoId, true);
  playOverlay.hidden = false;
}

function renderQueue() {
  const activeRoom = getActiveRoom();
  queueList.innerHTML = '';

  if (activeRoom.queue.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'queue-empty';
    empty.textContent = 'Queue is empty. Paste a YouTube link to add tracks.';
    queueList.appendChild(empty);
    return;
  }

  activeRoom.queue.forEach((track, index) => {
    const item = document.createElement('li');
    item.className = 'queue-item';

    const thumb = document.createElement('img');
    thumb.src = `https://img.youtube.com/vi/${track.videoId}/mqdefault.jpg`;
    thumb.alt = `${track.title} thumbnail`;
    thumb.className = 'queue-thumb';

    const content = document.createElement('div');
    content.className = 'queue-copy';
    content.innerHTML = `<strong>${track.title}</strong><small>${track.videoId}</small>`;

    const playBtn = document.createElement('button');
    playBtn.type = 'button';
    playBtn.textContent = index === 0 ? 'Play next' : 'Play now';
    playBtn.addEventListener('click', () => {
      const [selected] = activeRoom.queue.splice(index, 1);
      promoteToNowPlaying(activeRoom, selected, `Now playing ${selected.title}`);
      render();
    });

    item.append(thumb, content, playBtn);
    queueList.appendChild(item);
  });
}

function renderRole() {
  roleLabel.textContent = appState.isDJ ? 'DJ mode' : 'Listener';
  toggleDjButton.textContent = appState.isDJ ? 'Stop DJing' : 'Become DJ';
  toggleDjButton.setAttribute('aria-pressed', appState.isDJ);
  djPanel.hidden = !appState.isDJ;
}

function renderChat() {
  const activeRoom = getActiveRoom();
  chatLog.innerHTML = '';

  activeRoom.chat.slice(-20).forEach((entry) => {
    const item = document.createElement('li');
    item.className = `chat-item ${entry.startsWith('You:') ? 'me' : ''}`;
    item.textContent = entry;
    chatLog.appendChild(item);
  });

  chatLog.scrollTop = chatLog.scrollHeight;
}

function render() {
  renderRooms();
  renderFriends();
  renderTrackPanel();
  renderQueue();
  renderRole();
  renderChat();
}

toggleDjButton.addEventListener('click', () => {
  appState.isDJ = !appState.isDJ;
  renderRole();
});

nextTrackButton.addEventListener('click', () => {
  if (!appState.isDJ) {
    return;
  }

  const activeRoom = getActiveRoom();
  playNextForRoom(activeRoom);
  render();
});

queueForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!appState.isDJ) {
    return;
  }

  const videoId = extractVideoId(queueInput.value);
  if (!videoId) {
    queueInput.setCustomValidity('Enter a valid YouTube link or video ID.');
    queueInput.reportValidity();
    return;
  }

  queueInput.setCustomValidity('');
  const activeRoom = getActiveRoom();
  const track = createTrackFromVideoId(videoId);
  activeRoom.queue.push(track);
  activeRoom.chat.push(`DJ: ➕ queued ${videoId}`);
  queueInput.value = '';
  renderQueue();
  renderChat();
});

playOverlay.addEventListener('click', () => {
  const activeRoom = getActiveRoom();
  if (!activeRoom.nowPlaying) {
    return;
  }

  youtubePlayer.src = getEmbedUrl(activeRoom.nowPlaying.videoId, false);
  youtubePlayer.focus();
  playOverlay.hidden = true;
});

youtubePlayer.addEventListener('load', () => {
  playOverlay.hidden = false;
});

likeBtn.addEventListener('click', () => {
  const activeRoom = getActiveRoom();
  if (!activeRoom.nowPlaying) {
    return;
  }

  activeRoom.nowPlaying.likes += 1;
  activeRoom.chat.push('You: 👍');
  renderTrackPanel();
  renderChat();
});

dislikeBtn.addEventListener('click', () => {
  const activeRoom = getActiveRoom();
  if (!activeRoom.nowPlaying) {
    return;
  }

  activeRoom.nowPlaying.dislikes += 1;
  activeRoom.chat.push('You: 👎');
  renderTrackPanel();
  renderChat();
});

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const emoji = emojiInput.value.trim();
  if (!emoji) {
    return;
  }

  const activeRoom = getActiveRoom();
  activeRoom.chat.push(`You: ${emoji}`);
  emojiInput.value = '';
  renderChat();
});

render();
