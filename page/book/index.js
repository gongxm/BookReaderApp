const getBookCategory = require('../../config').getBookCategory
const constants = require('../../utils/constants')
var app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    thirdSession: '',
    categories: [],
    inputValue: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.loadData()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
    })
  },



  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.loadData()
  },




  //加载数据
  loadData: function () {
    var self = this
    wx.showLoading({
      title: constants.LOADING,
      mask: true
    })

    //请求服务器, 获取书籍分类
    wx.request({
      url: getBookCategory,
      data: {
        thirdSession: self.data.thirdSession
      },
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      success: function (res) {
        if (res.data.errcode == 1) {
          var list = res.data.result
          if (list && list.length > 0) {

            var categories = []

            for (var i = 0; i < list.length; i++) {
              var item = {
                name: list[i],
                url: './categoryList/categoryList?category=' + list[i] + '&type=' + constants.CATEGORY_TYPE_NORMAL
              }
              categories.push(item)
            }
            self.setData({ categories: categories })
          }
        }
      },
      fail: function (res) {
        wx.showToast({
          title: constants.DATA_NOT_FOUNT,
          icon: 'success',
          duration: 2000
        })
      },
      complete() {
        if (wx.hideLoading) {
          wx.hideLoading()
        }
        wx.stopPullDownRefresh()
      }
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
        console.log("fail userInfo")
      },
      complete: (res) => {
        console.log("complete userInfo")
      }
    })
  },

  //搜索
  search: function (e) {
    var self = this
    var value = e.detail.value
    if (value == '') {
      wx.showToast({
        title: '请输入搜索内容',
        image: '../../images/warn2.png'
      })
    } else {
      self.setData({
        inputValue: ''
      })
      wx.navigateTo({
        url: './categoryList/categoryList?category=搜索结果&keyword=' + value + '&type=' + constants.CATEGORY_TYPE_SEARCH,
      })
    }
  }
})