import { useEffect, useRef } from "react";

export default function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const setStream = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    };

    setStream().catch(console.error);
  }, []);

  return (
    <>
      <button>Hey!</button>
      <video ref={videoRef}></video>
    </>
  );
}
