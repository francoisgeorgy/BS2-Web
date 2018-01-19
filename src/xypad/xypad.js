import Rx from 'rxjs/Rx';

const NS = "http://www.w3.org/2000/svg";

export const drawGrid = function(container) {

    console.log(container);

    const svg_element = document.createElementNS(NS, "svg");
    svg_element.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg_element.setAttributeNS(null, "viewBox", '0 0 100 100');
    // svg_element.setAttributeNS(null, "width", '80%');
    svg_element.setAttributeNS(null, "height", '80%');

    const svg_rect = document.createElementNS(NS, "rect");
    svg_rect.setAttributeNS(null, "x", '0');
    svg_rect.setAttributeNS(null, "y", '0');
    svg_rect.setAttributeNS(null, "width", '100');
    svg_rect.setAttributeNS(null, "height", '100');
    svg_rect.setAttribute("fill", 'none');
    svg_rect.setAttribute("stroke", '#555555');
    svg_rect.setAttribute("stroke-width", '1');
    svg_element.appendChild(svg_rect);

    const svg_grid = document.createElementNS(NS, "path");
    svg_grid.setAttributeNS(null, "d", 'M 0 50 L 100 50 M 50 0 L 50 100');
    svg_grid.setAttribute("stroke", '#555555');
    svg_grid.setAttribute("stroke-width", '1');
    svg_element.appendChild(svg_grid);

    container.append(svg_element);  // container is a jQuery element

};


var rect = null;

function getOffsetPosition(e) {
    if (e.offsetX === undefined) {
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    } else {
        return {
            x: e.offsetX,
            y: e.offsetY
        }
    }
}

function getOffsetPositionRel(e) {

    console.log("getOffsetPositionRel")
    console.log(document.getElementById("grid").getBoundingClientRect());
    console.log(rect);

    //FIXME: boundingRect will change when resizing the app

    console.log(e);
    if (e.offsetX === undefined) {
        return {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height
        }
    } else {
        return {
            x: (e.offsetX) / rect.width,
            y: (e.offsetY) / rect.height
        }
    }
}


export const initPad = function(element, f) {

    if (rect == null) rect = element.getBoundingClientRect();
    console.log("initPad", rect);

    const positions = Rx.Observable
        .fromEvent(element, 'mousemove')
        // .map(x => ({ x: x.clientX, y: x.clientY }))
        .map(e => getOffsetPositionRel(e))
        // .map(e => getOffsetPosition(e))
        // .throttleTime(50)
        .share();   // alias for .publish().refCount().


    // const transform = moves.map(
    //     e => {
    //         let p = getOffsetPositionPercents(e);
    //         // console.log(`${e.clientX} ${e.clientY} ${p.x} ${p.y}`);
    //         console.log(e);
    //         return p;
    //     }
    // );

    // positions.subscribe({ next: (v) => console.log('A: ', v) });
    // positions.subscribe({ next: (v) => console.log('B: ', v) });
    positions.subscribe(f);
};