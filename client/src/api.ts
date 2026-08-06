import type { 
  CareerAssistantResponse,
  Interview,
  InterviewCoachPlan,
  JobApplication,
  MockInterviewFeedback,
  ParsedJobImport,
  ResumeVersion,
  SavedMockInterviewResult,
  Status
} from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const TOKEN_KEY = "job_tracker_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.message ?? "Request failed.");
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  register: (name: string, email: string, password: string) =>
    request<{ token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    }),

  login: (email: string, password: string) =>
    request<{ token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    }),

  listApplications: (status?: Status) =>
    request<JobApplication[]>(`/applications${status ? `?status=${status}` : ""}`),

  createApplication: (body: Partial<JobApplication>) =>
    request<JobApplication>("/applications", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  updateApplication: (id: string, body: Partial<JobApplication>) =>
    request<JobApplication>(`/applications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }),

  deleteApplication: (id: string) =>
    request<void>(`/applications/${id}`, { method: "DELETE" }),

   listInterviews: () =>
    request<Interview[]>("/interviews"),

  createInterview: (body: {
    applicationId: string;
    scheduledAt: string;
    interviewType: string;
    interviewerName?: string;
    location?: string;
    meetingLink?: string;
    preparationNotes?: string;
    followUpNotes?: string;
    outcome?: string;
  }) =>
    request<Interview>("/interviews", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  updateInterview: (id: string, body: Partial<Interview>) =>
    request<Interview>(`/interviews/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }),

  deleteInterview: (id: string) =>
    request<void>(`/interviews/${id}`, {
      method: "DELETE"
    }),

     listResumeVersions: () =>
    request<ResumeVersion[]>("/resumes"),

  createResumeVersion: (body: {
    title: string;
    resumeText: string;
    isDefault?: boolean;
  }) =>
    request<ResumeVersion>("/resumes", {
      method: "POST",
      body: JSON.stringify(body)
    }),

  updateResumeVersion: (
    id: string,
    body: Partial<
      Pick<ResumeVersion, "title" | "resumeText" | "isDefault">
    >
  ) =>
    request<ResumeVersion>(`/resumes/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body)
    }),

  duplicateResumeVersion: (id: string) =>
    request<ResumeVersion>(`/resumes/${id}/duplicate`, {
      method: "POST"
    }),

  deleteResumeVersion: (id: string) =>
    request<void>(`/resumes/${id}`, {
      method: "DELETE"
    }),

  generateCoverLetter: (body: {
    company: string;
    role: string;
    jobDescription: string;
    candidateBackground: string;
  }) =>
    request<{ draft: string }>("/ai/cover-letter", {
      method: "POST",
      body: JSON.stringify(body)
    }),

    analyzeResume: (body: {
  resumeText: string;
  jobDescription: string;
}) =>
  request<{
    matchScore: number;
    summary: string;
    strengths: string[];
    missingKeywords: string[];
    improvements: string[];
    revisedProfessionalSummary: string;
  }>("/ai/resume-analysis", {
    method: "POST",
    body: JSON.stringify(body)
  }),

generateInterviewCoach: (body: {
  company: string;
  role: string;
  jobDescription: string;
  resumeText?: string;
}) =>
  request<InterviewCoachPlan>("/ai/interview-coach", {
    method: "POST",
    body: JSON.stringify(body)
  }),

generateMockInterviewFeedback: (body: {
  company: string;
  role: string;
  question: string;
  answer: string;
  jobDescription: string;
}) =>
  request<MockInterviewFeedback>("/ai/mock-interview-feedback", {
    method: "POST",
    body: JSON.stringify(body)
  }),

  listMockInterviewResults: () =>
  request<SavedMockInterviewResult[]>("/mock-interviews"),

saveMockInterviewResult: (body: {
  company: string;
  role: string;
  question: string;
  answer: string;
  overallScore: number;
  relevanceScore: number;
  clarityScore: number;
  structureScore: number;
  strengths: string[];
  improvements: string[];
  improvedAnswer: string;
  followUpQuestion: string;
}) =>
  request<SavedMockInterviewResult>("/mock-interviews", {
    method: "POST",
    body: JSON.stringify(body)
  }),

deleteMockInterviewResult: (id: string) =>
  request<void>(`/mock-interviews/${id}`, {
    method: "DELETE"
  }),

parseJobPosting: (body: {
  jobUrl?: string;
  postingText: string;
}) =>
  request<ParsedJobImport>("/job-import/parse", {
    method: "POST",
    body: JSON.stringify(body)
  }),

sendCareerAssistantMessage: (body: {
  message: string;
  company?: string;
  role?: string;
  jobDescription?: string;
  resumeText?: string;
}) =>
  request<CareerAssistantResponse>("/ai/career-assistant", {
    method: "POST",
    body: JSON.stringify(body)
  })
};