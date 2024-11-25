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
    Year,
} from '@/data/index';

import {
    Language,
    i18n,
} from '@/data/language';

import Dropdown from '@/components/Dropdown';



const formatData = (data: Year, year: string) => {
    const labels = new Set<string>();
    const formattedData: any[] = [];

    for (const month in data) {
        for (const day in data[month]) {
            for (const hour in data[month][day]) {
                const measurements = data[month][day][hour].measurements;
                const textualMeasurements: Record<string, number> = {};
                Object.entries(measurements).forEach(([key, value]) => {
                    const label = parseFloat(key) / 1000 + ' kg';
                    labels.add(label);

                    textualMeasurements[label] = value;
                });

                formattedData.push({
                    name: `${day}/${month}/${year} - ${hour}`,
                    ...textualMeasurements,
                });
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
    language,
 }: {
    data: Analytics,
    language: Language,
}) => {
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth()));
    const [selectedDay, setSelectedDay] = useState(new Date().getDate());

    const [years, setYears] = useState<string[]>(
        Object.keys(data).toSorted(),
    );
    const [months, setMonths] = useState<string[]>([]);
    const [days, setDays] = useState<string[]>([]);

    const [viewData, setViewData] = useState<any[]>([]);
    const [labels, setLabels] = useState<string[]>([]);


    useEffect(() => {
        setYears(Object.keys(data).toSorted());
    }, [
        data,
    ]);

    useEffect(() => {
        if (!data[selectedYear]) {
            return;
        }

        const {
            formattedData,
            labels,
        } = formatData(data[selectedYear], selectedYear + '');

        setViewData(formattedData);
        setLabels(labels);

        const months = Object.keys(data[selectedYear]).toSorted();
        setMonths(months);

        const month = data[selectedYear][selectedMonth] ? selectedMonth : months[0];
        if (month) {
            const days = Object.keys(data[selectedYear][month as number]).toSorted();
            setDays(days);

            const day = data[selectedYear][month as number][selectedDay] ? selectedDay : days[0];
            if (day) {
                setSelectedDay(day as number);
            }
        }
    }, [
        data,
        selectedYear,
        selectedMonth,
        selectedDay,
    ]);


    return (
        <>
            <div>
                <Dropdown
                    name={i18n[language].analyticsYear}
                    selected={selectedYear + ''}
                    selectables={years}
                    atSelect={(year) => {
                        setSelectedYear(
                            parseInt(year),
                        );
                    }}
                />

                <Dropdown
                    name={i18n[language].analyticsMonth}
                    selected={selectedMonth + ''}
                    selectables={months}
                    atSelect={(month) => {
                        setSelectedMonth(
                            parseInt(month),
                        );
                    }}
                />

                <Dropdown
                    name={i18n[language].analyticsDay}
                    selected={selectedDay + ''}
                    selectables={days}
                    atSelect={(day) => {
                        setSelectedDay(
                            parseInt(day),
                        );
                    }}
                />
            </div>

            <div
                className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] mb-8"
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
                        <Tooltip
                            contentStyle={{
                                background: 'black',
                            }}
                            cursor={{
                                fill: 'transparent',
                            }}
                        />
                        <Legend />
                        {labels.map((label) => (
                            <Bar
                                key={Math.random() + label}
                                dataKey={label}
                                stackId="a"
                                fill="#eab5b5"
                                isAnimationActive={false}
                            />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
};


export default AnalyticsDashboard;
