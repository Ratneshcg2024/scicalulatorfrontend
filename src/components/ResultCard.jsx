import React from "react";
import bannerImage from "../assets/result-banner.png";
import logo_co2 from "../assets/carbon_emission.png";
import '../styles/ResultCard.css';

export default function ResultCard({ sci, energy, operational, embodied }) {
  return (
    <div className="container my-5" style={{width:"70%"}}>
      <div className="card shadow">
        <div className="row g-0">
          {/* Left image */}
          <div className="col-md-4">
            <img
              src={bannerImage}
              alt="SCI illustration"
              className="img-fluid h-100"
              style={{ objectFit: "cover", borderRadius: "0.375rem 0 0 0.375rem" }}
            />
          </div>

          {/* Right content */}
          <div className="col-md-8">
            <div className="card-body " style={{ paddingTop: "3rem" }}>
              <span style={{ display: "block", textAlign: "center" }}>
                <img src={logo_co2} className="img-fluid" style={{ width: '5rem' }} alt="" />
              </span>
              <h3 className="card-title text-center fw-bold mt-4 mb-4" style={{ color: "#004c75" }}>Result</h3>
              <div style={{marginLeft:"3rem", marginTop:"2rem"}}>
                <table className="table table-borderless mb-0">
                  <tbody>
                    <ResultRow label="Energy Consumed (E)" value={energy} unit="kWh" />
                    <ResultRow label="Operational Emissions (O)" value={operational} unit="gCO2e" />
                    <ResultRow label="Embodied Emissions (M)" value={embodied} unit="gCO2e" />
                    <ResultRow label="SCI" value={sci} unit="per execution in 1 hour" />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value, unit }) {
  return (
    <tr >
      <td  style={{color:"#0070ad",fontWeight:"700"}}>{label}</td>
      <td>
         {value} 
         &nbsp;
          {unit}
      </td>
    </tr>
  );
}
