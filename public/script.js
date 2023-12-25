// 连接到Socket.IO服务器
const socket = io();

socket.on('connect', () => {
  console.log('Connected to the server.');
});

// 登入功能
function login() {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
  
    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    }).then(response => {
      if (response.ok) return response.json();
      throw new Error('Login failed.');
    }).then(data => {
      localStorage.setItem('username', data.username); // 存储用户名
      window.location.href = '/profile.html';
    }).catch(error => {
      alert(error);
    });
  }
  
  // 註冊功能
  function register() {
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
  
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    }).then(response => {
      if (response.ok) {
        alert('Registration successful!');
        window.location.href = '/index.html';
      } else {
        alert('Registration failed.');
      }
    }).catch(error => {
      alert(error);
    });
  }
  
  // 登出功能
  function logout() {
    fetch('/logout', {
      method: 'POST',
    }).then(() => {
      window.location.href = '/index.html';
    });
  }


// 获取留言并显示（使用Socket.IO）
function loadMessages() {
  socket.on('loadMessages', (messages) => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = messages.map(msg => 
      `<div class="message-container">
          <div class="message-header">${msg.subject}</div>
          <div>${msg.content}</div>
          <div class="message-footer">${msg.author} - ${new Date(msg.createdAt).toLocaleString()}</div>
      </div>`
    ).join('');
  });
}

// 发布留言（使用Socket.IO）
function postMessage() {
  const subject = document.getElementById('subject').value;
  const content = document.getElementById('content').value;
  console.log('Sending message:', { subject, content});
  // 发送留言到服务器
  socket.emit('postMessage', { subject, content});
  // 监听服务器确认消息已保存
  socket.on('messagePosted', () => {
    window.location.href = '/messageboard.html'; // 跳转到留言板页面
  });
}

// 监听来自服务器的新留言
socket.on('newMessage', (msg) => {
  // 将新留言添加到留言板
  addMessageToBoard(msg);
});

// 获取留言并显示
function loadMessages() {
  // 请求服务器获取所有留言
  socket.emit('requestMessages');

  // 接收服务器发送的所有留言
  socket.on('loadMessages', (messages) => {
    const messagesDiv = document.getElementById('messages');
    messagesDiv.innerHTML = messages.map(msg => 
      `<div class="message-container">
          <div class="message-header">${msg.subject}</div>
          <div>${msg.content}</div>
          <div class="message-footer">${msg.author} - ${new Date(msg.createdAt).toLocaleString()}</div>
      </div>`
    ).join('');
  });
}

// 页面加载时获取留言
if (window.location.pathname === '/messageboard.html') {
    loadMessages();
}

// 網路視訊

// Global variables
let localStream = null;
let remoteStream = null;
let peerConnection = null;
const configuration = {'iceServers': [{'urls': 'stun:stun.l.google.com:19302'}]};

socket.on('online-users', (users) => {
  // 更新UI以显示在线用户
  const usersList = document.getElementById('onlineUsers');
  usersList.innerHTML = '';
  users.forEach(user => {
      if (user !== localStorage.getItem('username')) {  // 不显示自己
          usersList.innerHTML += `<li><button onclick="initiateCall('${user}')">${user}</button></li>`;
      }
  });
});

function initiateCall(otherUsername) {
  if (otherUsername) {
      console.log(`Initiating call with ${otherUsername}`);
      // 发送呼叫请求给服务器，服务器需要转发给特定的用户
      socket.emit('initiate-call', { to: otherUsername });
  }
}

function toggleCamera() {
  if (localStream) {
    const videoTrack = localStream.getVideoTracks()[0];
    videoTrack.enabled = !videoTrack.enabled;
  }
}

function toggleMicrophone() {
  if (localStream) {
    const audioTrack = localStream.getAudioTracks()[0];
    audioTrack.enabled = !audioTrack.enabled;
  }
}

// 获取本地视频和音频
function startVideo() {
  navigator.mediaDevices.getUserMedia({audio: true, video: true})
    .then(stream => {
      localStream = stream;
      document.getElementById('localVideo').srcObject = localStream;
    })
    .catch(error => {
      console.error('Error opening video camera.', error);
    });
}

// 创建WebRTC连接
function createPeerConnection() {
  peerConnection = new RTCPeerConnection(configuration);

  // 当找到ICE候选时发送给远端
  peerConnection.onicecandidate = ({candidate}) => {
    if(candidate) {
      socket.emit('new-ice-candidate', {candidate});
    }
  };

  // 当远端流到达时，将其设置到远端视频对象中
  peerConnection.ontrack = (event) => {
    if (!remoteStream) {
      remoteStream = new MediaStream();
      document.getElementById('remoteVideo').srcObject = remoteStream;
    }
    remoteStream.addTrack(event.track);
  };

  // 添加本地流到连接
  localStream.getTracks().forEach(track => {
    peerConnection.addTrack(track, localStream);
  });
}

// 呼叫其他用户
function call() {
  createPeerConnection();
  peerConnection.createOffer()
    .then(offer => peerConnection.setLocalDescription(offer))
    .then(() => {
      socket.emit('video-offer', {offer: peerConnection.localDescription});
    })
    .catch(error => console.error('Error creating offer: ', error));
}

// 接受呼叫
function handleOffer(offer) {
  if (!peerConnection) createPeerConnection();
  peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
    .then(() => peerConnection.createAnswer())
    .then(answer => peerConnection.setLocalDescription(answer))
    .then(() => {
      socket.emit('video-answer', {answer: peerConnection.localDescription});
    })
    .catch(error => console.error('Error handling offer: ', error));
}

// 处理远端的回应
function handleAnswer(answer) {
  peerConnection.setRemoteDescription(new RTCSessionDescription(answer))
    .catch(error => console.error('Error setting remote description: ', error));
}

// 处理新的ICE候选
function handleNewICECandidate(candidate) {
  peerConnection.addIceCandidate(candidate)
    .catch(error => console.error('Error adding received ice candidate', error));
}

// 退出视频通话
function hangupVideo() {
  if (peerConnection) {
    peerConnection.close();
    peerConnection = null;
  }
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
    localStream = null;
  }
  remoteStream = null;
  document.getElementById('localVideo').srcObject = null;
  document.getElementById('remoteVideo').srcObject = null;
  window.location.href = '/profile.html'; // 跳转回个人主页
}

// 监听Socket.IO事件
socket.on('video-offer', data => {
  handleOffer(data.offer);
});

socket.on('video-answer', data => {
  handleAnswer(data.answer);
});

socket.on('new-ice-candidate', data => {
  handleNewICECandidate(data.candidate);
});

socket.on('user-disconnected', () => {
  console.log('The other user has disconnected.');
  hangupVideo();  // 调用挂断视频的函数
});

socket.on('incoming-call', (data) => {
  if (confirm(`Incoming call from ${data.from}, accept?`)) {
      // 接受呼叫逻辑
      call();
  }
});

socket.on('call-error', (data) => {
  alert(data.message); // 显示错误信息，例如对方不在线
});

