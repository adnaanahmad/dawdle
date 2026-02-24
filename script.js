const appState = {
  isDJ: false,
  activeRoomId: 'room-1',
  rooms: [
    {
      id: 'room-1',
      name: 'Late Night Synths',
      listeners: 24,
      likes: 12,
      dislikes: 2,
      chat: ['🪩', '✨', '🌙'],
      tracks: [
        { title: 'Neon Skyline', artist: 'Cloud Arcade', duration: '3:47' },
        { title: 'Signals in Rain', artist: 'Lux Pilot', duration: '4:02' },
        { title: 'Static Hearts', artist: 'Polaroid Drive', duration: '3:36' }
      ],
      trackIndex: 0
    },
    {
      id: 'room-2',
      name: 'Coffeehouse Sunday',
      listeners: 11,
      likes: 5,
      dislikes: 1,
      chat: ['☕', '🎧', '🤎'],
      tracks: [
        { title: 'Paper Cup Lullaby', artist: 'Ivy North', duration: '2:54' },
        { title: 'Porchlight', artist: 'Fable Oaks', duration: '3:21' }
      ],
      trackIndex: 0
    },
    {
      id: 'room-3',
      name: 'Bounce Room',
      listeners: 31,
      likes: 20,
      dislikes: 4,
      chat: ['🔥', '😤', '🕺'],
      tracks: [
        { title: 'Crush Mode', artist: 'DYN-4', duration: '2:43' },
        { title: 'Tilt Shift', artist: 'Vector Bloom', duration: '3:08' }
      ],
      trackIndex: 0
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

const chatPanel = document.getElementById('chat-panel');
const chatDrawerToggle = document.getElementById('chat-drawer-toggle');
const chatClose = document.getElementById('chat-close');
const chatBackdrop = document.getElementById('chat-backdrop');

function isSmallScreen() {
  return window.matchMedia('(max-width: 760px)').matches;
}

function setChatDrawer(open) {
  if (!isSmallScreen()) {
    document.body.classList.remove('chat-open');
    chatBackdrop.hidden = true;
    chatDrawerToggle?.setAttribute('aria-expanded', 'false');
    return;
  }

  document.body.classList.toggle('chat-open', open);
  chatBackdrop.hidden = !open;
  chatDrawerToggle?.setAttribute('aria-expanded', String(open));
}

function getActiveRoom() {
  return appState.rooms.find((room) => room.id === appState.activeRoomId);
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
  const activeTrack = activeRoom.tracks[activeRoom.trackIndex];

  roomName.textContent = activeRoom.name;
  trackTitle.textContent = activeTrack.title;
  trackMeta.textContent = `${activeTrack.artist} • ${activeTrack.duration}`;
  listenersCount.textContent = activeRoom.listeners;
  likesCount.textContent = activeRoom.likes;
  dislikesCount.textContent = activeRoom.dislikes;
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
  activeRoom.trackIndex = (activeRoom.trackIndex + 1) % activeRoom.tracks.length;
  activeRoom.chat.push('DJ: ⏭️ Next track queued');
  renderTrackPanel();
  renderChat();
});

likeBtn.addEventListener('click', () => {
  const activeRoom = getActiveRoom();
  activeRoom.likes += 1;
  activeRoom.chat.push('You: 👍');
  renderTrackPanel();
  renderChat();
});

dislikeBtn.addEventListener('click', () => {
  const activeRoom = getActiveRoom();
  activeRoom.dislikes += 1;
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


chatDrawerToggle?.addEventListener('click', () => {
  const isOpen = document.body.classList.contains('chat-open');
  setChatDrawer(!isOpen);
});

chatClose?.addEventListener('click', () => {
  setChatDrawer(false);
});

chatBackdrop?.addEventListener('click', () => {
  setChatDrawer(false);
});

window.addEventListener('resize', () => {
  if (!isSmallScreen()) {
    setChatDrawer(false);
  }
});

chatPanel?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    setChatDrawer(false);
  }
});
