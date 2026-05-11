import { useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, options = {}) => {
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const {
    onMessage = () => {},
    onOpen = () => {},
    onClose = () => {},
    onError = () => {},
    shouldReconnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = null
  } = options;

  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    try {
      const socket = new WebSocket(url);

      socket.onopen = () => {
        console.log('✅ WebSocket متصل');
        reconnectAttemptsRef.current = 0; // إعادة تعيين محاولات إعادة الاتصال
        onOpen();
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('خطأ في معالجة الرسالة:', error);
        }
      };

      socket.onerror = (error) => {
        console.error('❌ خطأ في WebSocket:', error);
        onError(error);
      };

      socket.onclose = () => {
        console.log('WebSocket انقطع');
        onClose();

        // إعادة الاتصال مع حد أقصى للمحاولات
        if (shouldReconnect && (!maxReconnectAttempts || reconnectAttemptsRef.current < maxReconnectAttempts)) {
          reconnectAttemptsRef.current += 1;
          console.log(`🔄 محاولة إعادة الاتصال (${reconnectAttemptsRef.current})...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };

      wsRef.current = socket;
    } catch (error) {
      console.error('خطأ في الاتصال:', error);
      onError(error);
    }
  }, [url, onMessage, onOpen, onClose, onError, shouldReconnect, reconnectInterval, maxReconnectAttempts]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const send = useCallback((data) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn('WebSocket غير متصل');
    }
  }, []);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
  }, []);

  return { 
    send, 
    ws: wsRef.current,
    disconnect,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN
  };
};

export default useWebSocket;
