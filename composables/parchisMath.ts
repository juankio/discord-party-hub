export interface TrackSquare {
	points: string;
	fill: string;
	isSalida: boolean;
	isSeguro: boolean;
	isTip: boolean;
	cx: number;
	cy: number;
	rot: number;
}

export interface LlegadaPath {
	points: string;
	color: string;
	isFinal: boolean;
	cx: number;
	cy: number;
	rot: number;
}

export interface Wedge {
	points: string;
	color: string;
	cx: number;
	cy: number;
	spots: { x: number; y: number }[];
}

export function rotatePoint(x: number, y: number, degrees: number) {
	const rad = (degrees * Math.PI) / 180;
	return {
		x: x * Math.cos(rad) - y * Math.sin(rad),
		y: x * Math.sin(rad) + y * Math.cos(rad),
	};
}

export const PARCHIS_COLORS = [
	"#eab308", "#3b82f6", "#ef4444", "#4ade80",
	"#a855f7", "#f97316", "#ec4899", "#06b6d4",
];

export function computeParchisGeometry(sides: number) {
	const colorPalette = PARCHIS_COLORS;
	const N = Math.max(4, Number(sides) || 4);
	const M = Math.tan(Math.PI / N);
	const innerRadius = (75 / M) - 50;
	const R_max = innerRadius + 460;
	const trueRadius = R_max / Math.cos(Math.PI / N);
	const strokeMargin = 12;
	const size = (trueRadius + strokeMargin) * 2;
	const dynamicViewBox = `${-(trueRadius + strokeMargin)} ${-(trueRadius + strokeMargin)} ${size} ${size}`;
	const dynamicBoardSize = (trueRadius + strokeMargin) * 2;

	const basePolygonPoints = Array.from({ length: N }).map((_, i) => {
		const pt = rotatePoint(R_max * Math.tan(Math.PI / N), -R_max, -i * (360 / N));
		return `${pt.x},${pt.y}`;
	}).join(" ");

	const rowHeight = 50;
	const trackSquares: TrackSquare[] = [];
	const llegadaPaths: LlegadaPath[] = [];
	const wedges: Wedge[] = [];
	const coordsMap = { track: [] as {x: number, y: number}[], meta: [] as {x: number, y: number}[][], wedges: [] as {spots: {x: number, y: number}[]}[] };

	const toPts = (pts: {x: number, y: number}[], angle: number) => pts.map(p => {
		const rot = rotatePoint(p.x, p.y, angle);
		return `${rot.x},${rot.y}`;
	}).join(" ");

	for (let p = 0; p < N; p++) {
		const armAngle = -p * (360 / N);
		const baseColor = colorPalette[p % colorPalette.length] || "#ffffff";

		// Right side of arm
		for (let row = 0; row < 8; row++) {
			const y_bot = -innerRadius - row * rowHeight, y_top = -innerRadius - (row + 1) * rowHeight;
			const pts = row === 0 
				? [ { x: 25, y: y_bot }, { x: Math.abs(y_bot) * M, y: y_bot }, { x: 75, y: y_top }, { x: 25, y: y_top } ]
				: [ { x: 25, y: y_bot }, { x: 75, y: y_bot }, { x: 75, y: y_top }, { x: 25, y: y_top } ];
			const cx = row === 0 ? (25 + Math.abs(y_bot - 25) * M) / 2 : 50;
			const center = rotatePoint(cx, y_bot - 25, armAngle);
			trackSquares.push({ points: toPts(pts, armAngle), fill: row === 4 ? "#fcd34d" : "#f5ebd5", isSalida: false, isSeguro: row === 4, isTip: false, cx: center.x, cy: center.y, rot: armAngle });
			coordsMap.track[p * 17 + row] = center;
		}

		// Tip
		const tipY = -innerRadius - 400;
		const tipPts = [ {x: -75, y: tipY}, {x: 75, y: tipY}, {x: 75, y: tipY - 50}, {x: -75, y: tipY - 50} ];
		const tipCenter = rotatePoint(0, tipY - 25, armAngle);
		trackSquares.push({ points: toPts(tipPts, armAngle), fill: "#fcd34d", isSalida: false, isSeguro: true, isTip: true, cx: tipCenter.x, cy: tipCenter.y, rot: armAngle });
		coordsMap.track[p * 17 + 8] = tipCenter;

		// Left side of arm
		for (let row = 7; row >= 0; row--) {
			const y_bot = -innerRadius - row * rowHeight, y_top = -innerRadius - (row + 1) * rowHeight;
			const pts = row === 0 
				? [ { x: -Math.abs(y_bot) * M, y: y_bot }, { x: -25, y: y_bot }, { x: -25, y: y_top }, { x: -75, y: y_top } ]
				: [ { x: -75, y: y_bot }, { x: -25, y: y_bot }, { x: -25, y: y_top }, { x: -75, y: y_top } ];
			const cx = row === 0 ? (-25 + -Math.abs(y_bot - 25) * M) / 2 : -50;
			const center = rotatePoint(cx, y_bot - 25, armAngle);
			trackSquares.push({ points: toPts(pts, armAngle), fill: row === 4 ? baseColor : "#f5ebd5", isSalida: row === 4, isSeguro: true, isTip: false, cx: center.x, cy: center.y, rot: armAngle });
			coordsMap.track[p * 17 + (16 - row)] = center;
		}

		// Meta paths
		coordsMap.meta[p] = [];
		for (let row = 0; row < 8; row++) {
			const y_bot = -innerRadius - 400 + (row + 1) * 50, y_top = -innerRadius - 400 + row * 50;
			const pts = [ {x: -25, y: y_bot}, {x: 25, y: y_bot}, {x: 25, y: y_top}, {x: -25, y: y_top} ];
			const center = rotatePoint(0, y_bot - 25, armAngle);
			llegadaPaths.push({ points: toPts(pts, armAngle), color: baseColor, isFinal: row === 7, cx: center.x, cy: center.y, rot: armAngle });
			coordsMap.meta[p]![row] = center;
		}

		// Wedges (Home bases) - aligned to Left side of Arm p (adjacent to Salida p)
		const p1 = rotatePoint(-75, -innerRadius - 50, armAngle);
		const pTrackL = rotatePoint(-75, -R_max, armAngle);
		const pCorner = rotatePoint(-R_max * Math.tan(Math.PI / N), -R_max, armAngle);
		const pTrackR = rotatePoint(75, -R_max, armAngle - 360 / N);
		
		const cx = (p1.x + pTrackL.x + pCorner.x + pTrackR.x) / 4;
		const cy = (p1.y + pTrackL.y + pCorner.y + pTrackR.y) / 4;
		
		const spotOffset = N === 4 ? 30 : N === 6 ? 24 : 18;
		const spots = [
			{ x: cx - spotOffset, y: cy - spotOffset }, { x: cx + spotOffset, y: cy - spotOffset },
			{ x: cx - spotOffset, y: cy + spotOffset }, { x: cx + spotOffset, y: cy + spotOffset },
		];
		
		wedges.push({ points: `${p1.x},${p1.y} ${pTrackL.x},${pTrackL.y} ${pCorner.x},${pCorner.y} ${pTrackR.x},${pTrackR.y}`, color: baseColor, cx, cy, spots });
		coordsMap.wedges[p] = { spots };
	}

	// Center polygon
	const polyPts = [];
	for (let p = 0; p < N; p++) {
		const armAngle = -p * (360 / N);
		const p1 = rotatePoint(-25, -innerRadius, armAngle);
		const p2 = rotatePoint(25, -innerRadius, armAngle);
		const intersectionPt = rotatePoint(0, -innerRadius / Math.cos(Math.PI / N), armAngle - 180 / N);
		polyPts.push(`${p1.x},${p1.y}`, `${p2.x},${p2.y}`, `${intersectionPt.x},${intersectionPt.y}`);
	}

	return {
		dynamicViewBox,
		dynamicBoardSize,
		basePolygonPoints,
		boardGeometry: { trackSquares, llegadaPaths, wedges, centerPolygon: polyPts.join(" "), coordsMap },
		colorPalette
	};
}
