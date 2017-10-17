const config = require('../../config')
const constants = require('../../utils/constants')


var app = getApp()

Page({
  data: {
    books: [],
    animation: {},
    permissions: '',
    inputValue: ''
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
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      permissions: app.globalData.userInfo.permissions
    })
    if (app.globalData.userInfo.permissions == 'USER') {
      wx.setNavigationBarTitle({
        title: '阅读窝',
      })
      this.loadData()
    } else {
      var self = this
      wx.getStorage({
        key: constants.STORAGE_PLAN_LIST,
        success: function (res) {
          var list = res.data;
          if (list && list.length > 0) {
            self.setData({ plan: list })
          }

        }
      })
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
    this.loadData()
  },

  /**
   * 上拉加载
   */
  onReachBottom: function (e) {

  },

  // bindKeyInput: function (e) {
  //   this.setData({
  //     inputValue: e.detail.value
  //   })
  // },

  //添加计划
  add_plan: function (e) {
    var self = this
    var value = e.detail.value

    if (!value || value == '') {
      wx.showToast({
        title: '请输入内容!',
      })

      return;
    }

    var item = { checked: false, value: value }
    wx.getStorage({
      key: constants.STORAGE_PLAN_LIST,
      success: function (res) {
        var list = res.data;
        if (!list) {
          list = [];
        }
        list.push(item);

        wx.setStorage({
          key: constants.STORAGE_PLAN_LIST,
          data: list,
        })
        self.setData({ inputValue: '', plan: list })
      },
      fail: function (res) {
        var list = []
        list.push(item);

        wx.setStorage({
          key: constants.STORAGE_PLAN_LIST,
          data: list,
        })
        self.setData({ inputValue: '', plan: list })
      },
      complete: function (res) {
      }
    })
  },


  //单选按钮选择事件
  change: function (e) {
    var index = e.currentTarget.id
    var self = this
    var plan = self.data.plan
    if (plan && plan.length > 0) {
      var item = plan[index]
      var value = item.checked
      item.checked = !value
      self.setData({ plan: plan })
    }
  },

  //全选按钮
  selectAll: function (e) {
    var self = this
    var plan = self.data.plan
    if (plan && plan.length > 0) {
      for (var i = 0; i < plan.length; i++) {
        var item = plan[i]
        var value = item.checked
        item.checked = true
      }
      self.setData({ plan: plan })
    }
  },

  //删除计划
  delete_plan: function (e) {
    var self = this
    var plan = self.data.plan
    if (plan && plan.length > 0) {
      for (var i = 0; i < plan.length; i++) {
        var item = plan[i]
        var value = item.checked
        if (value) {
          plan.splice(i, 1)
          i--
        }
      }
      wx.setStorage({
        key: constants.STORAGE_PLAN_LIST,
        data: plan,
      })
      self.setData({ plan: plan })
    }
  },

  //STORAGE_PLAN_HISTORY
  //设置计划为完成状态
  setFinish: function (e) {
    var self = this
    var plan = self.data.plan
    var history = []
    if (plan && plan.length > 0) {
      for (var i = 0; i < plan.length; i++) {
        var item = plan[i]
        var value = item.checked
        if (value) {
          history.push(item)
          plan.splice(i, 1)
          i--
        }
      }
      wx.setStorage({
        key: constants.STORAGE_PLAN_LIST,
        data: plan,
      })
      self.setData({ plan: plan })

      //把删除的计划添加到历史记录中
      if (history && history.length > 0) {
        wx.getStorage({
          key: constants.STORAGE_PLAN_HISTORY,
          success: function (res) {
            var list = res.data
            if (!list) {
              list = []
            }
            for (var i = 0; i < history.length; i++) {
              var item = history[i]
              list.push(item)
            }

            wx.setStorage({
              key: constants.STORAGE_PLAN_HISTORY,
              data: list,
            })
          },
          fail: function (res) {
            var list = []
            for (var i = 0; i < history.length; i++) {
              var item = history[i]
              list.push(item)
            }

            wx.setStorage({
              key: constants.STORAGE_PLAN_HISTORY,
              data: list,
            })
          }
        })
      }
    }
  }


});