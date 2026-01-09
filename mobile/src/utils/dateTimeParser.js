/**
 * Parses date (YYYY-MM-DD) and time (HH:MM AM/PM) into a valid ISO string.
 * Handles React Native/Hermes limitations with Date.parse strings.
 */
export const parseDateTimeToIso = (dateStr, timeStr) => {
    try {
        if (!dateStr || !timeStr) return null;

        // Parse Date "YYYY-MM-DD"
        const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));

        // Parse Time "HH:MM AM/PM"
        const [timePart, modifier] = timeStr.split(' ');
        let [hours, minutes] = timePart.split(':').map(num => parseInt(num, 10));

        if (hours === 12) {
            hours = 0;
        }
        if (modifier === 'PM') {
            hours = hours + 12;
        }

        // Construct Date object (Month is 0-indexed)
        const dateObj = new Date(year, month - 1, day, hours, minutes, 0);
        return dateObj.toISOString();
    } catch (e) {
        console.error("Date Parsing Error:", e);
        return null;
    }
};
