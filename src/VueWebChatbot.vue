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
  <div class="chatbot-buttons">
    <div class="chatbot-button" v-for="(button, i) in buttons" @click="postback(button)" :key="`BTN-${i}`">
      <div class="">{{ button.title }}</div>
    </div>
  </div>
  <div class="chatbot-textinput" v-show="!buttons.length">
    <textarea class="chatbot-textarea" :placeholder="(config.msgPlaceholder) ? config.msgPlaceholder : 'Your message'" v-model="messageInput"></textarea>
    <div class="chatbot-sendbutton">
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

    scrollToBottom(){
      setTimeout(function () {
        document.querySelector('.chatbot-messages').scrollTo(0, document.querySelector('.chatbot-messages').scrollHeight)
      }, 20);
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
      this.messages.push(new Message(text, 'user'))
      this.buttons = []
      if (origin === 'input') {
        if(!this.isAwaiting) this.$emit('text', this.messageInput)
        else {
          this.awaitingResolver(text)
          this.isAwaiting = false
        }
        this.messageInput = ""
      }
      this.scrollToBottom()
    },

    ask(question, options){
      this.isAwaiting = true
      options = options || []
      this.sendMessage(question, options)
      let that = this

      return new Promise(function(resolve, reject) {
          that.awaitingResolver = resolve
      })
    },

    postback(button) {
      this.sendMessageAsUser(button.title, 'postback')
      this.scrollToBottom()
      if(!this.isAwaiting) this.$emit('postback', button.payload, button.data)
      else {
        this.awaitingResolver(button.payload)
        this.isAwaiting = false
      }
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
.chatbot-window{
  height: 600px;
  font-family: Helvetica;
  /* background: pink; */
}

.chatbot-messages{
  height: 85%;
  width: 90%;
  padding-top: 10px;
  margin: 0 auto;
  overflow-y: scroll;
}

.chatbot-message-row{
  display: flex;
}

.chatbot-message-row-user{
  justify-content: flex-end;
}

.chatbot-message-row-bot{
justify-content: flex-start;
}

.chatbot-message{
    max-width: 51%;
    margin: 2px 0;
    padding: 10px;
    text-align: left;
    border-radius: 1.3em;
}

.chatbot-message-user{
  background-color: blue;
  color: white;
}

.chatbot-message-bot{
  background-color: #f2f2f2;
}

.chatbot-buttons{
  height: 10%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chatbot-button{
  padding: 6px 15px;
  text-align: center;
  border: 1px solid blue;
  color: blue;
  border-radius: 1.3em;
  cursor: pointer;
  margin: 0 4px;
}

.chatbot-textinput{
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  height: 5%;
  width: 90%;
  margin: 0 auto;
  padding: 0 20px;
}

.chatbot-textarea{
  width: 85%;
  height: calc(100% - 2px);
  padding: 0;
  resize: none;
  border: none;
  border-bottom: 1px solid grey;
  font-family: Helvetica;
  font-size: 1em;
}

.chatbot-sendbutton{
  width: 15%;
  height: 100%;
  color: orange;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.chatbot-sendbutton>div{
    cursor: pointer;
}

.chatbot-writing{
  padding: 13px 10px;
}

.chatbot-writing-wrapper{
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 45px;
}

.chatbot-writing-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: grey;
  animation-name: bounce;
  animation-duration: 2s;
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
    transform: translate(0, -10px);
    animation-timing-function: ease-in-out;
  }
  18% {
    transform: translate(0, -10px);
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
