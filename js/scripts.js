var mainarea = document.querySelector(".main");
var finisharea = document.querySelector(".finish")
var buttons; //represents the buttons in the html
var nummines = 40; //temp variable, number of mines left to put into array
var initialmines = 40; //number of mines at start
var boxsidedimension = 16; //dimensions of game field
var gameIsSetup = false; //is game setup?
var boxarray; //stores the main game data in a 2d array
var temparray; //temp array for data for sorting before putting into main array
var playboxes; //represents each box of the game field
var tempoutputstring; //temp string holder for html output
var tempstringholder; //temp string holder for merging ids
var mineids; //holds info about which fields of array mines are in
var boxesrevealedcount; //how many boxes have been revealed so far
var gameover; //is game finished?



//MAIN, runs once on page launch to get app started
initialPageSetup();
refreshplayboxes();

//output winning line upon completion
function displaywin() {
	finisharea.innerHTML += "<h1>YOU WIN!</h1>";
}

//sets up the function of the level1/level2/restart game buttons
function getbuttons() {
	for (var i=0; i < buttons.length; i++) {

			buttons[i].onclick = function() {
				//level 2 button
				if (this.id == "Medium") {
						nummines = 40;
						initialmines = 40;
						boxsidedimension = 16;
						gameIsSetup	= false;
						gameover = false;
						finisharea.innerHTML = "";
				}
				//level 1 button
				else {
						nummines = 10;
						initialmines = 10;
						boxsidedimension = 8;
						gameIsSetup	 = false;
						gameover = false;
						finisharea.innerHTML = "";
				}
				//rerun initial page setup with new/restarted info
				initialPageSetup();
				refreshplayboxes();

			}
	}
}

//handles right clicking the main game area (for showing minesweeper flags)
function rightClicker(obj) {

	//if box hasnt been revealed yet and game is still going, show flag
	if (obj.innerHTML == "" && gameover == false) {
		obj.innerHTML = "<img src='img/flag.png' style='height: 80%; width: 80%; margin: 0;'>";
	}

	//hide flag if flag current showing and game still going
	else if (obj.innerHTML.indexOf("img") != -1 && gameover == false) {
		obj.innerHTML = "";
	}
	//otherwise do nothing
	else {
		
	}
	//hide default right click menu
	return false;
	
	
}

//refreshes the game field boxes to initial state
function refreshplayboxes() {

playboxes = document.querySelectorAll(".box");
for (var i=0; i < playboxes.length; i++) {
	//setup what happens when a box is clicked
	playboxes[i].onclick = function() { 
		//setup the game if first click
		if (gameIsSetup == false) {
		setup(this);
		gameIsSetup = true; }

		//otherwise reveal the box/surrounding boxes if applicable
		revealbox(this);

		//check if game is over
		checkifwon();

	};
	
}
}

//disable clicking boxes after game has ended
function disableplayboxes() {

	playboxes = document.querySelectorAll(".box");
	for (var i=0; i < playboxes.length; i++) {
	playboxes[i].onclick = function() { 
		//do nothing
	};
}
}

/////////////////////////////////////////////////////////
//
//
//setup the page as initial, depending on difficulty selected
function initialPageSetup() {

//setup game board depending on size wanted, tempstring used to avoid default table formatting issues
tempoutputstring = "<table><tr><th colspan = '" + boxsidedimension + "'><button id = 'Easy'>Level 1 / Restart</button><button id = 'Medium'>Level 2 / Restart</button><h1>MINESWEEPER</h1></th></tr>";
for (var i = 0; i < boxsidedimension; i++) {
	tempoutputstring += "<tr>";
	for (var j = 0; j < boxsidedimension; j++) { 
		tempoutputstring += "<td oncontextmenu='rightClicker(this); return false;' class='box' id='" + i + "s" + j +"'></td>";
	}
	tempoutputstring += "</tr>";
}
tempoutputstring += "</table>";
mainarea.innerHTML = tempoutputstring; //push to page

//create a temp 1D array with desired number of mines, mines = "M", rest = 0.
temparray = new Array(boxsidedimension * boxsidedimension);
for (i=0;i <temparray.length; i++) {
	if (nummines>0) {
			temparray[i] = "M";
			nummines--;
		} 
		else {
			temparray[i] = 0;
		}
}

//run/refresh the button functions
buttons = document.querySelectorAll("button");
getbuttons();
}


/////////////////////////////////////////////////////
//
//
//setup the game after the first click of the board, safeidbox is the box clicked, which cannot contain a mine
function setup(safeidbox){

//shuffle the temp array w/ shuffle algorithm
do {
	shuffle(temparray);

	//create empty 2d array to be used to store game data
	boxarray = new Array(boxsidedimension);
	for (i=0;i < boxarray.length; i++) {
		boxarray[i] = Array(boxsidedimension);
	}

	gameover = false; //in case of setup after already playing
	mineids = []; //empty array holding the mine positions
	boxesrevealedcount = 0; //reset the # of boxes revealed

	//put the temp array into the 2d array to represent the minefield
	//fill the 2d array with data about how many times each box is touching a mine box
	var k=0;
	for (var i = 0; i < boxsidedimension; i++) {
		for (var j = 0; j < boxsidedimension; j++) { 
			if (temparray[k] == "M") {
				boxarray[i][j] = temparray[k]; 
				mineids.push(i + "s" + j); //if its a mine, put info into mine array
				incrementaroundbox(i, j); //increment boxes around mine by 1 to reflect touching (function handles exceptions)
				}
			else {
				//if no mine or data number is in a box yet, put in a blank space
				if (temparray[k] == "0" && boxarray[i][j] == null) {
					boxarray[i][j] = " ";
				}
			}
			k++;
		}
	}
	tempstringsholder = safeidbox.id.split("s"); //get the id of the box which cant have mine in it
	}
//repeat this process if spaced clicked generated a mine in it
while (boxarray[tempstringsholder[0]][tempstringsholder[1]] != " ");

//refresh game field boxes to reflect setup state
refreshplayboxes();
}


/////////////////
//
//reveals the selected box and the area around it if applicable
function revealbox(box) {
	//get 2D array id of the box
	tempstringsholder = box.id.split("s");
	var firstid = tempstringsholder[0];
	var secondid = tempstringsholder[1];

	//if a mine is clicked
	if (boxarray[firstid][secondid] == "M") {
		//show all mines
		for (i in mineids) {
			document.getElementById(mineids[i]).style.backgroundColor = "#e6e6e6";
			document.getElementById(mineids[i]).innerHTML = "<img src='img/mine.png' style='height: 80%; width: 80%; margin: 0;'>"
		}
		//show clicked mine as red
		box.style.background = "#ff9999";
		box.innerHTML ="<img src='img/mine.png' style='height: 80%; width: 80%; margin: 0;'>"
		//disable the game board until restart
		disableplayboxes();
		gameover = true;
	}

	else {
		//reveal box and area around it if applicable. Runs recursively.
		checkandrevealsides(firstid, secondid);
	
	}
}

//recursive function to check a box and all the spaces around it
function checkandrevealsides(firstid, secondid) {

	firstid = parseInt(firstid);
	secondid = parseInt(secondid);
	//if a box has not been revealed yet or is a flag marked box)
	if (document.getElementById(firstid + "s" + secondid).innerHTML == "" || document.getElementById(firstid + "s" + secondid).innerHTML.indexOf("img") != -1) {

		//reveal the box
		document.getElementById(firstid + "s" + secondid).innerHTML = boxarray[firstid][secondid];
		document.getElementById(firstid + "s" + secondid).style.background = "#e6e6e6";

		//give the revealed info the proper color depending..
		if (document.getElementById(firstid + "s" + secondid).innerHTML == "1") {
			document.getElementById(firstid + "s" + secondid).style.color = "blue";
		}
		if (document.getElementById(firstid + "s" + secondid).innerHTML == "2") {
			document.getElementById(firstid + "s" + secondid).style.color = "green";
		}
		if (document.getElementById(firstid + "s" + secondid).innerHTML == "3") {
			document.getElementById(firstid + "s" + secondid).style.color = "red";
		}
		if (document.getElementById(firstid + "s" + secondid).innerHTML >= "4") {
			document.getElementById(firstid + "s" + secondid).style.color = "brown";
		}
		//incr the # of revealed boxes
		boxesrevealedcount++;

		//if a box is blank, reveal the boxes around it as per minesweeper rules
		if (boxarray[firstid][secondid] == " ") {
			//check left
			if (secondid > 0) { checkandrevealsides(firstid, secondid-1); }
			//check top left
			if (secondid > 0 && firstid > 0) { checkandrevealsides(firstid-1, secondid-1); }
			//check bottom left
			if (secondid > 0 && firstid < boxsidedimension-1) { checkandrevealsides(firstid+1, secondid-1); }
			//check right
			if (secondid < boxsidedimension-1) { checkandrevealsides(firstid, secondid+1); }
			//check top right
			if (firstid > 0 && secondid < boxsidedimension-1) { checkandrevealsides(firstid-1, secondid+1); }
			//check bottom right
			if (firstid < boxsidedimension-1 && secondid < boxsidedimension-1) { checkandrevealsides(firstid+1, secondid+1); }
			//check top
			if (firstid > 0) { checkandrevealsides(firstid-1, secondid); }
			//check bottom
			if (firstid < boxsidedimension-1) { checkandrevealsides(firstid+1, secondid); }


			} 
	}
}

//check if the game is won
function checkifwon() {
		//if boxes revealed is equal the total boxes minus the initial mines, the game is won.
		if (boxesrevealedcount == (parseInt(boxsidedimension)*parseInt(boxsidedimension) - parseInt(initialmines))) {
		
		//show all mines
		for (i in mineids) {
			document.getElementById(mineids[i]).style.backgroundColor = "#ccffcc";
			document.getElementById(mineids[i]).innerHTML = "<img src='img/mine.png' style='height: 80%; width: 80%; margin: 0;'>"
		}
		//disable the gamefield until reset, and show winning message
		disableplayboxes();
		displaywin();
		gameover = true;
	}
}


//shuffle algorithm (fisher-yates) function
function shuffle (array) {
  var i = 0
    , j = 0
    , temp = null

  for (i = array.length - 1; i > 0; i -= 1) {
    j = Math.floor(Math.random() * (i + 1))
    temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
}

//////////////////
//
//Increment the values of the boxes around the selected box with the given firstid/secondid.
//For each one, make sure the boxes around are in the game field and mines are not incremented.
//If box is null, make it 1, otherwise increment current value by 1.
function incrementaroundbox(firstid, secondid) {

	//incr bottom
	if (firstid < boxsidedimension-1) {
		if (boxarray[firstid+1][secondid] != "M") {
			if (boxarray[firstid+1][secondid] == null) {
				boxarray[firstid+1][secondid] = 1;
			}
			else {boxarray[firstid+1][secondid]++; }
		}
	}

	//incr top
	if (firstid > 0) {
		if (boxarray[firstid-1][secondid] != "M") {
			if (boxarray[firstid-1][secondid] == null) {
				boxarray[firstid-1][secondid] = 1;
			}
			else {boxarray[firstid-1][secondid]++; }
	}}

	//incr bottom right
	if (firstid < boxsidedimension-1 && secondid < boxsidedimension-1) {
		if (boxarray[firstid+1][secondid+1] != "M") {
			if (boxarray[firstid+1][secondid+1] == null) {
					boxarray[firstid+1][secondid+1] = 1;
			}
			else {boxarray[firstid+1][secondid+1]++; }
		}
	}

	//incr top right
	if (firstid > 0 && secondid < boxsidedimension-1) {
		if (boxarray[firstid-1][secondid+1] != "M") {
			if (boxarray[firstid-1][secondid+1] == null) {
					boxarray[firstid-1][secondid+1] = 1;
			}
			else {boxarray[firstid-1][secondid+1]++; }
	}
}

	//incr right
	if (secondid < boxsidedimension-1) {
		if (boxarray[firstid][secondid+1] != "M") {
			if (boxarray[firstid][secondid+1] == null) {
				boxarray[firstid][secondid+1] = 1;
			}
			else {boxarray[firstid][secondid+1]++; }
	}
}

	//incr bottom left
	if (secondid > 0 && firstid < boxsidedimension-1) {
		if (boxarray[firstid+1][secondid-1] != "M") {
			if (boxarray[firstid+1][secondid-1] == null) {
					boxarray[firstid+1][secondid-1] = 1;
			}
			else {boxarray[firstid+1][secondid-1]++; }
	}
}

	//incr top left
	if (secondid > 0 && firstid > 0) {
		if (boxarray[firstid-1][secondid-1] != "M") {
			if (boxarray[firstid-1][secondid-1] == null) {
					boxarray[firstid-1][secondid-1] = 1;
			}
			else {boxarray[firstid-1][secondid-1]++; }
	} }

	//incr left
	if (secondid > 0) {
		if (boxarray[firstid][secondid-1] != "M") {
			if (boxarray[firstid][secondid-1] == null) {
					boxarray[firstid][secondid-1] = 1;
			}
			else {boxarray[firstid][secondid-1]++; }
	}
}
}
