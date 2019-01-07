class Message {
  constructor(text, sender, buttons) {
    if(text) this.text = text
    if(buttons) this.buttons = buttons
    if(sender) this.sender = sender
    this.time = +new Date()
  }
}

export default Message
