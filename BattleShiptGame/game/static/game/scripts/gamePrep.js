var disposition={}

document.querySelectorAll('.draggable').forEach(draggable => {
    draggable.addEventListener('dragstart', function (event) {
        event.dataTransfer.setData('text', event.target.id);
    });
});

// Make the table cells droppable
document.querySelectorAll('#droppable-table td').forEach(cell => {
    // When the dragged element is over a cell
    cell.addEventListener('dragover', function (event) {
        event.preventDefault(); // Allows the drop
    });

    // Handle the drop event
    cell.addEventListener('drop', function (event) {
        event.preventDefault();
        let squareId = event.dataTransfer.getData('text'); // Get the id of the dragged element
        let square = document.getElementById(squareId);
        if (!cell.hasChildNodes()) { // Make sure the cell is empty before dropping the square
            disposition[squareId]=cell.attributes.id.nodeValue
            console.log(disposition)
            cell.appendChild(square);
        }
    });
});
