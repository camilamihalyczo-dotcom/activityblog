import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AdultosPage from './pages/AdultosPage.jsx'
import AdultosBlogPage from './pages/AdultosBlogPage.jsx'
import LevelHubPage from './pages/LevelHubPage.jsx'
import ThemeHubPage from './pages/ThemeHubPage.jsx'
import TemarioHubPage from './pages/TemarioHubPage.jsx'
import FlashcardsPage from './pages/FlashcardsPage.jsx'
import QuizPage from './pages/QuizPage.jsx'
import ListeningPage from './pages/ListeningPage.jsx'
import ReadingWritingPage from './pages/ReadingWritingPage.jsx'
import InfanciasPage from './pages/InfanciasPage.jsx'
import InfanciasBlogPage from './pages/InfanciasBlogPage.jsx'
import InfanciasGroupHubPage from './pages/InfanciasGroupHubPage.jsx'
import InfanciasFlashcardsPage from './pages/InfanciasFlashcardsPage.jsx'
import InfanciasQuizPage from './pages/InfanciasQuizPage.jsx'
import InfanciasListeningPage from './pages/InfanciasListeningPage.jsx'
import InfanciasReadingWritingPage from './pages/InfanciasReadingWritingPage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminHomePage from './pages/admin/AdminHomePage.jsx'
import AdminBlogPage from './pages/admin/AdminBlogPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/adultos" element={<AdultosPage />} />
        <Route path="/adultos/blog" element={<AdultosBlogPage />} />
        <Route path="/adultos/:level" element={<LevelHubPage />} />
        <Route path="/adultos/:level/:theme" element={<ThemeHubPage />} />
        <Route path="/adultos/:level/:theme/:temario" element={<TemarioHubPage />} />
        <Route path="/adultos/:level/:theme/:temario/flashcards" element={<FlashcardsPage />} />
        <Route path="/adultos/:level/:theme/:temario/cuestionario" element={<QuizPage />} />
        <Route path="/adultos/:level/:theme/:temario/listening" element={<ListeningPage />} />
        <Route path="/adultos/:level/:theme/:temario/reading-writing" element={<ReadingWritingPage />} />
        <Route path="/infancias" element={<InfanciasPage />} />
        <Route path="/infancias/blog" element={<InfanciasBlogPage />} />
        <Route path="/infancias/:group" element={<InfanciasGroupHubPage />} />
        <Route path="/infancias/:group/flashcards" element={<InfanciasFlashcardsPage />} />
        <Route path="/infancias/:group/cuestionario" element={<InfanciasQuizPage />} />
        <Route path="/infancias/:group/listening" element={<InfanciasListeningPage />} />
        <Route path="/infancias/:group/reading-writing" element={<InfanciasReadingWritingPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="blog" element={<AdminBlogPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
