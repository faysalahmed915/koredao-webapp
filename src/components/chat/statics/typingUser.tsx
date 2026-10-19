import React from 'react';

const TypingUser = ({ typingUser }: { typingUser: string }) => {
    return (
        <div className="flex items-center gap-2 px-3 pb-1.5 text-xs text-muted-foreground italic">
            <span className="flex items-center gap-0.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-bounce" />
            </span>
            <span>{typingUser} is typing…</span>
        </div>
    );
};

export default TypingUser;