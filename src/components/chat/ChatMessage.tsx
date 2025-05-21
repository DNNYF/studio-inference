"use client";

import type { Message } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import { format } from 'date-fns';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const alignment = isUser ? "justify-end" : "justify-start";
  const bubbleStyles = isUser
    ? "bg-primary text-primary-foreground"
    : "bg-secondary text-secondary-foreground";

  return (
    <div className={cn("flex items-end gap-2 my-2", alignment)}>
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback><Bot size={18} /></AvatarFallback>
        </Avatar>
      )}
      <div className="flex flex-col max-w-[70%]">
        <div
          className={cn(
            "px-4 py-2 rounded-lg shadow-md break-words",
            bubbleStyles,
            isUser ? "rounded-br-none" : "rounded-bl-none"
          )}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        <span className={cn("text-xs text-muted-foreground mt-1 px-1", isUser ? "text-right" : "text-left")}>
          {format(new Date(message.timestamp), "p")}
        </span>
      </div>
      {isUser && (
         <Avatar className="h-8 w-8">
          <AvatarFallback><User size={18} /></AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
