// 100% redux boilerplate
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import settingsReducer from "./Settings";
import templatesReducer from "./Templates";

export const store = configureStore({
  reducer: {
    settings: settingsReducer,
    templates: templatesReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type AppStateGetter = typeof store.getState;

export const useTypedSelector: TypedUseSelectorHook<
  ReturnType<AppStateGetter>
> = useSelector;
