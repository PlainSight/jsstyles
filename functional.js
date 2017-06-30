(function() {

	var state = {
		turn: 0,
		board: [
			[createSquare(0, 0), createSquare(0, 1), createSquare(0, 2)],
			[createSquare(1, 0), createSquare(1, 1), createSquare(1, 2)],
			[createSquare(2, 0), createSquare(2, 1), createSquare(2, 2)]
		],
		players: [{
				piece: 'X',
				controller: 'human'
			},{
				piece: 'O',
				controller: 'ai'
			}
		],
		running: true
	}

	function checkWinner(gameState) {
		var board = gameState.board;
		for(var y = 0; y <= 2; y++) {
			if (board[0][y].owner !== null && board[0][y].owner === board[1][y].owner && board[1][y].owner === board[2][y].owner) {
				return board[0][y].owner;
			}
		}
		for(var x = 0; x <= 2; x++) {
			if (board[x][0].owner !== null && board[x][0].owner === board[x][1].owner && board[x][1].owner === board[x][2].owner) {
				return board[x][0].owner;
			}
		}
		if (board[0][0].owner !== null && board[0][0].owner === board[1][1].owner && board[1][1].owner === board[2][2].owner) {
			return board[0][0].owner;
		}
		if (board[2][0].owner !== null && board[2][0].owner === board[1][1].owner && board[1][1].owner === board[0][2].owner) {
			return board[2][0].owner;
		}
		return null;
	}

	function checkDraw(gameState) {
		return gameState.turn > 8;
	}

	function reset(gameState) {
		var newGameState = {
			turn: 0,
			board: [
				[cloneAndResetSquare(gameState.board[0][0]), cloneAndResetSquare(gameState.board[0][1]), cloneAndResetSquare(gameState.board[0][2])],
				[cloneAndResetSquare(gameState.board[1][0]), cloneAndResetSquare(gameState.board[1][1]), cloneAndResetSquare(gameState.board[1][2])],
				[cloneAndResetSquare(gameState.board[2][0]), cloneAndResetSquare(gameState.board[2][1]), cloneAndResetSquare(gameState.board[2][2])],
			],
			players: gameState.players,
			running: true
		};
		drawBoard(newGameState);
		document.querySelector('.js-messages').innerHTML = '';

		state = newGameState;
	}

	function checkEndgame(gameState) {
		var running = true;
		if (checkWinner(gameState)) {
			document.querySelector('.js-messages').innerHTML = 'Player ' + gameState.players[(gameState.turn - 1) % 2].piece + ' wins!';
			running = false;
		} else if(checkDraw(gameState)) {
			document.querySelector('.js-messages').innerHTML = 'Draw!';
			running = false;
		}

		var newGameState = {
			turn: gameState.turn,
			board: [
				[cloneSquare(gameState.board[0][0]), cloneSquare(gameState.board[0][1]), cloneSquare(gameState.board[0][2])],
				[cloneSquare(gameState.board[1][0]), cloneSquare(gameState.board[1][1]), cloneSquare(gameState.board[1][2])],
				[cloneSquare(gameState.board[2][0]), cloneSquare(gameState.board[2][1]), cloneSquare(gameState.board[2][2])],
			],
			players: gameState.players,
			running: running
		};

		return newGameState;
	}

	function drawBoard(gameState) {
		for (var x = 0; x <= 2; x++) {
			for (var y = 0; y <= 2; y++) {
				var square = gameState.board[x][y];
				square.domElement.innerHTML = square.owner !== null ? square.owner.piece : '';
			}
		}
	}

	function processTurn(gameState, action) {
		var newGameState = {
			turn: gameState.turn,
			board: [
				[cloneSquare(gameState.board[0][0]), cloneSquare(gameState.board[0][1]), cloneSquare(gameState.board[0][2])],
				[cloneSquare(gameState.board[1][0]), cloneSquare(gameState.board[1][1]), cloneSquare(gameState.board[1][2])],
				[cloneSquare(gameState.board[2][0]), cloneSquare(gameState.board[2][1]), cloneSquare(gameState.board[2][2])],
			],
			players: gameState.players,
			running: true
		};

		// valid move
		if(gameState.board[action.x][action.y].owner === null) {
			newGameState.board[action.x][action.y].owner = gameState.players[gameState.turn % 2];
			newGameState.turn = gameState.turn + 1;
			drawBoard(newGameState);
			return newGameState;
		}

		return gameState;
	}

	function determineBestMove(gameState) {
		var validMoves = [];
		for(var x = 0; x <= 2; x++) {
			for(var y = 0; y <= 2; y++) {
				if(gameState.board[x][y].owner === null) {
					validMoves.push({x: x, y: y });
				}
			}
		}
		return validMoves[Math.floor(validMoves.length * Math.random())];
	}

	function clickListener(x, y) {
		if(state.running) {
			var currentTurn = state.turn;
			state = processTurn(state, {x: x, y: y});
			state = checkEndgame(state);

			if(currentTurn !== state.turn && state.running && state.players[state.turn % 2].controller === 'ai') {
				var move = determineBestMove(state);
				state = processTurn(state, move);
				state = checkEndgame(state);
			}
		} else {
			reset(state);
		}
	}

	function createSquare(x, y) {
		var square = {
			domElement: document.querySelector('.js-x' + x + 'y' + y),
			owner: null
		};
		square.eventHandler = square.domElement.addEventListener('click', function() {
			clickListener(x, y);
		});
		return square;
	}

	function cloneSquare(square) {
		return {
			domElement: square.domElement,
			owner: square.owner
		};
	}

	function cloneAndResetSquare(square) {
		return {
			domElement: square.domElement,
			owner: null
		};
	}

})();