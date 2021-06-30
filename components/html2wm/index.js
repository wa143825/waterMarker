Component({

	data: {
		bcH: 0,
		cameraH: 0,
		cameraW: 0,
		camera: null,
	},

	lifetimes: {
		attached() {
			this.initSize()
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
	}
})
