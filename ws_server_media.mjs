import wsPkg from "ws";
const { Server } = wsPkg;


export default function createMedia({ port, server, onCreate, ...wsParams }) {
  let wss = new Server({ port, server, ...wsParams });
  wss.on("connection", (ws, req) => {
    console.log(`New connection from ${req.connection.remoteAddress}:${req.connection.remotePort}`);
    let handler = undefined;
    let initBuffer = [];
    ws.on("message", (text) => {
      let request = JSON.parse(text);
      if (handler) {
        handler(request);
      } else {
        initBuffer.push(request);
      }
    });
    onCreate({
      send(request) {
        ws.send(JSON.stringify(request));
      },
      onReceive(newHandler) {
        handler = newHandler;
        for (let request of initBuffer) {
          handler(request);
        }
        initBuffer = [];
      }
    });
  });

  if (!server) {
    wss.listen(port, () => {
      console.log(`Running WebSocket server on *.${port}`);
    });
  }
}
