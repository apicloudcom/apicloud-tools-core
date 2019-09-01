'use strict';

var fse = require('fs-extra')
var path = require('path')
var prompt = require('prompt')
const WifiSync = require("./WifiSync")
const file_template_path = "../file_template"
const app_template_path = "../app_template"
const file_template_config = require(`./../file_template/config.json`)
const app_template_config = require(`./../app_template/config.json`)

const APICloud = {
  appTemplateConfig(){ // 应用模板配置.
    return app_template_config
  },
  fileTemplateConfig(){ // 文件模板配置.
    return file_template_config
  },
  startWifi({port=8686,host='0.0.0.0'}){/* 启动wifi服务. */
    return WifiSync.start({port:port,host:host})
  },
  endWifi({}){ /* 停止 wifi 服务. */
    return WifiSync.end({});
  },
  syncWifi({projectPath='./',syncAll=false}){ /* wifi 增量/全量同步. */
    return WifiSync.sync({project:projectPath,updateAll:syncAll})
  },
  previewWifi({file}){ /* 预览. */
    if( ! file || "" === file){
      console.error("预览路径不能为空!")
      return
    }

    return WifiSync.preview({file:file})
  },
  wifiInfo(){ /* 获取wifi配置信息,如端口号等. */
    // 注意: 这个要动态获取.
    const wifiInfo = {ip:WifiSync.localIp(),
      port:WifiSync.port,clientsCount:WifiSync.clientsCount}
    return wifiInfo
  },
  wifiLog(callback){
    return new Promise(resolve => {
      WifiSync.on("log",(log)=>{
        callback(log)
        resolve()
      })
    })
  },
  init({name, template, output}){
    name += ""
    template += ""
    output += ""

    if( ! app_template_config[template]){
      console.error(`不支持的模板类型:${template} 可选模板: ${Object.keys(app_template_config)}`)
      return
    }

    this.validatePackageName(name);

    var root = path.resolve(output,name);

    if (fse.existsSync(root)) {
      this.createAfterConfirmation(name, template, output);
    } else {
      this.createProject(name, template, output);
    }
  },
  addFileTemplate({name,output,template}){
    name += ""
    output += ""
    template += ""

    const realTemplateName = file_template_config[template]
    if( ! realTemplateName){
      console.error(
        `找不到页面框架模板:${template},目前支持的页面模板为:${Object.keys(file_template_config)}`)
      return
    }

    var root = path.resolve(output);
    var configPath = path.resolve(output,"config.xml")

    if ( ! fse.existsSync(root) || ! fse.existsSync(configPath)) {
      console.error(`${root} 不是一个有效的APICloud项目!`)
      return
    }

    try {
      let templatePath = path.join(__dirname, file_template_path, realTemplateName)

      fse.walk(templatePath)
        .on('data', function (item) {
          let itemPath = item.path
          let itemStats = item.stats

          let relativePath = path.relative(templatePath, itemPath)
          let targetPath = path.resolve(root,relativePath)
          let targetDir = path.dirname(targetPath)

          if(itemStats.isDirectory()){ // 说明是目录.
            return
          }

          let fileName = path.basename(targetPath)
          fileName = fileName.replace(/apicloudFrame|apicloudWindow(?=\.html)/g, (match)=>{
            let matchDict = {
              "apicloudFrame":`${name}_frame`,
              "apicloudWindow":`${name}_window`
            }
            return matchDict[match]
          })

          targetPath = path.resolve(targetDir,fileName)
          fse.copySync(itemPath, targetPath,{filter:()=>( ! /^[.]+/.test(fileName))})

          if(/\.html$/.test(fileName)){
            let targetFileText = fse.readFileSync(targetPath,'utf8')
            targetFileText = targetFileText.replace(/apicloudFrame|apicloudWindow/g, (match)=>{
              let matchDict = {
                "apicloudFrame":`${name}_frame`,
                "apicloudWindow":`${name}_window`
              }
              return matchDict[match]
            })

            fse.writeFileSync(targetPath, targetFileText)
          }
        })
        .on('end', function () {
          return
        })
    } catch (err) {
      console.error(`创建 APICloud 页面框架失败: ` + err)
      return
    }
  },
  validatePackageName(name) {
    if (! name.match(/^[\w]{1,20}$/i)) {
      console.error(
        '"%s" 应用名称无效. 应用名称应在20个字符以内,且不能包含空格和符号!',
        name
      );
      return
    }
  },
  createAfterConfirmation(name, template, output) {
    prompt.start();

    var property = {
      name: 'yesno',
      message: '目录 ' + path.resolve(output,name) + ' 已存在. 是否继续?',
      validator: /[是|否]+/,
      warning: '必须回复 是 或 否',
      default: '否'
    };

    prompt.get(property, (err, result)=>{
      if (result.yesno === '是') {
        this.createProject(name, template, output);
      } else {
        return
      }
    });
  },
  createProject(name, template, output) {
    var root = path.resolve(output,name)

    if (!fse.existsSync(root)) {
      fse.mkdirSync(root);
    }

    try {
      let templatePath = path.join(__dirname, app_template_path, template)
      fse.copySync(templatePath,root)

      let configFilePath =  path.join(root, "config.xml")
      let configText = fse.readFileSync(configFilePath, 'utf8')
      configText = configText.replace(/\<name\>.*\<\/name\>/g, `<name>${name}</name>`);
      fse.writeFileSync(configFilePath, configText, 'utf8');

      return
    } catch (err) {
      console.error(`创建APICloud项目失败:` + err)
      return
    }
  },
}

export default APICloud

module.exports = APICloud
module.export = APICloud
