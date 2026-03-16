/// <reference types="vite/client" />

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "react-dom/client" {
  import * as ReactDOM from "react-dom";
  export const createRoot: ReactDOM.Root;
}
