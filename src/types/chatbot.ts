export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  quickActions?: QuickAction[];
}

export interface QuickAction {
  text: string;
  value: string;
  emoji?: string;
}

export interface KnowledgeBase {
  [category: string]: {
    name: string;
    emoji: string;
    questions: QuestionAnswer[];
  };
}

export interface QuestionAnswer {
  question: string;
  answer: string;
  keywords: string[];
  quickActions?: QuickAction[];
}

export interface ChatCategory {
  id: string;
  name: string;
  emoji: string;
  description: string;
}
