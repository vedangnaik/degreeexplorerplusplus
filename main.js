import { Scheduler } from "./src/Profile.js";
import { CourseTile } from "./src/CourseTile.js";
import { Scratchpad } from "./src/Scratchpad.js";
import CourseData from "./resources/CourseData.js";


function searchCourse() {
    const id = document.getElementById('course-search-id').value;
    if (CourseData[id]) {
        let ct = new CourseTile(id, id, "", id[6]);
        let t = document.getElementById('new-course-slot');
        if (t.children.length > 0) { t.removeChild(t.childNodes[0]); }
        t.appendChild(ct);
    } else {
        console.log(`course '${id}' not found`);
    }
}

window.addEventListener('DOMContentLoaded', main);
function main() {
    document.getElementById('course-search-button').onclick = searchCourse;
    document.getElementById('new-course-slot').appendChild(new CourseTile("CSC148H1", "CSC148H1", "", 'H'));
}