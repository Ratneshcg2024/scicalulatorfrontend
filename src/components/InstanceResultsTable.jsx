import React from "react";

export default function InstanceResultsTable({ instanceResults }) {
    console.log("Rendering InstanceResultsTable with data:", instanceResults);

    if (!instanceResults || instanceResults.length === 0) {
        console.warn("No instance results to display.");
        return <p>No detailed results available.</p>;
    }

    const groupedResults = Object.values(
        instanceResults.reduce((acc, item) => {
            const key = `${item.instanceTypeId}-${item.regionId}-${item.duration}`;
            if (!acc[key]) {
                acc[key] = { ...item, count: 1 };
            } else {
                acc[key].count += 1;
            }
            return acc;
        }, {})
    );

    let totalCount = 0;
    let totalOperationalEnergy = 0;
    let totalOperationalEmissions = 0;
    let totalEmbodiedEmissions = 0;
    let totalOperationalEmissionSum = 0;
    let totalEmbodiedEmissionSum = 0;
    let totalSCISum = 0;

    return (
        <div className="table-responsive mt-4">
            <h5 className="mb-3">Instance-Level SCI Breakdown</h5>
            <table className="table table-bordered table-striped">
                <thead className="table-dark">
                    <tr>
                        <th>Instance Name</th>
                        <th>Tier</th>
                        <th>Count</th>
                        <th>Operational Energy (kWh)</th>
                        <th>Operational Emissions (gCO₂e)</th>
                        <th>Embodied Emissions (gCO₂e)</th>
                        <th>Total Operational Emission (gCO₂e)</th>
                        <th>Total Embodied Emission (gCO₂e)</th>
                        <th>SCI Score</th>
                    </tr>
                </thead>
                <tbody>
                    {groupedResults.map((item, idx) => {
                        const operationalEnergy = item.operationalEnergy || 0;
                        const operationalEmissions = item.operationalEmissions || 0;
                        const embodiedEmissions = item.embodiedEmissions || 0;
                        const totalOperational = operationalEmissions * item.count;
                        const totalEmbodied = embodiedEmissions * item.count;
                        const sciScore = totalOperational + totalEmbodied;

                        totalCount += item.count;
                        totalOperationalEnergy += operationalEnergy;
                        totalOperationalEmissions += operationalEmissions;
                        totalEmbodiedEmissions += embodiedEmissions;
                        totalOperationalEmissionSum += totalOperational;
                        totalEmbodiedEmissionSum += totalEmbodied;
                        totalSCISum += sciScore;

                        return (
                            <tr key={idx}>
                                <td>{item.instanceTypeName || "N/A"}</td>
                                <td>{item.tier || "N/A"}</td>
                                <td>{item.count}</td>
                                <td>{operationalEnergy.toFixed(6)}</td>
                                <td>{operationalEmissions.toFixed(6)}</td>
                                <td>{embodiedEmissions.toFixed(6)}</td>
                                <td>{totalOperational.toFixed(6)}</td>
                                <td>{totalEmbodied.toFixed(6)}</td>
                                <td>{sciScore.toFixed(6)}</td>
                            </tr>
                        );
                    })}
                    <tr className="table-secondary fw-bold">
                        <td>Total</td>
                        <td>-</td>
                        <td>{totalCount}</td>
                        <td>{totalOperationalEnergy.toFixed(6)}</td>
                        <td>{totalOperationalEmissions.toFixed(6)}</td>
                        <td>{totalEmbodiedEmissions.toFixed(6)}</td>
                        <td>{totalOperationalEmissionSum.toFixed(6)}</td>
                        <td>{totalEmbodiedEmissionSum.toFixed(6)}</td>
                        <td>{totalSCISum.toFixed(6)}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
}
