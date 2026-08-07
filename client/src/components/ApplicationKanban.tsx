import { useState } from "react";
import type { JobApplication, Status } from "../types";

type ApplicationKanbanProps = {
  applications: JobApplication[];
  statuses: Status[];
  onStatusChange: (id: string, status: Status) => void;
};

const statusLabels: Record<Status, string> = {
  SAVED: "Saved",
  APPLIED: "Applied",
  INTERVIEW: "Interview",
  OFFER: "Offer",
  REJECTED: "Rejected"
};

export default function ApplicationKanban({
  applications,
  statuses,
  onStatusChange
}: ApplicationKanbanProps) {
  const [draggedApplicationId, setDraggedApplicationId] =
    useState<string | null>(null);

  const [dragOverStatus, setDragOverStatus] =
    useState<Status | null>(null);

  function handleDragStart(
    event: React.DragEvent<HTMLElement>,
    applicationId: string
  ) {
    event.dataTransfer.setData("text/plain", applicationId);
    event.dataTransfer.effectAllowed = "move";
    setDraggedApplicationId(applicationId);
  }

  function handleDragEnd() {
    setDraggedApplicationId(null);
    setDragOverStatus(null);
  }

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>,
    status: Status
  ) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setDragOverStatus(status);
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
    status: Status
  ) {
    event.preventDefault();

    const applicationId =
      event.dataTransfer.getData("text/plain");

    setDragOverStatus(null);

    if (!applicationId) return;

    const application = applications.find(
      (item) => item.id === applicationId
    );

    if (!application) return;

    if (application.status === status) {
      setDraggedApplicationId(null);
      return;
    }

    onStatusChange(applicationId, status);
    setDraggedApplicationId(null);
  }

  return (
    <section className="panel application-kanban">
      <div className="section-heading">
        <div>
          <p className="eyebrow">KANBAN BOARD</p>
          <h2>Application pipeline</h2>
        </div>
      </div>

      <div className="kanban-board">
        {statuses.map((status) => {
          const items = applications.filter(
            (application) => application.status === status
          );

          return (
            <div
              className={`kanban-column ${
                dragOverStatus === status
                  ? "kanban-column-drag-over"
                  : ""
              }`}
              key={status}
              onDragOver={(event) =>
                handleDragOver(event, status)
              }
              onDragLeave={() => {
                if (dragOverStatus === status) {
                  setDragOverStatus(null);
                }
              }}
              onDrop={(event) =>
                handleDrop(event, status)
              }
            >
              <div className="kanban-column-header">
                <strong>{statusLabels[status]}</strong>
                <span>{items.length}</span>
              </div>

              <div className="kanban-cards">
                {items.length === 0 ? (
                  <div className="kanban-empty">
                    Drop applications here
                  </div>
                ) : (
                  items.map((application) => (
                    <article
                      key={application.id}
                      className={`kanban-card ${
                        draggedApplicationId === application.id
                          ? "kanban-card-dragging"
                          : ""
                      }`}
                      draggable
                      onDragStart={(event) =>
                        handleDragStart(
                          event,
                          application.id
                        )
                      }
                      onDragEnd={handleDragEnd}
                    >
                      <strong>{application.role}</strong>
                      <p>{application.company}</p>

                      {application.location && (
                        <span>{application.location}</span>
                      )}
                    </article>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}