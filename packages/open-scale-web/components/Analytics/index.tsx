import React, {
    useState,
    useEffect,
} from 'react';

import {
    BarChart, Bar,
    XAxis, YAxis,
    Tooltip, Legend,
    ResponsiveContainer,
} from 'recharts';

import {
    Analytics,
} from '@/data/index';



const formatData = (data: Analytics) => {
    const labels = new Set<string>();
    const formattedData: any[] = [];

    for (const year in data) {
        for (const month in data[year]) {
            for (const day in data[year][month]) {
                for (const hour in data[year][month][day]) {
                    const measurements = data[year][month][day][hour].measurements;
                    const textualMeasurements: Record<string, number> = {};
                    Object.entries(measurements).forEach(([key, value]) => {
                        const label = parseFloat(key) / 1000 + ' kg';
                        labels.add(label);

                        textualMeasurements[label] = value;
                    });

                    formattedData.push({
                        name: `${day}/${month}/${year}`,
                        ...textualMeasurements,
                    });
                }
            }
        }
    }

    return {
        formattedData,
        labels: Array.from(labels).toSorted(),
    };
}


const AnalyticsDashboard = ({
    data,
 }: {
    data: Analytics,
}) => {
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const years = Object.keys(data || {}).sort();

    const [viewData, setViewData] = useState<any[]>([]);
    const [labels, setLabels] = useState<string[]>([]);


    useEffect(() => {
        // if (selectedYear !== null && selectedMonth !== null && selectedDay !== null) {
        //     const {
        //         formattedData,
        //         labels,
        //     } = formatData(data[selectedYear][selectedMonth][selectedDay]);

        //     setViewData(formattedData);
        //     setLabels(labels);
        // }

        const {
            formattedData,
            labels,
        } = formatData(data);

        setViewData(formattedData);
        setLabels(labels);
    }, [
        data,
    ]);


    return (
        <div
            style={{
                width: '400px',
                height: '400px',
            }}
        >
            <ResponsiveContainer
                width="100%" height="100%"
            >
                <BarChart
                    width={500}
                    height={300}
                    data={viewData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <XAxis
                        dataKey="name"
                    />
                    <YAxis
                        allowDecimals={false}
                    />
                    <Tooltip />
                    <Legend />
                    {labels.map((label) => (
                        <Bar
                            key={Math.random() + label}
                            dataKey={label} stackId="a" fill="#8884d8"
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


export default AnalyticsDashboard;
