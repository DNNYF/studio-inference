
"use client";

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
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
import { Settings, Trash2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface SettingsDialogProps {
  onDeleteAllSessions: () => void;
  isHistoryEmpty: boolean;
}

export function SettingsDialog({ onDeleteAllSessions, isHistoryEmpty }: SettingsDialogProps) {

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings" tooltip="Application Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Manage application settings and data.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div>
            <h3 className="text-md font-medium mb-2">API Configuration</h3>
            <p className="text-sm text-muted-foreground">
              The API endpoint for LM Studio is managed via environment variables (NEXT_PUBLIC_LM_STUDIO_API_ENDPOINT).
            </p>
          </div>
          
          <Separator />

          <div>
            <h3 className="text-md font-medium mb-2">Data Management</h3>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="w-full justify-start"
                  disabled={isHistoryEmpty}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete All Chat History
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
                  <AlertDialogAction 
                    onClick={onDeleteAllSessions} 
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete All
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <p className="text-xs text-muted-foreground mt-2">
              This will remove all your saved conversations from local storage.
            </p>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
