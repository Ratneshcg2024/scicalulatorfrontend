import ee from '../assets/embodied_emissions.png';
import oe from '../assets/operational_emissions.png';
import ec from '../assets/energy_consumed.png';
import sciImg from '../assets/sci_score.png';
import CountUp from 'react-countup';
import { useEffect, useRef } from 'react';
import '../styles/ResultCard.css';

export default function SCIResultCard({ sci, energy, operational, embodied, showResult }) {
    const resultCard = useRef(null);
    const safeValue = (val) => (val !== undefined && val !== null ? Number(val) : 0);

    useEffect(() => {
        if (showResult && resultCard.current) {
            const yOffset = -55; // adjust this to your header height
            const y = resultCard.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: "smooth" });
        }
    }, [showResult]);

    return (
        <div ref={resultCard} className="container-fluid p-4 mt-3 border">
            <div className="row p-2">
                <div className="col-md-5 offset-md-1 upper-card-box">
                    <div className="card-box px-5 py-4 flex-fill">
                        <img src={oe} alt="operational_emissions_image" />
                        <p style={{ margin: 0 }}>
                            <span className="score_value">
                                <CountUp
                                    start={0.0}
                                    end={safeValue(operational)}
                                    duration={2}
                                    decimals={6}
                                    decimal="."
                                />
                            </span>
                            <span className="ms-1 score_unit">gCO2e</span>
                        </p>
                        <p>Operational Emissions (O)</p>
                    </div>
                </div>

                <div className="col-md-5 upper-card-box">
                    <div className="card-box px-5 py-4 shadow flex-fill">
                        <img src={ec} alt="energy_consumed_image" />
                        <p style={{ margin: 0 }}>
                            <span className="score_value">
                                <CountUp
                                    start={0.0}
                                    end={safeValue(energy)}
                                    duration={2}
                                    decimals={6}
                                    decimal="."
                                />
                            </span>
                            <span className="ms-1 score_unit">kWh</span>
                        </p>
                        <p>Energy Consumed (E)</p>
                    </div>
                </div>
            </div>

            <div className="row p-2">
                <div className="col-md-5 offset-md-1 upper-card-box">
                    <div className="card-box px-5 py-4 shadow flex-fill">
                        <img src={ee} alt="embodied_emissions_image" style={{ width: '3rem' }} />
                        <p style={{ margin: 0 }}>
                            <span className="score_value">
                                <CountUp
                                    start={0.0}
                                    end={safeValue(embodied)}
                                    duration={2}
                                    decimals={6}
                                    decimal="."
                                />
                            </span>
                            <span className="ms-1 score_unit">gCO2e</span>
                        </p>
                        <p>Embodied Emissions (M)</p>
                    </div>
                </div>

                <div className="col-md-5 upper-card-box">
                    <div className="card-box px-5 py-4 flex-fill">
                        <img src={sciImg} alt="sci_score_image" style={{ width: '3rem', margin: '0.49rem 0' }} />
                        <p style={{ margin: 0 }}>
                            <span className="score_value">
                                <CountUp
                                    start={0.0}
                                    end={safeValue(sci)}
                                    duration={2}
                                    decimals={8}
                                    decimal="."
                                />
                            </span>
                            <span className="ms-1 score_unit">per execution in 1hr</span>
                        </p>
                        <p>SCI</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
