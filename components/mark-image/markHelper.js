let gRate = {
  num: 1
}

const gNum = (num) => {
  return gRate.num * num
}
const gRound = (num) => {
  return Math.round(gRate.num * num)
}

const deepCopyArray = (pArr) => {
  if (!pArr || pArr.length < 1) return pArr
  let newArr = []
  pArr.forEach(item => {
    newArr.push(clone(item))
  })
  return newArr
}
const clone = (obj) => {
  return Object.create(
    Object.getPrototypeOf(obj),
    Object.getOwnPropertyDescriptors(obj)
  )
}

/**
 * base Class
 */
class Node {
  constructor() {
    this.selected = false
    this.margin = gNum(2)
    this.status = '' // resize,move,or else 
    // console.log({ gRate })
    this.corners = []
    this.cornerRadius = gRound(10) //radius
    this.rate = 1
    this.minSize = gNum(8)
  }

  touchstart(x, y, e) {
    this.selected = true
    this.handle = this.getHandle(x, y)
    this.lastX = x
    this.lastY = y
    this.lastNode = {
      x: this.x,
      y: this.y
    }
  }
  touchmove(x, y, e) {
    if (this.handle) {
      this.resize(x, y)
    } else {
      this.move(x, y)
    }
  }
  move(x, y) {
    this.status = 'move'
    this.x = x - this.lastX + this.lastNode.x
    this.y = y - this.lastY + this.lastNode.y

  }
  resize(x, y) {
    this.status = 'resize'
  }
  touchend(e) {

  }
  bolDotInside(x, y) {
    let {
      left,
      top,
      right,
      bottom
    } = this.getBoundary()
    if (left - this.cornerRadius <= x && top - this.cornerRadius <= y && right + this.cornerRadius >= x && bottom + this.cornerRadius >= y) {
      return true
    }

    return false
  }
  getBoundary() {
    let left = Math.min(this.x, this.x + this.width)
    let top = Math.min(this.y, this.y + this.height)
    let right = Math.max(this.x, this.x + this.width)
    let bottom = Math.max(this.y, this.y + this.height)

    // console.log({ left, top, right, bottom })
    return {
      left,
      top,
      right,
      bottom
    }
  }
  getCorners(left, top, right, bottom) {
    let tmpR = this.cornerRadius
    let tmpArr = []
    let itemLeftTop = {
      id: 'leftTop',
      left: left - tmpR,
      top: top - tmpR,
      right: left + tmpR,
      bottom: top + tmpR
    }
    tmpArr.push(itemLeftTop)

    let itemLeftBottom = {
      id: 'leftBottom',
      left: left - tmpR,
      top: bottom - tmpR,
      right: left + tmpR,
      bottom: bottom + tmpR
    }
    tmpArr.push(itemLeftBottom)

    let itemRightBottom = {
      id: 'rightBottom',
      left: right - tmpR,
      top: bottom - tmpR,
      right: right + tmpR,
      bottom: bottom + tmpR
    }
    tmpArr.push(itemRightBottom)

    let itemRightTop = {
      id: 'rightTop',
      left: right - tmpR,
      top: top - tmpR,
      right: right + tmpR,
      bottom: top + tmpR
    }
    tmpArr.push(itemRightTop)

    this.corners = tmpArr

    return tmpArr
  }
  getDefaultHandle() {
    let tmpItem = this.corners.find(item => {
      return item.id == 'rightBottom'
    })
    return tmpItem
  }
  getHandles() {
    return []
  }
  getHandle(x, y) {
    //TODO 是否激活后才能resize?
    // if (this.selected == false) return null

    let tmpArr = this.getHandles()
    // console.log(tmpArr)
    for (let i = 0; i < tmpArr.length; i++) {
      let curH = tmpArr[i]
      if (x >= curH.left && y >= curH.top && y <= curH.bottom && x <= curH.right) {
        return curH
      }
    }

    return null
  }
  drawHandle(ctx) {
    if (!this.selected) return

    let {
      left,
      top,
      right,
      bottom
    } = this.getBoundary()
    let width = right - left
    let height = bottom - top

    ctx.save()
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = gRound(1)
    let r = this.cornerRadius
    //框
    ctx.beginPath()
    ctx.rect(left, top, width, height)
    ctx.stroke()

    //4 corners
    //left-top
    ctx.beginPath()
    ctx.arc(left, top, r, 0, Math.PI * 2)
    ctx.fill()

    //left-bottom
    ctx.beginPath()
    ctx.arc(left, bottom, r, 0, Math.PI * 2)
    ctx.fill()

    //right-bottom
    ctx.beginPath()
    ctx.arc(right, bottom, r, 0, Math.PI * 2)
    ctx.fill()

    //right-top
    ctx.beginPath()
    ctx.arc(right, top, r, 0, Math.PI * 2)
    ctx.fill()

    //top
    ctx.beginPath()
    ctx.arc(left + width / 2, top, r, 0, Math.PI * 2)
    ctx.fill()
    //right
    ctx.beginPath()
    ctx.arc(right, top + height / 2, r, 0, Math.PI * 2)
    ctx.fill()
    //bottom
    ctx.beginPath()
    ctx.arc(left + width / 2, bottom, r, 0, Math.PI * 2)
    ctx.fill()

    //left 
    ctx.beginPath()
    ctx.arc(left, top + height / 2, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
}

//line
class Line extends Node {
  constructor(x, y, width, height, color = 'red', angle = 0) {
    super()
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color
    this.cx = x
    this.cy = y
    this.angle = angle
  }
  touchstart(x, y, e) {
    super.touchstart(x, y, e)
    if (this.handle) {
      if (this.handle.id == 'left') {
        let tmpX = this.x + this.width
        let tmpY = this.y

        let center = this.rotate(tmpX, tmpY, this.angle, this.x, this.y)

        this.startAngle = Math.atan2(center.y - y, center.x - x) * 180 / Math.PI
        this.lastCenter = center

        this.lastDist = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2))

      } else {

        this.lastDist = Math.sqrt(Math.pow(x - this.cx, 2) + Math.pow(y - this.cy, 2))

        this.startAngle = Math.atan2(y - this.cy, x - this.cx) * 180 / Math.PI
      }
    }

    this.lastNode = {
      x: this.x,
      y: this.y,
      cx: this.cx,
      cy: this.cy,
      width: this.width,
      height: this.height,
      angle: this.angle
    }

  }
  touchmove(x, y, e) {
    super.touchmove(x, y, e)
  }
  touchend(e) {
    super.touchend(e)
  }
  move(x, y) {
    super.move(x, y)
    this.cx = this.x
    this.cy = this.y
  }
  resize(x, y) {
    super.resize(x, y)

    if (this.handle.id == 'right') {
      let curDist = Math.sqrt(Math.pow(x - this.lastNode.cx, 2) + Math.pow(y - this.lastNode.cy, 2))
      this.width = curDist - this.lastDist + this.lastNode.width

      let angle = Math.atan2(y - this.lastNode.cy, x - this.lastNode.cx) * 180 / Math.PI;
      angle = angle - this.startAngle + this.lastNode.angle
      // angle = this.lastNode.angle + angle
      angle = Math.round(angle * 100) / 100
      this.angle = angle
    } else { //left

      let curDist = Math.sqrt(Math.pow(x - this.lastCenter.x, 2) + Math.pow(y - this.lastCenter.y, 2))
      this.width = curDist - this.lastDist + this.lastNode.width
      this.x = x - this.lastX + this.lastNode.x
      this.y = y - this.lastY + this.lastNode.y
      this.cx = this.x
      this.cy = this.y

      let angle = Math.atan2(this.lastCenter.y - this.y, this.lastCenter.x - this.x) * 180 / Math.PI;

      angle = Math.round(angle * 100) / 100
      this.angle = angle

    }
  }

  getBoundary() {
    let left = this.x
    let top = this.y - this.height / 2 //- this.fontSize
    let right = this.x + this.width
    let bottom = this.y + this.height / 2

    return {
      left,
      top,
      right,
      bottom
    }
  }
  bolDotInside(px, py) {

    let {
      x,
      y
    } = this.trans(px, py)

    let res = this.rotate(x, y, -this.angle)
    let newX = this.cx + res.x
    let newY = this.cy + res.y
    // newY -= this.height / 2
    return super.bolDotInside(newX, newY)
  }

  trans(px, py) {
    return {
      x: px - this.cx,
      y: py - this.cy
    }
  }
  /** 
   * 旋转后点的坐标
    二维空间中，给定一个点与一个角度，求其绕另一个点旋转后的坐标。
    公式如下，（x1，y1）为要转的点，（x2,y2）为中心点，
    x=(x1-x2)cosθ-(y1-y2)sinθ+x2
    y=(y1-y2)cosθ+(x1-x2)sinθ+y2
  */
  rotate(px, py, angle, cx = 0, cy = 0) {
    let x = px //- this.x
    let y = py //- this.y
    let theta = angle * Math.PI / 180
    let res = {}
    res.x = (x - cx) * Math.cos(theta) - (y - cy) * Math.sin(theta) + cx;
    res.y = (y - cy) * Math.cos(theta) + (x - cx) * Math.sin(theta) + cy;

    return res
  }
  getHandles() {
    let tmpR = this.cornerRadius
    let {
      left,
      top,
      right,
      bottom
    } = this.getBoundary()
    let tmpArr = []
    let itemLeft = {
      id: 'left',
      left: left - tmpR,
      top: this.y - tmpR,
      right: left + tmpR,
      bottom
    }
    tmpArr.push(itemLeft)

    let itemRight = {
      id: 'right',
      left: right - tmpR,
      top: this.y - tmpR,
      right: right + tmpR,
      bottom
    }
    tmpArr.push(itemRight)

    this.corners = tmpArr
    return tmpArr
  }
  getDefaultHandle() {
    let tmpItem = this.corners.find(item => {
      return item.id == 'right'
    })
    return tmpItem
  }
  getHandle(px, py) {
    let {
      x,
      y
    } = this.trans(px, py)
    let res = this.rotate(x, y, -this.angle)
    let newX = this.cx + res.x
    let newY = this.cy + res.y
    return super.getHandle(newX, newY)
  }
  drawHandle(ctx, rtX, rtY) {
    if (!this.selected) return


    let left = rtX
    let right = rtX + this.width
    let r = this.cornerRadius
    ctx.save()

    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'

    //right
    ctx.beginPath()
    ctx.arc(right, rtY, r, 0, Math.PI * 2)
    ctx.fill()

    //left 
    ctx.beginPath()
    ctx.arc(left, rtY, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
  render(ctx) {
    let rtX = this.x - this.cx //相对坐标x
    let rtY = this.y - this.cy //相对坐标y
    // console.log({ rtX, rtY })
    let x1 = rtX
    let x2 = rtX + this.width
    let y1 = rtY - this.height / 2
    let y2 = rtY + this.height / 2
    let arrowW = this.height / 2
    // let arrowH = arrowW
    let margin = arrowW / 4


    ctx.save()
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color

    ctx.translate(this.cx, this.cy)
    ctx.rotate(this.angle * Math.PI / 180)

    ctx.beginPath()

    //1
    // ctx.moveTo(x1, y1)
    // ctx.lineTo(x1, y2)

    //2
    // ctx.moveTo(x2, y1)
    // ctx.lineTo(x2, y2)
    //3
    ctx.moveTo(x1 + margin, rtY)
    ctx.lineTo(x2 - margin, rtY)
    //4
    // ctx.moveTo(x1 + margin * 3, rtY - margin)
    // ctx.lineTo(x1 + margin, rtY)
    // ctx.lineTo(x1 + margin * 3, rtY + margin)

    //5 
    // ctx.moveTo(x2 - margin * 3, rtY - margin)
    // ctx.lineTo(x2 - margin, rtY)
    // ctx.lineTo(x2 - margin * 3, rtY + margin)
    ctx.stroke()

    this.drawHandle(ctx, rtX, rtY)
    ctx.restore()

  }
}

//arrow
class Arrow extends Line {
  constructor(x, y, width, height, color, angle) {
    super(x, y, width, height, color, angle)
  }
  render(ctx) {
    let rtX = this.x - this.cx //相对坐标x
    let rtY = this.y - this.cy //相对坐标y
    // console.log({ rtX, rtY })
    let x1 = rtX
    let x2 = rtX + this.width

    // let arrowW = this.height / 2
    // // let arrowH = arrowW
    // let margin = arrowW / 4

    ctx.save()
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color
    ctx.lineWidth = 0
    ctx.translate(this.cx, this.cy)
    ctx.rotate(this.angle * Math.PI / 180)

    ctx.beginPath()

    //p1
    ctx.moveTo(x1, rtY)
    //p2
    ctx.lineTo(x2 - this.height, rtY - this.height / 4)
    //p3
    ctx.lineTo(x2 - this.height, rtY - this.height / 2)

    //p4
    ctx.lineTo(x2, rtY)
    //p5
    ctx.lineTo(x2 - this.height, rtY + this.height / 2)
    //p6
    ctx.lineTo(x2 - this.height, rtY + this.height / 4)

    //p7
    ctx.lineTo(x1, rtY)
    // ctx.moveTo(x2 - margin * 3, rtY - margin)
    // ctx.lineTo(x2 - margin, rtY)
    // ctx.lineTo(x2 - margin * 3, rtY + margin)
    ctx.fill()

    this.drawHandle(ctx, rtX, rtY)
    ctx.restore()

  }
}

//curve
class Curve extends Node {
  constructor(color = 'red') {
    super()
    this.color = color
    this.ponits = []
  }
  touchstart(x, y, e) {
    this.ponits.push({
      x,
      y
    })
  }
  touchmove(x, y, e) {
    this.ponits.push({
      x,
      y
    })
  }
  touchend(e) {

  }
  getDefaultHandle() {

  }
  render(ctx) {
    if (this.ponits.length < 2) return
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color
    // ctx.lineWidth = gRound(2)
    ctx.beginPath()
    let p1 = this.ponits[0]
    let p2
    let cx, cy
    ctx.moveTo(p1.x, p1.y)
    for (let i = 1; i < this.ponits.length; i++) {
      p2 = this.ponits[i]
      cx = (p1.x + p2.x) / 2
      cy = (p1.y + p2.y) / 2
      ctx.quadraticCurveTo(p1.x, p1.y, cx, cy)
      p1 = {
        ...p2
      }
    }
    ctx.quadraticCurveTo(cx, cy, p2.x, p2.y)
    ctx.stroke()
  }
}

/**
 * Rect:矩形
 */
class Rect extends Node {
  constructor(x, y, width, height, color = 'red') {
    super()
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.color = color
  }
  touchstart(x, y, e) {
    super.touchstart(x, y, e)

    this.lastNode = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }

  }
  touchmove(x, y, e) {
    super.touchmove(x, y, e)
  }
  touchend(e) {
    super.touchend(e)
  }
  move(x, y) {
    super.move(x, y)
  }
  resize(x, y) {
    super.resize(x, y)
    let tmpDistX = x - this.lastX
    let tmpDistY = y - this.lastY
    let tmpId = this.handle.id

    // console.log(tmpId)
    let tmpX = this.lastNode.x
    let tmpY = this.lastNode.y
    let tmpW = this.lastNode.width
    let tmpH = this.lastNode.height

    if (tmpId == 'right') {
      tmpW = this.lastNode.width + tmpDistX
    } else if (tmpId == 'left') {
      tmpW = this.lastNode.width - tmpDistX
      tmpX = this.lastNode.x + tmpDistX
    } else if (tmpId == 'bottom') {
      tmpH = this.lastNode.height + tmpDistY
    } else if (tmpId == 'top') {
      tmpH = this.lastNode.height - tmpDistY
      tmpY = this.lastNode.y + tmpDistY
    } else if (tmpId == 'leftTop') {
      tmpW = this.lastNode.width - tmpDistX
      tmpX = this.lastNode.x + tmpDistX
      tmpH = this.lastNode.height - tmpDistY
      tmpY = this.lastNode.y + tmpDistY
    } else if (tmpId == 'leftBottom') {
      tmpW = this.lastNode.width - tmpDistX
      tmpX = this.lastNode.x + tmpDistX
      tmpH = this.lastNode.height + tmpDistY

    } else if (tmpId == 'rightBottom') {
      tmpW = this.lastNode.width + tmpDistX
      tmpH = this.lastNode.height + tmpDistY
    } else if (tmpId == 'rightTop') {
      tmpW = this.lastNode.width + tmpDistX
      tmpH = this.lastNode.height - tmpDistY
      tmpY = this.lastNode.y + tmpDistY
    }

    if (Math.abs(tmpW) < this.minSize || Math.abs(tmpH) < this.minSize) {
      return
    }

    this.x = tmpW < 0 ? tmpX + tmpW : tmpX
    this.width = Math.abs(tmpW)

    this.y = tmpH < 0 ? tmpY + tmpH : tmpY
    this.height = Math.abs(tmpH)

  }
  getHandles() {
    let tmpR = this.cornerRadius
    let {
      left,
      top,
      right,
      bottom
    } = this.getBoundary()
    let width = right - left
    let height = bottom - top
    let tmpArr = []
    let itemLeft = {
      id: 'left',
      left: left - tmpR,
      top: top + height / 3,
      right: left + tmpR,
      bottom: top + height * 2 / 3
    }
    tmpArr.push(itemLeft)

    let itemRight = {
      id: 'right',
      left: right - tmpR,
      top: itemLeft.top,
      right: right + tmpR,
      bottom: itemLeft.bottom
    }
    tmpArr.push(itemRight)

    let itemTop = {
      id: 'top',
      left: left + width / 3,
      top: top - tmpR,
      right: left + width * 2 / 3,
      bottom: top + tmpR
    }
    tmpArr.push(itemTop)

    let itemBottom = {
      id: 'bottom',
      left: left + width / 3,
      top: bottom - tmpR,
      right: left + width * 2 / 3,
      bottom: bottom + tmpR
    }
    tmpArr.push(itemBottom)

    let corners = this.getCorners(left, top, right, bottom)
    tmpArr.push(...corners)


    return tmpArr
  }

  render(ctx) {
    ctx.save()
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.rect(this.x, this.y, this.width, this.height)
    ctx.stroke()
    ctx.restore()

    this.drawHandle(ctx)
  }
}

/**
 *圆或椭圆
 */
class Ellipse extends Rect {
  constructor(x, y, width, height, color = 'red') {
    super(x, y, width, height, color)
  }

  render(ctx) {
    let cx = this.x + this.width / 2;
    let cy = this.y + this.height / 2;
    ctx.save()
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.ellipse(cx, cy, this.width / 2, this.height / 2, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()

    this.drawHandle(ctx)
  }
}

/**
 * text:文字
 */
class Text extends Node {
  constructor(content, x, y, width, height, fontSize, color = 'red', ctx) {
    super()
    this.content = content
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.fontSize = fontSize
    this.color = color
    this.ctx = ctx
    this.setFontSize()
  }
  touchstart(x, y, e) {
    super.touchstart(x, y, e)

    this.lastNode = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    }

  }
  touchmove(x, y, e) {
    super.touchmove(x, y, e)
  }
  touchend(e) {
    super.touchend(e)
  }
  move(x, y) {
    super.move(x, y)
  }
  resize(x, y) {
    super.resize(x, y)
    let tmpDistX = x - this.lastX
    let tmpDistY = y - this.lastY
    let tmpId = this.handle.id

    // console.log(tmpId)
    let tmpX = this.lastNode.x
    let tmpY = this.lastNode.y
    let tmpW = this.lastNode.width
    let tmpH = this.lastNode.height

    if (tmpId == 'right') {
      tmpW = this.lastNode.width + tmpDistX
    } else if (tmpId == 'left') {
      tmpW = this.lastNode.width - tmpDistX
      tmpX = this.lastNode.x + tmpDistX
    } else if (tmpId == 'bottom') {
      tmpH = this.lastNode.height + tmpDistY
    } else if (tmpId == 'top') {
      tmpH = this.lastNode.height - tmpDistY
      tmpY = this.lastNode.y + tmpDistY
    } else if (tmpId == 'leftTop') {
      tmpW = this.lastNode.width - tmpDistX
      tmpX = this.lastNode.x + tmpDistX
      tmpH = this.lastNode.height - tmpDistY
      tmpY = this.lastNode.y + tmpDistY
    } else if (tmpId == 'leftBottom') {
      tmpW = this.lastNode.width - tmpDistX
      tmpX = this.lastNode.x + tmpDistX
      tmpH = this.lastNode.height + tmpDistY

    } else if (tmpId == 'rightBottom') {
      tmpW = this.lastNode.width + tmpDistX
      tmpH = this.lastNode.height + tmpDistY
    } else if (tmpId == 'rightTop') {
      tmpW = this.lastNode.width + tmpDistX
      tmpH = this.lastNode.height - tmpDistY
      tmpY = this.lastNode.y + tmpDistY
    }
    if (tmpW < this.minSize || tmpH < this.minSize) {
      return
    }

    this.x = tmpW < 0 ? tmpX + tmpW : tmpX
    this.width = Math.abs(tmpW)

    this.y = tmpH < 0 ? tmpY + tmpH : tmpY
    this.height = Math.abs(tmpH)
    this.setFontSize()
  }
  setFontSize() {
    let tmpArr = this.content.split(/[\n,]/g)
    let lineHeight = parseInt(this.height / tmpArr.length)
    this.fontSize = lineHeight
    this.setTxtWidth()
  }
  setContent(content) {
    this.content = content
    this.setTxtWidth()
  }
  setTxtWidth() {
    this.ctx.font = '' + this.fontSize + 'px Arial'
    let tmpArr = this.content.split(/[\n,]/g)
    let tmpWidth = 0
    tmpArr.forEach(item => {
      let tmpW = this.ctx.measureText(item).width
      if (tmpW > tmpWidth) {
        tmpWidth = tmpW
      }
    })
    this.width = tmpWidth

  }
  getBoundary() {
    let left = this.x
    let top = this.y - this.fontSize / 2
    let right = left + this.width
    let bottom = top + this.height

    return {
      left,
      top,
      right,
      bottom
    }
  }
  getHandles() {

    let {
      left,
      top,
      right,
      bottom
    } = this.getBoundary()

    let tmpArr = []
    let corners = this.getCorners(left, top, right, bottom)
    let tmpItem = corners.find(item => {
      return item.id == 'rightBottom'
    })
    if (tmpItem) {
      tmpArr.push(tmpItem)
    }

    return tmpArr
  }
  drawHandle(ctx) {
    if (!this.selected) return

    let {
      left,
      top,
      right,
      bottom
    } = this.getBoundary()
    let width = right - left
    let height = bottom - top

    ctx.save()
    ctx.strokeStyle = 'rgba(0,0,0,0.6)'
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = gRound(1)
    let r = this.cornerRadius
    //框
    ctx.beginPath()
    ctx.rect(left, top, width, height)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(right, bottom, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  render(ctx) {
    if (!this.content) return

    let tmpArr = this.content.split(/[\n,]/g)
    let lineHeight = parseInt(this.height / tmpArr.length)

    ctx.save()
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color
    ctx.font = '' + this.fontSize + 'px Arial'
    ctx.textBaseline = 'middle'
    // ctx.fillRect(this.x,this.y,this.width,this.height)
    ctx.textAlign = 'left'
    tmpArr.forEach((txt, i) => {
      let tmpY = this.y + i * lineHeight
      ctx.fillText(txt, this.x, tmpY)
    })
    ctx.restore()

    this.drawHandle(ctx)
  }
}

/**
 * order:标号
 */
class Order extends Node {
  constructor(x, y, r, no, content, ctx, color = 'red') {
    super()
    this.x = x
    this.y = y
    this.r = r
    this.no = no
    this.content = content
    this.ctx = ctx
    this.color = color

    this.setFontSize()
  }
  touchstart(x, y, e) {
    super.touchstart(x, y, e)
    this.lastNode = {
      x: this.x,
      y: this.y,
      r: this.r
    }
    this.lastDist = y - this.y
  }
  touchmove(x, y, e) {
    super.touchmove(x, y, e)
  }
  touchend(e) {
    super.touchend(e)
  }
  move(x, y) {
    // console.log('move')
    super.move(x, y)
  }
  resize(x, y) {
    // super.move(x, y)
    // return
    // console.log('resize')
    // console.log(this.handle)
    super.resize(x, y)
    let curDist = y - this.lastNode.y
    let tmpDist = (curDist - this.lastDist) / 2

    let tmpR = this.r
    let tmpX
    let tmpY
    if (this.handle.id == 'leftTop') {
      tmpR = this.lastNode.r + tmpDist
      tmpX = this.lastNode.x + this.lastNode.r - tmpR
      tmpY = this.lastNode.y + this.lastNode.r - tmpR
    } else if (this.handle.id == 'leftBottom') {
      tmpR = this.lastNode.r + tmpDist
      tmpX = this.lastNode.x + this.lastNode.r - tmpR
      tmpY = this.lastNode.y - this.lastNode.r + tmpR
    } else if (this.handle.id == 'rightBottom') {
      tmpR = this.lastNode.r + tmpDist
      tmpX = this.lastNode.x - this.lastNode.r + tmpR
      tmpY = this.lastNode.y - this.lastNode.r + tmpR
    } else if (this.handle.id == 'rightTop') {
      tmpR = this.lastNode.r + tmpDist
      tmpX = this.lastNode.x - this.lastNode.r + tmpR
      tmpY = this.lastNode.y + this.lastNode.r - tmpR
    }

    if (tmpR * 2 < this.minSize) return

    this.r = tmpR
    this.x = tmpX
    this.y = tmpY

    this.setFontSize()

  }
  setFontSize() {
    this.fontSize = this.r * 2 - this.margin
    this.setTxtWidth()
  }
  setContent(content) {
    this.content = content
    this.setTxtWidth()
  }
  setTxtWidth() {
    this.ctx.font = '' + this.fontSize + 'px Arial'
    this.txtWidth = this.ctx.measureText(this.content).width
  }
  getBoundary() {
    let left = this.x - this.r
    let top = this.y - this.r
    let right = this.x + this.r + this.txtWidth
    let bottom = this.y + this.r

    return {
      left,
      top,
      right,
      bottom
    }
  }

  getHandles() {
    let {
      left,
      top,
      right,
      bottom
    } = this.getBoundary()

    let tmpArr = []
    let corners = this.getCorners(left, top, right, bottom)
    let tmpItem = corners.find(item => {
      return item.id == 'rightBottom'
    })
    if (tmpItem) {
      tmpArr.push(tmpItem)
    }
    return tmpArr
  }
  drawHandle(ctx) {
    if (!this.selected) return

    let {
      left,
      top,
      right,
      bottom
    } = this.getBoundary()
    let width = right - left
    let height = bottom - top

    ctx.save()
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.lineWidth = gRound(1)
    let r = this.cornerRadius
    //框
    ctx.beginPath()
    ctx.rect(left, top, width, height)
    ctx.stroke()

    ctx.beginPath()
    ctx.arc(right, bottom, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  render(ctx) {
    ctx.save()
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2)
    ctx.fill()

    ctx.font = '' + this.fontSize + 'px Arial'
    ctx.fillStyle = '#fff'
    ctx.textBaseline = 'middle'
    ctx.fillText(this.no, this.x, this.y)

    ctx.textAlign = 'left'

    ctx.fillStyle = this.color
    ctx.fillText(this.content, this.x + this.r, this.y)
    ctx.restore()

    this.drawHandle(ctx)
  }
}

//标尺
class Ruler extends Node {
  constructor(x, y, width, height, content, fontSize, color = 'red', angle = 0) {
    super()
    this.x = x
    this.y = y
    this.width = width
    this.height = height
    this.content = content
    this.fontSize = fontSize
    this.color = color

    this.cx = x
    this.cy = y
    this.angle = angle
    this.rate = 1
    // this.margin = 0
  }
  touchstart(x, y, e) {
    super.touchstart(x, y, e)
    if (this.handle) {
      if (this.handle.id == 'left') {
        let tmpX = this.x + this.width
        let tmpY = this.y

        let center = this.rotate(tmpX, tmpY, this.angle, this.x, this.y)

        this.startAngle = Math.atan2(center.y - y, center.x - x) * 180 / Math.PI
        this.lastCenter = center

        this.lastDist = Math.sqrt(Math.pow(x - center.x, 2) + Math.pow(y - center.y, 2))

      } else {

        this.lastDist = Math.sqrt(Math.pow(x - this.cx, 2) + Math.pow(y - this.cy, 2))

        this.startAngle = Math.atan2(y - this.cy, x - this.cx) * 180 / Math.PI
      }
    }

    this.lastNode = {
      x: this.x,
      y: this.y,
      cx: this.cx,
      cy: this.cy,
      width: this.width,
      height: this.height,
      angle: this.angle
    }

  }
  touchmove(x, y, e) {
    super.touchmove(x, y, e)
  }
  touchend(e) {
    super.touchend(e)
  }
  move(x, y) {
    super.move(x, y)
    this.cx = this.x
    this.cy = this.y
  }
  resize(x, y) {
    super.resize(x, y)

    // let angle = this.angle
    // let width 
    // let x = this.x
    // let y = this.y
    if (this.handle.id == 'right') {
      let curDist = Math.sqrt(Math.pow(x - this.lastNode.cx, 2) + Math.pow(y - this.lastNode.cy, 2))
      this.width = curDist - this.lastDist + this.lastNode.width

      let angle = Math.atan2(y - this.lastNode.cy, x - this.lastNode.cx) * 180 / Math.PI;
      angle = angle - this.startAngle + this.lastNode.angle
      // angle = this.lastNode.angle + angle
      angle = Math.round(angle * 100) / 100
      this.angle = angle
    } else { //left

      let curDist = Math.sqrt(Math.pow(x - this.lastCenter.x, 2) + Math.pow(y - this.lastCenter.y, 2))
      this.width = curDist - this.lastDist + this.lastNode.width
      this.x = x - this.lastX + this.lastNode.x
      this.y = y - this.lastY + this.lastNode.y
      this.cx = this.x
      this.cy = this.y

      let angle = Math.atan2(this.lastCenter.y - this.y, this.lastCenter.x - this.x) * 180 / Math.PI;

      angle = Math.round(angle * 100) / 100
      this.angle = angle

    }

  }

  getBoundary() {
    let left = this.x
    let top = this.y - this.height / 2 //- this.fontSize
    let right = this.x + this.width
    let bottom = this.y + this.height / 2

    return {
      left,
      top,
      right,
      bottom
    }
  }
  bolDotInside(px, py) {

    let {
      x,
      y
    } = this.trans(px, py)

    let res = this.rotate(x, y, -this.angle)
    let newX = this.cx + res.x
    let newY = this.cy + res.y
    // newY -= this.height / 2
    return super.bolDotInside(newX, newY)
  }

  trans(px, py) {
    return {
      x: px - this.cx,
      y: py - this.cy
    }
  }
  /** 
   * 旋转后点的坐标
    二维空间中，给定一个点与一个角度，求其绕另一个点旋转后的坐标。
    公式如下，（x1，y1）为要转的点，（x2,y2）为中心点，
    x=(x1-x2)cosθ-(y1-y2)sinθ+x2
    y=(y1-y2)cosθ+(x1-x2)sinθ+y2
  */
  rotate(px, py, angle, cx = 0, cy = 0) {
    let x = px //- this.x
    let y = py //- this.y
    let theta = angle * Math.PI / 180
    let res = {}
    res.x = (x - cx) * Math.cos(theta) - (y - cy) * Math.sin(theta) + cx;
    res.y = (y - cy) * Math.cos(theta) + (x - cx) * Math.sin(theta) + cy;

    return res
  }
  getHandles() {
    let tmpR = this.cornerRadius
    let {
      left,
      top,
      right,
      bottom
    } = this.getBoundary()
    let tmpArr = []
    let itemLeft = {
      id: 'left',
      left: left - tmpR,
      top: this.y - tmpR,
      right: left + tmpR,
      bottom
    }
    tmpArr.push(itemLeft)

    let itemRight = {
      id: 'right',
      left: right - tmpR,
      top: this.y - tmpR,
      right: right + tmpR,
      bottom
    }
    tmpArr.push(itemRight)

    this.corners = tmpArr
    return tmpArr
  }
  getDefaultHandle() {
    let tmpItem = this.corners.find(item => {
      return item.id == 'right'
    })
    return tmpItem
  }
  getHandle(px, py) {
    let {
      x,
      y
    } = this.trans(px, py)
    let res = this.rotate(x, y, -this.angle)
    let newX = this.cx + res.x
    let newY = this.cy + res.y
    return super.getHandle(newX, newY)
  }
  drawHandle(ctx, rtX, rtY) {
    if (!this.selected) return

    // let tmpBound = this.getBoundary()

    // let width = right - left
    // let height = bottom - top
    let left = rtX
    let right = rtX + this.width
    let r = this.cornerRadius
    ctx.save()

    ctx.fillStyle = 'rgba(0,0,0,0.4)'
    ctx.strokeStyle = 'rgba(0,0,0,0.4)'
    // ctx.lineWidth = 20
    // ctx.lineCap = 'butt'
    // ctx.beginPath()
    // ctx.fillRect(left, rtY - this.height / 2, this.width, this.height)
    //right
    // ctx.moveTo(right, rtY - this.height / 2)
    // ctx.lineTo(right, rtY + this.height / 2)
    ctx.beginPath()
    ctx.arc(right, rtY, r, 0, Math.PI * 2)
    ctx.fill()

    //left 
    // ctx.moveTo(left, rtY - this.height / 2)
    // ctx.lineTo(left, rtY + this.height / 2)
    // ctx.stroke()
    ctx.beginPath()
    ctx.arc(left, rtY, r, 0, Math.PI * 2)
    ctx.fill()

    ctx.restore()
  }
  render(ctx) {
    let rtX = this.x - this.cx //相对坐标x
    let rtY = this.y - this.cy //相对坐标y
    // console.log({ rtX, rtY })
    let x1 = rtX
    let x2 = rtX + this.width
    let y1 = rtY - this.height / 2
    let y2 = rtY + this.height / 2
    let arrowW = this.height / 2
    // let arrowH = arrowW
    let margin = arrowW / 4


    ctx.save()
    ctx.strokeStyle = this.color
    ctx.fillStyle = this.color

    ctx.translate(this.cx, this.cy)
    ctx.rotate(this.angle * Math.PI / 180)

    ctx.beginPath()

    //1
    // ctx.moveTo(x1, y1)
    // ctx.lineTo(x1, y2)

    //2
    // ctx.moveTo(x2, y1)
    // ctx.lineTo(x2, y2)
    //3
    ctx.moveTo(x1 + margin, rtY)
    ctx.lineTo(x2 - margin, rtY)
    //4
    ctx.moveTo(x1 + margin * 3, rtY - margin)
    ctx.lineTo(x1 + margin, rtY)
    ctx.lineTo(x1 + margin * 3, rtY + margin)

    //5 
    ctx.moveTo(x2 - margin * 3, rtY - margin)
    ctx.lineTo(x2 - margin, rtY)
    ctx.lineTo(x2 - margin * 3, rtY + margin)
    ctx.stroke()

    if (this.content) {

      if (this.angle > -100 && this.angle <= 80) {
        ctx.fillText(this.content, rtX + this.width / 2, rtY - margin * 2)
      } else {
        ctx.save()
        ctx.translate(rtX + this.width / 2, rtY)
        ctx.rotate(Math.PI)
        ctx.fillText(this.content, 0, 0 - margin * 2)
        ctx.restore()
      }
    }
    // ctx.translate(-this.cx, -this.cy)


    this.drawHandle(ctx, rtX, rtY)
    ctx.restore()

  }
}

export {
  Ellipse,
  Order,
  Rect,
  Ruler,
  Curve,
  Text,
  Line,
  Arrow,
  gRate,
  gNum,
  gRound,
  deepCopyArray,
  clone,
}