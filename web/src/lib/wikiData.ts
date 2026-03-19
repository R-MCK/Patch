export interface WikiDataEntry {
    title: string;
    scientificName: string;
    content: string;
    sunRequirement?: 'full' | 'partial' | 'shade';
    wateringFrequency?: number;
}

export const mockWikiData: Record<string, WikiDataEntry> = {
    tomato: {
        title: 'Tomato',
        scientificName: 'Solanum lycopersicum',
        sunRequirement: 'full',
        wateringFrequency: 2,
        content: `Tomatoes are one of the most popular garden vegetables, prized for their versatility in cooking and relatively easy cultivation.

**Growing Conditions:**
- Sun: Full sun (6-8 hours daily)
- Water: Regular, consistent watering
- Soil: Well-draining, rich in organic matter
- Spacing: 24-36 inches apart

**Common Varieties:**
- Cherry tomatoes (small, sweet)
- Roma tomatoes (paste and sauce)
- Beefsteak (large, slicing)
- Heirloom varieties (diverse colors and flavors)

**Care Tips:**
- Stake or cage plants for support
- Remove suckers for larger fruit
- Watch for common pests like hornworms
- Harvest when fully colored`,
    },
    basil: {
        title: 'Basil',
        scientificName: 'Ocimum basilicum',
        sunRequirement: 'full',
        wateringFrequency: 3,
        content: `Basil is an essential culinary herb, particularly in Mediterranean and Asian cuisines.

**Growing Conditions:**
- Sun: Full sun
- Water: Regular, keep soil moist but not waterlogged
- Soil: Rich, well-draining
- Spacing: 12-18 inches apart

**Common Varieties:**
- Sweet basil (classic cooking variety)
- Thai basil (anise flavor)
- Purple basil (decorative and flavorful)
- Lemon basil (citrus notes)

**Care Tips:**
- Pinch off flower buds to prolong harvest
- Harvest from the top to encourage bushiness
- Bring indoors before first frost`,
    },
};

export function getWikiRecommendations(query: string): WikiDataEntry | null {
    if (!query) return null;
    const normalized = query.toLowerCase().trim();

    // Direct key match
    if (mockWikiData[normalized]) {
        return mockWikiData[normalized];
    }

    // Search content
    for (const key in mockWikiData) {
        const entry = mockWikiData[key];
        if (
            entry.title.toLowerCase().includes(normalized) ||
            entry.scientificName.toLowerCase().includes(normalized)
        ) {
            return entry;
        }
    }

    return null;
}
