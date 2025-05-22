
"use client";

import React from 'react';
import type { ConversationSession, ApiProvider } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FilePlus2, Download, MessageSquareText, Trash2 } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { formatDistanceToNow } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';

interface AppSidebarProps {
  sessions: ConversationSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onExportAll: () => void;
  onDeleteSession: (sessionId: string) => void;
  onDeleteAllSessions: () => void;
  isHistoryEmpty: boolean;
  selectedApiProvider: ApiProvider;
  setSelectedApiProvider: (provider: ApiProvider) => void;
}

export function AppSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onExportAll,
  onDeleteSession,
  onDeleteAllSessions,
  isHistoryEmpty,
  selectedApiProvider,
  setSelectedApiProvider,
}: AppSidebarProps) {
  const sortedSessions = [...sessions].sort((a, b) => b.lastUpdated - a.lastUpdated);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {/* Replaced SVG with simple text based on previous request */}
          <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">Chat Studio</h1>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="p-0">
        <div className="p-2">
          <Button onClick={onNewChat} className="w-full justify-start" variant="ghost" tooltip="New Chat (Ctrl+B for sidebar)">
            <FilePlus2 className="mr-2 h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
          </Button>
        </div>
        <SidebarSeparator />
        <div className="p-2 flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <h2 className="text-sm font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">History</h2>
        </div>
        <ScrollArea className="h-[calc(100%-200px)] group-data-[collapsible=icon]:h-[calc(100%-160px)]">
          <SidebarMenu className="p-2">
            {sortedSessions.map((session) => (
              <SidebarMenuItem key={session.id} className="group/menu-item">
                <div className="relative flex items-center w-full">
                  <SidebarMenuButton
                    isActive={session.id === currentSessionId}
                    onClick={() => onSelectSession(session.id)}
                    className="truncate flex-grow" 
                    tooltip={session.title}
                  >
                    <MessageSquareText />
                    <span className="group-data-[collapsible=icon]:hidden flex-1 truncate">{session.title}</span>
                  </SidebarMenuButton>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button
                         variant="ghost"
                         size="icon"
                         className={cn(
                           "absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0",
                           "opacity-0 group-hover/menu-item:opacity-100 focus-visible:opacity-100", 
                           "group-data-[collapsible=icon]:hidden", 
                           "bg-transparent hover:bg-destructive/10"
                         )}
                         onClick={(e) => e.stopPropagation()} 
                         aria-label="Delete session"
                       >
                         <Trash2 className={cn(
                             "h-3.5 w-3.5 text-muted-foreground group-hover/menu-item:text-destructive" 
                           )} 
                         />
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Conversation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete the conversation titled "{session.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={(e) => e.stopPropagation()}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                
                <span className="text-xs text-muted-foreground px-2 pt-0.5 group-data-[collapsible=icon]:hidden">
                   {formatDistanceToNow(new Date(session.lastUpdated), { addSuffix: true })}
                </span>
              </SidebarMenuItem>
            ))}
             {sessions.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
                No chat history yet.
              </div>
            )}
          </SidebarMenu>
        </ScrollArea>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2 space-y-1">
         <Button 
            onClick={onExportAll} 
            variant="ghost" 
            className="w-full justify-start" 
            disabled={sessions.length === 0}
            tooltip="Export All Conversations"
          >
            <Download className="mr-2 h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">Export All</span>
          </Button>
        <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
          <SettingsDialog 
            onDeleteAllSessions={onDeleteAllSessions}
            isHistoryEmpty={isHistoryEmpty}
            selectedApiProvider={selectedApiProvider}
            setSelectedApiProvider={setSelectedApiProvider}
          />
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
