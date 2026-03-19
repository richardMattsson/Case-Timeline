import { AxisBottom, AxisLeft } from "@visx/axis";
import type { NumberValue, ScaleTime } from "d3-scale";

interface TimelineAxisProps {
  orientation: "vertical" | "horizontal";
  axisLength: number;
  axisOffset: number;
  timeScale: ScaleTime<number, number>;
  numTicks?: number;
}

const TimelineAxis = ({
  orientation,
  axisLength,
  axisOffset,
  timeScale,
  numTicks = 5,
}: TimelineAxisProps) => {
  const [minDate, maxDate] = timeScale.domain();
  const ticks = timeScale.ticks(numTicks);
  const tickValues = [minDate, ...ticks, maxDate]
    .filter((value): value is Date => value instanceof Date)
    .map((value) => value.getTime())
    .filter((value, index, array) => array.indexOf(value) === index)
    .sort((a, b) => a - b)
    .map((value) => new Date(value));

  const formatTick = (d: Date | NumberValue) => {
    const date = d instanceof Date ? d : new Date(Number(d.valueOf()));
    if (isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
  };

  if (orientation === "horizontal") {
    return (
      <svg
        width={axisLength}
        height={axisOffset + 40}
        style={{ position: "absolute", pointerEvents: "none" }}
      >
        <line
          x1={0}
          x2={axisLength}
          y1={axisOffset}
          y2={axisOffset}
          stroke="#ccc"
          strokeWidth={2}
        />
        <g transform={`translate(0, ${axisOffset})`}>
          <AxisBottom
            scale={timeScale}
            numTicks={numTicks}
            tickValues={tickValues}
            stroke="#000000"
            tickStroke="#999"
            tickFormat={formatTick}
            tickLabelProps={() => ({
              fill: "black",
              fontSize: 12,
              textAnchor: "middle",
              dy: "0.75em",
            })}
          />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={axisOffset + 40}
      height={axisLength}
      style={{ position: "absolute", pointerEvents: "none" }}
    >
      <line
        x1={axisOffset}
        x2={axisOffset}
        y1={0}
        y2={axisLength}
        stroke="#ccc"
        strokeWidth={2}
      />
      <g transform={`translate(${axisOffset}, 0)`}>
        <AxisLeft
          scale={timeScale}
          numTicks={numTicks}
          tickValues={tickValues}
          stroke="#000000"
          tickStroke="#999"
          tickFormat={formatTick}
          tickLabelProps={() => ({
            fill: "black",
            fontSize: 12,
            textAnchor: "end",
            dx: "-0.5em",
            dy: "0.5em",
          })}
        />
      </g>
    </svg>
  );
};

export default TimelineAxis;
