const Koa = require('koa');
const Router = require('koa-router');
const logger = require('koa-logger');
const koaPostBody = require('koa-body');
const glob = require("glob");
const fs = require('fs');
const { resolve } = require('path');
 
const app = new Koa();
const router = new Router({prefix: '/api'});
const routerMap = {};  // 存放路由映射

app.use(logger());
app.use(koaPostBody()); // 用于解析post数据

// 遍历json目录文件
glob.sync(resolve('./api', "**/*.json")).forEach((item, i) => {
    let apiJsonPath = item && item.split('/api')[1];
    let apiPath = apiJsonPath.replace('.json', '');
    
    // 注册get路由
    router.get(apiPath, (ctx, next) => {
        let data = ctx.query; // 接受get数据
        try {
            let jsonStr = fs.readFileSync(item).toString();
            let res = Object.assign(JSON.parse(jsonStr), {
                respCode: '0000', // 自定义状态
                respDesc: 'success', // 自定义响应体
                getData: data,
            })
            ctx.body = res;
        } catch(err) {
            ctx.throw('Mock服务器错误', 500);
        }
    });

    // 注册post路由
    router.post(apiPath, (ctx, next) => {
        let data = ctx.request.body; // 接收post数据
        try {
            let jsonStr = fs.readFileSync(item).toString();
            let res = Object.assign(JSON.parse(jsonStr), {
                respCode: '0000', // 自定义状态
                respDesc: 'success', // 自定义响应体
                postData: data,
            });
            ctx.body = res;
        } catch(err) {
            ctx.throw('Mock服务器错误', 500);
        }
    });
    
    // 记录路由
    routerMap[apiPath] = apiJsonPath;
});


app
  .use(router.routes())
  .use(router.allowedMethods());

function generateMap(map) {
    map = JSON.stringify(map, null, 4);
    fs.writeFile('./routerMap.json', map, err => {
        if (err) throw err;
        console.log('路由地图生成成功！');
    });
}

let port = 3000;
app.listen(port, () => {
    generateMap(routerMap);
    console.log(`Server is running at ${port}, you can get or post the api.`);
});
