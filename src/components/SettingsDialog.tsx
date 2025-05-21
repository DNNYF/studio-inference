
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
// import { Input } from "@/components/ui/input"; // No longer needed
// import { Label } from "@/components/ui/label"; // No longer needed
import { Settings } from "lucide-react";
// import { useToast } from '@/hooks/use-toast'; // No longer needed for API endpoint saving

export function SettingsDialog() {
  // const { toast } = useToast(); // Removed as no settings are saved here anymore

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
            General application settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p className="text-sm text-muted-foreground">
            Currently, there are no user-configurable settings here.
          </p>
          <p className="text-sm text-muted-foreground">
            The API endpoint for LM Studio is managed via environment variables (NEXT_PUBLIC_LM_STUDIO_API_ENDPOINT).
          </p>
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
