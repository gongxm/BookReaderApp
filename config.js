
/**
 * 小程序配置文件
 */

// 此处主机域名是腾讯云解决方案分配的域名
// 小程序后台服务解决方案：https://www.qcloud.com/solution/la

var host = "http://127.0.0.1:8080"   //本地测试环境

var service_name = "BookReaderServer"

var config = {

  // 用code换取openId
  openIdUrl: `${host}/${service_name}/openid`,

  //获取thirdSession
  wxlogin: `${host}/${service_name}/wxlogin`,

  //获取用户信息
  getUserInfo: `${host}/${service_name}/getUserInfo`,
};

module.exports = config