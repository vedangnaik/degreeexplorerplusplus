import { CoursePlan } from "./src/CoursePlan.js";
import { CourseTile } from "./src/CourseTile.js";
import CourseData from "./resources/CourseData.js";


function searchCourse() {
    const id = document.getElementById('course-search-id').value;
    if (CourseData[id]) {
        let ct = new CourseTile(id, id, CourseData[id]["name"], id[6]);
        document.getElementById('new-course-slot').appendChild(ct);
    } else {
        console.log(`course '${id}' not found`);
    }
}

window.addEventListener('DOMContentLoaded', main);
function main() {
    document.getElementById('course-search-button').onclick = searchCourse;
}