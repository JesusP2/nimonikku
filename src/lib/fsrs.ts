import { fsrs, generatorParameters, createEmptyCard, type Card } from 'ts-fsrs';

// Configure FSRS parameters
const params = generatorParameters({ 
  enable_fuzz: true,
  // You can customize other parameters here if needed
  // w: [0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0234, 1.616, 0.1544, 1.0824, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466, 0.5034, 0.6567],
});

export const fsrsScheduler = fsrs(params);

// Create a new empty card with FSRS scheduling
export function createNewCard(): Card {
  return createEmptyCard();
}

// Get the next review for a card based on rating
export function scheduleCard(card: Card, rating: number, reviewDate = new Date()) {
  return fsrsScheduler.repeat(card, reviewDate)[rating];
}

// Helper to convert our card data to FSRS Card format
export function toFSRSCard(cardData: {
  due: Date;
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number;
  last_review?: Date;
}): Card {
  return {
    due: cardData.due,
    stability: cardData.stability,
    difficulty: cardData.difficulty,
    elapsed_days: cardData.elapsed_days,
    scheduled_days: cardData.scheduled_days,
    reps: cardData.reps,
    lapses: cardData.lapses,
    state: cardData.state,
    last_review: cardData.last_review,
  };
}

// Helper to extract FSRS data from a Card
export function fromFSRSCard(fsrsCard: Card) {
  return {
    due: fsrsCard.due,
    stability: fsrsCard.stability,
    difficulty: fsrsCard.difficulty,
    elapsed_days: fsrsCard.elapsed_days,
    scheduled_days: fsrsCard.scheduled_days,
    reps: fsrsCard.reps,
    lapses: fsrsCard.lapses,
    state: fsrsCard.state,
    last_review: fsrsCard.last_review,
  };
}
