// @vitest-environment jsdom
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import SelectedEvent from "../../src/components/NewTimeline/SelectedEvent";
import type { Event } from "../../src/features/events/eventsSlice";

const mockEvent: Event = {
  id: 1,
  title: "Launch v2.0",
  category: "release",
  date: "2024-06-15",
  description: "Major release with new features.",
};

afterEach(cleanup);

describe("SelectedEvent", () => {
  it("renders the event title", () => {
    render(<SelectedEvent event={mockEvent} handleClose={vi.fn()} />);
    expect(screen.getAllByText("Launch v2.0").length).toBeGreaterThan(0);
  });

  it("renders the event description", () => {
    render(<SelectedEvent event={mockEvent} handleClose={vi.fn()} />);
    expect(
      screen.getByText("Major release with new features."),
    ).toBeInTheDocument();
  });

  it("renders the formatted date", () => {
    render(<SelectedEvent event={mockEvent} handleClose={vi.fn()} />);
    const formatted = new Date("2024-06-15").toLocaleDateString();
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it("calls handleClose with null when close button is clicked", () => {
    const handleClose = vi.fn();
    render(<SelectedEvent event={mockEvent} handleClose={handleClose} />);
    fireEvent.click(screen.getByText("close ✕"));
    expect(handleClose).toHaveBeenCalledWith(null);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it("applies the correct border color for each category", () => {
    const categoryColors: Record<Event["category"], string> = {
      milestone: "rgb(76, 175, 80)",
      release: "rgb(37, 64, 217)",
      incident: "rgb(185, 41, 41)",
    };

    for (const [category, color] of Object.entries(categoryColors)) {
      const { container, unmount } = render(
        <SelectedEvent
          event={{ ...mockEvent, category: category as Event["category"] }}
          handleClose={vi.fn()}
        />,
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.style.border).toBe(`2px solid ${color}`);
      unmount();
    }
  });
});
