# APICloud 开发工具核心库: apicloud-tools-core

## 简介

**[APICloud](http://www.apicloud.com/)** 开发工具核心库,支持新建页面模板,新建应用模板,WiFi同步等核心功能.开发者可基于此核心库,定制各种编辑器插件或者将 APICloud 的开发调试功能与已有的自动化业务流程结合,提升开发效率.

## 特点

* 轻量: 底层WiFi同步核心功能,使用 *nodejs* 重写,代码体积缩减到 *2M* 以下;
* 开源: 基于 **GPL-3.0** 协议开源,开发者可自用扩展与定制;
* 灵活: 核心开发工具代码独立于特定编辑器环境,可用于任何支持标准 nodejs 模块的开发环境中;
* 强大: 基于 nodejs 的事件机制和流操作,代替原来的文件读写操作来进行相关底层逻辑的同步,更加高效;
* 跨平台: 支持 Mac/Windows/Linux 等主流操作系统;

## 安装

```shell
npm install  apicloud-tools-core --save
```

## 使用

```js
const APICloud = require("apicloud-tools-core")

this.startWifi({port: 8686})
```

## 接口调用示例

具体实现,可参考源码 *lib/APICloud.js*,以下为简要接口示例:

### 新建页面模板

```js
let name = "HelloAPICloud"
let template = "home"

APICloud.init({name:name})
```

### 新建应用模板

```js
let name = "FirstPage"
let template = "page001"

APICloud.addFileTemplate({name:name,template:template})
```

### 启动wifi服务

```js
APICloud.startWifi({port:8086})
```

### wifi 增量/全量同步

```js
let projectRootPath = "./"

APICloud.syncWifi({syncAll:true}) // 全量同步.
APICloud.syncWifi({syncAll:false}) // 增量同步.
```

### 预览页面

```js
let file = "./index.html"
APICloud.previewWifi({file:file})
```
### 获取wifi配置信息,如端口号等
```js
APICloud.wifiInfo()
```

### 获取调试日志

注意:此处实际是注册了日志事件的回调函数,会持续输出日志.

```js
APICloud.wifiLog(({level,content})=>{
  if(level === "warn"){
    console.warn(content)
    return
  }

  if(level === "error"){
    console.error(content)
    return
  }

  console.log(content)
})
.then(()=>{
  console.log("WiFi 日志服务已启动...")
})
```

### 停止 wifi 服务

```js
APICloud.endWifi({})
```

## 应用实例

* [APICloud For Atom,一款为Atom编辑器打造的开发工具](https://atom.io/packages/apicloud)
