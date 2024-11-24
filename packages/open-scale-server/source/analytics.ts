import {
    Analytics,
    RecordEvent,
} from './data.ts';

import database, {
    coldStorage,
} from './database.ts';



export const extractCurrentEvents = (
    events: RecordEvent[],
): [RecordEvent[], RecordEvent[]] => {
    const currentEvents: RecordEvent[] = [];
    const others: RecordEvent[] = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const event of events) {
        if (event[0] < today.getTime()) {
            currentEvents.push(event);
        } else {
            others.push(event);
        }
    }

    return [
        currentEvents,
        others,
    ];
}


export const calculateAverageError = (
    events: RecordEvent[],
) => {
    let totalError = 0;

    for (const event of events) {
        totalError += event[6];
    }

    return totalError / events.length;
}


export const composeAnalytics = (
    events: RecordEvent[],
    existingAnalytics: Analytics = {},
): Analytics => {
    const analytics = { ...existingAnalytics };
    const averageError = calculateAverageError(events);

    for (const event of events) {
        const date = new Date(event[0]);
        const year = date.getFullYear();
        const month = date.getMonth();
        const day = date.getDate();
        const hour = date.getHours();

        if (!analytics[year]) {
            analytics[year] = {};
        }

        if (!analytics[year][month]) {
            analytics[year][month] = {};
        }

        if (!analytics[year][month][day]) {
            analytics[year][month][day] = {};
        }

        if (!analytics[year][month][day][hour]) {
            analytics[year][month][day][hour] = {
                measurements: {},
                averageError,
            };
        } else {
            analytics[year][month][day][hour].averageError += averageError;
            analytics[year][month][day][hour].averageError /= 2;
        }

        if (!analytics[year][month][day][hour].measurements[event[3]]) {
            analytics[year][month][day][hour].measurements[event[3]] = 0;
        }

        analytics[year][month][day][hour].measurements[event[3]] += 1;
    }

    return analytics;
}


export const updateAnalytics = async () => {
    await database.read();
    await coldStorage.read();

    const events = database.data.events;
    const [currentEvents, others] = extractCurrentEvents(events);

    const existingAnalytics = database.data.analytics;
    const analytics = composeAnalytics(currentEvents, existingAnalytics);

    await database.update(db => {
        db.events = others;
        db.analytics = analytics;
    });

    for (const event of currentEvents) {
        await coldStorage.update(db => {
            db.events.push(event);
        });
    }
}
