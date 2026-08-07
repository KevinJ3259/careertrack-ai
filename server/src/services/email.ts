import nodemailer from "nodemailer";
import { env } from "../env.js";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD
  }
});

type SendReminderEmailInput = {
  to: string;
  title: string;
  message?: string | null;
  dueAt: Date;
  company?: string | null;
  role?: string | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function verifyEmailConnection() {
  await transporter.verify();
}

export async function sendReminderEmail({
  to,
  title,
  message,
  dueAt,
  company,
  role
}: SendReminderEmailInput) {
  const applicationText =
    company && role
      ? `${company} — ${role}`
      : company || role || "No application selected";

  const safeTitle = escapeHtml(title);
  const safeMessage = message ? escapeHtml(message) : "";
  const safeApplication = escapeHtml(applicationText);
  const formattedDueAt = dueAt.toLocaleString();

  return transporter.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject: `CareerTrack AI Reminder: ${title}`,
    text: [
      "CareerTrack AI Reminder",
      "",
      title,
      `Due: ${formattedDueAt}`,
      `Application: ${applicationText}`,
      message ? `Message: ${message}` : ""
    ]
      .filter(Boolean)
      .join("\n"),
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #172033;">
        <div style="max-width: 640px; margin: 0 auto; padding: 24px;">
          <p style="margin: 0 0 8px; color: #2563eb; font-size: 12px; font-weight: 700; letter-spacing: 0.08em;">
            CAREERTRACK AI REMINDER
          </p>

          <h1 style="margin: 0 0 20px; font-size: 24px;">
            ${safeTitle}
          </h1>

          <div style="padding: 16px; border: 1px solid #dfe5ec; border-radius: 12px; background: #f8fafc;">
            <p style="margin: 0 0 8px;">
              <strong>Due:</strong> ${escapeHtml(formattedDueAt)}
            </p>

            <p style="margin: 0;">
              <strong>Application:</strong> ${safeApplication}
            </p>
          </div>

          ${
            safeMessage
              ? `
                <div style="margin-top: 16px; padding: 16px; border-left: 4px solid #2563eb; background: #f8fafc;">
                  ${safeMessage.replaceAll("\n", "<br />")}
                </div>
              `
              : ""
          }

          <p style="margin-top: 24px; color: #667085; font-size: 13px;">
            This email was sent by your CareerTrack AI reminder system.
          </p>
        </div>
      </div>
    `
  });
}