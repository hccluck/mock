const koa = require('koa');
const route = require('koa-route');
const koaBody = require('koa-body');
const fs = require('fs');
const app = new koa();

app.use(koaBody());

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
        if (client.password == users[username].password && client.code == users[username].code) {
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

const logistics = async (ctx, next) => {
  let res = {};
  // let page = ctx.request.body.page
  await new Promise((resolve, reject)=>{
    fs.readFile("./api/logistics.json", (err, data) => {
      if (err) throw err;
      res = JSON.parse(data)
      ctx.set('Content-Type', 'application/json');
      ctx.response.body = JSON.stringify(res);
      resolve();
    })
  })
};

const structData = async (ctx, next) => {
  let res = {};
  console.log("response...");
  await new Promise((resolve, reject)=>{
    fs.readFile("./api/structData.json", (err, data) => {
      if (err) throw err;
      res = JSON.parse(data)
      ctx.set('Content-Type', 'application/json');
      ctx.response.body = JSON.stringify(res);
      resolve();
    })
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

// 使用路由
app.use(route.post('/login', login))
  .use(route.post('/logistics', logistics))
  .use(route.post('/structData', structData))
  .use(route.get('/*', error));


// 监听服务端口
let port = 3000;

app.listen(port, () => {
  console.log(`Mock-data-Server is running at ${port} port...`)
});
