const config = require('../../config')
const constants = require('../../utils/constants')


var app = getApp()

Page({
  data: {
    books: []
  },

  /**
   * 页面初始化 options为页面跳转所带来的参数
   */
  onLoad: function (options) {

  },

  /**
   * 页面渲染完成
   */
  onReady: function () {

  },

  /**
   * 界面显示时调用
   */
  onShow: function () {
   this.loadData()

  },

  //加载数据
  loadData:function(){
    var self = this
    wx.getStorage({
      key: constants.STORAGE_BOOK_LIST,
      success: function (res) {
        var books = res.data
        if (books) {
          self.setData({ books: books })
        }
      },
      complete:function(){
        wx.stopPullDownRefresh()
      }
    })
  },

  //删除内容
  delete: function (e) {
    var self = this
    var index = e.currentTarget.id
    var book = self.data.books[index]
    wx.showModal({
      title: '删除:',
      content: '确定要删除: ' + book.book_name + ' 吗?',
      confirmText: '删除',
      confirmColor: '#f00',
      success: function (res) {
        if (res.confirm) {
          wx.getStorage({
            key: constants.STORAGE_BOOK_LIST,
            success: function (res) {
              var books = res.data
              if (books) {
                books.splice(index, 1)

                self.setData({ books: books })

                wx.setStorage({
                  key: constants.STORAGE_BOOK_LIST,
                  data: books,
                  success: function (res) {
                    wx.showToast({
                      title: '删除成功',
                      duration: 2000
                    })
                  },
                  fail: function (res) {
                    wx.showToast({
                      title: '删除失败,请重试',
                      duration: 2000
                    })
                  }
                })
              }
            },
          })
        }
      }
    })
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {
    this.loadData()
  },

  /**
   * 上拉加载
   */
  onReachBottom: function (e) {

  }


});