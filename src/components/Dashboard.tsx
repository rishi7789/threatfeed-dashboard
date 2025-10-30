import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {

    // defining type for json api
    type ThreatData = {
        summary: {
            emails_scanned: number;
            threats_detected: number;
            quarantined_items: number;
        };
        threats: {
            id: string;
            timestamp: string;
            type: "Phishing" | "Malware" | "Spam";
            status: string;
            risk_score: number;
            details: {
                subject: string;
                sender: string;
            };
        }[];
    };

    const [data, setData] = useState<ThreatData | null>(null);
    const [filter, setFilter] = useState<string>("All");

    //json api call
    useEffect(() => {
        const getData = async () => {
            try {
                const response = await axios.get<ThreatData>('/src/api/mockData.json');

                const result = response.data;
                result.threats.sort((a, b) => b.risk_score - a.risk_score);
                setData(result);

            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        getData();
    }, []);


    const formatDate = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };


    const getRisk = (score: number) => {
        if (score >= 90) return { text: "Critical", color: "bg-red-600" };
        if (score >= 70) return { text: "High", color: "bg-orange-500" };
        if (score >= 40) return { text: "Medium", color: "bg-yellow-400" };
        return { text: "Low", color: "bg-green-500" };
    };

    const getType = (type: string) => {
        if (type === "Phishing") return { text: "Phishing", color: "text-blue-500" };
        if (type === "Malware") return { text: "Malware", color: "text-red-600" };
        return { text: "Spam", color: "text-yellow-500" };
    };

    //filtering based on threat type
    const filtered =
        filter === "All"
            ? data?.threats
            : data?.threats.filter((t) => t.type === filter);

    return (
        <div className="p-4 max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-4">
                Threat Feed Dashboard
            </h1>


            {/* summary list */}
            {data && (
                <div className="flex flex-wrap gap-8 justify-center items-center mb-6 mt-10">
                    <div className="bg-blue-400 p-4 rounded text-center text-white font-bold">
                        <p >Emails Scanned</p>
                        <p >{data.summary.emails_scanned}</p>
                    </div>
                    <div className="bg-red-600 p-4 rounded text-center text-white font-bold">
                        <p >Threats Detected</p>
                        <p >{data.summary.threats_detected}</p>
                    </div>
                    <div className="bg-orange-500 p-4 rounded text-center text-white font-bold">
                        <p >Quarantined Items</p>
                        <p >{data.summary.quarantined_items}</p>
                    </div>
                </div>
            )}

            {/* threat list */}
            <div className="flex justify-center gap-2 mb-4 flex-wrap">
                {["All", "Phishing", "Malware", "Spam"].map((t, index) => (
                    <button
                        key={index}
                        onClick={() => setFilter(t)}
                        className={`px-4 py-2 rounded font-semibold text-sm ${filter === t
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 hover:bg-gray-300"
                            }`}
                    >
                        {t}
                    </button>
                ))}
            </div>


            <div className="flex flex-col gap-3" >
                {filtered?.map((threat, index) => {
                    const risk = getRisk(threat.risk_score);
                    const type = getType(threat.type);
                    return (
                        <div
                            key={index}
                            onClick={() => console.log("Threat ID:", threat.id)}
                            className="bg-white p-4 rounded shadow hover:bg-gray-100 flex flex-col  sm:flex-row  justify-between cursor-pointer"
                        >
                            <div>
                                <p className="font-semibold">{threat.details.subject}</p>
                                <p className="text-sm text-gray-600">{threat.details.sender}</p>
                                <p className="text-xs text-gray-400">{formatDate(threat.timestamp)}</p>
                            </div>
                            <div className="flex flex-col sm:items-end mt-3 sm:mt-0 ">
                                <span
                                    className={`text-xs text-white font-semibold px-2 py-1 sm:w-auto rounded-full ${risk.color}`}
                                >
                                    {risk.text} ({threat.risk_score})
                                </span>
                                <span className={`text-sm font-bold ${type.color} mt-1 `}>{threat.type}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Dashboard;
