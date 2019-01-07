<template>
<div class="chatbot-window">
  <div class="chatbot-messages">
    <div class="chatbot-message-row" :class="`chatbot-message-row-${message.sender}`" v-for="message in messages" :key="message.time">
      <div class="chatbot-message" :class="`chatbot-message-${message.sender}`">{{ message.text }}</div>
    </div>
    <div class="chatbot-message-row chatbot-message-row-bot">
      <div class="chatbot-writing chatbot-message chatbot-message-bot" v-show="writing">
        <div class="chatbot-writing-wrapper">
          <div class="chatbot-writing-dot"></div>
          <div class="chatbot-writing-dot"></div>
          <div class="chatbot-writing-dot"></div>
        </div>
      </div>
    </div>
  </div>
  <div class="chatbot-buttons" @wheel="buttonsScroll($event)">
    <div class="chatbot-button" v-for="(button, i) in buttons" @click="postback(button)" :key="`BTN-${i}`">
      <div class="">{{ button.title }}</div>
    </div>
  </div>
  <div class="chatbot-textinput" :class="(buttons.length || writing) ? 'chatbot-textinput-disabled' : ''">
    <textarea class="chatbot-textarea" :placeholder="(config.msgPlaceholder) ? config.msgPlaceholder : 'Your message'" v-model="messageInput" @keyup="textareaKey($event)"></textarea>
    <div class="chatbot-sendbutton" :class="(!messageInput.length) ? 'chatbot-sendbutton-disabled': ''">
      <div @click="sendMessageAsUser(messageInput, 'input')">
        {{ config.sendButton || 'Send' }}
      </div>
    </div>
  </div>
</div>
</template>

<script>
import Button from './models/Button'
import Message from './models/Message'

export default {
  data() {
    return {
      config: this.$attrs.config || {},
      messageInput: "",
      buttons: [],
      messages: [],
      writing: false,
      isAwaiting: false,
      awaitingResolver: null,
      Button,
      Message
    }
  },
  methods: {
    calculateTypingTime(text) {
      const cps = this.config.typingSpeed || 50
      let time = Math.round((text.length / cps) * 1000)
      if (time < 5000) return time
      else return 5000
    },

    sendMessageAsBot(text, buttons) {
      let that = this
      this.writing = true
      this.scrollToBottom()
      return new Promise(function(resolve) {
        setTimeout(function() {
          const m = new Message(text, 'bot', buttons)
          that.buttons = buttons || []
          that.$emit('echo', m)
          that.messages.push(m)
          that.writing = false
          that.scrollToBottom()
          resolve()
        }, that.calculateTypingTime(text));
      });
    },

    sendMessage(text, buttons) {
      return this.sendMessageAsBot(text, buttons)
    },

    sendMessageAsUser(text, origin) {
      if (!this.messageInput.trim().length && origin === 'input') return
      this.messages.push(new Message(text, 'user'))
      this.buttons = []
      if (origin === 'input') {
        if (!this.isAwaiting) this.$emit('text', this.messageInput)
        else {
          this.awaitingResolver(text)
          this.isAwaiting = false
        }
        this.messageInput = ""
      }
      this.scrollToBottom()
    },

    ask(question, options) {
      this.isAwaiting = true
      options = options || []
      this.sendMessage(question, options)
      let that = this

      return new Promise(function(resolve) {
        that.awaitingResolver = resolve
      })
    },

    postback(button) {
      this.sendMessageAsUser(button.title, 'postback')
      this.scrollToBottom()
      if (!this.isAwaiting) this.$emit('postback', button.payload, button.data)
      else {
        this.awaitingResolver(button.payload)
        this.isAwaiting = false
      }
    },

    scrollToBottom() {
      setTimeout(function() {
        document.querySelector('.chatbot-messages').scrollTo(0, document.querySelector('.chatbot-messages').scrollHeight)
      }, 20);
    },

    buttonsScroll(e) {
      const buttons = document.querySelector('.chatbot-buttons')
      buttons.scrollTo(buttons.scrollLeft + e.deltaY, 0)
    },

    textareaKey(e) {
      if (e.key !== 'Enter') return
      e.preventDefault()
      this.sendMessageAsUser(this.messageInput, 'input')
    }
  },
  created() {
    this.config.showGetStarted = (this.config.showGetStarted !== undefined) ? this.config.showGetStarted : true
  },

  mounted() {
    if (this.config.showGetStarted) this.buttons.push(new Button((this.config.getStarted || 'Get Started'), 'GET_STARTED'))
  }
}
</script>

<style lang="css" scoped>
.chatbot-window {
  font-family: Helvetica;
  height: 100%;
  width: 100%;
}

.chatbot-messages {
  height: 85%;
  width: 90%;
  padding: 10px 5% 0 5%;
  overflow-y: scroll;
}

.chatbot-messages::-webkit-scrollbar {
    width: 2px;
}

.chatbot-messages::-webkit-scrollbar-thumb {
    background-color: #F2F2F2;
    border-radius: 2px;
}

.chatbot-message-row {
  display: flex;
}

.chatbot-message-row-user {
  justify-content: flex-end;
}

.chatbot-message-row-bot {
  justify-content: flex-start;
}

.chatbot-message {
    max-width: 51%;
    margin: 2px 0;
    padding: 10px 15px;
    text-align: left;
    border-radius: 1.3em;
}

.chatbot-message-user {
  background-color: #0084FF;
  color: white;
}

.chatbot-message-bot {
  background-color: #f2f2f2;
}

.chatbot-buttons {
  padding: 1% 5%;
  height: 38px;
  overflow-x: scroll;
  white-space: nowrap;
}

.chatbot-buttons::-webkit-scrollbar {
    height: 4px;
}

.chatbot-buttons::-webkit-scrollbar-thumb {
    background-color: #F2F2F2;
    border-radius: 2px;
}

.chatbot-button {
  padding: 6px 15px;
  text-align: center;
  border: 1px solid #0084FF;
  color: #0084FF;
  border-radius: 1.3em;
  cursor: pointer;
  margin: 0 4px;
  white-space: nowrap;
  display: inline-block;
}

.chatbot-sendbutton-disabled>div {
  color: #F2F2F2;
  pointer-events: none;
}


.chatbot-textinput {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 5%;
  width: 90%;
  padding: 0 5%;
  margin-top: 15px;
  min-height: 25px;
}

.chatbot-textinput-disabled>textarea {
  pointer-events: none;
  color: #F2F2F2;
  border-color: #F2F2F2;
}

.chatbot-textinput-disabled>textarea::placeholder {
  color: #F2F2F2;
}

.chatbot-textinput-disabled>div {
  color: #F2F2F2;
  pointer-events: none;
}

.chatbot-textarea {
  width: 85%;
  height: calc(100% - 2px);
  padding: 0;
  resize: none;
  border: none;
  border-bottom: 1px solid grey;
  font-family: Helvetica;
  font-size: 1em;
}

.chatbot-sendbutton {
  width: 15%;
  color: #0084FF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.chatbot-sendbutton>div {
    cursor: pointer;
}

.chatbot-writing {
  padding: 13px 10px;
}

.chatbot-writing-wrapper {
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 42px;
}

.chatbot-writing-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: grey;
  animation-name: bounce;
  animation-duration: 1s;
  animation-iteration-count: infinite;
}

.chatbot-writing-dot:nth-child(2) {
    animation-delay: 0.12s;
  }

.chatbot-writing-dot:nth-child(3) {
    animation-delay: 0.24s;
  }

@keyframes bounce {
  0% {transform: translate(0, 0)}
  15% {
    transform: translate(0, -6px);
    animation-timing-function: ease-in-out;
  }
  18% {
    transform: translate(0, -6px);
  }
  35% {
    transform: translate(0, 0);
    animation-timing-function: ease-in-out;
  }
  100% {
    transform: translate(0, 0)
  }
}
</style>
