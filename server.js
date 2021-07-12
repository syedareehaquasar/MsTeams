const express = require("express");
const socketIO = require('socket.io');
const app = express();
const server = require("http").Server(app);
const { v4: uuidv4 } = require("uuid");
const { ExpressPeerServer } = require("peer");
const peerServer = ExpressPeerServer(server, {
    debug: true,
});
var io = socketIO(server);

app.set("view engine", "ejs");
app.engine('ejs', require('ejs').__express);

app.get("/meet", (req, res) => {
    res.render("meet", { roomId: req.params.room });
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/", (req, res) => {
    res.redirect(`/${uuidv4()}`);
});

app.use(express.static("resources"));
app.use("/peerjs", peerServer);

io.on("connection", (socket) => {
    socket.on("join-room", (roomId, userId, userName) => {
        socket.join(roomId);
        io.to(roomId).emit("user-connected", userId, userName);
        socket.on("message", (message) => {
            io.to(roomId).emit("createMessage", message, userName);
        });
        socket.on("leave", (ROOM_ID, idstream) => {
            io.to(ROOM_ID).emit("user-left", idstream);
        });
    });
});

server.listen(process.env.PORT || 3000);

app.get('/close', (req, res) => {
    res.redirect('../');
});