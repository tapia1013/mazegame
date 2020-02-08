const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

// config variable
const cellsHorizontal = 40;
const cellsVertical = 40;
const width = window.innerWidth;
const height = window.innerHeight;

// Every cell we create is going to be this many units x y
const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
// Disable Gravity
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width: width,
    height: height
  }
});

Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, walls)



// Maze Generation Grid
const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    // random order
    const temp = arr[counter];
    //update value
    arr[counter] = arr[index];
    // update element
    arr[index] = temp;
  }

  return arr;
}


// Better code than above with .map()... it makes a copy of arry... throw away the value of null and return new arr with 3 elements of false
const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false))

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false))
// console.log(verticals);


const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);
// console.log(startRow, startColumn);

const stepThroughCell = (row, column) => {
  //If I have visited he cell at [row,column] then return do nothing
  if (grid[row][column] === true) {
    return;
  }

  // Mark this cell as visited
  grid[row][column] = true;

  // Assemble randomly-ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ]);
  // console.log(neighbors);

  // for each neighbor...
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
    // Check to see if that neighbor is out of bounds
    if (nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextColumn < 0 ||
      nextColumn >= cellsHorizontal) {
      continue;
    }

    // If have visited that neighbor, continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // Remove wall from either horizontals or vericals
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
  }
  // Visit that next cell
};

stepThroughCell(startRow, startColumn);
// console.log(grid);



// Iterate over horizontals with forEach
horizontals.forEach((row, rowIndex) => {
  // console.log(row);

  // iterate throught those inner arr we do another forEach on row
  row.forEach((open, columnIndex) => {
    if (open === true) {
      return;
    }

    // if else we do want to create/draw a wall
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      5,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red'
        }
      }
    );
    World.add(world, wall)
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      // width of wall
      5,
      // height of wall
      unitLengthY,
      {
        label: 'wall',
        isStatic: true,
        render: {
          fillStyle: 'red'
        }
      }
    );
    World.add(world, wall)
  });
});

// Goal
const goal = Bodies.rectangle(
  // X
  width - unitLengthX / 2,
  // Y
  height - unitLengthY / 2,
  // Scale
  unitLengthX * .7,
  unitLengthY * .7,
  {
    label: 'goal',
    isStatic: true,
    render: {
      fillStyle: 'green'
    }
  }
);
World.add(world, goal)


// Ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(
  // scale ball to unitLength
  unitLengthX / 2,
  unitLengthY / 2,
  ballRadius,
  {
    label: 'ball',
    render: {
      fillStyle: 'blue'
    }
  }
);
World.add(world, ball);


document.addEventListener('keydown', event => {
  // get ball velocity
  const { x, y } = ball.velocity;
  // console.log(x, y);

  // Up / W key
  if (event.keyCode === 87) {
    Body.setVelocity(ball, { x: x, y: y - 5 })
  }
  // Right / D key
  if (event.keyCode === 68) {
    Body.setVelocity(ball, { x: x + 5, y: y })
  }
  // Down / S key
  if (event.keyCode === 83) {
    Body.setVelocity(ball, { x: x, y: y + 5 })
  }
  // Left / A key
  if (event.keyCode === 65) {
    Body.setVelocity(ball, { x: x - 5, y: y })
  }
});


// Win Condition
Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];

    if (labels.includes(collision.bodyA.label) && labels.includes(collision.bodyB.label)) {
      // remove html hidden if player wins
      document.querySelector('.winner').classList.remove('hidden')

      // drop shapes to bottom
      world.gravity.y = 1;

      // loop over shapes in world and remove static flag
      world.bodies.forEach(body => {
        if (body.label === 'wall') {
          // get body and set to false
          Body.setStatic(body, false)
        }
      });
    }
  });
});





























































































