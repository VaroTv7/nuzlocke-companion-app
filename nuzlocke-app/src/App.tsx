import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AppLayout } from './components/Layout/AppLayout';
import { DashboardView } from './components/Dashboard/DashboardView';
import { PCView } from './components/PC/PCView';
import { CombatView } from './components/Combat/CombatView';
import { RivalLookup } from './components/Combat/RivalLookup';
import { MoveDex } from './components/Dex/MoveDex';
import { Pokedex } from './components/Dex/Pokedex';
import { RulesView } from './components/Rules/RulesView';
import { TeamBuilder } from './components/Builder/TeamBuilder';
import { PageTransition } from './components/Shared/PageTransition';
import { ErrorBoundary } from './components/ErrorBoundary';

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/app/dashboard" element={
          <PageTransition><DashboardView /></PageTransition>
        } />
        <Route path="/app/pc" element={
          <PageTransition><PCView /></PageTransition>
        } />
        <Route path="/app/combat" element={
          <PageTransition><CombatView /></PageTransition>
        } />
        <Route path="/app/rivals" element={
          <PageTransition><RivalLookup /></PageTransition>
        } />
        <Route path="/app/movedex" element={
          <PageTransition><MoveDex /></PageTransition>
        } />
        <Route path="/app/dex" element={
          <PageTransition><Pokedex /></PageTransition>
        } />
        <Route path="/app/builder" element={
          <PageTransition><TeamBuilder /></PageTransition>
        } />
        <Route path="/app/rules" element={
          <PageTransition><RulesView /></PageTransition>
        } />
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppLayout>
          <AppRoutes />
        </AppLayout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
