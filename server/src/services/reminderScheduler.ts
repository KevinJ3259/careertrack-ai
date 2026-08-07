import cron from "node-cron";
import { prisma } from "../db.js";
import { sendReminderEmail } from "./email.js";

let schedulerStarted = false;

export function startReminderScheduler() {
  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;

  cron.schedule("* * * * *", async () => {
    const now = new Date();

    try {
      const dueReminders = await prisma.reminder.findMany({
        where: {
          isSent: false,
          dueAt: {
            lte: now
          },
          recipientEmail: {
            not: null
          }
        },
        include: {
          application: {
            select: {
              company: true,
              role: true
            }
          }
        },
        orderBy: {
          dueAt: "asc"
        }
      });

      for (const reminder of dueReminders) {
        if (!reminder.recipientEmail) {
          continue;
        }

        try {
          await sendReminderEmail({
            to: reminder.recipientEmail,
            title: reminder.title,
            message: reminder.message,
            dueAt: reminder.dueAt,
            company: reminder.application?.company,
            role: reminder.application?.role
          });

          await prisma.reminder.update({
            where: {
              id: reminder.id
            },
            data: {
              isSent: true,
              sentAt: new Date()
            }
          });

          console.log(
            `Reminder email sent: ${reminder.title} -> ${reminder.recipientEmail}`
          );
        } catch (error) {
          console.error(
            `Failed to send reminder ${reminder.id}:`,
            error
          );
        }
      }
    } catch (error) {
      console.error("Reminder scheduler error:", error);
    }
  });

  console.log("Reminder scheduler started.");
}