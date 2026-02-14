
import React, { useState } from 'react';
import { QuizResult, QuizQuestion } from '../types';

interface ResultViewProps {
  result: QuizResult;
  questions: QuizQuestion[];
  onRestart: () => void;
}

const ResultView: React.FC<ResultViewProps> = ({ result, questions, onRestart }) => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const percentage = Math.round((result.score / result.total) * 100);

  const handleCopyJSON = () => {
    const jsonStr = JSON.stringify(questions, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 2000);
    });
  };

  let message = "Daha fazla çalışmalısın!";
  let bgColor = "bg-red-50";
  let textColor = "text-red-600";
  let icon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );

  if (percentage >= 80) {
    message = "Harika! Çok başarılı bir sonuç.";
    bgColor = "bg-green-50";
    textColor = "text-green-600";
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
      </svg>
    );
  } else if (percentage >= 50) {
    message = "İyi gidiyorsun, biraz daha gayret!";
    bgColor = "bg-blue-50";
    textColor = "text-blue-600";
    icon = (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-in zoom-in duration-500">
      <div className={`text-center p-12 rounded-3xl ${bgColor} border-2 border-white shadow-2xl relative overflow-hidden`}>
        {icon}
        <h2 className={`text-4xl font-black mt-4 mb-2 ${textColor}`}>%{percentage} Başarı</h2>
        <p className="text-gray-600 text-lg mb-8">{message}</p>
        
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-green-500">{result.score}</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Doğru</div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
            <div className="text-3xl font-bold text-red-500">{result.total - result.score}</div>
            <div className="text-xs text-gray-400 uppercase tracking-widest font-bold">Yanlış</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-10 py-4 bg-gray-900 text-white rounded-2xl font-bold text-lg hover:bg-black transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            Yeni Sınav Başlat
          </button>
          
          <button
            onClick={handleCopyJSON}
            className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-lg transition-all active:scale-95 shadow-lg flex items-center justify-center gap-2 border-2 ${
              copyStatus === 'copied' 
              ? 'bg-green-100 border-green-500 text-green-700' 
              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'
            }`}
          >
            {copyStatus === 'copied' ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Kopyalandı!
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                </svg>
                JSON Kopyala
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-12 space-y-6">
        <h3 className="text-2xl font-bold text-gray-800">Soru Analizi</h3>
        {questions.map((q, idx) => {
          const ans = result.answers[idx];
          return (
            <div key={idx} className={`p-6 rounded-2xl border-l-8 bg-white shadow-md animate-in fade-in slide-in-from-left-4 duration-500`} style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 mb-2">{idx + 1}. {q.question}</p>
                  <div className="text-sm space-y-1">
                    <p className={`font-medium ${ans.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      Senin Cevabın: {ans.selectedOption} - {q.options[ans.selectedOption as keyof typeof q.options]}
                    </p>
                    {!ans.isCorrect && (
                      <p className="text-gray-500">
                        Doğru Cevap: {q.correct_answer} - {q.options[q.correct_answer as keyof typeof q.options]}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm italic text-gray-500">
                    <span className="font-bold">Çözüm:</span> {q.solution}
                  </div>
                </div>
                {ans.isCorrect ? (
                  <div className="bg-green-100 p-2 rounded-full shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
                  <div className="bg-red-100 p-2 rounded-full shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ResultView;
