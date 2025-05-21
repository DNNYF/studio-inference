
"use client";

import React from 'react';
import type { ConversationSession } from '@/lib/types';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { FilePlus2, Download, MessageSquareText, Settings, Trash2 } from "lucide-react";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarMenuBadge, // Added if you plan to use badges, otherwise optional
  SidebarTrigger // Assuming SidebarTrigger is also from here if used for mobile toggle
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
} from "@/components/ui/alert-dialog"


interface AppSidebarProps {
  sessions: ConversationSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
  onExportAll: () => void;
  onDeleteSession: (sessionId: string) => void;
  onDeleteAllSessions: () => void;
}

export function AppSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  onExportAll,
  onDeleteSession,
  onDeleteAllSessions,
}: AppSidebarProps) {
  const sortedSessions = [...sessions].sort((a, b) => b.lastUpdated - a.lastUpdated);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-7 w-7 text-primary">
            <rect width="256" height="256" fill="none"/>
            <path d="M128,24a96,96,0,0,0-96,96c0,30.9,14.6,64.2,40.7,87.4C89.1,222.2,108.4,232,128,232a95.8,95.8,0,0,0,96-96A96,96,0,0,0,128,24Zm0,168a64.5,64.5,0,0,1-64-64A64,64,0,0,1,128,64a64.5,64.5,0,0,1,64,64A64,64,0,0,1,128,192Z" opacity="0.2"/>
            <path d="M128,24a96,96,0,0,0-96,96c0,30.9,14.6,64.2,40.7,87.4C89.1,222.2,108.4,232,128,232s38.9-9.8,55.3-24.6C209.4,184.2,224,150.9,224,120A96,96,0,0,0,128,24Zm0,192c-17.8,0-35.3-8.4-50.4-21.6C59.8,176.7,48,147.7,48,120a80,80,0,0,1,160,0c0,27.7-11.8,56.7-33.6,74.4C163.3,207.6,145.8,216,128,216Z" fill="currentColor"/>
            <path d="M128,64a64,64,0,1,0,64,64A64.1,64.1,0,0,0,128,64Zm0,112a48,48,0,1,1,48-48A48,48,0,0,1,128,176Z" fill="currentColor"/>
          </svg>
          <h1 className="text-xl font-semibold group-data-[collapsible=icon]:hidden">Chat Studio</h1>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="p-0">
        <div className="p-2">
          <Button onClick={onNewChat} className="w-full justify-start" variant="ghost">
            <FilePlus2 className="mr-2 h-4 w-4" />
            <span className="group-data-[collapsible=icon]:hidden">New Chat</span>
          </Button>
        </div>
        <SidebarSeparator />
        <div className="p-2 flex items-center justify-between group-data-[collapsible=icon]:justify-center">
          <h2 className="text-sm font-medium text-muted-foreground group-data-[collapsible=icon]:hidden">History</h2>
          {sessions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="group-data-[collapsible=icon]:my-1" tooltip="Clear All History">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete all your conversation history.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={onDeleteAllSessions} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <ScrollArea className="h-[calc(100%-200px)] group-data-[collapsible=icon]:h-[calc(100%-160px)]">
          <SidebarMenu className="p-2">
            {sortedSessions.map((session) => (
              <SidebarMenuItem key={session.id} className="relative group/menu-item">
                <SidebarMenuButton
                  isActive={session.id === currentSessionId}
                  onClick={() => onSelectSession(session.id)}
                  className="truncate"
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
                       className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0 opacity-0 group-hover/menu-item:opacity-100 group-data-[collapsible=icon]:hidden"
                       onClick={(e) => e.stopPropagation()} // Prevent session selection
                       aria-label="Delete session"
                     >
                       <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
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
                
                <span className="text-xs text-muted-foreground px-2 group-data-[collapsible=icon]:hidden">
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
          <SettingsDialog />
          <ThemeToggle />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
