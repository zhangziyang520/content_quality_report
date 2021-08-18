const superagent = require("superagent"); //发送网络请求获取DOM
const cheerio = require("cheerio"); //能够像Jquery一样方便获取DOM节点
const schedule = require("node-schedule"); //定时器任务库
const request = require('request');
const express = require("express")
const app = express()

const itzjUrl = "http://www.ithome.com/";
const cqrUrl = "http://10.58.8.126/spiderReports/reports/newest/report.html";

/**
 * 获取国际小米电商内容质检平台页面数据
 */
function getCqrData(){
    let p = new Promise(function(resolve,reject){
        superagent.get(cqrUrl).end(function(err, res) {
            if (err) {
                reject(err);
            }
            let $ = cheerio.load(res.text);
            let itemlist = $("#dataTable tbody");
            let title = $(".tab-box .tab-line a").eq(0).text()
            let errotext01 = '(包含错误的页面)'
            let errotext02 = '(错误内容)'
            const htmlData = [];
            itemlist.find('tr').each(function(index){
              var pic = $(this)
              pic.find('#row_1').find('strong').text()
              let obj = new Object;
              let arr = new Array;
              obj.tag = 'text',  
              obj.text = pic.find('td').find('strong').text() || pic.find('td').eq(0).text() + ": " + pic.find('td').eq(1).find('a').text() + errotext01 + ',' + pic.find('td').eq(3).text()+' ' + errotext02
              arr.push(obj) 
              htmlData.push(arr)
            })
            let post = {
              "msg_type": "post",
              "content": {
                "post": {
                  "zh_cn": {
                    "title": title,
                    "content": htmlData
                  }
                }
              }
            }  
            let message = {"msg_type":"post","content":post.content}
            postMessage(message)
          });
    })
    return p
}

/**
 * 获取it之家数据
 */
function getItzjData(){
  let p = new Promise(function(resolve,reject){
      superagent.get(itzjUrl).end(function(err, res) {
          if (err) {
              reject(err);
          }
          app.listen(8080,()=>{
              console.log("服务开启在9001端口")
          })
          let $ = cheerio.load(res.text);
          let itemlist = $("#nnews .t-b.sel .nl").eq(0);
          const htmlData = [];
          itemlist.find('li').each(function(index,item){
            var pic = $(this)
            let obj = new Object;
            let obj01 = new Object;
            let arr = new Array;
            obj.tag = 'text',
            obj.text = index+1 + ':' +' '
            obj01.tag = 'a'
            obj01.text = pic.find('a').text()
            obj01.href = pic.find('a').attr('href') + pic.find('b').text()
            arr.push(obj) && arr.push(obj01)
            htmlData.push(arr)
          })
          let post = {
            "msg_type": "post",
            "content": {
              "post": {
                "zh_cn": {
                  "title": "it之家首页最新数据（每一天对这个世界了解多一点🤛）",
                  "content": htmlData
                }
              }
            }
          }  
          let message = {"msg_type":"post","content":post.content}
          postMessage(message)
        });
  })
  return p
}

/**
 * 请求飞书webhook接口,发送消息,更详细的使用文档还请移步至: https://open.feishu.cn/document/ukTMukTMukTM/uMDMxEjLzATMx4yMwETM
 */
function postMessage (data){
  let url = 'https://open.f.mioffice.cn/open-apis/bot/v2/hook/edcc2648-d7a1-4653-a042-987124412060'
  request.post({
    body: data, // 需要post的数据
    json: true, //数据的格式
    url: url, //请求的URL
    headers: {
      //特殊的headers，如果需要
    }
  }, function (err, httpResponse, body) {
    if (err) {
      console.log('Error :', err)
      return
    }
    console.log(' Body :', body)
  });
}
// console.log(getCqrData(),getItzjData())
/**
 * 采用node-schedule来完成定时任务,更多node-schedule的配置请移步至: https://www.npmjs.com/package/node-schedule
 */
const scheduleCronstyle = ()=>{
  //每小时的1分30秒执行,
    schedule.scheduleJob('30 1 * * * *',()=>{
      getCqrData() && getItzjData()
    }); 
}

scheduleCronstyle();