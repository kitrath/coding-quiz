function createListItem(className, text) {
    const listEl = document.createElement('li');
    listEl.setAttribute("class", className);
    listEl.textContent = text;
    return listEl
}

function getLeaderBoard() {

    const leaderListEl = document.querySelector("#leaderboard");
    const leaderboard = localStorage.getItem("leaderboard");
    // Nothing in localStorage yet
    if (leaderboard === null) {
        const soleListItem = createListItem(
            "leaderboard-item",
            "No one on the leaderboard yet.  Be the first one!"
        ); 
        leaderListEl.appendChild(soleListItem);
        return;

    } else {
        
        leaderList = JSON.parse(leaderboard).sort(compareScores);
        for (leader of leaderList) {
            let listItemEl = createListItem(
                "leaderboard-item",
                `${leader.name} -- ${leader.score}`
            );
            leaderListEl.appendChild(listItemEl);
        }
        return;
    }
}

function compareScores(a, b) {
    const first = a.score;
    const second = b.score;

    let comparison = 0;
    if (first > second) {
        comaprison = 1;
    } else if (first < second) {
        comparison = -1;
    }
    // reverse order, high to low
    // https://www.sitepoint.com/sort-an-array-of-objects-in-javascript/
    return comparison * -1;
}

getLeaderBoard();