const config = require('../../config')
const constants = require('../../utils/constants')
const rpn = require('../../utils/rpn')

var app = getApp()

Page({
  data: {
    books: [],
    animation: {},
    permissions: '',
    id1: "back",
    id2: "clear",
    id3: "negative",
    id4: "+",
    id5: "9",
    id6: "8",
    id7: "7",
    id8: "-",
    id9: "6",
    id10: "5",
    id11: "4",
    id12: "×",
    id13: "3",
    id14: "2",
    id15: "1",
    id16: "÷",
    id17: "0",
    id18: ".",
    id20: "=",
    screenData: "0",
    lastIsOperator: false,
    lastIsEq: false,
    lastIsPoint: false,
    lastIsNum: false,
    logs: []
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
    this.flushData()
  },


  flushData: function () {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      permissions: app.globalData.userInfo.permissions
    })

    if (app.globalData.userInfo.thirdSession) {
      if (app.globalData.userInfo.permissions == 'TEST') {
        wx.setNavigationBarTitle({
          title: '计算器',
        })
      } else {
        wx.setNavigationBarTitle({
          title: '阅读窝',
        })
        this.loadData()
      }
    }
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

                    //移除书籍对应的章节列表
                    wx.removeStorage({
                      key: book.id.toString(),
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
        var chapters = res.data.chapters
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
    this.flushData()
  },

  /**
   * 上拉加载
   */
  onReachBottom: function (e) {

  },

  // ===================计算器逻辑===============================


  clickButton: function (event) {
    var data = this.data.screenData.toString();
    var id = event.target.id;

    var lastIsEq = this.data.lastIsEq

    if (lastIsEq) {
      data = 0;
    }

    if (id == this.data.id1) {  //back
      if (data == 0) {
        return;
      }
      var data = data.substring(0, data.length - 1);
    } else if (id == this.data.id2) { //clear
      data = 0;
      this.setData({
        lastIsOperator: false,
        lastIsEq: false,
        lastIsPoint: false
      })
    } else if (id == this.data.id3) {  // +/-
      var firstWord = data.substring(0, 1);
      if (firstWord != '-') {
        data = '-' + data;
      } else {
        data = data.substring(1);
      }
    } else if (id == this.data.id20) {// =
      if (data == 0) {
        return;
      }

      if (this.data.lastIsPoint && !this.data.lastIsNum) {
        data = data + '0'
      }

      var lastWord = data.substring(data.length - 1, data.length);
      if (isNaN(lastWord)) {
        return;
      }
      if (parseFloat(data) == data) {
        return;
      }
      var log = data;
      var data = rpn.calCommonExp(data);
      log = log + '=' + data;
      this.data.logs.push(log);
      wx.setStorageSync('callogs', this.data.logs);

      this.setData({ lastIsEq: true, lastIsPoint: false, lastIsNum: true });
    } else {
      if (id == this.data.id4 || id == this.data.id8 || id == this.data.id12 || id == this.data.id16) {
        if (this.data.lastIsOperator || data == 0) {
          return;
        }
      }


      if (id == this.data.id18) {
        if (this.data.lastIsPoint) {
          return;
        }
        this.setData({ lastIsPoint: true, lastIsNum: false })
        if (this.data.lastIsOperator) {
          data = data + '0'
        }
      } else if (id == this.data.id5 || id == this.data.id6 || id == this.data.id7 ||
        id == this.data.id9 || id == this.data.id10 || id == this.data.id11 ||
        id == this.data.id13 || id == this.data.id14 || id == this.data.id15) {
        this.setData({ lastIsNum: true })
      }


      if (id == this.data.id4 || id == this.data.id8 || id == this.data.id12 || id == this.data.id16) {
        if (this.data.lastIsPoint && !this.data.lastIsNum) {
          data = data + '0'
        }
        this.setData({ lastIsOperator: true, lastIsPoint: false });
      } else {
        this.setData({ lastIsOperator: false })
      }

      if (data == 0) {
        data = id;
      } else {
        data = data + id
      }
    }
    if (id != this.data.id20) {
      this.setData({ lastIsEq: false });
    }


    this.setData({
      screenData: data
    })
  },

  /**
  * 打开小程序设置界面
  */
  openUserInfoSetting: function () {
    var self = this
    wx.openSetting({
      success: (res) => {
        if (wx.getSetting) {
          wx.getSetting({
            success: (res) => {
              var authSetting = res.authSetting
              if (res.authSetting['scope.userInfo']) {
                app.login(self)
              }
            }
          })
        }
      },
      fail: (res) => {

      },
      complete: (res) => {

      }
    })
  },


});