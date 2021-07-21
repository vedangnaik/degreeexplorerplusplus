export const GLOBAL_COURSE_SCHEDULE_ID = "GLOBAL_COURSE_SCHEDULE_ID";
export const GLOBAL_PROGRAM_SCHEDULE_ID = "GLOBAL_PROGRAM_SCHEDULE_ID";
export const GLOBAL_COURSE_INFO_PANEL_ID = "GLOBAL_COURSE_INFO_PANEL_IDID";

export const COMPLETE_COLOR = "lightgreen";
export const INCOMPLETE_COLOR = "#ff8080";
export const WARNING_COLOR = "lightyellow";
export const DELETE_COLOR = "#ff4d4d";
export const NOT_USED_COLOR = "lightgrey";

export const COMPELTE_SYMBOL = '✔️';
export const INCOMPELTE_SYMBOL = '❌';
export const WARNING_SYMBOL = '⚠️';
export const NOT_USED_SYMBOL = '🚫';
export const NOTE_SYMBOL = '📝';
export const DELETE_SYMBOL = '✖';

export const STATUSES = Object.freeze({
    COMPLETE: Symbol("COMPLETE"),
    INCOMPLETE: Symbol("INCOMPLETE"),
    NA: Symbol("NA"),
    WARNING: Symbol("WARNING"),
    NOTE: Symbol("NOTE")
});

// This is a generic empty profile file structure created here to back up new profiles. It is not connected to the actual classes like timetable in any way. This is to keep everything as separated as possible
export const NEW_PROFILE_JSON = {
    "name": "New Profile", // The name of the profile, displayed in the left bar. This does not need to be unique, it's just an identifier
    "programs": ["ASSPE1689"], // TODO: Remove this program
    "courses": { // For now, the empty timetable structure that has evolved
        "anchorSemester": "Fall/Winter",
        "anchorYear": new Date().getFullYear(),
        "numSemesters": 4,
        "scheduledCourses": {}
    }
}


