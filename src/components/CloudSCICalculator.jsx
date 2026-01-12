
import React, { useEffect, useMemo, useState } from "react";
import InstanceForm from "./InstanceForm";
import "../styles/CloudSCICalculator.css";
import {
  calculateSCI,
  fetchCloudProvider,
  fetchInstanceType,
  fetchRegion,
  // NEW: wrappers for your endpoints (add these in ../api/cloud)
  getRecommendations,
  getOptimization,
} from "../api/cloud";
import Loader from "./Loader"; // use your loader component
import * as yup from "yup";
import InstanceResultsTable from "./InstanceResultsTable";
import SCIResultCard from "./SCIResultCard";
import { FaLeaf } from "react-icons/fa";
import RecommendationCards from "./RecommendationCards";

const cloudSchema = yup.object().shape({
  applicationName: yup.string().required("Application name is required"),
  cloudProvider: yup.string().required("Cloud provider is required"),
  tiers: yup
    .array()
    .of(
      yup.object().shape({
        noOfInstances: yup
          .number()
          .min(1, "At least 1 instance required")
          .required("Number of instances is required"),
        instancesData: yup
          .array()
          .of(
            yup.object().shape({
              instanceTypeId: yup.string().required("Instance Type is required"),
              regionId: yup.string().required("Region is required"),
              cpuCoresAllocated: yup
                .number()
                .min(0, "Apps running cannot be negative")
                .required("Apps running is required"),
              storageVolumeGB: yup
                .number()
                .transform((value, originalValue) =>
                  originalValue === "" ? undefined : value
                )
                .min(0, "Storage cannot be negative")
                .required("Storage is required"),
              cpuUtilization: yup
                .number()
                .transform((value, originalValue) =>
                  originalValue === "" ? undefined : value
                )
                .min(0, "CPU Utilization cannot be negative")
                .required("CPU Utilization is required"),
              memoryUtilization: yup
                .number()
                .transform((value, originalValue) =>
                  originalValue === "" ? undefined : value
                )
                .min(0, "Memory Utilization cannot be negative")
                .required("Memory Utilization is required"),
              memoryUnit: yup.string().required("Memory Unit is required"),
              similarInstances: yup
                .number()
                .min(1, "At least 1 similar instance")
                .required("Similar instances required"),
              appCriticality: yup.string().oneOf(["low", "medium", "high"]).default("low"),
            })
          )
          .test(
            "similarInstancesSum",
            "Sum of similarInstances must equal noOfInstances",
            function (value) {
              const noOfInstances = this.parent.noOfInstances;
              if (!value) return false;
              const sum = value.reduce(
                (acc, inst) => acc + (inst.similarInstances || 0),
                0
              );
              return sum === noOfInstances;
            }
          ),
      })
    ),
  duration: yup
    .number()
    .typeError("Duration must be a number")
    .min(0, "Duration cannot be negative")
    .required("Duration is required"),
  workloadSize: yup.string().required("Workload size is required"),
});

export default function CloudSCICalculator() {
  const [showResult, setShowResult] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // recommendations + optimization
  const [recommendations, setRecommendations] = useState(null);
  const [optimization, setOptimization] = useState(null);

  // loading states
  const [loading, setLoading] = useState(false);
  const [recLoading, setRecLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [cloudProviders, setCloudProviders] = useState([]);
  const [cloudData, setCloudData] = useState({ instanceTypes: [], regions: [] });
  const [result, setResult] = useState(null);
  const [show, setShow] = useState(false);

  const [formData, setFormData] = useState({
    applicationName: "",
    cloudProvider: "",
    duration: 1,
    durationUnit: "hours",
    workloadSize: "NA",
    tiers: [
      {
        id: 1,
        noOfInstances: 1,
        instancesData: [],
      },
    ],
  });

  // ---------- helpers ----------
  const safeNum = (v, def = 0) => {
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isFinite(n) ? n : def;
  };

  const average = (arr) => {
    if (!arr.length) return 0;
    const s = arr.reduce((acc, v) => acc + safeNum(v, 0), 0);
    return s / arr.length;
  };

  const sumSimilarInstances = (tier) =>
    tier.instancesData.reduce((acc, i) => acc + (i.similarInstances || 0), 0);

  // Expand instances by similarInstances
  const getMappedInstances = () => {
    let allInstances = [];
    let counter = 1; // start from 1
    formData.tiers.forEach((tier) => {
      tier.instancesData.forEach((inst) => {
        const count = inst.similarInstances || 1;
        for (let i = 0; i < count; i++) {
          allInstances.push({
            ...inst,
            id: counter, // unique instance id (1,2,3…)
            groupId: tier.id, // same for similar instances
            cpuUtilization: safeNum(inst.cpuUtilization, 0),
            memoryUtilization: safeNum(inst.memoryUtilization, 0),
            memoryUnit: inst.memoryUnit || "percentage",
            cpuCoresAllocated: parseInt(inst.cpuCoresAllocated ?? 1, 10),
            storageVolumeGB: safeNum(inst.storageVolumeGB, 0),
            appCriticality: inst.appCriticality || "low",
            tier: tier.id,
          });
          counter++;
        }
      });
    });
    return allInstances;
  };

  // ---------- effects ----------
  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchCloudProvider();
        if (res.status === 200) {
          setCloudProviders(res.data);
        } else alert("Unable to fetch cloud providers");
      } catch (err) {
        alert("Something went wrong: " + err);
      }
    }
    loadData();
  }, []);

  // ---------- event handlers ----------
  const handleCloudData = async (cloudId) => {
    const resInstance = await fetchInstanceType(cloudId);
    const resRegion = await fetchRegion(cloudId);
    try {
      if (resInstance.status === 200 && resRegion.status === 200) {
        setCloudData({ instanceTypes: resInstance.data, regions: resRegion.data });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleTierChange = (tierId, field, value) => {
    setFormData((prev) => {
      const updatedTiers = prev.tiers.map((tier) => {
        if (tier.id === tierId) {
          if (field === "noOfInstances") {
            if (value === "") {
              return { ...tier, noOfInstances: "" };
            }
            const num = Math.max(0, Number(value));
            let newInstances = tier.instancesData;
            if (num < tier.noOfInstances) {
              newInstances = tier.instancesData.slice(0, num);
            }
            return { ...tier, noOfInstances: num, instancesData: newInstances };
          }
          return tier;
        }
        return tier;
      });
      return { ...prev, tiers: updatedTiers };
    });
  };

  const addInstance = (tierId) => {
    setFormData((prev) => {
      const updatedTiers = prev.tiers.map((tier) => {
        if (tier.id === tierId) {
          if (tier.instancesData.length < tier.noOfInstances) {
            const currentSum = tier.instancesData.reduce(
              (acc, inst) => acc + (inst.similarInstances || 0),
              0
            );
            if (currentSum < tier.noOfInstances) {
              return {
                ...tier,
                instancesData: [
                  ...tier.instancesData,
                  {
                    instanceTypeId: "",
                    regionId: "",
                    cpuCoresAllocated: 1,
                    storageVolumeGB: 0,
                    memoryUtilization: 50,
                    memoryUnit: "percentage",
                    cpuUtilization: 50,
                    similarInstances: 1,
                    appCriticality: "low",
                  },
                ],
              };
            }
          }
        }
        return tier;
      });
      return { ...prev, tiers: updatedTiers };
    });
  };

  const handleInstanceChange = (tierId, index, field, value) => {
    setFormData((prev) => {
      const updatedTiers = prev.tiers.map((tier) => {
        if (tier.id === tierId) {
          const newInstances = [...tier.instancesData];
          if (field === "similarInstances") {
            let newVal = Math.max(1, Number(value));
            const currentSum = newInstances.reduce((acc, inst, i) => {
              if (i === index) return acc;
              return acc + (inst.similarInstances || 0);
            }, 0);
            const maxAllowed = tier.noOfInstances - currentSum;
            if (newVal > maxAllowed) newVal = maxAllowed;
            newInstances[index] = { ...newInstances[index], [field]: newVal };
          } else {
            newInstances[index] = { ...newInstances[index], [field]: value };
          }
          return { ...tier, instancesData: newInstances };
        }
        return tier;
      });
      return { ...prev, tiers: updatedTiers };
    });
  };

  const removeTier = (tierId) => {
    setFormData((prev) => ({
      ...prev,
      tiers: prev.tiers.filter((tier) => tier.id !== tierId),
    }));
  };

  const removeInstance = (tierId, index) => {
    setFormData((prev) => {
      const updatedTiers = prev.tiers.map((tier) => {
        if (tier.id === tierId) {
          const newInstances = tier.instancesData.filter((_, i) => i !== index);
          return { ...tier, instancesData: newInstances };
        }
        return tier;
      });
      return { ...prev, tiers: updatedTiers };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setShow(false);
    setResult(null);
    setRecommendations(null);
    setOptimization(null);

    try {
      await cloudSchema.validate(formData, { abortEarly: false });
      setLoading(true);

      const baseDuration = safeNum(formData.duration, 0);
      const payload = {
        applicationName: formData.applicationName,
        cloudProvider: formData.cloudProvider,
        workloadSize: formData.workloadSize,
        instances: getMappedInstances().map((inst) => ({
          ...inst,
          duration: baseDuration,
          durationUnit: formData.durationUnit,
        })),
      };

      // Debug logging (non-UI)
      console.groupCollapsed("[SCI] Request Payload");
      console.log(payload);
      console.groupEnd();

      const response = await calculateSCI(payload);
      if (response.status === 200) {
        setResult(response.data);
        setShowResult(true);
        setShow(true);

        console.groupCollapsed("[SCI] Response");
        console.log(response.data);
        console.groupEnd();
      } else {
        setErrors({ submit: "Calculation failed" });
      }
    } catch (validationError) {
      if (validationError.inner) {
        const formErrors = {};
        validationError.inner.forEach((err) => {
          if (err.path.includes("tiers")) {
            const matches = err.path.match(/tiers\[(\d+)\]\.(.+)/);
            if (matches) {
              const tierIndex = parseInt(matches[1], 10);
              const fieldPath = matches[2];
              if (!formErrors.tiers) formErrors.tiers = [];
              if (!formErrors.tiers[tierIndex]) formErrors.tiers[tierIndex] = {};
              if (fieldPath.startsWith("instancesData")) {
                const instMatches = fieldPath.match(/instancesData\[(\d+)\]\.(.+)/);
                if (instMatches) {
                  const instIndex = parseInt(instMatches[1], 10);
                  const instField = instMatches[2];
                  if (!formErrors.tiers[tierIndex].instancesData)
                    formErrors.tiers[tierIndex].instancesData = [];
                  if (!formErrors.tiers[tierIndex].instancesData[instIndex])
                    formErrors.tiers[tierIndex].instancesData[instIndex] = {};
                  formErrors.tiers[tierIndex].instancesData[instIndex][
                    instField
                  ] = err.message;
                }
              } else formErrors.tiers[tierIndex][fieldPath] = err.message;
            }
          } else formErrors[err.path] = err.message;
        });
        setErrors(formErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const addTier = () => {
    setFormData((prev) => ({
      ...prev,
      tiers: [
        ...prev.tiers,
        { id: prev.tiers.length + 1, noOfInstances: 1, instancesData: [] },
      ],
    }));
  };

  // Resolve provider name by id for optimization payload
  const providerName = useMemo(() => {
    const p = cloudProviders.find(
      (x) => String(x.id) === String(formData.cloudProvider)
    );
    return p?.name || "";
  }, [cloudProviders, formData.cloudProvider]);

  // Lookup region name by id
  const getRegionNameById = (id) => {
    const r = cloudData.regions.find((x) => String(x.id) === String(id));
    console.log("Region lookup for id:", id, "found:", r);
    return r?.region || "";
  };

  // ---- SINGLE button handler: Get Recommendations AND Optimize ----
  const handleGetRecommendationsAndOptimize = async () => {
    if (!result) {
      alert("Please calculate SCI first.");
      return;
    }
    setRecLoading(true);

    const instances = getMappedInstances();
    const avgCpu = average(instances.map((i) => i.cpuUtilization));
    const avgMem = average(instances.map((i) => i.memoryUtilization));
    const totalStorage = instances.reduce(
      (acc, i) => acc + safeNum(i.storageVolumeGB, 0),
      0
    );
    const countOfInstances = instances.length;
    const vCPUAvailable =
      (result.instanceResults || []).reduce(
        (acc, r) => acc + safeNum(r.totalVcpu, 0),
        0
      ) || 0;

    // Build recommendations payload (as per your API template)
    const recPayload = {
      scIvalue: safeNum(result.sci, 0),
      totalOperationalEnergy: safeNum(result.totalOperationalEnergy, 0),
      totalOperationalEmissions: safeNum(result.totalOperationalEmissions, 0),
      totalEmbodiedEmissions: safeNum(result.totalEmbodiedEmissions, 0),
      gridEmissions: safeNum(result.gridEmissionFactorUsed, 0),
      deploymentType: "public",
      cpuUtilization: avgCpu,
      memoryUtilization: avgMem,
      storageUsedGB: totalStorage,
      countOfInstances,
      appCountPerInstance: 1,
      appCriticality: instances[0]?.appCriticality || "medium",
      vCPUAvailable,
    };

    try {
      console.groupCollapsed("[Recommendations] Request Payload");
      console.log(recPayload);
      console.groupEnd();

      const recRes = await getRecommendations(recPayload);
      if (recRes.status === 200) {
        setRecommendations(recRes.data);

        console.groupCollapsed("[Recommendations] Response");
        console.log(recRes.data);
        console.groupEnd();

        // Normalize flags to expected case/shape for optimization
        const normalizedFlags = {
          RightSizeInstances:
            (recRes.data.rightSizeInstances || "").toString() === "Yes"
              ? "Yes"
              : "No",
          ChangeHostingRegion:
            (recRes.data.changeHostingRegion || "").toString() === "Yes"
              ? "Yes"
              : "No",
          SwitchToRenewablePower: recRes.data.switchToRenewablePower || "No",
          ScheduleWorkloads: recRes.data.scheduleWorkloads || "No",
          ExtendHardwareLife: recRes.data.extendHardwareLife || "No",
          SoftwareEfficiency: recRes.data.softwareEfficiency || "No",
          ConsolidateWorkloads: recRes.data.consolidateWorkloads || "No",
          ReduceStorageFootprint: recRes.data.reduceStorageFootprint || "No",
          ShutdownPolicies: recRes.data.shutdownPolicies || "No",
          MoveToServerless: recRes.data.moveToServerless || "No",
        };

        const first = instances[0];
        if (!first) {
          alert("No instance context found. Please add at least one instance.");
          setRecLoading(false);
          return;
        }

        const regionName = getRegionNameById(first.regionId);

        const optPayload = {
          recommendations: normalizedFlags,
          instanceContext: {
            instanceTypeId: first.instanceTypeId,
            region: regionName || "",
            cpuUtilization: safeNum(first.cpuUtilization, 0),
            memoryUtilization: safeNum(first.memoryUtilization, 0),
          },
          regionContext: {
            currentRegionId: first.regionId,
            cloudProvider: providerName || "Azure",
            currentRegionName: "",
            preferredRegionName: "",
          },
          // IMPORTANT: Backend expects ENERGY (kWh) → use totalOperationalEnergy
          // (Your example used emissions-like numbers; adjust if your backend expects emissions)
          operationalEnergyKwh: safeNum(result.totalOperationalEnergy, 0),
        };

        console.groupCollapsed("[Optimization] Request Payload");
        console.log(optPayload);
        console.groupEnd();

        const optRes = await getOptimization(optPayload);
        if (optRes.status === 200) {
          setOptimization(optRes.data);

          console.groupCollapsed("[Optimization] Response");
          console.log(optRes.data);
          console.groupEnd();
        } else {
          alert("Failed to optimize workload.");
        }
      } else {
        alert("Failed to fetch recommendations.");
      }
    } catch (err) {
      console.error("Recommendations/Optimization error:", err);
      alert("Error while processing: " + (err?.message || "Unknown error"));
    } finally {
      setRecLoading(false);
    }
  };

  // ---------- render ----------
  return (
    <div className="container mb-3 mt-4">
      <h3 className="text-center fw-bold" style={{ color: "rgb(0, 112, 173)" }}>
        Cloud Application SCI Calculator
      </h3>

      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-12 col-md-6 py-2 px-4">
            <label className="form-label">Application Name</label>
            <input
              type="text"
              className={`form-control ${errors.applicationName ? "is-invalid" : ""}`}
              name="applicationName"
              placeholder="Enter name of your application"
              value={formData.applicationName}
              onChange={(e) =>
                setFormData({ ...formData, applicationName: e.target.value })
              }
            />
            <div className="invalid-feedback">{errors.applicationName}</div>
          </div>

          <div className="col-12 col-md-6 py-2 px-4">
            <label className="form-label">Cloud Provider</label>
            <select
              name="cloudProvider"
              className={`form-select ${errors.cloudProvider ? "is-invalid" : ""}`}
              value={formData.cloudProvider}
              onChange={(e) => {
                e.target.value ? handleCloudData(e.target.value) : setCloudData([]);
                setFormData({
                  ...formData,
                  cloudProvider: e.target.value,
                  tiers: [{ id: 1, noOfInstances: 1, instancesData: [] }],
                });
              }}
            >
              <option value="">Select Provider</option>
              {cloudProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </select>
            <div className="invalid-feedback">{errors.cloudProvider}</div>
          </div>
        </div>

        {/* Tiers and Instances */}
        {formData.tiers.map((tier, i) => (
          <div key={tier.id} className="mb-3 border p-3 rounded">
            <div className="d-flex align-items-center mb-2 ">
              <h5>Tier {i + 1}</h5>
              <button
                type="button"
                className="btn btn-danger ms-auto"
                onClick={() => removeTier(tier.id)}
              >
                Remove Tier
              </button>
            </div>

            <div className="mb-2 row">
              <label className="col-form-label col-6">No of Instances</label>
              <div className="col-6">
                <input
                  type="number"
                  min={0}
                  className={`form-control ${
                    errors?.tiers?.[i]?.noOfInstances ? "is-invalid" : ""
                  }`}
                  value={tier.noOfInstances ?? ""}
                  onChange={(e) => {
                    let val = e.target.value;
                    if (val === "") {
                      handleTierChange(tier.id, "noOfInstances", "");
                    } else {
                      val = Math.max(0, Number(val));
                      handleTierChange(tier.id, "noOfInstances", val);
                    }
                  }}
                  onWheel={(e) => e.target.blur()}
                  onBlur={(e) => {
                    let val =
                      e.target.value === ""
                        ? 0
                        : Math.max(0, Number(e.target.value));
                    handleTierChange(tier.id, "noOfInstances", val);
                  }}
                />
                <div className="invalid-feedback">
                  {errors?.tiers?.[i]?.noOfInstances}
                </div>
              </div>
            </div>

            {tier.instancesData.map((inst, idx) => (
              <InstanceForm
                key={idx}
                index={idx + 1}
                tierId={tier.id}
                cloudId={formData.cloudProvider}
                formData={inst}
                errors={errors?.tiers?.[i]?.instancesData?.[idx] || {}}
                onInstanceChange={handleInstanceChange}
                cloudData={cloudData}
                onRemove={() => removeInstance(tier.id, idx)}
              />
            ))}

            <button
              type="button"
              className="btn btn-primary mb-2"
              disabled={sumSimilarInstances(tier) >= tier.noOfInstances}
              onClick={() => addInstance(tier.id)}
            >
              Add Instance
            </button>

            {sumSimilarInstances(tier) < tier.noOfInstances && (
              <div className="text-danger small">
                Please add all instances before calculating
              </div>
            )}
          </div>
        ))}

        <div className="mb-3">
          <button type="button" className="btn btn-primary" onClick={addTier}>
            + Add Tier
          </button>
        </div>

        {/* Duration + Workload Size */}
        <div className="row">
          <div className="col-12 col-md-6 py-2 px-4">
            <div className="row">
              <div className="col-8">
                <label className="form-label">Duration</label>
                <input
                  type="number"
                  className={`form-control ${errors.duration ? "is-invalid" : ""}`}
                  name="duration"
                  min={1}
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  onWheel={(e) => e.target.blur()}
                />
                <div className="invalid-feedback">{errors.duration}</div>
              </div>
              <div className="col-4">
                <label className="form-label">Duration Unit</label>
                <select
                  name="durationUnit"
                  id="durationUnit"
                  className="form-select"
                  value={formData.durationUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, durationUnit: e.target.value })
                  }
                >
                  <option value="minutes">Minute</option>
                  <option value="hours">Hour</option>
                  <option value="days">Day</option>
                </select>
                <div className="invalid-feedback">{errors.duration}</div>
              </div>
            </div>
          </div>

          <div className="col-12 col-md-6 py-2 px-4">
            <label className="form-label">Workload Size</label>
            <select
              name="workloadSize"
              className={`form-select ${errors.workloadSize ? "is-invalid" : ""}`}
              value={formData.workloadSize}
              onChange={(e) =>
                setFormData({ ...formData, workloadSize: e.target.value })
              }
            >
              <option value="NA">NA</option>
              <option value="XS">XS : (1-99)</option>
              <option value="S">S : (100-999)</option>
              <option value="M">M : (1000-9999)</option>
              <option value="L">L : (10000-99999)</option>
              <option value="XL">XL : (100000-999999)</option>
              <option value="XXL">XXL : (`&gt;`1000000)</option>
            </select>
            <div className="invalid-feedback">{errors.workloadSize}</div>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-outline-primary mt-3 mx-auto d-block"
          style={{ pointerEvents: loading ? "none" : "auto" }}
        >
          {loading ? (
            <>
              <Loader /> Calculating...
            </>
          ) : (
            "Calculate SCI"
          )}
        </button>
      </form>

      {show && result && (
        <>
          {/* SCI summary card */}
          <SCIResultCard
            sci={result.sci}
            energy={result.totalOperationalEnergy}
            operational={result.totalOperationalEmissions}
            embodied={result.totalEmbodiedEmissions}
            showResult={showResult}
          />

          {/* toggle detailed instance results */}
          <div className="text-center mt-3">
            <button
              className="btn btn-outline-secondary"
              onClick={() => setShowDetails((prev) => !prev)}
            >
              {showDetails ? "Hide Detailed Results" : "Show Detailed Results"}
            </button>
          </div>

          {showDetails && (
            <InstanceResultsTable instanceResults={result.instanceResults} />
          )}

          {/* Get Recommendation button: VISIBLE ONLY AFTER SCI */}
          <div className="text-center mt-4">
            <button
              className="btn btn-success d-flex align-items-center gap-2 px-3 py-2 mx-auto"
              style={{ borderRadius: "0.5rem" }}
              onClick={handleGetRecommendationsAndOptimize}
              disabled={recLoading}
            >
              <FaLeaf size={18} />
              {recLoading ? (
                <>
                  <Loader /> Processing...
                </>
              ) : (
                "Get Recommendation"
              )}
            </button>
          </div>
        </>
      )}

      {/* Render flags + optimization (component handles empty state gracefully) */}
      
<RecommendationCards
  data={{
    rightSizeSentence: optimization?.rightSizeSentence,
    regionChangeSentence: optimization?.regionChangeSentence,
    enrichedRecommendations: optimization?.enrichedRecommendations || [],
  }}
  flags={recommendations}
/>

    </div>
  );
}
