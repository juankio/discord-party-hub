import { computed } from "vue";

export function rotatePoint(x: number, y: number, degrees: number) {
	const rad = (degrees * Math.PI) / 180;
	return {
		x: x * Math.cos(rad) - y * Math.sin(rad),
		y: x * Math.sin(rad) + y * Math.cos(rad),
	};
}

export function useParchisBoardGeometry(sidesRef: any) {
	const colorPalette = [
		"#eab308",
		"#3b82f6",
		"#ef4444",
		"#4ade80",
		"#a855f7",
		"#f97316",
		"#ec4899",
		"#06b6d4",
	];

	const dynamicViewBox = computed(() => {
		const N = sidesRef.value;
		const M = Math.tan(Math.PI / N);
		const baseInnerRadius = 75 / M;
		const innerRadius = baseInnerRadius - 50;
		const padding = 60; 
		const R_max = innerRadius + 400 + padding; 
		const trueRadius = R_max / Math.cos(Math.PI / N);
		const strokeMargin = 60; // Increased to prevent cutting the thick wood border
		const size = (trueRadius + strokeMargin) * 2;
		return `${-(trueRadius + strokeMargin)} ${-(trueRadius + strokeMargin)} ${size} ${size}`;
	});

	const dynamicBoardSize = computed(() => {
		const N = sidesRef.value;
		const M = Math.tan(Math.PI / N);
		const baseInnerRadius = 75 / M;
		const innerRadius = baseInnerRadius - 50;
		const padding = 60;
		const R_max = innerRadius + 400 + padding;
		const trueRadius = R_max / Math.cos(Math.PI / N);
		const strokeMargin = 60; // Keep in sync with viewBox
		return (trueRadius + strokeMargin) * 2;
	});

	const basePolygonPoints = computed(() => {
		const N = sidesRef.value;
		const M = Math.tan(Math.PI / N);
		const baseInnerRadius = 75 / M;
		const innerRadius = baseInnerRadius - 50;
		const padding = 60;
		const R_max = innerRadius + 400 + padding;
		const pts = [];
		for (let i = 0; i < N; i++) {
			const pt = rotatePoint(R_max * Math.tan(Math.PI / N), -R_max, i * (360 / N));
			pts.push(`${pt.x},${pt.y}`);
		}
		return pts.join(" ");
	});

	const boardGeometry = computed(() => {
		const N = sidesRef.value;
		const M = Math.tan(Math.PI / N);
		const baseInnerRadius = 75 / M;
		const innerRadius = baseInnerRadius - 50;
		const padding = 60;
		const R_max = innerRadius + 400 + padding;
		const rowHeight = 50;

		const trackSquares: any[] = [];
		const llegadaPaths: any[] = [];
		const wedges: any[] = [];
		const coordsMap = { track: [] as {x: number, y: number}[], meta: [] as {x: number, y: number}[][], wedges: [] as {spots: {x: number, y: number}[]}[] };
		const toPts = (pts: {x: number, y: number}[], angle: number) => pts.map(p => {
			const rot = rotatePoint(p.x, p.y, angle);
			return `${rot.x},${rot.y}`;
		}).join(" ");

		for (let p = 0; p < N; p++) {
			const armAngle = p * (360 / N);
			const baseColor = colorPalette[p % colorPalette.length];

			for (let row = 0; row < 8; row++) {
				let y_bot = -innerRadius - row * rowHeight, y_top = -innerRadius - (row + 1) * rowHeight;
				let pts: {x: number, y: number}[], center: {x: number, y: number};
				if (row === 0) {
					pts = [ { x: 25, y: y_bot }, { x: Math.abs(y_bot) * M, y: y_bot }, { x: 75, y: y_top }, { x: 25, y: y_top } ];
					center = rotatePoint((25 + Math.abs(y_bot - 25) * M) / 2, y_bot - 25, armAngle);
				} else {
					pts = [ { x: 25, y: y_bot }, { x: 75, y: y_bot }, { x: 75, y: y_top }, { x: 25, y: y_top } ];
					center = rotatePoint(50, y_bot - 25, armAngle);
				}
				trackSquares.push({ points: toPts(pts, armAngle), fill: row === 4 ? baseColor : "#f5ebd5", isSalida: row === 4, isSeguro: false, isTip: false, cx: center.x, cy: center.y, rot: armAngle });
				coordsMap.track[p * 17 + row] = center;
			}

			let tipY = -innerRadius - 400;
			let tipPts = [ {x: -75, y: tipY}, {x: 75, y: tipY}, {x: 75, y: tipY - 50}, {x: -75, y: tipY - 50} ];
			let tipCenter = rotatePoint(0, tipY - 25, armAngle);
			trackSquares.push({ points: toPts(tipPts, armAngle), fill: "#fcd34d", isSalida: false, isSeguro: true, isTip: true, cx: tipCenter.x, cy: tipCenter.y, rot: armAngle });
			coordsMap.track[p * 17 + 8] = tipCenter;

			for (let row = 7; row >= 0; row--) {
				let y_bot = -innerRadius - row * rowHeight, y_top = -innerRadius - (row + 1) * rowHeight;
				let pts: {x: number, y: number}[], center: {x: number, y: number};
				if (row === 0) {
					pts = [ { x: -Math.abs(y_bot) * M, y: y_bot }, { x: -25, y: y_bot }, { x: -25, y: y_top }, { x: -75, y: y_top } ];
					center = rotatePoint((-25 + -Math.abs(y_bot - 25) * M) / 2, y_bot - 25, armAngle);
				} else {
					pts = [ { x: -75, y: y_bot }, { x: -25, y: y_bot }, { x: -25, y: y_top }, { x: -75, y: y_top } ];
					center = rotatePoint(-50, y_bot - 25, armAngle);
				}
				trackSquares.push({ points: toPts(pts, armAngle), fill: row === 4 ? "#fcd34d" : "#f5ebd5", isSalida: false, isSeguro: row === 4, isTip: false, cx: center.x, cy: center.y, rot: armAngle });
				coordsMap.track[p * 17 + (16 - row)] = center;
			}

			coordsMap.meta[p] = [];
			for (let row = 0; row < 8; row++) {
				let y_bot = -innerRadius - 400 + (row + 1) * 50, y_top = -innerRadius - 400 + row * 50;
				let pts = [ {x: -25, y: y_bot}, {x: 25, y: y_bot}, {x: 25, y: y_top}, {x: -25, y: y_top} ];
				let center = rotatePoint(0, y_bot - 25, armAngle);
				llegadaPaths.push({ points: toPts(pts, armAngle), color: baseColor, isFinal: row === 7, cx: center.x, cy: center.y, rot: armAngle });
				if (coordsMap.meta[p]) coordsMap.meta[p]![row] = center;
			}

			let p1 = rotatePoint(-75, -innerRadius - 50, armAngle);
			let pTrackL = rotatePoint(-75, -R_max, armAngle);
			let pCorner = rotatePoint(-R_max * Math.tan(Math.PI / N), -R_max, armAngle);
			let pTrackR = rotatePoint(75, -R_max, armAngle - 360 / N);
			
			let cx = (p1.x + pTrackL.x + pCorner.x + pTrackR.x) / 4;
			let cy = (p1.y + pTrackL.y + pCorner.y + pTrackR.y) / 4;
			
			let spotOffset = N === 4 ? 30 : N === 6 ? 24 : 18;
			let spots = [
				{ x: cx - spotOffset, y: cy - spotOffset },
				{ x: cx + spotOffset, y: cy - spotOffset },
				{ x: cx - spotOffset, y: cy + spotOffset },
				{ x: cx + spotOffset, y: cy + spotOffset },
			];
			
			wedges.push({ points: `${p1.x},${p1.y} ${pTrackL.x},${pTrackL.y} ${pCorner.x},${pCorner.y} ${pTrackR.x},${pTrackR.y}`, color: baseColor, cx, cy, spots });
			coordsMap.wedges[p] = { spots };
		}

		const polyPts = [];
		for (let p = 0; p < N; p++) {
			const armAngle = p * (360 / N);
			let p1 = rotatePoint(-25, -innerRadius, armAngle);
			let p2 = rotatePoint(25, -innerRadius, armAngle);
			let intersectionRadius = innerRadius / Math.cos(Math.PI / N);
			let intersectionPt = rotatePoint(0, -intersectionRadius, armAngle - 180 / N);
			
			polyPts.push(`${p1.x},${p1.y}`);
			polyPts.push(`${p2.x},${p2.y}`);
			polyPts.push(`${intersectionPt.x},${intersectionPt.y}`);
		}

		return {
			trackSquares,
			llegadaPaths,
			wedges,
			centerPolygon: polyPts.join(" "),
			coordsMap
		};
	});

	return {
		dynamicViewBox,
		dynamicBoardSize,
		basePolygonPoints,
		boardGeometry,
        colorPalette
	};
}
