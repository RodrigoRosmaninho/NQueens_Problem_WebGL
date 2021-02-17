const MOVEMENT = 0;
const NEW_QUEEN = 1;
const BACKTRACK = 2;
const INIT = 3;

var plays = [];
var print_output = false;
var nboard = null;
var starting_queen_col = -1;

function solve(N, starting_queen = null, print = false) {
    plays = [];
    starting_queen_col = -1;
    print_output = print;
    nboard = Array.from(Array(N), _ => Array(N).fill(0));
    if(starting_queen != null){
        starting_queen_col = starting_queen[1];
        nboard[starting_queen[0]][starting_queen_col] = 1;
        pushPlay(nboard, [], NEW_QUEEN, starting_queen);
    }
    else pushPlay(nboard, [], INIT);
    return [solveRec(nboard, 0), plays];
}

function solveRec(nboard, column) {
    if (column >= nboard.length) return true;

    if (column == starting_queen_col){
        return solveRec(nboard, column + 1)
    }

    for (var row = 0; row < nboard.length; row++) {
        
        danger = checkState(nboard, row, column);
        nboard[row][column] = 1;
        pushPlay(nboard, danger, + (row == 0), [row, column]);

        if (danger.size == 0) {
            if (solveRec(nboard, column + 1)) return true;
            pushPlay(nboard, [], BACKTRACK, [row, column]);
        }

        nboard[row][column] = 0;
    }

    return false;
}


function pushPlay(nboard, danger = [], info = MOVEMENT, queen = []){
    b = [];
    for (i = 0; i < nboard.length; i++)
        b.push(nboard[i].slice(0));

    plays.push({
        nboard: b,
        danger: Array.from(danger),
        info: info,
        queen: queen
    });

    if (print_output) {
        console.log("------------");
        console.log("info: " + info);
        for (var i = 0; i < nboard.length; i++) {
            var str = "";
            for(var j = 0; j < nboard.length; j++)
                str = str + nboard[i][j] + " ";
            console.log(str);
        }
        d_str = JSON.stringify(Array.from(danger));
        console.log("danger: " + d_str.substring(1, d_str.length - 1));
        console.log("current queen: " + queen);
    }

}


function checkState(nboard, row, column) {
    danger = new Set();

    for (i = 0; i < nboard.length; i++) {
        if (nboard[row][i] == 1)
            danger.add([row,i]);
    }
  
    for (i = row, j = column; i >= 0 && j >= 0; i--, j--) {
        if (nboard[i][j] == 1) 
            danger.add([i, j]); 
    }

    for (i = row, j = column; j >= 0 && i < nboard.length; i++, j--) {
        if (nboard[i][j] == 1) 
            danger.add([i, j]);
    }

    for (i = row, j = column; i >= 0 && j < nboard.length; i--, j++) {
        if (nboard[i][j] == 1) 
            danger.add([i, j]); 
    }

    for (i = row, j = column; j < nboard.length && i < nboard.length; i++, j++) {
        if (nboard[i][j] == 1) 
            danger.add([i, j]);
    }

    return danger;
}

function executeAsync(func) {
    setTimeout(func, 0);
}