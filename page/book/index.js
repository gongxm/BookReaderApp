const getBookCategory = require('../../config').getBookCategory
const constants = require('../../utils/constants')
var app = getApp()
var hasLoadData = false
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: false,
    thirdSession: '',
    categories: [],
    inputValue: '',
    permissions: '',
    logs: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      permissions: app.globalData.userInfo.permissions
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

    if (app.globalData.userInfo.permissions && app.globalData.userInfo.permissions != 'TEST') {
      hasLoadData = true
      var self = this
      wx.getStorage({
        key: constants.STORAGE_CATEGORY_LIST,
        success: function (res) {
          var categories = res.data
          self.setData({ categories: categories, loading: false })
        },
        fail:function(){
          self.loadData()
        }
      })

    }
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
      this.flushData()
  },


  onShareAppMessage: function () {
    // return custom share data when user share.
  },

  flushData: function () {
    this.setData({
      thirdSession: app.globalData.userInfo.thirdSession,
      permissions: app.globalData.userInfo.permissions
    })

    if (app.globalData.userInfo.thirdSession) {
      if (app.globalData.userInfo.permissions == 'TEST') {
        wx.setNavigationBarTitle({
          title: '历史记录',
        })
        var logs = wx.getStorageSync('callogs');
        this.setData({ logs: logs })
      } else {
        wx.setNavigationBarTitle({
          title: '在线书城',
        })
        if (!hasLoadData) {
          hasLoadData = true
          this.loadData()
        }
      }
    }
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

    self.setData({ loading: true })

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
            self.setData({ categories: categories, loading: false })

            //把数据存储到本地
            wx.setStorage({
              key: constants.STORAGE_CATEGORY_LIST,
              data: categories,
              success: function (res) {
               
              }
            })
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
        self.setData({ loading: false })
        wx.stopPullDownRefresh()
      }
    })
  },



  /**
  * 授权获取用户信息
  */
  authorizationGetUserInfo: function (e) {
    app.authorizationGetUserInfo()
  },

  //跳转到列表
  navigatoList: function (e) {
    var self = this
    var index = e.currentTarget.id

    var category = self.data.categories[index]

    if (category) {
      wx.navigateTo({
        url: category.url,
      })
    }

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