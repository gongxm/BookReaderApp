// bookDetail.js
const getBookDetail = require('../../../config').getBookDetail
const getImageUrl = require('../../../config').getImage
const constants = require('../../../utils/constants')
var app = getApp()
var id;
Page({

    /**
     * 页面的初始数据
     */
    data: {
        exists: false,
        book: {}
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        id = options.id
        this.loadData()
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

    },


    //加载数据
    loadData: function () {
        var self = this
        wx.showLoading({
            title: constants.LOADING,
            mask: true
        })
        wx.request({
            url: getBookDetail,
            data: {
                id: id
            },
            method: 'POST',
            header: {
                'content-type': 'application/json'
            },
            success: function (res) {
                if (res.data.errcode == 1) {
                    var reg = new RegExp("<br />", "g");
                    var reg2 = new RegExp("&nbsp;", "g");
                    var book = res.data.result
                    book.shortIntroduce = book.shortIntroduce.replace(reg, '\r\n').replace(reg2, ' ')
                    self.setData({ book: book })

                    var exists = false;
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
                }
            },
            complete: function () {
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
        console.log('添加到书架')
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
                                        },
                                        fail: function (res) {
                                            wx.showToast({
                                                title: '移除失败,请重试',
                                                duration: 2000
                                            })
                                        }
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
            url: '../bookChapterList/bookChapterList?bookid=' + book.id,
        })
    },


    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        this.loadData()
    }


})