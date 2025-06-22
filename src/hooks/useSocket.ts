import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

export default function useSocket(): Socket | null {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(process.env.NEXT_PUBLIC_API_BASE_URL!, {
        transports: ["websocket"],
      });
    }

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef.current;
}
