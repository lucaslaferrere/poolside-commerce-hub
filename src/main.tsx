import { createRoot } from "react-dom/client";
import App from "./App.tsx";

// Fuentes auto-hosteadas (sin pedirlas a Google Fonts / Fontshare en runtime,
// así no se expone la IP del visitante a esos terceros).
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/dm-sans/400-italic.css";
import "@fontsource/lora/400.css";
import "@fontsource/lora/500.css";
import "@fontsource/lora/600.css";
import "@fontsource/lora/700.css";

import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
