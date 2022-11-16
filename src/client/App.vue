<template>
  <div class="whiteboard">
    <canvas width="1000" height="600" ref="canvas" />
    <div class="whiteboard__toolbar">
      <button class="whiteboard__toolbar--clearbtn" @click="clear">Очистить</button>
      <div class="whiteboard__toolbar--colors">
        <div
          v-for="(item, key) in colors"
          :key="key"
          :style="{ backgroundColor: item }"
          :class="{ selected: this.color === item }"
          @click="changeColor(item)"
        />
      </div>
      <div class="whiteboard__toolbar--thickness">
        <div
          v-for="item in thicknessList"
          :key="item"
          :style="{ width: item + 'px', height: item + 'px' }"
          :class="{ selected: this.thickness === item }"
          @click="changeThickness(item)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import colors from './assets/colors'
import thicknessList from './assets/thickness'
import { io } from 'socket.io-client'

export default {
  data: () => ({
    colors,
    thicknessList,
    context: null,
    isDrawing: false,
    color: 'black',
    thickness: 5,
    socket: null
  }),

  mounted() {
    const context = this.$refs.canvas.getContext('2d')
    this.context = context

    this.context.strokeStyle = this.color
    this.context.lineWidth = this.thickness

    this.$refs.canvas.onmousedown = this.startDrawing
    this.$refs.canvas.onmouseup = this.stopDrawing
    this.$refs.canvas.onmouseout = this.stopDrawing
    this.$refs.canvas.onmousemove = this.draw

    const socket = io('/')
    this.socket = socket

    this.socket.on('getData', args => {
      socket.emit('setData', {
        id: args.id,
        color: this.color,
        thickness: this.thickness,
        image: this.$refs.canvas.toDataURL('image/webp', 0.5)
      })
    })

    this.socket.on('startDrawing', this.startDrawingBySocket)
    this.socket.on('draw', this.drawBySocket)
    this.socket.on('stopDrawing', this.stopDrawingBySocket)
    this.socket.on('clear', this.clearBySocket)
    this.socket.on('changeColor', this.changeColorBySocket)
    this.socket.on('changeThickness', this.changeThicknessBySocket)
    this.socket.on('setImage', this.setImage)
  },

  methods: {
    startDrawing() {
      this.isDrawing = true
      this.context.beginPath()
      this.socket.emit('startDrawing')
    },

    startDrawingBySocket() {
      this.context.beginPath()
    },

    draw(event) {
      if (this.isDrawing) {
        const x = event.pageX - this.$refs.canvas.offsetLeft
        const y = event.pageY - this.$refs.canvas.offsetTop
        this.context.lineTo(x, y)
        this.context.stroke()
        this.socket.emit('draw', { x, y })
      }
    },

    drawBySocket({ x, y }) {
      this.context.lineTo(x, y)
      this.context.stroke()
    },

    stopDrawing() {
      this.isDrawing = false
      this.context.closePath()
      this.socket.emit('stopDrawing')
    },

    stopDrawingBySocket() {
      this.context.closePath()
    },

    clear() {
      this.context.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height)
      this.socket.emit('clear')
    },

    clearBySocket() {
      this.context.clearRect(0, 0, this.$refs.canvas.width, this.$refs.canvas.height)
    },

    changeColor(color) {
      this.color = color
      this.context.strokeStyle = color
      this.socket.emit('changeColor', color)
    },

    changeColorBySocket(color) {
      this.color = color
      this.context.strokeStyle = color
    },

    changeThickness(thickness) {
      this.thickness = thickness
      this.context.lineWidth = thickness
      this.socket.emit('changeThickness', thickness)
    },

    changeThicknessBySocket(thickness) {
      this.thickness = thickness
      this.context.lineWidth = thickness
    },

    setImage(imageSrc) {
      const image = new Image()
      image.onload = () => {
        this.context.drawImage(image, 0, 0)
      }
      image.src = imageSrc
    }
  }
}
</script>