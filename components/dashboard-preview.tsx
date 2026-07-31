import {
  AlertTriangle,
  BarChart3,
  MessageSquareText,
  MoreHorizontal,
  Paperclip,
  Send,
  SmartphoneNfc,
  Star,
  Trash2,
} from "lucide-react";
import { SignalLedger } from "./signal-ledger";

const chartPoints = "4,62 34,53 66,58 99,38 131,44 164,27 197,34 230,13 263,22 296,7";

export function DashboardPreview() {
  return (
    <div className="dashboard-preview">
      <div className="preview-command">
        <span className="preview-command-brand">
          <span className="brand-signal brand-signal-small" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          Scantap
        </span>
        <span>New request</span>
        <span>Mark handled</span>
        <span className="preview-command-note">
          <Paperclip size={14} />
          Add note
        </span>
        <MoreHorizontal size={16} />
      </div>
      <div className="preview-title-row">
        <div>
          <h3>Overview</h3>
          <p>Demo workspace · Last 30 days</p>
        </div>
        <button type="button">All locations</button>
      </div>
      <div className="preview-metrics">
        <div>
          <span>Average rating</span>
          <strong>
            4.8 <Star size={16} fill="currentColor" />
          </strong>
          <small>from 568 reviews</small>
        </div>
        <div>
          <span>New reviews</span>
          <strong>34</strong>
          <small>in the last 30 days</small>
        </div>
        <div>
          <span>Response rate</span>
          <strong>86%</strong>
          <small>29 replies sent</small>
        </div>
        <div>
          <span>Google opens</span>
          <strong>121</strong>
          <small>from Scantap links</small>
        </div>
      </div>
      <div className="preview-main-grid">
        <div className="preview-chart preview-panel">
          <div className="panel-heading">
            <div>
              <h4>Review trend</h4>
              <span>Reviews and weekly volume</span>
            </div>
            <BarChart3 size={18} />
          </div>
          <svg
            aria-label="Sample review trend chart"
            role="img"
            viewBox="0 0 300 80"
          >
            <path className="chart-grid-line" d="M0 20H300 M0 45H300 M0 70H300" />
            <polyline className="chart-line" points={chartPoints} />
            {chartPoints.split(" ").map((point) => {
              const [cx, cy] = point.split(",");
              return <circle cx={cx} cy={cy} key={point} r="2.5" />;
            })}
          </svg>
          <div className="chart-axis">
            <span>Week 1</span>
            <span>Week 2</span>
            <span>Week 3</span>
            <span>Week 4</span>
          </div>
        </div>
        <div className="preview-queue preview-panel">
          <div className="panel-heading">
            <div>
              <h4>Response queue</h4>
              <span>4 reviews need attention</span>
            </div>
            <MessageSquareText size={18} />
          </div>
          {["Jamie D.", "Morgan H.", "Taylor P."].map((name, index) => (
            <div className="queue-row" key={name}>
              <span className="avatar">{name.charAt(0)}</span>
              <span>{name}</span>
              <small>{index + 2}d ago</small>
            </div>
          ))}
          <button className="text-link" type="button">
            View queue
          </button>
        </div>
        <div className="preview-device preview-panel">
          <div className="panel-heading">
            <div>
              <h4>Device health</h4>
              <span>12 registered devices</span>
            </div>
            <SmartphoneNfc size={18} />
          </div>
          <div className="device-good">
            <span />
            11 online
          </div>
          <div className="device-warning">
            <AlertTriangle size={16} />
            1 device offline
          </div>
        </div>
        <div className="preview-reply preview-panel">
          <div className="panel-heading">
            <div>
              <h4>Reply draft</h4>
              <span>Human approval required</span>
            </div>
          </div>
          <p>Thanks for taking the time to share this with us, Jamie.</p>
          <div className="composer-actions">
            <button aria-label="Attach file" type="button">
              <Paperclip size={16} />
            </button>
            <button aria-label="Discard reply" className="danger" type="button">
              <Trash2 size={16} />
            </button>
            <button aria-label="Send reply" className="send" type="button">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
      <div className="preview-ledger">
        <div className="panel-heading">
          <div>
            <h4>Signal ledger</h4>
            <span>Events stay separate so the numbers stay honest</span>
          </div>
        </div>
        <SignalLedger compact />
      </div>
    </div>
  );
}
