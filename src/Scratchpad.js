export class Scratchpad extends HTMLDivElement {
    constructor() {
        super();
        this.ondragover = this.onDragOver.bind(this);
        this.ondrop = this.onDrop.bind(this);
    }

    onDragOver(ev) {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = "move";
    }

    onDrop(ev) {
        ev.preventDefault();
        const id = ev.dataTransfer.getData("id");
        const dragStartX = ev.dataTransfer.getData("dragstartx");
        const dragStartY = ev.dataTransfer.getData("dragstarty");
        const element = document.getElementById(id);
        ev.currentTarget.appendChild(element);
        element.style.left = Math.min(Math.max(ev.offsetX - dragStartX, 0), this.offsetWidth - element.offsetWidth) + "px";
        element.style.top  = Math.min(Math.max(ev.offsetY - dragStartY, 0), this.offsetHeight - element.offsetHeight) + "px";
        console.log(this.offsetWidth, this.offsetHeight);
    }
}


customElements.define('depp-scratchpad', Scratchpad, {extends: 'div'});