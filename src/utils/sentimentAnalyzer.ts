import { pipeline } from "transformer.ts";
import { PipelineInterface } from "../Interface/SentimentAnalyzerPipeline";

class SentimentAnalyzer {
  
  async analyzeSentiment(text: string): Promise<number> {
    const classifier = await pipeline('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment');
    const result = await classifier(text);
    const sentiment : PipelineInterface = result[0];
    const star = this.getStarRating(sentiment.label);

    const scoreRange = this.getScoreRange(star);
    const scaledScore = this.scaleScore(scoreRange, sentiment.score);

    return parseFloat(scaledScore.toFixed(2));
  }

  private getStarRating(label: string): number {
    const star = parseInt(label[0]);
    if (isNaN(star) || star < 1 || star > 5) {
      throw new Error('Invalid sentiment label');
    }
    return star;
  }

  private getScoreRange(star: number): { min: number, max: number } {
    switch (star) {
      case 5:
        return { min: 80, max: 100 };
      case 4:
        return { min: 60, max: 80 };
      case 3:
        return { min: 40, max: 60 };
      case 2:
        return { min: 20, max: 40 };
      case 1:
        return { min: 0, max: 20 };
      default:
        throw new Error('Invalid star rating');
    }
  }

  private scaleScore(scoreRange: { min: number, max: number }, score: number): number {
    return scoreRange.min + (scoreRange.max - scoreRange.min) * score;
  }
}

export default SentimentAnalyzer;
