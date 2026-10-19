"use client";

import TypingUser from "../statics/typingUser";


interface TypingIndicatorProps {
  username?: string;
}

export function TypingIndicator({
  username,
}: TypingIndicatorProps) {
  if (!username) return null;

  return <TypingUser typingUser={username} />;
}
