import { io } from "socket.io-client";
import { ENABLE_SOCKET, normalizedBaseUrl } from "../config/api";

const noop = () => {};
const disabledSocket = {
  on: noop,
  off: noop,
  emit: noop,
  connect: noop,
  disconnect: noop,
};

export const socket = ENABLE_SOCKET
  ? io(normalizedBaseUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    })
  : disabledSocket;

export default socket;
