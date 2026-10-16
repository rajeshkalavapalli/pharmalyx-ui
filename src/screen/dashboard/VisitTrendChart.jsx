import BarChart from "./BarChart";

const dayLabel = (key) =>
    new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

const weekdayLetter = (key) =>
    new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", { weekday: "narrow" });

// Visits per day: data is [{ date, visits }].
function VisitTrendChart({ data }) {
    const total = data.reduce((sum, day) => sum + day.visits, 0);

    return (
        <BarChart
            unit="visit"
            ariaLabel={`Visits per day over the last ${data.length} days, ${total} in total`}
            highlightKey={data[data.length - 1]?.date}
            items={data.map((day) => ({
                key: day.date,
                axisLabel: weekdayLetter(day.date),
                tooltipTitle: dayLabel(day.date),
                value: day.visits,
            }))}
        />
    );
}

export default VisitTrendChart;
