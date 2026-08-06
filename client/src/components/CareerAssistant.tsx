import { FormEvent, useMemo, useState } from "react";
import { api } from "../api";
import type { JobApplication, ResumeVersion } from "../types";

type CareerAssistantProps = {
  applications: JobApplication[];
  resumeVersions: ResumeVersion[];
};

type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function CareerAssistant({
  applications,
  resumeVersions
}: CareerAssistantProps) {
  const [applicationId, setApplicationId] = useState("");
  const [resumeVersionId, setResumeVersionId] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Ask me about job applications, interviews, resumes, follow-up messages, or career planning."
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedApplication = useMemo(
    () => applications.find((item) => item.id === applicationId) ?? null,
    [applications, applicationId]
  );

  const selectedResume = useMemo(
    () => resumeVersions.find((item) => item.id === resumeVersionId) ?? null,
    [resumeVersions, resumeVersionId]
  );

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (trimmedMessage.length < 5) {
      setError("Enter a question of at least 5 characters.");
      return;
    }

    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedMessage
      }
    ]);
    setMessage("");
    setLoading(true);
    setError("");

    try {
      const result = await api.sendCareerAssistantMessage({
        message: trimmedMessage,
        company: selectedApplication?.company,
        role: selectedApplication?.role,
        jobDescription: selectedApplication?.jobDescription || undefined,
        resumeText: selectedResume?.resumeText
      });

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.reply
        }
      ]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to get a response from the Career Assistant."
      );
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Ask me about job applications, interviews, resumes, follow-up messages, or career planning."
      }
    ]);
    setError("");
  }

  return (
    <section className="panel career-assistant">
      <div className="section-heading">
        <div>
          <p className="eyebrow">AI CAREER ASSISTANT</p>
          <h2>Get personalized career guidance</h2>
        </div>

        <button className="secondary" type="button" onClick={clearConversation}>
          Clear chat
        </button>
      </div>

      <div className="career-assistant-context">
        <label>
          Job application
          <select
            value={applicationId}
            onChange={(event) => setApplicationId(event.target.value)}
          >
            <option value="">No application selected</option>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>
                {application.company} — {application.role}
              </option>
            ))}
          </select>
        </label>

        <label>
          Resume version
          <select
            value={resumeVersionId}
            onChange={(event) => setResumeVersionId(event.target.value)}
          >
            <option value="">No resume selected</option>
            {resumeVersions.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}{resume.isDefault ? " — Default" : ""}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="career-assistant-chat">
        {messages.map((item) => (
          <article
            className={`career-message career-message-${item.role}`}
            key={item.id}
          >
            <span>{item.role === "assistant" ? "CareerTrack AI" : "You"}</span>
            <p>{item.content}</p>
          </article>
        ))}

        {loading && (
          <article className="career-message career-message-assistant">
            <span>CareerTrack AI</span>
            <p>Thinking...</p>
          </article>
        )}
      </div>

      {error && <div className="alert">{error}</div>}

      <form className="career-assistant-form" onSubmit={sendMessage}>
        <label>
          Ask a question
          <textarea
            rows={4}
            placeholder="How should I prepare for this interview?"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send message"}
        </button>
      </form>
    </section>
  );
}