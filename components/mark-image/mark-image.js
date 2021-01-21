// components/mark-image/mark-image.js
import {
  Ellipse,
  Rect,
  Order,
  Ruler,
  Curve,
  Text,
  Line,
  Arrow,
  gNum,
  gRound,
  gRate,
  deepCopyArray,
  clone
} from './markHelper'

Component({

  /**
   * 组件的属性列表
   */
  properties: {

    imgUrl: {
      type: String,
      value: '',
    }
  },
  options: {
    styleIsolation: "apply-shared"
  },
  /**
   * 组件的初始数据
   */
  data: {
    // windowWidth: device.windowWidth,
    // canvasWidth: device.windowWidth,
    // canvasHeight: device.windowWidth,
    canvasLeft: 0,
    // canvasTop: menuBtnInfo.top + menuBtnInfo.height + 10,
    menuBtnTop: 0,
    menuBtnHeight: 0,
    // colorBarWidth: device.windowWidth - 60,
    showRulerMenu: false,
    showColorMenu: true,
    showShapeMenu: false,
    showInputRuler: false,
    showInputOrder: false,
    inputText: '',
    foreColor: '#ff0000',
    imgUrl: '',
    keyboardHeight: 0,
    showRemoveTips: false,
    removeActive: false,
    orderNo: 1,
    autoFocus: true,
    options: [{
      id: 'ruler',
      active: false
    }, {
      id: 'rect',
      active: false
    }, {
      id: 'round',
      active: false
    }, {
      id: 'curve',
      active: false
    }, {
      id: 'line',
      active: false
    }, {
      id: 'arrow',
      active: false
    }],
    tabItems: [{
      id: 'ruler',
      title: '标尺',
      icon: 'ruler'
    }, {
      id: 'text',
      title: '文字',
      icon: 'text'
    }, {
      id: 'shape',
      title: '图形',
      icon: 'shape'
    }, {
      id: 'order',
      title: '序号',
      icon: 'order'
    }, {
      id: 'curve',
      title: '涂鸦',
      icon: 'curve'
    }],
    shapeItems: [{
      id: 'rect',
      title: '矩形',
      icon: 'rect'
    }, {
      id: 'round',
      title: '圆形',
      icon: 'round'
    }, {
      id: 'arrow',
      title: '箭头',
      icon: 'arrow'
    }, {
      id: 'line',
      title: '直线',
      icon: 'line'
    }],
    colorItems: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ffc0cb', '#008080', '#00ffff', '#ff7373', '#ffa500', '#800080', '#ff00ff', '#660066', '#3b5998', '#ff7f50'],
  },
  lifetimes: {
    attached: function () {
      this.initData()
      // 在组件实例进入页面节点树时执行
      wx.createSelectorQuery().in(this)
        .selectAll('.canvas')
        .fields({
          node: true,
        })
        .exec(this.init.bind(this))
    },
    detached: function () {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  // 以下是旧式的定义方式，可以保持对 <2.2.3 版本基础库的兼容
  attached: function () {
    // 在组件实例进入页面节点树时执行
  },
  detached: function () {
    // 在组件实例被从页面节点树移除时执行
  },
  /**
   * 组件的方法列表
   */
  methods: {

    initData() {

      this.nodes = []
      this.nodesUndo = []
      this.nodesRedo = []

      wx.onKeyboardHeightChange(res => {
        let keyboardHeight = res.height
        this.setData({
          keyboardHeight
        })
      })
    },
    // 内部方法建议以下划线开头
    init(res) {
      // console.log(res)
      let nodes = res[0]
      let canvas = nodes[0].node
      const ctx = canvas.getContext('2d')
      this.canvas = canvas
      this.ctx = ctx

      // let canvas2 = nodes[1].node
      // const ctx2 = canvas2.getContext('2d')
      // ctx2.strokeStyle = 'red'
      // ctx2.beginPath()
      // ctx2.moveTo(100, 10)
      // ctx2.lineTo(200, 400)
      // ctx2.stroke()
      // console.log(canvas2)
      // this.ctx.drawImage(ctx2.canvas, 0, 0, canvas2.width, canvas2.height)
      this.myGetImageInfo()


    },

    // 初始化绘制基本样式
    initCanvas() {

      this.ctx.lineWidth = gRound(4)
      this.ctx.lineJoin = 'round'
      this.ctx.lineCap = 'round'
      this.ctx.strokeStyle = 'red'
      this.ctx.fillStyle = 'red'

      let font = {
        size: gRound(26)
      }

      this.ctx.font = '' + font.size + 'px Arial'
      this.ctx.textAlign = 'center'
      this.setData({
        font
      })
    },
    // 图片绘制进去
    addImage() {

      let img = this.canvas.createImage()
      img.src = this.data.imgUrl
      let canvasWidth = this.canvas.width
      let canvasHeight = this.canvas.height
      img.onload = (e) => {
        console.log(e);
        let {
          width,
          height
        } = img
        this.img = img
        this.ctx.drawImage(img, 0, 0, width, height, 0, 0, canvasWidth, canvasHeight)
        // console.log({ canvasWidth, canvasHeight, width, height })
      }

    },

    // 更新底部工具栏
    updateTabItems(index) {
      let tabItems = this.data.tabItems
      tabItems.forEach((item, i) => {
        item.active = false
        if (i == index) {
          item.active = true
        }
      })
      this.setData({
        tabItems
      })
    },
    // 更新选中的图形
    updateOptions(id) {
      let options = this.data.options
      options.forEach(item => {
        item.active = false
        if (item.id == id) {
          item.active = true
        }
      })

      this.setData({
        options
      })
    },

    // 底部工具栏选择
    bindTabItem(e) {
      let {
        id,
        index
      } = e.currentTarget.dataset
      this.updateTabItems(index) // 点中添加样式
      this.updateOptions(id) // 判断选中的形状

      if (id == 'order') {
        this.curNode = null
        let no = this.getOrderCount() + 1
        this.setData({
          orderNo: no,
          autoFocus: true
        })

        this.showMenu('showInputOrder')
      } else if (id == 'text') {
        this.curNode = null
        this.setData({
          autoFocus: true
        })

        this.showMenu('showInputText')
      } else if (id == 'shape') {
        this.showMenu('showShapeMenu')
        let tmpItem = this.data.shapeItems.find((item) => {
          return item.active == true
        })
        if (!tmpItem) {
          this.updateOptions('rect')
          this.updateShapeItems('rect')
        } else {
          this.updateOptions(tmpItem.id)
        }

      } else {
        this.showMenu()
      }
    },
    bindTabSave(e) {
      this.exportImage()
    },
    showMenu(id) {

      let tmpParms = {}
      tmpParms.showRulerMenu = false
      tmpParms.showInputText = false
      tmpParms.showColorMenu = false
      tmpParms.showShapeMenu = false
      tmpParms.showInputRuler = false
      tmpParms.showInputOrder = false
      if (tmpParms[id] !== undefined) {
        tmpParms[id] = true
      }

      tmpParms.keyboardHeight = 0
      this.setData(tmpParms)
    },
    // 导出图片
    exportImage() {
      wx.showLoading({
        title: '请稍候',
      })
      wx.canvasToTempFilePath({
        canvas: this.canvas,
        success: res => {
          // console.log(res)
          let tempFilePath = res.tempFilePath
          let tmpEventDetail = {
            tempFilePath
          } // detail对象，提供给事件监听函数
          this.triggerEvent('save', tmpEventDetail)
        },
        complete: () => {
          wx.hideLoading()
        }
      })
    },

    // 获取中心点
    getXY() {
      let x = this.canvas.width / 2
      let y = this.canvas.height / 2
      return {
        x,
        y
      }
    },

    // 添加圆形
    addRound(x, y) {

      let width = gNum(2)
      let height = gNum(2)
      let color = this.data.foreColor
      let tmpNode = new Ellipse(x, y, width, height, color)

      this.nodes.push(tmpNode)
      this.redrawAll()

      return tmpNode
    },

    // 添加方形
    addRect(x, y) {

      let width = gNum(2)
      let height = gNum(2)
      let color = this.data.foreColor
      let tmpNode = new Rect(x, y, width, height, color)

      this.nodes.push(tmpNode)
      this.redrawAll()
      return tmpNode
    },
    //添加涂鸦
    addCurve() {
      let color = this.data.foreColor
      let tmpNode = new Curve(color)
      this.nodes.push(tmpNode)
      return tmpNode
    },

    // 序号确定按钮
    tapAddOrder(e) {
      // let id = e.currentTarget.dataset.id || ''
      this.addOrder(this.data.inputOrder)
      this.addToHistory()
    },

    // 获取序号数量
    getOrderCount() {
      let tmpArr = this.nodes.filter((item) => {
        return item instanceof Order
      })
      return tmpArr.length
    },

    // 添加序号
    addOrder(pContent) {
      if (this.curNode && this.curNode instanceof Order) {
        // this.curNode.content = pContent
        this.curNode.setContent(pContent)
        this.redrawAll()
        this.setData({
          showInputOrder: false,
          inputOrder: ''
        })
        return
      }
      let {
        x,
        y
      } = this.getXY()
      let r = gNum(16)
      let content = pContent
      let color = this.data.foreColor

      let no = this.getOrderCount() + 1
      let txtWidth = 0
      if (content) {
        txtWidth = this.ctx.measureText(content).width
      }
      x -= txtWidth / 2
      let tmpNode = new Order(x, y, r, no, content, this.ctx, color)
      // console.log(tmpNode)
      this.nodes.push(tmpNode)
      this.redrawAll()

      this.setData({
        showInputOrder: false,
        inputOrder: '',
        orderNo: no + 1,
      })
    },

    // 添加标尺尺寸
    tapUpdateRuler(e) {
      // let id = e.currentTarget.dataset.id
      this.updateRuler(this.data.inputRuler)
      this.addToHistory()
    },

    // 添加线
    addLine(x, y) {
      let width = gNum(2)
      let height = gNum(20)
      let angle = 0
      let color = this.data.foreColor
      let tmpNode = new Line(x, y, width, height, color, angle)

      this.nodes.push(tmpNode)

      this.redrawAll()
      return tmpNode
    },

    // 添加箭头
    addArrow(x, y) {
      let width = gNum(2)
      let height = gNum(20)
      let angle = 0
      let color = this.data.foreColor
      let tmpNode = new Arrow(x, y, width, height, color, angle)

      this.nodes.push(tmpNode)

      this.redrawAll()
      return tmpNode
    },

    // 添加标尺文字
    addRuler(pContent, x, y) {
      let width = gNum(2)
      let height = gNum(20)
      let content = pContent
      let angle = 0
      let color = this.data.foreColor
      let tmpNode = new Ruler(x, y, width, height, content, this.data.font.size, color, angle)

      this.nodes.push(tmpNode)

      this.redrawAll()
      return tmpNode
    },
    // 更新标尺内容
    updateRuler(pContent) {
      if (this.curNode && this.curNode instanceof Ruler) {
        // console.log(this.curNode)
        this.curNode.content = pContent
        this.redrawAll()
        this.setData({
          showInputRuler: false,
          inputRuler: ''
        })
      }
    },

    // 添加文本
    addText(pText, width, height) {
      let {
        x,
        y
      } = this.getXY()
      x -= width / 2
      let color = this.data.foreColor
      let tmpNode = new Text(pText, x, y, width, height, this.data.font.size, color, this.ctx)
      // console.log(tmpNode)
      this.nodes.push(tmpNode)
      this.redrawAll()
    },
    // 更新文本
    udpateText(pText, width, height) {
      this.curNode.content = pText
      this.curNode.width = width
      this.curNode.height = height
      this.curNode.setFontSize()
      this.redrawAll()
    },
    // 渲染
    renderAll() {
      this.nodes.forEach(node => {
        node.render(this.ctx)
      })
    },
    clearAll(e) {
      this.nodes.length = 0
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.initCanvas()
      this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height)
      this.renderAll()
    },
    redrawAll() {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
      this.initCanvas()
      this.ctx.drawImage(this.img, 0, 0, this.canvas.width, this.canvas.height)
      this.renderAll()
      this.drawMicroscope()
    },

    // 获取素材节点
    getNode(x, y) {
      let curNode
      if (this.curNode && this.curNode.selected && this.curNode.bolDotInside(x, y)) {
        curNode = this.curNode
        curNode.status = ''
        return curNode
      }

      for (let i = this.nodes.length - 1; i >= 0; i--) {
        let tmpNode = this.nodes[i]

        if (!curNode && tmpNode.bolDotInside(x, y)) {
          curNode = tmpNode
          // tmpNode.selected = true
          // break
        } else {
          tmpNode.selected = false
        }
      }
      if (curNode) curNode.status = ''
      return curNode
    },
    adapt(num) {
      return this.rate * num
    },
    // 1、手指开始移动
    touchstart(e) {
      let touch = e.touches[0]
      if (!touch) return

      this.bolMoving = false
      this.bolClick = true
      this.bolCreate = false

      let x = gNum(touch.x)
      let y = gNum(touch.y)
      // console.log({ x, y })

      this.curNode = this.getNode(x, y)


      this.lastDist = 0
      this.startAngle = 0
      this.activeOption = this.data.options.find((item) => {
        return item.active == true
      })

      // console.log(this.curNode)
      //如果不是标尺、图形或涂鸦操作
      if (!this.activeOption || (this.curNode && this.curNode.selected == true)) {
        if (this.curNode) {
          this.curNode.touchstart(x, y, e)
          this.setData({
            foreColor: this.curNode.color
          })

        } else {
          this.showMenu()
        }
      } else {
        this.showMenu()
        this.curNode = null
      }

      this.lastX = x
      this.lastY = y

      this.curPoint = {
        x,
        y
      }

      this.redrawAll()

    },

    // 添加一个图形
    addNode(x, y) {
      if (!this.activeOption) return;

      switch (this.activeOption.id) {
        case 'ruler':
          this.curNode = this.addRuler('', x, y);
          this.setData({
            inputRuler: ''
          })
          break;
        case 'rect':
          this.curNode = this.addRect(x, y);
          break;
        case 'round':
          this.curNode = this.addRound(x, y);
          break;
        case 'curve':
          this.curNode = this.addCurve(x, y);
          break;
        case 'line':
          this.curNode = this.addLine(x, y);
          break;
        case 'arrow':
          this.curNode = this.addArrow(x, y);
          break;
        default:
          break;
      }

      if (this.curNode) {
        this.curNode.touchstart(x, y)
        this.curNode.handle = this.curNode.getDefaultHandle()
        this.curNode.selected = false

      }
      // console.log(this.curNode)
    },
    touchmove(e) {
      let touch = e.touches[0]
      if (!touch) return

      let x = gNum(touch.x)
      let y = gNum(touch.y)
      this.curPoint = {
        x,
        y
      }
      if (!this.bolMoving) {
        this.showMenu()
      }
      this.bolMoving = true
      this.bolClick = false
      if (!this.curNode) {
        this.addNode(this.lastX, this.lastY)
        this.bolCreate = true
      }

      if (!this.curNode) return

      // 移动的时候下方显示删除栏
      if (this.curNode.selected && this.curNode.status == 'move') {

        let tmpY = this.data.canvasHeight
        if (touch.y > tmpY) { //&& touch.y < tmpY + 80
          this.setData({
            showRemoveTips: true,
            removeActive: true
          })
        } else {
          this.setData({
            showRemoveTips: true,
            removeActive: false
          })
        }
      }

      this.curNode.touchmove(x, y, e)

      this.redrawAll()
    },
    touchend(e) {

      if (this.curNode) {
        this.curNode.touchend(e)
      }

      if (this.bolMoving) {
        if (this.bolCreate && this.activeOption && this.activeOption.id == 'ruler') {
          this.setData({
            autoFocus: true
          })
          this.showMenu('showInputRuler')
        }
      }

      if (this.bolClick) {
        let touch = e.changedTouches[0]
        let x = gNum(touch.x)
        let y = gNum(touch.y)
        this.curNode = this.getNode(x, y)
        if (this.curNode) {
          this.curNode.selected = true
          let params = {}
          params.foreColor = this.curNode.color
          params.autoFocus = false

          let tmpShowTab = ''
          if (this.curNode instanceof Ruler) {

            params.inputRuler = this.curNode.content
            tmpShowTab = 'showInputRuler'
          } else if (this.curNode instanceof Text) {

            params.inputText = this.curNode.content
            tmpShowTab = 'showInputText'
          } else if (this.curNode instanceof Order) {

            params.inputOrder = this.curNode.content
            params.orderNo = this.curNode.no
            tmpShowTab = 'showInputOrder'
          }

          this.setData(params)
          if (tmpShowTab) {
            this.showMenu(tmpShowTab)
          }

          this.redrawAll()
        }
      }

      if (this.curNode) {
        if (this.data.removeActive) {
          this.removeNode()
          this.addToHistory()
        } else if (this.curNode.status == 'resize') {
          this.addToHistory()
        } else if (this.curNode.status == 'move') {
          this.addToHistory()
        } else if (this.bolCreate && this.curNode instanceof Curve) {
          this.addToHistory()
        }

        this.setData({
          showRemoveTips: false,
          removeActive: false
        })
      }

    },
    addToHistory() {
      let tmpArr = deepCopyArray(this.nodes)
      this.nodesUndo.push(tmpArr)
      this.nodesRedo = []
    },
    removeNode() {

      //
      let tmpI = this.nodes.findIndex((item) => {
        return item == this.curNode
      })
      if (tmpI >= 0) {
        this.nodes.splice(tmpI, 1)
        if (this.curNode instanceof Order) {
          let tmpCounter = 1
          this.nodes.forEach((item) => {
            if (item instanceof Order) {
              item.no = tmpCounter++
            }
          })
          this.setData({
            orderNo: tmpCounter
          })
        }
        this.curNode = null
        this.redrawAll()

      }

    },
    bindInputText(e) {
      let inputText = e.detail.value
      this.setData({
        inputText
      })
    },
    bindInputSubmit(e) {
      let tmpText = this.data.inputText
      if (!tmpText) {
        wx.showToast({
          title: '请先输入文字',
          icon: 'none'
        })
        return
      }
      tmpText = tmpText.replace(/^\n+|\n+$/g, "")

      this.getNodeRect().then(res => {
        let {
          width,
          height
        } = res
        // console.log({ tmpText, width, height })
        // this.checkText({ content: tmpText, width, height })
        if (this.curNode instanceof Text) {
          this.udpateText(tmpText, width, height)
        } else {
          this.addText(tmpText, width, height)
        }


        this.setData({
          inputText: '',
          showInputText: false
        })

        this.addToHistory()
      })


    },
    getNodeRect() {
      return new Promise((resolve, reject) => {
        const query = wx.createSelectorQuery().in(this)
        query.select('#textPreview')
          .boundingClientRect()
        query.exec(res => {
          if (!res || res.length < 1) {
            reject(-1)
          } else {
            resolve(res[0])
          }
        })
      })
    },
    tapChangeColor(e) {
      let params = e.currentTarget.dataset || {};
      let tmpColor = params.id || '#000000'
      this.setData({
        foreColor: tmpColor,
        showColorMenu: false,
      })
      if (this.curNode && this.curNode.selected) {
        this.curNode.color = this.data.foreColor
        this.redrawAll()
        this.addToHistory()
      }
    },
    tapChangeShape(e) {
      let id = e.currentTarget.dataset.id
      this.updateOptions(id)
      this.updateShapeItems(id)
      // this.showMenu()
    },
    updateShapeItems(id) {
      let shapeItems = this.data.shapeItems
      shapeItems.forEach((item) => {
        item.active = false
        if (item.id == id) {
          item.active = true
        }
      })
      this.setData({
        shapeItems
      })
    },
    bindHideInput(e) {
      this.showMenu()
      this.updateOptions()
      this.updateTabItems()
    },
    tapShowInputRuler(e) {
      this.setData({
        showInputRuler: true
      })
    },
    bindInputRuler(e) {
      let inputRuler = e.detail.value
      this.setData({
        inputRuler
      })
    },
    bindInputFocus(e) {
      let keyboardHeight = e.detail.height || 0
      this.setData({
        keyboardHeight
      })
    },
    bindInputOrder(e) {
      let inputOrder = e.detail.value
      this.setData({
        inputOrder
      })
    },


    tapShowInputOrder(e) {
      this.setData({
        showInputOrder: true
      })
    },
    tabShowColorMenu(e) {
      this.showMenu('showColorMenu')
    },
    myGetImageInfo() {
      
      wx.showLoading({
        title: '处理中',
      })
      const tempFilePath = this.data.imgUrl
      console.log('文件:' +  tempFilePath)
      const device = wx.getSystemInfoSync()
      const menuBtnInfo = wx.getMenuButtonBoundingClientRect()

      wx.getImageInfo({
        src: tempFilePath,
        success: (res) => {
          console.log(res);
          let imgWidth = res.width
          let imgHeight = res.height

          // 计算canvas 摆放位置
          let maxWidth = device.windowWidth
          let tabHeight = 120 * device.windowWidth / 750
          let menuBtnBottom = menuBtnInfo.top + menuBtnInfo.height + 4
          let maxHeight = device.windowHeight - menuBtnBottom - tabHeight
          let canvasWidth
          let canvasHeight

          // 素材为横向还是纵向
          if (imgHeight / imgWidth > maxHeight / maxWidth) {
            canvasHeight = maxHeight
            canvasWidth = canvasHeight * imgWidth / imgHeight
          } else {
            canvasWidth = maxWidth
            canvasHeight = canvasWidth * imgHeight / imgWidth
          }
          
          // 定位居中
          let canvasLeft = (maxWidth - canvasWidth) / 2
          let canvasTop = (maxHeight - canvasHeight) / 2 + menuBtnBottom

          let windowWidth = device.windowWidth

          let menuBtnTop = menuBtnInfo.top
          let menuBtnHeight = menuBtnInfo.height
          let colorBarWidth = device.windowWidth - 60

          this.setData({
            windowWidth,
            menuBtnTop,
            menuBtnHeight,
            colorBarWidth,
            imgUrl: res.path,
            canvasWidth,
            canvasHeight,
            canvasLeft,
            canvasTop
          })

          this.canvas.width = canvasWidth * device.pixelRatio
          this.canvas.height = canvasHeight * device.pixelRatio
          this.rate = this.canvas.width / this.data.canvasWidth //设置比例
          gRate.num = this.rate

          this.initCanvas()
          this.addImage()

        },
        fail: (e) => {
          console.log(e);
        },
        complete: () => {
          wx.hideLoading()
        }
      })
    },

    // 退出
    bindQuit(e) {
      if (this.nodes.length > 0) {
        wx.showModal({
          title: '提示',
          content: '您编辑的图片还未保存，退出后将失效，是否确认退出？',
          cancelText: '确定退出',
          confirmText: '去保存',
          success: res => {
            if (res.confirm) {
              this.exportImage()
            } else if (res.cancel) {
              this.triggerEvent("quit")
            }
          }
        })
      } else {
        this.triggerEvent("quit")
      }
    },
    bindUndo(e) {
      if (this.nodesUndo.length < 1) {
        wx.showToast({
          title: '不能再回退了',
          icon: 'none'
        })
        return
      }

      let tmpItem = this.nodesUndo.pop()
      this.nodesRedo.push(tmpItem)

      let lastItem = this.nodesUndo[this.nodesUndo.length - 1] || []
      this.nodes = clone(lastItem)

      this.redrawAll()
    },
    bindRedo(e) {
      if (this.nodesRedo.length < 1) {
        wx.showToast({
          title: '没有内容可恢复了',
          icon: 'none'
        })
        return
      }

      let tmpItem = this.nodesRedo.pop()
      if (tmpItem.length > 0) {
        this.nodesUndo.push(tmpItem)
      }

      this.nodes = clone(tmpItem)
      this.redrawAll()
    },
    bindNullTap(e) {

    },
    drawMicroscope() {
      return //TODO
      if (!this.curPoint) return // || !this.bolStartDraw

      let sw = gNum(80)
      let sh = gNum(80)
      let sx = this.curPoint.x - sw / 2
      let sy = this.curPoint.y - sh / 2


      let dw = sw * 2
      let dh = sh * 2
      let dx = this.curPoint.x - dw / 2
      let dy = this.curPoint.y - dh / 2
      dy -= dh / 2 + gNum(40)

      let r = dw / 2
      let cx = dx + r
      let cy = dy + r



      this.ctx.save()
      this.ctx.beginPath()
      this.ctx.arc(cx, cy, r, 0, 2 * Math.PI)
      this.ctx.closePath()
      // 从画布上裁剪出这个圆形
      this.ctx.clip()

      let tmpRate = this.img.width / this.canvas.width
      this.ctx.drawImage(this.img, sx * tmpRate, sy * tmpRate, sw * tmpRate, sh * tmpRate, dx, dy, dw, dh)

      // this.ctx.restore()

      // this.ctx.save()

      this.ctx.strokeStyle = '#aaa'
      this.ctx.lineWidth = gRound(2)

      this.ctx.beginPath()
      this.ctx.arc(cx, cy, r, 0, 2 * Math.PI)
      this.ctx.stroke()

      this.ctx.restore()
    }
  }
})