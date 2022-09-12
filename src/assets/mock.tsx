export const dungeon = [
    {
        short_description: 'west room',
        long_description: 'the west end of a sloping east-west passage of barren rock',
        contents: ['pail of water', 'dragon tooth'],
        exits: {east: 'centre room'}
    },
    {
        short_description: 'east room',
        long_description: 'a room of finished stone with high arched ceiling and soaring columns. You see a large gate',
        contents: [],
        exits: {west: 'centre room'}
    },
    {
        short_description: 'centre room',
        long_description: 'the very heart of the dungeon, a windowless chamber lit only by the eerie light of glowing fungi high above',
        contents: ['golden key', 'spiral hourglass'],
        exits: {east: 'east room', west: 'west room'}
    }
]