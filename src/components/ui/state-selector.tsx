"use client";

// Backward compatibility: Re-export LocationSelector as StateSelector
// New code should use LocationSelector from ./location-selector directly
export { LocationSelector as StateSelector } from "./location-selector";
export type { LocationItem as State } from "./location-selector";
