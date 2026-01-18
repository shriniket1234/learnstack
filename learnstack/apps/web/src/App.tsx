import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { TodoPage } from "./pages/TodoPage";
import { NotesPage } from "./pages/NotesPage";
import { ChatPage } from "./pages/ChatPage";
import { AIPage } from "./pages/AIPage";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/" element={<TodoPage />} /> {/* Default to Todo */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
