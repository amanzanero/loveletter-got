import { useAppDispatch } from "@/lib/state/hooks";
import { setUser } from "@/lib/state/users";
import { trpc } from "@/lib/trpc";
import { FileRouteTypes } from "@/routeTree.gen";
import { useNavigate } from "@tanstack/react-router";
import React from "react";

export const useJoinGameMutation = () => {
  const dispatch = useAppDispatch();
  const mutation = trpc.gameSetup.joinGame.useMutation();
  const nav = useNavigate();

  const joinGame = async (publicGameId: string, playerName: string) => {
    const { game, player } = await mutation.mutateAsync({ gameId: publicGameId, playerName });
    const user = {
      name: player.name,
      id: player.id,
      publicId: player.publicId,
      gameId: game.id,
    };
    dispatch(setUser(user));
    localStorage.setItem("potentialUser", JSON.stringify(user));
    nav({ to: `/lobby/${game.publicId}` });
  };

  return {
    ...mutation,
    mutate: undefined,
    mutateAsync: undefined,
    joinGame,
  };
};

export const useNewGame = ({ from }: { from: FileRouteTypes["to"] }) => {
  const nav = useNavigate({ from });
  const mutation = trpc.gameSetup.newGame.useMutation();
  const dispatch = useAppDispatch();

  const newGame = async (hostPlayerName: string) => {
    mutation.mutate({ hostPlayerName });
  };

  React.useEffect(() => {
    if (mutation.isSuccess) {
      const game = mutation.data;
      const user = {
        name: game.host.name,
        id: game.host.id,
        publicId: game.host.publicId,
        gameId: game.id,
      };
      dispatch(setUser(user));
      localStorage.setItem("potentialUser", JSON.stringify(user));
      nav({ to: "/lobby/$gameId", params: { gameId: game.publicId } });
    }
  }, [mutation.isSuccess, dispatch, nav]);

  return {
    ...mutation,
    mutate: undefined,
    mutateAsync: undefined,
    newGame,
  };
};
