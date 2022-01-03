//變數宣告
const Symbols = [
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]
const GAME_STATUS = {
    FirstCardAwait: 'FirstCardAwait',
    SecondCardAwait: 'SecondCardAwait',
    CardsMatchFailed: 'CardMatchFailed',
    CardsMatched: 'CardMatched',
    GameFinished: 'GameFinished',
}
// View
let view = {
    // 渲染卡片
    getCardElement(index){
        return`<div data-index=${index} class='card back'></div>`
    },
    getCardContent(index){
        let number = this.transformNumber(index % 13 +1)
        let symbol = Symbols[Math.floor(index/13)]
        return`
             <p>${number}</p>
             <img src=${symbol} alt="card">
             <p>${number}</p>
        `
    },
    //翻開卡片
    flipCards(...cards){
        cards.map(card => {
            if ( card.classList.contains('back')){
                card.classList.remove('back')
                card.innerHTML = this.getCardContent(Number(card.dataset.index))
                return
                }
            card.classList.add('back')
            card.innerHTML = null
            })
        },

    // 改變特殊花色數字
    transformNumber(number){
        switch(number){
            case 1 : return 'A'
            case 11 : return 'J'
            case 12 : return 'Q'
            case 13 : return 'K'
            default : return number
        }
    },
    displayCards(indexes){
        const rootElement = document.querySelector('#cards')
        rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
    },
    pairCards(...card){
        card.map(card =>{
            card.classList.add('paired')
        })
    },
    renderScore(score){
        document.querySelector('.score').innerHTML = `Score :${score}`
    },
    renderTriedTimes(times){
        document.querySelector('.tried').innerHTML = `You have try ${times} times`
    },
    appendWrongAnimation(...cards){
        cards.map(card => {
            card.classList.add('wrong')
            card.addEventListener('animationend', event =>  event.target.classList.remove('wrong'), {once:true} )
            })
    },
    showGameFinished(){
        const div = document.createElement('div')
        div.classList.add('complete')
        div.innerHTML =`
            <p>Complete!</p>
            <p>Your Score is ${model.score}</p>
            <p>You have try ${model.triedTimes} times</p>
        `
        document.querySelector('#header').before(div)
    },
}
// Model
let model = {
    revealCards:[],
    isRevealdCardMatched(){
       return this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13
    },
    score: 0,
    triedTimes: 0,
}
// Controller
let controller = {
    currentStatus: GAME_STATUS.FirstCardAwait,
    generateCards(){
        view.renderScore(model.score)
        view.renderTriedTimes(model.triedTimes)
        view.displayCards(utility.getRandomCard(52))
    },
    dispatchCardAction(card){
        if(!card.classList.contains('back')){
            return
        }
        switch (this.currentStatus) {
            case GAME_STATUS.FirstCardAwait :
                view.flipCards(card)
                model.revealCards.push(card)
                this.currentStatus = GAME_STATUS.SecondCardAwait
                break
            case GAME_STATUS.SecondCardAwait :
                view.renderTriedTimes(model.triedTimes += 1)
                view.flipCards(card)
                model.revealCards.push(card)
                if(model.isRevealdCardMatched()){
                    view.renderScore(model.score += 10)
                    this.currentStatus = GAME_STATUS.CardsMatched
                    view.pairCards(...model.revealCards)
                    model.revealCards = []
                    if(model.score === 260){
                        console.log('showGameFinished')
                        view.showGameFinished()
                        return
                    }
                    this.currentStatus = GAME_STATUS.FirstCardAwait
                } else {
                    this.currentStatus = GAME_STATUS.CardsMatchFailed
                    view.appendWrongAnimation(...model.revealCards)
                    setTimeout(this.resetCards,1000)
                }
                break
        }
        console.log('this.currentStatus:', this.currentStatus)
        console.log('revealCards:', model.revealCards.map(card => card.dataset.index))
    },
    resetCards(){
        view.flipCards(...model.revealCards)
        model.revealCards = []
        controller.currentStatus = GAME_STATUS.FirstCardAwait
    },
}
const utility = {
    getRandomCard(count){
        let number = Array.from(Array(count).keys())
        for(let index = number.length - 1; index > 0; index--){
            let randomIndex = Math.floor(Math.random()* (index+1))
            ;[number[index],number[randomIndex]] =  [number[randomIndex],number[index]] 
        }
        return number
    }
}

//顯示卡片
controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event =>{
    controller.dispatchCardAction(card)
    })
})