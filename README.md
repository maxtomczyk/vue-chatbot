# Vue Chatbot 🤖

This component helps to build interactive chatbot inside your Vue app. Built according to instructions on <https://vuejs.org/v2/cookbook/packaging-sfc-for-npm.html>

## Table of content

-   [What is included?](#what-is-included-)
-   [Installation](#installation)
-   [Including in project](#including-in-project)
    -   [main.js](#mainjs)
-   [Usage](#usage)
    -   [Any .vue file](#any-vue-file)
    -   [Configuration](#configuration)
        -   [Get Started button](#get-started-button)
    -   [Events](#events)
    -   [Classes](#classes)
        -   [`Button(title, payload, data)`](#-button-title--payload--data--)
    -   [Methods](#methods)
        -   [`sendMessage(text, buttons)`](#-sendmessage-text--buttons--)
            -   [Example](#example)
        -   [`sendMessageAsUser(text)`](#-sendmessageasuser-text--)
        -   [`ask(text, buttons)`](#-ask-text--buttons--)
            -   [Example with buttons](#example-with-buttons)
            -   [Example without buttons](#example-without-buttons)
-   [Styling](#styling)
-   [Author](#author)
-   [License](#license)

## What is included?

Component contains logic of chatbot functionalities and default styling, so you have to write interactions logic only ⚡

## Installation

In ypur project root run `npm i vue-chatbot --save`

## Including in project

#### main.js

```javascript
import Vue from 'vue'
import VueChatbot from 'vue-chatbot/sfc'

Vue.component('chatbot', VueChatbot)
```

## Usage

Use it in your vue files like any component but don't forget to wrap it in some container.

#### Any .vue file

```vue
<div class="chat">
  <chatbot ref="bot" :config="chatbotConfig" @postback="handleButton" @text="handleText"></chatbot>
</div>
```

### Configuration

Configure component by passing config object as shown above. All configuration optioons are listed below.

| Name           | Description                                                    | Default value  | Type    |
| -------------- | -------------------------------------------------------------- | -------------- | ------- |
| sendButton     | Message send button content                                    | 'Send'         | string  |
| msgPlaceholder | Placeholder of message input field                             | 'Your message' | string  |
| showGetStarted | Determines if should show start when component loaded          | true           | boolean |
| getStarted     | Text inside get started button                                 | 'Get started'  | string  |
| typingSpeed    | Speed of typing (used to calculate length of typing animation) | 50             | integer |

#### Get Started button

If get started button exists, it's payload is always 'GET_STARTED'.

### Events

Data flow structure is based on events emitted from component

| Event    | When               | Arguments     |
| -------- | ------------------ | ------------- |
| text     | User texts to bot  | text          |
| postback | User clicks button | payload, data |
| echo     | Bot texts to user  | message       |

### Classes

#### `Button(title, payload, data)`

Use this class to create button for bot message in fast way.

```javascript
const button = new this.$refs.bot.Button('Ok', 'OK_PRESSED', {prop: 'value'})
```

### Methods

#### `sendMessage(text, buttons)`

Sends message as bot, if `buttons` provided locks text input and shows buttons.

##### Example

This example access to bot object via reference, but you can also assign `this.$refs.bot` to some property defined in data. Remember to do it in `mounted()` functios as this component reference isn't available inside `created()`.

```javascript
await this.$refs.bot.sendMessage('Shall we start?', [new this.bot.Button('Ok')])
```

#### `sendMessageAsUser(text)`

Sends message as user. You can use it to send message as user from your app without user interaction with chat window.

#### `ask(text, buttons)`

This method allows to ask user for something and catch his answer into variable using `await` keyword. Consider example below.

**IMPORTANT!** Using ask method locks events, so component will not emit any event for user answer for message sent with `ask()` method.

##### Example with buttons

```javascript
let shouldBe = await this.bot.ask('To Be or Not To Be?', [
  new this.bot.Button('To Be', true),
  new this.bot.Button('Not To Be', false)
])

console.log(shouldBe) // true or false
```

As you see above, ask functions returns second argument of Button constructor (normally, data argument is third, but in ask method you don't need postback parameter)

You can also ask for data which needs to be written, for example user's name

##### Example without buttons

```javascript
let userName = await this.bot.ask('What\'s your name?')

console.log(userName) // user reply for message
```

## Styling

All elements of chat window are named with classes, so you can freely override style.

## Author

Made with ❤️ by Maksymilian Tomczyk

## License

This code is licensed on MIT license.
