import React from "react";
import Chart from "react-apexcharts";

const DashboardCharts = () => {
    return (
        <div className="p-6  gap-6">

            {/* 1. Simple Pie */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Simple Pie</h3>
                <Chart
                    options={{
                        chart: { type: "pie" },
                        labels: ["Savings", "Checking", "Credit"],
                        colors: ["#1F78FF", "#27AE60", "#F2C94C"],
                        legend: { position: "bottom" },
                    }}
                    series={[44, 55, 41]}
                    type="pie"
                    height={250}
                />
            </div>

            {/* 2. Simple Donut */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Simple Donut</h3>
                <Chart
                    options={{
                        chart: { type: "donut" },
                        labels: ["Savings", "Checking", "Credit"],
                        colors: ["#1F78FF", "#27AE60", "#F2C94C"],
                        plotOptions: { pie: { donut: { size: "60%" } } },
                        legend: { position: "bottom" },
                    }}
                    series={[40, 35, 25]}
                    type="donut"
                    height={250}
                />
            </div>

            {/* 3. Multi-Ring Donut (Radial Bar) */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Multi-Ring Donut</h3>
                <Chart
                    options={{
                        chart: { type: "radialBar" },
                        plotOptions: {
                            radialBar: {
                                offsetY: 0,
                                startAngle: 0,
                                endAngle: 360,
                                hollow: { size: "30%" },
                                track: { background: "#f0f0f0" },
                                dataLabels: { name: { show: true }, value: { show: true } },
                            },
                        },
                        colors: ["#1F78FF", "#27AE60", "#F2C94C", "#EB5757"],
                        labels: ["Savings", "Checking", "Credit", "Investments"],
                    }}
                    series={[70, 55, 40, 25]}
                    type="radialBar"
                    height={250}
                />
            </div>

            {/* 4. Donut with Total */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Donut with Total</h3>
                <Chart
                    options={{
                        chart: { type: "donut" },
                        labels: ["Savings", "Checking", "Credit"],
                        colors: ["#1F78FF", "#27AE60", "#F2C94C"],
                        plotOptions: {
                            pie: {
                                donut: {
                                    size: "70%",
                                    labels: {
                                        show: true,
                                        total: {
                                            show: true,
                                            label: "Total",
                                            formatter: (w) =>
                                                w.globals.seriesTotals.reduce((a, b) => a + b, 0),
                                        },
                                    },
                                },
                            },
                        },
                        legend: { position: "bottom" },
                    }}
                    series={[50, 30, 20]}
                    type="donut"
                    height={250}
                />
            </div>

            {/* 5. Donut Percentages */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Donut Percentages</h3>
                <Chart
                    options={{
                        chart: { type: "donut" },
                        labels: ["Savings", "Checking", "Credit"],
                        colors: ["#1F78FF", "#27AE60", "#F2C94C"],
                        plotOptions: { pie: { donut: { size: "60%" } } },
                        dataLabels: {
                            enabled: true,
                            formatter: (val) => `${val.toFixed(0)}%`,
                        },
                        legend: { show: false },
                    }}
                    series={[50, 25, 25]}
                    type="donut"
                    height={250}
                />
            </div>

            {/* 6. Simple Bar Chart */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Simple Bar</h3>
                <Chart
                    options={{
                        chart: { type: "bar" },
                        xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
                        colors: ["#1F78FF"],
                        plotOptions: { bar: { borderRadius: 4, horizontal: false } },
                        dataLabels: { enabled: false },
                    }}
                    series={[{ name: "Transactions", data: [30, 40, 35, 50, 49] }]}
                    type="bar"
                    height={250}
                />
            </div>

            {/* 7. Stacked Bar Chart */}
            <div className="p-4 bg-white rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Stacked Bar</h3>
                <Chart
                    options={{
                        chart: { type: "bar", stacked: true },
                        plotOptions: { bar: { borderRadius: 4 } },
                        xaxis: { categories: ["Jan", "Feb", "Mar", "Apr", "May"] },
                        colors: ["#27AE60", "#EB5757", "#F2C94C"],
                    }}
                    series={[
                        { name: "Success", data: [44, 55, 41, 67, 22] },
                        { name: "Failed", data: [13, 23, 20, 8, 13] },
                        { name: "Pending", data: [11, 17, 15, 15, 21] },
                    ]}
                    type="bar"
                    height={250}
                />
            </div>

        </div>
    );
};

export default DashboardCharts;
