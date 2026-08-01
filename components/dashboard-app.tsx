"use client";

import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  CircleHelp,
  Download,
  FileBarChart,
  Filter,
  Home,
  Inbox,
  Lightbulb,
  Link2,
  MapPin,
  MessageSquareText,
  MoreHorizontal,
  Paperclip,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Send,
  Settings,
  SmartphoneNfc,
  Sparkles,
  Star,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BrandMark } from "./brand-mark";
import { SignalLedger } from "./signal-ledger";

type Review = {
  id: number;
  name: string;
  rating: number;
  date: string;
  age: string;
  location: string;
  source: "Google";
  text: string;
  status: "Replied" | "Not replied";
  themes: string[];
};

const initialReviews: Review[] = [
  {
    id: 1,
    name: "Alex Morgan",
    rating: 5,
    date: "Jul 30",
    age: "1 day ago",
    location: "Main Street",
    source: "Google",
    text: "The team was friendly, clear, and quick. Everything felt easy from start to finish.",
    status: "Not replied",
    themes: ["Service", "Staff"],
  },
  {
    id: 2,
    name: "Taylor Lee",
    rating: 4,
    date: "Jul 29",
    age: "2 days ago",
    location: "Main Street",
    source: "Google",
    text: "Good experience overall. I had to wait a few minutes, but the staff kept me updated.",
    status: "Not replied",
    themes: ["Service", "Wait time"],
  },
  {
    id: 3,
    name: "Jamie Patel",
    rating: 5,
    date: "Jul 28",
    age: "3 days ago",
    location: "Northside",
    source: "Google",
    text: "Fast, professional, and genuinely helpful. I will be back.",
    status: "Replied",
    themes: ["Service", "Quality"],
  },
  {
    id: 4,
    name: "Morgan Kim",
    rating: 3,
    date: "Jul 27",
    age: "4 days ago",
    location: "Downtown",
    source: "Google",
    text: "The result was good, but the handoff took longer than expected.",
    status: "Not replied",
    themes: ["Wait time"],
  },
  {
    id: 5,
    name: "Riley Walker",
    rating: 5,
    date: "Jul 25",
    age: "6 days ago",
    location: "Northside",
    source: "Google",
    text: "Exactly what I needed. Clear communication and great attention to detail.",
    status: "Replied",
    themes: ["Quality", "Communication"],
  },
];

const trendData = [
  { day: "Jul 1", reviews: 4, opens: 12 },
  { day: "Jul 5", reviews: 6, opens: 16 },
  { day: "Jul 9", reviews: 5, opens: 18 },
  { day: "Jul 13", reviews: 8, opens: 20 },
  { day: "Jul 17", reviews: 7, opens: 22 },
  { day: "Jul 21", reviews: 9, opens: 28 },
  { day: "Jul 25", reviews: 11, opens: 25 },
  { day: "Jul 29", reviews: 13, opens: 34 },
];

const ratingHistoryData = [
  { day: "Jul 11", one: 0, two: 0, three: 1, four: 2, five: 5 },
  { day: "Jul 12", one: 0, two: 1, three: 0, four: 3, five: 6 },
  { day: "Jul 13", one: 1, two: 0, three: 1, four: 2, five: 8 },
  { day: "Jul 14", one: 0, two: 0, three: 1, four: 4, five: 7 },
  { day: "Jul 15", one: 1, two: 1, three: 0, four: 2, five: 9 },
  { day: "Jul 16", one: 0, two: 0, three: 2, four: 3, five: 6 },
  { day: "Jul 17", one: 2, two: 0, three: 0, four: 1, five: 7 },
];

const devicesSeed = [
  { id: "NFC-7B2F", name: "Front desk stand", location: "Main Street", battery: 100, online: true },
  { id: "NFC-3A91", name: "Exit plate", location: "Main Street", battery: 98, online: true },
  { id: "NFC-9C21", name: "Northside counter", location: "Northside", battery: 97, online: true },
  { id: "NFC-1D44", name: "Patio door plate", location: "Downtown", battery: null, online: false },
];

const views = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "reviews", label: "Reviews", icon: MessageSquareText },
  { id: "insights", label: "Insights", icon: BarChart3 },
  { id: "requests", label: "Requests", icon: Send },
  { id: "devices", label: "Devices", icon: SmartphoneNfc },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "reports", label: "Reports", icon: FileBarChart },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

const viewTitles: Record<string, string> = {
  overview: "Overview",
  reviews: "Review inbox",
  insights: "Review insights",
  requests: "Review requests",
  devices: "Device health",
  locations: "Locations",
  reports: "Reports",
  settings: "Workspace settings",
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="app-stars" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          fill={index < rating ? "currentColor" : "none"}
          key={index}
          size={14}
        />
      ))}
    </span>
  );
}

export function DashboardApp() {
  const [activeView, setActiveView] = useState("overview");
  const [range, setRange] = useState("Last 30 days");
  const [location, setLocation] = useState("All locations");
  const [reviews, setReviews] = useState(initialReviews);
  const [selectedId, setSelectedId] = useState(1);
  const [ratingFilter, setRatingFilter] = useState("All ratings");
  const [statusFilter, setStatusFilter] = useState("All status");
  const [query, setQuery] = useState("");
  const [reply, setReply] = useState(
    "Hi Alex, thanks for taking the time to share this. We’re glad the experience felt easy from start to finish.",
  );
  const [attached, setAttached] = useState(false);
  const [toast, setToast] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestChannel, setRequestChannel] = useState("Text message");
  const [requestAudience, setRequestAudience] = useState("Recent customers");
  const [campaigns, setCampaigns] = useState([
    { name: "July follow-up", channel: "Text message", sent: 42, status: "Complete" },
    { name: "Service closeout", channel: "Email", sent: 18, status: "Draft" },
  ]);
  const [devices, setDevices] = useState(devicesSeed);
  const [checkingDevice, setCheckingDevice] = useState<string | null>(null);
  const [overflowOpen, setOverflowOpen] = useState(false);

  const selectedReview =
    reviews.find((review) => review.id === selectedId) || reviews[0];

  const filteredReviews = useMemo(
    () =>
      reviews.filter((review) => {
        const matchesRating =
          ratingFilter === "All ratings" ||
          review.rating === Number(ratingFilter.charAt(0));
        const matchesStatus =
          statusFilter === "All status" || review.status === statusFilter;
        const matchesLocation =
          location === "All locations" || review.location === location;
        const haystack = `${review.name} ${review.text} ${review.themes.join(" ")}`.toLowerCase();
        return (
          matchesRating &&
          matchesStatus &&
          matchesLocation &&
          haystack.includes(query.toLowerCase())
        );
      }),
    [location, query, ratingFilter, reviews, statusFilter],
  );

  const metrics = useMemo(() => {
    const factor = range === "Last 7 days" ? 0.34 : range === "Last 90 days" ? 2.6 : 1;
    const locationFactor = location === "All locations" ? 1 : location === "Main Street" ? 0.5 : 0.25;
    return {
      reviews: Math.round(34 * factor * locationFactor),
      total: Math.round(568 * locationFactor),
      opens: Math.round(121 * factor * locationFactor),
      response: location === "Downtown" ? 78 : 86,
    };
  }, [location, range]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  }

  function chooseReview(review: Review) {
    setSelectedId(review.id);
    setReply(
      `Hi ${review.name.split(" ")[0]}, thanks for taking the time to share this with us.`,
    );
  }

  function sendReply() {
    if (!reply.trim()) {
      showToast("Write a reply before sending.");
      return;
    }
    setReviews((current) =>
      current.map((review) =>
        review.id === selectedReview.id
          ? { ...review, status: "Replied" as const }
          : review,
      ),
    );
    setAttached(false);
    showToast(`Reply marked sent for ${selectedReview.name}.`);
  }

  function markHandled() {
    setReviews((current) =>
      current.map((review) =>
        review.id === selectedReview.id
          ? { ...review, status: "Replied" as const }
          : review,
      ),
    );
    showToast(`${selectedReview.name}'s review marked handled.`);
  }

  function exportReviews() {
    const rows = [
      ["Name", "Rating", "Date", "Location", "Status", "Review"],
      ...reviews.map((review) => [
        review.name,
        String(review.rating),
        review.date,
        review.location,
        review.status,
        review.text,
      ]),
    ];
    const csv = rows
      .map((row) =>
        row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "scantap-demo-reviews.csv";
    link.click();
    URL.revokeObjectURL(url);
    showToast("Demo review export downloaded.");
  }

  function createCampaign() {
    setCampaigns((current) => [
      {
        name: `New ${requestChannel.toLowerCase()} request`,
        channel: requestChannel,
        sent: 0,
        status: "Draft",
      },
      ...current,
    ]);
    setRequestOpen(false);
    showToast("Draft request campaign created.");
  }

  function checkDevice(id: string) {
    setCheckingDevice(id);
    window.setTimeout(() => {
      setDevices((current) =>
        current.map((device) =>
          device.id === id ? { ...device, online: true, battery: 92 } : device,
        ),
      );
      setCheckingDevice(null);
      showToast("Demo connection restored.");
    }, 900);
  }

  return (
    <section className="dashboard-app" aria-label="Interactive Scantap demo workspace">
      {toast && (
        <div className="app-toast" role="status">
          <Check size={17} /> {toast}
        </div>
      )}
      <aside className="app-sidebar">
        <div className="app-sidebar-brand">
          <BrandMark compact />
        </div>
        <nav aria-label="Dashboard navigation">
          {views.map((view) => (
            <button
              aria-label={view.label}
              aria-pressed={activeView === view.id}
              data-tooltip={view.label}
              key={view.id}
              onClick={() => setActiveView(view.id)}
              type="button"
            >
              <view.icon size={20} />
            </button>
          ))}
        </nav>
        <div className="app-sidebar-bottom">
          <button aria-label="Help" data-tooltip="Help" type="button">
            <CircleHelp size={20} />
          </button>
          <span>SD</span>
        </div>
      </aside>

      <div className="app-workspace">
        <header className="app-topbar">
          <div className="app-heading">
            <h1>{viewTitles[activeView]}</h1>
            <p>Demo workspace data · Changes stay on this device</p>
          </div>
          <div className="app-commandbar">
            <button
              onClick={() => {
                setActiveView("requests");
                setRequestOpen(true);
              }}
              type="button"
            >
              <Plus size={16} /> New request
            </button>
            <button onClick={markHandled} type="button">
              <Check size={16} /> Mark handled
            </button>
            <button onClick={() => setAttached(true)} type="button">
              <Paperclip size={16} /> Add note
            </button>
            <button onClick={exportReviews} type="button">
              <Download size={16} /> Export
            </button>
            <div className="app-overflow">
              <button
                aria-expanded={overflowOpen}
                aria-label="More actions"
                onClick={() => setOverflowOpen((current) => !current)}
                type="button"
              >
                <MoreHorizontal size={17} />
              </button>
              {overflowOpen && (
                <div className="overflow-menu">
                  <button onClick={() => showToast("Demo workspace refreshed.")} type="button">
                    <RefreshCw size={15} /> Refresh
                  </button>
                  <button onClick={() => setActiveView("settings")} type="button">
                    <Settings size={15} /> Workspace settings
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="app-filters">
            <label>
              <CalendarDays size={16} />
              <select value={range} onChange={(event) => setRange(event.target.value)}>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
              <ChevronDown size={14} />
            </label>
            <label>
              <MapPin size={16} />
              <select value={location} onChange={(event) => setLocation(event.target.value)}>
                <option>All locations</option>
                <option>Main Street</option>
                <option>Northside</option>
                <option>Downtown</option>
              </select>
              <ChevronDown size={14} />
            </label>
            <button aria-label="Notifications" className="app-icon-button" type="button">
              <Bell size={17} />
            </button>
          </div>
        </header>

        {activeView === "overview" && (
          <OverviewView
            chooseReview={chooseReview}
            devices={devices}
            metrics={metrics}
            range={range}
            reviews={reviews}
            selectedReview={selectedReview}
            setActiveView={setActiveView}
            setAttached={setAttached}
            setReply={setReply}
            attached={attached}
            reply={reply}
            sendReply={sendReply}
          />
        )}

        {activeView === "reviews" && (
          <ReviewsView
            attached={attached}
            chooseReview={chooseReview}
            filteredReviews={filteredReviews}
            query={query}
            ratingFilter={ratingFilter}
            reply={reply}
            selectedReview={selectedReview}
            sendReply={sendReply}
            setAttached={setAttached}
            setQuery={setQuery}
            setRatingFilter={setRatingFilter}
            setReply={setReply}
            setStatusFilter={setStatusFilter}
            statusFilter={statusFilter}
          />
        )}

        {activeView === "insights" && <InsightsView />}

        {activeView === "requests" && (
          <RequestsView
            campaigns={campaigns}
            createCampaign={createCampaign}
            requestAudience={requestAudience}
            requestChannel={requestChannel}
            requestOpen={requestOpen}
            setRequestAudience={setRequestAudience}
            setRequestChannel={setRequestChannel}
            setRequestOpen={setRequestOpen}
          />
        )}

        {activeView === "devices" && (
          <DevicesView
            checkDevice={checkDevice}
            checkingDevice={checkingDevice}
            devices={devices}
          />
        )}

        {activeView === "locations" && <LocationsView />}
        {activeView === "reports" && <ReportsView showToast={showToast} />}
        {activeView === "settings" && <SettingsView showToast={showToast} />}
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  detail,
  change,
}: {
  label: string;
  value: string;
  detail: string;
  change: string;
}) {
  return (
    <article className="app-metric">
      <span>{label}</span>
      <div>
        <strong>{value}</strong>
        <Sparkline />
      </div>
      <small>{detail}</small>
      <em>{change}</em>
    </article>
  );
}

function Sparkline() {
  return (
    <svg aria-hidden="true" viewBox="0 0 80 30">
      <polyline points="1,25 13,19 25,22 38,10 50,13 64,5 79,8" />
    </svg>
  );
}

function OverviewView({
  metrics,
  range,
  reviews,
  selectedReview,
  chooseReview,
  reply,
  setReply,
  attached,
  setAttached,
  sendReply,
  devices,
  setActiveView,
}: {
  metrics: { reviews: number; total: number; opens: number; response: number };
  range: string;
  reviews: Review[];
  selectedReview: Review;
  chooseReview: (review: Review) => void;
  reply: string;
  setReply: (value: string) => void;
  attached: boolean;
  setAttached: (value: boolean) => void;
  sendReply: () => void;
  devices: typeof devicesSeed;
  setActiveView: (value: string) => void;
}) {
  const unreplied = reviews.filter((review) => review.status === "Not replied");
  return (
    <div className="app-content">
      <div className="app-metrics-grid">
        <MetricCard label="Average rating" value="4.8 ★" detail={`568 total · ${range}`} change="+0.2" />
        <MetricCard label="New reviews" value={String(metrics.reviews)} detail="Reported by connected sources" change="+12%" />
        <MetricCard label="Response rate" value={`${metrics.response}%`} detail={`${unreplied.length} still need a reply`} change="+6%" />
        <MetricCard label="Google link opens" value={String(metrics.opens)} detail="Separate from completed reviews" change="+18%" />
      </div>

      <div className="app-overview-grid">
        <article className="app-panel app-trend">
          <PanelHeading title="Review trend" detail="Reviews and Google link opens" action="Daily" />
          <div className="trend-chart" aria-label="Demo review trend chart">
            <ResponsiveContainer height="100%" width="100%">
              <ComposedChart data={trendData} margin={{ top: 12, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#edf0f4" vertical={false} />
                <XAxis axisLine={false} dataKey="day" fontSize={11} tickLine={false} />
                <YAxis axisLine={false} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ border: "1px solid #dfe5ed", borderRadius: 10, fontSize: 12 }}
                />
                <Bar dataKey="opens" fill="#dbe7ff" radius={[4, 4, 0, 0]} />
                <Line dataKey="reviews" dot={{ r: 3 }} stroke="#155eef" strokeWidth={2.5} type="monotone" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-legend">
            <span><i className="legend-line" /> Reviews</span>
            <span><i className="legend-bar" /> Google link opens</span>
          </div>
        </article>

        <article className="app-panel app-rating-history">
          <PanelHeading title="Reviews by rating" detail="Daily rating mix for the last 7 days" action="Last 7 days" />
          <div className="rating-history-chart" aria-label="Stacked bar chart showing reviews by star rating for each of the last seven days">
            <ResponsiveContainer height="100%" width="100%">
              <ComposedChart data={ratingHistoryData} margin={{ top: 14, right: 8, left: -22, bottom: 0 }}>
                <CartesianGrid stroke="#edf0f4" vertical={false} />
                <XAxis axisLine={false} dataKey="day" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} axisLine={false} fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ border: "1px solid #dfe5ed", borderRadius: 10, fontSize: 12 }}
                  formatter={(value, name) => [`${value} review${value === 1 ? "" : "s"}`, `${name}-star`]}
                />
                <Bar dataKey="one" fill="#d94b54" name="1" stackId="ratings" />
                <Bar dataKey="two" fill="#e98b3a" name="2" stackId="ratings" />
                <Bar dataKey="three" fill="#d5aa28" name="3" stackId="ratings" />
                <Bar dataKey="four" fill="#78a6f8" name="4" stackId="ratings" />
                <Bar dataKey="five" fill="#155eef" name="5" radius={[4, 4, 0, 0]} stackId="ratings" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="rating-history-legend" aria-label="Rating chart legend">
            {[
              ["#155eef", "5 star"],
              ["#78a6f8", "4 star"],
              ["#d5aa28", "3 star"],
              ["#e98b3a", "2 star"],
              ["#d94b54", "1 star"],
            ].map(([color, label]) => <span key={label}><i style={{ background: color }} />{label}</span>)}
          </div>
        </article>

        <article className="app-panel app-distribution">
          <PanelHeading title="Rating distribution" detail={`${metrics.total} total reviews`} />
          {[
            [5, 73],
            [4, 17],
            [3, 6],
            [2, 3],
            [1, 1],
          ].map(([rating, percent]) => (
            <div className="rating-bar" key={rating}>
              <span>{rating} <Star size={12} fill="currentColor" /></span>
              <i><b style={{ width: `${percent}%` }} /></i>
              <em>{percent}%</em>
            </div>
          ))}
        </article>

        <article className="app-panel app-source">
          <PanelHeading title="Source summary" detail="Where review records come from" />
          <div className="source-row">
            <span className="google-g">G</span><span>Google reviews</span><strong>568</strong>
          </div>
          <div className="source-row">
            <Link2 size={17} /><span>Scantap link opens</span><strong>{metrics.opens}</strong>
          </div>
          <div className="source-row">
            <Radio size={17} /><span>NFC interactions</span><strong>186</strong>
          </div>
          <p className="app-fine-print">Activity events are not counted as reviews.</p>
        </article>

        <article className="app-panel app-response-card">
          <MessageSquareText size={20} />
          <span>Response queue</span>
          <strong>{unreplied.length}</strong>
          <p>reviews still need a human reply</p>
          <button onClick={() => setActiveView("reviews")} type="button">
            Open the queue
          </button>
        </article>

        <article className="app-panel app-ledger-panel">
          <PanelHeading title="Signal ledger" detail="How customer actions flow to owner work" />
          <SignalLedger />
        </article>

        <article className="app-panel app-themes">
          <PanelHeading title="Themes and sentiment" detail="A directional read of recent review text" />
          {[
            ["Service", 42, "Positive"],
            ["Staff", 28, "Positive"],
            ["Quality", 15, "Neutral"],
            ["Wait time", 9, "Needs attention"],
          ].map(([theme, percent, label]) => (
            <div className="theme-row" key={String(theme)}>
              <span>{theme}</span>
              <i><b style={{ width: `${percent}%` }} /></i>
              <em>{label}</em>
            </div>
          ))}
        </article>

        <article className="app-panel app-recent">
          <PanelHeading title="Recent reviews" detail="Select a review to work on it" action="All ratings" />
          {reviews.slice(0, 4).map((review) => (
            <button
              className={review.id === selectedReview.id ? "selected" : ""}
              key={review.id}
              onClick={() => chooseReview(review)}
              type="button"
            >
              <span className="review-avatar">{review.name.charAt(0)}</span>
              <span className="review-summary">
                <strong>{review.name}</strong>
                <span>{review.text}</span>
              </span>
              <span className="review-meta">
                <Stars rating={review.rating} />
                <small>{review.age}</small>
              </span>
            </button>
          ))}
        </article>

        <ReplyComposer
          attached={attached}
          reply={reply}
          review={selectedReview}
          sendReply={sendReply}
          setAttached={setAttached}
          setReply={setReply}
        />

        <article className="app-panel app-devices-mini">
          <PanelHeading title="Device health" detail={`${devices.length} registered devices`} action="View all" />
          {devices.map((device) => (
            <div className="mini-device-row" key={device.id}>
              <SmartphoneNfc size={17} />
              <span><strong>{device.name}</strong><small>{device.location}</small></span>
              <em className={device.online ? "online" : "offline"}>
                {device.online ? "Online" : <><AlertTriangle size={13} /> Offline</>}
              </em>
            </div>
          ))}
          {devices.some((device) => !device.online) && (
            <div className="proper-error">
              <AlertTriangle size={17} />
              <span><strong>1 device is offline</strong>Open Devices to run a connection check.</span>
            </div>
          )}
        </article>
      </div>
    </div>
  );
}

function PanelHeading({
  title,
  detail,
  action,
}: {
  title: string;
  detail: string;
  action?: string;
}) {
  return (
    <div className="app-panel-heading">
      <div>
        <h2>{title}</h2>
        <p>{detail}</p>
      </div>
      {action && <button type="button">{action} <ChevronDown size={13} /></button>}
    </div>
  );
}

function ReplyComposer({
  review,
  reply,
  setReply,
  attached,
  setAttached,
  sendReply,
}: {
  review: Review;
  reply: string;
  setReply: (value: string) => void;
  attached: boolean;
  setAttached: (value: boolean) => void;
  sendReply: () => void;
}) {
  return (
    <article className="app-panel app-composer">
      <PanelHeading title="Reply to review" detail={`${review.name} · ${review.location}`} />
      <Stars rating={review.rating} />
      <p className="selected-review-text">{review.text}</p>
      <textarea
        aria-label={`Reply to ${review.name}`}
        maxLength={500}
        onChange={(event) => setReply(event.target.value)}
        value={reply}
      />
      <div className="composer-meta">
        <label>
          <input type="checkbox" /> <Sparkles size={14} />
          Suggest wording <span>(optional)</span>
        </label>
        <small>{reply.length}/500</small>
      </div>
      {attached && (
        <div className="attached-note">
          <Paperclip size={14} /> Internal context attached
          <button aria-label="Remove attached context" onClick={() => setAttached(false)} type="button">
            <X size={14} />
          </button>
        </div>
      )}
      <div className="composer-button-row">
        <button aria-label="Attach context" onClick={() => setAttached(true)} type="button">
          <Paperclip size={17} />
        </button>
        <span />
        <button aria-label="Discard draft" className="discard" onClick={() => setReply("")} type="button">
          <Trash2 size={17} />
        </button>
        <button aria-label="Send reply" className="send-reply" onClick={sendReply} type="button">
          <Send size={17} />
        </button>
      </div>
    </article>
  );
}

function ReviewsView({
  filteredReviews,
  selectedReview,
  chooseReview,
  ratingFilter,
  setRatingFilter,
  statusFilter,
  setStatusFilter,
  query,
  setQuery,
  reply,
  setReply,
  attached,
  setAttached,
  sendReply,
}: {
  filteredReviews: Review[];
  selectedReview: Review;
  chooseReview: (review: Review) => void;
  ratingFilter: string;
  setRatingFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  query: string;
  setQuery: (value: string) => void;
  reply: string;
  setReply: (value: string) => void;
  attached: boolean;
  setAttached: (value: boolean) => void;
  sendReply: () => void;
}) {
  return (
    <div className="app-content">
      <div className="review-filterbar">
        <label className="app-search">
          <Search size={17} />
          <input
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search review text, names, or themes"
            type="search"
            value={query}
          />
        </label>
        <label>
          <Filter size={16} />
          <select value={ratingFilter} onChange={(event) => setRatingFilter(event.target.value)}>
            <option>All ratings</option>
            <option>5 stars</option>
            <option>4 stars</option>
            <option>3 stars</option>
            <option>2 stars</option>
            <option>1 star</option>
          </select>
        </label>
        <label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>All status</option>
            <option>Not replied</option>
            <option>Replied</option>
          </select>
        </label>
      </div>
      <div className="review-workspace">
        <article className="app-panel review-inbox">
          <div className="review-inbox-heading">
            <span>{filteredReviews.length} reviews</span>
            <small>Demo Google review records</small>
          </div>
          {filteredReviews.length === 0 ? (
            <div className="empty-state">
              <Inbox size={30} />
              <h2>No reviews match these filters.</h2>
              <p>Try another rating, reply status, or search term.</p>
            </div>
          ) : (
            filteredReviews.map((review) => (
              <button
                className={review.id === selectedReview.id ? "selected" : ""}
                key={review.id}
                onClick={() => chooseReview(review)}
                type="button"
              >
                <span className="review-avatar">{review.name.charAt(0)}</span>
                <span className="review-inbox-copy">
                  <span>
                    <strong>{review.name}</strong>
                    <Stars rating={review.rating} />
                  </span>
                  <p>{review.text}</p>
                  <small>{review.location} · {review.date} · {review.status}</small>
                </span>
                <MoreHorizontal size={17} />
              </button>
            ))
          )}
        </article>
        <ReplyComposer
          attached={attached}
          reply={reply}
          review={selectedReview}
          sendReply={sendReply}
          setAttached={setAttached}
          setReply={setReply}
        />
      </div>
    </div>
  );
}

function InsightsView() {
  return (
    <div className="app-content">
      <div className="insights-layout">
        <article className="app-panel insight-hero">
          <div>
            <h2>What customers mention most</h2>
            <p>
              Demo themes are grouped from recent review text. They help an
              owner decide what to read, not replace reading the reviews.
            </p>
          </div>
          <div className="theme-cloud">
            <span className="large">Service <b>42%</b></span>
            <span>Staff <b>28%</b></span>
            <span>Quality <b>15%</b></span>
            <span className="attention">Wait time <b>9%</b></span>
            <span>Communication <b>6%</b></span>
          </div>
        </article>
        <article className="app-panel insight-panel">
          <PanelHeading title="Rating movement" detail="Average rating by week" />
          <div className="rating-movement">
            {[4.6, 4.7, 4.65, 4.75, 4.8, 4.8].map((value, index) => (
              <div key={index}><i style={{ height: `${value * 16}%` }} /><span>W{index + 1}</span></div>
            ))}
          </div>
        </article>
        <article className="app-panel insight-panel">
          <PanelHeading title="Questions worth asking" detail="Suggested weekly review" />
          <ul className="question-list">
            <li><Lightbulb size={17} />Why did wait-time mentions rise at Downtown?</li>
            <li><Lightbulb size={17} />Which team habit is driving staff praise?</li>
            <li><Lightbulb size={17} />Does the Northside counter need a better placement?</li>
          </ul>
        </article>
      </div>
    </div>
  );
}

function RequestsView({
  campaigns,
  requestOpen,
  setRequestOpen,
  requestChannel,
  setRequestChannel,
  requestAudience,
  setRequestAudience,
  createCampaign,
}: {
  campaigns: { name: string; channel: string; sent: number; status: string }[];
  requestOpen: boolean;
  setRequestOpen: (value: boolean) => void;
  requestChannel: string;
  setRequestChannel: (value: string) => void;
  requestAudience: string;
  setRequestAudience: (value: string) => void;
  createCampaign: () => void;
}) {
  return (
    <div className="app-content">
      <div className="request-layout">
        <article className="app-panel campaigns-panel">
          <div className="app-panel-heading">
            <div>
              <h2>Request campaigns</h2>
              <p>Demo drafts only. No messages are sent from this workspace.</p>
            </div>
            <button onClick={() => setRequestOpen(true)} type="button">
              <Plus size={15} /> New request
            </button>
          </div>
          <div className="campaign-table">
            <div className="campaign-row campaign-head">
              <span>Name</span><span>Channel</span><span>Sent</span><span>Status</span>
            </div>
            {campaigns.map((campaign, index) => (
              <div className="campaign-row" key={`${campaign.name}-${index}`}>
                <strong>{campaign.name}</strong>
                <span>{campaign.channel}</span>
                <span>{campaign.sent}</span>
                <em>{campaign.status}</em>
              </div>
            ))}
          </div>
        </article>
        <article className="app-panel request-principles">
          <h2>Keep requests neutral.</h2>
          <p>
            Ask for an honest review, make the Google destination clear, and do
            not select recipients because you expect a high rating.
          </p>
          <ul className="check-list">
            <li><Check size={16} /> One direct review destination</li>
            <li><Check size={16} /> No rating-based routing</li>
            <li><Check size={16} /> Quiet hours and opt-out checks before launch</li>
          </ul>
        </article>
      </div>
      {requestOpen && (
        <div className="app-modal-backdrop" role="presentation">
          <section aria-labelledby="request-dialog-title" aria-modal="true" className="app-modal" role="dialog">
            <button aria-label="Close request form" className="modal-close" onClick={() => setRequestOpen(false)} type="button">
              <X size={18} />
            </button>
            <h2 id="request-dialog-title">Create a request draft</h2>
            <p>This demo saves a draft locally. It does not contact customers.</p>
            <label>
              Channel
              <select value={requestChannel} onChange={(event) => setRequestChannel(event.target.value)}>
                <option>Text message</option>
                <option>Email</option>
                <option>Printed follow-up</option>
              </select>
            </label>
            <label>
              Audience
              <select value={requestAudience} onChange={(event) => setRequestAudience(event.target.value)}>
                <option>Recent customers</option>
                <option>Completed appointments</option>
                <option>Manual list</option>
              </select>
            </label>
            <label>
              Neutral message
              <textarea defaultValue="Thanks for choosing us. If you have a minute, you can share your experience on Google here: [review link]" />
            </label>
            <button className="button button-primary" onClick={createCampaign} type="button">
              Save draft
            </button>
          </section>
        </div>
      )}
    </div>
  );
}

function DevicesView({
  devices,
  checkDevice,
  checkingDevice,
}: {
  devices: typeof devicesSeed;
  checkDevice: (id: string) => void;
  checkingDevice: string | null;
}) {
  return (
    <div className="app-content">
      <div className="device-summary-grid">
        <article><strong>{devices.length}</strong><span>Registered devices</span></article>
        <article><strong>{devices.filter((device) => device.online).length}</strong><span>Online</span></article>
        <article className="danger-metric"><strong>{devices.filter((device) => !device.online).length}</strong><span>Needs attention</span></article>
      </div>
      <article className="app-panel device-table-panel">
        <PanelHeading title="Device inventory" detail="Demo assignment and health data" />
        <div className="device-table">
          {devices.map((device) => (
            <div className="device-table-row" key={device.id}>
              <span className={`device-icon ${device.online ? "" : "error"}`}>
                {device.online ? <SmartphoneNfc size={19} /> : <AlertTriangle size={19} />}
              </span>
              <span><strong>{device.name}</strong><small>{device.id}</small></span>
              <span><strong>{device.location}</strong><small>Assigned location</small></span>
              <span><strong>{device.battery ? `${device.battery}%` : "Unknown"}</strong><small>Battery estimate</small></span>
              <em className={device.online ? "online" : "offline"}>
                {device.online ? "Online" : "Offline"}
              </em>
              {!device.online ? (
                <button disabled={checkingDevice === device.id} onClick={() => checkDevice(device.id)} type="button">
                  <RefreshCw className={checkingDevice === device.id ? "spin" : ""} size={15} />
                  {checkingDevice === device.id ? "Checking" : "Run check"}
                </button>
              ) : (
                <button type="button"><MoreHorizontal size={16} /> Manage</button>
              )}
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

function LocationsView() {
  return (
    <div className="app-content">
      <div className="location-app-grid">
        {[
          ["Main Street", "274", "4.9", "6", "2"],
          ["Northside", "182", "4.8", "3", "1"],
          ["Downtown", "112", "4.5", "3", "1"],
        ].map(([name, reviews, rating, devices, queue]) => (
          <article className="app-panel location-app-card" key={name}>
            <div className="location-card-top">
              <span><Building2 size={20} /></span>
              <button aria-label={`More actions for ${name}`} type="button"><MoreHorizontal size={17} /></button>
            </div>
            <h2>{name}</h2>
            <p>Demo location</p>
            <dl>
              <div><dt>Reviews</dt><dd>{reviews}</dd></div>
              <div><dt>Rating</dt><dd>{rating}</dd></div>
              <div><dt>Devices</dt><dd>{devices}</dd></div>
              <div><dt>Needs reply</dt><dd>{queue}</dd></div>
            </dl>
          </article>
        ))}
        <button className="add-location-card" type="button">
          <Plus size={24} />
          <strong>Add a location</strong>
          <span>Demo action only</span>
        </button>
      </div>
    </div>
  );
}

function ReportsView({ showToast }: { showToast: (message: string) => void }) {
  return (
    <div className="app-content">
      <div className="reports-grid">
        {[
          ["Weekly owner summary", "New reviews, response work, and device issues.", "Every Monday"],
          ["Location comparison", "Rating and activity by active location.", "Monthly"],
          ["Review themes", "Repeated strengths and issues in recent feedback.", "Monthly"],
        ].map(([title, description, schedule]) => (
          <article className="app-panel report-card" key={title}>
            <FileBarChart size={24} />
            <h2>{title}</h2>
            <p>{description}</p>
            <span>{schedule}</span>
            <button onClick={() => showToast(`${title} preview prepared.`)} type="button">
              Preview report <Download size={15} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ showToast }: { showToast: (message: string) => void }) {
  return (
    <div className="app-content">
      <div className="settings-layout">
        <nav className="settings-nav">
          <button className="active" type="button"><Building2 size={17} /> Workspace</button>
          <button type="button"><Users size={17} /> Team</button>
          <button type="button"><Link2 size={17} /> Review sources</button>
          <button type="button"><Radio size={17} /> Destinations</button>
        </nav>
        <article className="app-panel settings-panel">
          <h2>Demo workspace</h2>
          <p>
            These controls show the planned information architecture. They do
            not connect a live Google Business Profile or save production data.
          </p>
          <label>Workspace name<input defaultValue="Scantap Demo" /></label>
          <label>Primary timezone<select defaultValue="America/New_York"><option>America/New_York</option></select></label>
          <label className="setting-toggle">
            <span><strong>AI reply suggestions</strong><small>Optional drafts that always require human approval.</small></span>
            <input type="checkbox" />
          </label>
          <label className="setting-toggle">
            <span><strong>Device alerts</strong><small>Notify the workspace when a device appears offline.</small></span>
            <input defaultChecked type="checkbox" />
          </label>
          <button className="button button-primary" onClick={() => showToast("Demo settings saved locally.")} type="button">
            Save demo settings
          </button>
        </article>
      </div>
    </div>
  );
}
