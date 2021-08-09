// Side-effect import the UI classes here to get their constructors registered for the window to use.
import "./ui/exports.js"
// Specific imports this main needs for the final setup
import { GLOBAL_COURSE_INFO_PANEL_ID, GLOBAL_COURSE_SCHEDULE_ID, GLOBAL_PROGRAM_SCHEDULE_ID } from "./Constants.js";

function main() {
    // Start observing the timetable for changes here - tell the timetable itself and the course panel if something changes
    const courseScheduleInstance = document.getElementById(GLOBAL_COURSE_SCHEDULE_ID);
    const coursePanelInstance = document.getElementById(GLOBAL_COURSE_INFO_PANEL_ID);
    const programScheduleInstance = document.getElementById(GLOBAL_PROGRAM_SCHEDULE_ID);
    
    const timetableObserver = new MutationObserver(() => {
        courseScheduleInstance.refreshCourses();
        coursePanelInstance.setContentsVisibility(false);
        programScheduleInstance.resetPrograms();
    });
    timetableObserver.observe(courseScheduleInstance, { childList: true, subtree: true });

    // This link clicks the 'New Profile' button to create a new profile for the user to use.
    document.querySelector("body > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > button").click()
    // This line clicks the radio button of the new profile that was just created.
    document.querySelector("body > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div:nth-child(3) > div > label > div:nth-child(2)").click();
}

window.addEventListener('DOMContentLoaded', main);