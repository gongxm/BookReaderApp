const saveUserInfo = require('./config').saveUserInfo
const getUserInfoUrl = require('./config').getUserInfo
const wxlogin = require('./config').wxlogin
const constants = require('./utils/constants')

var isLogin = false
App({
  globalData: {
    userInfo: {
      thirdSession: '',
      versionCode: constants.VERSIONCODE,
      username: '',
      nickName: '',
      permissions: '',
      phone: '',
      gender: '',
      city: '',
      province: '',
      country: '',
      avatarUrl: ''
    },

    book: {}

  },



  //程序启动
  onLaunch: function() {
    this.authorizationGetUserInfo()
  },



  /**
   * 登陆
   */
  login: function() {
    var self = this
    if (!isLogin) {
      isLogin = true
      wx.showLoading({
        title: '正在登陆...',
        mask: true
      })

      wx.login({
        success: function(res) { //客户授权后通过code获取客户信息
          if (res.code) {
            //获取thirdSession
            wx.request({
              url: wxlogin,
              data: {
                js_code: res.code
              },
              method: 'POST',
              header: {
                'content-type': 'application/json'
              },
              success: function(res) {
                if (res.data.errcode == 1) {
                  var thirdSession = res.data.thirdSession
                  //从服务器获取用户信息
                  self.getUserInfo(thirdSession);
                } else {
                  wx.showToast({
                    title: constants.LOGIN_FAIL,
                    image: '../../images/error.png',
                    duration: 2000
                  })
                }
              },
              fail: function(res) {
                wx.showToast({
                  title: constants.LOGIN_FAIL,
                  image: '../../images/error.png',
                  duration: 2000
                })
              }
            })

          } else {
            wx.showToast({
              title: constants.LOGIN_FAIL,
              image: '../../images/error.png',
              duration: 2000
            })
          }

        },
        fail: (res) => {
          if (wx.hideLoading) {
            wx.hideLoading()
          }
        }
      });
    }
  },

  /**
   * 请求微信个人信息接口,上传用户信息到服务器
   */
  saveUserInfo: function(thirdSession) {
    var self = this

    wx.getUserInfo({
      lang: "zh_CN",
      success: function(res) {
        var userInfo = res.userInfo
        wx.request({
          url: saveUserInfo,
          data: {
            thirdSession: thirdSession,
            encryptedData: res.encryptedData,
            iv: res.iv
          },
          method: 'POST',
          header: {
            'content-type': 'application/json'
          },
          success: function(res) {
            if (res.data.errcode == 1) {
              self.getUserInfo(thirdSession);
            } else {
              wx.showToast({
                title: constants.USER_INFO_ERROR,
                image: '../../images/error.png',
                duration: 2000
              })
            }
          },
          fail: (res) => {
            if (wx.hideLoading) {
              wx.hideLoading()
            }
            wx.showToast({
              title: constants.USER_INFO_ERROR,
              image: '../../images/error.png',
              duration: 2000
            })
          },
          complete: function () {
            isLogin = false
            if (wx.hideLoading) {
              wx.hideLoading()
            }
          }
        })
      },
      fail: function(res) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
      },
      complete: function() {
        isLogin = false
        if (wx.hideLoading) {
          wx.hideLoading()
        }
      }
    })
  },


  //获取服务器上的用户信息
  getUserInfo: function(thirdSession) {
    var self = this

    wx.request({
      url: getUserInfoUrl,
      data: {
        thirdSession: thirdSession
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        if (res.data.errcode == 1) {
          if (res.data.username) {
            self.globalData.userInfo = res.data
            self.globalData.userInfo.thirdSession = thirdSession
            //把用户信息缓存到本地
            wx.setStorage({
              key: constants.STORAGE_USERINFO,
              data: self.globalData.userInfo
            })

            var pages = getCurrentPages()
            if (pages && pages.length > 0) {
              pages[0].flushData()
            }
          } else {
            //获取用户信息并保存到服务器
            self.saveUserInfo(thirdSession);
          }
        } else {
          wx.showToast({
            title: constants.USER_INFO_ERROR,
            image: '../../images/error.png',
            duration: 2000
          })
        }
      },
      fail: function(res) {
        wx.showToast({
          title: constants.USER_INFO_ERROR,
          image: '../../images/error.png',
          duration: 2000
        })
        //获取用户信息并保存到服务器
        self.saveUserInfo(thirdSession);
      },
      complete: (res) => {
        isLogin = false
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        wx.stopPullDownRefresh()
      }
    })
  },


  //回到书架
  go_home: function() {
    wx.reLaunch({
      url: '../../home/index',
    })
  },

  //打开分类列表
  go_category_list: function() {
    wx.reLaunch({
      url: '../../book/index',
    })
  },

  //返回分类
  go_category: function(category) {
    if (category) {
      wx.reLaunch({
        url: '../../book/categoryList/categoryList?category=' + category + '&type=' + constants.CATEGORY_TYPE_NORMAL,
      })
    }
  },


  /**
   * 授权获取用户信息
   */
  authorizationGetUserInfo: function() {
    var self = this;
    wx.getSetting({
      success: function(res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          self.login()
        }
      }
    })

  },

  //显示书籍详情
  navigateToBook: function(bookid) {
    wx.navigateTo({
      url: '../../book/bookDetail/bookDetail?id=' + bookid,
    })
  },


});