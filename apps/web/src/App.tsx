import { ArrowLeft, ArrowRight, CheckCircle2, Circle, FileText, Filter, Hotel, Image, ListChecks, Loader2, MapPin, Search, Sparkles, Star, Upload, Utensils, X, XCircle } from "lucide-react";
import { appText } from "@hotel-research/design";
import { defaultResearchPrompt } from "@hotel-research/core";
import { useMemo, useState } from "react";
import type { ResearchJobListItem, ResearchMode } from "@hotel-research/core";

type View = "home" | "completed" | "in_progress" | "failed";

const contentOutputs = [
  { id: "brown-texts", title: "Brown Text", subtitle: "Write-ready brown text for key hotel sections", icon: FileText },
  { id: "experience-cards", title: "Experience Cards", subtitle: "Guest experiences and highlights in card format", icon: Star },
  { id: "property-descriptions", title: "Property Description", subtitle: "Detailed property descriptions for listing pages", icon: ListChecks }
];

const rawCategories = [
  ["room-types", "Rooms & Accommodation", "Room types, amenities, size, occupancy", Hotel],
  ["dining-restaurants", "Dining", "Restaurants, bars, cuisines, timings", Utensils],
  ["amenities", "Amenities & Facilities", "Hotel facilities, services, wellness, etc.", CheckCircle2],
  ["location-attractions", "Location", "Address, nearby attractions, transport", MapPin],
  ["policies", "Policies", "Check-in/out, cancellation, child policy", FileText],
  ["images-media", "Images & Media", "Image URLs, galleries, videos", Image],
  ["reviews-ratings", "Reviews & Ratings", "Guest reviews, ratings summary", Star],
  ["all-raw-categories", "All Categories", "Select all categories above", ListChecks]
] as const;

const jobs: ResearchJobListItem[] = [
  { processId: "3523", userId: "MMT11972", hotelOrBatchName: "Holiday Inn Resort", type: "single_hotel", status: "finished", hotelOrBatchId: "200701091654253400", timestamp: "May 14, 2025 | 10:24 AM" },
  { processId: "3522", userId: "MMT12726", hotelOrBatchName: "The Elgin Mount Pandim - Heritage Resort & Spa", type: "single_hotel", status: "finished", hotelOrBatchId: "201103041130544788", timestamp: "May 14, 2025 | 09:48 AM" },
  { processId: "3521", userId: "MMT12637", hotelOrBatchName: "The Kipling Lodge - Nature Kalp", type: "single_hotel", status: "finished", hotelOrBatchId: "201508171825374345", timestamp: "May 14, 2025 | 09:15 AM" },
  { processId: "3520", userId: "MMT12637", hotelOrBatchName: "Hotel Batch 2 - The Kipling Lodge - Nature Kalp", type: "batch", status: "finished", hotelOrBatchId: "BATCH_20250514_0002", timestamp: "May 14, 2025 | 08:52 AM" },
  { processId: "3519", userId: "MMT12637", hotelOrBatchName: "The Orchid Rishivan, Rishikesh", type: "single_hotel", status: "finished", hotelOrBatchId: "202507231604246207", timestamp: "May 14, 2025 | 08:31 AM" },
  { processId: "3518", userId: "MMT12637", hotelOrBatchName: "Lakeside Chalet Marriott Executive Apartments", type: "single_hotel", status: "finished", hotelOrBatchId: "201202131507131861", timestamp: "May 14, 2025 | 08:05 AM" },
  { processId: "3517", userId: "MMT11457", hotelOrBatchName: "Sofitel Mumbai BKC", type: "single_hotel", status: "finished", hotelOrBatchId: "201201101024268076", timestamp: "May 14, 2025 | 07:42 AM" },
  { processId: "3516", userId: "MMT11457", hotelOrBatchName: "Xandari Pearl Beach Resort", type: "single_hotel", status: "finished", hotelOrBatchId: "201503201659592979", timestamp: "May 14, 2025 | 07:18 AM" }
];

export function App() {
  const [view, setView] = useState<View>("home");
  const [showCategories, setShowCategories] = useState(false);
  return (
    <div className="app">
      <Header onManageCategories={() => setShowCategories(true)} />
      {view === "home" ? <Home onOpenStatus={setView} /> : <StatusPage view={view} onBack={() => setView("home")} />}
      {showCategories ? <CategoryDrawer onClose={() => setShowCategories(false)} /> : null}
    </div>
  );
}

function Header({ onManageCategories }: { onManageCategories: () => void }) {
  return (
    <header className="topbar">
      <div className="brand-mark">Mtrip</div>
      <div className="brand-copy">
        <strong>{appText.brand}</strong>
        <span>/</span>
        <a>{appText.section}</a>
      </div>
      <div className="topbar-actions">
        <button className="badge success"><CheckCircle2 size={18} />{appText.officialOnly}</button>
        <button className="secondary" onClick={onManageCategories}><ListChecks size={18} />{appText.manageCategories}</button>
        <button className="user-button">MMT12726</button>
      </div>
    </header>
  );
}

function CategoryDrawer({ onClose }: { onClose: () => void }) {
  return (
    <div className="drawer-backdrop" role="dialog" aria-modal="true">
      <aside className="category-drawer">
        <header>
          <div>
            <h2>Manage Categories</h2>
            <p>Upload SOPs, review generated rules, and assign categories to the right mode.</p>
          </div>
          <button onClick={onClose} aria-label="Close category manager"><X size={20} /></button>
        </header>

        <section className="upload-panel">
          <Upload size={24} />
          <strong>Upload SOP</strong>
          <small>PDF, DOCX, TXT, or Markdown</small>
          <input type="file" accept=".pdf,.docx,.txt,.md" />
        </section>

        <div className="category-form">
          <label>Category Name<input placeholder="e.g. Spa Experience Cards" /></label>
          <label>Category Mode<select defaultValue="mmt_content_mode"><option value="mmt_content_mode">MMT Content Mode</option><option value="raw_research_mode">Raw Research Mode</option></select></label>
          <label>Description<textarea placeholder="What should this category produce?" /></label>
          <label>Required Research Fields<textarea placeholder="One field per line" /></label>
          <label>Output Format<textarea placeholder="JSON fields, card format, table structure..." /></label>
          <label>Do Rules<textarea placeholder="One rule per line" /></label>
          <label>Don't Rules<textarea placeholder="One rule per line" /></label>
          <button className="run-button">Save Category</button>
        </div>
      </aside>
    </div>
  );
}

function Home({ onOpenStatus }: { onOpenStatus: (view: View) => void }) {
  const [mode, setMode] = useState<ResearchMode>("mmt_content_mode");
  const [prompt, setPrompt] = useState(defaultResearchPrompt);

  return (
    <main className="home page-shell">
      <section className="hero-copy">
        <h1>{appText.homeTitle}</h1>
        <p>{appText.homeSubtitle}</p>
      </section>

      <section className="workspace-card main-grid">
        <div className="hotel-input-panel">
          <label>Hotel Names <span>(Comma separated)</span></label>
          <div className="search-input">
            <Search size={20} />
            <input placeholder="e.g. The Leela Palace New Delhi, Taj Mahal Palace Mumbai..." />
          </div>
          <button className="add-button">+ Add</button>
        </div>

        <div className="mode-panel">
          <label>Choose Research Mode</label>
          <ModeCard active={mode === "mmt_content_mode"} title="MMT Content Mode" subtitle="Get AI-ready content and marketing assets" icon={<Sparkles />} onClick={() => setMode("mmt_content_mode")} />
          <div className="selector-panel">
            <span>Select Output Type</span>
            {contentOutputs.map((item) => <ChoiceRow key={item.id} {...item} />)}
          </div>
        </div>

        <div className="mode-panel">
          <label>&nbsp;</label>
          <ModeCard active={mode === "raw_research_mode"} title="Raw Research Mode" subtitle="Extract comprehensive hotel data" icon={<Search />} onClick={() => setMode("raw_research_mode")} />
          <div className="selector-panel scroll-list">
            <span>Select Data Categories</span>
            {rawCategories.map(([id, title, subtitle, Icon]) => (
              <label className="check-row" key={id}>
                <input type="checkbox" />
                <Icon size={18} />
                <span><strong>{title}</strong><small>{subtitle}</small></span>
              </label>
            ))}
          </div>
        </div>

        <aside className="run-panel">
          <button className="run-button"><ArrowRight size={18} />{appText.runResearch}</button>
          <div className="process-note"><Sparkles size={20} />Scrapes official website -> Structures data -> Delivers results</div>
          <div className="status-stack">
            <span>Research Status</span>
            <StatusCard icon={<Loader2 />} count={0} label="In Progress" hint="Research currently running" onClick={() => onOpenStatus("in_progress")} />
            <StatusCard icon={<CheckCircle2 />} count={0} label="Finished" hint="Completed research" tone="success" onClick={() => onOpenStatus("completed")} />
            <StatusCard icon={<XCircle />} count={0} label="Failed" hint="Research with errors" tone="danger" onClick={() => onOpenStatus("failed")} />
            <button className="history-button">View All History</button>
          </div>
        </aside>
      </section>

      <section className="bottom-grid">
        <div className="workspace-card prompt-card">
          <h2><Sparkles size={22} />{appText.promptTitle} <span>({appText.promptHint})</span></h2>
          <p>Pre-filled with recommended research guidelines for accurate and comprehensive results</p>
          <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} maxLength={1500} />
          <div className="char-count">{prompt.length}/1500 characters</div>
        </div>
        <div className="workspace-card guide-card">
          <h2>Quick Start Guide</h2>
          <GuideStep n={1} title="Add hotel names (comma separated)" text="Example: Hotel A, Hotel B, Hotel C" />
          <GuideStep n={2} title="Choose a research mode" text="Select MMT Content Mode or Raw Research Mode and pick your output type or data categories" />
          <GuideStep n={3} title='Click "Run Research"' text="We'll handle the rest and deliver structured results" />
        </div>
        <div className="workspace-card recent-card">
          <h2>Recent Searches</h2>
          {["The Leela Palace New Delhi", "Taj Mahal Palace Mumbai", "ITC Maurya New Delhi"].map((name, index) => (
            <div className="recent-row" key={name}>
              <Circle size={10} fill="#7547ff" />
              <span><strong>{name}</strong><small>{index === 1 ? "Raw Research Mode • All Categories" : "MMT Content Mode • Brown Text"}</small></span>
              <em>{index + 1} day{index ? "s" : ""} ago</em>
            </div>
          ))}
          <button className="history-button">View All History</button>
        </div>
      </section>
    </main>
  );
}

function ModeCard({ active, title, subtitle, icon, onClick }: { active: boolean; title: string; subtitle: string; icon: React.ReactNode; onClick: () => void }) {
  return <button className={`mode-card ${active ? "active" : ""}`} onClick={onClick}>{icon}<span><strong>{title}</strong><small>{subtitle}</small></span><Circle size={18} /></button>;
}

function ChoiceRow({ title, subtitle, icon: Icon }: { title: string; subtitle: string; icon: React.ElementType }) {
  return <button className="choice-row"><Icon size={22} /><span><strong>{title}</strong><small>{subtitle}</small></span><Circle size={18} /></button>;
}

function StatusCard({ icon, count, label, hint, tone = "blue", onClick }: { icon: React.ReactNode; count: number; label: string; hint: string; tone?: "blue" | "success" | "danger"; onClick: () => void }) {
  return <button className={`status-card ${tone}`} onClick={onClick}><span>{icon}</span><strong>{count}<small>{label}</small></strong><em>{hint}</em></button>;
}

function GuideStep({ n, title, text }: { n: number; title: string; text: string }) {
  return <div className="guide-step"><span>{n}</span><strong>{title}</strong><p>{text}</p></div>;
}

function StatusPage({ view, onBack }: { view: Exclude<View, "home">; onBack: () => void }) {
  const meta = useMemo(() => {
    if (view === "completed") return { title: "Completed", pill: "Finished", column: "Completed At" };
    if (view === "failed") return { title: "Failed", pill: "Failed", column: "Failed At" };
    return { title: "In Progress", pill: "In Progress", column: "Started At" };
  }, [view]);

  return (
    <main className="status-page">
      <section className="status-heading">
        <button className="back-button" onClick={onBack}><ArrowLeft size={18} />Back to Home</button>
        <div><h1>{meta.title}</h1><p>2558 processes found</p></div>
        <div className="status-search"><Search size={18} /><input placeholder="Search by Process ID, Hotel Name or Hotel ID" /><button><Filter size={18} /></button></div>
      </section>
      <section className="table-card">
        <table>
          <thead><tr>{["Process ID", "User ID", "Hotel / Batch Name", "Type", "Status", "Hotel ID / Batch ID", meta.column, "Action"].map((h) => <th key={h}>{h}</th>)}</tr></thead>
          <tbody>{jobs.map((job) => <tr key={job.processId}><td>{job.processId}</td><td>{job.userId}</td><td>{job.hotelOrBatchName}</td><td><span className={`type-pill ${job.type}`}>{job.type === "batch" ? "Batch" : "Single Hotel"}</span></td><td><span className={`state-pill ${view}`}><CheckCircle2 size={16} />{meta.pill}</span></td><td>{job.hotelOrBatchId}</td><td>{job.timestamp}</td><td><button className="details-button">View Details <ArrowRight size={18} /></button></td></tr>)}</tbody>
        </table>
        <div className="pagination"><span>Showing 1 to 8 of 2558 results</span><div><button disabled>‹</button><button className="active">1</button><button>2</button><button>3</button><span>...</span><button>320</button><button>›</button></div></div>
      </section>
    </main>
  );
}
