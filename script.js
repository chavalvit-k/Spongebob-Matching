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
    stopVictory() {
        this.victorySound.pause();
        this.victorySound.currentTime = 0;
    }
    fail() {
        this.failSound.play();
        this.stopBgMusic();
    }
    stopFail() {
        this.failSound.pause();
        this.failSound.currentTime = 0;
    }
}

class SpongebobMatching {
    constructor(cards){
        this.cards = cards;
        this.totalTime = 0;
        this.flipCounter = 0;
        this.timer = document.getElementById("time");
        this.flipCounter = document.getElementById("flips");
        this.audioController = new AudioController();
    }
    setMode(gameMode) {
        if(gameMode === "no-time-limit"){
            this.totalFlips = 0;
            this.totalTime = "-";
        }
        else if(gameMode === "reveal"){
            this.totalTime = "-";
            this.revealCards();
            setTimeout(() => {
                this.hideCards();
            }, 2500)
        }
        else{
            this.totalFlips = 0;
        }
    }
    setCollections(collections) {
        let collectionsImage = [];
        if(collections === "characters-3d"){
            collectionsImage = ["gary", "krabs", "patrick", "plankton", "karen", "sandy", "spongebob", "squidward", "mermaid_man", "larry"];
            collectionsImage = collectionsImage.map(collection => `Assets/images/3d/${collection}_3d.png`);
        }
        else if(collections === "locations"){
            collectionsImage = ["chum_bucket", "goo_lagoon", "jellyfish_fields", "krusty_krab", "patrick_house", "sandy_treedome", "spongebob_house", "squidward_house", "sand_mountain", "taco_sombrero"];
            collectionsImage = collectionsImage.map(collection => `Assets/images/locations/${collection}.png`);
        }
        else{
            collectionsImage = ["gary" ,"krabs", "patrick", "pearl", "plankton", "puff", "sandy", "spongebob", "squidward", "karen"];
            collectionsImage = collectionsImage.map(collection => `Assets/images/characters/${collection}.png`)
        }

        for(let i=0 ; i<20 ; i+=2){
            this.cards[i].getElementsByClassName("card-value")[0].src = collectionsImage[i/2];
            this.cards[i+1].getElementsByClassName("card-value")[0].src = collectionsImage[i/2];
        }
    }
    start() {
        this.cardToCheck = null;
        this.matchedCards = [];
        this.busy = true;
        this.audioController.ready();
        this.audioController.startBgMusic();
        this.shuffleCards();
        this.setMode(this.mode);
        let delay = this.mode === "reveal" ? 3000 : 500;
        setTimeout(() => {            
            if(this.mode === "default"){
                this.countDown = this.startCountDown();  
            }
            this.busy = false;         
        }, delay);  
        this.timer.innerText = this.totalTime;
        this.flipCounter.innerText = this.totalFlips;
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
            if(this.mode === "reveal"){
                this.totalFlips--;
            }
            else{
                this.totalFlips++;
            }
            this.flipCounter.innerText = this.totalFlips;
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
            if(this.totalFlips === 0 && this.matchedCards.length !== 20){ // reveal mode game over case
                this.gameOver();
            }       
        } else {
            if(this.totalFlips === 0){ // reveal mode game over case
                this.gameOver();
            }
            this.misMatch(card1, card2);
        }
        this.cardToCheck = null;
    }
    match(card1, card2) {
        this.matchedCards.push(card1);
        this.matchedCards.push(card2);
        this.audioController.match();         
        setTimeout(() => {
            card1.classList.add("matched");
            card2.classList.add("matched");        
        }, 1000);      
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
            this.totalTime--;
            this.timer.innerText = this.totalTime;
            if(this.totalTime === 0){
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
        }, 1000)
    }
    victory() {
        clearInterval(this.countDown);
        this.audioController.stopBgMusic();
        this.audioController.victory();
        document.getElementById("game-victory-text").classList.add("visible");
        this.busy = true;
        setTimeout(() => {
            this.busy = false;
        }, 1000)
    }
    stopEndGameSound() {
        this.audioController.stopFail();
        this.audioController.stopVictory();
    }
}

function ready() {
    let modes = Array.from(document.getElementsByClassName("mode"));
    let collections = Array.from(document.getElementsByClassName("collections"));
    let secs = Array.from(document.getElementsByClassName("sec"));
    let flips = Array.from(document.getElementsByClassName("flips"));
    let plays = Array.from(document.getElementsByClassName("play"));
    let gameEnds = Array.from(document.getElementsByClassName("game-end"));
    let cards = Array.from(document.getElementsByClassName("card"));  
    let game = new SpongebobMatching(cards);

    gameEnds.forEach(gameEnd => {
        gameEnd.addEventListener("click", () => {
            if(!game.busy){
                game.hideCards();
                game.stopEndGameSound();
                gameEnd.classList.remove("visible");
                document.getElementById("game-mode-setting").classList.add("visible");         
            }
        })
    })

    modes.forEach(mode => {
        mode.addEventListener("click", () => {
            game.mode = mode.id;
            document.getElementById("game-mode-setting").classList.remove("visible")
            document.getElementById("collections-setting").classList.add("visible");
        })
    })

    collections.forEach(collection => {
        collection.addEventListener("click", () => {
            game.setCollections(collection.id);
            document.getElementById("collections-setting").classList.remove("visible")
            if(game.mode === "no-time-limit"){
                document.getElementById("game-start-text").classList.add("visible");
            }
            else if(game.mode === "reveal"){
                document.getElementById("flips-setting").classList.add("visible");
            }
            else{
                document.getElementById("time-setting").classList.add("visible");
            }     
        })
    })

    secs.forEach(sec => {
        sec.addEventListener("click", () => {
            let time = parseInt(sec.id);
            game.totalTime = time;
            document.getElementById("time-setting").classList.remove("visible")
            document.getElementById("game-start-text").classList.add("visible");      
        })    
    })

    flips.forEach(flip => {
        flip.addEventListener("click", () => {
            let totalFlips = parseInt(flip.id);
            game.totalFlips = totalFlips;
            document.getElementById("flips-setting").classList.remove("visible");
            document.getElementById("game-start-text").classList.add("visible");
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