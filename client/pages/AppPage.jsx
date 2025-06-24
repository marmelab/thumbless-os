import { Navigate } from "react-router";
import App from "../components/App";
import { getProfile } from "../profile";

export const AppPage = () => {
  const profile = getProfile();
  if (!profile) {
    return <Navigate to="/onboarding" replace={true} />;
  }
  return <App />;
};
