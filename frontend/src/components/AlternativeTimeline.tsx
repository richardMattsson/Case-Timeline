import { scaleTime } from "@visx/scale";
import { AxisBottom } from "@visx/axis";
import { Line } from "@visx/shape";
import { Zoom } from "@visx/zoom";
import type { TransformMatrix } from "@visx/zoom/lib/types";
import { timeFormat } from "d3-time-format";
import { timeDay, timeMillisecond, timeWeek } from "d3-time";

// ── Constants ────────────────────────────────────────────────────────────────

const BASE_START = new Date(1988, 8, 6);
const BASE_END = new Date(2088, 8, 6);
const days = timeDay.count(BASE_START, BASE_END);
const milliseconds = timeMillisecond.count(BASE_START, BASE_END);
const week = timeWeek.count(BASE_START, BASE_END);
console.log(days);
console.log("d3", milliseconds);
console.log("week", week);

const BASE_DURATION_MS = BASE_END.getTime() - BASE_START.getTime();

console.log("ai", BASE_DURATION_MS);

const MARGIN = { top: 30, right: 24, bottom: 60, left: 24 };

const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;
const MONTH_MS = 30.44 * DAY_MS;
const YEAR_MS = 365.25 * DAY_MS;

// "Now" indicator — current date
const NOW = new Date();

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Given the current zoom transform matrix and the inner-width of the axis
 * area, compute what slice of calendar time is currently visible on screen.
 *
 * Strategy: the base scale maps [BASE_START, BASE_END] onto
 * [MARGIN.left, MARGIN.left + innerWidth] in "content space".  The zoom
 * transform is conceptual only — we never apply it to a <g>; instead we
 * invert it to find which content-space x values are now visible at the
 * left and right edges of the viewport.
 *
 *   screenX = contentX * scaleX + translateX
 *   ⟹ contentX = (screenX − translateX) / scaleX
 */
function computeVisibleDomain(
  matrix: TransformMatrix,
  innerWidth: number,
): [Date, Date] {
  const { scaleX, translateX } = matrix;
  const left = MARGIN.left;

  const contentXStart = (left - translateX) / scaleX;
  const contentXEnd = (left + innerWidth - translateX) / scaleX;

  // Map content-space x back to a time fraction
  const startFrac = (contentXStart - left) / innerWidth;
  const endFrac = (contentXEnd - left) / innerWidth;

  return [
    new Date(BASE_START.getTime() + startFrac * BASE_DURATION_MS),
    new Date(BASE_START.getTime() + endFrac * BASE_DURATION_MS),
  ];
}

/** Choose a human-readable tick format based on the visible time span. */
function tickFormat(visibleMs: number): (d: Date) => string {
  if (visibleMs > 5 * YEAR_MS) return timeFormat("%Y");
  if (visibleMs > MONTH_MS) return timeFormat("%b %Y");
  if (visibleMs > 3 * DAY_MS) return timeFormat("%b %d");
  if (visibleMs > 6 * HOUR_MS) return timeFormat("%H:%M");
  return timeFormat("%M:%S");
}

// ── Component ────────────────────────────────────────────────────────────────

function AlternativeTimeline({
  width,
  height,
}: {
  width: number;
  height: number;
}) {
  const innerWidth = width - MARGIN.left - MARGIN.right;
  const innerHeight = height - MARGIN.top - MARGIN.bottom;
  const axisY = MARGIN.top + innerHeight / 2;

  return (
    <Zoom<SVGSVGElement>
      width={width}
      height={height}
      // Prevent zooming out past the full 1990-2050 view
      scaleXMin={1}
      // At ~22 000× the full range collapses to ≈ 1 day — leave headroom
      scaleXMax={100_000_000}
      // Lock vertical zoom
      scaleYMin={1}
      scaleYMax={1}
      // Horizontal-only zoom; visx calls scale() with these factors
      wheelDelta={(event) => ({
        scaleX: event.deltaY < 0 ? 1.15 : 1 / 1.15,
        scaleY: 1,
      })}
      // Keep the viewport inside [1990, 2050] and prevent vertical drift
      constrain={(transform) => {
        // Clamp scale — scaleXMin/Max are not applied when wheelDelta is overridden
        const clampedScaleX = Math.max(
          1,
          Math.min(100_000_000, transform.scaleX),
        );

        // When the scale gets clamped visx's translateX was computed for the
        // unclamped scale, so the visible date range jumps.  Fix: recompute
        // translateX so the viewport center stays anchored to the same date.
        let { translateX } = transform;
        if (clampedScaleX !== transform.scaleX && transform.scaleX !== 0) {
          const cx = width / 2;
          const contentAtCenter =
            (cx - transform.translateX) / transform.scaleX;
          translateX = cx - clampedScaleX * contentAtCenter;
        }

        const right = MARGIN.left + innerWidth;
        const minTx = right * (1 - clampedScaleX); // BASE_END at right edge
        const maxTx = MARGIN.left * (1 - clampedScaleX); // BASE_START at left edge
        return {
          ...transform,
          scaleX: clampedScaleX,
          translateX: Math.max(minTx, Math.min(maxTx, translateX)),
          scaleY: 1,
        };
      }}
    >
      {(zoom) => {
        const [visibleStart, visibleEnd] = computeVisibleDomain(
          zoom.transformMatrix,
          innerWidth,
        );

        const visibleMs = visibleEnd.getTime() - visibleStart.getTime();
        const fmt = tickFormat(visibleMs);

        // A fresh time scale for just the visible slice — labels are always
        // rendered at normal size with no distortion.
        const visibleScale = scaleTime({
          domain: [visibleStart, visibleEnd],
          range: [MARGIN.left, MARGIN.left + innerWidth],
        });

        // d3's .ticks() automatically picks nice intervals for the range
        const majorTicks = visibleScale.ticks(8);
        const minorTicks = visibleScale.ticks(48);

        const nowX = visibleScale(NOW);
        const nowVisible =
          nowX >= MARGIN.left && nowX <= MARGIN.left + innerWidth;

        const ty = zoom.transformMatrix.translateY;

        return (
          <div style={{ position: "relative", width, height }}>
            <svg
              width={width}
              height={height}
              style={{
                cursor: zoom.isDragging ? "grabbing" : "grab",
                touchAction: "none",
                userSelect: "none",
              }}
              ref={zoom.containerRef}
              onMouseDown={zoom.dragStart}
              onMouseMove={zoom.dragMove}
              onMouseUp={zoom.dragEnd}
              onMouseLeave={zoom.dragEnd}
            >
              {/* All content shifts vertically with the pan */}
              <g transform={`translate(0, ${ty})`}>
                {/* ── Minor tick marks (no labels) ───────────────────────── */}
                {minorTicks.map((tick, i) => {
                  const x = visibleScale(tick);
                  return (
                    <line
                      key={`minor-${i}`}
                      x1={x}
                      x2={x}
                      y1={axisY - 4}
                      y2={axisY + 4}
                      stroke="#3a3a3a"
                      strokeWidth={1}
                    />
                  );
                })}

                {/* ── Horizontal axis baseline ────────────────────────────── */}
                <Line
                  from={{ x: MARGIN.left, y: axisY }}
                  to={{ x: MARGIN.left + innerWidth, y: axisY }}
                  stroke="#666"
                  strokeWidth={2}
                />

                {/* ── Major ticks + labels ────────────────────────────────── */}
                <AxisBottom
                  top={axisY}
                  scale={visibleScale}
                  tickValues={majorTicks}
                  tickFormat={(d) => fmt(d as Date)}
                  tickLength={10}
                  hideAxisLine
                  tickStroke="#666"
                  tickLabelProps={() => ({
                    fill: "#bbb",
                    fontSize: 11,
                    textAnchor: "middle",
                    fontFamily: "monospace",
                    dy: "0.5em",
                  })}
                />

                {/* ── "Now" indicator ─────────────────────────────────────── */}
                {nowVisible && (
                  <>
                    <line
                      x1={nowX}
                      x2={nowX}
                      y1={axisY - 20}
                      y2={axisY + 20}
                      stroke="#f97316"
                      strokeWidth={2}
                      strokeDasharray="4 2"
                    />
                    <text
                      x={nowX}
                      y={axisY - 26}
                      textAnchor="middle"
                      fill="#f97316"
                      fontSize={10}
                      fontFamily="monospace"
                    >
                      NOW
                    </text>
                  </>
                )}
              </g>
            </svg>

            {/* ── Info bar ─────────────────────────────────────────────────── */}
            <div
              style={{
                position: "absolute",
                top: 7,
                left: MARGIN.left,
                color: "#555",
                fontSize: 10,
                fontFamily: "monospace",
                pointerEvents: "none",
              }}
            >
              {visibleStart.toLocaleDateString()} —{" "}
              {visibleEnd.toLocaleDateString()} &nbsp;·&nbsp;
              {zoom.transformMatrix.scaleX.toFixed(1)}×
            </div>

            {/* ── Reset button ─────────────────────────────────────────────── */}
            <button
              onClick={zoom.reset}
              style={{
                position: "absolute",
                top: 4,
                right: MARGIN.right,
                padding: "3px 10px",
                background: "#1a1a1a",
                color: "#999",
                border: "1px solid #444",
                borderRadius: 4,
                cursor: "pointer",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            >
              Reset
            </button>
          </div>
        );
      }}
    </Zoom>
  );
}

export default AlternativeTimeline;
