let occupiedCellsList=[];
let listUsedShapes=[];
let shipSocket;

//Basic script to enable the eunctionalities of the draggable objects

document.querySelectorAll('.draggable').forEach(draggable => {
    draggable.addEventListener('dragstart', function (event) {
        event.dataTransfer.setData('shape-id', event.target.id);
    });
});

// Make the table cells droppable
document.querySelectorAll('#droppable-table td').forEach(cell => {
    cell.addEventListener('dragover', function (event) {
        event.preventDefault(); // Allows the drop
    });

    cell.addEventListener('drop', function (event) {
        event.preventDefault();
        let shapeId = event.dataTransfer.getData('shape-id');
        let shape = document.getElementById(shapeId);

        let shapeWidth = shape.offsetWidth;
        let shapeHeight = shape.offsetHeight;

        // Calculate number of cells required
        let requiredCols = Math.ceil(shapeWidth / 40);
        let requiredRows = Math.ceil(shapeHeight / 40);

        let table = document.getElementById('droppable-table');
        let rowIndex = event.target.parentElement.rowIndex;
        let cellIndex = event.target.cellIndex;

        // Check if the shape fits in the desired cells
        if (checkFit(rowIndex, cellIndex, shape, requiredRows, requiredCols)) {
            clearPreviousPosition(shape); // Clear previous cells occupied by this shape

            if(listUsedShapes.includes(shape.id)) placeShape(rowIndex, cellIndex, shape, requiredRows, requiredCols, true);   
            else{
                listUsedShapes.push(shape.id);
                placeShape(rowIndex, cellIndex, shape, requiredRows, requiredCols, false);
            }
        }
    });
});

// Function to check if the shape can fit in the table

function checkFit(rowIndex, cellIndex, shape,  rows, cols) {
    let table = document.getElementById('droppable-table');

    if(shape.classList.contains("rectangle-1x2") && rowIndex+rows+1>10) return false;
    if(shape.classList.contains("rectangle-3x1") && cellIndex+cols+2>10) return false;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            let targetRow = table.rows[rowIndex + r];
            if (!targetRow || !targetRow.cells[cellIndex + c] || targetRow.cells[cellIndex + c].classList.contains(shape.classList[0]) || targetRow.cells[cellIndex + c].classList.contains('occupied')) {
                return false;
            }
        }
    }
    return true;
}



// Function to clear the previous cells occupied by the shape when you move it

function clearPreviousPosition(shape) {
    let table = document.getElementById('droppable-table');
    // Loop through all table cells to find the previously occupied cells
    for (let row of table.rows) {
        for (let cell of row.cells) {

            //rettangolo 1x2
            if( shape.classList.contains("rectangle-1x2") && cell.contains(shape)){
                cell.classList=''; //cell 1
                cell.style.backgroundColor = '#a1e0af'; // Reset the cell background to default

                let occupiedCell=Number(cell.id)+10;
                occupiedCell=String(occupiedCell);
                occupiedCell=table.rows[ occupiedCell[0] ].cells[occupiedCell[1]];
                occupiedCell.classList=''; //cell under 1
                occupiedCell.style.backgroundColor = '#a1e0af'; // Reset the cell background to default
                break;
            }

            //rettangolo-3x1
            if( shape.classList.contains("rectangle-3x1") && cell.contains(shape)){
                cell.classList=''; //cell 1
                cell.style.backgroundColor = '#a1e0af'; // Reset the cell background to default

                let occupiedCell=Number(cell.id)+1;
                occupiedCell=String(occupiedCell);
                occupiedCell=table.rows[ occupiedCell[0] ].cells[occupiedCell[1]];
                occupiedCell.classList=''; //cell 1 shift right 1
                occupiedCell.style.backgroundColor = '#a1e0af'; // Reset the cell background to default
                occupiedCell=Number(cell.id)+2;
                occupiedCell=String(occupiedCell);
                occupiedCell=table.rows[ occupiedCell[0] ].cells[occupiedCell[1]];
                occupiedCell.classList=''; //cell 1 shift rigth 2 
                occupiedCell.style.backgroundColor = '#a1e0af'; // Reset the cell background to default
                break;
            }
            
            if (cell.contains(shape)) {
                cell.classList='';
                cell.style.backgroundColor = "#a1e0af"; // Reset the cell background to default
            }
               
        }
    }
}

//Script to place the shipt on the battle field

function placeShape(rowIndex, cellIndex, shape, rows, cols, flagRectanglemoved) {
    let table = document.getElementById('droppable-table');

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            
            //every shape first square
            let targetCell = table.rows[rowIndex + r].cells[cellIndex + c];
            targetCell.classList.add('occupied');

            //rectangle-1x2 complete
            if(shape.classList.contains("rectangle-1x2") && flagRectanglemoved){
                let targetCell=table.rows[rowIndex + r +1].cells[cellIndex + c];
                targetCell.classList.add('occupied');
                targetCell.style.backgroundColor = window.getComputedStyle(shape).backgroundColor;
            }
            //rectangle-3x1 complete
            if(shape.classList.contains("rectangle-3x1") && flagRectanglemoved){
                let targetCell=table.rows[rowIndex + r].cells[cellIndex + c + 1];
                targetCell.classList.add('occupied');
                targetCell.style.backgroundColor = window.getComputedStyle(shape).backgroundColor;
                targetCell=table.rows[rowIndex + r].cells[cellIndex + c + 2];
                targetCell.classList.add('occupied');
                targetCell.style.backgroundColor = window.getComputedStyle(shape).backgroundColor;
            }

           // if(r==rows-1 && shape.classList.contains("rectangle-1x2") ) flagRectanglemoved=true;
            targetCell.style.backgroundColor = window.getComputedStyle(shape).backgroundColor;
        }
    }

    // Place the shape in the first target cell
    let firstCell = table.rows[rowIndex].cells[cellIndex];
    firstCell.appendChild(shape);
    firstCell.style.position = 'relative';
    shape.style.position = 'absolute';
    shape.style.top = '0';
    shape.style.left = '0';
}


//Button Functionaity, web socket creation

document.getElementById('send').addEventListener('click', sendFunc);

function sendFunc() {

    //prepare the data

    playerName=document.getElementById("playerName").getAttribute("value")
    /*if(listUsedShapes.length!=9) {
        alert("Place all the ships on the board!");
        return;
    }*/
    let table=document.getElementById("droppable-table")
    for(let r of table.rows){
        for(let c of r.cells){
            if(c.classList!=''){
                occupiedCellsList.push(c.id)
            }
        }
    }

    //WEB SOCKET
    
    let url = "ws://"+window.location.host+"/ws/socket-server"
    shipSocket= new WebSocket(url)

    shipSocket.onmessage = function(e){
        const data = JSON.parse(e.data);
        console.log('Data:',data)
        
        if(data.type=="Connected"){
            shipSocket.send(JSON.stringify({
                "type":"begin",
                "name": playerName,
                "ships": occupiedCellsList,
            }))
        }

        else if(data.type=="Queue"){
            showLoading();
        }

        else if(data.type=="Start"){
            document.getElementById('content').innerHTML = data.page;

            for(let r of table.rows){
                for(let c of r.cells){
                    console.log(c.id)
                    if(occupiedCellsList.includes(c.id)){
                        document.getElementById("A"+c.id).style.backgroundColor="#34c720"
                    }
                }
            }
        }

        else if(data.type=="opponent_move"){

            if(data.hit){
                document.getElementById("A"+data.cell).style.backgroundColor="red"
                document.getElementById("A"+data.cell).textContent="X"
            }
            else{
                document.getElementById("A"+data.cell).style.backgroundColor="white"
                document.getElementById("A"+data.cell).textContent="O"
            }

            document.getElementById("turn_on").textContent="Your Turn"
            document.getElementById('ClickableTable').addEventListener('click', rilevaCella);

        }

        else if(data.type=="ack_hit"){

            if(data.hit){
                document.getElementById("B"+data.cell).style.backgroundColor="red"
                document.getElementById("B"+data.cell).textContent="X"
            }
            else{
                document.getElementById("B"+data.cell).style.backgroundColor="white"
                document.getElementById("B"+data.cell).textContent="O"
            }
            document.getElementById("turn_on").textContent="Opponent's turn"
            document.getElementById('ClickableTable').removeEventListener('click')
        }

        else if(data.type=="win"){
            document.getElementById("youWinLost").classList.add("youwin-text")
            document.getElementById("youWinLost").textContent="YOU WIN"
            showEndgame()
        }
        else if(data.type=="lost"){
            document.getElementById("youWinLost").classList.add("youlost-text")
            document.getElementById("youWinLost").textContent="YOU LOST"
            showEndgame()
        }

        else if(data.type=="turn_on"){
            document.getElementById("turn_on").textContent="Your Turn"
            document.getElementById('ClickableTable').addEventListener('click', rilevaCella);
        }
        else if(data.type=="turn_off"){
            document.getElementById("turn_on").textContent="Opponent's turn"
        }
    }
}


//Queue Status desing script 
function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex'; // Mostra l'overlay
    document.body.classList.add('blur-active'); // Aggiunge l'effetto sfocatura
}

// Function which manages the click of a table's cell
function rilevaCella(event) {
    const cella = event.target;  
    if (cella.tagName === 'TD') {  
        shipSocket.send(JSON.stringify({
            "type":"hit",
            "cell":cella.id.substr(1,2)
        }))
    }
}

function showEndgame() {

    // Seleziona il contenitore della scritta YOU WIN
    var youWin = document.getElementById('youwin');
    var overlay = document.getElementById('overlay');

    // Aggiungi la classe per far partire l'animazione
    youWin.classList.add('show');
    overlay.classList.add('show');

    // Sfoca il contenuto della pagina
    document.querySelector('.content').classList.add('blur-background')

}

