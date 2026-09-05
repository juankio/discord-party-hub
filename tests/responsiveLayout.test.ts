import { describe, it, expect } from "bun:test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  getViewportCategory,
  getResponsiveLayout,
  isTouchTargetCompliant,
  ALERT_TOUCH_TARGET,
  BREAKPOINTS
} from "../utils/responsiveLayout";

describe("Responsive Layout & Viewport Proportions", () => {
  describe("Viewport Categorization Logic", () => {
    it("categorizes widths strictly less than 640px as mobile", () => {
      expect(getViewportCategory(0)).toBe("mobile");
      expect(getViewportCategory(320)).toBe("mobile");
      expect(getViewportCategory(375)).toBe("mobile");
      expect(getViewportCategory(414)).toBe("mobile");
      expect(getViewportCategory(639)).toBe("mobile");
    });

    it("categorizes widths between 640px and 1024px inclusive as tablet", () => {
      expect(getViewportCategory(640)).toBe("tablet");
      expect(getViewportCategory(768)).toBe("tablet");
      expect(getViewportCategory(820)).toBe("tablet");
      expect(getViewportCategory(1024)).toBe("tablet");
    });

    it("categorizes widths strictly greater than 1024px as desktop", () => {
      expect(getViewportCategory(1025)).toBe("desktop");
      expect(getViewportCategory(1280)).toBe("desktop");
      expect(getViewportCategory(1440)).toBe("desktop");
      expect(getViewportCategory(1920)).toBe("desktop");
    });

    it("handles boundary edge cases gracefully", () => {
      expect(getViewportCategory(-10)).toBe("mobile");
      expect(getViewportCategory(Number.MIN_SAFE_INTEGER)).toBe("mobile");
      expect(getViewportCategory(Number.MAX_SAFE_INTEGER)).toBe("desktop");
    });
  });

  describe("Mobile Proportions (<640px)", () => {
    const mobileWidths = [320, 360, 375, 412, 480, 639];

    it("enforces aspect-[16/10] for mobile viewports", () => {
      mobileWidths.forEach((w) => {
        const layout = getResponsiveLayout(w);
        expect(layout.aspectRatio).toBe("aspect-[16/10]");
      });
    });

    it("enforces container padding px-6 for mobile viewports", () => {
      mobileWidths.forEach((w) => {
        const layout = getResponsiveLayout(w);
        expect(layout.containerPadding).toBe("px-6");
      });
    });

    it("enforces name badge max-w-[85px] for mobile viewports to prevent overflow", () => {
      mobileWidths.forEach((w) => {
        const layout = getResponsiveLayout(w);
        expect(layout.nameBadgeMaxWidth).toBe("max-w-[85px]");
      });
    });

    it("enforces bounded height max-h-[220px] for TableHistoryBar in mobile viewports", () => {
      mobileWidths.forEach((w) => {
        const layout = getResponsiveLayout(w);
        expect(layout.historyBarMaxHeight).toBe("max-h-[220px]");
      });
    });
  });

  describe("Tablet Proportions (640px - 1024px)", () => {
    const tabletWidths = [640, 768, 800, 834, 1024];

    it("enforces aspect-[2/1] for tablet viewports", () => {
      tabletWidths.forEach((w) => {
        const layout = getResponsiveLayout(w);
        expect(layout.aspectRatio).toBe("aspect-[2/1]");
      });
    });

    it("enforces container padding px-12 for tablet viewports", () => {
      tabletWidths.forEach((w) => {
        const layout = getResponsiveLayout(w);
        expect(layout.containerPadding).toBe("px-12");
      });
    });

    it("enforces name badge max-w-[140px] for tablet viewports", () => {
      tabletWidths.forEach((w) => {
        const layout = getResponsiveLayout(w);
        expect(layout.nameBadgeMaxWidth).toBe("max-w-[140px]");
      });
    });
  });

  describe("Desktop Proportions (>1024px)", () => {
    const desktopWidths = [1025, 1280, 1440, 1920, 2560];

    it("enforces aspect-[2/1] for desktop viewports", () => {
      desktopWidths.forEach((w) => {
        const layout = getResponsiveLayout(w);
        expect(layout.aspectRatio).toBe("aspect-[2/1]");
      });
    });

    it("enforces container padding px-14 for desktop viewports", () => {
      desktopWidths.forEach((w) => {
        const layout = getResponsiveLayout(w);
        expect(layout.containerPadding).toBe("px-14");
      });
    });

    it("enforces name badge max-w-[180px] for desktop viewports", () => {
      desktopWidths.forEach((w) => {
        const layout = getResponsiveLayout(w);
        expect(layout.nameBadgeMaxWidth).toBe("max-w-[180px]");
      });
    });
  });

  describe("Alert Modal Touch Target Compliance (WCAG 2.5.5 / 2.5.8)", () => {
    it("defines minimum touch target size of at least 44px", () => {
      expect(ALERT_TOUCH_TARGET.MIN_SIZE_PX).toBeGreaterThanOrEqual(44);
    });

    it("validates touch target sizes with isTouchTargetCompliant helper", () => {
      expect(isTouchTargetCompliant(43.9)).toBe(false);
      expect(isTouchTargetCompliant(40)).toBe(false);
      expect(isTouchTargetCompliant(44)).toBe(true);
      expect(isTouchTargetCompliant(48)).toBe(true);
      expect(isTouchTargetCompliant(64)).toBe(true);
    });

    it("provides valid Tailwind touch target classes for alert buttons", () => {
      expect(ALERT_TOUCH_TARGET.CLOSE_BTN_CLASS).toContain("min-w-[44px]");
      expect(ALERT_TOUCH_TARGET.CLOSE_BTN_CLASS).toContain("min-h-[44px]");
      expect(ALERT_TOUCH_TARGET.ACTION_BTN_CLASS).toContain("min-h-[44px]");
    });
  });

  describe("SFC Template & Tailwind Class Integration Contract", () => {
    const componentsDir = resolve(__dirname, "../components");

    it("certifies PlayerTable.vue implements mobile aspect-[16/10] and container paddings px-6 sm:px-12 md:px-14", () => {
      const playerTableContent = readFileSync(
        resolve(componentsDir, "PlayerTable.vue"),
        "utf-8"
      );

      // Verify Container Padding: px-6 for mobile, sm:px-12 for tablet, md:px-14 for desktop
      expect(playerTableContent).toContain("px-6 sm:px-12 md:px-14");

      // Verify Table Aspect Ratio: aspect-[16/10] for mobile, sm:aspect-[2/1] for tablet/desktop
      expect(playerTableContent).toContain("aspect-[16/10] sm:aspect-[2/1]");
    });

    it("certifies PlayerSeat.vue implements max-w-[85px] on player name badge for mobile", () => {
      const playerSeatContent = readFileSync(
        resolve(componentsDir, "PlayerSeat.vue"),
        "utf-8"
      );

      // Verify Name Badge Max Width: max-w-[85px] mobile, sm:max-w-[140px] tablet, md:max-w-[180px] desktop
      expect(playerSeatContent).toContain("max-w-[85px]");
      expect(playerSeatContent).toContain("sm:max-w-[140px]");
      expect(playerSeatContent).toContain("md:max-w-[180px]");
    });

    it("certifies TableHistoryBar.vue implements max-h-[220px] on mobile to prevent viewport overflow", () => {
      const tableHistoryContent = readFileSync(
        resolve(componentsDir, "TableHistoryBar.vue"),
        "utf-8"
      );

      // Verify scrollable history list has max-h-[220px]
      expect(tableHistoryContent).toContain("max-h-[220px]");
    });

    it("certifies AppAlertModal.vue enforces touch targets >= 44px on all interactive buttons", () => {
      const alertModalContent = readFileSync(
        resolve(componentsDir, "core/AppAlertModal.vue"),
        "utf-8"
      );

      // Verify Close Button has at least 44x44px target
      expect(alertModalContent).toMatch(/min-w-\[44px\]\s+min-h-\[44px\]/);

      // Verify Action Button has at least 44px min-height
      expect(alertModalContent).toContain("min-h-[44px]");
    });
  });
});
