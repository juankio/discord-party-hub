import { describe, it, expect, beforeEach, afterEach, spyOn } from "bun:test";
import {
  generateId,
  saveUserToStorage,
  loadUserFromStorage,
  handleAuthFromUrl,
} from "../utils/authStorage";

// In-memory mock for LocalStorage
class MockLocalStorage {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  get length(): number {
    return this.store.size;
  }

  key(index: number): string | null {
    return Array.from(this.store.keys())[index] ?? null;
  }
}

describe("authStorage", () => {
  let mockStorage: MockLocalStorage;
  const originalLocalStorage = globalThis.localStorage;
  const originalWindow = (globalThis as any).window;

  beforeEach(() => {
    mockStorage = new MockLocalStorage();
    (globalThis as any).localStorage = mockStorage;
  });

  afterEach(() => {
    (globalThis as any).localStorage = originalLocalStorage;
    (globalThis as any).window = originalWindow;
  });

  describe("generateId", () => {
    it("should generate a non-empty string", () => {
      const id = generateId();
      expect(typeof id).toBe("string");
      expect(id.length).toBeGreaterThan(0);
    });

    it("should generate alphanumeric characters only (base36)", () => {
      const id = generateId();
      expect(/^[a-z0-9]+$/.test(id)).toBe(true);
    });

    it("should produce unique identifiers across multiple invocations", () => {
      const ids = new Set<string>();
      const count = 100;
      for (let i = 0; i < count; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(count);
    });
  });

  describe("saveUserToStorage", () => {
    it("should serialize and store user data in localStorage under 'party-hub-user'", () => {
      const userData = { id: "user-123", username: "Usopp", avatar: "sniper.png" };
      saveUserToStorage(userData);

      const raw = mockStorage.getItem("party-hub-user");
      expect(raw).not.toBeNull();
      expect(JSON.parse(raw!)).toEqual(userData);
    });

    it("should gracefully catch errors if localStorage.setItem throws", () => {
      mockStorage.setItem = () => {
        throw new Error("QuotaExceededError");
      };

      expect(() => {
        saveUserToStorage({ id: "fail" });
      }).not.toThrow();
    });
  });

  describe("loadUserFromStorage", () => {
    it("should deserialize and return user data when present in storage", () => {
      const userData = { id: "user-456", username: "Sogeking", roomId: "lobby-1" };
      mockStorage.setItem("party-hub-user", JSON.stringify(userData));

      const loaded = loadUserFromStorage();
      expect(loaded).toEqual(userData);
    });

    it("should return null when storage is empty or key is absent", () => {
      const loaded = loadUserFromStorage();
      expect(loaded).toBeNull();
    });

    it("should return null and log error when stored data is invalid JSON", () => {
      mockStorage.setItem("party-hub-user", "{ invalid json string");
      const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});

      const loaded = loadUserFromStorage();
      expect(loaded).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });
  });

  describe("handleAuthFromUrl", () => {
    let mockHistory: { replaceState: ReturnType<typeof spyOn> };
    let mockWindow: any;

    beforeEach(() => {
      mockHistory = {
        replaceState: spyOn({ fn: () => {} }, "fn"),
      };

      mockWindow = {
        location: {
          search: "",
          pathname: "/lobby",
        },
        history: mockHistory,
        localStorage: mockStorage,
      };

      (globalThis as any).window = mockWindow;
      (globalThis as any).document = { title: "Party Hub" };
    });

    it("should do nothing when auth_data query parameter is absent", () => {
      mockWindow.location.search = "?other_param=123";

      handleAuthFromUrl();

      expect(mockStorage.getItem("party-hub-user")).toBeNull();
      expect(mockHistory.replaceState).not.toHaveBeenCalled();
    });

    it("should parse base64 auth_data and save to localStorage", () => {
      const authPayload = { id: "discord-user-1", username: "Luffy", avatar: "hat.png" };
      const base64Data = btoa(JSON.stringify(authPayload));
      mockWindow.location.search = `?auth_data=${base64Data}`;

      handleAuthFromUrl();

      const storedRaw = mockStorage.getItem("party-hub-user");
      expect(storedRaw).not.toBeNull();
      expect(JSON.parse(storedRaw!)).toEqual(authPayload);
      expect(mockHistory.replaceState).toHaveBeenCalled();
    });

    it("should preserve existing roomId if already present in localStorage", () => {
      // Existing user session with roomId
      mockStorage.setItem("party-hub-user", JSON.stringify({ id: "old", roomId: "room-abc" }));

      const newAuthPayload = { id: "discord-user-2", username: "Zoro" };
      const base64Data = btoa(JSON.stringify(newAuthPayload));
      mockWindow.location.search = `?auth_data=${base64Data}`;

      handleAuthFromUrl();

      const stored = JSON.parse(mockStorage.getItem("party-hub-user")!);
      expect(stored.id).toBe("discord-user-2");
      expect(stored.username).toBe("Zoro");
      expect(stored.roomId).toBe("room-abc");
    });

    it("should handle invalid base64 or corrupted JSON without throwing", () => {
      mockWindow.location.search = "?auth_data=not-valid-base64!!";
      const consoleErrorSpy = spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        handleAuthFromUrl();
      }).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it("should do nothing when window is undefined (SSR environment)", () => {
      (globalThis as any).window = undefined;

      expect(() => {
        handleAuthFromUrl();
      }).not.toThrow();
    });
  });
});
