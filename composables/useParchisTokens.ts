import { computed } from "vue";
import type { ComputedRef } from "vue";
import { useParchisStore } from "~/stores/games/parchisStore";

export interface TokenDisplayObject {
	player: any;
	token: any;
	data: {
		id: number;
		color: string;
		ownerId: string;
		position: number;
		state: string;
	};
	coords: { x: number; y: number };
}

export function useParchisTokens(sides: ComputedRef<number>, boardGeometry: ComputedRef<any>, colorPalette: string[]) {
	const parchisStore = useParchisStore();

	const allTokens = computed(() => {
		const tokens: TokenDisplayObject[] = [];
		const coordsMap = boardGeometry.value.coordsMap;

		const trackOccupants = new Map<number, { userId: string; tokenId: string | number }[]>();
		const metaOccupants = new Map<string, Map<number, { userId: string; tokenId: string | number }[]>>();

		parchisStore.players.forEach(p => {
			p.tokens?.forEach(t => {
				if (t.state === "BOARD" || t.state === "TRACK") {
					const pos = t.position % (sides.value * 17);
					if (!trackOccupants.has(pos)) trackOccupants.set(pos, []);
					trackOccupants.get(pos)!.push({ userId: p.userId, tokenId: t.id });
				} else if (t.state === "META") {
					if (!metaOccupants.has(p.color)) metaOccupants.set(p.color, new Map());
					const metaMap = metaOccupants.get(p.color)!;
					if (!metaMap.has(t.position)) metaMap.set(t.position, []);
					metaMap.get(t.position)!.push({ userId: p.userId, tokenId: t.id });
				}
			});
		});

		parchisStore.players.forEach((player: any, pIdx: number) => {
			if (!player.tokens) return;

			const colorNames = ['yellow', 'blue', 'red', 'green', 'purple', 'orange', 'pink', 'cyan'];
			let baseP = colorNames.indexOf(player.color?.toLowerCase());
			if (baseP === -1) baseP = pIdx % sides.value;

			player.tokens.forEach((token: any, tIdx: number) => {
				let tokenCoords = { x: 0, y: 0 };

				if (token.state === "HOME") {
					const wedge = coordsMap.wedges[baseP];
					if (wedge && wedge.spots) {
						tokenCoords = wedge.spots[tIdx % 4] || { x: 0, y: 0 };
					}
				} else if (token.state === "BOARD" || token.state === "TRACK") {
					const pos = token.position % (sides.value * 17);
					const trackCell = coordsMap.track[pos] as any;
					if (trackCell) {
						const occupantsList = trackOccupants.get(pos) || [];
						const occupants = occupantsList.length;
						const myIndexInCell = occupantsList.findIndex(o => o.userId === player.userId && o.tokenId === token.id);
						
						let offsetX = 0;
						let offsetY = 0;
						if (occupants > 1) {
							const offsets = [
								{x: -12, y: -12},
								{x: 12, y: 12},
								{x: -12, y: 12},
								{x: 12, y: -12},
								{x: 0, y: -16},
								{x: 0, y: 16},
								{x: -16, y: 0},
								{x: 16, y: 0}
							];
							offsetX = offsets[Math.abs(myIndexInCell) % offsets.length]?.x || 0;
							offsetY = offsets[Math.abs(myIndexInCell) % offsets.length]?.y || 0;
						}
						
						tokenCoords = { x: trackCell.x + offsetX, y: trackCell.y + offsetY };
					}
				} else if (token.state === "META") {
					const corridorCell = coordsMap.meta[baseP]?.[token.position] as any;
					if (corridorCell) {
						const occupantsList = metaOccupants.get(player.color)?.get(token.position) || [];
						const occupants = occupantsList.length;
						const myIndexInCell = occupantsList.findIndex(o => o.userId === player.userId && o.tokenId === token.id);
						
						let offsetX = 0;
						let offsetY = 0;
						if (occupants > 1) {
							const offsets = [
								{x: -8, y: -8},
								{x: 8, y: 8},
								{x: -8, y: 8},
								{x: 8, y: -8}
							];
							offsetX = offsets[Math.abs(myIndexInCell) % offsets.length]?.x || 0;
							offsetY = offsets[Math.abs(myIndexInCell) % offsets.length]?.y || 0;
						}
						tokenCoords = { x: corridorCell.x + offsetX, y: corridorCell.y + offsetY };
					}
				}

				tokens.push({
					player,
					token,
					data: {
						id: token.id,
						color: colorPalette[baseP] || '#9ca3af',
						ownerId: player.userId,
						position: token.position,
						state: token.state,
					},
					coords: tokenCoords,
				});
			});
		});
		return tokens;
	});

	return { allTokens };
}
