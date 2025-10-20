import { useState } from "preact/hooks";

import { PRFilters } from "@/lib/schedules/validation";
import * as styles from "@/styles/schedules/filter-builder.css";
import { button } from "@/styles/theme/index.css";

interface FilterBuilderProps {
  value: PRFilters;
  onChange: (filters: PRFilters) => void;
}

export default function FilterBuilder({
  value,
  onChange,
}: Readonly<FilterBuilderProps>) {
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

  const removeFilterItem = (type: keyof PRFilters, valueToRemove: string) => {
    const newFilters = {
      ...value,
      [type]: value[type].filter((item) => item !== valueToRemove),
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
          <div className={styles.filterLabel}>Labels</div>
          <p className={styles.filterHelp}>
            Filter PRs by labels (e.g., bug, URGENT, feature)
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
              className={button({ color: "success", size: "sm" })}
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
                  className={button({
                    color: "ghost",
                    size: "xs",
                    alternative: true,
                    pill: true,
                  })}
                  onClick={() => addFilterItem("labels", label)}
                  disabled={value.labels.includes(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterItems}>
            {value.labels.map((label) => (
              <span key={label} className={styles.filterItem}>
                {label}
                <button
                  type="button"
                  onClick={() => removeFilterItem("labels", label)}
                  className={styles.removeTag}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className={styles.filterLabel}>Title Keywords</div>
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
              className={button({ color: "success", size: "sm" })}
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
                  className={button({
                    color: "ghost",
                    size: "xs",
                    alternative: true,
                    pill: true,
                  })}
                  onClick={() => addFilterItem("titleKeywords", keyword)}
                  disabled={value.titleKeywords.includes(keyword)}
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterItems}>
            {value.titleKeywords.map((keyword) => (
              <span key={keyword} className={styles.filterItem}>
                {keyword}
                <button
                  type="button"
                  onClick={() => removeFilterItem("titleKeywords", keyword)}
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
