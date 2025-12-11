import { NextRequest, NextResponse } from "next/server";

// All 50 US States with LLC filing fees (2025 accurate data)
// Source: https://www.llcuniversity.com/llc-filing-fees-by-state/
const ALL_STATES = [
  { code: "AL", name: "Alabama", fee: 200 },
  { code: "AK", name: "Alaska", fee: 250 },
  { code: "AZ", name: "Arizona", fee: 50 },
  { code: "AR", name: "Arkansas", fee: 45 },
  { code: "CA", name: "California", fee: 70 },
  { code: "CO", name: "Colorado", fee: 50 },
  { code: "CT", name: "Connecticut", fee: 120 },
  { code: "DE", name: "Delaware", fee: 110 },
  { code: "FL", name: "Florida", fee: 125 },
  { code: "GA", name: "Georgia", fee: 100 },
  { code: "HI", name: "Hawaii", fee: 50 },
  { code: "ID", name: "Idaho", fee: 100 },
  { code: "IL", name: "Illinois", fee: 150 },
  { code: "IN", name: "Indiana", fee: 95 },
  { code: "IA", name: "Iowa", fee: 50 },
  { code: "KS", name: "Kansas", fee: 160 },
  { code: "KY", name: "Kentucky", fee: 40 },
  { code: "LA", name: "Louisiana", fee: 100 },
  { code: "ME", name: "Maine", fee: 175 },
  { code: "MD", name: "Maryland", fee: 100 },
  { code: "MA", name: "Massachusetts", fee: 500 },
  { code: "MI", name: "Michigan", fee: 50 },
  { code: "MN", name: "Minnesota", fee: 155 },
  { code: "MS", name: "Mississippi", fee: 50 },
  { code: "MO", name: "Missouri", fee: 50 },
  { code: "MT", name: "Montana", fee: 35 },
  { code: "NE", name: "Nebraska", fee: 100 },
  { code: "NV", name: "Nevada", fee: 425 },
  { code: "NH", name: "New Hampshire", fee: 100 },
  { code: "NJ", name: "New Jersey", fee: 125 },
  { code: "NM", name: "New Mexico", fee: 50 },
  { code: "NY", name: "New York", fee: 200 },
  { code: "NC", name: "North Carolina", fee: 125 },
  { code: "ND", name: "North Dakota", fee: 135 },
  { code: "OH", name: "Ohio", fee: 99 },
  { code: "OK", name: "Oklahoma", fee: 100 },
  { code: "OR", name: "Oregon", fee: 100 },
  { code: "PA", name: "Pennsylvania", fee: 125 },
  { code: "RI", name: "Rhode Island", fee: 150 },
  { code: "SC", name: "South Carolina", fee: 110 },
  { code: "SD", name: "South Dakota", fee: 150 },
  { code: "TN", name: "Tennessee", fee: 300 },
  { code: "TX", name: "Texas", fee: 300 },
  { code: "UT", name: "Utah", fee: 59 },
  { code: "VT", name: "Vermont", fee: 155 },
  { code: "VA", name: "Virginia", fee: 100 },
  { code: "WA", name: "Washington", fee: 200 },
  { code: "WV", name: "West Virginia", fee: 100 },
  { code: "WI", name: "Wisconsin", fee: 130 },
  { code: "WY", name: "Wyoming", fee: 100 },
];

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const search = searchParams.get("search")?.toLowerCase() || "";
  const cursor = parseInt(searchParams.get("cursor") || "0");
  const limit = parseInt(searchParams.get("limit") || "10");

  // Filter by search query
  let filtered = ALL_STATES;
  if (search) {
    filtered = ALL_STATES.filter(
      (state) =>
        state.name.toLowerCase().includes(search) ||
        state.code.toLowerCase().includes(search)
    );
  }

  // Paginate results
  const paginated = filtered.slice(cursor, cursor + limit);
  const hasMore = cursor + limit < filtered.length;
  const nextCursor = hasMore ? cursor + limit : null;

  return NextResponse.json({
    states: paginated,
    nextCursor,
    hasMore,
    total: filtered.length,
  });
}
