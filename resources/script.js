const socket = io("/");
const video_grid = document.getElementById("video-grid");
const userVideo = document.createElement("video");
const showChat = document.querySelector("#showChat");
const closeChat = document.querySelector("#chatclose");
const invite = document.querySelector("#invite");
const mute = document.querySelector("#mute");
const leave = document.querySelector("#leave");
const stopVideo = document.querySelector("#stopVideo");

userVideo.muted = true;

let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

let user_videoStream;

const user = prompt("Enter your name to continue: ");

var peer = new Peer({
    config: {
        'iceServers': [{
                urls: "stun:reeha.com"
            },
            {
                url: 'turn:reeha.webRTC.app',
                credential: 'reeha',
                username: 'reehaWebRTC@live.com'
            }
        ]
    } /* Sample servers, please use appropriate ones */
});

navigator.mediaDevices
    .getUserMedia({
        audio: true,
        video: true,
    })
    .then((stream) => {
        user_videoStream = stream;
        addVideoStream(userVideo, stream, socket.id);

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream, socket.id);
            });
        });

        socket.on("user-connected", (userId, userName, socid) => {
            connectToNewUser(userId, stream, userName, socid);
            socket.emit("new user Joined", userId, stream, userName, socid);
        });
    });

const connectToNewUser = (userId, stream, userName, socid) => {
    const call = peer.call(userId, stream);
    const video = document.createElement("video");
    video.id = socid;
    call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream, socid);
    });
};

peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id, user, socket.id);
});

const addVideoStream = (video, stream, userId) => {
    video.srcObject = stream;
    video.addEventListener("loadedmetadata", () => {
        video.play();
        video.id = stream.id
        video_grid.appendChild(video);
    });
};

send.addEventListener("click", (e) => {
    if (text.value.length != 0) {
        socket.emit("message", text.value);
        text.value = "";
    }
});

text.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && text.value.length !== 0) {
        socket.emit("message", text.value);
        text.value = "";
    }
});

mute.addEventListener("click", () => {
    const enabled = user_videoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        user_videoStream.getAudioTracks()[0].enabled = false;
        html = `<i class="fas fa-microphone-alt-slash"></i>`;
        mute.classList.toggle("background__red");
        mute.innerHTML = html;
    } else {
        user_videoStream.getAudioTracks()[0].enabled = true;
        html = `<i class="fas fa-microphone-alt"></i>`;
        mute.classList.toggle("background__red");
        mute.innerHTML = html;
    }
});

stopVideo.addEventListener("click", () => {
    const enabled = user_videoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        user_videoStream.getVideoTracks()[0].enabled = false;
        html = `<i class="fas fa-video-slash"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    } else {
        user_videoStream.getVideoTracks()[0].enabled = true;
        html = `<i class="fas fa-video"></i>`;
        stopVideo.classList.toggle("background__red");
        stopVideo.innerHTML = html;
    }
});

invite.addEventListener("click", (e) => {
    prompt(
        "Meeting Link!",
        window.location.href
    );
});

closeChat.addEventListener("click", () => {
    document.querySelector(".main__right").style.display = "none";
    document.querySelector(".header__back").style.display = "none";
    showChat.style.display = "flex";
});

showChat.addEventListener("click", () => {
    document.querySelector(".main__right").style.display = "flex";
    document.querySelector(".main__right").style.flex = "0.5";
    document.querySelector(".header__back").style.display = "flex";
    showChat.style.display = "none";
});

window.addEventListener('beforeunload', function(e) {
    e.preventDefault();
    e.returnValue = '';
    socket.emit("user left", ROOM_ID, user_videoStream.id);
});

leave.addEventListener("click", function() {
    document.getElementById(idstream).remove();
    window.open("./close");
    window.opener.location = './close';
    window.close();
});

socket.on("createMessage", (message, userName) => {
    messages.innerHTML =
        messages.innerHTML +
        `<div class = "message">
            <b> <i class="fas fa-user-circle"></i>
            <span> ${userName === user ? "me" : userName} </span> </b> 
            <span> ${message} </span>
        </div>`;
});