export interface ChatMessageEntity {
  id: string;
  channelId: string;
  sender: {
    userId: string;
    displayName: string;
    role: string;
  };
  message: string;
  isAiResponse: boolean;
  timestamp: Date;
}

export class ChatValidator {
  static validateMessage(text: string): { isValid: boolean; cleanedText: string } {
    if (!text || text.trim().length === 0) {
      return { isValid: false, cleanedText: "" };
    }
    const slice = text.trim().slice(0, 500);
    return { isValid: true, cleanedText: slice };
  }
}
