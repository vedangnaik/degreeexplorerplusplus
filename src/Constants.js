export const GlobalCourseScheduleID = "GlobalCourseScheduleID";

export const GlobalProgramScheduleID = "GlobalProgramScheduleID";

export const GlobalCourseInfoPanelID = "GlobalCourseInfoPanelID";

// This is a generic empty profile file structure created here to back up new profiles. It is not connected to the actual classes like timetable in any way. This is to keep everything as separated as possible
export const NewProfileJSON = {
    "name": "New Profile", // The name of the profile, displayed in the left bar. This does not need to be unique, it's just an identifier
    "programs": ["ASSPE1689"], // TODO: Remove this program
    "courses": { // For now, the empty timetable structure that has evolved
        "anchorSemester": "Fall/Winter",
        "anchorYear": new Date().getFullYear(),
        "numSemesters": 4,
        "scheduledCourses": {}
    }
}


