import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
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
import FillBlankPage from './pages/FillBlankPage.jsx'
import MatchingPage from './pages/MatchingPage.jsx'
import PronunciationPage from './pages/PronunciationPage.jsx'
import GlossaryPage from './pages/GlossaryPage.jsx'
import InfanciasPage from './pages/InfanciasPage.jsx'
import InfanciasBlogPage from './pages/InfanciasBlogPage.jsx'
import InfanciasGroupHubPage from './pages/InfanciasGroupHubPage.jsx'
import InfanciasFlashcardsPage from './pages/InfanciasFlashcardsPage.jsx'
import InfanciasQuizPage from './pages/InfanciasQuizPage.jsx'
import InfanciasListeningPage from './pages/InfanciasListeningPage.jsx'
import InfanciasReadingWritingPage from './pages/InfanciasReadingWritingPage.jsx'
import InfanciasFillBlankPage from './pages/InfanciasFillBlankPage.jsx'
import InfanciasMatchingPage from './pages/InfanciasMatchingPage.jsx'
import InfanciasPronunciationPage from './pages/InfanciasPronunciationPage.jsx'
import InfanciasGlossaryPage from './pages/InfanciasGlossaryPage.jsx'
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import AdminHomePage from './pages/admin/AdminHomePage.jsx'
import AdminBlogPage from './pages/admin/AdminBlogPage.jsx'
import AdminTracksPage from './pages/admin/AdminTracksPage.jsx'
import AdminGroupsPage from './pages/admin/AdminGroupsPage.jsx'
import AdminContentPage from './pages/admin/AdminContentPage.jsx'
import AdminContentStatusPage from './pages/admin/AdminContentStatusPage.jsx'
import AdminErrorLogPage from './pages/admin/AdminErrorLogPage.jsx'
import AdminGlossaryPage from './pages/admin/AdminGlossaryPage.jsx'

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
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
        <Route path="/adultos/:level/:theme/:temario/completar" element={<FillBlankPage />} />
        <Route path="/adultos/:level/:theme/:temario/sinonimos-antonimos" element={<MatchingPage />} />
        <Route path="/adultos/:level/:theme/:temario/pronunciacion" element={<PronunciationPage />} />
        <Route path="/adultos/:level/:theme/glosario" element={<GlossaryPage />} />
        <Route path="/infancias" element={<InfanciasPage />} />
        <Route path="/infancias/blog" element={<InfanciasBlogPage />} />
        <Route path="/infancias/:group" element={<InfanciasGroupHubPage />} />
        <Route path="/infancias/:group/flashcards" element={<InfanciasFlashcardsPage />} />
        <Route path="/infancias/:group/cuestionario" element={<InfanciasQuizPage />} />
        <Route path="/infancias/:group/listening" element={<InfanciasListeningPage />} />
        <Route path="/infancias/:group/reading-writing" element={<InfanciasReadingWritingPage />} />
        <Route path="/infancias/:group/completar" element={<InfanciasFillBlankPage />} />
        <Route path="/infancias/:group/sinonimos-antonimos" element={<InfanciasMatchingPage />} />
        <Route path="/infancias/:group/pronunciacion" element={<InfanciasPronunciationPage />} />
        <Route path="/infancias/:group/glosario" element={<InfanciasGlossaryPage />} />
        {/* Ruta del panel de administración a propósito no obvia (no "/admin"):
            no está linkeada desde ningún lado del sitio público, así que
            solo se llega escribiéndola directamente. La protección real es
            el login + las políticas de Supabase, esto es una capa extra
            para que no se note a simple vista. */}
        <Route path="/notas-profe/login" element={<AdminLoginPage />} />
        <Route path="/notas-profe" element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="blog" element={<AdminBlogPage />} />
          <Route path="tracks" element={<AdminTracksPage />} />
          <Route path="groups" element={<AdminGroupsPage />} />
          <Route path="content" element={<AdminContentPage />} />
          <Route path="content-status" element={<AdminContentStatusPage />} />
          <Route path="errores" element={<AdminErrorLogPage />} />
          <Route path="glosario" element={<AdminGlossaryPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
