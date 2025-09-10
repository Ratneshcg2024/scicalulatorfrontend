import React from "react";

export default function DetailedResultTable({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="table-responsive mt-4">
      <table className="table table-bordered table-striped">
        <thead className="table-dark">
          <tr>
            <th>App Name</th>
            <th>Processor</th>
            <th>E (kWh)</th>
            <th>Operational Emission (gCO₂e)</th>
            <th>Embodied Emission (gCO₂e)</th>
            <th>Country</th>
            <th>Grid Emission</th>
            <th>SCI Score</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{item.appName}</td>
              <td>{item.processor || "N/A"}</td>
              <td>{item.totalOperationalEnergy}</td>
              <td>{item.totalOperationalEmissions}</td>
              <td>{item.totalEmbodiedEmissions}</td>
              <td>{item.countryUsed}</td>
              <td>{item.gridEmissionFactorUsed}</td>
              <td>{item.scIvalue}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
