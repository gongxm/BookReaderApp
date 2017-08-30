// bookChapterList.js
const getChapterList = require('../../../config').getChapterList
const constants = require('../../../utils/constants')
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookid:'',
    chapters: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    self.setData({ bookid: options.bookid})
    this.loadData()
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

  //加载数据
  loadData: function () {
    var self = this
    wx.showToast({
      title: constants.LOADING,
    })
    wx.request({
      url: getChapterList,
      data: {
        id: self.data.bookid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.errcode == 1) {
          var chapters = res.data.result
          self.setData({ chapters: chapters })
          //存储数据
          wx.setStorage({
            key: self.data.bookid,
            data: chapters,
          })
        }
      },
      complete: function () {
        wx.stopPullDownRefresh()
        if (wx.hideLoading) {
          wx.hideLoading()
        }
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
    this.loadData()
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

  }
})