const DEFAULT_ROUND_MODES = {
  Elimination: "BO1",
  "Top 16": "BO1",
  "Quarter-Finals": "BO3",
  "Semi-Finals": "BO3",
  Finals: "BO5",
};

const PREDEFINED_SEED_ORDERS = {
  1: [1],
  2: [1, 2],
  4: [1, 4, 2, 3],
  8: [1, 8, 4, 5, 3, 6, 2, 7],
  16: [1, 16, 8, 9, 4, 13, 5, 12, 3, 14, 6, 11, 7, 10, 2, 15],
};

function nextPowerOfTwo(n) {
  let value = Math.max(1, Number(n) || 1);
  let power = 1;

  while (power < value) {
    power *= 2;
  }

  return power;
}

function getSeedOrder(bracketSize) {
  const normalizedSize = nextPowerOfTwo(bracketSize);
  if (PREDEFINED_SEED_ORDERS[normalizedSize]) {
    return [...PREDEFINED_SEED_ORDERS[normalizedSize]];
  }

  let currentSize = 16;
  let order = [...PREDEFINED_SEED_ORDERS[16]];

  while (currentSize < normalizedSize) {
    currentSize *= 2;
    order = order.flatMap((seed) => [seed, currentSize + 1 - seed]);
  }

  return order;
}

function getRoundTitle(bracketSize, roundNo) {
  const titlesByBracketSize = {
    2: ["Finals"],
    4: ["Semi-Finals", "Finals"],
    8: ["Quarter-Finals", "Semi-Finals", "Finals"],
    16: ["Top 16", "Quarter-Finals", "Semi-Finals", "Finals"],
    32: ["Elimination", "Top 16", "Quarter-Finals", "Semi-Finals", "Finals"],
  };

  const mappedTitles = titlesByBracketSize[bracketSize];
  if (mappedTitles?.[roundNo - 1]) {
    return mappedTitles[roundNo - 1];
  }

  const teamsRemaining = bracketSize / 2 ** (roundNo - 1);
  if (teamsRemaining === 16) return "Top 16";
  if (teamsRemaining === 8) return "Quarter-Finals";
  if (teamsRemaining === 4) return "Semi-Finals";
  if (teamsRemaining === 2) return "Finals";
  if (teamsRemaining > 16) return `Top ${teamsRemaining}`;

  return `Round ${roundNo}`;
}

function generateSingleEliminationBracket(participants, options = {}) {
  const normalizedParticipants = [...participants]
    .map((participant) => ({
      team_id: Number(participant.team_id),
      seed: Number(participant.seed),
      name: participant.name || `Team ${participant.team_id}`,
    }))
    .sort((left, right) => left.seed - right.seed);

  const participantCount = normalizedParticipants.length;
  const bracketSize = nextPowerOfTwo(participantCount);
  const byes = bracketSize - participantCount;
  const roundCount = Math.log2(bracketSize);
  const roundModes = options.roundModes || {};
  const participantBySeed = new Map(
    normalizedParticipants.map((participant) => [participant.seed, participant])
  );

  let currentSlots = getSeedOrder(bracketSize).map((seed) => {
    const participant = participantBySeed.get(seed);

    if (participant) {
      return {
        team_id: participant.team_id,
        seed: participant.seed,
        name: participant.name,
        isBye: false,
      };
    }

    return {
      team_id: null,
      seed,
      name: "BYE",
      isBye: true,
    };
  });

  const rounds = [];

  for (let roundIndex = 0; roundIndex < roundCount; roundIndex += 1) {
    const roundNo = roundIndex + 1;
    const title = getRoundTitle(bracketSize, roundNo);
    const mode = roundModes[title] || DEFAULT_ROUND_MODES[title] || "BO1";
    const matches = [];

    for (let slotIndex = 0; slotIndex < currentSlots.length; slotIndex += 2) {
      const teamA = currentSlots[slotIndex];
      const teamB = currentSlots[slotIndex + 1];

      matches.push({
        bracket_match_no: slotIndex / 2 + 1,
        seed_a: teamA?.seed ?? null,
        seed_b: teamB?.seed ?? null,
        team_a_id: teamA?.team_id ?? null,
        team_b_id: teamB?.team_id ?? null,
        team_a_name: teamA?.name || "TBD",
        team_b_name: teamB?.name || "TBD",
        has_bye: Boolean(teamA?.isBye || teamB?.isBye),
      });
    }

    rounds.push({
      round_no: roundNo,
      title,
      mode,
      matches,
    });

    currentSlots = matches.map((match) => ({
      team_id: null,
      seed: null,
      name: `Winner of ${title} ${match.bracket_match_no}`,
      isBye: false,
    }));
  }

  return {
    bracket_size: bracketSize,
    participant_count: participantCount,
    byes,
    rounds,
  };
}

module.exports = {
  nextPowerOfTwo,
  getSeedOrder,
  generateSingleEliminationBracket,
};
