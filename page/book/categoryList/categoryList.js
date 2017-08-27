// categoryList.js
const getCategoryList = require('../../../config').getCategoryList
const getImageUrl = require('../../../config').getImage

const constants = require('../../../utils/constants')
var app = getApp()

var currentPage = 1
var pageSize = 10
var isLoading = false
Page({

    /**
     * 页面的初始数据
     */
    data: {
        category: '',
        books: [],
        over: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        var category = options.category
        var self = this
        if (category && category != '') {
            self.setData({ category: category })
        }
        currentPage = 1
        isLoading = false
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.loadData()

    },


    //加载数据
    loadData: function () {

        if (isLoading) {
            return
        }

        isLoading = true

        //获取当前分类的列表内容
        var self = this
        var category = this.data.category
        if (category && category != '') {
            wx.setNavigationBarTitle({
                title: category
            })

            wx.request({
                url: getCategoryList,
                data: {
                    category: self.data.category,
                    currentPage: currentPage,
                    pageSize: pageSize
                },
                method: 'POST',
                header: {
                    'content-type': 'application/json'
                },
                success: function (res) {
                    if (res.data.errcode == 1) {
                        var list = res.data.result;
                        if (list && list.length > 0) {
                            var books = self.data.books
                            for (var i = 0; i < list.length; i++) {
                                var item = list[i]
                                books.push(item)
                            }
                            self.setData({ books: books, over: list.length < pageSize})

                            //数据加载成功,当前页面自增
                            currentPage++
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
                    wx.stopPullDownRefresh()
                    isLoading = false
                }
            })
        }
    },

    navigateToBook: function (e) {
        var self = this
        var book = self.data.books[e.currentTarget.id]
        wx.navigateTo({
            url: '../bookDetail/bookDetail?id=' + book.id,
        })
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var self = this
        self.setData({over:false, books: [] })
        currentPage = 1;
        this.loadData()
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.loadData()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})