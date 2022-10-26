const startNewGameModal = new bootstrap.Modal(getId('startGameModal'))
const notifyModal = new bootstrap.Modal(getId('notifyModal'))
const modScoreModal = new bootstrap.Modal(getId('modScoreModal'))
const resultModeSetModal = new bootstrap.Modal(getId("resultModeSetModal"))
const resultModal = new bootstrap.Modal(getId('resultModal'))
let fileJSON
let GameData = []
//#region 게임 시작

function beginNewGame() {
    //PURGE OLD DATA
    startNewGameModal.show()
}

function gameLoader() {
    console.group("Load")
    if (getId('newGameDataFile').files[0].type == "application/json") {
        getId('newGameDataFile').files[0].text().then((result) => {
            fileJSON = JSON.parse(result)
            if (fileJSON.gameDataFileV == 1) {
                //OK
                startNewGameModal.hide()
                console.log("FILE CHECK: COMPLETE")
                boardLoader()
            } else {
                startNewGameModal.hide()
                notifyUser("오류: 이 파일은 점수판 데이터 형식이 아닙니다.", "다시 선택해주세요")
                console.warn("Incorrect file: No required field")
                console.groupEnd()
            }
        })
    } else {
        startNewGameModal.hide()
        notifyUser("오류: 파일 확장자", "지원되지 않는 파일 확장자입니다.")
        console.warn("Incorrect file: Not application/json")
        console.groupEnd()
    }
}

function boardLoader() {
    //DRAW
    document.querySelector(".container").innerHTML = "<h1 class='text-center'>" + fileJSON.gameName + "</h1>"
    let rowN = 0;
    fileJSON.players.forEach((element, index, array) => {
        let colN = index % 5
        if (colN == 0) {
            rowN++;
            document.querySelector('.container').innerHTML += "<div class='row g-3 mb-2' id='row" + rowN + "'></div>"
        }
        if (fileJSON.isDeadAvailable) {
            document.getElementById("row" + rowN).innerHTML += `
            <div class="col-2">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title" id='${index}-title'>${element} : 0</h5>
                        <button onclick="modScore(${index})" class="btn btn-primary">점수</button>
                        <button onclick="kill(${index})" class="btn btn-danger">아웃</button>
                    </div>
                </div>
            </div>
            `
        } else {
            document.getElementById("row" + rowN).innerHTML += `
            <div class="col-2">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title" id="${index}-title>${element} : 0</h5>
                        <button onclick="modScore(${index})" class="btn btn-primary">점수</button>
                    </div>
                </div>
            </div>
            `
        }
    })
    console.log("BOARD INIT: COMPLETE") 

    fileJSON.players.forEach((element,index,array) => {
        let player = {
            playerName: element,
            playerID: index,
            score: 0
        }
        GameData.push(player)
    })

    console.log("DATA INIT: COMPLETE")
    console.groupEnd()
}

//#endregion

//#region 플레이어 관련 설정
function modScore(playerN) {
    GameData.forEach((element) => {
        if (element.playerID == playerN) {
            //Load modal with setting
            getId("modScoreUser").innerText = element.playerName + "의 점수 변경"
            getId("modScoreCurrentScore").innerText = element.playerName + "의 현재 점수: " + element.score
            getId("modScoreInput").value = element.score
            getId("modScoreAfterCh").innerText = element.playerName + "의 변경후 점수: "
            getId("modScorePlayerIDHidden").value = element.playerID
            modScoreModal.show()
        }
    })
}

function setScoreUsingModal() {
    modScoreModal.hide()
    console.group("Change score")
    //Get required infos
    let playerID = parseInt(getId("modScorePlayerIDHidden").value)
    let modifiedScore = parseInt(getId("modScoreInput").value)
    //Change Data
    GameData.forEach((element, index, array) => {
        if (element.playerID == playerID) {
            GameData[index].score = modifiedScore
            console.log("Found matching ID and applied score to it")
        }
    })
    updateScoreBoard()
    console.groupEnd()
}

function resetGame() {
    
}

function eraseGame() {
}

function findWinners() {
    resultModeSetModal.show()
}

function startDisplayResult() {
    if (GameData == [] || GameData == undefined || GameData == null || GameData.length == 0) {
        resultModeSetModal.hide()
        notifyUser("오류", "게임을 시작하세요")
    } else {

        console.groupCollapsed("Display Result")
        console.group("Calculate Players")
        let usersToCompare = GameData;
        let orderedByScore = [];
        console.log("Init variables complete")
        console.group("Looping until last players")
        while (!(usersToCompare == "")) {
            let highestScoreUser = [];
            console.groupCollapsed("Loop around players left and find the highest score")
            console.log("USERS CURREN", usersToCompare)
            usersToCompare.forEach((element, index, array) => {
                console.log("HIGHEST SCORE CURRENTLY: ", highestScoreUser)
                if (highestScoreUser == "") {
                    console.log("List is empty: ADDING player")
                    highestScoreUser.push(element)
                } else if (element.score > highestScoreUser[0].score) {
                    console.log("Player with higher score found: Clearing and adding")
                    highestScoreUser = []
                    highestScoreUser.push(element)
                } else if (element.score == highestScoreUser[0].score) {
                    highestScoreUser.push(element)
                    console.log("Player who is currently same with the highest found: Just adding")
                } else {
                    //DO NOTHING
                    console.log("Neither situation")
                }
            })
            console.groupEnd()
    
            console.groupCollapsed("Loop and erase the highest")
    
            highestScoreUser.forEach((element, index, array) => {
                usersToCompare.forEach((element2, index2) => {
                    if (element2 == element) {
                        usersToCompare.splice(index2, 1)
                    }
                    
                });
            });
            console.groupEnd()
            orderedByScore.push(highestScoreUser)
        }
        console.groupEnd()
        console.log(orderedByScore);
        console.groupEnd()
        //Display it
        getId("resultModalBody").innerHTML = ""
        console.group("Render results")
        if (getRadio("resultDisplayModeRadio") == "viewAsFinal") {
            //Draw it!
            //#region 1st
            getId("titleArea").innerHTML = `<h1 class="text-center">오늘의 우승자</h1>`
            if (orderedByScore[0].length == 1) {
                getId("resultModalBody").innerHTML += `
                    <div class="card mb-2" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title" style="color: #ffd700">1등: ${orderedByScore[0][0].playerName}</h5>
                            <p class="card-text">점수: ${orderedByScore[0][0].score}</p>
                        </div>
                    </div>`
                
            } else if (orderedByScore[0].length > 1) {
                let winnerNames = orderedByScore[0][0].playerName
                for (let i = 1; i < orderedByScore[0].length; i++) {
                    element = orderedByScore[0][i]
                    let name2add = ", " + element.playerName
                    winnerNames += name2add
                }
                getId("resultModalBody").innerHTML += `
                    <div class="card mb-2" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title" style="color: #ffd700">1등: ${winnerNames}</h5>
                            <p class="card-text">점수: ${orderedByScore[0][0].score}</p>
                        </div>
                    </div>`
            }
            //#endregion
            //#region 2nd
            if (orderedByScore[1] == undefined) {
                console.log("No 2nd")
            } else if (orderedByScore[1].length == 1) {
                getId("resultModalBody").innerHTML += `
                    <div class="card mb-2" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title" style="color: #c0c0c0">2등: ${orderedByScore[1][0].playerName}</h5>
                            <p class="card-text">점수: ${orderedByScore[1][0].score}</p>
                        </div>
                    </div>`
                
            } else if (orderedByScore[1].length > 1) {
                let winnerNames = orderedByScore[1][0].playerName
                for (let i = 1; i < orderedByScore[1].length; i++) {
                    element = orderedByScore[1][i]
                    let name2add = ", " + element.playerName
                    winnerNames += name2add
                }
                getId("resultModalBody").innerHTML += `
                    <div class="card mb-2" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title" style="color: #c0c0c0">2등: ${winnerNames}</h5>
                            <p class="card-text">점수: ${orderedByScore[1][0].score}</p>
                        </div>
                    </div>`
            } else {
                //DO NONE
                console.log("No 2nd")
            }
            //#endregion
            //#region 3rd
            if (orderedByScore[2] == undefined) {
                console.log("NO 3rd")
            } else if (orderedByScore[2].length == 1) {
                getId("resultModalBody").innerHTML += `
                    <div class="card mb-2" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title" style="color: #cd7f32">3등: ${orderedByScore[2][0].playerName}</h5>
                            <p class="card-text">점수: ${orderedByScore[2][0].score}</p>
                        </div>
                    </div>`
                
            } else if (orderedByScore[2].length > 1) {
                let winnerNames = orderedByScore[2][0].playerName
                for (let i = 1; i < orderedByScore[2].length; i++) {
                    element = orderedByScore[2][i]
                    let name2add = ", " + element.playerName
                    winnerNames += name2add
                }
                getId("resultModalBody").innerHTML += `
                    <div class="card mb-2" style="width: 18rem;">
                        <div class="card-body">
                            <h5 class="card-title" style="color: #cd7f32">3등: ${winnerNames}</h5>
                            <p class="card-text">점수: ${orderedByScore[2][0].score}</p>
                        </div>
                    </div>`
            } else {
                //DO NONE
                console.log("No 3rd")
            }
            //#endregion
            resultModal.show()
            resultModeSetModal.hide()
            GameData = []
            document.querySelector('.container').innerHTML = `
            <noscript><h1>자바스크립트가 필요합니다.</h1></noscript>
            <h1>새로운 게임 시작하기</h1>
            <p>상단 게임 새로시작을 눌러주세요.</p>`
    
        } else if (getRadio("resultDisplayModeRadio") == "viewAsMid") {
    
        } else {
            console.error("Unexpected value in radio. This indicates error in code")
            notifyUser("오류", "라디오의 값이 예상되지 않았습니다.")
        }
        console.groupEnd()
        console.log("DISPLAY RESULT SUCCEED!")
        console.groupEnd()
    }
}

function updateScoreBoard() {
    
    console.groupCollapsed("Update score board")
    GameData.forEach((element, index, array) => {
        
        console.log("Changed: ", element.playerName, " which has ID ", element.playerID, " to score ", element.score)
        getId(index.toString() + "-title").innerText = element.playerName + " : " + element.score.toString()
    })
    console.groupEnd()
}

//#region UTILITY

function notifyUser(title, body) {
    getId("notifyModalLabel").innerText = title
    getId("notifyModalBody").innerText = body
    notifyModal.show()
}

function getId(v) {
    return document.getElementById(v)
}


function getRadio(radioName) {
    let result = null;
    let radios = document.getElementsByName(radioName);
    radios.forEach((element) => {
        if (element.checked) {
            result = element.value
        }
    })
    return result
}

//#endregion