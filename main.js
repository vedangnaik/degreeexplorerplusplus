// Side-effect imports, to get all the constructors and stuff into this file.
import "./src/Console.js";
import "./src/Constants.js";
import "./src/CourseInfoPanel.js";
import "./src/CourseTile.js";
import "./src/Program.js";
import "./src/Scratchpad.js";
import "./src/Serializer.js";
import "./src/Spacer.js";
import "./src/Timetable.js";
import "./resources/CourseData.js"
import "./resources/ProgramData.js"

// Specific imports this main needs
import { GlobalCourseInfoPanelID, GlobalTimetableID } from "./src/Constants.js";

function main() {
    // Start observing the timetable for changes here - tell the timetable itself and the course panel if something changes
    const timetableInstance = document.getElementById(GlobalTimetableID);
    const coursePanelInstance = document.getElementById(GlobalCourseInfoPanelID);
    const timetableObserver = new MutationObserver(() => {
        timetableInstance.refreshCoursesAndPanel();
        coursePanelInstance.resetPanel();
    });
    timetableObserver.observe(timetableInstance, { childList: true, subtree: true });

    // This link clicks the 'New Profile' button to create a new profile for the user to use.
    document.querySelector("body > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(1) > button").click()
    // This line clicks the radio button of the new profile that was just created.
    document.querySelector("body > div:nth-child(2) > div:nth-child(1) > div:nth-child(3) > div:nth-child(3) > div > label > div:nth-child(2)").click();
}

window.addEventListener('DOMContentLoaded', main);