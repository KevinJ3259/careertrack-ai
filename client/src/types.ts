export type Status = "SAVED" | "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED";

export type JobApplication = {
  id: string;
  company: string;
  role: string;
  jobUrl: string | null;
  location: string | null;
  salary: string | null;
  status: Status;
  jobDescription: string | null;
  notes: string | null;
  appliedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Interview = {
  id: string;
  scheduledAt: string;
  interviewType: string;
  interviewerName: string | null;
  location: string | null;
  meetingLink: string | null;
  preparationNotes: string | null;
  followUpNotes: string | null;
  outcome: string | null;
  applicationId: string;
  createdAt: string;
  updatedAt: string;
  application: {
    id: string;
    company: string;
    role: string;
  };
};

export type ResumeVersion = {
  id: string;
  title: string;
  resumeText: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type InterviewCoachPlan = {
  jobSummary: string;
  keySkills: string[];
  behavioralQuestions: {
    question: string;
    whyItMatters: string;
    starGuidance: {
      situation: string;
      task: string;
      action: string;
      result: string;
    };
  }[];
  technicalQuestions: {
    question: string;
    answerGuidance: string;
  }[];
  studyTopics: string[];
  questionsToAsk: string[];
  preparationChecklist: string[];
};

export type MockInterviewFeedback = {
  overallScore: number;
  relevanceScore: number;
  clarityScore: number;
  structureScore: number;
  strengths: string[];
  improvements: string[];
  improvedAnswer: string;
  followUpQuestion: string;
};

export type SavedMockInterviewResult = MockInterviewFeedback & {
  id: string;
  company: string;
  role: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
};

export type ParsedJobImport = {
  company: string;
  role: string;
  location: string;
  salary: string;
  jobUrl: string;
  jobDescription: string;
  notes: string;
};

export type CareerAssistantResponse = {
  reply: string;
};

export type ReminderType =
  | "APPLICATION_FOLLOW_UP"
  | "INTERVIEW_REMINDER"
  | "THANK_YOU_EMAIL"
  | "STATUS_CHECK"
  | "CUSTOM";

export type Reminder = {
  id: string;
  reminderType: ReminderType;
  title: string;
  message: string | null;
  recipientEmail: string | null;
  dueAt: string;
  sentAt: string | null;
  isSent: boolean;
  applicationId: string | null;
  application: {
    id: string;
    company: string;
    role: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type ResumeOptimizerResult = {
  overallMatch: number;
  missingKeywords: string[];
  improvements: string[];
  optimizedSummary: string;
  optimizedExperience: string[];
  optimizedSkills: string[];
};