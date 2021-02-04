function getChecked() {
	var inp = document.querySelectorAll(':checked');
	var map = document.getElementById('map');
	var ids = ['x=' + map.scrollLeft, 'y=' + map.scrollTop];
	for (var i of inp) {
		ids.push(i.id);
	}
	return ids;
}

document.addEventListener('DOMContentLoaded', (event) => {
    window.mousedown = false;
	var map = document.getElementById('map');
	var hash = document.location.hash.substr(1).split(',');

	for (var h of hash) {
		let id = document.getElementById(h);
		if (h[1] == '=') {
			let pos = parseInt(h.substr(2));
			if (h[0] == 'x') {
				map.scrollLeft = pos;
			} else if (h[0] == 'y') {
				map.scrollTop = pos;
			}
		} else if (id) {
			id.checked = true;
		}
	}
	map.scrollTop = map.scrollTop || 3000;
	map.scrollLeft = map.scrollLeft || 6750;
	document.location.hash = getChecked().join(',')

	onmousedown = function(e) {
		if (e.target instanceof HTMLImageElement) {
			e.preventDefault();
			window.mousedown = true;
		}
	}
	onmouseup = function(e) {
		window.mousedown = false;
		document.location.hash = getChecked().join(',');
	}

	onmousemove = function(e) {
		if (window.mousedown) {
			var map = document.getElementById('map');
			map.scrollTop -= e.movementY;
			map.scrollLeft -= e.movementX;
		}
	}

	onchange = function(e) {
		if (e.target instanceof HTMLInputElement) {
			document.location.hash = getChecked().join(',')
		}
	}
});
