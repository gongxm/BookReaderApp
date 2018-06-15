const getRecommend = require('../../../config').getRecommend
const constants = require('../../../utils/constants')
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    category: '',
    loading: false,
    books: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var category = options.category
    var self = this;

    self.setData({
      category: category
    })

    self.loadData()
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

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  //返回书架
  go_home: function() {
    app.go_home();
  },

  //逛逛书城
  go_category_list: function() {
    app.go_category_list();
  },

  //返回分类
  go_category: function(e) {
    var self = this
    var category = self.data.category
    app.go_category(category);
  },

  /*
   跳转到书籍信息页面
  */
  navigateToBook: function(e) {
    var self = this
    var book = self.data.books[e.currentTarget.id]
    app.navigateToBook(book.id)
  },

  navigateToRecommendBook: function(e) {
    var self = this
    var book = self.data.recommend[e.currentTarget.id]
    app.navigateToBook(book.id)
  },


  //加载数据
  loadData: function() {
    var self = this
    wx.showLoading({
      title: constants.LOADING,
      mask: true
    })


    self.setData({
      loading: true
    })

    wx.request({
      url: getRecommend,
      data: {
        category: self.data.category,
        type:'all'
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.data.errcode == 1) {
          var books = res.data.books;
          var recommend = res.data.recommend;
          self.setData({
            books: books,
            recommend: recommend
          })
        }
      },

      fail: function(res) {
        wx.showToast({
          title: constants.DATA_NOT_FOUNT,
          icon: 'success',
          duration: 2000
        })
      },
      complete() {
        self.setData({
          loading: false
        })
        if (wx.hideLoading) {
          wx.hideLoading()
        }
      }
    })

  },


  //换一换
  change: function(e) {
    var self = this
    wx.showLoading({
      title: constants.LOADING,
      mask: true
    })


    wx.request({
      url: getRecommend,
      data: {
        category: self.data.category,
        type: 'recommend'
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.errcode == 1) {
          var recommend = res.data.recommend;
          self.setData({
            recommend: recommend
          })
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
        if (wx.hideLoading) {
          wx.hideLoading()
        }
      }
    })
  }
})