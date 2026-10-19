import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  showPhotoOnScreen,
  showVariantPhoto,
  subscribeChosen,
  subscribeScreen,
} from "./variant-photo";

/**
 * The regression this file exists for: the two directions shared one listener set, and each
 * publisher cleared itself on every change. Publishing a photo therefore woke the side that
 * had just published, which published again — React ended the page with "Maximum update depth
 * exceeded" on any product whose variants carry photos.
 */
describe("variant photo store", () => {
  beforeEach(() => {
    // Back to a known state; the module keeps its values between tests.
    showPhotoOnScreen(null);
    showVariantPhoto(null);
  });

  it("wakes only the side listening for what changed", () => {
    const chosen = vi.fn();
    const screen = vi.fn();
    const stopChosen = subscribeChosen(chosen);
    const stopScreen = subscribeScreen(screen);

    showPhotoOnScreen("/red.png");
    expect(screen).toHaveBeenCalledTimes(1);
    expect(chosen).not.toHaveBeenCalled();

    showVariantPhoto("/black.png");
    expect(chosen).toHaveBeenCalledTimes(1);
    expect(screen).toHaveBeenCalledTimes(1);

    stopChosen();
    stopScreen();
  });

  it("says nothing when the value has not moved", () => {
    const screen = vi.fn();
    const stop = subscribeScreen(screen);
    showPhotoOnScreen("/red.png");
    showPhotoOnScreen("/red.png");
    expect(screen).toHaveBeenCalledTimes(1);
    stop();
  });

  it("stops waking a listener that has gone away", () => {
    const screen = vi.fn();
    subscribeScreen(screen)();
    showPhotoOnScreen("/blue.png");
    expect(screen).not.toHaveBeenCalled();
  });
});
