// LiveView.js
import React, { useEffect, useRef } from "react";
import { useTheme } from "@mui/material";

export default function LiveView({ cameraId }) {
  const theme = useTheme();
  const videoRef = useRef(null);

  useEffect(() => {
    if (!cameraId) return;

    const scheme = window.location.protocol === "https:" ? "wss" : "ws";
    const host = window.location.hostname;
    const wsUrl = `${scheme}://${host}:8000/ws/stream/`;
    const ws = new WebSocket(wsUrl);

    const pc = new RTCPeerConnection();

    ws.onmessage = async (event) => {
      const msg = JSON.parse(event.data);
      if (msg.type === "answer") {
        await pc.setRemoteDescription({ type: "answer", sdp: msg.sdp });
      }
    };

    pc.ontrack = (event) => {
      videoRef.current.srcObject = event.streams[0];
    };

    ws.onopen = async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      ws.send(
        JSON.stringify({
          type: "offer",
          sdp: offer.sdp,
          camera_id: cameraId.toString(), // "0" أو IP
        })
      );
    };

    return () => {
      ws.close();
      pc.close();
    };
  }, [cameraId]);

  return (
    <div>
      <h3>🎥 بث مباشر (الكاميرا: {cameraId})</h3>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        style={{
          width: "100%",
          maxWidth: "720px",
          background: theme.palette.custom.videoBackground,
          borderRadius: "8px",
        }}
      />
    </div>
  );
}
