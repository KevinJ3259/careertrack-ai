type AppSidebarProps = {
  onNavigate: (sectionId: string) => void;
};

const sections = [
  { id: "dashboard", label: "Dashboard" },
  { id: "job-importer", label: "Job Importer" },
  { id: "career-assistant", label: "Career Assistant" },
  { id: "applications", label: "Applications" },
  { id: "resume-tools", label: "Resume Tools" },
  { id: "interviews", label: "Interviews" },
  { id: "mock-interviews", label: "Mock Interviews" }
];

export default function AppSidebar({
  onNavigate
}: AppSidebarProps) {
  return (
    <aside className="app-sidebar">
      <div className="app-sidebar-brand">
        <span className="app-sidebar-logo">CT</span>

        <div>
          <strong>CareerTrack AI</strong>
          <small>Job search workspace</small>
        </div>
      </div>

      <nav className="app-sidebar-nav">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onNavigate(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
}