import { useState } from "preact/hooks";

interface PRFilters {
  labels: string[];
  titleKeywords: string[];
}

interface FilterBuilderProps {
  value: PRFilters;
  onChange: (filters: PRFilters) => void;
}

export default function FilterBuilder({ value, onChange }: FilterBuilderProps) {
  const [labelInput, setLabelInput] = useState("");
  const [keywordInput, setKeywordInput] = useState("");

  const addFilterItem = (type: keyof PRFilters, inputValue: string) => {
    if (!inputValue.trim()) return;

    const newFilters = {
      ...value,
      [type]: [...value[type], inputValue.trim()],
    };
    onChange(newFilters);

    // Clear input
    if (type === "labels") setLabelInput("");
    if (type === "titleKeywords") setKeywordInput("");
  };

  const removeFilterItem = (type: keyof PRFilters, index: number) => {
    const newFilters = {
      ...value,
      [type]: value[type].filter((_, i) => i !== index),
    };
    onChange(newFilters);
  };

  const handleKeyPress = (
    e: React.KeyboardEvent,
    type: keyof PRFilters,
    inputValue: string
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addFilterItem(type, inputValue);
    }
  };

  const commonLabels = [
    "URGENT",
    "HOTFIX",
    "CRITICAL",
    "P0",
    "P1",
    "bug",
    "feature",
    "enhancement",
    "documentation",
    "security",
    "performance",
    "BREAKING",
  ];
  const commonKeywords = [
    "fix",
    "update",
    "add",
    "remove",
    "refactor",
    "improve",
  ];

  return (
    <div className="filter-builder">
      <div className="filter-section">
        <div className="form-group">
          <label>Labels</label>
          <p className="form-help">
            Filter PRs by GitHub labels (e.g., bug, URGENT, feature)
          </p>
          <div className="filter-input-group">
            <input
              type="text"
              className="form-input"
              placeholder="Add label (e.g., URGENT, bug, feature)"
              value={labelInput}
              onChange={(e) => setLabelInput(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, "labels", labelInput)}
            />
            <button
              type="button"
              className="add-filter-button"
              onClick={() => addFilterItem("labels", labelInput)}
              disabled={!labelInput.trim()}
            >
              Add
            </button>
          </div>

          <div className="common-filters">
            <small>Common labels:</small>
            <div className="common-filter-buttons">
              {commonLabels.map((label) => (
                <button
                  key={label}
                  type="button"
                  className="common-filter-button"
                  onClick={() => addFilterItem("labels", label)}
                  disabled={value.labels.includes(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-items">
            {value.labels.map((label, index) => (
              <span key={index} className="filter-item">
                {label}
                <button
                  type="button"
                  onClick={() => removeFilterItem("labels", index)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Title Keywords</label>
          <div className="filter-input-group">
            <input
              type="text"
              className="form-input"
              placeholder="Add keyword (e.g., fix, update)"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={(e) =>
                handleKeyPress(e, "titleKeywords", keywordInput)
              }
            />
            <button
              type="button"
              className="add-filter-button"
              onClick={() => addFilterItem("titleKeywords", keywordInput)}
              disabled={!keywordInput.trim()}
            >
              Add
            </button>
          </div>

          <div className="common-filters">
            <small>Common keywords:</small>
            <div className="common-filter-buttons">
              {commonKeywords.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  className="common-filter-button"
                  onClick={() => addFilterItem("titleKeywords", keyword)}
                  disabled={value.titleKeywords.includes(keyword)}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-items">
            {value.titleKeywords.map((keyword, index) => (
              <span key={index} className="filter-item">
                {keyword}
                <button
                  type="button"
                  onClick={() => removeFilterItem("titleKeywords", index)}
                  className="remove-tag"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {(value.labels.length > 0 || value.titleKeywords.length > 0) && (
        <div className="filter-preview">
          <h4>Filter Preview</h4>
          <p>
            Pull requests will be included if they match <strong>any</strong> of
            the specified criteria:
          </p>
          <ul>
            {value.labels.length > 0 && (
              <li>Labels: {value.labels.join(", ")}</li>
            )}
            {value.titleKeywords.length > 0 && (
              <li>Title contains: {value.titleKeywords.join(", ")}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
