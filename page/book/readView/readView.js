const getBookChapter = require('../../../config').getBookChapter
const constants = require('../../../utils/constants')
var app = getApp()
var isLoading = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    size: 16,//页面字体大小
    top_animation: {},
    bottom_animation: {},
    showControl: false,
    loading: false,
    chapterid: '',
    chapter_name: '',
    bookid: '',
    position: '',
    content: '',
    book_name: '',
    bt_class: 'no_data'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var chapterid = options.chapterid
    var chapter_name = options.chapter_name
    var bookid = options.bookid
    var position = options.position
    var book_name = options.book_name

    var self = this;

    self.setData({
      chapterid: chapterid,
      chapter_name: chapter_name,
      bookid: bookid,
      position: position,
      book_name: book_name
    })

    //获取设置信息
    wx.getStorage({
      key: constants.FONT_SIZE,
      success: function (res) {
        var size = res.data
        if (size) {
          self.setData({ size: size })
        }
      },
    })

    self.loadData()
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

    if (isLoading) {
      return
    }
    isLoading = true
    var self = this

    self.setData({ loading: true, content: '' })

    wx.showLoading({
      title: constants.LOADING,
      mask: true
    })
    //设置标题栏
    wx.setNavigationBarTitle({
      title: self.data.chapter_name
    })

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
          self.setData({ loading: false, content: content, bt_class: 'control' })
        } else {
          self.setData({
            loading: false,
            bt_class: 'no_data'
          })
        }
        //把当前读取的章节信息记录到书籍中
        wx.getStorage({
          key: constants.STORAGE_BOOK_LIST,
          success: function (res) {
            var books = res.data
            if (books) {
              for (var i = 0; i < books.length; i++) {
                var book = books[i]
                if (book.id == self.data.bookid) {
                  book.position = self.data.position
                  break;
                }
              }
              //重新存储
              wx.setStorage({
                key: constants.STORAGE_BOOK_LIST,
                data: books,
              })
            }
          }
        })
      },
      fail: function (res) {
        self.setData({
          loading: false
        })
      },
      complete: function () {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
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
        title: '第一章了!',
      })

      return;
    }

    position = position - 1

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
    var self = this
    wx.redirectTo({
      url: '../bookChapterList/bookChapterList?bookid=' + self.data.bookid + '&book_name=' + self.data.book_name,
    })
  },

  //下一章
  nextChapter: function () {
    var self = this
    var position = parseInt(self.data.position) + 1


    //获取到列表
    wx.getStorage({
      key: self.data.bookid,
      success: function (res) {
        var list = res.data
        if (list && list.length > 0) {
          if (position >= list.length) {
            wx.showToast({
              title: '最后一章了!',
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
  //回到书架
  go_home: function (e) {
    wx.reLaunch({
      url: '../../home/index',
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadData()
  },

  //显示控制按钮
  showControl: function (e) {
    var animation = wx.createAnimation({
      transformOrigin: "50% 50%",
      duration: 300,
      timingFunction: 'ease',
      delay: 0
    })
    this.setData({ showControl: !this.data.showControl, top_animation: animation.export(), bottom_animation: animation.export() })
    if (this.data.showControl) {
      setTimeout(function () {
        animation.translate(0, 80).step()
        this.setData({
          top_animation: animation.export()
        })
      }.bind(this), 1)

      setTimeout(function () {
        animation.translate(0, -100).step()
        this.setData({
          bottom_animation: animation.export()
        })
      }.bind(this), 1)
    } else {
      setTimeout(function () {
        animation.translate(0, -80).step()
        this.setData({
          top_animation: animation.export()
        })
      }.bind(this), 1)

      setTimeout(function () {
        animation.translate(0, 100).step()
        this.setData({
          bottom_animation: animation.export()
        })
      }.bind(this), 1)
    }
  },

  //移动页面时,隐藏控制按钮
  hiddenControl: function (e) {
    var self = this
    console.log('show control=' + self.data.showControl)
    if (self.data.showControl) {
      var animation = wx.createAnimation({
        transformOrigin: "50% 50%",
        duration: 300,
        timingFunction: 'ease',
        delay: 0
      })
      self.setData({ showControl: !this.data.showControl, top_animation: animation.export(), bottom_animation: animation.export() })
      self.setData({ showControl: false })
      setTimeout(function () {
        animation.translate(0, -80).step()
        this.setData({
          top_animation: animation.export()
        })
      }.bind(this), 1)

      setTimeout(function () {
        animation.translate(0, 100).step()
        this.setData({
          bottom_animation: animation.export()
        })
      }.bind(this), 1)
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },


  //缩小字体
  font_size_sub: function (e) {
    let self = this;
    let size = self.data.size;
    if (size > 10) {
      size--;
      self.setData({ size: size })

      //存储设置的字体信息
      wx.setStorage({
        key: constants.FONT_SIZE,
        data: size,
      })
    } else {
      wx.showToast({
        title: '已经是最小了!',
      })
    }
  },

  //放大字体

  font_size_add: function (e) {
    let self = this;
    let size = self.data.size;
    if (size < 20) {
      size++;
      self.setData({ size: size })
      //存储设置的字体信息
      wx.setStorage({
        key: constants.FONT_SIZE,
        data: size,
      })
    } else {
      wx.showToast({
        title: '已经是最大了!',
      })
    }
  },

})