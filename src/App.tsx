import React from "react";
import { Dashboard } from "./pages/Dashboard";
import { Header } from "./components/Header/Header";

export const App: React.FC = () => {
  return (
    <>
      <Header />
      <Dashboard />
    </>
  );
};

export default App;