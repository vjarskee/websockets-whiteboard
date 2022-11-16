import express, { Express } from 'express'
import { Server, createServer } from 'http'
import { join } from 'path'
import { Server as IoServer } from 'socket.io'

const app: Express = express()
const server: Server = createServer(app)
const port: number = 3000
const io: IoServer = new IoServer(server, {
  cors: { credentials: true, origin: `http://localhost:${port}` }
})

app.use('/', express.static(join(process.cwd(), 'dist', 'client')))

io.on('connection', socket => {
  console.log('a user connected', socket.id)

  const firstID: string = io.of('/').sockets.keys().next().value

  if (firstID !== socket.id) {
    io.to(firstID).emit('getData', { id: socket.id })
  }

  socket.on('setData', args => {
    io.to(args.id).emit('changeColor', args.color)
    io.to(args.id).emit('changeThickness', args.thickness)
    io.to(args.id).emit('setImage', args.image)
  })

  socket.on('startDrawing', args => {
    socket.broadcast.emit('startDrawing', args)
  })

  socket.on('draw', args => {
    socket.broadcast.emit('draw', args)
  })

  socket.on('stopDrawing', args => {
    socket.broadcast.emit('stopDrawing', args)
  })

  socket.on('clear', args => {
    socket.broadcast.emit('clear', args)
  })

  socket.on('changeColor', args => {
    socket.broadcast.emit('changeColor', args)
  })

  socket.on('changeThickness', args => {
    socket.broadcast.emit('changeThickness', args)
  })
})

server.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
