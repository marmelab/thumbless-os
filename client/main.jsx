import * as React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AppPage } from "./pages/AppPage";
import { SettingsPage } from "./pages/SettingsPage";
import "./base.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createBrowserRouter([
    { index: true, Component: AppPage },
    { path: "settings", Component: SettingsPage },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

