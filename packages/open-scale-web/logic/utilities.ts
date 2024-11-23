import {
    ScaleSettings,
    TextualScaleSettings,

    fastFeedSpeedValues,
    slowFeedSpeedValues,
    fastSlowPercentageValues,
    errorPercentageValues,
    restingTimeValues,
    defaultScaleSettings,
} from '@/data/index';



export const styleTrim = (
    style: string,
) => {
    return style
        .replace(/\s+|\n/g, ' ')
        .trim();
}


export const mapSettingsValuesToTextual = (
    settings: ScaleSettings,
) => {
    const textualValues: TextualScaleSettings = {
        ...defaultScaleSettings,
    };

    for (const [key, value] of Object.entries(fastFeedSpeedValues)) {
        if (value === settings.fastFeedSpeed) {
            textualValues.fastFeedSpeed = key as keyof typeof fastFeedSpeedValues;
            break;
        }
    }

    for (const [key, value] of Object.entries(slowFeedSpeedValues)) {
        if (value === settings.slowFeedSpeed) {
            textualValues.slowFeedSpeed = key as keyof typeof slowFeedSpeedValues;
            break;
        }
    }

    for (const [key, value] of Object.entries(fastSlowPercentageValues)) {
        if (value === settings.fastSlowPercentage) {
            textualValues.fastSlowPercentage = key as keyof typeof fastSlowPercentageValues;
            break;
        }
    }

    for (const [key, value] of Object.entries(errorPercentageValues)) {
        if (value === settings.errorPercentage) {
            textualValues.errorPercentage = key as keyof typeof errorPercentageValues;
            break;
        }
    }

    for (const [key, value] of Object.entries(restingTimeValues)) {
        if (value === settings.restingTime) {
            textualValues.restingTime = key as keyof typeof restingTimeValues;
            break;
        }
    }

    return textualValues;
}
