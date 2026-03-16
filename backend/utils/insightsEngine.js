const generateInsights = (gh, lc, cf) => {
  const insights = [];

  // GitHub insights
  if (gh) {
    const streak = gh.contributionStreak?.current || 0;
    if (streak === 0) {
      insights.push({
        type: 'warning',
        platform: 'github',
        title: 'No recent commits',
        message: 'You haven\'t committed in a while. Try to maintain a daily coding habit.',
        priority: 'high',
      });
    } else if (streak < 7) {
      insights.push({
        type: 'info',
        platform: 'github',
        title: `${streak}-day commit streak`,
        message: 'Keep it up! Try to extend your streak to 14+ days.',
        priority: 'medium',
      });
    }

    const langs = Object.entries(gh.languageDistribution || {});
    if (langs.length === 1) {
      insights.push({
        type: 'suggestion',
        platform: 'github',
        title: 'Single language detected',
        message: `You primarily use ${langs[0][0]}. Exploring another language can broaden your opportunities.`,
        priority: 'low',
      });
    }

    if ((gh.totalPRs || 0) < 5) {
      insights.push({
        type: 'suggestion',
        platform: 'github',
        title: 'Contribute to open source',
        message: 'You have very few PRs. Consider contributing to open-source projects to build collaboration skills.',
        priority: 'medium',
      });
    }
  }

  // LeetCode insights
  if (lc) {
    const { easySolved = 0, mediumSolved = 0, hardSolved = 0 } = lc;
    const total = easySolved + mediumSolved + hardSolved;

    if (total > 0) {
      const hardRatio = hardSolved / total;
      const easyRatio = easySolved / total;

      if (easyRatio > 0.7) {
        insights.push({
          type: 'warning',
          platform: 'leetcode',
          title: 'Imbalance: Too many Easy problems',
          message: `${Math.round(easyRatio * 100)}% of your solved problems are Easy. Shift focus to Medium problems for interview readiness.`,
          priority: 'high',
        });
      }

      if (hardRatio < 0.05 && total > 50) {
        insights.push({
          type: 'suggestion',
          platform: 'leetcode',
          title: 'Challenge yourself with Hard problems',
          message: 'You\'re solving mostly Easy/Medium. Starting to tackle Hard problems will significantly improve your problem-solving depth.',
          priority: 'medium',
        });
      }
    }

    // Topic gaps from topicProgress
    const topics = lc.topicProgress || [];
    const weakTopics = topics.filter(t => t.solved < 5).map(t => t.topic).slice(0, 3);
    if (weakTopics.length) {
      insights.push({
        type: 'skill_gap',
        platform: 'leetcode',
        title: 'Weak topic areas identified',
        message: `Low coverage in: ${weakTopics.join(', ')}. Focus here for well-rounded preparation.`,
        priority: 'high',
        topics: weakTopics,
      });
    }

    if ((lc.streak?.current || 0) === 0) {
      insights.push({
        type: 'warning',
        platform: 'leetcode',
        title: 'LeetCode streak broken',
        message: 'Consistency is key. Even solving 1 problem daily maintains momentum.',
        priority: 'medium',
      });
    }
  }

  // Codeforces insights
  if (cf) {
    const rating = cf.rating || 0;
    if (rating > 0 && rating < 1200) {
      insights.push({
        type: 'suggestion',
        platform: 'codeforces',
        title: 'Focus on fundamentals for rating growth',
        message: 'At your current rating, solve more Div 2 A/B problems and practice implementation speed.',
        priority: 'medium',
      });
    }

    const tagMap = cf.tagDistribution || {};
    const allTags = ['dp', 'graphs', 'trees', 'greedy', 'binary search', 'math', 'strings'];
    const missingTags = allTags.filter(t => !tagMap[t] || tagMap[t] < 3);
    if (missingTags.length) {
      insights.push({
        type: 'skill_gap',
        platform: 'codeforces',
        title: 'Algorithm gaps detected',
        message: `Low exposure to: ${missingTags.join(', ')}. These are frequently tested in competitive programming.`,
        priority: 'high',
        topics: missingTags,
      });
    }
  }

  return insights.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
};

module.exports = { generateInsights };