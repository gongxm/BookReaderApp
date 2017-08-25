const openIdUrl = require('./config').openIdUrl
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

         // console.log(self.globalData.userInfo)
        } else {
          self.login();
        }

      },
      fail: function (res) {//未登录，引导登录
        self.login()
      }
    })
  },

  /**
   * 检测是否登录过，登录过则取缓存信息，没有则引导登录
   */
  login: function () {

    var self = this
    if (!isLogin) {
      isLogin = true
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
                  //获取用户信息
                  self.saveUserInfo(thirdSession);
                } else {
                  wx.showToast({
                    title: constants.LOGIN_FAIL,
                    icon: 'success',
                    duration: 2000
                  })
                }
              }
            })

          } else {
            wx.showToast({
              title: constants.LOGIN_FAIL,
              icon: 'success',
              duration: 2000
            })
          }

        }
      });
    }
  },

  /**
   * 请求微信个人信息接口,上传用户信息到服务器
   */
  saveUserInfo: function (thirdSession) {
    var self = this

    wx.getUserInfo({
      success: function (res) {
        var userInfo = res.userInfo
        wx.request({
          url: openIdUrl,
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
            if (res.data.errcode == 1) {
              self.getUserInfo(thirdSession);
            } else {
              wx.showToast({
                title: constants.USER_INFO_ERROR,
                icon: 'success',
                duration: 2000
              })
            }
          },
          complete: function () {
            isLogin = false
          }
        })
      },
      fail: function (res) {

      },
      complete: function () {
      }
    })
  },


  //获取服务器上的用户信息
  getUserInfo: function (thirdSession) {
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
        }else{
          wx.showToast({
            title: constants.USER_INFO_ERROR,
            icon: 'success',
            duration: 2000
          })
        }
      },
      fail:function(res){
        wx.showToast({
          title: constants.USER_INFO_ERROR,
          icon: 'success',
          duration: 2000
        })
      }
    })
  }


});