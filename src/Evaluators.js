import ProgramData from "../resources/ProgramData.js";
import CourseCategoriesData from "../resources/CourseCategoriesData.js"
import { STATUSES } from "./Constants.js";

// These are all the types in the programs. 6/8 have been done but consolidation is needed.
// {'REUSE', 'COMPLEX', 'NOTE', 'LIST', 'MINIMUM', 'GROUPMINIMUM', 'NO_REUSE', 'GROUPMAXIMUM'}
export function evaluateProgramRequirement(programID, reqID, scheduledCourses, scheduledPrograms) {
    const requirementObj = ProgramData[programID].detailAssessments[reqID];

    if (requirementObj.type == "NOTE") {
        return {
            [reqID]: { 
                "status": STATUSES.NOTE,
                "usedCourses": [] 
            }
        };
    }

    switch (requirementObj["requisiteType"]) {
    case "requirement":
        let dependent_requirements = {};
        switch (requirementObj.type) {
        // At least 1 requirement is needed. It's assumed to be 1 because count is not specified for this field anywhere.
        case "MINIMUM":
            // Evaluate all requirements this one depends on first
            for (const dependent_req of requirementObj.requisiteItems) {
                dependent_requirements = {...dependent_requirements, ...evaluateProgramRequirement(programID, dependent_req["code"], scheduledCourses, scheduledPrograms)};
            }
            // Go through them and see if there are enough to satisfy this one.
            let usedPrereqs = [];
            let usedCourses = [];
            let count = 0;
            for (const dependent_reqID in dependent_requirements) {
                if (dependent_requirements[dependent_reqID].status !== STATUSES.INCOMPLETE) {
                    usedPrereqs.push(dependent_reqID);
                    usedCourses.concat(dependent_requirements[dependent_reqID].usedCourses);
                    count += 1;
                }

                if (1 <= count) { break; }
            }
            // Return negative on failure
            if (1 > count) {
                return {
                    ...dependent_requirements,
                    [reqID]: {
                        "status": STATUSES.INCOMPLETE,
                        "usedCourses": []
                    }
                }
            }
            // Go through all the courses not in usedPrereqs and set them NA
            for (const dependent_reqID in dependent_requirements) {
                if (!usedPrereqs.includes(dependent_reqID)) {
                    dependent_requirements[dependent_reqID].status = STATUSES.NA;
                }
            }
            return {
                ...dependent_requirements,
                [reqID]: {
                    "status": STATUSES.COMPLETE,
                    "usedCourses": usedCourses
                }
            };
        // REUSE allows courses to be used across multiple requirements. There's really nothing to check here since it doesn't matter even if they are not reused. Hence it'll just return COMPELTE.
        case "REUSE":
            return {
                [reqID]: {
                    "status": STATUSES.COMPLETE,
                    "usedCourses": []
                }
            }

        // NO_REUSE disallows courses to be common between requirements.
        case "NO_REUSE":
            // Evaluate all requirements this one depends on first
            dependent_requirements = {};
            for (const dependent_req of requirementObj.requisiteItems) {
                dependent_requirements = {...dependent_requirements, ...evaluateProgramRequirement(programID, dependent_req["code"], scheduledCourses, scheduledPrograms)};
            }
            // Get all the used courses
            let allUsedCourses = [];
            for (const dependent_reqID in dependent_requirements) {
                allUsedCourses.push(dependent_requirements[dependent_reqID].usedCourses);
            }
            // Get the intersection of all the used courses using this snippet from MDN.
            const usedCoursesIntersection = allUsedCourses.reduce((usedCoursesArrayA, usedCoursesArrayB) => {
                const setA = new Set(usedCoursesArrayA);
                const setB = new Set(usedCoursesArrayB);
                let intersection = new Set();
                for (let elem of setB) {
                    if (setA.has(elem)) {
                        intersection.add(elem);
                    }
                }
                return intersection;
            }, []);
            // If the intersection is empty, return COMPLETE, else INCOMPLETE.
            return {
                ...dependent_requirements,
                [reqID]: {
                    "status": usedCoursesIntersection.size === 0 ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                    "usedCourses": []
                }
            };
        // For debugging
        default:
            console.log(`${programID}, ${reqID}: Unknown recursive type: ${requirementObj.type}`);
            return {
                [reqID]: {
                    "status": STATUSES.WARNING,
                    "usedCourses": []
                }
            };
        }
    // These requirements have a mix of categories and courses
    case "course/category":
        switch (requirementObj.type) {
        // All of the courses in the list
        case "LIST":
            // If any course required is not in the scheduledCourses, this will be false.
            const lengthIsZero = requirementObj.requisiteItems
                .filter(dependent_course => !(dependent_course["itemType"] == "course" && dependent_course["code"] in scheduledCourses))
                .length === 0;
            return {
                [reqID]: {
                    "status": lengthIsZero ? STATUSES.COMPLETE : STATUSES.INCOMPLETE,
                    "usedCourses": lengthIsZero ? requirementObj.requisiteItems.map(dependent_course => dependent_course["code"]) : []
                }
            };
        // At least count credits
        case "MINIMUM": {
            let [potentialUsedCourses, validatable] = getAllApplicableCoursesAndValidity(requirementObj.requisiteItems, scheduledCourses);
            const numCredits = validatable ? getTotalCreditsOfCourseIDList(potentialUsedCourses) : NaN;
            return {
                [reqID]: {
                    "status": validatable ? (numCredits >= requirementObj.count ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) : STATUSES.WARNING,
                    "usedCourses": validatable ? (numCredits >= requirementObj.count ? potentialUsedCourses : []) : []
                }
            };
        }
        // At most count credits from this category (or something, idk)
        case "GROUPMAXIMUM": {
            let [potentialUsedCourses, validatable] = getAllApplicableCoursesAndValidity(requirementObj.requisiteItems, scheduledCourses);
            const numCredits = validatable ? getTotalCreditsOfCourseIDList(potentialUsedCourses) : NaN;
            return {
                [reqID]: {
                    "status": validatable ? (numCredits <= requirementObj.count ? STATUSES.COMPLETE : STATUSES.INCOMPLETE) : STATUSES.WARNING,
                    "usedCourses": validatable ? (numCredits <= requirementObj.count ? potentialUsedCourses : []) : []
                }
            };
        }
        // For debugging
        default:
            console.log(`${programID}, ${reqID}: Unknown normal type: ${requirementObj.type}`);
            return {
                [reqID]: {
                    "status": STATUSES.WARNING,
                    "usedCourses": []
                }
            };
        }
    default:
        console.log(`${programID}: ${reqID}: No requisiteType found.`);
        return {
            [reqID]: {
                "status": STATUSES.WARNING,
                "usedCourses": []
            }
        }
    }
}

// Returns all courses from scheduled courses which equal the "course" objects and match the "category" regexes from requisiteItems. If any of the regexes are not validatable, then the whole thing is marked is not validatable.
function getAllApplicableCoursesAndValidity(requisiteItems, scheduledCourses) {
    let courses = [];
    let validatable = true;
    // Courses: Get all courses in requisiteItems which are also in sheduledCourses
    courses = courses.concat(
        requisiteItems
            .filter(dependent_course => dependent_course["itemType"] === "course" && dependent_course["code"] in scheduledCourses)
            .map(dependent_course => dependent_course["code"])
    );
    // Categories: Get all courses from scheduledCourses which belong to some category in requisiteItems
    requisiteItems
        .filter(dependent_course => dependent_course["itemType"] == "category")
        .forEach(dependent_course => {
            if (!CourseCategoriesData[dependent_course["code"]]["validatable"]) {
                validatable = false;
                return; // quit this loop now, no point continuing 
            }
            let regex = new RegExp(CourseCategoriesData[dependent_course["code"]]["regex"]);
            courses = courses.concat(
                Object.keys(scheduledCourses).filter(courseID => regex.test(courseID))
            );
        });
    return [courses, validatable];
}

function getTotalCreditsOfCourseIDList(courses) {
    return courses
        .map(dependent_courseID => dependent_courseID[6] === 'H' ? 0.5 : 1)
        .reduce((x, y) => x + y, 0);
}