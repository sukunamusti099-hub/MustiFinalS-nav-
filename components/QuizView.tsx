
import React, { useState } from 'react';
import { QuizQuestion, QuizResult } from '../types';

interface QuizViewProps {
  questions: QuizQuestion[];
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);

  const currentQuestion = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;

  const handleSelect = (optionKey: string) => {
    if (showExplanation) return;
    setSelectedAnswers(prev => ({ ...prev, [currentIndex]: optionKey }));
  };

  const handleNext = () => {
    if (!selectedAnswers[currentIndex]) return;
    
    if (showExplanation) {
      if (isLast) {
        const score = questions.reduce((acc, q, idx) => {
          return acc + (selectedAnswers[idx] === q.correct_answer ? 1 : 0);
        }, 0);

        onComplete({
          score,
          total: questions.length,
          answers: questions.map((q, idx) => ({
            questionIndex: idx,
            selectedOption: selectedAnswers[idx],
            isCorrect: selectedAnswers[idx] === q.correct_answer,
          }))
        });
      } else {
        setCurrentIndex(prev => prev + 1);
        setShowExplanation(false);
      }
    } else {
      setShowExplanation(true);
    }
  };

  const progress = ((currentIndex + (showExplanation ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onExit} className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Çıkış
        </button>
        <div className="text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
          Soru {currentIndex + 1} / {questions.length}
        </div>
      </div>

      <div className="h-2 bg-gray-200 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 min-h-[400px] flex flex-col">
        <h3 className="text-xl font-medium text-gray-800 mb-8 leading-relaxed">
          {currentQuestion.question}
        </h3>

        <div className="grid grid-cols-1 gap-4 mb-8">
          {Object.entries(currentQuestion.options).map(([key, value]) => {
            const isSelected = selectedAnswers[currentIndex] === key;
            const isCorrect = key === currentQuestion.correct_answer;
            const isWrong = isSelected && !isCorrect;

            let borderColor = 'border-gray-200';
            let bgColor = 'bg-white';
            let textColor = 'text-gray-700';

            if (showExplanation) {
              if (isCorrect) {
                borderColor = 'border-green-500';
                bgColor = 'bg-green-50';
                textColor = 'text-green-800';
              } else if (isWrong) {
                borderColor = 'border-red-500';
                bgColor = 'bg-red-50';
                textColor = 'text-red-800';
              } else {
                borderColor = 'border-gray-200 opacity-50';
              }
            } else if (isSelected) {
              borderColor = 'border-blue-500';
              bgColor = 'bg-blue-50';
              textColor = 'text-blue-800';
            }

            return (
              <button
                key={key}
                onClick={() => handleSelect(key)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 group ${borderColor} ${bgColor} ${textColor} ${!showExplanation && 'hover:border-blue-300 hover:bg-blue-50'}`}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                  {key}
                </span>
                <span className="flex-1">{value}</span>
                {showExplanation && isCorrect && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {showExplanation && isWrong && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <div className="mt-auto p-4 bg-yellow-50 border border-yellow-100 rounded-xl text-yellow-900 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h4 className="font-bold flex items-center gap-2 mb-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Çözüm Açıklaması
            </h4>
            <p className="text-sm italic">{currentQuestion.solution}</p>
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!selectedAnswers[currentIndex]}
          className="mt-6 py-4 px-8 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 self-end"
        >
          {showExplanation ? (isLast ? 'Sonucu Gör' : 'Sıradaki Soru') : 'Cevabı Onayla'}
        </button>
      </div>
    </div>
  );
};

export default QuizView;
