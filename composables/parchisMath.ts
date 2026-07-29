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
