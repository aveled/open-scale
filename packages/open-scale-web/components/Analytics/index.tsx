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



const formatData = (
    data: Year,
    selectedMonth: number,
    selectedDay: number,
) => {
    const labels = new Set<string>();
    const formattedData: any[] = [];

    for (const month in data) {
        if (parseInt(month) !== selectedMonth) {
            continue;
        }

        for (const day in data[month]) {
            if (parseInt(day) !== selectedDay) {
                continue;
            }

            for (const hour in data[month][day]) {
                const measurements = data[month][day][hour].measurements;
                const textualMeasurements: Record<string, number> = {};
                Object.entries(measurements).forEach(([key, value]) => {
                    const label = Math.trunc(parseFloat(key) / 1000) + ' kg';
                    labels.add(label);

                    textualMeasurements[label] = value;
                });

                formattedData.push({
                    name: hour + ':00',
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

const fills  = {
    0: '#eab5b5',
    1: '#c19191',
    2: '#967272',
    3: '#5b4646',
    4: '#524141',
};

const sortedDates = (arr: string[]): string[] => {
    return arr.toSorted((a, b) => Number(a) - Number(b));
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
        const reset = () => {
            setViewData([]);
            setLabels([]);
        }

        if (!data[selectedYear]) {
            reset();
            return;
        }

        const months = Object.keys(data[selectedYear]).toSorted();
        setMonths(months);
        let month = data[selectedYear][selectedMonth] ? selectedMonth : months[0];
        month = typeof month === 'string' ? parseInt(month) : month;
        if (!month) {
            reset();
            return;
        }
        setSelectedMonth(month);

        const days = Object.keys(data[selectedYear][month as number]).toSorted();
        setDays(days);
        let day = data[selectedYear][month as number][selectedDay] ? selectedDay : days[0];
        day = typeof day === 'string' ? parseInt(day) : day;
        if (!day) {
            reset();
            return;
        }
        setSelectedDay(day);

        const {
            formattedData,
            labels,
        } = formatData(
            data[selectedYear],
            month,
            day,
        );
        setViewData(formattedData);
        setLabels(labels);
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
                    selectables={sortedDates(years)}
                    atSelect={(year) => {
                        setSelectedYear(
                            parseInt(year),
                        );
                    }}
                />

                <Dropdown
                    name={i18n[language].analyticsMonth}
                    selected={selectedMonth + ''}
                    selectables={sortedDates(months)}
                    atSelect={(month) => {
                        setSelectedMonth(
                            parseInt(month),
                        );
                    }}
                />

                <Dropdown
                    name={i18n[language].analyticsDay}
                    selected={selectedDay + ''}
                    selectables={sortedDates(days)}
                    atSelect={(day) => {
                        setSelectedDay(
                            parseInt(day),
                        );
                    }}
                />
            </div>

            {labels.length === 0 ? (
                <div>
                    {i18n[language].noData}
                </div>
            ) : (
                <div
                    className="w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] mb-8 mx-auto"
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
                                angle={-90}
                                textAnchor="end"
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
                            <Legend
                                height={80}
                                wrapperStyle={{
                                    display: 'grid',
                                    placeContent: 'flex-end center',
                                }}
                            />
                            {labels.map((label, index) => (
                                <Bar
                                    key={Math.random() + label}
                                    dataKey={label}
                                    stackId={'a'}
                                    fill={(fills as any)[index % Object.keys(fills).length]}
                                    isAnimationActive={false}
                                />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}
        </>
    );
};


export default AnalyticsDashboard;
