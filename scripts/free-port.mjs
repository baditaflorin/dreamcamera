import { createServer } from "node:net";

const server = createServer();

server.listen(0, "127.0.0.1", () => {
  const address = server.address();
  if (!address || typeof address === "string") {
    server.close(() => process.exit(1));
    return;
  }

  console.log(address.port);
  server.close();
});
