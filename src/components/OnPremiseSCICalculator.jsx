// import { useRef,useEffect, useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';
// import ResultCard from './ResultCard';
// import '../styles/OnPremiseSCICalculator.css';

// // Validation schema
// const schema = yup.object().shape({
//     country: yup.string().required('Country is required'),
//     processName: yup.string().required('Process name is required'),
//     duration: yup
//         .number()
//         .typeError('Duration must be a number')
//         .positive('Duration must be positive')
//         .integer('Duration must be an integer')
//         .required('Duration is required'),
// });

// export default function CalculatorForm() {
//     const refToScroll = useRef(null);
//     const [showResult, setShowResult] = useState(false);
//     const [countries, setCountries] = useState([]);
//     const [loading, setLoading] = useState(true);

//     // React Hook Form setup
//     const { register, handleSubmit, formState: { errors } } = useForm({
//         resolver: yupResolver(schema),
//     });

//     useEffect(() => {
//         const fetchCountries = async () => {
//             try {
//                 // const response = await getCountries(); //  fetching countries from API '/utils/api.js'
//                 const sortedCountries = response.data.sort((a, b) =>
//                     a.name.common.localeCompare(b.name.common)
//                 );
//                 setCountries(sortedCountries);
//                 setLoading(false);
//             } catch (error) {
//                 console.error('Error fetching countries:', error);
//             }
//         };
//         fetchCountries();
//     }, []);

//     const onSubmit = (data) => {
//         console.log('Form Data:', data);

//         setShowResult(true);
//         setTimeout(() => {
//             if (refToScroll.current) {
//                 const offset = 80;
//                 const y = refToScroll.current.getBoundingClientRect().top + window.pageYOffset - offset;

//                 window.scrollTo({ top: y, behavior: 'smooth' });
//             }
//         }, 0); 

//     };


//     return (
//         <form
//             className="container onpremise-form shadow pb-3 pt-5 mb-5 bg-white rounded mt-4"
//             style={{ padding: '0 4rem' }}
//             onSubmit={handleSubmit(onSubmit)}
//             noValidate
//         >
//             <h3 className="mb-4 text-center" style={{ color: "#0070ad", fontWeight: '600' }}>On-Premise SCI Calculator</h3>
//             { /* Country Selection */}
//             <div className="mb-3">
//                 <label htmlFor="country" className="form-label">
//                     Country
//                 </label>
//                 <select
//                     className={`form-select ${errors.country ? 'is-invalid' : ''}`}
//                     id="country"
//                     {...register('country')}
//                     disabled={loading}
//                 >
//                     <option value="">Select country</option>
//                     {loading ?
//                         (
//                             <option disabled>Loading countries...</option>
//                         ) :
//                         (
//                             countries.map((country) => (
//                                 <option key={country.cca2} value={country.cca2}>
//                                     {country.name.common}
//                                 </option>
//                             ))
//                         )
//                     }
//                 </select>
//                 {errors.country && (
//                     <div className="invalid-feedback">{errors.country.message}</div>
//                 )}
//             </div>

//             {/* Process Name */}
//             <div className="mb-3">
//                 <label htmlFor="processName" className="form-label">
//                     Process Name
//                 </label>
//                 <input
//                     type="text"
//                     className={`form-control ${errors.processName ? 'is-invalid' : ''}`}
//                     id="processName"
//                     placeholder="Enter process name"
//                     {...register('processName')}
//                 />
//                 {errors.processName && (
//                     <div className="invalid-feedback">{errors.processName.message}</div>
//                 )}
//             </div>

//             {/* Duration */}
//             <div className="mb-3">
//                 <label htmlFor="duration" className="form-label">
//                     Duration (minutes)
//                 </label>
//                 <input
//                     type="number"
//                     className={`form-control ${errors.duration ? 'is-invalid' : ''}`}
//                     id="duration"
//                     placeholder="Enter duration"
//                     {...register('duration')}
//                 />
//                 {errors.duration && (
//                     <div className="invalid-feedback">{errors.duration.message}</div>
//                 )}
//             </div>

//             <div className="text-center">
//                 <button type="submit" className="btn btn-primary" disabled={loading}>
//                     Start Monitoring
//                 </button>
//             </div>

//             {/* <Loader /> */}
//             {/* Result */}
//             <div ref={refToScroll}>
//                 {showResult && (
//                     <ResultCard
//                         sci="84.522694"
//                         energy="0.202892"
//                         operational="84.353363"
//                         embodied="0.1693303"
//                     />
//                 )}
//             </div>



//         </form>


//     );
// }  