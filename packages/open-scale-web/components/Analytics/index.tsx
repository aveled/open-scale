import React, { useState } from 'react';

import {
    Analytics,
} from '@/data/index';



const AnalyticsDashboard = ({ data = {} }: {
    data: Analytics,
}) => {
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedMonth, setSelectedMonth] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);

    const years = Object.keys(data || {}).sort();

    return (
        <div>
            {years}
        </div>
    );
};


export default AnalyticsDashboard;
