// IIFE to protect global scope
(function (window, document) {

// Returns a new HTML Element
// `tagName` is an element tag name as a string,
//   e.g. 'li', 'div', 'ul', etc.
// `classNames` can be an single array of class name strings or
//   class name strings passed as multiple, single arguments.
function createEl(tagName, ...classNames) {
    let el = document.createElement(tagName);
    if (!Array.isArray(classNames[0])) {
        for (const className of classNames) {
            // ignore any arrays after single string arg
            if (Array.isArray(className)) continue;
            el.classList.add(className);
        }
    } else if (classNames[0].length) {
        el.classList.add(...classNames[0])
    }
    return el;
    
}   

// Global Constant
const TIME_LEFT = 50;

// Elements we'll need
const startButton       = document.querySelector(".start-quiz");
const nextButton        = document.querySelector("#next");
const countdownTimer    = document.querySelector("#countdown");
// At the start of the quiz, we'll remove the current card.  
const cardContainer    = document.querySelector('.container');

// Quiz class
class Quiz {
    constructor(data) {
        this.data = data;
        this._index = 0;
        this.score = 0;
        this.inProgress = false;
        this.numCorrect = 0;
        this.completed = false;
        this.timeLeft = TIME_LEFT;
        this.paused = false;
    }

    getIndex() {
        return this._index;
    }

    setIndex(value) {
        this._index = value;
    }

    incrementIndex() {
        if (this._index === this.data.length - 1) {
            this.setIndex(0);
        } else {
            this.setIndex(this._index + 1);
        }
    }

    pause() {
        this.paused = true;
    }

    resume() {
        this.paused = false;
    }

    reset() {
        this._index = 0;
        this.score = 0;
        this.inProgress = false;
        this.numCorrect = 0;
        this.completed = false;
        this.timeLeft = TIME_LEFT;
        this.paused = false;
    }
}

// Instantiate a new quiz object 
const quiz = new Quiz(quizJS);

// Returns <ul> of answer options for each quiz question.
// Sets event listeners on each <li> in list that transition
// on click to either next quiz question or final screen.
function getQuizOptions(quiz) {
    const currentIndex = quiz.getIndex();
    const optionsList = quiz.data[currentIndex]['options'];

    const ul = createEl('ul', 'quiz-answers');

    // Build <ul>
    for (const option in optionsList) {
        let classList = ['quiz-answer'];
        if (optionsList[option]['correct']) {
            classList.push('correct');
        }
        let li = createEl('li', classList);
        li.textContent = optionsList[option]['text'];
        ul.appendChild(li);
    }

    // respond to clicks on answer options
    ul.addEventListener('click', function(event) {
        let target = event.target;
        if (target.matches('.correct')) {
            target.style.backgroundColor = "#7cbf83";
            // increment quiz.numCorrect()
            quiz.numCorrect++;
            // Add 10 points to score
            quiz.score += 10;
            // TODO: Remove
        } else {
            target.style.backgroundColor = "#f47069";
            
            // stop timer and subtract 3 seconds
            quiz.pause();
            quiz.timeLeft = quiz.timeLeft - 3;
            quiz.resume();

        }
        // pause before delay
        quiz.pause();
        // Delay before DOM update
        setTimeout(function() {
            // rusume quiz when callback fires
            quiz.resume();

            // We're at the last quiz question
            if (quiz.getIndex() === quiz.data.length - 1) {
                endQuiz(quiz);
                return;
            } else {
                const currentCard = document.querySelector('.card');
                quiz.incrementIndex();
                cardContainer.replaceChild(
                    createQuizQuestion(quiz),
                    currentCard
                );
            }
        // 0.7 second delay before transition
        }, 700);
    // Set `once` option to only respond to one click per quiz question
    }, { once: true });   

    return ul;
}

// Returns a `.card` HTMLelement (<div>) containing a quiz question
function createQuizQuestion(quiz) {
    const quizQuestion = quiz.data[quiz.getIndex()];
    // parent (card)
    const cardDiv = createEl('div', 'card');
    cardDiv.setAttribute('data-quiz-id', quizQuestion['id']);
    
    // first child
    const cardHeaderDiv = createEl('div', 'card-header');
    const quizQuestionH2 = createEl('h2', 'quiz-question-number');

    quizQuestionH2.textContent = `Question #${quiz.getIndex() + 1}`;
    const quizQuestionText = createEl('p', 'quiz-question-text');
    // Need innerHTML for the blank underline <span>s in some questions
    quizQuestionText.innerHTML = quizQuestion['question'];

    cardHeaderDiv.appendChild(quizQuestionH2);
    cardHeaderDiv.appendChild(quizQuestionText);

    // second child
    const cardBody = createEl('div', 'card-body');
    const quizOptions = getQuizOptions(quiz);
    cardBody.appendChild(quizOptions);

    // append first child to card
    cardDiv.appendChild(cardHeaderDiv);
    // append second child to card
    cardDiv.appendChild(cardBody);

    return cardDiv;
}

function createResults(quiz) {
    // Create parent
    const cardDiv = createEl('div', 'card', 'results');
    const scoreTotal = quiz.score + quiz.timeLeft;
    const timeLeft = quiz.timeLeft !== 0 ? quiz.timeLeft : 'no';
    const message = `
    You completed with quiz with ${timeLeft} seconds left on the clock.
    You answered ${quiz.numCorrect} out of ${quiz.data.length} questions correctly.
    Your total points: ${scoreTotal}.
    `;
    // First child
    const messageEl = createEl('p', 'result-message');
    messageEl.textContent = message;
    // Append first chidl
    cardDiv.appendChild(messageEl);

    const formContainer = createEl('div', 'initial-form-container');
    // createResultsForm
    const resultsForm = createResultsForm(scoreTotal);
    formContainer.appendChild(resultsForm);
    cardDiv.appendChild(formContainer);

    const cancelButton = document.createElement("button");
    cancelButton.setAttribute("id", "cancel-btn");
    cancelButton.textContent = "Cancel";

    cardDiv.appendChild(cancelButton);

    cancelButton.addEventListener('click', () => { window.location.reload() });

    return cardDiv;
}

// Returns a Form Element and adds event handlers
function createResultsForm(totalScore) {
    // parent form
    const resultsForm = document.createElement("form");
    resultsForm.setAttribute("id", "leaderboard-form");
    // first child
    const initialsLabel = document.createElement("label");
    initialsLabel.setAttribute("for", "initials");
    initialsLabel.textContent = 'Save your initials ';
    // second child
    const initialsInput = document.createElement("input");
    initialsInput.setAttribute("type", "text");
    initialsInput.setAttribute("id", "initials");
    initialsInput.setAttribute("name", "initials");
    // thrid child

    const initialsSubmit = document.createElement("button");
    initialsSubmit.setAttribute("id", "save-initials");
    initialsSubmit.setAttribute("value", "SAVE");
    initialsSubmit.textContent = "SAVE";
    // Append label, input, and submit to form element
    resultsForm.appendChild(initialsLabel);
    resultsForm.appendChild(initialsInput);
    resultsForm.appendChild(initialsSubmit);
    
    initialsSubmit.addEventListener('click', function(event) {
        // Don't reload the page
        event.preventDefault();
        let currentStorage = window.localStorage.getItem("leaderboard");
        if (initialsInput.value === '') {
            alert("Please enter your initials before you save")
            return;
        }
        // append to localStorage
        if (currentStorage) {
            let leaderList = JSON.parse(currentStorage);
            leaderList.push({name: initialsInput.value, score: totalScore});
            window.localStorage.setItem("leaderboard", JSON.stringify(leaderList));
            alert("Thanks for saving!");
            // For now
            window.location.reload();
        // create localStorage
        } else {
            let leaderList = [];
            leaderList.push({name: initials.value, score: totalScore});
            window.localStorage.setItem("leaderboard", JSON.stringify(leaderList));
            alert("Thanks for saving!");
            // For now
            window.location.reload();
        }
    });

    return resultsForm;
}



function endQuiz(quiz) {
  // This will stop global timer
    quiz.completed = true;
    showTimer(false);
    const currentCard = document.querySelector('.card');
    // Transition to results page
    cardContainer.replaceChild(
        createResults(quiz), 
        currentCard
    );
}

function startTimer() {
    let timerInterval = setInterval(function() {
        if (!quiz.paused) {
            quiz.timeLeft--;
            countdownTimer.textContent = quiz.timeLeft;
        }
        if (quiz.timeLeft === 0 || quiz.completed) {
            clearInterval(timerInterval);
            if (!quiz.timeLeft) {
               endQuiz(quiz); 
            }
        }
    }, 1000);
}

function showTimer(show) {
    if (show) {
        countdownTimer.style.visibility = 'visible';
        countdownTimer.textContent = quiz.timeLeft;
    } else {
        countdownTimer.style.visibility = 'hidden';
    }
}

startButton.addEventListener('click', function(event) {
    quiz.reset();
    // Quiz is now in progress
    quiz.inProgress = true;
    showTimer(true);
    startTimer();
    cardContainer.replaceChild(
        createQuizQuestion(quiz), 
        document.querySelector('.card')
    );
});

// END IIFE
})(window, document);