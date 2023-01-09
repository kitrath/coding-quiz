// IIFE to protect global scope
(function (window, document) {

// TODO: Remove
for (const question of quizJS) {
    console.log(JSON.stringify(question));
}

// utility funcitons
function isObjectEmpty(obj) {
    return (
        obj &&
        Object.keys(obj).length === 0 && 
        typeof obj.constructor === Object
    );
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

// Returns a reference to the removed element.
// `selector` is a selector string
// `parentElem` is a reference to the parent element of the element to remove.
function removeEl(selector, parentElem) {
    const el = document.querySelector(el);
    return parentElem.removeChild(el);
}

// Elements we'll need
const startButton       = document.querySelector("#start-quiz");
const nextButton        = document.querySelector("#next");
const leaderBoardButton = document.querySelector("#leaderboard");

// At the start of the quiz, we'll remove the current card.  We'll
// keep the reference to it alive and replace it after the quiz
const cardContainer    = document.querySelector('.container');
let initialCardRemoved = false;

// Returns a `ul.quiz-answers` HTMLElement
function getQuizOptions(optionsList) {
    const ul = createEl('ul', 'quiz-answers');
    for (const option in optionsList) {
        let classList = ['quiz-answer'];
        if (optionsList[option]['correct']) {
            // TODO: Consider other options for this
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
            target.style.backgroundColor = '#7cbf83';
        } else {
            target.style.backgroundColor = '#f47069';
        }
        // use setTimeout to delay transition to next question
    });

    return ul;
}

// Returns a `.card` HTMLelement (<div>) containing a quiz question
function createQuizQuestion(quizQuestion, count) {
    // parent (card)
    const cardDiv = createEl('div', 'card');
    cardDiv.setAttribute('data-quiz-id', quizQuestion['id']);
    
    // first child
    const cardHeaderDiv = createEl('div', 'card-header');
    const quizQuestionH2 = createEl('h2', 'quiz-question-number');

    quizQuestionH2.textContent = `Question #${count}`;
    const quizQuestionText = createEl('p', 'quiz-question-text');
    // Need innerHTML for the blank underline <span>s in some questions
    quizQuestionText.innerHTML = quizQuestion['question'];

    cardHeaderDiv.appendChild(quizQuestionH2);
    cardHeaderDiv.appendChild(quizQuestionText);

    // second child
    const cardBody = createEl('div', 'card-body');
    const quizOptions = getQuizOptions(quizQuestion['options']);
    cardBody.appendChild(quizOptions);

    // append first child to card
    cardDiv.appendChild(cardHeaderDiv);
    // append second child to card
    cardDiv.appendChild(cardBody);

    return cardDiv;
}

// TODO: Remove - Current stand-in for quiz initialization
cardContainer.replaceChild(createQuizQuestion(quizJS[0], 1), document.querySelector('.card'));

// TODO: Revise - Quick and dirty quiz object for testing
const quiz = {
    _index: 0,
    // TODO: Remove - inProgress always true for testing
    inProgress: true,
    getIndex: function() {
        return this._index;
    },
    _setIndex: function(number) {
        this._index = number;
    },
    incrementIndex: function() {
        if (this._index === quizJS.length - 1) {
            this._setIndex(0);    
        } else {
            this._setIndex(this._index + 1);
        }
    }
}

nextButton.addEventListener('click', function(event) {
    // Introspect global quiz object to see where we are
    if (!quiz.inProgress) {
        // do nothing if no quiz
        return;
    } else {
        // get current reference to .card section
        const currentCard = document.querySelector('.card');
        quiz.incrementIndex();
        let currentIndex = quiz.getIndex();
        cardContainer.replaceChild(createQuizQuestion(quizJS[currentIndex], currentIndex + 1), currentCard); 
    }
});

// END IIFE
})(window, document);