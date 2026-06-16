import { NextResponse } from 'next/server';

export const revalidate = 14400; // Cache for 4 hours

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';

const LEETCODE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      submitStats {
        acSubmissionNum {
          difficulty
          count
        }
      }
      profile {
        ranking
        reputation
      }
    }
    allQuestionsCount {
      difficulty
      count
    }
  }
`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    const res = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com'
      },
      body: JSON.stringify({
        query: LEETCODE_QUERY,
        variables: { username }
      }),
      next: { revalidate: 14400 } // Cache for 4 hours
    });

    if (!res.ok) {
      throw new Error(`LeetCode API returned ${res.status}`);
    }

    const json = await res.json();

    if (json.errors || !json.data?.matchedUser) {
      return NextResponse.json({ error: 'LeetCode user not found or error occurred' }, { status: 404 });
    }

    const stats = json.data.matchedUser.submitStats.acSubmissionNum;
    const profile = json.data.matchedUser.profile;
    
    // Process stats
    const totalSolved = stats.find((s: { difficulty: string, count: number }) => s.difficulty === 'All')?.count || 0;
    const easySolved = stats.find((s: { difficulty: string, count: number }) => s.difficulty === 'Easy')?.count || 0;
    const mediumSolved = stats.find((s: { difficulty: string, count: number }) => s.difficulty === 'Medium')?.count || 0;
    const hardSolved = stats.find((s: { difficulty: string, count: number }) => s.difficulty === 'Hard')?.count || 0;

    return NextResponse.json({
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      ranking: profile.ranking,
      reputation: profile.reputation
    });

  } catch (error) {
    console.error('LeetCode API error:', error);
    // Graceful fallback on network/API failure
    return NextResponse.json({ 
      error: 'Failed to fetch LeetCode stats',
      fallback: true,
      data: {
        totalSolved: 0,
        easySolved: 0,
        mediumSolved: 0,
        hardSolved: 0,
        ranking: 0,
        reputation: 0
      }
    });
  }
}
