import { useMemo, useCallback } from 'react';
import { AreaClosed, LinePath, Bar } from '@visx/shape';
import { curveMonotoneX } from '@visx/curve';
import { scaleTime, scaleLinear } from '@visx/scale';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { LinearGradient } from '@visx/gradient';
import { Group } from '@visx/group';
import { GridRows } from '@visx/grid';
import { max, extent, bisector } from 'd3-array';
import { ParentSize } from '@visx/responsive';
import { localPoint } from '@visx/event';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';

export interface DataPoint {
    date: Date;
    value: number;
}

interface AreaChartProps {
    data: DataPoint[];
    width?: number;
    height?: number;
    margin?: { top: number; right: number; bottom: number; left: number };
}

// Accessors
const getDate = (d: DataPoint) => d.date;
const getValue = (d: DataPoint) => d.value;
const bisectDate = bisector<DataPoint, Date>((d) => d.date).left;

// Dub.co color scheme
const BLUE_PRIMARY = '#2563eb';  // Blue-600
const BLUE_GRADIENT_START = 'rgba(37, 99, 235, 0.3)';
const BLUE_GRADIENT_END = 'rgba(37, 99, 235, 0.0)';
const AXIS_COLOR = '#9ca3af';  // Gray-400
const GRID_COLOR = '#e5e7eb';  // Gray-200

const tooltipStyles = {
    ...defaultStyles,
    background: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '8px 12px',
    fontSize: '12px',
};

function AreaChartInner({ data, width = 600, height = 200, margin = { top: 20, right: 20, bottom: 40, left: 40 } }: AreaChartProps) {
    const {
        tooltipData,
        tooltipLeft,
        tooltipTop,
        tooltipOpen,
        showTooltip,
        hideTooltip,
    } = useTooltip<DataPoint>();

    // Bounds
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Scales
    const dateScale = useMemo(
        () =>
            scaleTime({
                range: [0, innerWidth],
                domain: extent(data, getDate) as [Date, Date],
            }),
        [innerWidth, data]
    );

    const valueScale = useMemo(
        () =>
            scaleLinear({
                range: [innerHeight, 0],
                domain: [0, (max(data, getValue) || 0) * 1.2 || 1],
                nice: true,
            }),
        [innerHeight, data]
    );

    // Tooltip handler
    const handleTooltip = useCallback(
        (event: React.TouchEvent<SVGRectElement> | React.MouseEvent<SVGRectElement>) => {
            const { x } = localPoint(event) || { x: 0 };
            const x0 = dateScale.invert(x - margin.left);
            const index = bisectDate(data, x0, 1);
            const d0 = data[index - 1];
            const d1 = data[index];
            let d = d0;
            if (d1 && getDate(d1)) {
                d = x0.valueOf() - getDate(d0).valueOf() > getDate(d1).valueOf() - x0.valueOf() ? d1 : d0;
            }
            showTooltip({
                tooltipData: d,
                tooltipLeft: dateScale(getDate(d)),
                tooltipTop: valueScale(getValue(d)),
            });
        },
        [showTooltip, dateScale, valueScale, data, margin.left]
    );

    if (width < 10 || height < 10 || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                No data available
            </div>
        );
    }

    return (
        <div style={{ position: 'relative' }}>
            <svg width={width} height={height}>
                <LinearGradient
                    id="area-gradient"
                    from={BLUE_GRADIENT_START}
                    to={BLUE_GRADIENT_END}
                    fromOpacity={1}
                    toOpacity={0}
                />
                <Group left={margin.left} top={margin.top}>
                    {/* Grid lines (dashed) */}
                    <GridRows
                        scale={valueScale}
                        width={innerWidth}
                        stroke={GRID_COLOR}
                        strokeDasharray="4"
                        strokeOpacity={0.8}
                        pointerEvents="none"
                        numTicks={4}
                    />

                    {/* Area */}
                    <AreaClosed<DataPoint>
                        data={data}
                        x={(d) => dateScale(getDate(d)) ?? 0}
                        y={(d) => valueScale(getValue(d)) ?? 0}
                        yScale={valueScale}
                        strokeWidth={0}
                        fill="url(#area-gradient)"
                        curve={curveMonotoneX}
                    />

                    {/* Line */}
                    <LinePath<DataPoint>
                        data={data}
                        x={(d) => dateScale(getDate(d)) ?? 0}
                        y={(d) => valueScale(getValue(d)) ?? 0}
                        stroke={BLUE_PRIMARY}
                        strokeWidth={2}
                        curve={curveMonotoneX}
                    />

                    {/* Invisible rect for mouse tracking */}
                    <Bar
                        x={0}
                        y={0}
                        width={innerWidth}
                        height={innerHeight}
                        fill="transparent"
                        onTouchStart={handleTooltip}
                        onTouchMove={handleTooltip}
                        onMouseMove={handleTooltip}
                        onMouseLeave={hideTooltip}
                    />

                    {/* Tooltip indicator dot */}
                    {tooltipOpen && tooltipData && (
                        <>
                            {/* Vertical line */}
                            <line
                                x1={tooltipLeft}
                                x2={tooltipLeft}
                                y1={0}
                                y2={innerHeight}
                                stroke={BLUE_PRIMARY}
                                strokeWidth={1}
                                strokeDasharray="4"
                                pointerEvents="none"
                            />
                            {/* Dot */}
                            <circle
                                cx={tooltipLeft}
                                cy={tooltipTop}
                                r={6}
                                fill={BLUE_PRIMARY}
                                stroke="white"
                                strokeWidth={2}
                                pointerEvents="none"
                            />
                        </>
                    )}

                    {/* X Axis */}
                    <AxisBottom
                        top={innerHeight}
                        scale={dateScale}
                        numTicks={width > 500 ? 6 : 4}
                        stroke="transparent"
                        tickStroke="transparent"
                        tickLabelProps={() => ({
                            fill: AXIS_COLOR,
                            fontSize: 11,
                            textAnchor: 'middle',
                            fontFamily: 'inherit',
                        })}
                        tickFormat={(value) => {
                            const d = value as Date;
                            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }}
                    />

                    {/* Y Axis */}
                    <AxisLeft
                        scale={valueScale}
                        numTicks={4}
                        stroke="transparent"
                        tickStroke="transparent"
                        tickLabelProps={() => ({
                            fill: AXIS_COLOR,
                            fontSize: 11,
                            textAnchor: 'end',
                            dx: -4,
                            fontFamily: 'inherit',
                        })}
                    />
                </Group>
            </svg>

            {/* Tooltip */}
            {tooltipOpen && tooltipData && (
                <TooltipWithBounds
                    key={Math.random()}
                    top={(tooltipTop ?? 0) + margin.top - 12}
                    left={(tooltipLeft ?? 0) + margin.left}
                    style={tooltipStyles}
                >
                    <div className="text-gray-500 text-xs mb-1">
                        {getDate(tooltipData).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-600" />
                        <span className="font-medium text-gray-900">Clicks</span>
                        <span className="font-semibold text-gray-900 ml-auto">{getValue(tooltipData)}</span>
                    </div>
                </TooltipWithBounds>
            )}
        </div>
    );
}

// Responsive wrapper
export function AreaChart({ data, height = 200, margin }: Omit<AreaChartProps, 'width'>) {
    return (
        <ParentSize>
            {({ width }) => (
                <AreaChartInner
                    data={data}
                    width={width}
                    height={height}
                    margin={margin}
                />
            )}
        </ParentSize>
    );
}

export default AreaChart;
