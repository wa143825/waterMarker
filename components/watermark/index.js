// components/watermark/index.js
// bc  bottomControl 底部控制栏
// 

import {
	dragImg,
} from './utils'


const mark1 = {
	fixed: [
		{
			mode: 'image',
			url: '/assets/item1/bg.png',
			left: 0,
			top: 0,
			width: 180,
			height: 50,
		},
		{
			mode: 'image',
			url: '/assets/item1/weather.png',
			left: 12,
			top: 12,
			width: 26,
			height: 26,
		},
		{
			mode: 'text',
			left: 44,
			top: 18,
			content: '早安',
			color: "#ffffff",
		 	align: "left",
			size: 20,
			bold: false
		},
		{
			label: 'time',
			mode: 'text',
			left: 108,
			top: 14,
			content: '08:00',
			color: "#000000",
		 	align: "left",
			size: 24,
			font: 'Quartz',
			bold: true
		},
	],
	editor: [
		{
			mode: 'text',
			content: '华中光彩大市场',
			color: "#ffffff",
		 	align: "left",
			size: 16,
			bold: false
		},
		{
			mode: 'text',
			content: '2020-12-31 星期四',
			color: "#ffffff",
		 	align: "left",
			size: 16,
			bold: false,
		},
		{
			mode: 'text',
			content: '今天的天气不错，我们去哪里吃饭好呐？',
			color: "#ffffff",
		 	align: "left",
			size: 16,
			bold: false
		},
	]
}


Component({

	data: {
		bcH: 0,
		cameraH: 0,
		cameraW: 0,
		camera: null,
		bgImg: '',
		ctx: null,
		clockInterval: null,
		time: '',
		animation: null,
		dragArr: [],
	},

	lifetimes: {
		attached() {
			// this.clock()

			this.initSize()
			this.data.ctx = wx.createCanvasContext("canvas", this);
			this.data.camera = wx.createCameraContext();
			this.onArrChange(mark1, 180)
		},
		detached() {
			// clearInterval(this.clockInterval);
		}
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
		
		onArrChange(mark, w) {
			const item = new dragImg(this.data.ctx, mark, w)
			this.data.dragArr[0] = item
			this.draw()
		},
		
		// 画布鼠标按下
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
		
		//画布鼠标拖动
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
				setTimeout(()=> {
					this.draw()
				}, 30)
      }
		},
		
		stop() {
		},
		

    draw(t) {
			this.data.dragArr.forEach(node => node.render())
			this.data.ctx.draw()
		},

		// 拍照
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
		// 保存照片
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
		},

		changeText(label, content) {

		},

		clock() {
			
			let t = () => {
				let d = new Date();
				let h = d.getHours() > 9 ? d.getHours() : '0' + d.getHours()
				let m = d.getMinutes() > 9 ? d.getMinutes() : '0' + d.getMinutes()
				let s = d.getSeconds() > 9 ? d.getSeconds() : '0' + d.getSeconds()
				mark1.fixed[3].content = `${m}:${s}`
				this.data.dragArr.forEach(node => node.changeText(mark1))
				this.draw()
			}
			setTimeout(t, 0)
			this.data.clockInterval = setInterval(t, 1000)
			
		}
	}
})
