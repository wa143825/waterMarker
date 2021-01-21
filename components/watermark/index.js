// components/watermark/index.js
// bc  bottomControl 底部控制栏
// 

let stuff = '../../assets/stuff.png'

import {
	dragImg
} from './utils'


Component({

	data: {
		bcH: 0,
		cameraH: 0,
		cameraW: 0,
		camera: null,
		bgImg: '',
		ctx: null,
		
		dragArr: [],
	},

	lifetimes: {
		attached() {
			this.initSize()
			this.data.ctx = wx.createCanvasContext("canvas", this);
			this.data.camera = wx.createCameraContext();
			this.insert()
		},
	},
	

	methods: {

		initSize() {
			const res = wx.getSystemInfoSync();
			this.setData({
				cameraH: res.windowHeight * 0.75,
				cameraW: res.windowWidth,
				bcH: res.windowHeight * 0.25
			})
		},

		insert() {

			const item = [
				{
					mode: 'image',
					url: 'https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/09f4187fbca948239f0f8d15f7fdd65a~tplv-k3u1fbpfcp-watermark.image',
					left: 0,
					top: 0,
					width: 120,
					height: 130,

				}
			]

			let content =  ['非常宅', '湖北省襄阳市返程']
			wx.getImageInfo({
				src: '../../assets/stuff.png',
				success: (res) => {
					const scale = this.getScale(res.width, res.height)
					console.log(res);
					let img = {
						width: res.width/scale,
						height: res.height/scale,
						url: res.path
					}
					this.onArrChange(img ,content)
				}
			})
		},
		
		onArrChange(img, content) {
			let fontSize = 24
			let h, w
			if(content) {
				this.data.ctx.font=`${fontSize}px SimSun, Songti SC`
				let textMaxWidth =  Math.max.apply(null, content.map(e => this.data.ctx.measureText(e).width));
				h = img.height + content.length * fontSize
				w = Math.max( img.width, textMaxWidth )
			} else {
				h = img.height
				w = img.width
			}

			const item = new dragImg(img, this.data.ctx, content, w, h, fontSize)
			this.data.dragArr[0] = item
			this.draw()
		},
		

    start(e) {
      this.data.clickedkArr = []
      const { x, y } = e.touches[0]
      this.data.dragArr.forEach((item,index) => {
        const place = item.isInWhere(x, y)
        item.place = place
        item.index = index
        //先将所有的item的selected变为flase
        item.selected = false
        if (place) {
          this.data.clickedkArr.push(item)
        }
      })
      const length = this.data.clickedkArr.length
      if (length) {
        const lastImg = this.data.clickedkArr[length - 1]
        if(lastImg.place ==='del'){
          this.data.dragArr.splice(lastImg.index,1)
          this.draw()
          return
        }
        lastImg.selected = true
        //保存这个选中的实例
        this.data.lastImg = lastImg
        this.data.initial = {
          initialX: lastImg.x,
          initialY: lastImg.y,
          initialH: lastImg.h,
          initialW: lastImg.w,
          initialRotate: lastImg.rotate
        }
      }
      this.draw()
      this.data.startTouch = { startX : x, startY : y }
    },
		
		move(e) {
      const { x, y } = e.touches[0]
      const { initialX, initialY } = this.data.initial
      const { startX, startY } = this.data.startTouch
			const lastImg = this.data.lastImg
      if (this.data.clickedkArr.length) {
        if (this.data.lastImg.place === 'move') {
          //算出移动后的xy坐标与点击时xy坐标的差（即平移量）与图片对象的初始坐标相加即可
          lastImg.x = initialX + (x - startX)
          lastImg.y = initialY + (y - startY)
        }
        if (this.data.lastImg.place === 'transform'){
          const { centerX, centerY } = lastImg
          const { initialRotate } = this.data.initial
          const angleBefore = Math.atan2(startY - centerY, startX - centerX) / Math.PI * 180;
          const angleAfter = Math.atan2(y - centerY, x - centerX) / Math.PI * 180;
          lastImg.rotate = initialRotate + angleAfter - angleBefore
          const { initialH, initialW } = this.data.initial
          let lineA = Math.sqrt(Math.pow(centerX - startX, 2) + Math.pow(centerY - startY, 2));
					let lineB = Math.sqrt(Math.pow(centerX - x, 2) + Math.pow(centerY - y, 2));
          let w = initialW + (lineB - lineA);
					let h = initialH + (lineB - lineA) * (initialH / initialW);
					
					lastImg.w = w <= 5 ? 5 : w;
          lastImg.h = h <= 5 ? 5 : h;
          if (w > 5 && h > 5) {
            lastImg.x = initialX - (lineB - lineA) / 2;
            lastImg.y = initialY - (lineB - lineA) / 2;
          }
        }
        this.draw()
      }
    },
		

    draw() {
			this.data.dragArr.forEach(node => node.render())
			this.data.ctx.draw()
		},
		

		getScale(width,height){
			console.log(width, height);
			if (width >= height) {
				if (height <= 120) {
					return 1;
				} else {
					return height / 120;
				}
			} else if (height > width) {
				if (width <= 120) {
					return 1;
				} else return width / 120;
			}
		},


		takePhoto() {
			console.log('takePhoto');
			this.data.camera.takePhoto({
				quality: 'high',
				success: (res) => {
					console.log(res.tempImagePath);
					this.setData({
						bgImg: res.tempImagePath
					})
				},
				fail() {
					//拍照失败
					console.log("拍照失败");
				}
			})
		},

		savePhoto() {
			this.data.ctx.drawImage(this.data.bgImg, 0, 0, this.cameraW, this.cameraH)
			this.data.dragArr.forEach(node => node.render())
			this.data.ctx.draw(true, () => {
				wx.canvasToTempFilePath({
					x: 0,
					y: 0,
					canvasId: 'canvas',
					width: this.cameraW,
					height: this.cameraH,
					success: (res) => {
						console.log(res.tempImagePath);
						wx.saveImageToPhotosAlbum({
							filePath: res.tempFilePath,
							success(res) {
								console.log(res);
								wx.showToast({
									title: '成功',
								})
							},
						})
					},
					fail: (err) => {
						console.log(err);
					}
				}, this)
			})
		}
	}
})
