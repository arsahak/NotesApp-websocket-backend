// const app = require('./server');
// const { serverPort } = require('./secret');



// app.listen(serverPort, () => {
//   console.log(`app is running on http://localhost:${serverPort}`);
// });


const { server } = require("./server");
const { serverPort } = require("./secret");

server.listen(serverPort, () => {
  console.log(`Server is running on http://localhost:${serverPort}`);
});
