export default function createMedia({ address, port, onCreate }) {
  let ws = new WebSocket(`ws://${address}:${port}`);
  let handler = undefined;
  let initBuffer = [];
  ws.addEventListener("open", () => {
    console.log(`Connected to ${address}:${port}`);
    ws.addEventListener("message", (message) => {
      let request = JSON.parse(message.data);
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
}
