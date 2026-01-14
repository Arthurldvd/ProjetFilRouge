// Service de génération de questions par IA
// Utilise Groq API (gratuit avec limites généreuses: 30 req/min, 14400/jour)

import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import type {
  GeneratedQuestion,
  GenerateQuestionsResponse,
} from './dto/generate-questions.dto';

@Injectable()
export class AiGenerationService {
  private readonly apiKey: string;
  private readonly apiUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || '';
    if (!this.apiKey) {
      console.warn(
        '⚠️  GROQ_API_KEY non configurée - La génération IA ne fonctionnera pas',
      );
    }
  }

  async generateQuestions(
    theme: string,
    count: number,
  ): Promise<GenerateQuestionsResponse> {
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'La clé API Groq n\'est pas configurée. Veuillez définir GROQ_API_KEY dans le fichier .env',
      );
    }

    const prompt = this.buildPrompt(theme, count);

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erreur API Groq:', errorText);

        // Gérer le rate limit (429)
        if (response.status === 429) {
          const retryAfter = parseInt(
            response.headers.get('retry-after') || '60',
            10,
          );

          throw new HttpException(
            {
              statusCode: HttpStatus.TOO_MANY_REQUESTS,
              message:
                'Limite de requêtes atteinte. Veuillez réessayer dans quelques instants.',
              retryAfter,
            },
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        throw new InternalServerErrorException(
          'Erreur lors de la communication avec l\'API Groq',
        );
      }

      const data = await response.json();
      const generatedText = data?.choices?.[0]?.message?.content;

      if (!generatedText) {
        throw new InternalServerErrorException('Réponse invalide de l\'API Groq');
      }

      const questions = this.parseResponse(generatedText);

      return { questions };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Erreur génération IA:', error);
      throw new InternalServerErrorException(
        'Impossible de générer les questions. Veuillez réessayer.',
      );
    }
  }

  private buildPrompt(theme: string, count: number): string {
    return `Tu es un expert en création de quiz éducatifs. Génère exactement ${count} questions à choix multiples sur le thème suivant : "${theme}".

Pour chaque question :
- Crée une question claire et précise
- Propose exactement 4 réponses possibles
- Une seule réponse doit être correcte
- Les mauvaises réponses doivent être plausibles mais clairement fausses

IMPORTANT : Réponds UNIQUEMENT avec un JSON valide, sans aucun texte avant ou après. Le format doit être exactement :

{
  "questions": [
    {
      "text": "La question ici ?",
      "answers": [
        { "text": "Réponse A", "isCorrect": false },
        { "text": "Réponse B", "isCorrect": true },
        { "text": "Réponse C", "isCorrect": false },
        { "text": "Réponse D", "isCorrect": false }
      ]
    }
  ]
}

Génère maintenant ${count} questions sur "${theme}" :`;
  }

  private parseResponse(text: string): GeneratedQuestion[] {
    // Nettoyer la réponse - enlever les backticks markdown si présents
    let cleanedText = text.trim();

    // Enlever les blocs de code markdown
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }

    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }

    cleanedText = cleanedText.trim();

    try {
      const parsed = JSON.parse(cleanedText);

      if (!parsed.questions || !Array.isArray(parsed.questions)) {
        throw new Error('Format de réponse invalide');
      }

      // Valider et nettoyer chaque question
      return parsed.questions.map((q: GeneratedQuestion) => {
        if (!q.text || !Array.isArray(q.answers)) {
          throw new Error('Question mal formatée');
        }

        // S'assurer qu'il y a au moins une bonne réponse
        const hasCorrect = q.answers.some((a) => a.isCorrect);
        if (!hasCorrect && q.answers.length > 0) {
          // Marquer la première réponse comme correcte par défaut
          q.answers[0].isCorrect = true;
        }

        return {
          text: q.text,
          answers: q.answers.map((a) => ({
            text: a.text,
            isCorrect: Boolean(a.isCorrect),
          })),
        };
      });
    } catch (error) {
      console.error('Erreur parsing JSON:', error, 'Texte:', cleanedText);
      throw new InternalServerErrorException(
        'Impossible de parser la réponse de l\'IA. Veuillez réessayer.',
      );
    }
  }
}

