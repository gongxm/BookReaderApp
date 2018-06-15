const constants = require('../../../utils/constants')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    books:[]
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
    var self = this
    //查询历史记录
    wx.getStorage({
      key: constants.STORAGE_HISTORY,
      success: function (res) {
        var books = res.data;
        if (!books) {
            books = []
        }
        self.setData({books:books})
      }
    })
  },

  //显示书籍详情
  navigateToBook: function (e) {
    var self = this
    var book = self.data.books[e.currentTarget.id]
    app.navigateToBook(book.id)
  },

  //回到主页
  go_home: function (e) {
    app.go_home()
  },

  //返回分类列表
  go_category_list: function () {
    app.go_category_list();
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
   * 清空历史
   */
  clear:function(e){
    wx.vibrateLong()

    var self = this

    wx.showModal({
      title: '提示',
      content: '是否清空浏览历史记录?',
      confirmText: '清空',
      confirmColor: '#f00',
      success:function(res){
        if(res.confirm){
          wx.removeStorage({
            key: constants.STORAGE_HISTORY,
            success: function (res) {
              wx.showToast({
                title: '清空成功!',
              })

              self.setData({ books: [] })
            },
            fail: function (res) {
              wx.showToast({
                title: '清空失败!',
              })
            }
          })
        }
      }
    })
  }
})