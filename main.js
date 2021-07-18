// Side-effect imports, to get all the constructors and stuff into this file.
import "./src/Constants.js";
import "./src/CourseSchedule.js";
import "./src/CourseInfoPanel.js";
import "./src/CourseTile.js";
import "./src/CourseScratchpad.js";
import "./src/ProgramInfoCollapsible.js";
import "./src/ProfileSerializer.js";
import "./src/ProfileControls.js";
import "./src/Spacer.js";

import "./resources/CourseData.js"
import "./resources/ProgramData.js"

// Specific imports this main needs
import { GlobalCourseInfoPanelID, GlobalCourseScheduleID } from "./src/Constants.js";
import { ProgramInfoCollapsible } from "./src/ProgramInfoCollapsible.js";

function main() {
    // TODO: Remove, only for testing
    document.querySelector("body > div:nth-child(2) > div:nth-child(3)").appendChild(new ProgramInfoCollapsible("ASSPE1689"));

    // Start observing the timetable for changes here - tell the timetable itself and the course panel if something changes
    const courseScheduleInstance = document.getElementById(GlobalCourseScheduleID);
    const coursePanelInstance = document.getElementById(GlobalCourseInfoPanelID);
    const timetableObserver = new MutationObserver(() => {
        courseScheduleInstance.refreshCourses();
        coursePanelInstance.resetPanel();
    });
    timetableObserver.observe(courseScheduleInstance, { childList: true, subtree: true });

    // This link clicks the 'New Profile' button to create a new profile for the user to use.
    document.querySelector("body > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > button").click()
    // This line clicks the radio button of the new profile that was just created.
    document.querySelector("body > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div:nth-child(3) > div > label > div:nth-child(2)").click();
}

window.addEventListener('DOMContentLoaded', main);