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

window.addEventListener('DOMContentLoaded', main);
function main() {
    document.querySelector("body > div > div:nth-child(1) > div:nth-child(3) > div:nth-child(3) > div > input[type=radio]:nth-child(1)").click();
}