export class Scratchpad extends HTMLDivElement {
    static stylesheet = `
        flex: 1;
        outline: 1px solid grey;
        position: relative;
        text-align: center;
    `;

    constructor() {
        super();
        this.id = "scratchpad";
        this.style = Scratchpad.stylesheet;
        this.innerText = "SCRATCHPAD";

        // add a new style node that gives each child of the pad absolute position
        let styleNode = document.createElement('style');
        styleNode.innerText = `
            #scratchpad > div {
                position: absolute;
            }
        `;
        this.appendChild(styleNode);

        // Connect the dragging functions
        this.ondragover = this.onDragOver.bind(this);
        this.ondrop = this.onDrop.bind(this);
    }

    onDragOver(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }

    onDrop(ev) {
        ev.preventDefault();
        // retrive the id and start x and y coords from the dragevent object
        const id = ev.dataTransfer.getData("id");
        const dragStartX = ev.dataTransfer.getData("dragstartx");
        const dragStartY = ev.dataTransfer.getData("dragstarty");
        const tileBeingDragged = document.getElementById(id);
        // This is for a corner case where you drag the course tile onto itself
        // The offsets in the dragevent then become relative to itself, so we need to make the coords relative to the scratchpad
        // This involves adding the actual top and left coordinates of the tile to the reported offset coords
        let targetIsNotScratchpad = ev.target !== this;
        let tileLocalLeftCoord = ev.target.getBoundingClientRect().left - this.getBoundingClientRect().left;
        let tileLocalTopCoord = ev.target.getBoundingClientRect().top - this.getBoundingClientRect().top;
        let newX = ev.offsetX + (targetIsNotScratchpad ? tileLocalLeftCoord : 0);
        let newY = ev.offsetY + (targetIsNotScratchpad ? tileLocalTopCoord : 0);
        // Now we can append the child to the scratchpad, which will reset its top and left to 0. Then we can set the top and left explicitly
        ev.currentTarget.appendChild(tileBeingDragged);
        // To do so, we need to subtract the coords the pointer started at inside the tile, otherwise the tile
        // will jump to where the pointer is and not to where the corner looks like it should go.
        // We also need to ensure that the box itself doesn't stick outside the scratchpad even if the cursor is still inside
        // For this, we need a clamp function
        const clamp = (x, lower, upper) => Math.min(Math.max(x, lower), upper);
        // The lower bound is zero, to prevent it from exiting the top and left.
        // The upper bound is the scratchpad's width minus the tile's width and same for the height, to prevent it exiting the bottom and right. 
        tileBeingDragged.style.left = clamp(newX - dragStartX, 0, ev.currentTarget.offsetWidth - tileBeingDragged.offsetWidth) + "px";
        tileBeingDragged.style.top  = clamp(newY - dragStartY, 0, ev.currentTarget.offsetHeight - tileBeingDragged.offsetHeight) + "px";
        // Finally, we reset the courseTile so that the prerequisite cache isn't corrupted
        tileBeingDragged.resetCourse();
    }
}


customElements.define('depp-scratchpad', Scratchpad, {extends: 'div'});