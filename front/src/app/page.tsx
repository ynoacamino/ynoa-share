'use client';

import { useEffect, useRef, useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import { useRouter } from 'next/navigation';
import { WS_BACKEND_URL } from '@/config/global';

export default function Home() {
  const socket = useRef<WebSocket>();
  const [text, setText] = useState('');
  const textDebounced = useDebounce(text, 500);

  const [isConnected, setIsConnected] = useState(false);

  const router = useRouter();

  useEffect(() => {
    socket.current = new WebSocket(`${WS_BACKEND_URL}/ws`);

    socket.current.onopen = () => {
      setIsConnected(true);
    };

    socket.current.onmessage = (e) => {
      setText(e.data);
    };

    socket.current.onclose = () => {
      router.push('/error');
    };

    socket.current.onerror = () => {
      router.push('/error');
    };
  }, [router]);

  const sendMessage = (message: string) => {
    socket.current?.send(message);
  };

  useEffect(() => {
    if (!isConnected) return;
    sendMessage(textDebounced);
  }, [textDebounced, isConnected]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    setText(value);
  };

  return (
    <textarea
      className="w-full h-screen focus:border-0 active:border-0 resize-none p-3 outline-none"
      onChange={handleChange}
      value={text}
    />
  );
}
