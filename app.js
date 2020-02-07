const { Engine, Render, Runner, World, Bodies } = Matter;

// config variable
const cells = 10;
const width = 600;
const height = 600;

// Every cell we create is going to be this many units x y
const unitLength = width / cells;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: true,
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

// const grid = [];
// for (let i = 0; i < 3; i++) {
//   grid.push([]);
//   for (let j = 0; j < 3; j++) {
//     // start starting values of false
//     grid[i].push(false);
//   }
// }
// console.log(grid)


// Better code than above with .map()... it makes a copy of arry... throw away the value of null and return new arr with 3 elements of false
const grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false))

const verticals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false))
// console.log(verticals);


const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);
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
    if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
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
      columnIndex * unitLength + unitLength / 2,
      rowIndex * unitLength + unitLength,
      unitLength,
      5,
      {
        isStatic: true
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
      columnIndex * unitLength + unitLength,
      rowIndex * unitLength + unitLength / 2,
      // width of wall
      5,
      // height of wall
      unitLength,
      {
        isStatic: true
      }
    );
    World.add(world, wall)
  });
});

// Goal
const goal = Bodies.rectangle(
  // X
  width - unitLength / 2,
  // Y
  height - unitLength / 2,
  // Scale
  unitLength * .7,
  unitLength * .7,
  {
    isStatic: true
  }
);
World.add(world, goal)


// Ball
const ball = Bodies.circle(
  // scale ball to unitLength
  unitLength / 2,
  unitLength / 2,
  unitLength / 2
);
World.add(world, ball);
































































































