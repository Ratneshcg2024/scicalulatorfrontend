import { useState } from "react";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import CloudSCICalculator from "../components/CloudSCICalculator";
import UploadFile from "../components/UploadFile";

export default function Home() {
  const [showTab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <div className="container shadow rounded p-3 bg-white" style={{ marginTop: "5rem", marginBottom: "2.5rem" }}>

      <div className="row">
        <div className="col-12">
          <h1>SCI Calculator</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Box>
            <Box>
              <Tabs
                value={showTab}
                onChange={handleChange}
                slotProps={{
                  indicator: {
                    sx: {
                      backgroundColor: "#030304ff",
                      height: 2,
                      transition: "all 0.3s ease"
                    },
                  },
                }}
              >
                <Tab
                  sx={{
                    textTransform: "capitalize",
                    backgroundColor: showTab === 0 ? "white" : "#f1f5f9",
                    color: "#727986",
                    border: showTab === 0 ? "2px solid #f1f5f9" : "none",
                    fontWeight: "bold",
                    "&.Mui-selected": {
                      color: "black",
                    },
                  }}
                  label="Input Data" />
                <Tab
                  sx={{
                    textTransform: "capitalize",
                    backgroundColor: showTab === 1 ? "white" : "#f1f5f9",
                    color: "#727986",
                    border: showTab === 1 ? "2px solid #f1f5f9" : "none",
                    fontWeight: "bold",
                    "&.Mui-selected": {
                      color: "black",
                    },
                  }}
                  label="Upload File" />
              </Tabs>
            </Box>

            <Box sx={{ mt: 3 }}>
              {showTab === 0 && <CloudSCICalculator />}
              {showTab === 1 && <UploadFile />}
              {/* {showTab === 1 && <NewUpload />} */}
            </Box>

          </Box>
        </div>
      </div>


    </div>

  );
}
