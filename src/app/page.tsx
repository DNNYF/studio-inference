
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import type { ConversationSession } from '@/lib/types';
import { AppSidebar } from '@/components/AppSidebar';
import { ChatPanel } from '@/components/chat/ChatPanel';
import useLocalStorage from '@/hooks/useLocalStorage';
import { v4 as uuidv4 } from 'uuid';
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { PanelLeft } from 'lucide-react';

// Use the correct environment variable and provide a fallback
const LM_STUDIO_API_ENDPOINT = process.env.NEXT_PUBLIC_LM_STUDIO_API_ENDPOINT || "http://localhost:1234/v1/chat/completions";

export default function ChatStudioPage() {
  const [sessions, setSessions] = useLocalStorage<ConversationSession[]>("chatSessions", []);
  const [currentSessionId, setCurrentSessionId] = useLocalStorage<string | null>("currentChatSessionId", null);
  
  
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const currentSession = React.useMemo(() => {
    if (!hydrated) return null; // Don't compute until hydrated
    return sessions.find(s => s.id === currentSessionId) || null;
  }, [sessions, currentSessionId, hydrated]);

  const handleSetCurrentSession = useCallback((session: ConversationSession | null) => {
    setCurrentSessionId(session ? session.id : null);
  }, [setCurrentSessionId]);

  const saveSession = useCallback((sessionToSave: ConversationSession) => {
    setSessions(prevSessions => {
      const existingIndex = prevSessions.findIndex(s => s.id === sessionToSave.id);
      if (existingIndex > -1) {
        const updatedSessions = [...prevSessions];
        updatedSessions[existingIndex] = sessionToSave;
        return updatedSessions;
      }
      return [...prevSessions, sessionToSave];
    });
  }, [setSessions]);

  const handleNewChat = useCallback(() => {
    setCurrentSessionId(null); 
  }, [setCurrentSessionId]);

  const handleDeleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null);
    }
  }, [setSessions, currentSessionId, setCurrentSessionId]);
  
  const handleDeleteAllSessions = useCallback(() => {
    setSessions([]);
    setCurrentSessionId(null);
  }, [setSessions, setCurrentSessionId]);


  const handleExportAll = () => {
    if (sessions.length === 0) return;

    const exportData = sessions.map(session => ({
      conversations: session.messages
        .filter(msg => msg.role === 'user' || msg.role === 'assistant') 
        .map(msg => ({
          role: msg.role === 'user' ? 'human' : 'assistant',
          content: msg.content,
        })),
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chat_studio_history.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  if (!hydrated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  return (
      <div className="flex h-screen w-screen overflow-hidden">
        <AppSidebar
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSessionId}
          onNewChat={handleNewChat}
          onExportAll={handleExportAll}
          onDeleteSession={handleDeleteSession}
          onDeleteAllSessions={handleDeleteAllSessions}
        />
        <SidebarInset className="flex-1 flex flex-col p-0 md:p-2 md:m-0 md:peer-data-[variant=inset]:ml-[var(--sidebar-width-icon)] peer-data-[state=expanded]:md:peer-data-[variant=inset]:ml-[var(--sidebar-width)] transition-[margin-left] duration-300 ease-in-out">
          <div className="p-2 md:hidden"> {/* Mobile trigger */}
            <SidebarTrigger>
               <PanelLeft />
            </SidebarTrigger>
          </div>
          <main className="flex-1 p-2 md:p-4 overflow-y-auto h-full">
            <ChatPanel
              currentSession={currentSession}
              setCurrentSession={handleSetCurrentSession}
              saveSession={saveSession}
              apiEndpoint={LM_STUDIO_API_ENDPOINT} 
            />
          </main>
        </SidebarInset>
      </div>
  );

}
