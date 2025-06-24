import * as React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import { AppPage } from "./pages/AppPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import "./base.css";

const root = ReactDOM.createRoot(document.getElementById("root"));

const router = createBrowserRouter([
    { index: true, Component: AppPage },
    { path: "onboarding", Component: OnboardingPage },
]);

root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

