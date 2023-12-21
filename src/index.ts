import cors from 'cors';
import express from 'express';
import { createServer } from 'http';
import { Server, Socket } from 'socket.io';
import { ClientToServerEvents, ServerToClientEvents } from '../../typings';
import router from './router';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', router);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const connectedUser: Record<string, string> = {};

io.use((socket, next) => {
  if (socket.handshake.auth && socket.handshake.auth.token) {
    next();
  } else {
    next(new Error('Not Authorized'));
  }
});

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  // ID pengguna yang terhubung
  const senderId = socket.handshake.query.id as string | undefined;

  if (senderId !== undefined) {
    // simpan ke connectedUser
    connectedUser[senderId] = socket.id;
    console.log('Pengguna terhubung dengan ID:', senderId);
  } else {
    console.error('ID Pengirim tidak terdefinisi.');
  }

  socket.on('clientMsg', async (data) => {
    try {
      const userIdSender = socket.handshake.query.id as string 
      console.log("userIdSender",userIdSender);
      
      const userIdReceiver = data.receiverId; 
      console.log("userIdReceiver",userIdReceiver);
      

      const createMsg = await prisma.message.create({
        data:{
          content:data.content,
          senderId:userIdSender,
          receiverId:userIdReceiver,
          timestamp: new Date(),
        }
      })
      

      const recipientSocket = connectedUser[userIdReceiver];
      console.log("recipientSocketr",recipientSocket);
      
      if (recipientSocket) {
        io.to(recipientSocket).emit('serverMsg', {
          senderId: createMsg.senderId,
          receiverId: createMsg.receiverId,
          content: createMsg.content,
          timestamp: createMsg.timestamp.toISOString(),
        });

      }
      else{
        console.log("errrorororo");
        
      }
      console.log('Pesan berhasil dikirim:', createMsg);

    } catch (error) {
      console.error('Gagal membuat pesan:', error);
    }
 
  });

 
});
server.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});

//clean chace prisma
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});