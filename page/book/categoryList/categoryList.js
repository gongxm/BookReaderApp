// categoryList.js
const getCategoryList = require('../../../config').getCategoryList
const search = require('../../../config').search
const getImageUrl = require('../../../config').getImage
const constants = require('../../../utils/constants')
var app = getApp()

var currentPage = 1
var pageSize = 10
var isLoading = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    category: '',
    books: [],
    over: false,
    type: '1',
    keyword: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var category = options.category
    var type = options.type
    var keyword = options.keyword
    var self = this
    if (category && category != '') {
      self.setData({ category: category, type: type, keyword: keyword })
    }
    currentPage = 1
    isLoading = false
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    var type = this.data.type
    if (type == constants.CATEGORY_TYPE_NORMAL) {
      this.loadData()
    } else if (type == constants.CATEGORY_TYPE_SEARCH) {
      //搜索
      this.search()
    } else {
      wx.showToast({
        title: '错误的类型!',
        image: '../../../images/error.png'
      })
    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var category = this.data.category
    wx.setNavigationBarTitle({
      title: category
    })
  },


  //加载数据
  loadData: function () {

    if (isLoading) {
      return
    }

    isLoading = true

    //获取当前分类的列表内容
    var self = this
    var category = this.data.category
    if (category && category != '') {
      wx.request({
        url: getCategoryList,
        data: {
          category: category,
          currentPage: currentPage,
          pageSize: pageSize
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.errcode == 1) {
            var list = res.data.result;
            if (list && list.length > 0) {
              var books = self.data.books
              for (var i = 0; i < list.length; i++) {
                var item = list[i]
                books.push(item)
              }
              self.setData({ books: books, over: list.length < pageSize })

              //数据加载成功,当前页面自增
              currentPage++
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
          wx.stopPullDownRefresh()
          isLoading = false
        }
      })
    }
  },

  navigateToBook: function (e) {
    var self = this
    var book = self.data.books[e.currentTarget.id]
    wx.navigateTo({
      url: '../bookDetail/bookDetail?id=' + book.id,
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var self = this
    self.setData({ over: false, books: [] })
    currentPage = 1;
    this.loadData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var type = this.data.type
    if (type == constants.CATEGORY_TYPE_NORMAL) {
      this.loadData()
    } else if (type == constants.CATEGORY_TYPE_SEARCH) {
      //搜索
      this.search()
    } else {
      wx.showToast({
        title: '错误的类型!',
        image: '../../../images/error.png'
      })
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  //搜索功能
  search: function () {
    if (isLoading) {
      return
    }

    isLoading = true

    //获取当前分类的列表内容
    var self = this
    var keyword = this.data.keyword
    if (keyword && keyword != '') {
      wx.request({
        url: search,
        data: {
          keyword: keyword,
          currentPage: currentPage,
          pageSize: pageSize
        },
        method: 'POST',
        header: {
          'content-type': 'application/json'
        },
        success: function (res) {
          if (res.data.errcode == 1) {
            var list = res.data.result;
            if (list && list.length > 0) {
              var books = self.data.books
              for (var i = 0; i < list.length; i++) {
                var item = list[i]
                books.push(item)
              }
              self.setData({ books: books, over: list.length < pageSize })

              //数据加载成功,当前页面自增
              currentPage++
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
          wx.stopPullDownRefresh()
          isLoading = false
        }
      })
    }
  }
})