const constants = require('../../utils/constants')
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    thirdSession: '',
    userInfo: {},
    currentSize: '',
    limitSize: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      userInfo: app.globalData.userInfo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.flushData()

    this.getStorageInfo()
  },

  flushData: function() {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      userInfo: app.globalData.userInfo
    })
  },

  //获取缓存信息
  getStorageInfo: function() {
    var self = this
    var res = wx.getStorageInfoSync()
    var currentSize = res.currentSize + " KB";
    var limitSize = res.limitSize + " KB";
    self.setData({
      currentSize: currentSize,
      limitSize: limitSize
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      userInfo: app.globalData.userInfo
    })
  },

  //清理缓存
  clear: function(e) {
    var self = this

    //手机振动
    wx.vibrateLong()
    wx.showModal({
      title: '清理缓存',
      content: '确定要清除所有缓存吗?',
      confirmText: '清除',
      confirmColor: '#f00',
      success: function(res) {
        if (res.confirm) {

          wx.showLoading({
            title: '正在清理中...',
          })
          var keys = wx.getStorageInfoSync().keys

          for (var i = 0; i < keys.length; i++) {
            var key = keys[i]
            if (key == constants.SETTING || key == constants.STORAGE_USERINFO || 
            key == constants.STORAGE_BOOK_LIST || key == constants.STORAGE_CATEGORY_LIST) {
              continue;
            }
            wx.removeStorageSync(key)
          }

          self.getStorageInfo()

          wx.hideLoading()
          wx.showToast({
            title: '清理完成!',
            duration: 2000
          })


        }
      }
    })


  },

  /**
   * 显示历史记录
   */

  history: function(e) {
    wx.navigateTo({
      url: './history/history',
    })
  },


  /**
   * 授权获取用户信息
   */
  authorizationGetUserInfo: function(e) {
    app.authorizationGetUserInfo()
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    app.login()
  },


  //跳转到用户管理界面
  manager: function(e) {
    wx.navigateTo({
      url: './manager/manager',
    })
  },

  onShareAppMessage: function() {
    // return custom share data when user share.
  }
})