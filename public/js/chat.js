const socket = io()

// socket.on('countUpdated', (count)=>{
//   console.log('The count has been updated',count);
// })

// document.querySelector('#increment').addEventListener('click', ()=> {
//   console.log('Clicked');
//   socket.emit('increment')
//   console.log(socket.id);
// })

//Elements
const $messageForm = document.querySelector('#messsage-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocation = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates 
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
let {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});

let newMessageHeight = 0
const autoscroll = () => {
  // New message element
  const $newMessage = $messages.lastElementChild

  // Height of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
 
  newMessageHeight += ($newMessage.offsetHeight + newMessageMargin)

  // Visible height
  const visibleHeight = $messages.offsetHeight

  // Height of messages container
  const containerHeight = $messages.scrollHeight

  // How far have I scrolled?
  const scrollOffset = $messages.scrollTop + visibleHeight
  if (containerHeight - newMessageHeight <= scrollOffset) {
      $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('message', (message)=>{
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll()
})

socket.on('locationMessage', (message)=>{
  const html = Mustache.render(locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html);
  autoscroll()
})

socket.on('roomData', ({room, users}) => {
  const html = Mustache.render(sidebarTemplate,{
    room,
    users
  })
  document.querySelector('#sidebar').innerHTML = html
})

$messageForm.addEventListener('submit',(e)=>{
  e.preventDefault()
  $messageFormButton.setAttribute('disabled','disabled')
  //disabled

  //  let message = document.querySelector('input').value
  let message = e.target.elements.message.value
  
  socket.emit('sendMessage',message, (error)=>{
    
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()
    //enable

    if(error){
      return console.log(error);
    }

    console.log('Message delivered');
  }) 
})

$sendLocation.addEventListener('click', ()=>{
 
  if(!navigator.geolocation){
    return alert('Geolocation is not supurted by your browser.')
  }

  $sendLocation.setAttribute('disabled','disabled')

  navigator.geolocation.getCurrentPosition((position)=>{
    socket.emit('sendLocation', 
    {
      lat: position.coords.latitude, 
      long: position.coords.longitude
    },() => {        
      console.log('Location Shared!');
      $sendLocation.removeAttribute('disabled')

    }) 
  })
})

socket.emit('join', { username, room }, (error) => {
  if (error) {
      alert(error)
      location.href = '/'
  }
})