const koa = require('koa');
const route = require('koa-route');
const koaBody = require('koa-body');
const logger = require('koa-logger');
const fs = require('fs');
const app = new koa();

app.use(koaBody());
app.use(logger());

const login = async (ctx, next) => {
  let users = null;
  let res = null;
  let client = ctx.request.body;
  // console.log(ctx.request.body);
  await new Promise((resolve, reject) => {
    fs.readFile("./api/user.json", (err, data) => {
      if (err) throw err;
      users = JSON.parse(data.toString());
      let username = client.username;
      if(users[username]){
        if (client.password === users[username].password && client.code === users[username].code) {
          res = {"loginStatus": true}
        } else {
          res = {"loginStatus": false}
        }
      }else{
        res = {"loginStatus": false}
      }
      ctx.set('Content-Type', 'application/json');
      ctx.response.body =JSON.stringify(res); //JSON.stringify(users);
      resolve();
    });
  })
};

const storeID = async (ctx, next) => {
  let storeID = null;
  await new Promise((resolve, reject) => {
    fs.readFile("./api/storeID.json", (err, data) => {
      if (err) throw err;
      storeID = JSON.parse(data);
      ctx.set('Content-Type', 'application/json');
      ctx.response.body = JSON.stringify(storeID);
      resolve();
    })
  })
};

const deviceID = async (ctx, next) => {
  let deviceID = null;
  let res = null;
  console.log(ctx.request.query.storeID);
  await new Promise((resolve, reject) => {
    fs.readFile("./api/deviceID.json", (err, data) => {
      if (err) throw err;
      deviceID = JSON.parse(data);
      if(deviceID[ctx.request.query.storeID]){
        if(deviceID[ctx.request.query.storeID][ctx.request.query.deviceType]){
          res = deviceID[ctx.request.query.storeID][ctx.request.query.deviceType]
        }
      }else{
        res = {"status": "error"}
      }
      ctx.set('Content-Type', 'application/json');
      ctx.response.body = JSON.stringify(res);
      resolve();
    })
  })
};

const confirm = async (ctx, next) => {
  let res = {};
  res = ctx.request.body;
  res["checked"] = "ok";
  await new Promise((resolve, reject)=>{
    ctx.set('Content-Type', 'application/json');
    ctx.response.body = JSON.stringify(res);
    resolve();
  })
};

const error = async (ctx, next) => {
  await new Promise((resolve, reject) => {
    if (ctx.status >= 400) {
      ctx.set('Content-Type', 'html');
      ctx.response.body = '<h1 style="text-align: center">404 Not Found</h1>';
    }
    resolve()
  })
};

const timeout = async (ctx, next) => {
  let res = {
    respCode: "0000"
  }
  await new Promise((resolve, reject)=>{
    setTimeout(() => {
      ctx.set('Content-Type', 'application/json');
      ctx.response.body = JSON.stringify(res);
      resolve();
    }, 10 * 1000)
  })
};

// 使用路由
app.use(route.post('/login', login))
  .use(route.get('/storeID', storeID))
  .use(route.get('/deviceID', deviceID))
  .use(route.post('/confirm', confirm))
  .use(route.post('/timeout', timeout))
  .use(route.get('/*', error));


// 监听服务端口
let port = 8000;

app.listen(port, () => {
  console.log(`Login-Koa-Server is running at ${port} port...`)
});
