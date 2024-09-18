import React from "react";
import { useAppDispatch, useAppSelector } from "./hooks";
import { setUser } from "./users";
import { useNavigate } from "@tanstack/react-router";
import { FileRouteTypes } from "@/routeTree.gen";

export const useUserOrRedirect = ({ from }: { from: FileRouteTypes["to"] }) => {
  const maybeUser = useAppSelector((state) => state.users.user);
  const dispatch = useAppDispatch();
  const nav = useNavigate({ from });
  React.useEffect(() => {
    if (typeof window !== "undefined" && !maybeUser) {
      const maybeSerializedUser = window.localStorage.getItem("potentialUser");
      if (maybeSerializedUser) {
        const user = JSON.parse(maybeSerializedUser);
        dispatch(setUser(user));
      } else {
        console.log("no user found, redirecting to /");
        nav({ to: "/" });
      }
    }
  }, [maybeUser, dispatch, nav]);

  return maybeUser;
};
