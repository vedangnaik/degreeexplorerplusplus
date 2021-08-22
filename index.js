// Side-effect import the UI classes here to get their constructors registered for the window to use.
import "./src/ui/exports.js"
// Specific imports this main needs for the final setup
import { GLOBAL_COURSE_INFO_PANEL_ID, GLOBAL_COURSE_SCHEDULE_ID, GLOBAL_PROGRAM_SCHEDULE_ID } from "./src/Constants.js";

function connectObservers() {
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
}

function createNewProfile() {
    // This link clicks the 'New Profile' button to create a new profile for the user to use.
    document.querySelector("body > div > div:nth-child(5) > div:nth-child(3) > div:nth-child(1) > button").click()
    // This line clicks the radio button of the new profile that was just created.
    document.querySelector("body > div > div:nth-child(5) > div:nth-child(3) > div:nth-child(3) > div > label").click();
}


/**
 * This function attached event listeners to the spans in the tutorial so the corresponding element is highlighted when hovered over. This must be done here since the window has finished rendering at this point.
 */
function connectTutorialHighlights() {
    function attachSpanToElementForHighlight(span, element) {
        span.onmouseenter = () => { 
            element.style.outline = "5px solid yellow"; 
            element.style.outlineOffset = "1px"; // This is the prevent elements which use outlines from being covered.
        }
        span.onmouseleave = () => { 
            element.style.outline = "revert";
            element.style.outlineOffset = "revert";
        }
    }

    // For the Profile section
    attachSpanToElementForHighlight(document.getElementById("profile-highlight"), document.querySelector("body > div > div:nth-child(3)"));
    // For the Course Schedule
    attachSpanToElementForHighlight(document.getElementById("cs-highlight"), document.getElementById(GLOBAL_COURSE_SCHEDULE_ID));
    // For the Program Schedule
    attachSpanToElementForHighlight(document.getElementById("ps-highlight"), document.getElementById(GLOBAL_PROGRAM_SCHEDULE_ID));
}


window.addEventListener('DOMContentLoaded', connectObservers);
window.addEventListener('DOMContentLoaded', createNewProfile);
window.addEventListener('DOMContentLoaded', connectTutorialHighlights);