const config = require('../../config')



var app = getApp()

Page({
  data: {
    books: [
      {
        name: '语文语文语文语文',
        url: '',
        icon: '../../images/book_store_selected.png'
      },

      {
        name: '数学',
        url: '',
        icon: '../../images/book_store_selected.png'
      },
      {
        name: '英语',
        url: '',
        icon: '../../images/book_store_selected.png'
      }
    ]
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


  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function () {

  },

  /**
   * 上拉加载
   */
  onReachBottom: function (e) {

  }


});