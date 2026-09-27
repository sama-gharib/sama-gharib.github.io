const SPRING_LENGTH = 80;
const SPRING_FORCE = 0.02;
const FRICTION = 0.8;
const REPULSION_FACTOR = 200;
const REPULSION_DISTANCE_SCALE = 0.8;
const VERTICAL_REPULSION_FACTOR = 1; 
const MIN_X = 80;
const MIN_Y = 10;
const MAX_X = 420;
const MAX_Y = 800;



let root =
    {name: 'Skills', children: [
        {name: 'Theoretical', children: [
            {name: 'Graph Theory', children: []},
            {name: 'Complexity', children: [
                {name: 'Operational Research', children: [
                    {name: 'Meta Heuristics', children: [
                        {name: 'Hybrid Genetic Search', children: []}
                    ]},
                    {name: 'Exact resolutions', children: []},
                ]},
                {name: 'Computability', children: []}
            ]},
            {name: 'Simulation', children: [
                {name: 'Discreet Event Simulations', children: []},
                {name: 'Markov chains', children: []},
                {name: 'Operational Analysis', children: []},
            ]},
            {name: 'Formal Systems', children: [
                {name: 'Type Theory', children: []},
                {name: 'Lambda Calculus', children: []},
            ]}
        ]},
        {name: 'Practical', children: [
            {name: 'PageRank', children: []},
            {name: 'Databases', children: [
                {name: 'SQLite', children: []},
                {name: 'Oracle', children: []} 
            ]},
            {name: 'Proof assistants', children: [
                {name: 'Lean', children: []}
            ]},
            {name: 'Programming', children: [
                {name: 'Rust', children: []},
                {name: 'Python', children: []},
                {name: 'Java', children: []},
                {name: 'C', children: []},
                {name: 'Haskell', children: []}
            ]}
        ]}
    ]};

function initPositions(node) {
    node.x = Math.random() * (MAX_X-MIN_X) + MIN_X;
    node.y = Math.random() * (MAX_Y-MIN_Y) + MIN_Y;
    node.ax = 0;//Math.random() * 10;
    node.ay = 0;//Math.random() * 10;
    for(let child of node.children) {
        initPositions(child);
    }
}

initPositions(root)

const can = document.getElementById('skill-tree');
const ctx = can.getContext('2d');

function drawTree(node) {

    for(let child of node.children) {
        ctx.beginPath();
        ctx.moveTo(node.x, node.y);
        ctx.lineTo(child.x, child.y);
        ctx.stroke();
        
        drawTree(child);
    }
    // ctx.fillRect(node.x - 5, node.y - 5, 10, 10);
    let measures = ctx.measureText(node.name);
    ctx.fillStyle = 'white';
    ctx.fillRect(node.x - 15, node.y - 15, 30, 20);
    ctx.fillStyle = 'green';
    ctx.fillText(node.name, node.x - measures.width / 2, node.y);
}

function addVec(a, b) {
    return {
        x: a.x + b.x,
        y: a.y + b.y
    };
}

function scaleVec(a, f) {
    return {
        x: a.x * f,
        y: a.y * f
    };
}

function subVec(a, b) {
    return addVec(a, scaleVec(b, -1));
}

function norm(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
}

function normalized(a) {
    let n = norm(a);
    if (n != 0) {
        return scaleVec(a, 1/norm(a));
    } else {
        return a;
    }
}

function spring(a, b, l) {
    let ab = subVec(b, a);
    let dir = normalized(ab);
    let target = addVec(a, scaleVec(dir, l));
    let bTarget = subVec(target, b);
    let bDist = norm(bTarget);
    let targetDir = normalized(bTarget);
    let accel = scaleVec(targetDir, bDist * SPRING_FORCE);

    b.ax += accel.x;
    b.ay += accel.y;
    // a.ax = -accel.x;
    // a.ay = -accel.y;
}

function repulsion(a, b, f) {
    let ab = subVec(b, a);
    let dist = norm(ab);
    let dir = normalized(ab);

    if (dist == 0) {
        return;
    }

    let force = f/(REPULSION_DISTANCE_SCALE * dist * dist);
    a.ax -= dir.x * force;
    a.ay -= dir.y * force * VERTICAL_REPULSION_FACTOR;
}

function nodesInteraction(a, b) {
    if (a == b) {
        return;
    }
    
    if (a.children.includes(b) || b.children.includes(a)) {
        spring(a, b, SPRING_LENGTH);
    } else {
        repulsion(a, b, REPULSION_FACTOR);
    }
}

function slideNode(node) {
    let fx = node.x + node.ax;
    let fy = node.y + node.ay;

    if (fx < MIN_X || fx > MAX_X || fy < MIN_Y || fy > MAX_Y) {
        node.ax = -node.ax;
        node.ay = -node.ay;    
        
    } else {
        node.x = fx;
        node.y = fy;
        node.ax *= 0.97;
        node.ay *= 0.97;
    }

}

function forEachNode(node, f) {
    f(node);
    for(let child of node.children) {
        forEachNode(child, f);
    }
}

function simulate() {
    forEachNode(root, a => {
        forEachNode(root, b => nodesInteraction(a, b));
        slideNode(a); 
    });
}

function mainloop() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 500, 800);
    
    ctx.fillStyle = 'green';

    simulate();

    drawTree(root);
    
    // ctx.fillRect(30, 0, 10, 10);
    
    setTimeout(mainloop, 32);
}
mainloop();
