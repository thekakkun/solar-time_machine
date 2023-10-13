import { useEffect, useRef, useState } from "react";

export default function Camera() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [media, setMedia] = useState<MediaStream | null>(null);

  async function getMedia() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });

    setMedia(stream);
  }

  useEffect(() => {
    function draw(video: HTMLVideoElement) {
      const ctx = canvasRef.current?.getContext("2d");
      ctx?.drawImage(video, 0, 0);

      requestAnimationFrame(() => draw(video));
    }

    if (media && canvasRef.current) {
      let video = document.createElement("video");
      video.srcObject = media;
      video.play();
      console.log(media);

      requestAnimationFrame(() => draw(video));
    }
  }, [media, canvasRef]);

  return (
    <>
      {media ? (
        <>
          <canvas height={480} width={640} ref={canvasRef}></canvas>
        </>
      ) : (
        <button onClick={async () => await getMedia()}>get video</button>
      )}
    </>
  );
}
