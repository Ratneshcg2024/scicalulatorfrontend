import React, { useEffect, useState } from 'react';
import '../styles/CloudSCICalculator.css';
import { fetchInstanceType, fetchRegion } from "../api/cloud";
import Select from "react-select";
 
export default function InstanceForm({ index, tierId, cloudId, onInstanceChange, formData = {}, errors = {} }) {
  const [instanceType, setInstanceType] = useState([]);
  const [region, setRegion] = useState([]);
 
  const options = instanceType.map(i => ({ value: i.id, label: i.instanceClass }));
  const regionOptions = region.map(i => ({ value: i.id, label: `${i.region} (${i.location})` }));
 
  useEffect(() => {
    if (!cloudId) return;
    async function loadData() {
      try {
        const resInstance = await fetchInstanceType(cloudId);
        if (resInstance.status === 200) setInstanceType(resInstance.data);
        const resRegion = await fetchRegion(cloudId);
        if (resRegion.status === 200) setRegion(resRegion.data);
      } catch (err) {
        alert(`Error fetching data: ${err}`);
      }
    }
    loadData();
  }, [cloudId]);
 
  const handleChange = e => {
    let val = e.target.value;
    if (["cpuCoresAllocated", "storageVolumeGB", "cpuUtilization", "memoryUtilization", "similarInstances"].includes(e.target.name)) {
      val = val === "" ? "" : Number(val);
      if (e.target.name === "cpuCoresAllocated" && val < 1) val = 1;
      if (e.target.name === "similarInstances" && val < 1) val = 1;
      if (val < 0) val = 0;
    }
    onInstanceChange(tierId, index - 1, e.target.name, val);
  };
 
  return (
    <>
      <div className="row"><div className="col-2 px-4 py-2"><div className="fw-bold fs-5 instance_heading text-nowrap">Instance {index}</div></div></div>
      <div className="row">
        <div className="col-12 col-md-6">
          <div className="row">
            <div className="col-12 col-md-6 px-4 py-2">
              <label htmlFor="instanceTypeId" className="form-label">Instance Type</label>
              <Select
                name="instanceTypeId"
                id="instanceTypeId"
                value={options.find(o => o.value === formData.instanceTypeId) || null}
                onChange={s => handleChange({ target: { name: "instanceTypeId", value: s ? s.value : "" } })}
                options={options}
                placeholder="Select Instance Type"
                isSearchable
                className={errors.instanceTypeId ? "is-invalid" : ""}
              />
              <div className="invalid-feedback d-block">{errors.instanceTypeId}</div>
            </div>
            <div className="col-12 col-md-6 px-4 py-2">
              <label htmlFor="regionId" className="form-label">Region</label>
              <Select
                name="regionId"
                id="regionId"
                value={regionOptions.find(o => o.value === formData.regionId) || null}
                onChange={s => handleChange({ target: { name: "regionId", value: s ? s.value : "" } })}
                options={regionOptions}
                placeholder="Select Region"
                isSearchable
                className={errors.regionId ? "is-invalid" : ""}
              />
              <div className="invalid-feedback d-block">{errors.regionId}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="row">
            <div className="col-12 col-md-6 px-4 py-2">
              <label htmlFor="cpuCoresAllocated" className="form-label">Apps running on the instance</label>
              <input
                type="number"
                className={`form-control ${errors.cpuCoresAllocated ? "is-invalid" : ""}`}
                id="cpuCoresAllocated"
                name="cpuCoresAllocated"
                placeholder="Enter CPU cores allocated"
                onChange={handleChange}
                value={formData.cpuCoresAllocated === "" ? "" : formData.cpuCoresAllocated}
                min={1}
              />
              <div className="invalid-feedback">{errors.cpuCoresAllocated}</div>
            </div>
            <div className="col-12 col-md-6 px-4 py-2">
              <label htmlFor="similarInstances" className="form-label">Similar Instances</label>
              <input
                type="number"
                className={`form-control ${errors.similarInstances ? "is-invalid" : ""}`}
                id="similarInstances"
                name="similarInstances"
                onChange={handleChange}
                value={formData.similarInstances === "" ? 1 : formData.similarInstances}
                min={1}
              />
              <div className="invalid-feedback">{errors.similarInstances}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12 col-md-6 px-4 py-2">
          <div className="row">
            <div className="col-12 col-md-6 px-4 py-2">
              <label htmlFor="cpuUtilization" className="form-label">CPU Utilization (%)</label>
              <input
                type="number"
                className={`form-control ${errors.cpuUtilization ? "is-invalid" : ""}`}
                id="cpuUtilization"
                name="cpuUtilization"
                placeholder="Enter CPU utilization"
                onChange={handleChange}
                value={formData.cpuUtilization === "" ? "" : formData.cpuUtilization}
                min={0}
              />
              <div className="invalid-feedback">{errors.cpuUtilization}</div>
            </div>
            <div className="col-12 col-md-6 px-4 py-2">
              <label htmlFor="storageVolumeGB" className="form-label">Storage Volume (GB)</label>
              <input
                type="number"
                className={`form-control ${errors.storageVolumeGB ? "is-invalid" : ""}`}
                id="storageVolumeGB"
                name="storageVolumeGB"
                placeholder="Enter storage volume"
                onChange={handleChange}
                value={formData.storageVolumeGB === "" ? "" : formData.storageVolumeGB}
                min={0}
              />
              <div className="invalid-feedback">{errors.storageVolumeGB}</div>
            </div>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="row">
            <div className="col-12 px-4 py-2">
              <label htmlFor="memoryUtilization" className="form-label">Memory Utilization</label>
              <div className="row">
                <div className="col-9">
                  <input
                    type="number"
                    className={`form-control ${errors.memoryUtilization ? "is-invalid" : ""}`}
                    id="memoryUtilization"
                    name="memoryUtilization"
                    placeholder="Enter memory utilized (GB)"
                    onChange={handleChange}
                    value={formData.memoryUtilization === "" ? "" : formData.memoryUtilization}
                    min={0}
                  />
                  <div className="invalid-feedback">{errors.memoryUtilization}</div>
                </div>
                <div className="col">
                  <select
                    name="memoryUnit"
                    id="memoryUnit"
                    className={`form-select ${errors.memoryUnit ? "is-invalid" : ""}`}
                    onChange={handleChange}
                    value={formData.memoryUnit || "percent"}
                  >
                    <option value="percent">%</option>
                    <option value="mb">MB</option>
                  </select>
                  <div className="invalid-feedback">{errors.memoryUnit}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}