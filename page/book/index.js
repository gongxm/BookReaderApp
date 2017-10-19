const getBookCategory = require('../../config').getBookCategory
const constants = require('../../utils/constants')
var app = getApp()
var hasLoadData = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    thirdSession: '',
    categories: [],
    inputValue: '',
    permissions: '',
    iconType: [
      'success', 'success_no_circle', 'info', 'warn', 'waiting', 'cancel', 'download', 'search', 'clear'
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      permissions: app.globalData.userInfo.permissions
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    if (app.globalData.userInfo.permissions == 'USER') {
      hasLoadData = true
      this.loadData()
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      permissions: app.globalData.userInfo.permissions
    })
    if (app.globalData.userInfo.permissions == 'USER') {
      wx.setNavigationBarTitle({
        title: '在线书城',
      })
      if(!hasLoadData){
        hasLoadData = true
        this.loadData()
      }
    } else {
      var self = this
      wx.getStorage({
        key: constants.STORAGE_PLAN_HISTORY,
        success: function (res) {
          var list = res.data;
          if (list && list.length > 0) {
            self.setData({ history: list })
          }

        }
      })
    }
  },



  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadData()
  },




  //加载数据
  loadData: function () {
    var self = this

    self.setData({ loading: true })

    //请求服务器, 获取书籍分类
    wx.request({
      url: getBookCategory,
      data: {
        thirdSession: self.data.thirdSession
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.errcode == 1) {
          var list = res.data.result
          if (list && list.length > 0) {

            var categories = []

            for (var i = 0; i < list.length; i++) {
              var item = {
                name: list[i],
                url: './categoryList/categoryList?category=' + list[i] + '&type=' + constants.CATEGORY_TYPE_NORMAL
              }
              categories.push(item)
            }
            self.setData({ categories: categories, loading: false })
          }
        }
      },
      fail: function (res) {
        wx.showToast({
          title: constants.DATA_NOT_FOUNT,
          icon: 'success',
          duration: 2000
        })
      },
      complete() {
        self.setData({ loading: false })
        wx.stopPullDownRefresh()
      }
    })
  },



  /**
 * 打开小程序设置界面
 */
  openUserInfoSetting: function () {
    var self = this
    wx.openSetting({
      success: (res) => {
        if (wx.getSetting) {
          wx.getSetting({
            success: (res) => {
              var authSetting = res.authSetting
              if (res.authSetting['scope.userInfo']) {
                app.login(self)
              }
            }
          })
        }
      },
      fail: (res) => {

      },
      complete: (res) => {

      }
    })
  },

  //跳转到列表
  navigatoList: function (e) {
    var self = this
    var index = e.currentTarget.id

    var category = self.data.categories[index]

    if (category) {
      wx.navigateTo({
        url: category.url,
      })
    }

  },

  //搜索
  search: function (e) {
    var self = this
    var value = e.detail.value
    if (value == '') {
      wx.showToast({
        title: '请输入搜索内容',
        image: '../../images/warn2.png'
      })
    } else {
      self.setData({
        inputValue: ''
      })
      wx.navigateTo({
        url: './categoryList/categoryList?category=搜索结果&keyword=' + value + '&type=' + constants.CATEGORY_TYPE_SEARCH,
      })
    }
  },



  //显示图标名称
  showType:function(e){
    var self = this
    var index = e.currentTarget.id
    var iconType = self.data.iconType[index]

    wx.showToast({
      title: String(iconType),
    })
  }
})