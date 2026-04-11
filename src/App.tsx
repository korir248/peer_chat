import { useP2P } from "./hooks/useP2P";
import { Onboarding } from "./components/Onboarding";
import { Dashboard } from "./components/Dashboard";

function App() {
  const { identity, isLoading, createIdentity } = useP2P();

  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!identity) {
    return <Onboarding onSubmit={createIdentity} />;
  }

  return <Dashboard />;
}

export default App;
