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
  onLaunch: function () {
    var self = this
    self.checkLogin()
  },

  checkLogin: function () {
    var self = this
    wx.getStorage({
      key: constants.STORAGE_USERINFO,
      success: function (res) {//已登录
        if (res.data.thirdSession != undefined && res.data.thirdSession != '') {
          self.globalData.userInfo.thirdSession = res.data.thirdSession
          self.globalData.userInfo.username = res.data.username
          self.globalData.userInfo.nickName = res.data.nickName
          self.globalData.userInfo.permissions = res.data.permissions
          self.globalData.userInfo.phone = res.data.phone
          self.globalData.userInfo.gender = res.data.gender
          self.globalData.userInfo.city = res.data.city
          self.globalData.userInfo.province = res.data.province
          self.globalData.userInfo.country = res.data.country
          self.globalData.userInfo.avatarUrl = res.data.avatarUrl
        } else {
          self.login(null);
        }
      },
      fail: function (res) {//未登录，引导登录
        self.login(null)
      }
    })
  },

  /**
   * 检测是否登录过，登录过则取缓存信息，没有则引导登录
   */
  login: function (page) {

    var self = this
    if (!isLogin) {
      isLogin = true
      wx.showLoading({
        title: '正在登陆...',
        mask: true
      })

      wx.login({
        success: function (res) {//客户授权后通过code获取客户信息
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
              success: function (res) {
                if (res.data.errcode == 1) {
                  var thirdSession = res.data.thirdSession
                  //获取用户信息并保存到服务器
                  self.saveUserInfo(thirdSession, page);
                } else {
                  wx.showToast({
                    title: constants.LOGIN_FAIL,
                    image: './images/error.png',
                    duration: 2000
                  })
                }
              }
            })

          } else {
            wx.showToast({
              title: constants.LOGIN_FAIL,
              image: './images/error.png',
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
  saveUserInfo: function (thirdSession, page) {
    var self = this

    wx.getUserInfo({
      success: function (res) {
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
          success: function (res) {
            console.log('success')
            if (res.data.errcode == 1) {
              self.getUserInfo(thirdSession, page);
            } else {
              wx.showToast({
                title: constants.USER_INFO_ERROR,
                image: '../../images/error.png',
                duration: 2000
              })
            }
          },
          fail: (res) => {
            console.log('fail')
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
          }
        })
      },
      fail: function (res) {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
      },
      complete: function () {
        isLogin = false
        if (wx.hideLoading) {
          wx.hideLoading()
        }
      }
    })
  },


  //获取服务器上的用户信息
  getUserInfo: function (thirdSession, page) {
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
      success: function (res) {
        if (res.data.errcode == 1) {
          self.globalData.userInfo.thirdSession = thirdSession
          self.globalData.userInfo.username = res.data.username
          self.globalData.userInfo.nickName = res.data.nickName
          self.globalData.userInfo.permissions = res.data.permissions
          self.globalData.userInfo.phone = res.data.phone
          self.globalData.userInfo.gender = res.data.gender
          self.globalData.userInfo.city = res.data.city
          self.globalData.userInfo.province = res.data.province
          self.globalData.userInfo.country = res.data.country
          self.globalData.userInfo.avatarUrl = res.data.avatarUrl

          //把用户信息缓存到本地
          wx.setStorage({
            key: constants.STORAGE_USERINFO,
            data: self.globalData.userInfo
          })

          if (page != null) {
            page.setData({
              thirdSession: self.globalData.userInfo.thirdSession,
              userInfo: self.globalData.userInfo
            })
          }
        } else {
          wx.showToast({
            title: constants.USER_INFO_ERROR,
            image: '../../images/error.png',
            duration: 2000
          })
        }
      },
      fail: function (res) {
        wx.showToast({
          title: constants.USER_INFO_ERROR,
          image: '../../images/error.png',
          duration: 2000
        })
      },
      complete: (res) => {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
      }
    })
  },


  //回到书架
  go_home:function(){
    wx.reLaunch({
      url: '../../home/index',
    })
  }


});