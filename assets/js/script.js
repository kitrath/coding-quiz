// IIFE to protect global scope
(function (window, document) {

// TEST
for (const question of quizJS) {
    console.log(JSON.stringify(question));
}
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

// Elements we'll need
const startButton       = document.querySelector(".start-quiz");
const nextButton        = document.querySelector("#next");

// At the start of the quiz, we'll remove the current card.  We'll
// keep the reference to it alive and replace it after the quiz
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

    reset() {
        this._index = 0;
        this.score = 0;
        this.inProgress = false;
        this.numCorrect = 0;
        this.completed = false;
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
            console.log(`Current score: ${quiz.score}`);
        } else {
            target.style.backgroundColor = "#f47069";
            // TODO: Remove
            console.log("WRONG");
        }
        // Delay before DOM update
        setTimeout(function() {
            const currentCard = document.querySelector('.card');
            quiz.incrementIndex();
            cardContainer.replaceChild(
                createQuizQuestion(quiz),
                currentCard
            );
        // 0.8 second delay before transition
        }, 800);
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





startButton.addEventListener('click', function(event) {
    // Quiz is now in progress
    quiz.inProgress = true;
    cardContainer.replaceChild(createQuizQuestion(quiz), document.querySelector('.card'));
});

nextButton.addEventListener('click', function(event) {
    // Introspect global quiz object to see where we are
    if (!quiz.inProgress) {
        // do nothing if no quiz
        return;
    } else {
        // get current reference to .card section
        const currentCard = document.querySelector('.card');
        quiz.incrementIndex();
        cardContainer.replaceChild(createQuizQuestion(quiz), currentCard); 
    }
});



// END IIFE
})(window, document);