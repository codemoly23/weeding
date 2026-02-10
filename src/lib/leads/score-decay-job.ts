/**
 * Lead Score Decay Job
 *
 * Reduces lead scores for inactive leads based on time since last activity.
 * Decay tiers:
 *   7+ days:  -5 points
 *   14+ days: -10 points
 *   30+ days: -20 points
 *   60+ days: -30 points
 *   90+ days: reset to 0
 *
 * Uses scoreDecayDays field to track how many days of decay have been applied,
 * preventing double-decay on subsequent runs.
 */

import prisma from "@/lib/db";

interface DecayResult {
  totalProcessed: number;
  decayed: number;
  reset: number;
  skipped: number;
  errors: number;
  details: {
    leadId: string;
    email: string;
    oldScore: number;
    newScore: number;
    daysSinceActivity: number;
    decayApplied: number;
  }[];
}

function getDecayAmount(daysSinceActivity: number): number {
  if (daysSinceActivity >= 90) return -Infinity; // Reset to 0
  if (daysSinceActivity >= 60) return 30;
  if (daysSinceActivity >= 30) return 20;
  if (daysSinceActivity >= 14) return 10;
  if (daysSinceActivity >= 7) return 5;
  return 0; // No decay
}

export async function runScoreDecayJob(): Promise<DecayResult> {
  const result: DecayResult = {
    totalProcessed: 0,
    decayed: 0,
    reset: 0,
    skipped: 0,
    errors: 0,
    details: [],
  };

  try {
    // Get all active leads with score > 0
    const leads = await prisma.lead.findMany({
      where: {
        score: { gt: 0 },
        status: { notIn: ["WON", "LOST", "UNQUALIFIED"] },
      },
      select: {
        id: true,
        email: true,
        score: true,
        scoreDecayDays: true,
        lastActivityAt: true,
      },
    });

    const now = new Date();

    for (const lead of leads) {
      result.totalProcessed++;

      try {
        const daysSinceActivity = Math.floor(
          (now.getTime() - new Date(lead.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24)
        );

        // Skip if activity is recent (< 7 days)
        if (daysSinceActivity < 7) {
          result.skipped++;
          continue;
        }

        // Skip if we've already decayed for this many days
        if (lead.scoreDecayDays >= daysSinceActivity) {
          result.skipped++;
          continue;
        }

        const decayAmount = getDecayAmount(daysSinceActivity);
        let newScore: number;

        if (decayAmount === -Infinity) {
          // 90+ days: reset to 0
          newScore = 0;
          result.reset++;
        } else if (decayAmount === 0) {
          result.skipped++;
          continue;
        } else {
          newScore = Math.max(0, lead.score - decayAmount);
          result.decayed++;
        }

        // Update lead score and decay tracking
        await prisma.$transaction([
          prisma.lead.update({
            where: { id: lead.id },
            data: {
              score: newScore,
              scoreDecayDays: daysSinceActivity,
            },
          }),
          prisma.leadActivity.create({
            data: {
              leadId: lead.id,
              type: "score_decayed",
              description: newScore === 0
                ? `Score reset to 0 (${daysSinceActivity} days inactive)`
                : `Score decayed from ${lead.score} to ${newScore} (-${decayAmount}, ${daysSinceActivity}d inactive)`,
              metadata: {
                oldScore: lead.score,
                newScore,
                decayAmount: decayAmount === -Infinity ? lead.score : decayAmount,
                daysSinceActivity,
                automated: true,
              },
            },
          }),
        ]);

        result.details.push({
          leadId: lead.id,
          email: lead.email,
          oldScore: lead.score,
          newScore,
          daysSinceActivity,
          decayApplied: decayAmount === -Infinity ? lead.score : decayAmount,
        });
      } catch (error) {
        console.error(`Error decaying lead ${lead.id}:`, error);
        result.errors++;
      }
    }
  } catch (error) {
    console.error("Score decay job error:", error);
    throw error;
  }

  return result;
}
