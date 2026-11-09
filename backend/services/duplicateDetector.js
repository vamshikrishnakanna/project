/**
 * Duplicate Detection Service
 * Scoring: Category (30%) + Geographic Proximity (40%) + Text Similarity (30%)
 */

const Issue = require('../models/Issue');

const RADIUS_METERS = parseInt(process.env.DUPLICATE_RADIUS_METERS) || 500;
const THRESHOLD = parseFloat(process.env.DUPLICATE_THRESHOLD) || 0.65;

/**
 * Normalize text for comparison
 */
function normalizeText(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Tokenize text into set of words
 */
function tokenize(text) {
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'in', 'on', 'at', 'and', 'or', 'but',
    'to', 'of', 'for', 'with', 'this', 'that', 'there', 'has', 'have',
    'are', 'was', 'been', 'be', 'it', 'its', 'near', 'very', 'also',
    'road', 'street', 'area', 'place',
  ]);
  return new Set(
    normalizeText(text)
      .split(' ')
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
}

/**
 * Jaccard similarity between two token sets
 */
function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 && setB.size === 0) return 1;
  const intersection = new Set([...setA].filter((x) => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

/**
 * Calculate text similarity between title+description combos
 */
function calculateTextSimilarity(newIssue, existingIssue) {
  const newText = `${newIssue.title} ${newIssue.description}`;
  const existingText = `${existingIssue.title} ${existingIssue.description}`;

  const tokensA = tokenize(newText);
  const tokensB = tokenize(existingText);

  return jaccardSimilarity(tokensA, tokensB);
}

/**
 * Calculate geographic score based on distance
 * Max score (1.0) at 0m, min score (0) at or beyond RADIUS_METERS
 */
function calculateGeoScore(distanceMeters) {
  if (distanceMeters <= 0) return 1.0;
  if (distanceMeters >= RADIUS_METERS) return 0;
  return 1 - distanceMeters / RADIUS_METERS;
}

/**
 * Haversine distance in meters
 */
function haversineDistance(coord1, coord2) {
  const R = 6371000; // Earth radius in meters
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Find potential duplicates for a new issue
 * @param {Object} newIssue - { title, description, category, location: { coordinates: [lng, lat] } }
 * @returns {Array} Sorted list of potential duplicates with scores
 */
async function findDuplicates(newIssue) {
  const { coordinates } = newIssue.location;
  const [longitude, latitude] = coordinates;

  // Step 1: Geo query – fetch candidates within radius + same category
  const candidates = await Issue.find({
    category: newIssue.category,
    status: { $ne: 'Resolved' },
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [longitude, latitude] },
        $maxDistance: RADIUS_METERS,
      },
    },
  }).limit(20);

  if (candidates.length === 0) return [];

  // Step 2: Score each candidate
  const scored = candidates.map((existing) => {
    const distance = haversineDistance(
      coordinates,
      existing.location.coordinates
    );

    // Category score (exact match = 1.0 since we already filtered by category)
    const categoryScore = 1.0;

    // Geo score
    const geoScore = calculateGeoScore(distance);

    // Text score
    const textScore = calculateTextSimilarity(newIssue, existing);

    // Combined weighted score
    const combinedScore =
      categoryScore * 0.3 + geoScore * 0.4 + textScore * 0.3;

    return {
      issue: existing,
      scores: {
        category: Math.round(categoryScore * 100),
        geo: Math.round(geoScore * 100),
        text: Math.round(textScore * 100),
        combined: Math.round(combinedScore * 100),
      },
      distance: Math.round(distance),
      isSuspectedDuplicate: combinedScore >= THRESHOLD,
    };
  });

  // Step 3: Filter to threshold and sort by score descending
  return scored
    .filter((s) => s.isSuspectedDuplicate)
    .sort((a, b) => b.scores.combined - a.scores.combined);
}

module.exports = { findDuplicates, THRESHOLD, RADIUS_METERS };

