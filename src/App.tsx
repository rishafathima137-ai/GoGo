import { lazy, Suspense } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { ProfileProvider } from './context/ProfileContext'
import { SavedProvider } from './context/SavedContext'
import { TripsProvider } from './context/TripsContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { LoadingState } from './components/common/LoadingState'
import { NotFoundPage } from './pages/NotFoundPage'
import ExplorePage from './pages/ExplorePage'

const DestinationDetailsPage = lazy(() => import('./pages/DestinationDetailsPage'))
const TripsPage = lazy(() => import('./pages/TripsPage'))
const TripDetailsPage = lazy(() => import('./pages/TripDetailsPage'))
const HotelsPage = lazy(() => import('./pages/HotelsPage'))
const TicketsPage = lazy(() => import('./pages/TicketsPage'))
const TranslatorPage = lazy(() => import('./pages/TranslatorPage'))
const MapPage = lazy(() => import('./pages/MapPage'))
const SavedPage = lazy(() => import('./pages/SavedPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

export default function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <SavedProvider>
          <TripsProvider>
            <ErrorBoundary label="Travora">
              <Suspense fallback={<LoadingState label="Loading your world…" className="min-h-[60vh]" />}>
                <Routes>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<ExplorePage />} />
                    <Route path="/destination/:id" element={<DestinationDetailsPage />} />
                    <Route path="/trips" element={<TripsPage />} />
                    <Route path="/trips/:id" element={<TripDetailsPage />} />
                    <Route path="/hotels" element={<HotelsPage />} />
                    <Route path="/tickets" element={<TicketsPage />} />
                    <Route path="/translator" element={<TranslatorPage />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/saved" element={<SavedPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </TripsProvider>
        </SavedProvider>
      </ProfileProvider>
    </BrowserRouter>
  )
}
