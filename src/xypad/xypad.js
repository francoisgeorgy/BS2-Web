import Rx from 'rxjs/Rx';

const NS = "http://www.w3.org/2000/svg";

export const drawGrid = function(container) {

    console.log(container);

    /*
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
    */
};


var rect = null;
var rect_element = null;

function getElementRect() {
    if (rect == null) {
        rect = rect_element.getBoundingClientRect();
        console.log("getElementRect", rect);
    }
    return rect;
}

Rx.Observable.fromEvent(window, "resize").subscribe(
    e => {
        // console.log(e);
        rect = rect_element.getBoundingClientRect();
    }
);

/*
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
*/


// currentTarget: Identifies the current target for the event, as the event traverses the DOM.
//                It always refers to the element to which the event handler has been attached,
//                as opposed to event.target which identifies the element on which the event occurred.
//
// target: A reference to the target to which the event was originally dispatched.
//         A reference to the object that dispatched the event. It is different from event.currentTarget
//         when the event handler is called during the bubbling or capturing phase of the event.
//
// MouseEvent.offsetX: The X coordinate of the mouse pointer relative to the position of the padding edge of the target node.

// Important: we can not use the targetX, targetY properties, which are related to the _target_, because, since we listen to the
//            window's mousemove events, the target will change and therefore the offsetX|Y reference will also change.

/*
function getOffsetPositionRel(e) {

    // console.log("getOffsetPositionRel");
    // console.log(document.getElementById("grid").getBoundingClientRect());
    // console.log(rect);

    //FIXME: boundingRect will change when resizing the app

    // console.log(e);
    // if (e.offsetX === undefined) {
        return {
            x: (e.clientX - rect.left) / rect.width,
            y: (e.clientY - rect.top) / rect.height
        }
    // } else {
    //     return {
    //         x: (e.offsetX) / rect.width,
    //         y: (e.offsetY) / rect.height
    //     }
    // }
}
*/

const mouseEventToCoordinate = mouseEvent => {
    mouseEvent.preventDefault();
    console.log(`mouse->xy ${mouseEvent.offsetX} ${mouseEvent.offsetY}`, rect);
    let r = getElementRect();
    return {
        x: mouseEvent.clientX - r.left,
        y: mouseEvent.clientY - r.top
        // x: mouseEvent.offsetX,
        // y: mouseEvent.offsetY
    };
};

const touchEventToCoordinate = touchEvent => {
    touchEvent.preventDefault();
    let r = getElementRect();
    return {
        x: touchEvent.changedTouches[0].clientX - r.left,
        y: touchEvent.changedTouches[0].clientY - r.top
    };
};

function toRelCoord(coord) {
    let x = Math.max(0, coord.x); // stop at 0, do not go negative
    let y = Math.max(0, coord.y); // stop at 0, do not go negative
    let r = getElementRect();
    return {
        x: Math.min(x / r.width, 1.0),
        y: Math.min(y / r.height, 1.0)
    }
}

/*function start(e) {
    const x = e.x;
    const y = e.y;
    console.log(`start at ${x} ${y} (${e.xr} ${e.yr})`, e);
    updateDisplay(e);
    return e;
}*/

export const initPad = function(element, f) {

    console.log("initPad", element);

    rect_element = element;

    // if (rect == null) rect = element.getBoundingClientRect();
    // console.log("initPad", rect);

    const mouseDowns = Rx.Observable.fromEvent(element, "mousedown").map(mouseEventToCoordinate).map(toRelCoord);
    const mouseMoves = Rx.Observable.fromEvent(window, "mousemove").map(mouseEventToCoordinate).map(toRelCoord);
    const mouseUps = Rx.Observable.fromEvent(window, "mouseup").map(mouseEventToCoordinate).map(toRelCoord);

    const touchStarts = Rx.Observable.fromEvent(element, "touchstart").map(touchEventToCoordinate).map(toRelCoord);
    const touchMoves = Rx.Observable.fromEvent(element, "touchmove").map(touchEventToCoordinate).map(toRelCoord);
    const touchEnds = Rx.Observable.fromEvent(window, "touchend").map(touchEventToCoordinate).map(toRelCoord);

    const starts = mouseDowns.merge(touchStarts);
    const moves = mouseMoves.merge(touchMoves);
    const ends = mouseUps.merge(touchEnds);

    // function ff(e) {
    //     console.log('ff', element.getBoundingClientRect());
    //     return e;
    // }

// Once a start event occurs, it does not give back the start event itself,
// but it only return a sequence of move events till a mouseUp or touchEnd event occurs.
    const drags = starts.map(f).concatMap(dragStartEvent =>
        moves.takeUntil(ends).map(dragEvent => {
            const x = dragEvent.x; // - dragStartEvent.x;
            const y = dragEvent.y; // - dragStartEvent.y;
            console.log(`drags ${x} ${y}`);
            return {x, y};
        })
    );

// Reveals the first end event once a start event happened.
// "ends.first()" part here will not give back a sequence of end events once once a start event occurs,
// but it gives back only the first one.
    const drops = starts.concatMap(dragStartEvent =>
        ends.first().map(dragEndEvent => {
            const x = dragEndEvent.x; // - dragStartEvent.x;
            const y = dragEndEvent.y; // - dragStartEvent.y;
            console.log(`drops ${x} ${y}`);
            return {x, y};
        })
    );

    drags.subscribe(
        // obj => { infos.innerText = `drag ${obj.x}, ${obj.y}`},
        f,
        err => { console.log(err) },
        () => { console.log('complete') }
    );

    drops.subscribe(
        //obj => { infos.innerText = `drop ${obj.x}, ${obj.y}`},
        f,
        err => { console.log(err) },
        () => { console.log('complete') }
    );


/*
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
*/
};
