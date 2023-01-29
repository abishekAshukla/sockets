const app = require("express")(); // initiliazed express app

const server = require("http").createServer(app);

const io = require("socket.io")(server, {
  cors: {
    origin: "*",
  },
});

let userId = "X";
const users = [];

io.on("connection", (socket) => {
  console.log("Socket is active to be connected");

  socket.on("setup", (userData) => {
    socket.join(userData);
    console.log(`${userData} connected`);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    try {
      socket.join(room.room);
      users.push({ name: room.name, id: userId });
      socket.emit('joined successfully', userId); // emits only to the sender
      if (userId === "X") {
        userId = "O";
      } else if (userId === "O") {
        userId = "N";
      } else {
        userId = "N";
      }
      console.log("User Joined Room: " + room.room);
      console.log(users);
    } catch (err) {
      console.log("User joining failed");
    }
  });

  socket.on("typing", (data) => {
    let postitionAndId;
    users.forEach((user) => {
      if (user.name == data.name) {
        postitionAndId = { position: data.position, value: user.id };
      }
    });
    console.log(postitionAndId);
    socket.in(data.room).emit("typing", postitionAndId); // emits to all excepts the sender
  });

  socket.on("winner", (data) =>{
    socket.in(data.room).emit("winner decided", data.winnerName);
    console.log(data.winnerName+" won in "+data.room);
  })

  // socket.on("lastClick", ())

  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData);
  });
});

server.listen(5000, () => {
  console.log("Server is listening at port 5000...");
});
