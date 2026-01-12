import React, { useEffect, useState } from "react";
import "../styles/CloudSCICalculator.css";
import Select from "react-select";
import { FaTrash } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

export default function InstanceForm({
  index,
  tierId,
  cloudId,
  onInstanceChange,
  formData = {},
  errors = {},
  cloudData = { instanceTypes: [], regions: [] },
  onRemove
}) {
  const [loading, setLoading] = useState({ isloadingInstanceType: false, isloadingRegion: false });
  const [hover, setHover] = useState(false);

  useEffect(() => {
    setLoading({
      isloadingInstanceType: cloudId && cloudData.instanceTypes.length === 0,
      isloadingRegion: cloudId && cloudData.regions.length === 0
    });
  }, [cloudId, cloudData]);

  const instanceOptions = (cloudData.instanceTypes || []).map((i) => ({
    value: i.id,
    label: i.instanceClass,
  }));

  const regionOptions = (cloudData.regions || []).map((i) => ({
    value: i.id,
    label: `${i.region} (${i.location})`,
  }));

  const handleChange = (e) => {
    let val = e.target.value;
    if (
      [
        "cpuCoresAllocated",
        "storageVolumeGB",
        "cpuUtilization",
        "memoryUtilization",
        "similarInstances",
      ].includes(e.target.name)
    ) {
      val = val === "" ? "" : Number(val);
      if (e.target.name === "cpuCoresAllocated" && val < 1) val = 1;
      if (e.target.name === "similarInstances" && val < 1) val = 1;
      if (val < 0) val = 0;
    }
    onInstanceChange(tierId, index - 1, e.target.name, val);
  };

  const handleScrollChange = (e) => e.target.blur();

  return (
    <div className={` mb-3  ${hover ? 'instance-main-box' : ''}`} >
      <div className="row">
        <div className="col-12 px-4 py-2">
          <div className={`fw-bold fs-5 instance_heading text-nowrap ${hover ? 'instance-seq-head' : ''}`} style={{
            fontFamily: '"Georgia", "Times New Roman", serif',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            Instance {index}
            <abbr title={`delete instance ${index}`} style={{ cursor: 'pointer' }}>
              <MdDelete
                onClick={onRemove}
                className="delete-instance-icon"
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
              /></abbr>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Instance Type */}
        <div className="col-12 col-md-6">
          <div className="row">
            <div className="col-12 col-md-6 px-4 py-2">
              <label htmlFor="instanceTypeId" className="form-label">
                Instance Type
              </label>
              <Select
                name="instanceTypeId"
                id="instanceTypeId"
                value={
                  instanceOptions.find(
                    (o) => o.value === formData.instanceTypeId
                  ) || null
                }
                onChange={(s) =>
                  handleChange({
                    target: {
                      name: "instanceTypeId",
                      value: s ? s.value : "",
                    },
                  })
                }
                options={instanceOptions}
                placeholder={
                  !cloudId
                    ? "Select Cloud Provider"
                    : loading.isloadingInstanceType
                      ? "Loading..."
                      : "Select Instance Type"
                }
                isSearchable
                isDisabled={!cloudId || loading.isloadingInstanceType}
                className={errors.instanceTypeId ? "is-invalid" : ""}
              />
              <div className="invalid-feedback d-block">
                {errors.instanceTypeId}
              </div>
            </div>

            {/* Region */}
            <div className="col-12 col-md-6 px-4 py-2">
              <label htmlFor="regionId" className="form-label">
                Region
              </label>
              <Select
                name="regionId"
                id="regionId"
                value={
                  regionOptions.find((o) => o.value === formData.regionId) ||
                  null
                }
                onChange={(s) =>
                  handleChange({
                    target: { name: "regionId", value: s ? s.value : "" },
                  })
                }
                options={regionOptions}
                placeholder={
                  !cloudId
                    ? "Select Cloud Provider"
                    : loading.isloadingRegion
                      ? "Loading..."
                      : "Select Region"
                }
                isSearchable
                isDisabled={!cloudId || loading.isloadingRegion}
                className={errors.regionId ? "is-invalid" : ""}
              />
              <div className="invalid-feedback d-block">{errors.regionId}</div>
            </div>
          </div>
        </div>

        {/* Apps & Similar Instances */}
        <div className="col-12 col-md-6">
          <div className="row">
            <div className="col-12 col-md-6 px-4 py-2">
              <label htmlFor="cpuCoresAllocated" className="form-label">
                Apps running on the instance
              </label>
              <input
                type="number"
                className={`form-control ${errors.cpuCoresAllocated ? "is-invalid" : ""
                  }`}
                id="cpuCoresAllocated"
                name="cpuCoresAllocated"
                placeholder="Enter CPU cores allocated"
                onChange={(e) =>
                  onInstanceChange(
                    tierId,
                    index - 1,
                    e.target.name,
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                value={
                  formData.cpuCoresAllocated === undefined
                    ? ""
                    : formData.cpuCoresAllocated
                }
                onWheel={handleScrollChange}
                onBlur={(e) => {
                  let val = Number(e.target.value);
                  if (!val || val < 1) val = 1;
                  onInstanceChange(tierId, index - 1, e.target.name, val);
                }}
                min={1}
              />
              <div className="invalid-feedback">{errors.cpuCoresAllocated}</div>
            </div>

            <div className="col-12 col-md-6 px-4 py-2">
              <label htmlFor="similarInstances" className="form-label">
                Similar Instances
              </label>
              <input
                type="number"
                className={`form-control ${errors.similarInstances ? "is-invalid" : ""
                  }`}
                id="similarInstances"
                name="similarInstances"
                onChange={handleChange}
                onWheel={handleScrollChange}
                value={formData.similarInstances === "" ? 1 : formData.similarInstances}
                min={1}
              />
              <div className="invalid-feedback">{errors.similarInstances}</div>
            </div>
          </div>
        </div>
      </div>

      {/* CPU, Storage, Memory */}
      <div className="row">
        <div className="col-12 col-md-6 px-4 py-2">
          <div className="row">
            <div className="col-12 col-md-6 px-3 py-2">
              <label htmlFor="cpuUtilization" className="form-label">
                CPU Utilization (%)
              </label>
              <input
                type="number"
                step="any"
                className={`form-control ${errors.cpuUtilization ? "is-invalid" : ""
                  }`}
                id="cpuUtilization"
                name="cpuUtilization"
                placeholder="Enter CPU utilization"
                onChange={handleChange}
                onWheel={handleScrollChange}
                value={formData.cpuUtilization === "" ? "" : formData.cpuUtilization}
                min={0}
              />
              <div className="invalid-feedback">{errors.cpuUtilization}</div>
            </div>

            <div className="col-12 col-md-6 px-3 py-2">
              <label htmlFor="storageVolumeGB" className="form-label">
                Storage Volume (GB)
              </label>
              <input
                type="number"
                step="any"
                className={`form-control ${errors.storageVolumeGB ? "is-invalid" : ""
                  }`}
                id="storageVolumeGB"
                name="storageVolumeGB"
                placeholder="Enter storage volume"
                onChange={handleChange}
                value={formData.storageVolumeGB === "" ? "" : formData.storageVolumeGB}
                onWheel={handleScrollChange}
                min={0}
              />
              <div className="invalid-feedback">{errors.storageVolumeGB}</div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-6 px-4 py-2">
          <label htmlFor="memoryUtilization" className="form-label">
            Memory Utilization
          </label>
          <div className="row">
            <div className="col-9">
              <input
                type="number"
                step="any"
                className={`form-control ${errors.memoryUtilization ? "is-invalid" : ""
                  }`}
                id="memoryUtilization"
                name="memoryUtilization"
                placeholder="Enter memory utilized (GB)"
                onChange={handleChange}
                onWheel={handleScrollChange}
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
                value={formData.memoryUnit || "percentage"}
              >
                <option value="percentage">%</option>
                <option value="mb">MB</option>
              </select>
              <div className="invalid-feedback">{errors.memoryUnit}</div>
            </div>
          </div>

        </div>
      </div>
      <div className="row">
        <div className="col-12 col-md-6 px-4 py-2">
          <label htmlFor="appCriticality" className="form-label">
            App criticality
          </label>
          <select className="form-select" name="appCriticality" id="appCriticality">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </div>
  );
}
