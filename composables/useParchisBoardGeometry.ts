import { computed } from "vue";
import { rotatePoint, PARCHIS_COLORS, type TrackSquare, type LlegadaPath, type Wedge } from "./parchisMath";

export function useParchisBoardGeometry(sidesRef: any) {
	const colorPalette = PARCHIS_COLORS;

	const getConstants = (sides: number) => {
		const N = Math.max(4, Number(sides) || 4);
		const M = Math.tan(Math.PI / N);
		const innerRadius = (75 / M) - 50;
		const R_max = innerRadius + 460; 
		const trueRadius = R_max / Math.cos(Math.PI / N);
		return { N, M, innerRadius, R_max, trueRadius, strokeMargin: 12 };
	};

	const dynamicViewBox = computed(() => {
		const { trueRadius, strokeMargin } = getConstants(sidesRef.value);
		const size = (trueRadius + strokeMargin) * 2;
		return `${-(trueRadius + strokeMargin)} ${-(trueRadius + strokeMargin)} ${size} ${size}`;
	});

	const dynamicBoardSize = computed(() => {
		const { trueRadius, strokeMargin } = getConstants(sidesRef.value);
		return (trueRadius + strokeMargin) * 2;
	});

	const basePolygonPoints = computed(() => {
		const { N, R_max } = getConstants(sidesRef.value);
		return Array.from({ length: N }).map((_, i) => {
			const pt = rotatePoint(R_max * Math.tan(Math.PI / N), -R_max, -i * (360 / N));
			return `${pt.x},${pt.y}`;
		}).join(" ");
	});

	const boardGeometry = computed(() => {
		const { N, M, innerRadius, R_max } = getConstants(sidesRef.value);
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
				let y_bot = -innerRadius - row * rowHeight, y_top = -innerRadius - (row + 1) * rowHeight;
				let pts = row === 0 
					? [ { x: 25, y: y_bot }, { x: Math.abs(y_bot) * M, y: y_bot }, { x: 75, y: y_top }, { x: 25, y: y_top } ]
					: [ { x: 25, y: y_bot }, { x: 75, y: y_bot }, { x: 75, y: y_top }, { x: 25, y: y_top } ];
				let cx = row === 0 ? (25 + Math.abs(y_bot - 25) * M) / 2 : 50;
				let center = rotatePoint(cx, y_bot - 25, armAngle);
				trackSquares.push({ points: toPts(pts, armAngle), fill: row === 4 ? "#fcd34d" : "#f5ebd5", isSalida: false, isSeguro: row === 4, isTip: false, cx: center.x, cy: center.y, rot: armAngle });
				coordsMap.track[p * 17 + row] = center;
			}

			// Tip
			let tipY = -innerRadius - 400;
			let tipPts = [ {x: -75, y: tipY}, {x: 75, y: tipY}, {x: 75, y: tipY - 50}, {x: -75, y: tipY - 50} ];
			let tipCenter = rotatePoint(0, tipY - 25, armAngle);
			trackSquares.push({ points: toPts(tipPts, armAngle), fill: "#fcd34d", isSalida: false, isSeguro: true, isTip: true, cx: tipCenter.x, cy: tipCenter.y, rot: armAngle });
			coordsMap.track[p * 17 + 8] = tipCenter;

			// Left side of arm
			for (let row = 7; row >= 0; row--) {
				let y_bot = -innerRadius - row * rowHeight, y_top = -innerRadius - (row + 1) * rowHeight;
				let pts = row === 0 
					? [ { x: -Math.abs(y_bot) * M, y: y_bot }, { x: -25, y: y_bot }, { x: -25, y: y_top }, { x: -75, y: y_top } ]
					: [ { x: -75, y: y_bot }, { x: -25, y: y_bot }, { x: -25, y: y_top }, { x: -75, y: y_top } ];
				let cx = row === 0 ? (-25 + -Math.abs(y_bot - 25) * M) / 2 : -50;
				let center = rotatePoint(cx, y_bot - 25, armAngle);
				trackSquares.push({ points: toPts(pts, armAngle), fill: row === 4 ? baseColor : "#f5ebd5", isSalida: row === 4, isSeguro: true, isTip: false, cx: center.x, cy: center.y, rot: armAngle });
				coordsMap.track[p * 17 + (16 - row)] = center;
			}

			// Meta paths
			coordsMap.meta[p] = [];
			for (let row = 0; row < 8; row++) {
				let y_bot = -innerRadius - 400 + (row + 1) * 50, y_top = -innerRadius - 400 + row * 50;
				let pts = [ {x: -25, y: y_bot}, {x: 25, y: y_bot}, {x: 25, y: y_top}, {x: -25, y: y_top} ];
				let center = rotatePoint(0, y_bot - 25, armAngle);
				llegadaPaths.push({ points: toPts(pts, armAngle), color: baseColor, isFinal: row === 7, cx: center.x, cy: center.y, rot: armAngle });
				coordsMap.meta[p]![row] = center;
			}

			// Wedges (Home bases)
			let p1 = rotatePoint(75, -innerRadius - 50, armAngle);
			let pTrackL = rotatePoint(75, -R_max, armAngle);
			let pCorner = rotatePoint(R_max * Math.tan(Math.PI / N), -R_max, armAngle);
			let pTrackR = rotatePoint(75, -R_max, armAngle + 360 / N);
			
			let cx = (p1.x + pTrackL.x + pCorner.x + pTrackR.x) / 4;
			let cy = (p1.y + pTrackL.y + pCorner.y + pTrackR.y) / 4;
			
			let spotOffset = N === 4 ? 30 : N === 6 ? 24 : 18;
			let spots = [
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
			let p1 = rotatePoint(-25, -innerRadius, armAngle);
			let p2 = rotatePoint(25, -innerRadius, armAngle);
			let intersectionPt = rotatePoint(0, -innerRadius / Math.cos(Math.PI / N), armAngle - 180 / N);
			polyPts.push(`${p1.x},${p1.y}`, `${p2.x},${p2.y}`, `${intersectionPt.x},${intersectionPt.y}`);
		}

		return { trackSquares, llegadaPaths, wedges, centerPolygon: polyPts.join(" "), coordsMap };
	});

	return { dynamicViewBox, dynamicBoardSize, basePolygonPoints, boardGeometry, colorPalette };
}
