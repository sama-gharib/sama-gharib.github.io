const SPRING_LENGTH = 50;
const SPRING_FORCE = 0.08;
const FRICTION = 0.9;
const REPULSION_FACTOR = 6;
const REPULSION_DISTANCE_SCALE = 0.01;
const VERTICAL_REPULSION_FACTOR = 2;
const MIN_X = 80;
const MIN_Y = 10;
const MAX_X = 420;
const MAX_Y = 800;


// let root = {name: 'A', children: [{name: 'B', children: []}]};

let root =
{
  name: 'Skills', children: [
    {
      name: 'Theoretical', children: [
        { name: 'Graph Theory', children: [] },
        {
          name: 'Complexity', children: [
            {
              name: 'Operational Research', children: [
                {
                  name: 'Meta Heuristics', children: [
                    { name: 'Hybrid Genetic Search', children: [] }
                  ]
                },
                { name: 'Exact resolutions', children: [] },
              ]
            },
            { name: 'Computability', children: [] }
          ]
        },
        {
          name: 'Simulation', children: [
            { name: 'Discreet Event Simulations', children: [] },
            { name: 'Markov chains', children: [] },
            { name: 'Operational Analysis', children: [] },
          ]
        },
        {
          name: 'Formal Systems', children: [
            { name: 'Type Theory', children: [] },
            { name: 'Lambda Calculus', children: [] },
          ]
        }
      ]
    },
    {
      name: 'Practical', children: [
        { name: 'PageRank', children: [] },
        {
          name: 'Databases', children: [
            { name: 'SQLite', children: [] },
            { name: 'Oracle', children: [] }
          ]
        },
        {
          name: 'Proof assistants', children: [
            { name: 'Lean', children: [] }
          ]
        },
        {
          name: 'Programming', children: [
            { name: 'Rust', children: [] },
            { name: 'Python', children: [] },
            { name: 'Java', children: [] },
            { name: 'C', children: [] },
            { name: 'Haskell', children: [] }
          ]
        }
      ]
    }
  ]
};


function initPositions(node) {
  node.x = Math.random() * (MAX_X - MIN_X) + MIN_X;
  node.y = Math.random() * (MAX_Y - MIN_Y) + MIN_Y;
  node.vx = 0;
  node.vy = 0;
  node.ax = 0;//Math.random() * 10;
  node.ay = 0;//Math.random() * 10;
  for (let child of node.children) {
    initPositions(child);
  }
}

initPositions(root)

root.x = 100;
root.y = 100;
root.children[0].x = 225;
root.children[0].y = 100;

const can = document.getElementById('skill-tree');
const ctx = can.getContext('2d');

let mousePosition = { x: 0, y: 0 };

can.addEventListener('mousemove', evt => {
  let rect = can.getBoundingClientRect();

  mousePosition.x = evt.clientX - rect.left;
  mousePosition.y = evt.clientY - rect.top;
});

function drawTree(node) {

  for (let child of node.children) {
    ctx.beginPath();
    ctx.moveTo(node.x, node.y);
    ctx.lineTo(child.x, child.y);
    ctx.stroke();

    drawTree(child);
  }
  // ctx.fillRect(node.x - 5, node.y - 5, 10, 10);
  let measures = ctx.measureText(node.name);
  ctx.fillStyle = 'white';
  ctx.fillRect(node.x - 15, node.y - 10, 30, 15);
  ctx.fillStyle = 'green';
  ctx.fillText(node.name, node.x - measures.width / 2, node.y);
}

function spring(a, b, l) {

  let ab = { x: b.x - a.x, y: b.y - a.y };
  let norm = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  let abDir = { x: ab.x / norm, y: ab.y / norm };
  let target = { x: a.x + abDir.x * l, y: a.y + abDir.y * l };

  let bTarget = { x: target.x - b.x, y: target.y - b.y };
  let accel = { x: bTarget.x * SPRING_FORCE, y: bTarget.y * SPRING_FORCE };

  b.ax += accel.x / 2;
  b.ay += accel.y / 2;
  // a.ax += -accel.x;
  // a.ay += -accel.y;
}

function repulsion(a, b, f) {
  let ab = { x: b.x - a.x, y: b.y - a.y };
  let dist = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  let dir = { x: ab.x / dist, y: ab.y / dist };

  dist = Math.max(dist, 1);

  let force = f / (REPULSION_DISTANCE_SCALE * dist * dist);
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
  node.vx = Math.min(100, node.vx);
  node.vy = Math.min(100, node.vy);

  node.vx += node.ax;
  node.vy += node.ay;

  let fx = node.x + node.vx;
  let fy = node.y + node.vy;

  if (fx < MIN_X || fx > MAX_X || fy < MIN_Y || fy > MAX_Y) {
    node.vx = -node.vx;
    node.vy = -node.vy;
  } else {
    node.x = fx;
    node.y = fy;
    node.vx *= FRICTION;
    node.vy *= FRICTION;
  }

  node.ax = 0;
  node.ay = 0;
}

function forEachNode(node, f) {
  f(node);
  for (let child of node.children) {
    forEachNode(child, f);
  }
}

function simulate() {
  forEachNode(root, a => {
    forEachNode(root, b => nodesInteraction(a, b));

    repulsion(a, mousePosition, REPULSION_FACTOR);

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
