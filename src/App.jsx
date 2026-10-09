import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
const AdultosPage = lazy(() => import('./pages/AdultosPage.jsx'))
const AdultosBlogPage = lazy(() => import('./pages/AdultosBlogPage.jsx'))
const LevelHubPage = lazy(() => import('./pages/LevelHubPage.jsx'))
const ThemeHubPage = lazy(() => import('./pages/ThemeHubPage.jsx'))
const TemarioHubPage = lazy(() => import('./pages/TemarioHubPage.jsx'))
const FlashcardsPage = lazy(() => import('./pages/FlashcardsPage.jsx'))
const QuizPage = lazy(() => import('./pages/QuizPage.jsx'))
const ListeningPage = lazy(() => import('./pages/ListeningPage.jsx'))
const ReadingWritingPage = lazy(() => import('./pages/ReadingWritingPage.jsx'))
const FillBlankPage = lazy(() => import('./pages/FillBlankPage.jsx'))
const PronunciationPage = lazy(() => import('./pages/PronunciationPage.jsx'))
const SentenceBuilderPage = lazy(() => import('./pages/SentenceBuilderPage.jsx'))
const VoiceLabPage = lazy(() => import('./pages/VoiceLabPage.jsx'))
const GlossaryPage = lazy(() => import('./pages/GlossaryPage.jsx'))
const PhoneticChartPage = lazy(() => import('./pages/PhoneticChartPage.jsx'))
const InfanciasPage = lazy(() => import('./pages/InfanciasPage.jsx'))
const InfanciasBlogPage = lazy(() => import('./pages/InfanciasBlogPage.jsx'))
const InfanciasGroupHubPage = lazy(() => import('./pages/InfanciasGroupHubPage.jsx'))
const InfanciasFlashcardsPage = lazy(() => import('./pages/InfanciasFlashcardsPage.jsx'))
const InfanciasQuizPage = lazy(() => import('./pages/InfanciasQuizPage.jsx'))
const InfanciasListeningPage = lazy(() => import('./pages/InfanciasListeningPage.jsx'))
const InfanciasReadingWritingPage = lazy(() => import('./pages/InfanciasReadingWritingPage.jsx'))
const InfanciasFillBlankPage = lazy(() => import('./pages/InfanciasFillBlankPage.jsx'))
const InfanciasPronunciationPage = lazy(() => import('./pages/InfanciasPronunciationPage.jsx'))
const InfanciasSentenceBuilderPage = lazy(() => import('./pages/InfanciasSentenceBuilderPage.jsx'))
const InfanciasVoiceLabPage = lazy(() => import('./pages/InfanciasVoiceLabPage.jsx'))
const InfanciasGlossaryPage = lazy(() => import('./pages/InfanciasGlossaryPage.jsx'))
const InfanciasPhoneticChartPage = lazy(() => import('./pages/InfanciasPhoneticChartPage.jsx'))
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage.jsx'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'))
const AdminHomePage = lazy(() => import('./pages/admin/AdminHomePage.jsx'))
const AdminBlogPage = lazy(() => import('./pages/admin/AdminBlogPage.jsx'))
const AdminTracksPage = lazy(() => import('./pages/admin/AdminTracksPage.jsx'))
const AdminGroupsPage = lazy(() => import('./pages/admin/AdminGroupsPage.jsx'))
const AdminContentPage = lazy(() => import('./pages/admin/AdminContentPage.jsx'))
const AdminContentStatusPage = lazy(() => import('./pages/admin/AdminContentStatusPage.jsx'))
const AdminErrorLogPage = lazy(() => import('./pages/admin/AdminErrorLogPage.jsx'))
const AdminSubmissionsPage = lazy(() => import('./pages/admin/AdminSubmissionsPage.jsx'))
const AdminGlossaryPage = lazy(() => import('./pages/admin/AdminGlossaryPage.jsx'))

// Cada página se descarga recién cuando se visita (code splitting): el
// alumno no baja el panel de admin ni las librerías de drag & drop si no
// las usa, así la primera carga es mucho más liviana.
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center text-ink/60 text-sm">Cargando…</div>
)

export default function App() {
  return (
    <BrowserRouter>
      <Analytics />
      <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tabla-fonetica" element={<PhoneticChartPage />} />
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
        <Route path="/adultos/:level/:theme/:temario/pronunciacion" element={<PronunciationPage />} />
        <Route path="/adultos/:level/:theme/:temario/sentence-builder" element={<SentenceBuilderPage />} />
        <Route path="/adultos/:level/:theme/:temario/voice-lab" element={<VoiceLabPage />} />
        <Route path="/adultos/:level/:theme/glosario" element={<GlossaryPage />} />
        <Route path="/infancias" element={<InfanciasPage />} />
        <Route path="/infancias/blog" element={<InfanciasBlogPage />} />
        <Route path="/infancias/tabla-fonetica" element={<InfanciasPhoneticChartPage />} />
        <Route path="/infancias/:group" element={<InfanciasGroupHubPage />} />
        <Route path="/infancias/:group/flashcards" element={<InfanciasFlashcardsPage />} />
        <Route path="/infancias/:group/cuestionario" element={<InfanciasQuizPage />} />
        <Route path="/infancias/:group/listening" element={<InfanciasListeningPage />} />
        <Route path="/infancias/:group/reading-writing" element={<InfanciasReadingWritingPage />} />
        <Route path="/infancias/:group/completar" element={<InfanciasFillBlankPage />} />
        <Route path="/infancias/:group/pronunciacion" element={<InfanciasPronunciationPage />} />
        <Route path="/infancias/:group/sentence-builder" element={<InfanciasSentenceBuilderPage />} />
        <Route path="/infancias/:group/voice-lab" element={<InfanciasVoiceLabPage />} />
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
          <Route path="respuestas" element={<AdminSubmissionsPage />} />
          <Route path="glosario" element={<AdminGlossaryPage />} />
        </Route>
      </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  )
}
