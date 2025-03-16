
const { server } = require("./server");
const { serverPort } = require("./secret");

server.listen(serverPort, () => {
  console.log(`Server is running on http://localhost:${serverPort}`);
});
