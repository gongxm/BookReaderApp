const images = require("../../images/base64")

var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    thirdSession: '',
    userInfo: {},
    icon:images.icon20
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      userInfo: app.globalData.userInfo
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

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
                console.log("success userInfo")
              }
            }
          })
        }
      },
      fail: (res) => {
        console.log("fail userInfo")
      },
      complete: (res) => {
        console.log("complete userInfo")
      }
    })
  },
})
