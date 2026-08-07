import { FormEvent, useEffect, useMemo, useState } from "react";
import { api, clearToken, getToken } from "./api";
import ApplicationList from "./components/ApplicationList";
import ApplicationTracker from "./components/ApplicationTracker";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import InterviewTracker from "./components/InterviewTracker";
import ResumeAnalyzer from "./components/ResumeAnalyzer";
import ResumeVersionManager from "./components/ResumeVersionManager";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import DashboardFilters from "./components/DashboardFilters";
import GoalTracker from "./components/GoalTracker";
import InterviewCoach from "./components/InterviewCoach";
import MockInterview from "./components/MockInterview";
import JobImporter from "./components/JobImporter";
import ThemeToggle from "./components/ThemeToggle";
import AppSidebar from "./components/AppSidebar";
import CareerAssistant from "./components/CareerAssistant";
import ReminderManager from "./components/ReminderManager";
import UpcomingReminders from "./components/UpcomingReminders";
import ApplicationKanban from "./components/ApplicationKanban";
import ResumeOptimizer from "./components/ResumeOptimizer";

import type {
  Interview,
  JobApplication,
  Reminder,
  ResumeVersion,
  Status
} from "./types";

const statuses: Status[] = [
  "SAVED",
  "APPLIED",
  "INTERVIEW",
  "OFFER",
  "REJECTED"
];

const emptyForm = {
  company: "",
  role: "",
  location: "",
  jobUrl: "",
  status: "SAVED" as Status,
  jobDescription: "",
  notes: ""
};

const emptyInterviewForm = {
  applicationId: "",
  scheduledAt: "",
  interviewType: "Phone Screen",
  interviewerName: "",
  location: "",
  meetingLink: "",
  preparationNotes: "",
  outcome: ""
};

const emptyResumeVersionForm = {
  id: "",
  title: "",
  resumeText: "",
  isDefault: false
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(Boolean(getToken()));

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [resumeVersions, setResumeVersions] = useState<ResumeVersion[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const [form, setForm] = useState(emptyForm);
  const [interviewForm, setInterviewForm] = useState(emptyInterviewForm);
  const [resumeVersionForm, setResumeVersionForm] = useState(
    emptyResumeVersionForm
  );

  const [filter, setFilter] = useState<Status | "ALL">("ALL");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeText, setResumeText] = useState("");

  const [resumeAnalysis, setResumeAnalysis] = useState<{
    matchScore: number;
    summary: string;
    strengths: string[];
    missingKeywords: string[];
    improvements: string[];
    revisedProfessionalSummary: string;
  } | null>(null);

  const [dashboardFilters, setDashboardFilters] = useState({
  status: "ALL" as Status | "ALL",
  company: "",
  location: ""
});

function scrollToSection(sectionId: string) {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

  async function loadApplications() {
    try {
      setApplications(await api.listApplications());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load applications."
      );
    }
  }

  async function loadInterviews() {
    try {
      setInterviews(await api.listInterviews());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load interviews."
      );
    }
  }

  async function loadResumeVersions() {
    try {
      setResumeVersions(await api.listResumeVersions());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load resume versions."
      );
    }
  }

  async function loadReminders() {
  try {
    setReminders(await api.listReminders());
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Unable to load reminders."
    );
  }
}

  useEffect(() => {
    if (authenticated) {
      setError("");
      void loadApplications();
      void loadInterviews();
      void loadResumeVersions();
      void loadReminders();
    }
  }, [authenticated]);

  const companies = useMemo(
  () =>
    Array.from(
      new Set(
        applications
          .map((application) => application.company)
          .filter(Boolean)
      )
    ).sort(),
  [applications]
);

const locations = useMemo(
  () =>
    Array.from(
      new Set(
        applications
          .map((application) => application.location)
          .filter((location): location is string => Boolean(location))
      )
    ).sort(),
  [applications]
);

const dashboardApplications = useMemo(() => {
  return applications.filter((application) => {
    const matchesStatus =
      dashboardFilters.status === "ALL" ||
      application.status === dashboardFilters.status;

    const matchesCompany =
      !dashboardFilters.company ||
      application.company === dashboardFilters.company;

    const matchesLocation =
      !dashboardFilters.location ||
      application.location === dashboardFilters.location;

    return matchesStatus && matchesCompany && matchesLocation;
  });
}, [applications, dashboardFilters]);

  const visibleApplications = useMemo(
    () =>
      filter === "ALL"
        ? applications
        : applications.filter((item) => item.status === filter),
    [applications, filter]
  );

  const dashboardTotals = useMemo(() => {
  const interviews = applications.filter((application) =>
    ["INTERVIEW", "OFFER"].includes(application.status)
  ).length;

  const offers = applications.filter(
    (application) => application.status === "OFFER"
  ).length;

  return {
    totalApplications: applications.length,
    interviews,
    offers
  };
}, [applications]);

  const counts = useMemo(() => {
    return statuses.reduce<Record<Status, number>>(
      (result, status) => {
        result[status] = applications.filter(
          (item) => item.status === status
        ).length;
        return result;
      },
      {
        SAVED: 0,
        APPLIED: 0,
        INTERVIEW: 0,
        OFFER: 0,
        REJECTED: 0
      }
    );
  }, [applications]);

  async function addApplication(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.createApplication(form);
      setForm(emptyForm);
      await loadApplications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to add application."
      );
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: string, status: Status) {
    try {
      setError("");
      await api.updateApplication(id, { status });
      await loadApplications();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update status."
      );
    }
  }

  async function removeApplication(id: string) {
    if (!window.confirm("Delete this application?")) return;

    try {
      setError("");
      await api.deleteApplication(id);
      await loadApplications();
      await loadInterviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete application."
      );
    }
  }

  async function generateLetter() {
    if (!form.company || !form.role || form.jobDescription.length < 40) {
      setError(
        "Enter a company, role, and a fuller job description first."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await api.generateCoverLetter({
        company: form.company,
        role: form.role,
        jobDescription: form.jobDescription,
        candidateBackground:
          "Bachelor's degree in Information Technology–Software Engineering, completed a full-stack web development bootcamp, and professional experience troubleshooting technical and customer issues."
      });

      setCoverLetter(result.draft);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to generate a letter."
      );
    } finally {
      setLoading(false);
    }
  }

  async function analyzeResume() {
    if (resumeText.trim().length < 100) {
      setError("Paste at least 100 characters of resume text.");
      return;
    }

    if (form.jobDescription.trim().length < 100) {
      setError("Paste at least 100 characters of the job description.");
      return;
    }

    setLoading(true);
    setError("");
    setResumeAnalysis(null);

    try {
      const result = await api.analyzeResume({
        resumeText,
        jobDescription: form.jobDescription
      });

      setResumeAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to analyze the resume."
      );
    } finally {
      setLoading(false);
    }
  }

  async function addInterview(event: FormEvent) {
    event.preventDefault();

    if (!interviewForm.applicationId) {
      setError("Choose a job application.");
      return;
    }

    if (!interviewForm.scheduledAt) {
      setError("Choose an interview date and time.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.createInterview({
        ...interviewForm,
        scheduledAt: new Date(interviewForm.scheduledAt).toISOString()
      });

      setInterviewForm(emptyInterviewForm);
      await loadInterviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save the interview."
      );
    } finally {
      setLoading(false);
    }
  }

  async function removeInterview(id: string) {
    if (!window.confirm("Delete this interview?")) return;

    try {
      setError("");
      await api.deleteInterview(id);
      await loadInterviews();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to delete the interview."
      );
    }
  }

  async function saveResumeVersion(event: FormEvent) {
    event.preventDefault();

    if (!resumeVersionForm.title.trim()) {
      setError("Enter a name for this resume version.");
      return;
    }

    if (resumeVersionForm.resumeText.trim().length < 50) {
      setError("Paste at least 50 characters of resume text.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (resumeVersionForm.id) {
        await api.updateResumeVersion(resumeVersionForm.id, {
          title: resumeVersionForm.title,
          resumeText: resumeVersionForm.resumeText,
          isDefault: resumeVersionForm.isDefault
        });
      } else {
        await api.createResumeVersion({
          title: resumeVersionForm.title,
          resumeText: resumeVersionForm.resumeText,
          isDefault: resumeVersionForm.isDefault
        });
      }

      setResumeVersionForm(emptyResumeVersionForm);
      await loadResumeVersions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save the resume version."
      );
    } finally {
      setLoading(false);
    }
  }

  function editResumeVersion(resume: ResumeVersion) {
    setResumeVersionForm({
      id: resume.id,
      title: resume.title,
      resumeText: resume.resumeText,
      isDefault: resume.isDefault
    });
  }

  async function duplicateResumeVersion(id: string) {
    try {
      setError("");
      await api.duplicateResumeVersion(id);
      await loadResumeVersions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to duplicate the resume."
      );
    }
  }

  async function makeDefaultResume(id: string) {
    try {
      setError("");
      await api.updateResumeVersion(id, { isDefault: true });
      await loadResumeVersions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update the default resume."
      );
    }
  }

  async function removeResumeVersion(id: string) {
    if (!window.confirm("Delete this resume version?")) return;

    try {
      setError("");
      await api.deleteResumeVersion(id);
      await loadResumeVersions();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete the resume version."
      );
    }
  }

  function analyzeSavedResume(resume: ResumeVersion) {
    setResumeText(resume.resumeText);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  if (!authenticated) {
    return <AuthScreen onAuthenticated={() => setAuthenticated(true)} />;
  }

  return (
    <div className="app-layout">
    <AppSidebar onNavigate={scrollToSection} />

    <main className="page-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">PORTFOLIO PROJECT</p>
          <h1>CareerTrack AI</h1>
          <p>
            Organize applications, monitor progress, and prepare for
            interviews.
          </p>
        </div>

      <div className="topbar-actions">
  <ThemeToggle />

  <button
    className="secondary"
    type="button"
    onClick={() => {
      clearToken();
      setAuthenticated(false);
    }}
  >
    Log out
  </button>
</div>  
      </header>

      {error && <div className="alert">{error}</div>}

      <Dashboard
        statuses={statuses}
        counts={counts}
        onFilterChange={setFilter}
      />

      <DashboardFilters
  filters={dashboardFilters}
  companies={companies}
  locations={locations}
  statuses={statuses}
  onChange={setDashboardFilters}
  onClear={() =>
    setDashboardFilters({
      status: "ALL",
      company: "",
      location: ""
    })
  }
/>

<AnalyticsDashboard applications={dashboardApplications} />

<GoalTracker
  totalApplications={dashboardTotals.totalApplications}
  interviews={dashboardTotals.interviews}
  offers={dashboardTotals.offers}
/>

<UpcomingReminders reminders={reminders} />

<JobImporter
  onImported={(job) => {
    setForm({
      company: job.company,
      role: job.role,
      location: job.location,
      jobUrl: job.jobUrl,
      status: "SAVED",
      jobDescription: job.jobDescription,
      notes: [
        job.salary ? `Salary: ${job.salary}` : "",
        job.notes
      ]
        .filter(Boolean)
        .join("\n\n")
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }}
/>

<div id="career-assistant">
  <CareerAssistant
    applications={applications}
    resumeVersions={resumeVersions}
  />
</div>

<div id="reminders">
  <ReminderManager
  applications={applications}
  onRemindersChanged={loadReminders}
/>
</div>

<div id="kanban">
  <ApplicationKanban
    applications={applications}
    statuses={statuses}
    onStatusChange={updateStatus}
  />
</div>

      <section className="content-grid">
        <ApplicationTracker
          form={form}
          statuses={statuses}
          loading={loading}
          coverLetter={coverLetter}
          onFormChange={setForm}
          onSubmit={addApplication}
          onGenerateLetter={generateLetter}
          onCoverLetterChange={setCoverLetter}
        />

        <ApplicationList
          applications={visibleApplications}
          filter={filter}
          statuses={statuses}
          onFilterChange={setFilter}
          onStatusChange={updateStatus}
          onDelete={removeApplication}
        />
      </section>

            <div id="resume-tools">
        <ResumeAnalyzer
          resumeText={resumeText}
          analysis={resumeAnalysis}
          loading={loading}
          onResumeTextChange={setResumeText}
          onAnalyze={analyzeResume}
        />

         <div id="resume-optimizer">
          <ResumeOptimizer />
        </div>

        <ResumeVersionManager
          resumes={resumeVersions}
          form={resumeVersionForm}
          loading={loading}
          onFormChange={setResumeVersionForm}
          onSubmit={saveResumeVersion}
          onEdit={editResumeVersion}
          onDuplicate={duplicateResumeVersion}
          onAnalyze={analyzeSavedResume}
          onMakeDefault={makeDefaultResume}
          onDelete={removeResumeVersion}
          onCancelEdit={() =>
            setResumeVersionForm(emptyResumeVersionForm)
          }
        />
      </div>

      <div id="interviews">
        <InterviewTracker
          applications={applications}
          interviews={interviews}
          form={interviewForm}
          loading={loading}
          onFormChange={setInterviewForm}
          onSubmit={addInterview}
          onDelete={removeInterview}
        />

        <InterviewCoach
          applications={applications}
          resumeVersions={resumeVersions}
        />
      </div>

      <div id="mock-interviews">
        <MockInterview applications={applications} />
      </div>
    </main>
  </div>
  );
}