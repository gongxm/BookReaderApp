
const getBookDetail = require('../../../config').getBookDetail
const constants = require('../../../utils/constants')
const date = require('../../../utils/date')
const updateUserBookStore = require('../../../config').updateUserBookStore
var app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    exists: false,
    book: '',
    bookid:'',
    books: '',//作者的其他书籍
    recommend: ''//同类推荐
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    var self = this
    self.setData({ bookid:id})
    self.loadData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  onShareAppMessage: function () {
    // return custom share data when user share.
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var self = this
    var bookid = self.data.bookid
    //如果没有加入到书架,删除缓存
    //获取到列表
    wx.getStorage({
      key: constants.STORAGE_BOOK_LIST,
      success: function (res) {
        var books = res.data
        var exists = false
        if (books && books.length > 0) {
          for (var i = 0; i < books.length; i++) {
            var book = books[i]
            if (book.id == bookid) {
              exists = true
              break
            }
          }
        }

        if (!exists) {
          wx.removeStorage({
            key: bookid
          })
        }
      }
    })
  },

  //回到主页
  go_home: function (e) {
    app.go_home()
  },


  //加载数据
  loadData: function () {
    var self = this
    wx.showLoading({
      title: constants.LOADING,
      mask: true
    })

    var bookid = self.data.bookid

    self.setData({ loading: true })
    wx.request({
      url: getBookDetail,
      data: {
        id: bookid,
        type:'normal'
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.errcode == 1) {
          var book = res.data.book
          var reg = new RegExp("<br.?/>", "g");
          var reg2 = new RegExp("</p>", "g");
          book.shortIntroduce = book.shortIntroduce.replace(reg, '\n').replace(reg2, '\n')
          book.lastUpdate = date.simpletop_timestamps(book.lastUpdateTime)
          self.setData({book: book, books: res.data.books, recommend: res.data.recommend })
          //把书籍信息存储到全局变量中
          //app.globalData.book = book
          var exists = false;
          //是否已经加入书架
          wx.getStorage({
            key: constants.STORAGE_BOOK_LIST,
            success: function (res) {
              var books = res.data;
              if (books) {
                for (var i = 0; i < books.length; i++) {
                  var old = books[i]
                  if (old.id == book.id) {
                    exists = true;
                    break;
                  }
                }
              }
            },
            complete: function () {
              self.setData({ exists: exists })
            }
          })

          //加入历史记录
          wx.getStorage({
            key: constants.STORAGE_HISTORY,
            success: function(res) {
              var books = res.data;
              if (books) {
                for (var i = 0; i < books.length; i++) {
                  var old = books[i]
                  if (old.id == book.id) {
                    books.splice(i, 1)
                    break;
                  }
                }
              }else{
                books=[]
              }
              books.unshift(book)
              wx.setStorage({
                key: constants.STORAGE_HISTORY,
                data: books,
              })
            },

            fail:function(res){
              var books = []
              books.unshift(book)
              wx.setStorage({
                key: constants.STORAGE_HISTORY,
                data: books,
              })
            }
          })
        }
      },

      fail: function (res) {
      },
      complete: function () {
        self.setData({ loading: false })
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        wx.stopPullDownRefresh()
      }
    })
  },


  //添加到书架
  addToBookCase: function () {
    var self = this
    wx.getStorage({
      key: constants.STORAGE_BOOK_LIST,
      success: function (res) {
        var book_list = res.data;
        if (!book_list) {
          book_list = []
        }

        var book = self.data.book
        var exists = false
        for (var i = 0; i < book_list.length; i++) {
          var oldBook = book_list[i];
          if (oldBook.id == book.id) {
            exists = true;
            break;
          }
        }
        if (exists) {
          wx.showToast({
            title: '已经加入过书架了!',
            duration: 2000
          })
        } else {
          book.position = 0
          book_list.push(book)
          wx.setStorage({
            key: constants.STORAGE_BOOK_LIST,
            data: book_list,
            success: function (res) {
              self.setData({ exists: true })
              wx.showToast({
                title: '加入书架成功',
                duration: 2000
              })

              //同时添加到服务器
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
                    type: 'add'
                  },
                  method: 'POST',
                  header: {
                    'content-type': 'application/json'
                  }
                })
              }

            },
            fail: function (res) {
              wx.showToast({
                title: '加入书架失败,请重试',
                duration: 2000
              })
            }
          })
        }
      },
      fail: function (res) {
        var book_list = []
        var book = self.data.book
        book_list.push(book)
        wx.setStorage({
          key: constants.STORAGE_BOOK_LIST,
          data: book_list,
          success: function (res) {
            self.setData({ exists: true })
            wx.showToast({
              title: '加入书架成功',
              duration: 2000
            })
          },
          fail: function (res) {
            wx.showToast({
              title: '加入书架失败,请重试',
              duration: 2000
            })
          }
        })
      }
    })
  },

  //从书架移除
  removeFromBookCase: function (e) {
    var self = this
    var book = self.data.book
    wx.showModal({
      title: '移除:',
      content: '确定要移除: ' + book.book_name + ' 吗?',
      confirmText: '移除',
      confirmColor: '#f00',
      success: function (res) {
        if (res.confirm) {
          wx.getStorage({
            key: constants.STORAGE_BOOK_LIST,
            success: function (res) {
              var books = res.data
              if (books) {
                var isSuccess = false;
                for (var i = 0; i < books.length; i++) {
                  var old = books[i];
                  if (old.id == book.id) {
                    books.splice(i, 1)
                    isSuccess = true;
                    break;
                  }
                }
                if (isSuccess) {

                  wx.setStorage({
                    key: constants.STORAGE_BOOK_LIST,
                    data: books,
                    success: function (res) {
                      self.setData({ exists: false })
                      wx.showToast({
                        title: '移除成功',
                        duration: 2000
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
                    },
                    fail: function (res) {
                      wx.showToast({
                        title: '移除失败,请重试',
                        duration: 2000
                      })
                    }
                  })


                  //删除章节目录
                  wx.removeStorage({
                    key: book.id,
                    success: function(res) {},
                  })
                } else {
                  wx.showToast({
                    title: '移除失败,请重试',
                    duration: 2000
                  })
                }
              }
            },
          })
        }
      }
    })
  },

  //开始阅读
  startRead: function () {
    var self = this;
    var book = self.data.book;
    wx.navigateTo({
      url: '../bookChapterList/bookChapterList?bookid=' + book.id + '&book_name=' + book.book_name + '&category=' + book.category,
    })
  },


  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadData()
  },

  /*
   跳转到其他书籍信息页面
  */
  navigateToBook: function (e) {
    var self = this
    var book = self.data.books[e.currentTarget.id]
    app.navigateToBook(book.id)
  },

  navigateToRecommendBook: function (e) {
    var self = this
    var book = self.data.recommend[e.currentTarget.id]
    app.navigateToBook(book.id)
  },



//返回分类
  go_category: function (e) {
    var book = this.data.book;
    if (book) {
      var category = book.category
      app.go_category(category);
    }
  }


})