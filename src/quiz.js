import React, { useState } from "react";

function App() {
  const questions = [
    {
      question: "What is the correct syntax to declare a variable in JavaScript?",
      options: ["var", "int", "dim", "let"],
      answer: "let",
    },
    {
      question: "Which of the following is a primitive data type in JavaScript?",
      options: ["Object", "String", "Boolean", "Array"],
      answer: "Boolean",
    },
    {
      question: "What does `typeof null` return?",
      options: ["'object'", "'null'", "'undefined'", "'number'"],
      answer: "'object'",
    },
    {
      question: "Which operator is used for strict equality in JavaScript?",
      options: ["==", "!=", "===", "!=="],
      answer: "===",
    },
    {
      question: "Which of the following is a JavaScript framework?",
      options: ["React", "Laravel", "Django", "Flask"],
      answer: "React",
    },
  ];

  const [userAnswers, setUserAnswers] = useState(Array(questions.length).fill(null));
  const [score, setScore] = useState(null);

  const handleOptionChange = (index, selectedOption) => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[index] = selectedOption;
    setUserAnswers(updatedAnswers);
  };

  const calculateScore = () => {
    const calculatedScore = userAnswers.reduce((total, answer, index) => {
      return answer === questions[index].answer ? total + 1 : total;
    }, 0);
    setScore(calculatedScore);
  };

  return (
    <div style={{ backgroundColor: "#FFA500", padding: "20px", fontFamily: "Arial" }}>
      <h1>JavaScript Quiz</h1>
      {questions.map((q, index) => (
        <div key={index} style={{ marginBottom: "20px" }}>
          <p>{q.question}</p>
          {q.options.map((option, i) => (
            <div key={i}>
              <label>
                <input
                  type="radio"
                  name={`question-${index}`}
                  value={option}
                  checked={userAnswers[index] === option}
                  onChange={() => handleOptionChange(index, option)}
                />
                {option}
              </label>
            </div>
          ))}
        </div>
      ))}
      <button onClick={calculateScore} style={{ backgroundColor: "#008CBA", color: "#fff", padding: "10px", border: "none", borderRadius: "5px" }}>
        View Results
      </button>
      {score !== null && (
        <p style={{ marginTop: "20px" }}>Your score is {score}/{questions.length}</p>
      )}
    </div>
  );
}

export default App;
