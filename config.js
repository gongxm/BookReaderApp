
/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

var host = "https://31412947.qcloud.la" 

// var host = "http://127.0.0.1:8080"   //本地测试环境

var service_name = "BookReaderServer"

var config = {

  // 用code换取openId
  openIdUrl: `${host}/${service_name}/openid`,

  //获取thirdSession
  wxlogin: `${host}/${service_name}/wxlogin`,

  //获取用户信息
  getUserInfo: `${host}/${service_name}/getUserInfo`,

  //获取书籍分类
  getBookCategory: `${host}/${service_name}/getBookCategory`,

  //获取书籍分类列表
  getCategoryList: `${host}/${service_name}/getCategoryList`,

  //获取书籍封面
  getImage: `${host}/${service_name}/getImage?cover=`,
  //获取书籍详细信息
  getBookDetail: `${host}/${service_name}/getBookDetail`,
  //获取书籍章节列表
  getChapterList: `${host}/${service_name}/getChapterList`,
};

module.exports = config