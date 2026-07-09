

module.exports = (io) => {

    io.on("connection", (socket) => {

        //console.log("User Connected:", socket.id);

        socket.on("join-room", async (roomId) => {


            socket.join(roomId);

        });

        socket.on("leave-room", (roomId) => {

            socket.leave(roomId);

        });

        socket.on("send-message", async (data) => {
            socket.to(data.roomId).emit("receive-message", data);
        });

        // this event currently is useless bcz frontend is not set to show typing status ... it can be built later
        socket.on("typing", (roomId) => {

            socket.to(roomId).emit("user-typing");

        });
        
        socket.on("disconnect", () => {

            //console.log("User Disconnected");

        });

    });

};