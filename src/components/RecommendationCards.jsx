
import React, { useState, useEffect } from "react";
import { FaLeaf, FaLightbulb, FaCog, FaMapMarkerAlt, FaClock,FaInfoCircle } from "react-icons/fa";
import { GiProcessor } from "react-icons/gi";
import { MdPowerSettingsNew } from "react-icons/md";
import "../styles/RecommendationCards.css";

export default function RecommendationCards({ data, flags }) {
  const [openRecommendation, setOpenRecommendation] = useState(null);
  const [openConfig, setOpenConfig] = useState(null);

  useEffect(() => {
    console.group("RecommendationCards Debug");
    console.log("Data:", data);
    console.log("Flags:", flags);
    console.groupEnd();
  }, [data, flags]);

  if (!data || !data.enrichedRecommendations || data.enrichedRecommendations.length === 0) {
    return <p className="text-danger"></p>;
  }

  const activeRecommendations =
    flags && Object.keys(flags).length > 0
      ? data.enrichedRecommendations.filter((rec) => {
          const normalizedLabel = rec.label.charAt(0).toLowerCase() + rec.label.slice(1);
          return flags[normalizedLabel] === "Yes";
        })
      : data.enrichedRecommendations;

  const getLabelIcon = (label) => {
    switch (label) {
      case "RightSizeInstances":
        return <GiProcessor size={24} color="#3B82F6" />;
      case "ChangeHostingRegion":
        return <FaMapMarkerAlt size={24} color="#10B981" />;
      case "ScheduleWorkloads":
        return <FaClock size={24} color="#F59E0B" />;
      case "SoftwareEfficiency":
        return <FaCog size={24} color="#8B5CF6" />;
      case "ShutdownPolicies":
        return <MdPowerSettingsNew size={24} color="#F43F5E" />;
      default:
        return <FaLeaf size={24} color="#22C55E" />;
    }
  };
  

const renderConfigTemplate = (template) => {
  if (!template) return <p>No configuration template</p>;

  const lines = template.split("\n").filter(line => line.trim() !== "");
  const header = lines[0]; // First line is usually the main sentence
  const rest = lines.slice(1);

  return (
    <div>
      <p><strong>{header}</strong></p>
      {rest.map((line, idx) => {
        if (line.includes("\t")) {
          const [col1, col2] = line.split("\t");
          return (
            <div key={idx} className="config-row">
              <span>{col1}</span>
              <span>{col2}</span>
            </div>
          );
        }
        return <p key={idx}>{line}</p>;
      })}
    </div>
  );
};


  const getBorderColor = (label) => {
    switch (label) {
      case "RightSizeInstances":
        return "#3B82F6";
      case "ChangeHostingRegion":
        return "#10B981";
      case "ScheduleWorkloads":
        return "#F59E0B";
      case "SoftwareEfficiency":
        return "#8B5CF6";
      case "ShutdownPolicies":
        return "#F43F5E";
      default:
        return "#22C55E";
    }
  };

  return (
    <div className="recommendation-section mt-4">
      <div className="d-flex align-items-center gap-2 mb-3">
        <FaLeaf className="text-success" size={24} />
        <h4 className="fw-bold">Sustainability Recommendations</h4>
      </div>

      <div className="row g-3">
        {activeRecommendations.map((rec, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-4">
            <div
              className="card recommendation-card h-100"
              style={{ borderLeft: `6px solid ${getBorderColor(rec.label)}` }}
            >
              <div className="card-body">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <div className="icon-badge">{getLabelIcon(rec.label)}</div>
                  <h5 className="card-title mb-0">{rec.title || rec.label}</h5>
                </div>
                {/* Description as bullet points */}
                {/* <ul className="text-muted small mb-3">
                  {rec.description
                    ? rec.description.split("~").map((point, i) => (
                        <li key={i}>{point.trim()}</li>
                      ))
                    : <li>No description available</li>}
                </ul> */} 
                {/* Show description as plain text */}
                <p className="text-muted small">
                  {rec.description ? rec.description.split("~")[0].trim() : "No description available"}
                </p>

                <div className="d-flex gap-2">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => setOpenRecommendation(rec)}
                  >
                    <FaInfoCircle /> View Details
                  </button>
                  {rec.configurationTemplate && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setOpenConfig(rec)}
                    >
                      <FaLightbulb /> Savings
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendation Modal */}
      {openRecommendation && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              {getLabelIcon(openRecommendation.label)}
              <h5>{openRecommendation.title || openRecommendation.label}</h5>
            </div>
            <div className="modal-content">
              <h6 className="mb-2">Recommended Actions:</h6>
              <ul>
                {openRecommendation.recommendation
                  ? openRecommendation.recommendation.split("~").map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))
                  : <li>No recommendation details</li>}
              </ul>
            </div>
            <button className="btn btn-danger mt-3" onClick={() => setOpenRecommendation(null)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Config Modal */}
      {openConfig && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <div className="modal-header">
              {getLabelIcon(openConfig.label)}
              <h5>{openConfig.title || openConfig.label} - Configuration</h5>
            </div>
            <div className="modal-content">
              <pre style={{ whiteSpace: "pre-wrap" }}>
                {renderConfigTemplate(openConfig.configurationTemplate)}
              </pre>
            </div>
            <button className="btn btn-danger mt-3" onClick={() => setOpenConfig(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
