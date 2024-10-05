import React, { useState } from "react";

interface ResizableIframeProps {
  pagePath: string;
}

const ResizableIframe: React.FC<ResizableIframeProps> = ({ pagePath }) => {
  const [carouselHeight, setCarouselHeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    // get carousel-component height by postmessage
    window.addEventListener("message", (event) => {
      console.log(event);
      if (event.data.type === "carouselHeight") {
        setCarouselHeight(event.data.height);
        setIsLoading(false);
      }
    });
  };

  return (
    <div>
      <div
        style={{
          marginTop: "24px",
          width: "100%",
          height: carouselHeight ?? 280,
          position: "relative",
          overflow: "hidden",
          transition: "height 0.3s ease-in-out",
        }}
      >
        {/* {isLoading && <div style={{ textAlign: "center" }}>Loading...</div>} */}
        <iframe
          id="carousel-iframe"
          onLoad={handleIframeLoad}
          src={`${process.env.DEMO_APP_URL}${pagePath}/demo?in_doc=true`}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            overflow: "hidden",
            // opacity: isLoading ? 0 : 1,
          }}
        ></iframe>
      </div>
    </div>
  );
};

export default ResizableIframe;
