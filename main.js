import CourseData from "./resources/CourseData.js";
import { CreateCoursePlan } from "./src/CoursePlan.js";
import { CreateCourseTile } from "./src/CourseTile.js";


function searchCourse() {
    const id = document.getElementById('course-search-id').value;
    if (CourseData[id]) {
        let ct = CreateCourseTile(id, id, "", id[6]);
        document.getElementById('new-course-slot').appendChild(ct);
    } else {
        console.log(`course '${id}' not found`);
    }
}

window.addEventListener('DOMContentLoaded', main);
function main() {
    document.getElementById('course-search-button').onclick = searchCourse;
}