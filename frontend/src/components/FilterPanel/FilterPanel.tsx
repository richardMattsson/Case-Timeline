import { useState } from "react";
import type { Event } from "../../features/events/eventsSlice";

import { AutorenewOutlined } from "@mui/icons-material";
import { IconButton } from "@mui/joy";

import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

type Category = Event["category"];

const CATEGORY_OPTIONS: { value: Category; label: string }[] = [
  { value: "milestone", label: "🟢 Milestone" },
  { value: "release", label: "🔵 Release" },
  { value: "incident", label: "🔴 Incident" },
];

type Props = {
  setOrientation: React.Dispatch<
    React.SetStateAction<"horizontal" | "vertical">
  >;
  setActiveFilters: React.Dispatch<React.SetStateAction<Set<Category>>>;
  onReset: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
};

function FilterPanel({
  setOrientation,
  setActiveFilters,
  onReset,
  onZoomIn,
  onZoomOut,
}: Props) {
  const [checked, setChecked] = useState<Set<Category>>(new Set());

  function handleCheckboxChange(category: Category, isChecked: boolean) {
    const next = new Set(checked);
    if (isChecked) {
      next.add(category);
    } else {
      next.delete(category);
    }
    setChecked(next);
    setActiveFilters(next);
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 15,
          padding: 10,
          marginTop: 10,
          marginBottom: 15,
          border: "1px solid grey",
          borderRadius: 10,
        }}
      >
        <button
          style={{ width: "80px" }}
          onClick={() => setOrientation("horizontal")}
        >
          Horizontal
        </button>
        <button
          style={{ width: "80px" }}
          onClick={() => setOrientation("vertical")}
        >
          Vertical
        </button>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 15,
          padding: 10,
          marginTop: 10,
          marginBottom: 15,
          border: "1px solid grey",
          borderRadius: 10,
        }}
      >
        <IconButton variant="solid" onClick={onReset}>
          <AutorenewOutlined />
        </IconButton>
        <IconButton variant="solid" onClick={onZoomIn}>
          <AddIcon />
        </IconButton>
        <IconButton variant="solid" onClick={onZoomOut}>
          <RemoveIcon />
        </IconButton>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 15,
          padding: 10,
          marginTop: 10,
          marginBottom: 15,
          border: "1px solid grey",
          borderRadius: 10,
        }}
      >
        <form>
          {CATEGORY_OPTIONS.map(({ value, label }) => (
            <div key={value}>
              <input
                type="checkbox"
                id={value}
                value={value}
                checked={checked.has(value)}
                onChange={(e) => handleCheckboxChange(value, e.target.checked)}
              />
              <label htmlFor={value}>{label}</label>
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}

export default FilterPanel;
