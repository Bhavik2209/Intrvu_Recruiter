import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { FigmaDesign } from "./screens/FigmaDesign/FigmaDesign";

createRoot(document.getElementById("app") as HTMLElement).render(
  <StrictMode>
    <FigmaDesign />
  </StrictMode>,
);
