/**
 * Unit tests for geminiService.
 * We mock the Google Generative AI SDK to avoid real API calls.
 */

// ─── Mock the Google GenAI SDK ─────────────────────────────────────────────
const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

const geminiService = require('../../services/geminiService');

describe('geminiService', () => {
  afterEach(() => {
    mockGenerateContent.mockReset();
  });

  // ─── analyzeResumeAndJD ─────────────────────────────────────────────────
  describe('analyzeResumeAndJD', () => {
    it('should parse a valid analysis response', async () => {
      const mockResponse = {
        matchScore: 75,
        summary: 'Good fit for the role',
        verdict: 'Good Match',
        strengths: ['Strong JS skills'],
        gaps: ['No Docker experience'],
        suggestions: [],
        keywords: { matched: ['JavaScript'], missing: ['Docker'] },
      };

      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify(mockResponse) },
      });

      const result = await geminiService.analyzeResumeAndJD('resume text', 'job description');

      expect(result).toEqual(mockResponse);
      expect(result.matchScore).toBe(75);
      expect(result.verdict).toBe('Good Match');
      expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    });

    it('should handle markdown-fenced JSON response', async () => {
      const mockResponse = { matchScore: 60, summary: 'OK', verdict: 'Partial Match', strengths: [], gaps: [], suggestions: [], keywords: { matched: [], missing: [] } };

      mockGenerateContent.mockResolvedValue({
        response: { text: () => '```json\n' + JSON.stringify(mockResponse) + '\n```' },
      });

      const result = await geminiService.analyzeResumeAndJD('resume', 'jd');

      expect(result.matchScore).toBe(60);
    });

    it('should throw on invalid JSON response', async () => {
      mockGenerateContent.mockResolvedValue({
        response: { text: () => 'This is not JSON at all' },
      });

      await expect(geminiService.analyzeResumeAndJD('resume', 'jd'))
        .rejects.toThrow('Resume analysis failed');
    });
  });

  // ─── generateInterviewQuestions ──────────────────────────────────────────
  describe('generateInterviewQuestions', () => {
    it('should return generated questions', async () => {
      const mockQuestions = {
        questions: [
          {
            id: 'q1',
            question: 'What is closure?',
            type: 'Technical',
            difficulty: 'Medium',
            category: 'JavaScript',
            hints: ['Think about scope'],
            idealAnswerPoints: ['Function retains access to outer scope'],
          },
        ],
      };

      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify(mockQuestions) },
      });

      const result = await geminiService.generateInterviewQuestions('resume', 'jd', 1);

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].type).toBe('Technical');
    });
  });

  // ─── evaluateAnswer ─────────────────────────────────────────────────────
  describe('evaluateAnswer', () => {
    it('should return evaluation with score and feedback', async () => {
      const mockEval = {
        score: 8,
        feedback: 'Great answer with good examples',
        strengths: ['Clear explanation'],
        improvements: ['Could add more depth'],
        betterAnswer: 'A closure is...',
      };

      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify(mockEval) },
      });

      const result = await geminiService.evaluateAnswer(
        'What is closure?',
        'A closure is a function...',
        ['Function retains scope']
      );

      expect(result.score).toBe(8);
      expect(result.feedback).toBeDefined();
      expect(result.betterAnswer).toBeDefined();
    });
  });

  // ─── generateCoverLetter ────────────────────────────────────────────────
  describe('generateCoverLetter', () => {
    it('should return cover letter with subject', async () => {
      const mockCL = {
        subject: 'Application for SDE Role',
        coverLetter: 'Dear Hiring Manager...',
      };

      mockGenerateContent.mockResolvedValue({
        response: { text: () => JSON.stringify(mockCL) },
      });

      const result = await geminiService.generateCoverLetter(
        'resume', 'jd', 'Google', 'SDE'
      );

      expect(result.subject).toContain('SDE');
      expect(result.coverLetter).toContain('Dear');
    });
  });
});
