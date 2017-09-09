// bookChapterList.js
const getChapterList = require('../../../config').getChapterList
const constants = require('../../../utils/constants')
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    bookid: '',
    chapters: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    var bookid = options.bookid
    self.setData({ bookid: bookid })

    wx.showLoading({
      title: constants.LOADING,
      mask: true
    })
    //获取到列表
    wx.getStorage({
      key: bookid,
      success: function (res) {
        var list = res.data
        if (list && list.length > 0) {
          self.setData({ chapters: list })
        } else {
          self.loadData()
        }
      },
      fail: (res) => {
        self.loadData()
      },
      complete: (res) => {
          if (wx.hideLoading) {
            wx.hideLoading()
          }
      }
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

  //加载数据
  loadData: function () {
    var self = this
    wx.showLoading({
      title: constants.LOADING,
      mask: true
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


  //跳转到内容页面
  navigateToBook: function (e) {
    var self = this
    var index = e.currentTarget.id
    var chapters = self.data.chapters
    var chapter = chapters[index]
    wx.redirectTo({
      url: '../readView/readView?chapterid=' + chapter.id + '&chapter_name=' + chapter.chapter_name + '&bookid=' + self.data.bookid + '&position=' + chapter.position,
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadData()
  }


})