// components/watermark/btn/btn.js

import {
	radian
} from '../utils'

Component({
	/**
	 * 组件的属性列表
	 */
	properties: {

	},

	lifetimes: {
		attached: function() {
			wx.createSelectorQuery().in(this)
				.selectAll('.canvas')
				.fields({
					node: true,
        })
        .exec(this.init.bind(this))
		}
	},

	/**
	 * 组件的初始数据
	 */
	data: {

	},

	/**
	 * 组件的方法列表
	 */
	methods: {
		init(res) {
      let nodes = res[0]
      let canvas = nodes[0].node
			const ctx = canvas.getContext('2d')
			canvas.height = 80
			canvas.width = 80
      this.canvas = canvas
			this.ctx = ctx
			this.videoLength = 10
      this.initCanvas()

    },

		initCanvas() {
			let ctx = this.ctx
      ctx.lineWidth = 6
      ctx.lineJoin = 'round'
			ctx.lineCap = 'round'
			ctx.clearRect(0,0,80,80)
			ctx.beginPath()
			ctx.strokeStyle = '#ccc'
			ctx.arc(40, 40, 37, 0, 2 * Math.PI, false)
			ctx.stroke()
		},
		
		draw(ep) {
			let ctx = this.ctx
			this.initCanvas()
			ctx.beginPath()
			ctx.strokeStyle = 'red'
			ctx.arc(40, 40, 37, radian(0), radian(ep), false)
			ctx.stroke();
			ctx.closePath()
		},
	 
		//touch start 手指触摸开始
		btnTS(e) {
			let i = 0
			this.startTime  =  e.timeStamp;
			this.st = setTimeout(() => {
        this.si = setInterval(() => {
					this.draw(i += 100 / (this.videoLength * 62.5))
					if(i > 100) clearInterval(this.si)
        }, 16)
    	}, 350);
		},
	 
		//touch end 手指触摸结束
		btnTE(e) {   
			this.endTime  =  e.timeStamp;    
			console.log(" endTime = "  +  e.timeStamp);  
			//判断是点击还是长按 点击不做任何事件，长按 触发结束录像
			if (this.endTime - this.startTime > 350) {
				
				clearInterval(this.si)
        this.initCanvas()
			} else {
				this.triggerEvent('takePhoto')
				clearTimeout(this.st)
				
			}
		},
	}
})
