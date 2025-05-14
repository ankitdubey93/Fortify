/*
Strict mode is a tool for highlighting potential problems in the application during development. It helps find common bugs
in the components early in the development process. It doesn't affect the production build.
*/
import { StrictMode } from "react";
/*
createRoot function is the new way to render the React application into the DOM. It replaces the older ReactDOM.render method. 
*/
import { createRoot } from "react-dom/client";
/*
This line imports the css styles, it tells the application to include the styles defined in index.css. These styles are likely global styles
that apply to your entire application. 
*/
import "./index.css";
/*
The App component is the root component of our application, it's the top level component that gets rendered first.
*/
import App from "./App.tsx";
/*
react-router-dom is a library that provides tools for handling navigation(routing) in web applications. 
BrowserRouter is a router that uses HTML5 history API(pushState, replaceState, and the popstate event) to keep the UI in sync with the URL.
This is essential for creating single-page applications(SPAs) where the user can navigate between different "pages"
without the browser doing a full page reload.
*/
import { BrowserRouter } from "react-router-dom";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);

/*

This is the core line that renders the React application into the web page.
document.getElementById("root"): This part finds the HTML element in the index.html file that has the ID "root". 
This is the element where our React application will be mounted. It's the entry point for our React application in the HTML.

The ! is the non-null assertion operator in TypeScript. It tells the TypeScript compuler that document.getElementById("root") will definitely
return an element, and not null or undefined. This is necessary because getElementById can potentially return null if not element with
that ID exists. In this case, we are asserting that the element will exist.

createRoot(...): This creates a root object, which represents the root of the React tree that will be rendered into the DOM. We 
pass the root DOM node(the "root" element) to createRoot.

.render(...): This method is called on the root object to render the React component tree into the DOM. The argument to render
is the JSX that defines what should be rendered.

<BrowserRouter>: This component makes the React Router's routing capabilities available to all of the components within it.
By wrapping the App coponent with it, we are enabling client-side routing. This means that the application can navigate between 
different views without making full requests to the server. The router manages the URL in the browser and updates the UI accordingly.


<App />:
This is the instance of our main application component. The App component is where the main logic and structure of the application are
defined. It's the root of our application's components tree.
*/
