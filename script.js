class AudioController {
    constructor() {
        this.bgMusic = new Audio("Assets/audio/spongebob_closing_theme_song.wav");
        this.readySound = new Audio("Assets/audio/im_ready.wav");
        this.flipSound = new Audio("Assets/audio/flip.wav");       
        this.victorySound = new Audio("Assets/audio/spongebob_victory.wav");
        this.failSound = new Audio("Assets/audio/spongebob_fail.wav");
        this.yes = new Audio("Assets/audio/yes-excellent.wav");
        // this.yeah = new Audio("Assets/audio/yeah.wav");
        // this.yeah2 = new Audio("Assets/audio/yeah2.wav");
        // this.yeah3 = new Audio("Assets/audio/yeah3.wav");
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
    constructor(totalTime, cards){
        this.cards = cards;
        this.totalTime = totalTime;
        this.timeRemaining = totalTime;
        this.timer = document.getElementById("time");
        this.flipCounter = document.getElementById("flips");
        this.audioController = new AudioController();
    }
    start() {
        this.cardToCheck = null;
        this.totalClicks = 0;
        this.timeRemaining = this.totalTime;
        this.matchedCards = [];
        this.busy = true;
        this.audioController.ready();
        setTimeout(() => {
            this.audioController.startBgMusic();
            this.shuffleCards();
            this.countDown = this.startCountDown();
            this.busy = false;
        }, 500);
        this.hideCards();
        this.timer.innerText = this.timeRemaining;
        this.flipCounter.innerText = this.totalClicks;
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
            let randNumber = Math.floor(Math.random() * (i+1));
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
    }
    victory() {
        clearInterval(this.countDown);
        this.audioController.stopBgMusic();
        this.audioController.victory();
        document.getElementById("game-victory-text").classList.add("visible");
    }
}

function ready() {
    let overlays = Array.from(document.getElementsByClassName("overlay-text"));
    let cards = Array.from(document.getElementsByClassName("card"));
    let game = new SpongebobMatching(1, cards);

    overlays.forEach(overlay => {
        overlay.addEventListener("click", () => {
            overlay.classList.remove("visible");
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