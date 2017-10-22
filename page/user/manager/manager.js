const getAllUser = require('../../../config').getAllUser
const changePermissions = require('../../../config').changePermissions
const constants = require('../../../utils/constants')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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
    this.flushData()
  },

  flushData: function () {
    var self = this
    wx.request({
      url: getAllUser,
      method: 'POST',
      data: {
        thirdSession: app.globalData.userInfo.thirdSession
      },
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.errcode == 1) {
          var list = res.data.result
          self.setData({ list: list })
        } else {
          wx.showToast({
            title: constants.DATA_NOT_FOUNT,
            image: '../../../images/error.png',
            duration: 2000
          })
        }
      },
      complete: function (e) {
        self.setData({ loading: false })
      }
    })
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

  //切换权限
  changePermissions: function (e) {
    var self = this
    var id = e.target.id
    var user = self.data.list[id]
    var userid = user.id

    wx.showModal({
      title: '确定要切换该账号的权限吗?',
      content: '谨慎操作!!!',
      confirmText: '确定',
      cancelText: '取消',
      confirmColor: '#f00',
      cancelColor: '#3CC51F',
      success: function (res) {
        if (res.confirm) {
          wx.request({
            url: changePermissions,
            method: 'POST',
            data: {
              thirdSession: app.globalData.userInfo.thirdSession,
              id: userid
            },
            header: {
              'content-type': 'application/json'
            },
            success: function (res) {
              if (res.data.errcode == 1) {
                wx.showToast({
                  title: '修改权限成功!',
                })
                self.flushData()
              } else {
                wx.showToast({
                  title: '修改权限失败!',
                  image: '../../../images/error.png',
                  duration: 2000
                })
              }
            },
            complete: function (e) {
              self.setData({ loading: false })
            }
          })
        }
      }
    })

  }
})