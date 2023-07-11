const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js')
const qrcode = require('qrcode-terminal')
const axios = require('axios')
require('dotenv').config()

const client = new Client({
    authStrategy: new LocalAuth()
})

client.on('qr', qr => {
    qrcode.generate(qr, {small: true})
});

client.on('authenticated', (session) => console.log(`Autenticado`))

client.on('ready', () => console.log('Client is ready!'))

client.on('message_create', message => commands(message))

client.initialize();


const headers = {
    'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
    'Content-Type': 'application/json'
}

const axiosInstance = axios.create({
    baseURL: 'https://api.openai.com/',
    timeout: 120000,
    headers: headers
});

const getDavinciResponse = async (clientText) => {
    const body = {
        "model": "text-davinci-003",
        "prompt": "responde como si fueras un scrum master estricto la siguiente frase: "+ clientText,
        "max_tokens": 2048,
        "temperature": 1
    }

    try {
        const { data } = await axiosInstance.post('v1/completions', body)
        const botAnswer = data.choices[0].text
        return `ChatGPT 🤖 ${botAnswer}`
    } catch (e) {
        return `❌ OpenAI Response Error${e.message}`
    }
}

const get4Response = async (clientText) => {
    const body = {
        "model": "text-davinci-003",
        "prompt": "responde como si fueras un hacker experto que tiene la disposicion de enseñar y es administrador de un grupo hackers la siguiente frase: "+ clientText,
        "max_tokens": 2048,
        "temperature": 1
    }

    try {
        const { data } = await axiosInstance.post('v1/completions', body)
        const botAnswer = data.choices[0].text
        return `${botAnswer}`
    } catch (e) {
        return `❌ OpenAI Response Error${e.message}`
    }
}

const getTPOResponse = async (clientText) => {
    const body = {
        "model": "text-davinci-003",
        "prompt": "responde como si fueras un tecnico especializado que tiene que transmitir conocimientos a personas no tecnicas la siguiente frase: "+ clientText,
        "max_tokens": 2048,
        "temperature": 1
    }

    try {
        const { data } = await axiosInstance.post('v1/completions', body)
        const botAnswer = data.choices[0].text
        return `${botAnswer}`
    } catch (e) {
        return `❌ OpenAI Response Error${e.message}`
    }
}

const getARQResponse = async (clientText) => {
    const body = {
        "model": "text-davinci-003",
        "prompt": "esponde como si fueras un arquitecto de soluciones que tiene que transmitir conocimientos a  otro arquitecto la siguiente frase: "+ clientText,
        "max_tokens": 2048,
        "temperature": 1
    }

    try {
        const { data } = await axiosInstance.post('v1/completions', body)
        const botAnswer = data.choices[0].text
        return `${botAnswer}`
    } catch (e) {
        return `❌ OpenAI Response Error${e.message}`
    }
}


const getDalleResponse = async (clientText) => {
    const body = {
        prompt: "retrato fotográfico de estudio: "+clientText, // Descrição da imagem
        n: 1, // Número de imagens a serem geradas
        size: "256x256", // Tamanho da imagem
    }

    try {
        const { data } = await axiosInstance.post('v1/images/generations', body)
        return data.data[0].url
    } catch (e) {
        return `❌ OpenAI Response Error`
    }
}

const getEditResponse = async (clientText) => {
    const body = {
        prompt: clientText, // Descrição da imagem
        n: 1, // Número de imagens a serem geradas
        size: "256x256", // Tamanho da imagem
        image: "https://drive.google.com/file/d/1vtlzrHo1nrsFnZGJDa9I7oUWeYx5IfJt",
    }

    try {
        const { data } = await axiosInstance.post('v1/images/variations', body)
        return data.data[0].url
    } catch (e) {
        return `❌ OpenAI Response Error`
    }
}

const commands = async (message) => {
    const iaCommands = {
        davinci3: "/bot",
        dalle: "/img",
        gpt4: "/apt",
        arq: "/arq",
        tpo: "/tpo",
        edita: "/edit",
    }
  

    let firstWord = message.body.substring(0, message.body.indexOf(" "))
    
    const sender = message.from.includes(process.env.PHONE_NUMBER) ? message.to : message.from

    console.log('que ondaQ!!'+sender)

    switch (firstWord) {
        case iaCommands.davinci3:
            console.log('davinci3')
            const question = message.body.substring(message.body.indexOf(" "));
            getDavinciResponse(question).then(async (response) => {
                const contact = await message.getContact()
                await client.sendMessage(sender, `${response}\n\n`)
            })
            break

        case iaCommands.arq:
            console.log('arq')
            const questionarq = message.body.substring(message.body.indexOf(" "));
            getARQResponse(questionarq).then(async (response) => {
                const contact = await message.getContact()
                await client.sendMessage(sender, `${response}\n\n`)
            })
            break
            
        case iaCommands.tpo:
            console.log('tpo')
            const questiontpo = message.body.substring(message.body.indexOf(" "));
            getTPOResponse(questiontpo).then(async (response) => {
                const contact = await message.getContact()
                await client.sendMessage(sender, `${response}\n\n`)
            })
            break        

        case iaCommands.gpt4:
            console.log('gpt4')
            const question4 = message.body.substring(message.body.indexOf(" "));
            get4Response(question4).then(async (response4) => {
                await client.sendMessage(sender, `${response4}\n\n`)
            })
            break

        case iaCommands.dalle:
            console.log('control2')
            const imgDescription = message.body.substring(message.body.indexOf(" "));
            const contact = await message.getContact();
            getDalleResponse(imgDescription, message).then(async (imgUrl)  => {
                const media = await MessageMedia.fromUrl(imgUrl)
                const options = {
                    mentions: [contact], 
                    caption: `_Generated by @${contact.id.user}_`, 
                    media: media,
                }
                await client.sendMessage(sender, media, options)
            })
            break

        case iaCommands.edita:
            console.log('control3')
            const imgDescription2 = message.body.substring(message.body.indexOf(" "));
            const contact2 = await message.getContact();
            getEditResponse(imgDescription2, message).then(async (imgUrl)  => {
                const media = await MessageMedia.fromUrl(imgUrl)
                // Caso queira mandar como Sticker, acrescente em options -> sendMediaAsSticker: true
                const options = {
                    mentions: [contact2], 
                    caption: `_Generated by @${contact.id.user}_`, 
                    media: media,
                }
                await client.sendMessage(sender, media, options)
            })
            break

        
    }
}



