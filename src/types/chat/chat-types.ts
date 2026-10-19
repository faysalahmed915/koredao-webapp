export interface ChatCheckpointTarget {
    id: string;
    title: string;
    targetDate?: string;
    status: string;
}

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    sender: {
        id: string;
        name: string;
        image?: string;
    };
    content: string;
    attachments: string[];
    checkpoint?: ChatCheckpointTarget | null;
    hasSafetyWarning: boolean;
    safetyWarningNote?: string;
    isRead: boolean;
    createdAt: string;
    /** Client-side only: temporary id for optimistic messages. */
    clientTempId?: string;
    /** Client-side only: send status for optimistic messages. */
    status?: "sending" | "failed";
}

export interface Conversation {
    id: string;
    orderId?: string;
    customerId: string;
    vendorProfileId: string;
    lastMessageAt: string;
    unreadCount?: number;
    customer?: {
        id: string;
        name: string;
        image?: string;
        email?: string;
        lastSeenAt?: string;
    };
    vendorProfile?: {
        id: string;
        userId: string;
        university: string;
        department: string;
        user?: {
            id: string;
            name: string;
            image?: string;
            lastSeenAt?: string;
        };
    };
    order?: {
        id: string;
        orderNumber: string;
        title: string;
        status: string;
    };
    messages?: ChatMessage[];
}

export interface OrderChatDrawerProps {
    /** Direct conversation id (preferred when opening from the inbox sidebar). */
    conversationId?: string;
    /** Full conversation object when already known (inbox sidebar) — avoids a
     *  getOrCreate round-trip that can 409 when ids are missing from the payload. */
    initialConversation?: Conversation | null;
    orderId?: string;
    vendorProfileId?: string;
    currentUserId: string;
    currentUserName: string;
    otherPartyName: string;
}