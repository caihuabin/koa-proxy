const request = require('request')

  // 匹配 url
function getProxyItem(ctx, config) {
  let url = null
  let host = null
  config.forEach((rule) => {
    url === null && rule.match.forEach((item) => {
      if (url === null && item.test(ctx.path)) {
        const callbackUrl = rule.callback(ctx.url)
        const serviceUrl = rule.url
        host = serviceUrl.slice(serviceUrl.indexOf('://') + 3).replace(/\/.*$/, '')
        url = `${rule.url}${typeof callbackUrl === 'string' ? callbackUrl : ctx.url}`
      }
    })
  })
  return url ? { host, url } : null
}

// 根据 headers 判断请求是否需要流式发送代理请求
function needStream(headers) {
  if (!headers['content-type']) return false
  return (
    headers['content-type'].indexOf('multipart') > -1 ||
    headers['content-type'].indexOf('octet-stream') > -1
  )
}

function configure(config) {
  // 校验入参
  if (!Array.isArray(config)) {
    if (typeof config !== 'object') {
      throw new Error('config is invalid, koa2-proxy middleware init failed!')
    }
    config = [config]
  }

  // 规范入参
  return config.reduce((prev, rule) => {
    let match = Array.isArray(rule.match) ? rule.match : [rule.match]
    let url
    match = match.map((item) => {
      if (typeof item === 'string') {
        return new RegExp(item)
      } else if (item instanceof RegExp) {
        return item
      } else {
        throw new Error('config.match is invalid, koa2-proxy middleware init failed!')
      }
    })

    if (typeof rule.url === 'string') {
      url = rule.url
    } else {
      throw new Error('config.url is invalid, koa2-proxy middleware init failed!')
    }
    const callback = typeof rule.callback === 'function' ? rule.callback : path => path
    prev.push({ match, url, callback })
    return prev
  }, [])
}

module.exports = function proxy(config) {
  
  const proxyConfig = configure(config)

  return (ctx, next) => {
    const proxyItem = getProxyItem(ctx, proxyConfig)
    if (!proxyItem) return next()
    else console.log('[proxy]:', proxyItem)

    const headers = ctx.header
    headers.host = proxyItem.host
    const isStream = needStream(headers)
    const option = {
      url: proxyItem.url,
      host: proxyItem.host,
      headers,
      followRedirect: true,
      json: !isStream,
      method: ctx.method,
      gzip: true
    }
    ctx.body = ctx.req.pipe(request(option))
  }
}
