class AudioController {
    constructor() {
        this.bgMusic = new Audio("Assets/audio/spongebob_closing_theme_song.wav");
        this.readySound = new Audio("Assets/audio/im_ready.wav");
        this.flipSound = new Audio("Assets/audio/flip.wav");       
        this.victorySound = new Audio("Assets/audio/spongebob_victory.wav");
        this.failSound = new Audio("Assets/audio/spongebob_fail.wav");
        this.yes = new Audio("Assets/audio/yes-excellent.wav");
        this.bgMusic.volume = 0.5;
        this.readySound.volume = 0.5; 
        this.victorySound.volume = 0.5;
        this.failSound.volume = 0.5;
        this.bgMusic.loop = true;
    }
    startBgMusic() {
        this.bgMusic.play();
    }
    stopBgMusic() {
        this.bgMusic.pause();
        this.bgMusic.currentTime = 0;
    }
    flip() {
        this.flipSound.play();
    }
    match() {
        let randNumber = Math.random();
        if(randNumber < 0.5) this.yes.play();
    }
    ready() {
        this.readySound.play();
    }
    victory() {
        this.victorySound.play();
        this.stopBgMusic();
    }
    fail() {
        this.failSound.play();
        this.stopBgMusic();
    }
}

class SpongebobMatching {
    constructor(cards){
        this.cards = cards;
        this.flipCounter = document.getElementById("flips");
        this.audioController = new AudioController();
    }
    setTime(totalTime) {
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById("time");
    }
    setMode(gameMode) {
        if(gameMode === "no-time-limit"){
            this.setTime(9999);
        }
        else if(gameMode === "reveal"){
            this.revealCards();
            setTimeout(() => {
                this.hideCards();
                this.countDown = this.startCountDown(); 
            }, 1000)
        }
    }
    start() {
        this.cardToCheck = null;
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.matchedCards = [];
        this.busy = true;
        this.audioController.ready();
        this.shuffleCards();    
        setTimeout(() => {
            this.audioController.startBgMusic();      
            if(this.mode !== "reveal"){
                this.countDown = this.startCountDown();  
            }
            this.busy = false;
        }, 500);
        this.setMode(this.mode);
        this.timer.innerText = this.timeRemaining;
        this.flipCounter.innerText = this.totalClicks;
    }
    revealCards() {
        this.cards.forEach(card =>{
            card.classList.add("visible");
        })
    }
    hideCards() {
        this.cards.forEach(card => {
            card.classList.remove("visible");
            card.classList.remove("matched");
        })
    }
    flipCard(card) {
        if(this.canFlipCard(card)){
            this.audioController.flip();
            this.totalClicks++;
            this.flipCounter.innerText = this.totalClicks;
            card.classList.add("visible");

            if(this.cardToCheck) {
                this.checkMatch(card, this.cardToCheck);
            } else {
                this.cardToCheck = card;
            }
        }
    }
    checkMatch(card1, card2) {
        if(this.getCardValue(card1) === this.getCardValue(card2)){
            this.match(card1, card2);
        } else {
            this.misMatch(card1, card2);
        }
        this.cardToCheck = null;
    }
    match(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        card1.classList.add("matched");
        card2.classList.add("matched");
        this.audioController.match();
        if(this.matchedCards.length === this.cards.length) {
            this.victory();
        }
    }
    misMatch(card1, card2) {
        this.busy = true;
        setTimeout(() => {
            card1.classList.remove("visible");
            card2.classList.remove("visible");
            this.busy = false;
        }, 1000)
    }
    getCardValue(card) {
        return card.getElementsByClassName("card-value")[0].src;
    }
    canFlipCard(card) {
        return !this.busy && !this.matchedCards.includes(card) && card !== this.cardToCheck;
    }
    shuffleCards() {
        for(let i=this.cards.length-1 ; i>0 ; i--) {
            let randNumber = Math.floor(Math.random() * (this.cards.length-1));
            this.cards[randNumber].style.order = i;
            this.cards[i].style.order = randNumber;           
        }
    }
    startCountDown() {
        return setInterval(() => {
            this.timeRemaining--;
            this.timer.innerText = this.timeRemaining;
            if(this.timeRemaining === 0){
                this.gameOver();
            }
        }, 1000)
    }
    gameOver() {
        clearInterval(this.countDown);
        this.audioController.stopBgMusic();
        this.audioController.fail();
        document.getElementById("game-over-text").classList.add("visible");
        this.busy = true;
        setTimeout(() => {
            this.busy = false;
        }, 2000)
    }
    victory() {
        clearInterval(this.countDown);
        this.audioController.stopBgMusic();
        this.audioController.victory();
        document.getElementById("game-victory-text").classList.add("visible");
        this.busy = true;
        setTimeout(() => {
            this.busy = false;
        }, 2000)
    }
}

function ready() {
    let secs = Array.from(document.getElementsByClassName("sec"));
    let plays = Array.from(document.getElementsByClassName("play"));
    let cards = Array.from(document.getElementsByClassName("card"));
    let gameEnds = Array.from(document.getElementsByClassName("game-end"));
    let modes = Array.from(document.getElementsByClassName("mode"));
    let game = new SpongebobMatching(cards);

    gameEnds.forEach(gameEnd => {
        gameEnd.addEventListener("click", () => {
            if(!game.busy){
                gameEnd.classList.remove("visible");
                document.getElementById("game-mode").classList.add("visible"); 
            }
        })
    })

    modes.forEach(mode => {
        mode.addEventListener("click", () => {
            game.mode = mode.id;
            document.getElementById("game-mode").classList.remove("visible")
            if(mode.id === "no-time-limit"){
                document.getElementById("game-start-text").classList.add("visible");
            } else {
                document.getElementById("time-setting").classList.add("visible");
            }          
        })
    })

    secs.forEach(sec => {
        sec.addEventListener("click", () => {
            let time = parseInt(sec.id);
            document.getElementById("time-setting").classList.remove("visible")
            document.getElementById("game-start-text").classList.add("visible");
            game.setTime(time);
            game.hideCards();
        })    
    })

    plays.forEach(play => {
        play.addEventListener("click", () => {
            play.classList.remove("visible");
            game.start();
        })
    })

    cards.forEach(card => {
        card.addEventListener("click", () => {
           game.flipCard(card); 
        })    
    })

}

if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ready());
} else {
    ready();
}