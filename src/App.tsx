import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Editor } from '@/pages/Editor';
import { Preview } from '@/pages/Preview';
import { Embed } from '@/pages/Embed';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Editor />} />
        <Route path="/preview/:id" element={<Preview />} />
        <Route path="/embed/:id" element={<Embed />} />
      </Routes>
    </Router>
  );
}
