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