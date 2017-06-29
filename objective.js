(function() {

	function Player(piece, ai) {
		this.piece = piece;
		this.controller = ai ? 'ai' : 'human';
		this.nextMove = null;
		var t = this;
	}

	Player.prototype.GetMove = function(board) {
		var square;
		switch (this.controller) {
			case 'human':
				square = board.GetLastClicked();
				break;
			case 'ai':
				square = this.analyseBoard(board);
				break;
		}
		return new Move(square, this);
	}

	Player.prototype.analyseBoard = function(board) {
		for(var x = 0; x <= 2; x++) {
			for(var y = 0; y <= 2; y++) {
				if(board.squares[x][y].owner === null) {
					return board.squares[x][y];
				}
			}
		}
	}

	function Move(square, player) {
		this.square = square;
		this.player = player;
	}

	function Square(domElement, board) {
		this.domElement = domElement;
		this.board = board;
		var t = this;
		domElement.addEventListener('click', function() {
			board.SetLastClicked(t);
		});
		this.owner = null; // Player
	}

	Square.prototype.Activate = function(player) {
		this.owner = player;
		this.domElement.innerHTML = player.piece;
	}

	Square.prototype.Reset = function() {
		this.owner = null;
		this.domElement.innerHTML = '';
	}

	function Board() {
		this.squares = [[null, null, null],[null, null, null],[null, null, null]];
		for(var x = 0; x <= 2; x++) {
			for(var y = 0; y <= 2; y++) {
				this.squares[x][y] = new Square(document.querySelector('.js-x' + x + 'y' + y), this);
			}
		}
		this.lastClicked = null;
	}

	Board.prototype.SetLastClicked = function(lastClicked) {
		this.lastClicked = lastClicked;
	}

	/* Retrieve the last clicked square */
	Board.prototype.GetLastClicked = function() {
		var temp = this.lastClicked;
		this.lastClicked = null;
		return temp;
	}

	Board.prototype.Reset = function() {
		this.lastClicked = null;
		for(var y = 0; y <= 2; y++) {
			for(var x = 0; x <= 2; x++) {
				this.squares[x][y].Reset();
			}
		}
	}

	Board.prototype.CheckThreeInRow = function() {
		var s = this.squares;
		for(var y = 0; y <= 2; y++) {
			if (s[0][y].owner !== null && s[0][y].owner === s[1][y].owner && s[1][y].owner === s[2][y].owner) {
				return s[0][y].owner;
			}
		}
		for(var x = 0; x <= 2; x++) {
			if (s[x][0].owner !== null && s[x][0].owner === s[x][1].owner && s[x][1].owner === s[x][2].owner) {
				return s[x][0].owner;
			}
		}
		if (s[0][0].owner !== null && s[0][0].owner === s[1][1].owner && s[1][1].owner === s[2][2].owner) {
			return s[0][0].owner;
		}
		if (s[2][0].owner !== null && s[2][0].owner === s[1][1].owner && s[1][1].owner === s[0][2].owner) {
			return s[2][0].owner;
		}
		return null;
	}

	Board.prototype.ApplyMove = function(move) {
		if(move.square !== null && move.square.owner === null) {
			move.square.Activate(move.player)
			return true;
		}
		return false;
	}

	function Game() {
		this.board = new Board();
		this.players = [new Player('O', true), new Player('X', false)];
		this.currentTurn = 0;
	}

	Game.prototype.ProcessTurn = function() {
		var currentPlayer = this.players[this.currentTurn % 2];
		var t = this;
		setTimeout(function() {
			var currentMove = currentPlayer.GetMove(t.board);
			var moveSuccess = t.board.ApplyMove(currentMove);
			if(moveSuccess) {
				t.Run();
			} else {
				t.ProcessTurn();
			}
		}, 100);	
	}

	Game.prototype.CheckWinner = function() {
		return this.board.CheckThreeInRow();
	}

	Game.prototype.CheckDraw = function() {
		return this.currentTurn > 8;
	}

	Game.prototype.Run = function() {
		if(!this.CheckWinner() && !this.CheckDraw()) {
			this.currentTurn++;
			this.ProcessTurn();
			return;
		}
		var winner = this.CheckWinner();
		if(winner === null) {
			document.querySelector('.js-messages').innerHTML = 'Draw!';
		} else {
			document.querySelector('.js-messages').innerHTML = 'Player ' + winner.piece + ' wins!';
		}
		var t = this;
		setTimeout(t.Reset.bind(t), 1618);
	}

	Game.prototype.Reset = function() {
		document.querySelector('.js-messages').innerHTML = '';
		this.board.Reset();
		this.currentTurn = 0;
		this.Run();
	}

	var game = new Game();
	game.Run();

})();