export interface CampusLocation {
  name: string;
  shortName: string;
  district: string;
  latitude: number;
  longitude: number;
}

export interface MatchedHelper {
  helperId: string;
  userId: string;
  name: string;
  image?: string | null;
  university: string;
  department: string;
  academicLevel: string;
  rating: number;
  totalReviews: number;
  completedOrders: number;
  distanceKm?: number;
  locationName?: string | null;
  matchScore: number;
  proximityScore: number;
  handwritingScore: number;
  matchingSample?: {
    id: string;
    sampleUrl: string;
    style: string;
    neatnessScore: number;
    isVerified: boolean;
  };
  sampleComparisonUrl?: string;
  matchHighlights: string[];
}

export interface MatchHelpersQuery {
  university?: string;
  department?: string;
  subject?: string;
  locationName?: string;
  latitude?: number;
  longitude?: number;
  handwritingStyle?: "CURSIVE" | "PRINT" | "MIXED" | "MATH_EQUATION";
  handwritingSampleUrl?: string;
  desiredNeatness?: number;
  maxDistanceKm?: number;
}

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000/api/v1";

export async function matchHelpers(payload: MatchHelpersQuery): Promise<MatchedHelper[]> {
  const res = await fetch(`${BACKEND_URL}/matching/helpers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to search matching helpers");
  }

  return envelope.data || [];
}

export async function fetchCampuses(): Promise<CampusLocation[]> {
  const res = await fetch(`${BACKEND_URL}/matching/campuses`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-correlation-id": crypto.randomUUID(),
    },
  });

  const envelope = await res.json();
  if (!res.ok) {
    throw new Error(envelope?.message || "Failed to load campuses");
  }

  return envelope.data || [];
}
