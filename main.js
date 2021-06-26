import { Timetable } from "./src/Timetable.js";
import { CourseTile } from "./src/CourseTile.js";
import { Scratchpad } from "./src/Scratchpad.js";
import { Profile } from "./src/Profile.js";
import ProgramData from "./resources/ProgramData.js";

window.addEventListener('DOMContentLoaded', main);
function main() {
    

    // function combinations(arr, num) {
    //     function recursive_builder(num, arr, current_subset, all_subsets) {
    //         // Base case: if we don't have any more elements to add to the subset, then we're done
    //         if (num == 0) {
    //             all_subsets.push(current_subset);
    //         // If we don have elements to add, then we recurse with one less than the number this was called
    //         // with, and the remainder of the array.
    //         } else {
    //             for (var j = 0; j < arr.length; j++) {
    //                 if (num - 1 <= arr.length - j) {
    //                     recursive_builder(num - 1, arr.slice(j + 1), current_subset.concat([arr[j]]), all_subsets);
    //                 }
    //             }
    //         }
    //     }
        
    //     let all_subsets = []
    //     recursive_builder(num, arr, [], all_subsets);
    //     return all_subsets;
    // }

    // let courses = {"CSC108H1": 1, "CSC148H1": 1, "CSC165H1": 1, "CSC207H1": 1, "CSC209H1": 1, "CSC236H1": 1, "CSC258H1": 1, "CSC263H1": 1, "CSC309H1": 1, "CSC311H1": 1, "CSC324H1": 1, "CSC336H1": 1, "CSC343H1": 1, "CSC367H1": 1, "CSC369H1": 1, "CSC373H1": 1, "CSC436H1": 1, "CSC443H1": 1, "CSC448H1": 1, "CSC456H1": 1, "CSC457H1": 1, "CSC458H1": 1, "CSC469H1": 1, "CSC488H1": 1, "GGR101H1": 1, "HPS390H1": 1, "HPS391H1": 1, "MAT137Y1": 1, "MAT223H1": 1, "MAT224H1": 1, "MAT237Y1": 1, "MAT257Y1": 1, "PHL100Y1": 1, "PHY131H1": 1, "STA247H1": 1, "STA248H1": 1}

    // let p = /^(CSC[34]..[HY]1|BCB410H1|BCB420H1|BCB330Y1|BCB430Y1|MAT224H1|MAT247H1|MAT235Y1|MAT237Y1|MAT257Y1|(?!.*(MAT329Y1|MAT390H1|MAT391H1)).*(MAT[34]..[HY]1)|STA248H1|STA238H1|STA261H1|STA[34]..[HY]1)$/;
    // courses = Object.keys(courses);
    // let validCourses = courses.filter(course => p.test(course));
}