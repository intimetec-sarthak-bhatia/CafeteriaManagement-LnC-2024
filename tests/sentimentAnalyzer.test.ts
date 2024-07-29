import { pipeline } from "transformer.ts";
import SentimentAnalyzer from "../src/Utils/sentimentAnalyzer";

jest.mock("transformer.ts", () => ({
  pipeline: jest.fn(),
}));

describe('SentimentAnalyzer', () => {
    let sentimentAnalyzer: SentimentAnalyzer;
  
    beforeEach(() => {
      sentimentAnalyzer = new SentimentAnalyzer();
    });
  
    test('should analyze sentiment correctly', async () => {
      const mockPipeline = jest.fn().mockResolvedValue([{
        label: '5 stars',
        score: 0.95,
      }]);
      (pipeline as jest.Mock).mockResolvedValue(mockPipeline);
  
      const sentimentScore = await sentimentAnalyzer.analyzeSentiment('Awesome food, Loved the taste');
  
      expect(pipeline).toHaveBeenCalledWith('sentiment-analysis', 'Xenova/bert-base-multilingual-uncased-sentiment');
      expect(sentimentScore).toBeCloseTo(99.0, 2);
    });
  
    test('should throw an error for invalid sentiment label', async () => {
      const mockPipeline = jest.fn().mockResolvedValue([{
        label: 'invalid',
        score: 0.5,
      }]);
      (pipeline as jest.Mock).mockResolvedValue(mockPipeline);
  
      await expect(sentimentAnalyzer.analyzeSentiment('test text')).rejects.toThrow('Invalid sentiment label');
    });
  
    test('should scale score correctly', () => {
      const scoreRange = { min: 80, max: 100 };
      const score = 0.95;
  
      const scaledScore = sentimentAnalyzer['scaleScore'](scoreRange, score);
  
      expect(scaledScore).toBeCloseTo(99.0, 2);
    });
  
    test('should get star rating correctly', () => {
      expect(sentimentAnalyzer['getStarRating']('5 stars')).toBe(5);
      expect(sentimentAnalyzer['getStarRating']('4 stars')).toBe(4);
      expect(sentimentAnalyzer['getStarRating']('3 stars')).toBe(3);
      expect(sentimentAnalyzer['getStarRating']('2 stars')).toBe(2);
      expect(sentimentAnalyzer['getStarRating']('1 star')).toBe(1);
    });
  
    test('should throw an error for invalid star label', () => {
      expect(() => sentimentAnalyzer['getStarRating']('invalid')).toThrow('Invalid sentiment label');
      expect(() => sentimentAnalyzer['getStarRating']('0 stars')).toThrow('Invalid sentiment label');
      expect(() => sentimentAnalyzer['getStarRating']('6 stars')).toThrow('Invalid sentiment label');
    });
  });
  
