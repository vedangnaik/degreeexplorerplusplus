// Global HTML IDs for these 'singleton' classes.
export const GLOBAL_COURSE_SCHEDULE_ID = "GLOBAL_COURSE_SCHEDULE_ID";
export const GLOBAL_PROGRAM_SCHEDULE_ID = "GLOBAL_PROGRAM_SCHEDULE_ID";
export const GLOBAL_COURSE_INFO_PANEL_ID = "GLOBAL_COURSE_INFO_PANEL_ID";

// Colors for coloring the UI of prerequisites and requirements based on their status.
export const COMPLETE_COLOR = "lightgreen";
export const INCOMPLETE_COLOR = "salmon";
export const UNVERIFIABLE_COLOR = "lightyellow";
export const DELETE_COLOR = "red";
export const NOT_USED_COLOR = "lightgrey";
export const UNIMPLEMENTED_BACKGROUND = "repeating-linear-gradient(135deg, #000000ab 0% 10%, #d7a21996 10% 20%)"
// Eye-candy emojis for the same ;)
export const COMPLETE_SYMBOL = '✔️';
export const INCOMPLETE_SYMBOL = '❌';
export const UNVERIFIABLE_SYMBOL = '⚠️';
export const NOT_USED_SYMBOL = '🚫';
export const NOTE_SYMBOL = '📝';
export const DELETE_SYMBOL = '✖';
export const UNIMPLEMENTED_SYMBOL = '🚧'

// Color for courses and programs which are non-evaluated.
export const NOT_EVALUATED_COLOR = "lightblue";

// Global 'ENUM' for the various statuses that requirements, etc. can have. 
export const STATUSES = Object.freeze({
    "COMPLETE": Symbol("COMPLETE"),
    "INCOMPLETE": Symbol("INCOMPLETE"),
    "NA": Symbol("NA"),
    "UNVERIFIABLE": Symbol("UNVERIFIABLE"),
    "NOTE": Symbol("NOTE"),
    "UNIMPLEMENTED": Symbol("UNIMPLEMENTED")
});

// This is a generic empty profile file structure created here to back up new profiles. It is not connected to the actual classes like timetable in any way. This is to keep everything as separated as possible
export const NEW_PROFILE_JSON = {
    "name": "New Profile", // The name of the profile, displayed in the left bar. This does not need to be unique, it's just an identifier
    "programs": [],
    "courses": { // For now, the empty timetable structure that has evolved
        "anchorSemester": "Fall/Winter",
        "anchorYear": new Date().getFullYear(),
        "numSemesters": 4,
        "scheduledCourses": {}
    }
}

// export const NEW_PROFILE_JSON = {"name":"My Courses","programs":["ASSPE1689","ASSPE1545"],"courses":{"anchorSemester":"Fall/Winter","anchorYear":2019,"numSemesters":6,"scheduledCourses":{"CSC343H1":{"x":1,"y":2},"CSC369H1":{"x":1,"y":3},"CSC309H1":{"x":2,"y":2},"CSC458H1":{"x":2,"y":3},"CSC301H1":{"x":3,"y":3},"CSC373H1":{"x":4,"y":2},"CSC367H1":{"x":4,"y":3},"CSC324H1":{"x":5,"y":2},"CSC336H1":{"x":5,"y":3},"MAT237Y1":{"x":1,"y":7},"CSC209H1":{"x":2,"y":6},"CSC207H1":{"x":2,"y":7},"CSC258H1":{"x":3,"y":6},"CSC236H1":{"x":3,"y":7},"CSC263H1":{"x":4,"y":6},"GGR101H1":{"x":4,"y":7},"STA247H1":{"x":5,"y":7},"PHL100Y1":{"x":1,"y":11},"MAT137Y1":{"x":2,"y":11},"CSC148H1":{"x":3,"y":10},"CSC108H1":{"x":3,"y":11},"CSC165H1":{"x":4,"y":10},"MAT223H1":{"x":4,"y":11},"MAT224H1":{"x":5,"y":10},"PHY131H1":{"x":5,"y":11}}}}