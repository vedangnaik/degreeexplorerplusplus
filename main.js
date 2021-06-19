import CourseData from "./resources/CourseData.js";
import { CreateCoursePlan } from "./src/CoursePlan.js";


// main
window.addEventListener('DOMContentLoaded', () => {
    let p = CreateCoursePlan('profile1');
    document.body.appendChild(p);
});