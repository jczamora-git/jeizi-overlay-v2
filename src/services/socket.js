import { io } from "socket.io-client";
import { normalizedBaseUrl } from "../config/api";

export const socket = io(normalizedBaseUrl, {
  transports: ["websocket", "polling"],
  autoConnect: true,
});

export default socket;
