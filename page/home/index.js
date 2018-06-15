const config = require('../../config')
const constants = require('../../utils/constants')
const rpn = require('../../utils/rpn')
const getChapterList = require('../../config').getChapterList
const updateUserBookStore = require('../../config').updateUserBookStore
const getBookDetail = require('../../config').getBookDetail
const date = require('../../utils/date')

var app = getApp()
var firstLoad = true
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
    type: false,
    logs: []
  },

  /**
   * 页面初始化 options为页面跳转所带来的参数
   */
  onLoad: function(options) {

  },

  /**
   * 页面渲染完成
   */
  onReady: function() {

  },

  /**
   * 界面显示时调用
   */
  onShow: function() {
    this.flushData()
  },


  //刷新界面
  flushData: function() {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      permissions: app.globalData.userInfo.permissions
    })

    if (app.globalData.userInfo.thirdSession) {
      if (app.globalData.userInfo.permissions == 'TEST') {
        wx.setNavigationBarTitle({
          title: '计算器',
        })
        var logs = wx.getStorageSync('callogs');
        if (!logs) {
          logs = []
        }
        this.setData({
          logs: logs
        })
        wx.stopPullDownRefresh()
      } else {
        wx.setNavigationBarTitle({
          title: '阅读窝',
        })

        var self = this
        self.loadData()
      }
    }
  },

  //加载数据
  loadData: function() {
    var self = this
    self.updateUI()

    //获取设置信息
    wx.getStorage({
      key: constants.SETTING,
      success: function(res) {
        var setting = res.data
        if (setting) {
          let type = setting.type;
          if (type) {
            self.setData({
              type: type
            })
          }
        }
      },
    })
  },


  //更新界面
  updateUI: function() {
    var self = this
    var books = wx.getStorageSync(constants.STORAGE_BOOK_LIST)
    if (books) {
      for (var i = 0; i < books.length; i++) {
        books[i].lastUpdate = date.simpletop_timestamps(books[i].lastUpdateTime)
      }
    } else {
      books = []
    }

    self.setData({
      books: books
    })

    if (firstLoad) {
      firstLoad = false;
      self.updateBookStore()
    }

    wx.stopPullDownRefresh()
  },


  //更新书架及配置
  updateBookStore: function() {

    var self = this

    var thirdSession = app.globalData.userInfo.thirdSession

    if (thirdSession) {
      wx.getStorage({
        key: constants.STORAGE_BOOK_LIST,
        success: function(res) {
          var books = res.data
          var store = []
          if (books) {
            for (var i = 0; i < books.length; i++) {
              var book = books[i];
              store.push(book.id)
            }
          }

          var setting = wx.getStorageSync(constants.SETTING)

          wx.request({
            url: updateUserBookStore,
            data: {
              thirdSession: thirdSession,
              store: store,
              setting: setting,
              type: 'update'
            },
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            success: (res) => {
              if (res.data.errcode == 1) {

                var setting = res.data.setting

                if (setting)
                  wx.setStorage({
                    key: constants.SETTING,
                    data: setting,
                  })

                var list = res.data.list
                var books = wx.getStorageSync(constants.STORAGE_BOOK_LIST)

                if (!books) {
                  books = []
                }

                for (var i = 0; i < list.length; i++) {
                  var book = list[i]
                  books.push(book)
                }

                wx.setStorage({
                  key: constants.STORAGE_BOOK_LIST,
                  data: books,
                  complete: () => {
                    self.loadData()
                    self.updateBook()
                  }
                })



              }
            }
          })

        },

        fail: function(res) {
          var store = []

          var setting = wx.getStorageSync(constants.SETTING)

          wx.request({
            url: updateUserBookStore,
            data: {
              thirdSession: thirdSession,
              store: store,
              setting: setting,
              type: 'update'
            },
            method: 'POST',
            header: {
              'content-type': 'application/json'
            },
            success: (res) => {
              if (res.data.errcode == 1) {
                var setting = res.data.setting

                if (setting)
                  wx.setStorage({
                    key: constants.SETTING,
                    data: setting,
                  })

                var list = res.data.list

                var books = wx.getStorageSync(constants.STORAGE_BOOK_LIST)

                if (!books) {
                  books = []
                }

                for (var i = 0; i < list.length; i++) {
                  var book = list[i]
                  books.push(book)
                }

                wx.setStorage({
                  key: constants.STORAGE_BOOK_LIST,
                  data: books,
                  complete: () => {
                    self.loadData()
                    self.updateBook()
                  }
                })


              }
            }
          })
        },
        complete: function() {

        }
      })
    }

  },



  //更新书架中的书籍
  updateBook: function() {
    var self = this

    var books = self.data.books
    if (books && books.length > 0) {
      for (var i = 0; i < books.length; i++) {
        var book = books[i]

        wx.request({
          url: getBookDetail,
          data: {
            id: book.id
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            if (res.data.errcode == 1) {
              var book = res.data.book

              if (book) {

                var lastChapter = book.lastChapter

                //本地的章节列表
                wx.getStorage({
                  key: book.id,
                  success: function(res) {
                    var chapters = res.data.chapters
                    if (chapters && chapters.length > 0) {
                      if (lastChapter != chapters[chapters.length - 1].chapter_name && lastChapter != chapters[0].chapter_name) {
                        var reg = new RegExp("<br />", "g");
                        var reg2 = new RegExp("</p>", "g");
                        book.shortIntroduce = book.shortIntroduce.replace(reg, '\n').replace(reg2, '\n')
                        book.lastUpdate = date.simpletop_timestamps(book.lastUpdateTime)
                        book.update = true

                        //更新书籍状态
                        wx.getStorage({
                          key: constants.STORAGE_BOOK_LIST,
                          success: function(res) {
                            var books = res.data
                            if (books) {
                              for (var i = 0; i < books.length; i++) {
                                var temp = books[i]
                                if (temp.id == book.id) {
                                  books[i] = book
                                  break
                                }
                              }

                              wx.setStorage({
                                key: constants.STORAGE_BOOK_LIST,
                                data: books,
                                success: (res) => {
                                  self.updateUI()
                                }
                              })
                              //更新列表
                              self.updateBookChapter(book.id)
                            }
                          },
                        })
                      }
                    }
                  },


                  fail: () => {
                    var reg = new RegExp("<br />", "g");
                    var reg2 = new RegExp("</p>", "g");
                    book.shortIntroduce = book.shortIntroduce.replace(reg, '\n').replace(reg2, '\n')
                    book.lastUpdate = date.simpletop_timestamps(book.lastUpdateTime)
                    book.update = true

                    //更新书籍状态
                    wx.getStorage({
                      key: constants.STORAGE_BOOK_LIST,
                      success: function(res) {
                        var books = res.data
                        if (books) {
                          for (var i = 0; i < books.length; i++) {
                            var temp = books[i]
                            if (temp.id == book.id) {
                              books[i] = book
                              break
                            }
                          }

                          wx.setStorage({
                            key: constants.STORAGE_BOOK_LIST,
                            data: books,
                            success: (res) => {
                              self.updateUI()
                            }
                          })
                        }
                      },
                    })
                    /* var books = wx.getStorageSync(constants.STORAGE_BOOK_LIST)

                    if (books) {
                      for (var i = 0; i < books.length; i++) {
                        var temp = books[i]
                        if (temp.id == book.id) {
                          books[i] = book
                          break
                        }
                      }

                      wx.setStorageSync(constants.STORAGE_BOOK_LIST, books)

                      self.updateUI()
                    }
*/

                    //更新列表
                    self.updateBookChapter(book.id)
                  }
                })
              }
            }
          }
        })



      }
    }


  },



  //更新书箱章节列表
  updateBookChapter: function(bookid) {
    wx.request({
      url: getChapterList,
      data: {
        id: bookid
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.data.errcode == 1) {
          var chapters = res.data.result
          if (chapters && chapters.length > 0) {
            var chapter = chapters[0]
            if (chapter) {
              //获取到列表
              wx.getStorage({
                key: bookid,
                success: function(res) {
                  var data = res.data
                  if (data) {
                    data.chapters = chapters
                    //存储列表数据
                    wx.setStorage({
                      key: bookid,
                      data: data,
                    })
                  }
                },
                fail: (res) => {

                  var data = {
                    chapters: chapters,
                    sort: 1
                  }
                  //存储列表数据
                  wx.setStorage({
                    key: bookid,
                    data: data,
                  })

                }
              })
            }
          }
        }
      }
    })
  },









  //抽取排序功能
  sort: function(list, sort, bookid) {
    var self = this
    //反序
    if (sort == 2) {
      list.sort(function(a, b) {
        return b.position - a.position
      });
    } else { //正序
      list.sort(function(a, b) {
        return a.position - b.position
      });
    }

    wx.getStorage({
      key: bookid,
      success: function(res) {
        var data = res.data
        if (data) {
          data.sort = sort
          //存储数据
          wx.setStorage({
            key: bookid,
            data: data,
          })
        }
      }
    })
  },

  //删除内容
  delete: function(e) {
    //手机振动
    wx.vibrateLong()

    var self = this
    var index = e.currentTarget.id
    var book = self.data.books[index]
    wx.showModal({
      title: '删除:',
      content: '确定要删除: ' + book.book_name + ' 吗?',
      confirmText: '删除',
      confirmColor: '#f00',
      success: function(res) {
        if (res.confirm) {
          wx.getStorage({
            key: constants.STORAGE_BOOK_LIST,
            success: function(res) {
              var books = res.data
              if (books) {
                books.splice(index, 1)

                self.setData({
                  books: books
                })

                wx.setStorage({
                  key: constants.STORAGE_BOOK_LIST,
                  data: books,
                  success: function(res) {
                    wx.showToast({
                      title: '删除成功',
                      duration: 2000
                    })

                    //移除书籍对应的章节列表
                    wx.removeStorage({
                      key: book.id.toString(),
                    })
                  },
                  fail: function(res) {
                    wx.showToast({
                      title: '删除失败,请重试',
                      duration: 2000
                    })
                  }
                })

                var thirdSession = app.globalData.userInfo.thirdSession
                if (thirdSession) {
                  //删除服务器中的数据
                  var store = []
                  store.push(book.id)

                  wx.request({
                    url: updateUserBookStore,
                    data: {
                      thirdSession: thirdSession,
                      store: store,
                      type: 'del'
                    },
                    method: 'POST',
                    header: {
                      'content-type': 'application/json'
                    }
                  })
                }
              }
            },
          })
        }
      }
    })
  },



  //点击阅读
  readBook: function(e) {
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
      success: function(res) {
        var chapters = res.data.chapters
        var chapter = chapters[0]
        for (var i = 0; i < chapters.length; i++) {
          if (chapters[i].position == position) {
            chapter = chapters[i]
            break;
          }
        }

        var books = self.data.books
        for (var i = 0; i < books.length; i++) {
          var book = books[i]
          if (book.id == bookid) {
            books.splice(i, 1)
            book.update = false
            books.unshift(book)
            wx.setStorage({
              key: constants.STORAGE_BOOK_LIST,
              data: books
            })
            break;
          }
        }

        if (chapter) {
          wx.navigateTo({
            url: '../book/readView/readView?chapterid=' + chapter.id + '&chapter_name=' + chapter.chapter_name + '&bookid=' + bookid + '&position=' + position + '&book_name=' + book.book_name + '&category=' + book.category,
          })
        } else {
          wx.navigateTo({
            url: '../book/bookChapterList/bookChapterList?bookid=' + bookid + '&book_name=' + book.book_name + '&category=' + book.category,
          })
        }
      },
      fail: (res) => {
        wx.navigateTo({
          url: '../book/bookChapterList/bookChapterList?bookid=' + bookid + '&book_name=' + book.book_name + '&category=' + book.category,
        })
      }
    })


  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh: function() {
    firstLoad = true
    this.flushData()
  },

  /**
   * 上拉加载
   */
  onReachBottom: function(e) {

  },

  // ===================计算器逻辑====start===========================


  clickButton: function(event) {
    var data = this.data.screenData.toString();
    var id = event.target.id;

    var lastIsEq = this.data.lastIsEq

    if (lastIsEq) {
      data = 0;
    }

    if (id == this.data.id1) { //back
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
    } else if (id == this.data.id3) { // +/-
      var firstWord = data.substring(0, 1);
      if (firstWord != '-') {
        data = '-' + data;
      } else {
        data = data.substring(1);
      }
    } else if (id == this.data.id20) { // =
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

      this.setData({
        lastIsEq: true,
        lastIsPoint: false,
        lastIsNum: true
      });
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
        this.setData({
          lastIsPoint: true,
          lastIsNum: false
        })
        if (this.data.lastIsOperator) {
          data = data + '0'
        }
      } else if (id == this.data.id5 || id == this.data.id6 || id == this.data.id7 ||
        id == this.data.id9 || id == this.data.id10 || id == this.data.id11 ||
        id == this.data.id13 || id == this.data.id14 || id == this.data.id15) {
        this.setData({
          lastIsNum: true
        })
      }


      if (id == this.data.id4 || id == this.data.id8 || id == this.data.id12 || id == this.data.id16) {
        if (this.data.lastIsPoint && !this.data.lastIsNum) {
          data = data + '0'
        }
        this.setData({
          lastIsOperator: true,
          lastIsPoint: false
        });
      } else {
        this.setData({
          lastIsOperator: false
        })
      }

      if (data == 0) {
        data = id;
      } else {
        data = data + id
      }
    }
    if (id != this.data.id20) {
      this.setData({
        lastIsEq: false
      });
    }


    this.setData({
      screenData: data
    })
  },
  // ===================计算器逻辑====end===========================

  /**
   * 授权获取用户信息
   */
  authorizationGetUserInfo: function(e) {
    app.authorizationGetUserInfo()
  },

  onShareAppMessage: function() {
    // return custom share data when user share.
  },

  change: function(e) {
    var self = this
    var type = !self.data.type
    self.setData({
      type: type
    })

    //获取设置信息
    wx.getStorage({
      key: constants.SETTING,
      success: function(res) {
        var setting = res.data
        if (setting) {
          setting.type = type;
        } else {
          setting = {
            type: type
          }
        }

        wx.setStorage({
          key: constants.SETTING,
          data: setting,
        })
      },
    })

  }

});