import cors from "cors";
import express, { query } from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ServerToClientEvents } from "../../typings";
import router from "./router";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", router);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.use((socket, next) => {
  if (socket.handshake.auth && socket.handshake.auth.token) {
    next();
  } else {
    next(new Error("Not Authorized"));
  }
});

const connectedUsers: Record<string, string> = {};

io.on("connection", (socket: Socket) => {
  const senderId = socket.handshake.query.id as string | undefined;
  console.log("senderId:", senderId);

  // save user connected if login uccses
  if (senderId !== undefined) {
    connectedUsers[senderId] = socket.id;
  }

  io.sockets.emit("user_connected", { clientId: socket.id });

  socket.on("clientMsg", async (data) => {
    console.log("clientMsg:", data);
    try {
      if(data.receiverId){
       await prisma.message.create({
        data: {
          content: data.content,
          senderId: data.senderId,
          receiverId: data.receiverId,
        },
      });

      const recipientSocket = connectedUsers[data.receiverId];
      console.log("recipientSocketr", recipientSocket);

      // get message from mongo
      const getLatestMessage = async (senderId: string, receiverId: string) => {
        return await prisma.message.findFirst({
          where: {
            AND: [{ senderId: senderId }, { receiverId: receiverId }],
          },
          orderBy: {
            timestamp: "desc",
          },
        });
      };

      // get new message
      const latestMessage = await getLatestMessage(
        data.senderId,
        data.receiverId,
      );
      console.log("latestMessage",latestMessage);
      
        // send new message to client
        if (latestMessage) {
          socket.join(recipientSocket);
          io.to(recipientSocket).emit("serverMsg", {
            senderId: latestMessage.senderId,
            receiverId: latestMessage.receiverId,
            content: latestMessage.content,
            timestamp: latestMessage.timestamp.toISOString(),
          });
       
          console.log('Pesan terkini berhasil dikirim ke klien:', latestMessage);
        }

        } else {
        io.sockets.emit("serverMsg", data);
      }
    } catch (error) {
      console.log(error);
    }
  });
});

server.listen(3000, () => {
  console.log("Server berjalan di http://localhost:3000");
});
