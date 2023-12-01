import React, { useState } from "react";

interface ResizableIframeProps {
  page: string
}

const min = 350;
const max = 1000;

const ResizableIframe: React.FC<ResizableIframeProps> = ({ page }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div style={{ marginTop: "24px", width: "100%", height: expanded ? max : min, position: "relative", overflow: "hidden" }}>
        <iframe
          src={`https://dohooo.github.io/react-native-reanimated-carousel/?color=dark&page=${page}`}
          style={{ width: "100%", height: "100%", border: "none", overflow: "hidden" }}
        ></iframe>
      </div>
      <div style={{ display: "flex", flexDirection: "row-reverse", padding: "8px" }}>
        <button onClick={() => setExpanded(!expanded)}>Show {expanded ? "less" : "more"}</button>
      </div>
    </div>
  );
};

export default ResizableIframe;
