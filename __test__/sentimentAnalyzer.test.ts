import { pipeline } from 'transformer.ts';
import SentimentAnalyzer from '../src/utils/sentimentAnalyzer';

jest.mock('transformer.ts', () => ({
  pipeline: jest.fn(),
}));

describe('SentimentAnalyzer', () => {
  let sentimentAnalyzer: SentimentAnalyzer;

  beforeEach(() => {
    sentimentAnalyzer = new SentimentAnalyzer();
  });

  it('should analyze sentiment and return a valid score', async () => {
    const mockPipeline = jest.fn().mockResolvedValueOnce([
      { label: '5 stars', score: 0.9 },
    ]);
    (pipeline as jest.Mock).mockReturnValue(mockPipeline);

    const result = await sentimentAnalyzer.analyzeSentiment('Great product!');
    expect(result).toBeCloseTo(98.0, 2);
  });

  it('should throw an error for invalid sentiment label', async () => {
    const mockPipeline = jest.fn().mockResolvedValueOnce([
      { label: '6 stars', score: 0.9 },
    ]);
    (pipeline as jest.Mock).mockReturnValue(mockPipeline);

    await expect(sentimentAnalyzer.analyzeSentiment('Invalid sentiment')).rejects.toThrow('Invalid sentiment label');
  });


  it('should return the correct score range for valid star ratings', () => {
    expect(sentimentAnalyzer ).toEqual({ min: 80, max: 100 });
    expect(sentimentAnalyzer ).toEqual({ min: 60, max: 80 });
    expect(sentimentAnalyzer ).toEqual({ min: 40, max: 60 });
    expect(sentimentAnalyzer ).toEqual({ min: 20, max: 40 });
    expect(sentimentAnalyzer ).toEqual({ min: 0, max: 20 });
  });

  it('should throw an error for invalid star ratings in score range', () => {
    expect(() => sentimentAnalyzer ).toThrow('Invalid star rating');
    expect(() => sentimentAnalyzer ).toThrow('Invalid star rating');
  });

  it('should scale score correctly', () => {
    const scoreRange = { min: 60, max: 80 };
    const score = 0.5;
    expect(sentimentAnalyzer['scaleScore'](scoreRange, score)).toBe(70);
  });
});
