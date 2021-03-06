
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
    night_style: '',
    night_style_bt: '夜间',
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
    var category = options.category

    var self = this;

    self.setData({
      chapterid: chapterid,
      chapter_name: chapter_name,
      bookid: bookid,
      position: position,
      book_name: book_name,
      category: category
    })

    //获取设置信息
    wx.getStorage({
      key: constants.SETTING,
      success: function (res) {
        var setting = res.data
        if (setting) {
          let size = setting.size;
          let night_style = setting.night_style;
          if (size) {
            self.setData({ size: size })
          }
          if (night_style) {
            self.setData({ night_style: night_style, night_style_bt: setting.night_style_bt })
          }
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



    //优先从本地加载数据,加载不到再从网络加载
    wx.getStorage({
      key: self.data.chapterid,
      success: function (res) {
        var content = res.data;
        self.setData({ loading: false, content: content, bt_class: 'control' })
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
      fail: function () {
        //如果没有在缓存中加载到数据, 开始下载
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
              var content = res.data.result.text
              self.setData({ loading: false, content: content, bt_class: 'control' })
              //存储章节内容
              wx.setStorage({
                key: self.data.chapterid,
                data: content,
              })
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
        var list = res.data.chapters
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
      url: '../bookChapterList/bookChapterList?bookid=' + self.data.bookid + '&book_name=' + self.data.book_name + '&category=' + self.data.category,
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
        var list = res.data.chapters
        if (list && list.length > 0) {
          if (position >= list.length) {
            wx.navigateTo({
              url: '../readFinish/readFinish?category=' + self.data.category,
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
  go_back_home: function (e) {
    var self = this
    var bookid = self.data.bookid
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
          self.add_to_bookstore()
        }else{
          app.go_home()
        }
      },
      fail: function (res) {
        self.add_to_bookstore()
      },
      complete:function(){
      }
    })

  },


  //添加到书架
  add_to_bookstore: function () {
    var self = this
    var bookid = self.data.bookid
    wx.showModal({
      title: '加入书架吗?',
      content: '书籍未加入书架, 数据不会保存哟~',
      confirmText: '加入',
      cancelText: '不了',
      cancelColor: '#888',
      success: function (res) {
        if (res.confirm) {
          wx.getStorage({
            key: constants.STORAGE_BOOK_LIST,
            success: function (res) {
              var book_list = res.data;
              if (!book_list) {
                book_list = []
              }
              var book = app.globalData.book
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
                book.position = self.data.position
                book_list.push(book)
                wx.setStorage({
                  key: constants.STORAGE_BOOK_LIST,
                  data: book_list,
                  success: function (res) {
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
            },
            fail: function (res) {
              var book_list = []
              var book = app.globalData.book
              book.position = self.data.position
              book_list.push(book)
              wx.setStorage({
                key: constants.STORAGE_BOOK_LIST,
                data: book_list,
                success: function (res) {
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
        } else if (res.cancel) {
          //清除缓存
          wx.removeStorage({
            key: bookid,
            success: function (res) { },
          })
        }
      },

      //不管选择哪个, 都要跳转到主页面
      complete: function () {
        app.go_home()
      }
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
    this.setData({ showControl: !this.data.showControl, bottom_animation: animation.export() })
    if (this.data.showControl) {
      setTimeout(function () {
        animation.translate(0, -100).step()
        this.setData({
          bottom_animation: animation.export()
        })
      }.bind(this), 1)
    } else {
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
    if (self.data.showControl) {
      var animation = wx.createAnimation({
        transformOrigin: "50% 50%",
        duration: 300,
        timingFunction: 'ease',
        delay: 0
      })
      self.setData({ showControl: false, bottom_animation: animation.export() })

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


  //页面卸载
  onUnload: function () {

  },


  //缩小字体
  font_size_sub: function (e) {
    let self = this;
    let size = self.data.size;
    if (size > 10) {
      size--;
      self.setData({ size: size })

      //获取设置信息
      wx.getStorage({
        key: constants.SETTING,
        success: function (res) {
          var setting = res.data
          if (setting) {
            setting.size = size;
            //存储设置的字体信息
            wx.setStorage({
              key: constants.SETTING,
              data: setting,
            })
          }
        },
        fail: function (res) {
          var setting = { size: size }
          //存储设置的字体信息
          wx.setStorage({
            key: constants.SETTING,
            data: setting,
          })
        }
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
      //获取设置信息
      wx.getStorage({
        key: constants.SETTING,
        success: function (res) {
          var setting = res.data
          if (setting) {
            setting.size = size;
            //存储设置的字体信息
            wx.setStorage({
              key: constants.SETTING,
              data: setting,
            })
          }
        },
        fail: function (res) {
          var setting = { size: size }
          //存储设置的字体信息
          wx.setStorage({
            key: constants.SETTING,
            data: setting,
          })
        }
      })
    } else {
      wx.showToast({
        title: '已经是最大了!',
      })
    }
  },


  //夜间模式
  night_style_change: function (e) {
    let self = this
    if (self.data.night_style) {
      self.setData({ night_style: '', night_style_bt: '夜间' })
      //获取设置信息
      wx.getStorage({
        key: constants.SETTING,
        success: function (res) {
          var setting = res.data
          if (setting) {
            setting.night_style = '';
            setting.night_style_bt = '夜间';
            //存储设置的字体信息
            wx.setStorage({
              key: constants.SETTING,
              data: setting,
            })
          }
        },
        fail: function (res) {
          var setting = { night_style: '', night_style_bt: '夜间' }
          //存储设置的字体信息
          wx.setStorage({
            key: constants.SETTING,
            data: setting,
          })
        }
      })
    } else {
      self.setData({ night_style: 'night_style', night_style_bt: '日间' })
      //获取设置信息
      wx.getStorage({
        key: constants.SETTING,
        success: function (res) {
          var setting = res.data
          if (setting) {
            setting.night_style = 'night_style';
            setting.night_style_bt = '日间';
            //存储设置的字体信息
            wx.setStorage({
              key: constants.SETTING,
              data: setting,
            })
          }
        },
        fail: function (res) {
          var setting = { night_style: 'night_style', night_style_bt: '日间' }
          //存储设置的字体信息
          wx.setStorage({
            key: constants.SETTING,
            data: setting,
          })
        }
      })
    }
  },

  //跳转到书籍信息页面
  navigateToBook: function (e) {
    var self = this
    var bookid = self.data.bookid
    app.navigateToBook(bookid)
  },


  //缓存书籍章节
  storageBook: function () {
    wx.showToast({
      title: '开始缓存...',
    })

    var self = this

    //获取到列表
    wx.getStorage({
      key: self.data.bookid,
      success: function (res) {
        var list = res.data.chapters
        if (list && list.length > 0) {
          for (var i = 0; i < list.length; i++) {
            var chapter = list[i]
            var chapterid = chapter.id
            var value = wx.getStorageSync(chapterid);
            if (!value) {
              wx.request({
                url: getBookChapter,
                data: {
                  id: chapterid
                },
                method: 'POST',
                header: {
                  'content-type': 'application/json'
                },
                success: function (res) {
                  if (res.data.errcode == 1) {
                    var chapterid = res.data.result.id
                    var content = res.data.result.text
                    //存储章节内容
                    wx.setStorage({
                      key: chapterid,
                      data: content,
                    })
                  }
                }
              })
            }
          }
        }
      },
    })

  }

})