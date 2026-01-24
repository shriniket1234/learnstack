import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { TodoPage } from "./pages/TodoPage";
import { NotesPage } from "./pages/NotesPage";
import { ChatPage } from "./pages/ChatPage";
import { AIPage } from "./pages/AIPage";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/todo" /> : <LoginPage />}
        />
        <Route
          path="/signup"
          element={user ? <Navigate to="/todo" /> : <SignupPage />}
        />
        <Route
          path="/todo"
          element={
            <ProtectedRoute>
              <TodoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notes"
          element={
            <ProtectedRoute>
              <NotesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai"
          element={
            <ProtectedRoute>
              <AIPage />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/todo" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
