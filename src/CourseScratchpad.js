export class CourseScratchpad extends HTMLDivElement {
    constructor() {
        super();
        this.id = "courseScratchpad"; // This is for the style node below
        this.style = `
            flex: 1;
            border: 1px solid grey;
            position: relative;
            text-align: center;
        `;
        this.innerText = "SCRATCHPAD";
            // add a new style node that gives each child of the pad absolute position
            const styleNode = document.createElement('style');
            styleNode.innerText = `
                #courseScratchpad > div {
                    position: absolute;
                }
            `;
        this.appendChild(styleNode);

        // Connect the dragging functions
        this.ondragover = this.#onDragOver.bind(this);
        this.ondrop = this.#onDrop.bind(this);
    }

    #onDragOver(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }

    #onDrop(ev) {
        ev.preventDefault();
        // retrive the id and start x and y coords from the dragevent object
        const id = ev.dataTransfer.getData("id");
        const dragStartX = ev.dataTransfer.getData("dragstartx");
        const dragStartY = ev.dataTransfer.getData("dragstarty");
        const tileBeingDragged = document.getElementById(id);
        // This is for a corner case where you drag the course tile onto itself.
        // dragStartX and dragStartY now become relative to the tile itself, so we need to make the coords relative to the scratchpad. This involves adding the actual top and left coordinates of the tile to the reported offset coords.
        const targetIsNotScratchpad = ev.target !== this;
        const tileLocalLeftCoord = ev.target.getBoundingClientRect().left - this.getBoundingClientRect().left;
        const tileLocalTopCoord = ev.target.getBoundingClientRect().top - this.getBoundingClientRect().top;
        const newX = ev.offsetX + (targetIsNotScratchpad ? tileLocalLeftCoord : 0);
        const newY = ev.offsetY + (targetIsNotScratchpad ? tileLocalTopCoord : 0);
        // Now we can append the child to the scratchpad, which will reset its top and left to 0. Then we can set the top and left explicitly.
        ev.currentTarget.appendChild(tileBeingDragged);
        // To do so, we need to subtract the coords the mouse started at inside the tile, otherwise the tile will jump to where the pointer is and not to where the corner looks like it should go. We also need to ensure that the box itself doesn't stick outside the scratchpad even if the cursor is still inside. For this, we need to clamp the final coordinates so that they don't get too close to the right or bottom borders.
        /* For this clamp, 
            The lower bound is zero, to prevent it from exiting the top and left.
            The upper bound is the scratchpad's width minus the tile's width and same for the height, to prevent it exiting the bottom and right. The -2 is for the 1px border of the scratchpad. Since we are using border-box model, the width of the pad includes the border's width; we need to subtract it to prevent the tile from covering the border. However, it appears that for some reason, (0, 0) is not on the border, but still the top left of the content area. Hence, we have to do -2 from the upper bounds, and not -1 each from the upper and lower bounds.
        */
        tileBeingDragged.style.left = this.#clamp(newX - dragStartX, 0, ev.currentTarget.offsetWidth - tileBeingDragged.offsetWidth - 2) + "px";
        tileBeingDragged.style.top  = this.#clamp(newY - dragStartY, 0, ev.currentTarget.offsetHeight - tileBeingDragged.offsetHeight - 2) + "px";
        // Finally, we reset the courseTile so that the prerequisite cache isn't corrupted
        tileBeingDragged.resetCourse();
    }

    #clamp(x, lower, upper) { 
        return Math.min(Math.max(x, lower), upper);
    }
}


customElements.define('depp-course-scratchpad', CourseScratchpad, {extends: 'div'});