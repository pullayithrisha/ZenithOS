import { NextResponse } from 'next/server';

export const revalidate = 14400; // Cache for 4 hours (14400 seconds)

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    // We use next: { revalidate: 14400 } directly on the fetch to ensure Next.js Data Cache handles it robustly
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, {
        next: { revalidate: 14400 }
      }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
        next: { revalidate: 14400 }
      })
    ]);

    if (!profileRes.ok) {
      // If API limit reached or not found, try to gracefully fail instead of crashing
      if (profileRes.status === 403 || profileRes.status === 429) {
        return NextResponse.json({ 
          error: 'Rate limit reached', 
          fallback: true,
          data: { followers: 0, public_repos: 0, topLanguage: 'Unknown' }
        });
      }
      return NextResponse.json({ error: 'GitHub user not found' }, { status: 404 });
    }

    const profileData = await profileRes.json();
    const reposData = reposRes.ok ? await reposRes.json() : [];

    // Calculate most used language in recent repos
    const languageCounts: Record<string, number> = {};
    let topLanguage = 'N/A';
    let maxCount = 0;

    if (Array.isArray(reposData)) {
      reposData.forEach((repo: { language?: string }) => {
        if (repo.language) {
          languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
          if (languageCounts[repo.language] > maxCount) {
            maxCount = languageCounts[repo.language];
            topLanguage = repo.language;
          }
        }
      });
    }

    return NextResponse.json({
      name: profileData.name || profileData.login,
      avatar_url: profileData.avatar_url,
      followers: profileData.followers,
      public_repos: profileData.public_repos,
      topLanguage,
    });
  } catch (error) {
    console.error('GitHub API error:', error);
    // Graceful fallback
    return NextResponse.json({ 
      error: 'Failed to fetch GitHub stats', 
      fallback: true,
      data: { followers: 0, public_repos: 0, topLanguage: 'Unknown' }
    });
  }
}
