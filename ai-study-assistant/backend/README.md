Backend (Node.js + Express + Prisma + JWT + socket.io)

Quick start
1) cd backend
2) npm init -y
3) npm install express cors dotenv jsonwebtoken bcrypt prisma @prisma/client multer socket.io
4) npx prisma init (schema is scaffolded in prisma/schema.prisma)
5) cp ../.env.example .env and fill values
6) node src/index.js (or set up nodemon / ts-node later)
