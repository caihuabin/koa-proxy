# koa-proxy
koa2 proxy middleware
=============================

## 功能
* 请求数据代理
* 先匹配就返回

## 使用方式
```
import Koa from 'koa'
import proxyMiddleware from 'koa2-proxy'

const app = new Koa()

// object or array; 配置项
const config = {
  // string or RegExp or array; 匹配路径
  match: '/demo/api',
  // string; 要代理到的url
  url: 'http://demo.com',
  // function; 可选，对匹配到的路径进行处理
  callback: function(path) { return path.replace('/demo', '') }
}
app.use(proxyMiddleware(config)) // 推荐放在各种 body parse 中间件之前
```
