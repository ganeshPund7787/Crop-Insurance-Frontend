import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, User } from "../../types/auth.types";
import { TOKEN_KEYS } from "../../config/constants";

function loadFromStorage<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(
      key,
      typeof value === "string" ? value : JSON.stringify(value),
    );
  } catch {
    /* quota exceeded */
  }
}

function clearStorage() {
  [TOKEN_KEYS.ACCESS, TOKEN_KEYS.REFRESH, "cropshield-user"].forEach((k) =>
    localStorage.removeItem(k),
  );
}

const initialState: AuthState = {
  user: loadFromStorage<User>("cropshield-user"),
  accessToken: localStorage.getItem(TOKEN_KEYS.ACCESS),
  refreshToken: localStorage.getItem(TOKEN_KEYS.REFRESH),
  isAuthenticated: !!localStorage.getItem(TOKEN_KEYS.ACCESS),
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken?: string;
      }>,
    ) {
      const { user, accessToken, refreshToken } = action.payload;
      state.user = user;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken ?? null;
      state.isAuthenticated = true;
      state.isLoading = false;

      saveToStorage(TOKEN_KEYS.ACCESS, accessToken);
      if (refreshToken) saveToStorage(TOKEN_KEYS.REFRESH, refreshToken);
      saveToStorage("cropshield-user", user);
    },

    updateAccessToken(state, action: PayloadAction<string>) {
      state.accessToken = action.payload;
      saveToStorage(TOKEN_KEYS.ACCESS, action.payload);
    },

    updateUser(state, action: PayloadAction<Partial<User>>) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        saveToStorage("cropshield-user", state.user);
      }
    },

    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      clearStorage();
    },

    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setCredentials,
  updateAccessToken,
  updateUser,
  logout,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
