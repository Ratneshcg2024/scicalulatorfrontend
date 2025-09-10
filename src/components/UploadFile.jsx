import { FiUpload } from "react-icons/fi";
import '../styles/UploadFile.css';
import Loader from "./Loader"; // Adjust path if needed
import { useState } from "react";
export default function UploadFile() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [resultData, setResultData] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [excelUrl, setExcelUrl] = useState(null);
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);


    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true); // Start loader
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
        //const response = await fetch("http://localhost:5153/api/ExcelSCI/upload-multi-app", {
        const response = await fetch("https://scicalculatorbackend.azurewebsites.net/api/ExcelSCI/upload-multi-app", {
        method: "POST",
        body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const data = await response.json();
        const url = data.downloadUrl;
        setExcelUrl(url);

        // Extract filename from URL
        const urlParts = url.split('/');
        const nameFromUrl = urlParts[urlParts.length - 1];
        setFileName(nameFromUrl);
    } catch (error) {
        console.error("Error uploading file:", error);
    }finally {
        setLoading(false); // Stop loader 
    }      
    };

    return (
       <>
        <div className="container upload-box mb-sm-5 mb-md-5 shadow px-md-5 py-3 bg-white rounded mt-4">
            <div className="row">
                <div className="col-12 py-2 d-flex justify-content-start align-items-center">
                    <FiUpload style={{ marginRight: "5px", padding: "0" }} />
                    <span className="d-block fw-semibold">Upload Excel File</span>
                </div>
            </div>
            <div className="row">   
                <div className="col-12">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-12 py-2">
                                <input className="form-control" type="file" id="formFile" accept=".xls,.xlsx" onChange={handleFileChange} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-4 py-2 ms-auto">
                                {/* <button className="btn btn-primary float-end">Submit</button> */}
                                
<button className="btn btn-primary float-end" disabled={loading}>
        {loading ? <Loader /> : "Submit"}
    </button>

                            </div>
                        </div>
                    </form>
                </div>
            </div >
        </div >
         {excelUrl && (
                <div className="container mt-4">
                    <div className="alert alert-success">
                        Your SCI score is calculated.{" "}
                        <a href={excelUrl} download={fileName}>Click here to download the result</a>

                    </div>
                </div>
            )}
    </> 
    );
}