function Cell () {
	let current_status = Math.random() >= 0.5 ? true : false;

	this.alive = {
		current: current_status,
		next: false
	};

	this.generation = 0;
}

function Ecosystem (cell_count) {
	this.cells = new Array(cell_count);
	for (let i = 0; i < cell_count; i++) {
		this.cells[i] = new Array(cell_count);
	}

	for (let i = 0; i < this.cells.length; i++) {
		for (let j = 0; j < this.cells[i].length; j++) {
			this.cells[i][j] = new Cell();
		}
	}
}

Ecosystem.prototype.renderTo = function (canvas) {
	let ctx = canvas.getContext('2d');

	let rect_template = {
		w: canvas.width / this.cells.length,
		h: canvas.height / this.cells.length
	};

	let that = this;
	let frame_count = 0;
	let last_timestamp = 0;

	let renderFrame = function (timestamp) {
		
		if (last_timestamp == 0)
			last_timestamp = performance.now();

		let delta = timestamp - last_timestamp;


		if (delta < 150) {
			window.requestAnimationFrame(renderFrame);
			return;
		}
		last_timestamp = timestamp;
		

		ctx.clearRect(0, 0, canvas.width, canvas.height);
		that.update();

		for (let i = 0; i < that.cells.length; i++) {
			for (let j = 0; j < that.cells.length; j++) {

				let cell = that.cells[i][j];


				if (cell.alive.current === true) {
					//ctx.fillStyle = 'black';
					ctx.fillStyle = 'RGB(' + Math.min(255, cell.generation) + ', 0, 0)';
					ctx.fillRect(rect_template.w * i, rect_template.h * j, rect_template.w, rect_template.h);
				}

				else if (cell.alive.current === false) {
					ctx.fillStyle = 'white';
					ctx.fillRect(rect_template.w * i, rect_template.h * j, rect_template.w, rect_template.h);
				}
			}
		}
		window.requestAnimationFrame(renderFrame);
	}
	window.requestAnimationFrame(renderFrame);
};

Ecosystem.prototype.getLiveNeighboursCount = function (cell_x, cell_y) {
	let values = [];
	let live_count = 0;

	let top_left = {
		x: cell_x === 0 ? this.cells.length - 1 : cell_x - 1,
		y: cell_y === 0 ? this.cells[cell_y].length - 1 : cell_y - 1,
	};

	values.push(top_left);

	let top_middle = {
		x: cell_x,
		y: cell_y === 0 ? this.cells[cell_y].length - 1 : cell_y - 1,
	};

	values.push(top_middle);

	let top_right = {
		x: cell_x === this.cells.length - 1 ? 0 : cell_x + 1,
		y: cell_y === 0 ? this.cells[cell_y].length - 1 : cell_y - 1,
	};

	values.push(top_right);

	let middle_left = {
		x: cell_x === 0 ? this.cells.length - 1 : cell_x - 1,
		y: cell_y
	};

	values.push(middle_left);
	/*
	let middle_middle = {
		x: cell_x,
		y: cell_y
	};

	values.push(middle_middle);
	*/
	let middle_right = {
		x: cell_x === this.cells.length - 1 ? 0 : cell_x + 1,
		y: cell_y
	};

	values.push(middle_right);

	let bottom_left = {
		x: cell_x === 0 ? this.cells.length - 1 : cell_x - 1,
		y: cell_y === this.cells[cell_y].length - 1 ? 0 : cell_y + 1,
	};

	values.push(bottom_left);

	let bottom_middle = {
		x: cell_x,
		y: cell_y === this.cells[cell_y].length - 1 ? 0 : cell_y + 1,
	};

	values.push(bottom_middle);

	let bottom_right = {
		x: cell_x === this.cells.length - 1 ? 0 : cell_x + 1,
		y: cell_y === this.cells[cell_y].length - 1 ? 0 : cell_y + 1,
	};

	values.push(bottom_right);

	for (let i = 0; i < values.length; i++) {
		let x = values[i].x;
		let y = values[i].y;

		if (this.cells[x][y].alive.current) {
			live_count++;
		}
	}

	return live_count;
	
};
	
Ecosystem.prototype.update = function () {
	//clear next cells status
	for (let i = 0; i < this.cells.length; i++) {
		for (let j = 0; j < this.cells[i].length; j++) {
			this.cells[i][j].alive.next = false;
		}
	}

	//update status
	for (let i = 0; i < this.cells.length; i++) {
		for (let j = 0; j < this.cells[i].length; j++) {
			let liveNeighbours = this.getLiveNeighboursCount(i, j);
			let alive = this.cells[i][j].alive.current;

			if (!alive && liveNeighbours == 3) {
				this.cells[i][j].alive.next = true;
				this.cells[i][j].generation = 0;
				//console.log('Cell revived!');
			}

			else if (alive && (liveNeighbours == 2 || liveNeighbours == 3)) {
				this.cells[i][j].alive.next = true;
				this.cells[i][j].generation++;
				//console.log('Cell remains alive!');
			}
			else {
				this.cells[i][j].alive.next = false;
				//console.log('Cell killed!');
			}

		}
	}

	//flip status
	for (let i = 0; i < this.cells.length; i++) {
		for (let j = 0; j < this.cells[i].length; j++) {
			this.cells[i][j].alive.current = this.cells[i][j].alive.next;
		}
	}

};

var canvas = document.querySelector('canvas');
canvas.width = 800;
canvas.height = 600;

es = new Ecosystem(50);
es.renderTo(canvas);