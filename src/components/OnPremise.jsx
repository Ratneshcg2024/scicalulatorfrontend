// import Box from "@mui/material/Box";
// import Tab from "@mui/material/Tab";
// import Tabs from "@mui/material/Tabs";
// import UploadFile from "./UploadFile";
// import CalculatorForm from "../components/OnPremiseSCICalculator";
// import { useState } from "react";
// import '../styles/UploadFile.css';

// export default function OnPremise() {
//   const [tab, setTab] = useState(0);

//   const handleTabs = (event, newValue) => {
//     setTab(newValue);
//     console.log("Tab changed to:", newValue);
//   };

//   return (
//     <Box>
//       <Box className="tab-box px-sm-5">
//         <Tabs
//           value={tab}
//           onChange={handleTabs}
//           slotProps={{
//             indicator: {
//               sx: {
//                 backgroundColor: "#030304ff",
//                 height: 2,
//                 transition: "all 0.3s ease",
//               },
//             },
//           }}
//         >
//           <Tab
//             label="Upload File"
//             sx={{
//               backgroundColor: tab === 0 ? "white" : "#f1f5f9",
//               color: "#727986",
//               border: tab === 0 ? "2px solid #f1f5f9" : "none",
//               fontWeight: "bold",
//               "&.Mui-selected": {
//                 color: "black",
//               },
//             }}
//           />

//           <Tab
//             label="SCI Calculator"
//             sx={{
//               backgroundColor: tab === 1 ? "white" : "#f1f5f9",
//               color: "#727986",
//               border: tab === 1 ? "2px solid #f1f5f9" : "none",
//               fontWeight: "bold",
//               "&.Mui-selected": {
//                 color: "black",
//               },
//             }}
//             disabled
//           />

//         </Tabs>
//       </Box>
//       <Box >
//         {tab === 0 && <UploadFile />}
//         {tab === 1 && <CalculatorForm />}
//       </Box>
//     </Box>
//   );
// }
