import { AxisBottom, AxisLeft } from "@visx/axis";
import { timeFormat } from "d3-time-format";
import { useTooltip, useTooltipInPortal, defaultStyles } from "@visx/tooltip";
import { localPoint } from "@visx/event";
import React, { useRef, useState } from "react";
import { Group } from "@visx/group";
import { useAppSelector } from "../../hooks/storeHooks";
import type { Event } from "../../features/events/eventsSlice";
import { Circle, Line } from "@visx/shape";
import SelectedEvent from "./SelectedEvent";
import { Text } from "@visx/text";
import { Zoom } from "@visx/zoom";
import {
  DEFAULT_TRANSFORM,
  getTimelineScale,
  MARGIN_HORIZONTAL,
  MARGIN_VERTICAL,
} from "./timelineUtils";
import { IconButton, Stack } from "@mui/joy";
import { AutorenewOutlined } from "@mui/icons-material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";

interface TimelineProps {
  width: number;
  height: number;
  activeFilters: Set<"milestone" | "release" | "incident">;
  orientation: "horizontal" | "vertical";
}

const formatDate = timeFormat("%b %d, %Y");

const categoryColor: Record<Event["category"], string> = {
  milestone: "#4caf50",
  release: "#1976d2",
  incident: "#e53935",
};

export default function NewTimelineCopy({
  width,
  height,
  activeFilters,
  orientation,
}: TimelineProps) {
  const events = useAppSelector((state) => state.events.items);
  const activeEvents =
    activeFilters.size === 0
      ? events
      : events.filter((e) => activeFilters.has(e.category));
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const isVertical = orientation === "vertical";
  const zoomResetRef = useRef<(() => void) | null>(null);
  const zoomInRef = useRef<(() => void) | null>(null);
  const zoomOutRef = useRef<(() => void) | null>(null);

  // const dates = events
  //   .map((e) => new Date(e.date))
  //   .filter((d) => !isNaN(d.getTime()));

  // const [minDate, maxDate] = extent(dates);

  // function handleZoom(
  //   e: React.ChangeEvent<HTMLInputElement>,
  //   zoom: ZoomRenderProps,
  // ) {
  //   const sliderValue = Number(e.target.value);
  //   setValue(sliderValue);
  //   const scale = 0.5 + (sliderValue / 100) * 3.5;
  //   const {
  //     scaleX: currentScale,
  //     translateX: currentTx,
  //     translateY: currentTy,
  //   } = zoom.transformMatrix;
  //   const cx = width / 2;
  //   const cy = height / 2;
  //   zoom.setTransformMatrix({
  //     ...zoom.transformMatrix,
  //     scaleX: scale,
  //     scaleY: scale,
  //     translateX: cx + (currentTx - cx) * (scale / currentScale),
  //     translateY: cy + (currentTy - cy) * (scale / currentScale),
  //   });
  // }

  // function handleResetZoom(zoom: ZoomRenderProps) {
  //   zoom.reset();
  //   setValue(28);
  // }
  const margin = isVertical ? MARGIN_VERTICAL : MARGIN_HORIZONTAL;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const centerY = (height - margin.top - margin.bottom) / 2;

  const timeScale = getTimelineScale(
    events,
    innerWidth,
    innerHeight,
    isVertical,
  );

  const tickValues = timeScale.ticks(5);

  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
    tooltipOpen,
  } = useTooltip<Event>();

  const { containerRef, TooltipInPortal } = useTooltipInPortal({
    scroll: true,
    detectBounds: true,
  });

  return (
    <div
      id="timeline-container-2"
      style={{
        height: height,
        width: width,
        display: "flex",
      }}
    >
      <Zoom<SVGSVGElement> width={width} height={height}>
        {(zoom) => {
          zoomResetRef.current = () =>
            zoom.setTransformMatrix(DEFAULT_TRANSFORM);
          zoomInRef.current = () => {
            zoom.scale({ scaleX: 1.2, scaleY: 1.2 });
          };
          zoomOutRef.current = () => {
            zoom.scale({ scaleX: 0.8, scaleY: 0.8 });
          };
          return (
            <>
              <Stack direction={"column"} gap={5} sx={{ width: "fit-content" }}>
                <IconButton
                  variant="solid"
                  onClick={() => zoomResetRef.current?.()}
                >
                  <AutorenewOutlined />
                </IconButton>
                <IconButton
                  variant="solid"
                  onClick={() => zoomInRef.current?.()}
                >
                  <AddIcon />
                </IconButton>
                <IconButton
                  variant="solid"
                  onClick={() => zoomOutRef.current?.()}
                >
                  <RemoveIcon />
                </IconButton>
              </Stack>
              <svg
                width={width}
                height={height}
                style={{
                  cursor: zoom.isDragging ? "grabbing" : "grab",
                }}
                ref={(el) => {
                  (
                    zoom.containerRef as React.MutableRefObject<SVGSVGElement | null>
                  ).current = el;
                  containerRef(el);
                }}
              >
                <Group transform={zoom.toString()}>
                  {/* Layer 1: Text */}
                  {activeEvents.map((e, i) => {
                    const isRight = i % 2 === 0;
                    return (
                      <Group
                        key={`connector-${e.id}`}
                        left={
                          isVertical ? margin.left : timeScale(new Date(e.date))
                        }
                        top={
                          isVertical
                            ? timeScale(new Date(e.date)) || 0
                            : centerY
                        }
                      >
                        <Text
                          x={isVertical ? 80 : 0}
                          y={isVertical ? 0 : isRight ? -105 : -85}
                          dominantBaseline="middle"
                          textAnchor={isVertical ? "start" : "middle"}
                          fontSize={11}
                          fontFamily="monospace"
                          fill="#9ca3af"
                        >
                          {`${e.title}`}
                        </Text>
                        {isVertical ? (
                          <Line
                            from={{ x: 0, y: 0 }}
                            to={{ x: 75, y: 0 }}
                            stroke="#cccccc6a"
                            strokeWidth={1}
                          />
                        ) : (
                          <Line
                            from={{ x: 0, y: -8 }}
                            to={{ x: 0, y: isRight ? -100 : -80 }}
                            stroke="#ccc"
                            strokeWidth={1}
                          />
                        )}
                      </Group>
                    );
                  })}

                  {/* Layer 2: Axis */}
                  {isVertical ? (
                    <>
                      <AxisLeft
                        left={margin.left}
                        scale={timeScale}
                        tickFormat={(date) => formatDate(date as Date)}
                        tickValues={tickValues}
                        tickLength={10}
                        stroke="#ccc"
                        tickStroke="#ccc"
                        tickLabelProps={() => ({
                          fill: "#fff",
                          fontSize: 11,
                          fontWeight: 600,
                          textAnchor: "end",
                          fontFamily: "monospace",
                          dx: "-0.5em",
                          dy: "0.3em",
                        })}
                      />
                    </>
                  ) : (
                    <>
                      <AxisBottom
                        top={centerY}
                        scale={timeScale}
                        tickFormat={(date) => formatDate(date as Date)}
                        tickValues={tickValues}
                        tickLength={10}
                        stroke="#ccc"
                        tickStroke="#ccc"
                        tickLabelProps={() => ({
                          fill: "#666",
                          fontSize: 11,
                          fontWeight: 600,
                          textAnchor: "middle",
                          fontFamily: "monospace",
                          dx: "0",
                          dy: "0.5em",
                        })}
                      />
                    </>
                  )}

                  {/* Layer 3: circles */}
                  {activeEvents.map((e) => {
                    // const isRight = i % 2 === 0;
                    return (
                      <Group
                        key={`dot-${e.id}`}
                        left={
                          isVertical ? margin.left : timeScale(new Date(e.date))
                        }
                        top={
                          isVertical
                            ? timeScale(new Date(e.date)) || 0
                            : centerY
                        }
                      >
                        <Circle
                          cx={0}
                          cy={0}
                          r={selectedEvent?.id === e.id ? 10 : 7}
                          fill={categoryColor[e.category]}
                          stroke={selectedEvent?.id === e.id ? "black" : "none"}
                          strokeWidth={1}
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            setSelectedEvent((prev) =>
                              prev?.id === e.id ? null : e,
                            )
                          }
                          onMouseEnter={(event) => {
                            const point = localPoint(event);
                            showTooltip({
                              tooltipLeft: point?.x ?? 0,
                              tooltipTop: point?.y ?? 0,
                              tooltipData: e,
                            });
                          }}
                          onMouseLeave={hideTooltip}
                        />
                      </Group>
                    );
                  })}
                </Group>
              </svg>
              {selectedEvent && (
                <SelectedEvent
                  event={selectedEvent}
                  handleClose={() => setSelectedEvent(null)}
                />
              )}

              {tooltipOpen && tooltipData && (
                <TooltipInPortal
                  top={tooltipTop}
                  left={tooltipLeft}
                  style={{
                    ...defaultStyles,
                    border: `1px solid ${categoryColor[tooltipData.category]}`,
                    color: "#222",
                    borderRadius: 8,
                    fontSize: 13,
                    fontFamily: "monospace",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    borderLeft: `4px solid ${categoryColor[tooltipData.category]}`,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    {tooltipData.title}
                  </div>
                  <div style={{ opacity: 0.8, marginBottom: 4 }}>
                    {new Date(tooltipData.date).toLocaleDateString()}
                  </div>
                  {/* <div style={{ opacity: 0.9 }}>{tooltipData.description}</div> */}
                </TooltipInPortal>
              )}
            </>
          );
        }}
      </Zoom>
    </div>
  );
}
