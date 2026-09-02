import { computed } from "vue";
import { computeParchisGeometry } from "./parchisMath";

export function useParchisBoardGeometry(sidesRef: any) {
	const computedData = computed(() => {
		const sides = typeof sidesRef === "object" && sidesRef !== null && "value" in sidesRef ? sidesRef.value : sidesRef;
		return computeParchisGeometry(sides);
	});

	const dynamicViewBox = computed(() => computedData.value.dynamicViewBox);
	const dynamicBoardSize = computed(() => computedData.value.dynamicBoardSize);
	const basePolygonPoints = computed(() => computedData.value.basePolygonPoints);
	const boardGeometry = computed(() => computedData.value.boardGeometry);
	const colorPalette = computedData.value.colorPalette;

	return { dynamicViewBox, dynamicBoardSize, basePolygonPoints, boardGeometry, colorPalette };
}
