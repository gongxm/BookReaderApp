const getBookChapter = require('../../../config').getBookChapter
const constants = require('../../../utils/constants')
var app = getApp()
var isLoading = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    chapterid: '',
    chapter_name: '',
    bookid: '',
    position: '',
    content: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var chapterid = options.chapterid
    var chapter_name = options.chapter_name
    var bookid = options.bookid
    var position = options.position

    this.setData({
      chapterid: chapterid,
      chapter_name: chapter_name,
      bookid: bookid,
      position: position
    })

    this.loadData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    isLoading = false
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
   
  },

  //加载数据
  loadData: function () {

    if(isLoading){
      return
    }

    isLoading = true

    var self = this
    wx.showToast({
      title: constants.LOADING,
    })
    //设置标题栏
    wx.setNavigationBarTitle({
      title: self.data.chapter_name
    })

    console.log(self.data.position)

    wx.request({
      url: getBookChapter,
      data: {
        id: self.data.chapterid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.errcode == 1) {
          var content = res.data.result 
          self.setData({ content: content})
          //回到顶部
          wx.pageScrollTo({
            scrollTop: 0
          })
        }
      },
      complete: function () {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        console.log('加载完成......')
        wx.stopPullDownRefresh()
        isLoading = false
      }
    })
  },


  //上一章
  preChapter: function () {
    var self = this
    var position = self.data.position

    if (position == 0) {
      wx.showToast({
        title: '已经是第一章了!',
      })

      return;
    }

    position = position-1

    //获取到列表
    wx.getStorage({
      key: self.data.bookid,
      success: function (res) {
        var list = res.data
        if (list && list.length > 0) {
          for (var i = 0; i < list.length; i++) {
            var chapter = list[i]
            if (chapter.position == position) {
              self.setData({
                chapterid: chapter.id,
                chapter_name: chapter.chapter_name,
                position: chapter.position
              })
              self.loadData()
            }
          }
        }
      },
    })
  },

  //查看目录
  navigateToList: function () {
    console.log('navigateToList')
    var self = this
    wx.navigateTo({
      url: '../bookChapterList/bookChapterList?bookid='+self.data.bookid,
    })
   },

  //下一章
  nextChapter: function () { 
    var self = this
    var position = parseInt(self.data.position) +1


    //获取到列表
    wx.getStorage({
      key: self.data.bookid,
      success: function (res) {
        var list = res.data
        if (list && list.length > 0) {
          if (position >= list.length) {
            wx.showToast({
              title: '已经是最后一章了!',
            })
            return;
          }
          for (var i = 0; i < list.length; i++) {
            var chapter = list[i]
            if (chapter.position == position) {
              self.setData({
                chapterid: chapter.id,
                chapter_name: chapter.chapter_name,
                position: chapter.position
              })
              self.loadData()
            }
          }
        }
      },
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