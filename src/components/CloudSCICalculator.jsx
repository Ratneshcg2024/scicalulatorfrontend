import React, { useEffect, useState } from "react";
import InstanceForm from "./InstanceForm";
import "../styles/CloudSCICalculator.css";
import { calculateSCI, fetchCloudProvider } from "../api/cloud";
import Loader from "./Loader";  // use your loader component
import * as yup from "yup";
import InstanceResultsTable from "./InstanceResultsTable";
import SCIResultCard from "./SCIResultCard";

const cloudSchema = yup.object().shape({
    applicationName: yup.string().required("Application name is required"),
    cloudProvider: yup.string().required("Cloud provider is required"),
    tiers: yup.array().of(
        yup.object().shape({
            noOfInstances: yup.number().min(1, "At least 1 instance required").required("Number of instances is required"),
            instancesData: yup.array().of(
                yup.object().shape({
                    instanceTypeId: yup.string().required("Instance Type is required"),
                    regionId: yup.string().required("Region is required"),
                    cpuCoresAllocated: yup.number().min(0, "Apps running cannot be negative").required("Apps running is required"),
                    storageVolumeGB: yup.number().min(0, "Storage cannot be negative").required("Storage is required"),
                    cpuUtilization: yup.number().min(0, "CPU Utilization cannot be negative").required("CPU Utilization is required"),
                    memoryUtilization: yup.number().min(0, "Memory Utilization cannot be negative").required("Memory Utilization is required"),
                    memoryUnit: yup.string().required("Memory Unit is required"),
                    similarInstances: yup.number().min(1, "At least 1 similar instance").required("Similar instances required"),
                })
            ).test("similarInstancesSum", "Sum of similarInstances must equal noOfInstances", function (value) {
                const noOfInstances = this.parent.noOfInstances;
                if (!value) return false;
                const sum = value.reduce((acc, inst) => acc + (inst.similarInstances || 0), 0);
                return sum === noOfInstances;
            }),
        })
    ),
    duration: yup.number().typeError("Duration must be a number").min(0, "Duration cannot be negative").required("Duration is required"),
    workloadSize: yup.string().required("Workload size is required"),
});

export default function CloudSCICalculator() {
    const [showResult, setShowResult] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [formData, setFormData] = useState({
        applicationName: "",
        cloudProvider: "",
        duration: 1,
        workloadSize: "NA",
        tiers: [
            {
                id: 1,
                noOfInstances: 1,
                instancesData: [],
            },
        ],
    });
    const [errors, setErrors] = useState({});
    const [cloudProviders, setCloudProviders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        async function loadData() {
            try {
                const res = await fetchCloudProvider();
                if (res.status === 200) setCloudProviders(res.data);
                else alert("Unable to fetch cloud providers");
            } catch (err) {
                alert("Something went wrong: " + err);
            }
        }
        loadData();
    }, []);

    const handleTierChange = (tierId, field, value) => {
        setFormData((prev) => {
            const updatedTiers = prev.tiers.map((tier) => {
                if (tier.id === tierId) {
                    if (field === "noOfInstances") {
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
                        const currentSum = tier.instancesData.reduce((acc, inst) => acc + (inst.similarInstances || 0), 0);
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
                                        memoryUnit: "percent",
                                        cpuUtilization: 50,
                                        similarInstances: 1,
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

    const sumSimilarInstances = (tier) => tier.instancesData.reduce((acc, i) => acc + (i.similarInstances || 0), 0);

    const getMappedInstances = () => {
        let allInstances = [];
        let counter = 1; // start from 1

        formData.tiers.forEach((tier) => {
            tier.instancesData.forEach((inst) => {
                const count = inst.similarInstances || 1;
                for (let i = 0; i < count; i++) {
                    allInstances.push({
                        ...inst,
                        id: counter,        // unique instance id (1,2,3…)
                        groupId: tier.id,   // same for similar instances
                        cpuUtilization: parseFloat(inst.cpuUtilization || 0),
                        memoryUtilization: parseFloat(inst.memoryUtilization || 0),
                        memoryUnit: inst.memoryUnit || "percent",
                        cpuCoresAllocated: parseInt(inst.cpuCoresAllocated || 1),
                        storageVolumeGB: parseFloat(inst.storageVolumeGB || 0),
                        tier: tier.id,
                    });
                    counter++;
                }
            });
        });

        return allInstances;
    };


    const removeTier = (tierId) => {
        setFormData((prev) => ({
            ...prev,
            tiers: prev.tiers.filter((tier) => tier.id !== tierId),
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setShow(false);
        setResult(null);

        try {
            await cloudSchema.validate(formData, { abortEarly: false });
            setLoading(true);
            const baseDuration = parseFloat(formData.duration || 0);
            const payload = {
                applicationName: formData.applicationName,
                cloudProvider: formData.cloudProvider,
                workloadSize: formData.workloadSize,
                instances: getMappedInstances().map((inst) => ({
                    ...inst,
                    duration: baseDuration,
                })),
            };
            console.log("Payload sent:", payload);// to addd a tier  in each array rack

            const response = await calculateSCI(payload);
            if (response.status === 200) {
                setResult(response.data);
                setShowResult(true);
                console.log(response.data);
                setShow(true);
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
                                    if (!formErrors.tiers[tierIndex].instancesData) formErrors.tiers[tierIndex].instancesData = [];
                                    if (!formErrors.tiers[tierIndex].instancesData[instIndex]) formErrors.tiers[tierIndex].instancesData[instIndex] = {};
                                    formErrors.tiers[tierIndex].instancesData[instIndex][instField] = err.message;
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
    // Add Tier button handler
    const addTier = () => {
        setFormData((prev) => ({
            ...prev,
            tiers: [
                ...prev.tiers,
                {
                    id: prev.tiers.length + 1,
                    noOfInstances: 1,
                    instancesData: [],
                },
            ],
        }));
    };

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
                            value={formData.applicationName}
                            onChange={(e) => setFormData({ ...formData, applicationName: e.target.value })}
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
                        <div className="d-flex align-items-center mb-2  ">
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
                                    className={`form-control ${errors?.tiers?.[i]?.noOfInstances ? "is-invalid" : ""}`}
                                    value={tier.noOfInstances}
                                    onChange={(e) => handleTierChange(tier.id, "noOfInstances", e.target.value)}
                                />
                                <div className="invalid-feedback">{errors?.tiers?.[i]?.noOfInstances}</div>
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
                {/* Move Duration and Workload Size below all tiers */}
                <div className="row">
                    <div className="col-12 col-md-6 py-2 px-4">
                        <label className="form-label">Duration (hours)</label>
                        <input
                            type="number"
                            className={`form-control ${errors.duration ? "is-invalid" : ""}`}
                            name="duration"
                            min={1}
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                        />
                        <div className="invalid-feedback">{errors.duration}</div>
                    </div>
                    <div className="col-12 col-md-6 py-2 px-4">
                        <label className="form-label">Workload Size</label>
                        <select
                            name="workloadSize"
                            className={`form-select ${errors.workloadSize ? "is-invalid" : ""}`}
                            value={formData.workloadSize}
                            onChange={(e) => setFormData({ ...formData, workloadSize: e.target.value })}
                        >
                            <option value="NA">NA</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                        </select>
                        <div className="invalid-feedback">{errors.workloadSize}</div>
                    </div>
                </div>
                <button
                    type="submit"
                    className="btn btn-outline-primary mt-3 mx-auto d-block"
                    style={{ pointerEvents: loading ? "none" : "auto" }}
                >
                    {loading ? <><Loader /> Calculating...</>: "Calculate SCI"}
                </button>

            </form>
            {show && result && (
                <>
                    {/* <ResultCard
                        sci={result.sci}
                        energy={result.totalOperationalEnergy}
                        operational={result.totalOperationalEmissions}
                        embodied={result.totalEmbodiedEmissions}
                    /> */}
                    <SCIResultCard
                        sci={result.sci}
                        energy={result.totalOperationalEnergy}
                        operational={result.totalOperationalEmissions}
                        embodied={result.totalEmbodiedEmissions}
                        showResult={showResult}
                    />

                    <div className="text-center mt-3">
                        <button
                            className="btn btn-outline-secondary"
                            onClick={() => setShowDetails((prev) => !prev)}
                        >
                            {showDetails
                                ? "Hide Detailed Results"
                                : "Show Detailed Results"}
                        </button>
                    </div>

                    {showDetails && (
                        <InstanceResultsTable instanceResults={result.instanceResults} />
                    )}
                </>
            )}
          
        </div>
    );
}
