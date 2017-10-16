// bookChapterList.js
const getChapterList = require('../../../config').getChapterList
const updateBook = require('../../../config').updateBook
const constants = require('../../../utils/constants')
var app = getApp()

var isload = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sort: 1,
    loading: false,
    bookid: '',
    chapters: [],
    book_name: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this
    var bookid = options.bookid
    var book_name = options.book_name
    self.setData({ loading: true, bookid: bookid, book_name: book_name })
    //获取到列表
    wx.getStorage({
      key: bookid,
      success: function (res) {
        var data = res.data
        if (data) {
          var list = data.chapters
          var sort = data.sort
          self.setData({ sort: sort })
          if (list && list.length > 0) {
            self.sort(list)
            self.setData({ loading: false, chapters: list })
          } else {
            self.loadData()
          }
        } else {
          self.loadData()
        }
      },
      fail: (res) => {
        self.loadData()
      },
      complete: (res) => {

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
    if (isload) {
      return
    }
    isload = true
    var self = this
    self.setData({ loading: true })
    wx.stopPullDownRefresh()
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
          self.sort(chapters)
          self.setData({ chapters: chapters, loading: false })
          var data = { chapters: chapters, sort: self.data.sort }
          //存储数据
          wx.setStorage({
            key: self.data.bookid,
            data: data,
          })

        } else {
          self.setData({ loading: false })
        }
      },
      fail: function (res) {
        self.setData({ loading: false })
      },
      complete: function () {
        isload = false;
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
      url: '../readView/readView?chapterid=' + chapter.id + '&chapter_name=' + chapter.chapter_name + '&bookid=' + self.data.bookid + '&position=' + chapter.position + '&book_name=' + self.data.book_name,
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

    this.loadData()

  },

  //更新书籍
  updateBook: function (e) {
    var self = this
    if (isload) {
      return
    }
    isload = true
    wx.showLoading({
      title: '正在更新...',
    })
    wx.request({
      url: updateBook,
      data: {
        id: self.data.bookid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.errcode == 1) {
          isload = false
          self.loadData()
        } else {
          wx.showToast({
            title: '更新失败!',
          })
        }
      },
      complete: function (res) {
        isload = false
        wx.hideLoading()
      }
    })
  },

  //集合排序
  sortList: function (e) {
    var self = this
    var sort = self.data.sort == 1 ? 2 : 1;
    var list = self.data.chapters
    self.setData({
      sort: sort
    })
    self.sort(list)
    self.setData({ chapters: list })
  },

  //抽取排序功能
  sort: function (list) {
    var self = this
    var sort = self.data.sort
    //反序
    if (sort == 2) {
      list.sort(function (a, b) {
        return b.position - a.position
      });
    } else {//正序
      list.sort(function (a, b) {
        return a.position - b.position
      });
    }

    wx.getStorage({
      key: self.data.bookid,
      success: function (res) {
        var data = res.data
        if (data) {
          data.sort = sort
          //存储数据
          wx.setStorage({
            key: self.data.bookid,
            data: data,
          })
        }
      }
    })
  }


})