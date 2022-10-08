const TelegramAPI = require('node-telegram-bot-api')
const { gameOptions, againOptions } = require('./options')

const token = process.env.TOKEN

const bot = new TelegramAPI(token, { polling: true })

const score = 14

const chats = {
    'chatId': { 'randomNumber': 7, numberOfTries: 0 }
}

const getWinSticker = (numberOfTries) => {
    let sticker = 'https://tlgrm.ru/_/stickers/c22/4c9/c224c9aa-b175-3f4b-b46e-6142170015c6/53.webp'
    if (numberOfTries === 1) {
        sticker = 'https://tlgrm.ru/_/stickers/c22/4c9/c224c9aa-b175-3f4b-b46e-6142170015c6/40.webp'
    } else if (numberOfTries <= 3) {
        sticker = 'https://tlgrm.ru/_/stickers/c22/4c9/c224c9aa-b175-3f4b-b46e-6142170015c6/49.webp'
    }
    return sticker
}

const startGame = async (chatId) => {
    const randomNumber = Math.floor(Math.random() * 10)
    chats[chatId] = { randomNumber, numberOfTries: 0 }
    //console.log(`randomNumber is: ${randomNumber}`);
    await bot.sendMessage(chatId, `Guess the number form 0 to 10`, gameOptions)
}

const start = () => {

    bot.setMyCommands([
        { command: '/start', description: `Let's start!` },
        { command: '/info', description: `Current informatiom` },
        { command: '/score', description: `Current score` },
        { command: '/game', description: `Start game "Guess the number"` },
    ])

    bot.on('message', async (msg) => {
        const text = msg.text
        const chatId = msg.chat.id

        if (text === '/start') {
            await bot.sendSticker(chatId, `https://tlgrm.ru/_/stickers/c22/4c9/c224c9aa-b175-3f4b-b46e-6142170015c6/1.webp`)
            await bot.sendMessage(chatId, `Hello dear: ${msg.from.first_name}!`)
            return startGame(chatId)
        }
        if (text === '/info') {
            return bot.sendMessage(chatId, `This is test bot!`)
        }
        if (text === '/score') {
            return bot.sendMessage(chatId, `Your score: ${score}!`)
        }
        if (text === '/game') {
            return startGame(chatId)
        }
        return bot.sendMessage(chatId, `I don't know this command: ${text}`)
    })

    bot.on('callback_query', async (msg) => {
        const chatId = msg.message.chat.id
        if (msg.data === '/again') {
            await startGame(chatId)
            return
        }
        const data = +msg.data
        const goalNumber = chats[chatId].randomNumber
        chats[chatId].numberOfTries++
        if (data === goalNumber) {
            const sticker = getWinSticker(chats[chatId].numberOfTries)
            await bot.sendSticker(chatId, sticker)
            return bot.sendMessage(chatId, `You win!   number of tries: ${chats[chatId].numberOfTries}!`, againOptions)
        } else {
            return bot.sendMessage(chatId, `The 'hidden' number is ${(data < goalNumber) ? 'greater than >' : 'less than <'} ${data}`)
        }
    })
}

start()