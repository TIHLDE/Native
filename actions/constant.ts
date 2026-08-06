

export const BASE_URL =
    process.env.EXPO_PUBLIC_PHOTON_URL ?? "https://photon.tihlde.org";

/** Every REST route lives under /api; auth lives under /api/auth. */
export const API_URL = `${BASE_URL}/api`;

// Local Photon during development:
// EXPO_PUBLIC_PHOTON_URL=http://localhost:4000
