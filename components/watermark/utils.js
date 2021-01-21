let radian = (num) =>  num === -0.5*Math.PI ? num : ( Math.PI / 50 ) * (num - 25)

let closeImg = '/assets/close.png'
let resizeImg = '/assets/resize.png'

class dragImg {
	constructor(img, canvas, content, w, h, fs) {
		this.img = img
		this.content = content
		this.x = 15
		this.y = 15
		this.h = h
		this.w = w
		this.fontSize = fs
		this.selected = true
    this.ctx = canvas
		
		this.cRadius = 30
    this.rotate = 0
    
    this.rateH = this.img.height / this.h
    this.rateW = this.img.width / this.w
    this.rateF = this.fontSize / this.h
	}

	isInWhere (x, y) {
    let transformX = this.x + this.w
    let transformY = this.y + this.h
    const transformAngle = Math.atan2(transformY - this.centerY, transformX - this.centerX) / Math.PI * 180 + this.rotate
    const transformXY = this.getTransform(transformX, transformY, transformAngle)
    transformX = transformXY.x; transformY = transformXY.y
		
    let delX = this.x
    let delY = this.y
    const delAngle = Math.atan2(delY - this.centerY, delX - this.centerX) / Math.PI * 180 + this.rotate
    const delXY = this.getTransform(delX, delY, delAngle)
    delX = delXY.x; delY = delXY.y
    // 移动区域的坐标
    const moveX = this.x
    const moveY = this.y
    if (x - transformX >= 0 && y - transformY >= 0 && transformX + this.cRadius - x >= 0 && transformY + this.cRadius - y >= 0) {
      return 'transform'
    } else if (x - delX >= 0 && y - delY >= 0 && delX + this.cRadius - x >= 0 && delY + this.cRadius - y >= 0) {
      return 'del'
    } else if (x - moveX >= 0 && y - moveY >= 0 && moveX + this.w - x >= 0 && moveY + this.h - y >= 0) {
      return 'move'
    }
    // 不在选择区域里面
    return false
	}
	
	getTransform (x, y, rotate) {
    var angle = Math.PI / 180 * rotate
    var r = Math.sqrt(Math.pow(x - this.centerX, 2) + Math.pow(y - this.centerY, 2))
    var a = Math.sin(angle) * r
    var b = Math.cos(angle) * r
    return {
      x: this.centerX + b - 15,
      y: this.centerY + a - 15
    }
  }

	render() {
    this.ctx.save()

    this.centerX = this.x + this.w / 2;
    this.centerY = this.y + this.h / 2;
		
		// 旋转元素
		this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotate * Math.PI / 180);
		this.ctx.translate(-this.centerX, -this.centerY);


    let fonts = Math.round(this.h * this.rateF)
    this.ctx.font = `${fonts}px SimSun, Songti SC`;
    this.content && this.content.map((item, idx) => this.ctx.fillText(item, this.x, fonts * (idx+1) + this.y + this.h * this.rateH  ))
    
    this.ctx.drawImage(`/${this.img.url}`, this.x, this.y, this.w * this.rateW, this.h * this.rateH)
    
		if(this.selected) {
			this.ctx.setStrokeStyle(255,0,0, 0.5)
			this.ctx.setLineWidth(1)
			this.ctx.setLineDash([5, 5]);
			this.ctx.strokeRect(this.x, this.y, this.w, this.h)
			this.ctx.drawImage(closeImg, this.x - 15,this.y -15,this.cRadius, this.cRadius)
			this.ctx.drawImage(resizeImg,this.x + this.w - 15,this.y + this.h - 15,this.cRadius, this.cRadius)
		}
    this.ctx.restore()
	}
}

export {
  dragImg,
  radian
}