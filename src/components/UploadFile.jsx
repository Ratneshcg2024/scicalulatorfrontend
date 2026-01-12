import { useState } from 'react';
import FileIcon from '../assets/excel_icon.png';
import '../styles/UploadFile.css';
import { FaTrash, FaExclamationCircle } from "react-icons/fa";
import Loader from "./Loader"; // Your loader component
import { uploadMultiApp } from '../api/cloud';
import { FaFileExcel } from "react-icons/fa";


export default function UploadFile() {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [excelUrl, setExcelUrl] = useState(null);
    const [fileName, setFileName] = useState("");

    // Validate file type
    const fileCheck = (file) => {
        if (
            file &&
            ![
                "application/vnd.ms-excel",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            ].includes(file.type)
        ) {
            setError("Invalid file type! Please upload an Excel file (.xls or .xlsx).");
            setFile(null);
            return;
        }
        setFile(file);
        setError("");
    };

    const handleChange = (e) => {
        const selected = e.target.files[0];
        fileCheck(selected);
        e.target.value = "";
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files[0];
        fileCheck(dropped);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError("No file selected. Please choose a file to upload before submitting!");
            return;
        }

        setError("");
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await uploadMultiApp(formData); // call from cloud.js

            const url = res.data.downloadUrl;
            setExcelUrl(url);

            // Extract filename from URL
            const urlParts = url.split("/");
            setFileName(urlParts[urlParts.length - 1]);
        } catch (err) {
            console.error(err);
            setError("Upload failed. Try again!");
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () =>{
        window.open("/SCI_Inputs_Template.xlsx", "_blank");
    }
    return (
        <div className="container shadow rounded p-3">
            <div className="row">
                <div className="col-12 ms-auto p-3">
                    <button className='btn d-block ms-auto download-btn' onClick={downloadTemplate}>
                        <FaFileExcel style={{ verticalAlign: "middle" }} /> Download Template
                    </button>
                </div>
            </div>
            <form onSubmit={handleSubmit}>
                <div
                    className="upload-box col-12"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <img
                        src={FileIcon}
                        alt="file"
                        style={{ width: "5rem", marginRight: "1rem", marginBottom: "1rem" }}
                    />
                    <p style={{ color: "#4f586b", fontWeight: 600, margin: "0", textAlign: "center" }}>
                        Drag your Excel file here to upload
                    </p>

                    <div className="d-flex align-items-center my-3" style={{ width: "20%" }}>
                        <hr className="flex-grow-1" />
                        <span className="px-2 text-muted">OR</span>
                        <hr className="flex-grow-1" />
                    </div>

                    <label
                        htmlFor="file"
                        className="btn"
                        style={{ backgroundColor: "#4354f8", color: "white", fontWeight: "600" }}
                    >
                        Browse files
                        <input
                            id="file"
                            type="file"
                            hidden
                            accept=".xls,.xlsx"
                            onChange={handleChange}
                        />
                    </label>

                    {file && (
                        <div className="file-name rounded shadow p-2 mt-2">
                            {file.name}
                            <span
                                onClick={() => {
                                    setFile(null);
                                    setExcelUrl(null);
                                    setFileName("");
                                }}
                                style={{ color: "red", marginLeft: "1.5rem", cursor: "pointer" }}
                            >
                                <FaTrash />
                            </span>

                        </div>
                    )}
                </div>

                {error && (
                    <div className="alert alert-danger mt-3">
                        <FaExclamationCircle size={20} style={{ marginRight: "0.5rem" }} />
                        {error}
                    </div>
                )}

                <div className="text-end mt-3">
                    <button
                        type="submit"
                        className="btn"
                        style={{
                            backgroundColor: "rgb(67, 84, 248)",
                            color: "white",
                            fontWeight: "bold",
                            padding: "0.5rem 2rem",
                            pointerEvents: loading ? "none" : "auto" // disable clicks without dimming
                        }}
                    >
                        {loading ? <><Loader color="white" /> Processing..</> : "Upload"}
                    </button>

                </div>
            </form>

            {excelUrl && (
                <div className="alert alert-success mt-3">
                    Upload successful!{" "}
                    <a href={excelUrl} download={fileName}>
                        Click here to download the result
                    </a>
                </div>
            )}
        </div>
    );
}
