import { useState } from "preact/hooks";

import * as styles from "@/styles/schedules/filter-builder.css";

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
    e: KeyboardEvent,
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
    <div className={styles.filterBuilder}>
      <div className={styles.filterSection}>
        <div>
          <label className={styles.filterLabel}>Labels</label>
          <p className={styles.filterHelp}>
            Filter PRs by GitHub labels (e.g., bug, URGENT, feature)
          </p>
          <div className={styles.filterInputGroup}>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Add label (e.g., URGENT, bug, feature)"
              value={labelInput}
              onChange={(e) => setLabelInput(e.currentTarget.value)}
              onKeyPress={(e) => handleKeyPress(e, "labels", labelInput)}
            />
            <button
              type="button"
              className={styles.addFilterButton}
              onClick={() => addFilterItem("labels", labelInput)}
              disabled={!labelInput.trim()}
            >
              Add
            </button>
          </div>

          <div className={styles.commonFilters}>
            <small className={styles.commonFiltersLabel}>Common labels:</small>
            <div className={styles.commonFilterButtons}>
              {commonLabels.map((label) => (
                <button
                  key={label}
                  type="button"
                  className={styles.commonFilterButton}
                  onClick={() => addFilterItem("labels", label)}
                  disabled={value.labels.includes(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterItems}>
            {value.labels.map((label, index) => (
              <span key={index} className={styles.filterItem}>
                {label}
                <button
                  type="button"
                  onClick={() => removeFilterItem("labels", index)}
                  className={styles.removeTag}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className={styles.filterLabel}>Title Keywords</label>
          <div className={styles.filterInputGroup}>
            <input
              type="text"
              className={styles.filterInput}
              placeholder="Add keyword (e.g., fix, update)"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.currentTarget.value)}
              onKeyPress={(e) =>
                handleKeyPress(e, "titleKeywords", keywordInput)
              }
            />
            <button
              type="button"
              className={styles.addFilterButton}
              onClick={() => addFilterItem("titleKeywords", keywordInput)}
              disabled={!keywordInput.trim()}
            >
              Add
            </button>
          </div>

          <div className={styles.commonFilters}>
            <small className={styles.commonFiltersLabel}>
              Common keywords:
            </small>
            <div className={styles.commonFilterButtons}>
              {commonKeywords.map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  className={styles.commonFilterButton}
                  onClick={() => addFilterItem("titleKeywords", keyword)}
                  disabled={value.titleKeywords.includes(keyword)}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterItems}>
            {value.titleKeywords.map((keyword, index) => (
              <span key={index} className={styles.filterItem}>
                {keyword}
                <button
                  type="button"
                  onClick={() => removeFilterItem("titleKeywords", index)}
                  className={styles.removeTag}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>

      {(value.labels.length > 0 || value.titleKeywords.length > 0) && (
        <div className={styles.filterPreview}>
          <h4 className={styles.filterPreviewTitle}>Filter Preview</h4>
          <p className={styles.filterPreviewText}>
            Pull requests will be included if they match <strong>any</strong> of
            the specified criteria:
          </p>
          <ul>
            {value.labels.length > 0 && (
              <li>
                Labels:{" "}
                <code className={styles.filterPreviewCode}>
                  {value.labels.join(", ")}
                </code>
              </li>
            )}
            {value.titleKeywords.length > 0 && (
              <li>
                Title contains:{" "}
                <code className={styles.filterPreviewCode}>
                  {value.titleKeywords.join(", ")}
                </code>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
