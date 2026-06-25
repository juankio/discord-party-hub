const fs = require('fs');

const rotatePoint = (x, y, degrees) => {
	const rad = (degrees * Math.PI) / 180;
	return {
		x: x * Math.cos(rad) - y * Math.sin(rad),
		y: x * Math.sin(rad) + y * Math.cos(rad),
	};
};

const res = {
  p0: rotatePoint(0, -1, 0),
  p1: rotatePoint(0, -1, 90),
  p2: rotatePoint(0, -1, 180),
  p3: rotatePoint(0, -1, 270)
};

fs.writeFileSync('output.json', JSON.stringify(res, null, 2));