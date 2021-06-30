let radian = (num) =>  num === -0.5*Math.PI ? num : ( Math.PI / 50 ) * (num - 25)

let closeImg = '/assets/close.png'
let resizeImg = '/assets/resize.png'

const requestAnimationFrame = function(callback, lastTime) {
  var lastTime;
  if (typeof lastTime === 'undefined') {
      lastTime = 0
  }
  var currTime = new Date().getTime();
  var timeToCall = Math.max(0, 30 - (currTime - lastTime));
  lastTime = currTime + timeToCall;
  var id = setTimeout(function() {
      callback(lastTime);
  },timeToCall);
  return id;
};

const cancelAnimationFrame = function(id) {
  clearTimeout(id);
};

const memorize = function(fn) {
  const cache = {}       // 存储缓存数据的对象
  return function(...args) {        // 这里用到数组的扩展运算符
    const _args = JSON.stringify(args)    // 将参数作为cache的key
    return cache[_args] || (cache[_args] = fn.apply(fn, args))  // 如果已经缓存过，直接取值。否则重新计算并且缓存
  }
}


let wrapText = function (ctx, text, x, y, maxWidth, lineHeight) {
  if (typeof text != 'string' || typeof x != 'number' || typeof y != 'number') {
      return;
  }
  
  // 字符分隔
  var arrText = text.split('');
  var line = '';
  var count = 1
  
  for (var n = 0; n < arrText.length; n++) {
      var testLine = line + arrText[n];
      var metrics = ctx.measureText(testLine);
      var testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = arrText[n];
          y += lineHeight;
          count ++;
      } else {
          line = testLine;
      }
  }
  ctx.fillText(line, x, y);
  return count
};


class dragImg {
	constructor(canvas, mark, w) {
    this.ctx = canvas
    this.mark = mark
    this.w = w
    this.h = 0
		this.x = 15
		this.y = 15

    this.selected = false
    
		this.cRadius = 30
    this.rotate = 0
    
    // this.rateH = this.img.height / this.h
    // this.rateW = this.img.width / this.w
    // this.rateF = this.fontSize / this.h
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
    // if (x - transformX >= 0 && y - transformY >= 0 && transformX + this.cRadius - x >= 0 && transformY + this.cRadius - y >= 0) {
    //   return 'transform'
    // } else if (x - delX >= 0 && y - delY >= 0 && delX + this.cRadius - x >= 0 && delY + this.cRadius - y >= 0) {
    //   return 'del'
    // } else 
    if (x - moveX >= 0 && y - moveY >= 0 && moveX + this.w - x >= 0 && moveY + this.h - y >= 0) {
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

  changeText(content) {
    this.mark = content
    this.render()
  }

	render() {

    this.ctx.save()

    // this.mark.map((i) => {
    //   if(i.mode == 'image') {
    //     this.ctx.drawImage(`${i.url}`, i.left + this.x, i.top + this.y, i.width, i.height)
    //   } else if(i.mode == 'text') {
    //     let isbold = i.bold ? 'bold' : 'normal'
    //     this.ctx.font =  isbold +  ` ${i.font}px  Microsoft YaHei`
    //     this.ctx.textBaseline = 'top'
    //     this.ctx.fillStyle = `${i.color}`
    //     let contentWidth = this.ctx.measureText(i.content)
    //     if(contentWidth > this.w) {

    //     }else {
    //       this.ctx.fillText(i.content, i.left + this.x, i.top + this.y)
    //     }
        
    //   } else if(i.mode == 'rect') {
    //     this.ctx.fillStyle = `${i.color}`
    //     this.ctx.fillRect(i.left + this.x, i.top + this.y, i.width, i.height)
    //   }
    // })

    let _heightArr = []
    this.mark.fixed.map((i) => {
      if(i.mode == 'image') {
        this.ctx.drawImage(`${i.url}`, i.left + this.x, i.top + this.y, i.width, i.height)
        let imageB = i.top + i.height
        _heightArr.push(imageB)
      } else if(i.mode == 'text') {
        let isbold = i.bold ? 'bold' : 'normal'
        this.ctx.font =  isbold +  ` ${i.size}px  Microsoft YaHei`
        this.ctx.textBaseline = 'top'
        this.ctx.fillStyle = `${i.color}`
        this.ctx.fillText(i.content, i.left + this.x, i.top + this.y)
        let textB = i.size + i.top
        _heightArr.push(textB)
      } else if(i.mode == 'rect') {
        this.ctx.fillStyle = `${i.color}`
        this.ctx.fillRect(i.left + this.x, i.top + this.y, i.width, i.height)
        let imageB = i.top + i.height
        _heightArr.push(imageB)
      }
    })
    

    let lineGap = 8
    let prevHeight = 0
    this.ctx.font = `16px  Microsoft YaHei`
    this.ctx.textBaseline = 'top'
    this.ctx.fillStyle = `#ffffff`
    this.mark.editor.map((i) => {
      this.ctx.fillRect( this.x, prevHeight  + this.y + 60, 12, 10 )
      let contentWidth = this.ctx.measureText(i.content)
      if(contentWidth.width < this.w - 20) {
        this.ctx.fillText(i.content, this.x + 20,  prevHeight  + this.y + 60);
        prevHeight += i.size + lineGap
        _heightArr.push(prevHeight + i.size);
      } else {
        let count = wrapText(this.ctx, i.content, this.x + 20, prevHeight + this.y + 60 , this.w -20 , lineGap + i.size)
        prevHeight += count * (i.size + lineGap)
        _heightArr.push(prevHeight + count * (i.size + lineGap));
      }
    })

    this.h = Math.max(..._heightArr)

    this.centerX = this.x + this.w / 2;
    this.centerY = this.y + this.h / 2;
		
		// 旋转元素
		this.ctx.translate(this.centerX, this.centerY);
    this.ctx.rotate(this.rotate * Math.PI / 180);
		this.ctx.translate(-this.centerX, -this.centerY);
    
    // 选中

    this.ctx.setStrokeStyle(255,0,0, 0.5)
    this.ctx.setLineWidth(1)
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(this.x, this.y, this.w, this.h)
		if(this.selected) {
      // this.ctx.setStrokeStyle(255,0,0, 0.5)
      // this.ctx.setLineWidth(1)
      // this.ctx.setLineDash([5, 5]);
      // this.ctx.strokeRect(this.x, this.y, this.w, this.h)
			// this.ctx.drawImage(closeImg, this.x - 15,this.y -15,this.cRadius, this.cRadius)
			// this.ctx.drawImage(resizeImg,this.x + this.w - 15,this.y + this.h - 15,this.cRadius, this.cRadius)
		}
    this.ctx.restore()
	}
}

export {
  dragImg,
  radian,
  requestAnimationFrame,
  cancelAnimationFrame
}