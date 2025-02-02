







(function () {
  const baseURL = 'http://localhost:5000/proxy';
  const containerEl = document.querySelector('.container');
  const form = document.querySelector('#quiz_form');
  const qusEl = document.querySelector('.qus');
  const optionsEl = document.querySelector('.all_options');
  const buttonsEl = document.querySelector('.buttons');
  const scoreEl = document.querySelector('.scoreBoard .score-num');
  const answeredEl = document.querySelector('.scoreBoard .answered-num');
  const TopicE1 = document.querySelector('.Topic');
  const TitleE1 = document.querySelector('.Title');

  let currentQuestionIndex = 0; // Track the current question index
  let score = 0;
  let answeredQus = 0;
  let questions = []; // Store all questions
  let Topic = '';
  let Title = '';
  let solutionVisible = false; // Track if the detailed solution is visible

  window.addEventListener('DOMContentLoaded', quizApp);

  async function quizApp() {
    const data = await fetchQuiz();
    Topic = data.topic;
    Title = data.title;
    questions = data.questions; // Store all questions
    updateScoreBoard();
    addPlaceholder();
    displayQuestion();
  }

  function displayQuestion() {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex].description;
      const allOptions = questions[currentQuestionIndex].options;

      let answer;
      const incorrect_answers = [];

      allOptions.forEach(option => {
        if (option.is_correct) {
          answer = option.description;
        } else {
          incorrect_answers.push(option);
        }
      });

      const options = [...incorrect_answers.map(item => item.description)];
      options.splice(Math.floor(Math.random() * (options.length + 1)), 0, answer);

      generateTemplate(question, options, answer, Topic, Title);
    } else {
      finishQuiz(); // If there are no more questions, finish the quiz
    }
  }

  async function fetchQuiz() {
    try {
      const response = await fetch(baseURL);
      const responseText = await response.text();
      if (responseText.trim()) {
        const data = JSON.parse(responseText);
        return data;
      } else {
        throw new Error('Empty response from the server');
      }
    } catch (error) {
      console.error('Error fetching quiz data:', error);
    }
  }

  function generateTemplate(question, options, answer, Topic, Title) {
    removePlaceHolder();
    optionsEl.innerHTML = '';
    TopicE1.innerHTML = "Topic: " + Topic;
    TitleE1.innerHTML = "Title: " + Title;
    qusEl.innerText = question;

    options.forEach((option, index) => {
      const item = document.createElement('div');
      item.classList.add('option');
      item.innerHTML = `
        <input type="radio" id="option${index + 1}" value="${option}" name="quiz">
        <label for="option${index + 1}">${option}</label>
      `;
      optionsEl.appendChild(item);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (e.target.quiz.value) {
      checkQuiz(e.target.quiz.value);
      e.target.querySelector('button').style.display = 'none';
      generateButtons();
    } else {
      return;
    }
  });

  function checkQuiz(selected) {
    if (currentQuestionIndex < questions.length) {
      answeredQus++;
      const correctAnswer = questions[currentQuestionIndex].options.find(option => option.is_correct).description;
      if (selected === correctAnswer) {
        score++;
      }
      updateScoreBoard();
      form.quiz.forEach(input => {
        if (input.value === correctAnswer) {
          input.parentElement.classList.add('correct');
        }
      });

      // Clear any previous detailed solution link
      clearDetailedSolutionLink();

      // Show detailed solution link after answering
      const detailedSolutionLink = document.createElement('a');
      detailedSolutionLink.innerText = 'View Detailed Solution';
      detailedSolutionLink.href = '#';
      detailedSolutionLink.classList.add('detailed-solution');
      detailedSolutionLink.style.display = 'block'; // Ensures it appears below

      // Append the detailed solution link below the buttons
      buttonsEl.appendChild(detailedSolutionLink);

      // Event listener for Detailed Solution
      detailedSolutionLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (!solutionVisible) {
          solutionVisible = true; // Set the flag to true
          showDetailedSolution(questions[currentQuestionIndex].detailed_solution);
        }
      });
    }
  }

  function updateScoreBoard() {
    scoreEl.innerText = score;
    answeredEl.innerText = answeredQus;
  }

  function generateButtons() {
    const finishBtn = document.createElement('button');
    finishBtn.innerText = 'Finish';
    finishBtn.setAttribute('type', 'button');
    finishBtn.classList.add('finish-btn');
    buttonsEl.appendChild(finishBtn);

    const nextBtn = document.createElement('button');
    nextBtn.innerText = 'Next Question';
    nextBtn.setAttribute('type', 'button');
    nextBtn.classList.add('next-btn');
    buttonsEl.appendChild(nextBtn);

    nextBtn.addEventListener('click', getNextQuiz);
    finishBtn.addEventListener('click', finishQuiz);
  }

  function clearDetailedSolutionLink() {
    const detailedSolutionLink = document.querySelector('.detailed-solution');
    if (detailedSolutionLink) {
      buttonsEl.removeChild(detailedSolutionLink);
    }
  }

  function showDetailedSolution(solution) {
    const solutionContainer = document.createElement('div');
    solutionContainer.classList.add('solution-container');
    solutionContainer.innerHTML = `
      <h3>Detailed Solution</h3>
      <p>${solution}</p>
      <button class="close-solution">Close</button>
    `;
    containerEl.appendChild(solutionContainer);

    // Close button functionality
    solutionContainer.querySelector('.close-solution').addEventListener('click', () => {
      containerEl.removeChild(solutionContainer);
      solutionVisible = false; // Reset the flag when the solution is closed
    });
  }

  function getNextQuiz() {
    currentQuestionIndex++;
    const nextBtn = document.querySelector('.next-btn');
    const finishBtn = document.querySelector('.finish-btn');

    buttonsEl.removeChild(nextBtn);
    buttonsEl.removeChild(finishBtn);

    buttonsEl.querySelector('button[type="submit"]').style.display = 'block';
    displayQuestion();
    clearDetailedSolutionLink(); // Clear solution link when going to the next question
    solutionVisible = false; // Reset solution visibility
  }

  function finishQuiz() {
    const nextBtn = document.querySelector('.next-btn');
    const finishBtn = document.querySelector('.finish-btn');

    if (nextBtn) {
      buttonsEl.removeChild(nextBtn);
    }
    if (finishBtn) {
      buttonsEl.removeChild(finishBtn);
    }

    buttonsEl.querySelector('button[type="submit"]').style.display = 'block';

    const overlay = document.createElement('div');
    overlay.classList.add('result-overlay');
    overlay.innerHTML = `
      <div class="final-result">${score}/${answeredQus}</div>
      <button>Play Again</button>
    `;
    containerEl.appendChild(overlay);
    document.querySelector('.result-overlay button')
      .addEventListener('click', () => {
        containerEl.removeChild(overlay);
        playAgain();
      });
  }

  function playAgain() {
    score = 0;
    answeredQus = 0;
    currentQuestionIndex = 0; // Reset question index
    quizApp();
  }

  function addPlaceholder() {
    const placeholder = document.createElement('div');
    placeholder.classList.add('placeholder');
    containerEl.appendChild(placeholder);
  }

  function removePlaceHolder() {
    const placeholderEl = document.querySelector('.container .placeholder');
    if (placeholderEl) {
      containerEl.removeChild(placeholderEl);
    }
    // Remove previous detailed solution if exists
    const solutionContainer = document.querySelector('.solution-container');
    if (solutionContainer) {
      containerEl.removeChild(solutionContainer);
    }
  }
})();

