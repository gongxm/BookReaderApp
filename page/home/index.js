const config = require('../../config')
const constants = require('../../utils/constants')


var app = getApp()

Page({
  data: {
    books: [],
    animation: {}
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
  loadData: function () {
    var self = this
    wx.getStorage({
      key: constants.STORAGE_BOOK_LIST,
      success: function (res) {
        var books = res.data
        if (books) {
          self.setData({ books: books })
        }
      },

      fail: function (res) {
       
      },
      complete: function () {
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

//触摸事件
  onTouch:function(e){
    let that = this;
    //触摸时间距离页面打开的毫秒数  
    var touchTime = that.data.touch_end - that.data.touch_start;  
    //如果按下时间大于350为长按  
    if (touchTime > 300){
      that.delete(e)
    }else{//短按
      that.readBook(e)
    }

  },


  //点击阅读
  readBook: function (e) {
    var self = this
    var index = e.currentTarget.id
    var book = self.data.books[index]
    var position = book.position
    if (!position) {
      position = 0
    }

    var bookid = String(book.id)

    //获取到列表
    wx.getStorage({
      key: bookid,
      success: function (res) {
        var chapters = res.data
        var chapter = chapters[0]
        for (var i = 0; i < chapters.length; i++) {
          if (chapters[i].position == position) {
            chapter = chapters[i]
            break;
          }
        }
        wx.navigateTo({
          url: '../book/readView/readView?chapterid=' + chapter.id + '&chapter_name=' + chapter.chapter_name + '&bookid=' + bookid + '&position=' + position + '&book_name=' + book.book_name,
        })
      },
      fail: (res) => {
        wx.navigateTo({
          url: '../book/bookChapterList/bookChapterList?bookid=' + bookid + '&book_name=' + book.book_name,
        })
      },
      complete: (res) => {
        if (wx.hideLoading) {
          wx.hideLoading()
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

  },


  //触摸按下
  touchStart:function(e){
    let that = this;
    that.setData({
      touch_start: e.timeStamp
    })  
  },

  //触摸结束
  touchEnd: function (e) {
    let that = this;
    that.setData({
      touch_end: e.timeStamp
    })  
  }

});