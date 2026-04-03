
import React, { useState, useEffect } from 'react';
// Fixed: Use namespace import from react-router-dom to resolve "no exported member" errors
import * as ReactRouterDOM from 'react-router-dom';
const { HashRouter, Routes, Route, Navigate } = ReactRouterDOM as any;

import Layout from './components/Layout';
import AuthGateway from './components/AuthGateway';
import PaywallModal from './components/PaywallModal';
import OnyxAgent from './components/OnyxAgent';
import Dashboard from './pages/Dashboard';
import Auditor from './pages/Tools/Auditor';
import Designer from './pages/Tools/Designer';
import Comparison from './pages/Tools/Comparison';
import Compliance from './pages/Tools/Compliance';
import Roadmap from './pages/Tools/Roadmap';
import Troubleshooter from './pages/Tools/Troubleshooter';
import PrivacyScanner from './pages/Tools/PrivacyScanner';
import PromptLab from './pages/Tools/PromptLab';
import WeeklyIntel from './pages/Tools/WeeklyIntel';
import CodeOptimizer from './pages/Tools/CodeOptimizer';
import NodeRoadmap from './pages/Tools/NodeRoadmap';
import APIScanner from './pages/Tools/APIScanner';
import NodeSpecialist from './pages/Tools/NodeSpecialist';
import ErrorResolver from './pages/Tools/ErrorResolver';
import CredentialAssistant from './pages/Tools/CredentialAssistant';
import { UserSession } from './types';
import { USAGE_LIMIT } from './constants';
import { ProtocolProvider } from './context/ProtocolContext';

const App: React.FC = () => {
  const [session, setSession] = useState<UserSession>(() => {
    const saved = localStorage.getItem('onyx_session');
    const defaultSession: UserSession = {
      isAuthenticated: false,
      username: null,
      usageCount: 0,
      isPremium: false,
      auditScores: [],
      efficiencyGains: [],
      featureUsage: {},
      usageHistory: []
    };

    if (!saved) return defaultSession;

    try {
      const parsed = JSON.parse(saved);
      // Merge with default to handle new schema updates safely
      return { ...defaultSession, ...parsed };
    } catch (e) {
      return defaultSession;
    }
  });

  const [isPaywallOpen, setIsPaywallOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('onyx_session', JSON.stringify(session));
  }, [session]);

  const handleLogin = (email: string) => {
    const username = email.split('@')[0];
    setSession(prev => ({ 
      ...prev,
      isAuthenticated: true, 
      username, 
      // Seed initial activity if new
      usageHistory: prev.usageHistory.length === 0 ? [
        { timestamp: Date.now() - 3600000 * 24 * 2, toolId: 'login' },
        { timestamp: Date.now() - 3600000 * 24 * 1, toolId: 'login' }
      ] : prev.usageHistory
    }));
  };

  const handleLogout = () => {
    setSession({ 
      isAuthenticated: false, 
      username: null, 
      usageCount: 0, 
      isPremium: false,
      auditScores: [],
      efficiencyGains: [],
      featureUsage: {},
      usageHistory: []
    });
    localStorage.removeItem('onyx_session');
  };

  const trackAction = (toolId: string, metrics?: { score?: number, gain?: number }) => {
    setSession(prev => {
      const newCount = (prev.usageCount || 0) + 1;
      
      const newAuditScores = metrics?.score !== undefined 
        ? [...prev.auditScores, metrics.score] 
        : prev.auditScores;
        
      const newEfficiencyGains = metrics?.gain !== undefined 
        ? [...prev.efficiencyGains, metrics.gain] 
        : prev.efficiencyGains;

      const newFeatureUsage = { ...prev.featureUsage };
      newFeatureUsage[toolId] = (newFeatureUsage[toolId] || 0) + 1;

      const newHistory = [
        ...prev.usageHistory,
        { timestamp: Date.now(), toolId }
      ];

      // Limit history to last 500 actions to prevent storage bloat
      if (newHistory.length > 500) newHistory.shift();

      if (!prev.isPremium && newCount >= USAGE_LIMIT) {
        setIsPaywallOpen(true);
      }
      
      return { 
        ...prev, 
        usageCount: newCount,
        auditScores: newAuditScores,
        efficiencyGains: newEfficiencyGains,
        featureUsage: newFeatureUsage,
        usageHistory: newHistory
      };
    });
  };

  const handleUpgrade = () => {
    setSession(prev => ({ ...prev, isPremium: true }));
    setIsPaywallOpen(false);
  };

  if (!session.isAuthenticated) {
    return <AuthGateway onLogin={handleLogin} />;
  }

  return (
    <ProtocolProvider>
      <HashRouter>
        <Layout user={{ username: session.username, isPremium: session.isPremium }} onLogout={handleLogout}>
          <Routes>
            <Route path="/" element={<Dashboard session={session} />} />
            <Route path="/weekly-intel" element={<WeeklyIntel onAction={() => trackAction('weekly-intel')} />} />
            <Route path="/node-roadmap" element={<NodeRoadmap onAction={() => trackAction('node-roadmap')} />} />
            <Route path="/lab" element={<PromptLab onAction={() => trackAction('lab')} />} />
            <Route path="/error-resolver" element={<ErrorResolver onAction={() => trackAction('error-resolver')} />} />
            <Route path="/credential-assistant" element={<CredentialAssistant onAction={() => trackAction('credential-assistant')} />} />
            <Route path="/api-scanner" element={<APIScanner onAction={() => trackAction('api-scanner')} />} />
            <Route path="/comparison" element={<Comparison onAction={() => trackAction('comparison')} />} />
            <Route path="/code-refactor" element={<CodeOptimizer onAction={() => trackAction('code-refactor')} />} />
            <Route path="/auditor" element={<Auditor onAction={(m) => trackAction('auditor', m)} />} />
            <Route path="/compliance" element={<Compliance onAction={() => trackAction('compliance')} />} />
            <Route path="/roadmap" element={<Roadmap onAction={() => trackAction('roadmap')} />} />
            <Route path="/troubleshooter" element={<Troubleshooter onAction={() => trackAction('troubleshooter')} />} />
            <Route path="/designer" element={<Designer onAction={() => trackAction('designer')} />} />
            <Route path="/privacy" element={<PrivacyScanner onAction={() => trackAction('privacy')} />} />
            <Route path="/node-specialist" element={<NodeSpecialist onAction={() => trackAction('node-specialist')} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
        <OnyxAgent />
        <PaywallModal 
          isOpen={isPaywallOpen} 
          onClose={() => setIsPaywallOpen(false)} 
          onUpgrade={handleUpgrade} 
        />
      </HashRouter>
    </ProtocolProvider>
  );
};

export default App;
