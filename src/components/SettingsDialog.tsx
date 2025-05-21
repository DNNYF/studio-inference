"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface SettingsDialogProps {
  apiEndpoint: string;
  setApiEndpoint: (endpoint: string) => void;
}

export function SettingsDialog({ apiEndpoint, setApiEndpoint }: SettingsDialogProps) {
  const [localEndpoint, setLocalEndpoint] = useState(apiEndpoint);
  const { toast } = useToast();

  useEffect(() => {
    setLocalEndpoint(apiEndpoint);
  }, [apiEndpoint]);

  const handleSave = () => {
    setApiEndpoint(localEndpoint);
    toast({
      title: "Settings Saved",
      description: "API endpoint updated successfully.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Settings">
          <Settings className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your LM Studio API endpoint.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-endpoint" className="text-right col-span-1">
              API URL
            </Label>
            <Input
              id="api-endpoint"
              value={localEndpoint}
              onChange={(e) => setLocalEndpoint(e.target.value)}
              className="col-span-3"
              placeholder="http://localhost:1234/v1/chat/completions"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
