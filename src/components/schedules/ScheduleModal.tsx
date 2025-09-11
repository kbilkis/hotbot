import React, { useState } from "react";

interface ScheduleModalProps {
  onClose: () => void;
}

export default function ScheduleModal({
  onClose,
}: ScheduleModalProps): React.ReactElement {
  const [scheduleName, setScheduleName] = useState("");
  const [organization, setOrganization] = useState("");
  const [repository, setRepository] = useState("");
  const [filterPath, setFilterPath] = useState("");
  const [prAge, setPrAge] = useState("");
  const [labels, setLabels] = useState("");
  const [cronExpression, setCronExpression] = useState("");
  const [escalationDays, setEscalationDays] = useState("");
  const [escalationChannel, setEscalationChannel] = useState("");

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving schedule:", {
      scheduleName,
      organization,
      repository,
      filterPath,
      prAge,
      labels,
      cronExpression,
      escalationDays,
      escalationChannel,
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content schedule-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title-with-icon">
            <div className="schedule-icon">📅</div>
            <h2>Create New Schedule</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="schedule-name">Schedule Name</label>
            <input
              id="schedule-name"
              type="text"
              className="form-input"
              placeholder="e.g, Critical PRs"
              value={scheduleName}
              onChange={(e) => setScheduleName(e.target.value)}
            />
          </div>

          <div className="form-section">
            <h3>Scope</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="organization">Organization</label>
                <select
                  id="organization"
                  className="form-select"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                >
                  <option value="">Acme Inc.</option>
                  <option value="acme">Acme Inc.</option>
                  <option value="other">Other Organization</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="repository">Repository</label>
                <select
                  id="repository"
                  className="form-select"
                  value={repository}
                  onChange={(e) => setRepository(e.target.value)}
                >
                  <option value="">All Repositories</option>
                  <option value="all">All Repositories</option>
                  <option value="specific">Specific Repository</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="filter-path">Filter by path (optional)</label>
            <input
              id="filter-path"
              type="text"
              className="form-input"
              placeholder='e.g., path:"docs/**"'
              value={filterPath}
              onChange={(e) => setFilterPath(e.target.value)}
            />
          </div>

          <div className="form-section">
            <h3>PR Filters</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pr-age">Age</label>
                <input
                  id="pr-age"
                  type="text"
                  className="form-input"
                  placeholder="> 24h"
                  value={prAge}
                  onChange={(e) => setPrAge(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="labels">Labels</label>
                <input
                  id="labels"
                  type="text"
                  className="form-input"
                  placeholder="e.g, CRITICAL, P0"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Schedule</h3>
            <div className="form-group">
              <label htmlFor="cron-expression">Cron Expression</label>
              <input
                id="cron-expression"
                type="text"
                className="form-input"
                placeholder="0 10 * * 1,3,5"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
              />
              <small className="form-help">
                Weekly on Mon, Wed, Fri at 10 AM
              </small>
            </div>
          </div>

          <div className="form-section">
            <h3>Escalation</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="escalation-days">Escalation Days</label>
                <input
                  id="escalation-days"
                  type="number"
                  className="form-input"
                  placeholder="3"
                  value={escalationDays}
                  onChange={(e) => setEscalationDays(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="escalation-channel">Escalation Channel</label>
                <select
                  id="escalation-channel"
                  className="form-select"
                  value={escalationChannel}
                  onChange={(e) => setEscalationChannel(e.target.value)}
                >
                  <option value="">Select Channel</option>
                  <option value="general">#general</option>
                  <option value="urgent">#urgent</option>
                  <option value="management">#management</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="save-button"
            onClick={handleSave}
            disabled={!scheduleName}
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
}
