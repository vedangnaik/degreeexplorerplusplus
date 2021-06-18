import courses from "./courses.js"


class CourseTile extends HTMLDivElement {
    constructor() {
        super();
        this.className = "courseTile";
        this.draggable = true;
        this.ondragstart = this.onDragStart;
    }

    onDragStart(ev) {
        ev.dataTransfer.effectAllowed = "move";
        ev.dataTransfer.setData("text/plain", ev.target.id);
    }
}


class CourseSlot extends HTMLTableCellElement {
    constructor() {
        super();
        this.className = "courseSlot";
        this.ondragover = this.onDragOver;
        this.ondrop = this.onDrop;
    }

    onDragOver(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }

    onDrop(ev) {
        ev.preventDefault();
        const id = ev.dataTransfer.getData("text/plain");
        const element = document.getElementById(id);
        ev.target.appendChild(element);
    }
}



// main
window.addEventListener('DOMContentLoaded', () => {
    customElements.define('course-slot', CourseSlot, {extends: 'td' });
    customElements.define('course-tile', CourseTile, {extends: 'div'});

    // populate table with 5 semesters of classes
    let table = document.getElementById('scheduler'); 
    for (let row = 0; row < 4; row++) {
        let tr = document.createElement('tr');

        let th = document.createElement('th');
        th.innerText = "Semester " + row;
        tr.appendChild(th);

        for (let col = 0; col < 8; col++) {
            let cs = document.createElement('td', {is: "course-slot"});
            if (row < 2) {
                let ct = document.createElement('div', {is: "course-tile"});
                ct.id = row + " " + col;
                ct.innerText = ct.id;
                cs.appendChild(ct);
            }
            tr.appendChild(cs);
        }

        table.insertBefore(tr, table.firstChild);
    }
});