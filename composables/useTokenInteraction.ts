import { computed } from "vue";
import { useParchisStore } from "~/stores/games/parchisStore";
import { usePlayerStore } from "~/stores/playerStore";
import { useSocket } from "~/composables/useSocket";
import { useToast } from "#imports";

export function useTokenInteraction(props: {
	token: {
		color: string;
		ownerId: string;
		position: number;
		state: string;
		id: number;
	}
}) {
	const parchisStore = useParchisStore();
	const playerStore = usePlayerStore();
	const { socket } = useSocket();
	const toast = useToast();

	const isClickable = computed(() => {
		if (
			!parchisStore.isMyTurn ||
			playerStore.userId !== props.token.ownerId
		)
			return false;

		if (!parchisStore.diceValue || parchisStore.diceValue.length === 0) {
			return false;
		}

		if (props.token.state === "HOME") {
			if (parchisStore.rules?.diceCount === 2) {
				const hasPairs =
					parchisStore.diceValue.length >= 2 &&
					parchisStore.diceValue[0] === parchisStore.diceValue[1] &&
						parchisStore.diceValue[0] !== undefined &&
						parchisStore.availableMoves?.includes(parchisStore.diceValue[0]);
				return hasPairs;
			} else {
				return parchisStore.availableMoves?.includes(5) || false;
			}
		}
		if (props.token.state === "META") {
			const canMoveInMeta = parchisStore.availableMoves?.some(move => props.token.position + (move ?? 0) <= 8);
			if (!canMoveInMeta) return false;
		}
		return parchisStore.availableMoves?.length > 0;
	});

	const onTokenClick = () => {
		if (!parchisStore.isMyTurn) {
			toast.add({ title: "No es tu turno", color: "red" });
			return;
		}
		if (playerStore.userId !== props.token.ownerId) {
			toast.add({ title: "Esta no es tu ficha", color: "red" });
			return;
		}
		if (!parchisStore.diceValue || parchisStore.diceValue.length === 0) {
			toast.add({ title: "Tira los dados primero", color: "orange" });
			return;
		}

		const isTwoDice = parchisStore.rules?.diceCount === 2;

		if (props.token.state === "HOME") {
			if (isTwoDice) {
				const hasPairs =
					parchisStore.diceValue.length >= 2 &&
					parchisStore.diceValue[0] === parchisStore.diceValue[1] &&
						parchisStore.diceValue[0] !== undefined &&
						parchisStore.availableMoves?.includes(parchisStore.diceValue[0]);
				if (!hasPairs) {
					toast.add({
						title: "Necesitas sacar pares para salir del nido",
						color: "amber",
					});
					return;
				}
			} else {
				if (!parchisStore.availableMoves?.includes(5)) {
					toast.add({
						title: "Necesitas un 5 para salir del nido",
						color: "amber",
					});
					return;
				}
			}
		} else if (props.token.state === "META") {
			const validMoves = parchisStore.availableMoves?.filter(move => props.token.position + (move ?? 0) <= 8);
			if (!validMoves || validMoves.length === 0) {
				toast.add({ title: "No puedes mover esta ficha (se pasa de la meta)", color: "orange" });
				return;
			}
		} else {
			if (!parchisStore.availableMoves || parchisStore.availableMoves.length === 0) {
				toast.add({ title: "No tienes movimientos disponibles", color: "orange" });
				return;
			}
		}

		let moveVal = parchisStore.availableMoves?.[0] || parchisStore.diceValue[0];

		if (props.token.state === "HOME") {
			if (isTwoDice) {
				const hasPairs = parchisStore.diceValue.length >= 2 && parchisStore.diceValue[0] === parchisStore.diceValue[1];
				if (hasPairs) {
					moveVal = parchisStore.diceValue[0]; 
				} else {
					moveVal = parchisStore.diceValue[0];
				}
			} else {
				moveVal = 5;
			}
		} else if (props.token.state === "META") {
			const validMoves = parchisStore.availableMoves?.filter(move => props.token.position + move <= 8) || [];
			if (
				parchisStore.selectedDiceIndex !== null &&
				parchisStore.selectedDiceIndex !== undefined &&
				parchisStore.selectedDiceIndex >= 0 &&
				parchisStore.selectedDiceIndex < parchisStore.availableMoves.length
			) {
				moveVal = parchisStore.availableMoves[parchisStore.selectedDiceIndex] as number;
				if (moveVal === undefined) return;
				if (props.token.position + moveVal > 8) {
					toast.add({ title: "El dado seleccionado te pasa de la meta", color: "orange" });
					return;
				}
			} else {
				moveVal = validMoves[0] as number;
				if (moveVal === undefined) return;
			}
		} else if (
			parchisStore.selectedDiceIndex !== null &&
			parchisStore.selectedDiceIndex !== undefined &&
			parchisStore.selectedDiceIndex >= 0 &&
			parchisStore.selectedDiceIndex < parchisStore.availableMoves.length
		) {
			moveVal = parchisStore.availableMoves[parchisStore.selectedDiceIndex] as number;
			if (moveVal === undefined) return;
		}

		socket.value?.emit("parchis:move_token", {
			tokenId: props.token.id,
			diceValue: moveVal,
		});
	};

	return {
		isClickable,
		onTokenClick
	};
}
