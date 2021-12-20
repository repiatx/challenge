const enums = {
  page_states: {
    LOGIN: 'LOGIN',
    REGISTER: 'REGISTER',
    LOGGED_IN: 'LOGGED_IN',
    USER_LIST: 'USER_LIST',
    USER_DETAIL: 'USER_DETAIL'
  },
  event_types: {
    LOGIN_RESPONSE: 'LOGIN_RESPONSE',
    CONNECTED_RESPONSE: 'CONNECTED_RESPONSE',
    LOGGED_IN: 'LOGGED_IN',
    USERS_CHANGED: 'USERS_CHANGED'
  },
  incoming_event_types: {
    USER_REGISTERED: 'USER_REGISTERED'
  }
}

let pageState = enums.page_states.LOGIN
let userId = undefined
let token = localStorage.getItem('token') ?? undefined

const socket = io('http://localhost:3001')

socket.on('connect', () => {

  console.log('connected to socket')

})

socket.on('event', event => {
  switch (event.type) {
    case enums.event_types.LOGIN_RESPONSE:

      if (event.error) {
        $('#loginError').val(event.error.message).removeClass('d-none')
        return
      }
      setPageState(enums.page_states.LOGGED_IN)
      token = event.data.token
      localStorage.setItem('token', token)
      break

    case enums.event_types.LOGGED_IN:
      if (pageState === enums.page_states.LOGGED_IN) {
        $('#onlineUser').append('<li class="list-group-item">User Logged In</li>')
      }
      break

    case enums.event_types.USERS_CHANGED:
      if (pageState === enums.page_states.USER_LIST) {
        listUsers()
            .then(onlineUsers => updateOnlineUserGui(onlineUsers))
      }
      break

    case enums.incoming_event_types.USER_REGISTERED:
      if (pageState === enums.page_states.LOGGED_IN) {
        $('#onlineUser').append(`<li class="list-group-item">${event.data.full_name} registered</li>`)
      }
      break

    case enums.event_types.default:
      throw 'No Page'

  }

})


//Action Button Clicks
$('#loginButton').on('click', (e) => {

  e.preventDefault()

  $('#loginError').addClass('d-none')

  const email = $('#loginEmail').val()
  const password = $('#loginPassword').val()

  login(email, password)


})
$('#registerButton').on('click', (e) => {
  e.preventDefault()
  const resultElement = $('#registerError')

  resultElement.addClass('d-none')

  const fullName = $('#registerFullname').val()
  const email = $('#registerEmail').val()
  const password = $('#registerPassword').val()
  const passwordRepeat = $('#registerPasswordRepeat').val()
  const language = $('#registerLanguage').find(':selected').val()
  const country = $('#registerCountry').find(':selected').val()

  register(fullName, email, password, passwordRepeat, language, country)
      .then(message => {
        resultElement.text(message).removeClass('d-none')
      })


})


// Navs Clicks
$('#loginPageClick').on('click', (e) => {
  e.preventDefault()
  setPageState(enums.page_states.LOGIN)
})
$('#userListPageClick').on('click', (e) => {
  e.preventDefault()
  setPageState(enums.page_states.USER_LIST)


  listUsers()
      .then(onlineUsers => updateOnlineUserGui(onlineUsers))

})

$('#registerPageClick').on('click', (e) => {
  e.preventDefault()
  setPageState(enums.page_states.REGISTER)
})

// Back buttons
$('#registerPageBackClick').on('click', (e) => {
  e.preventDefault()
  setPageState(enums.page_states.LOGIN)
})
$('#userListPageBack').on('click', (e) => {
  e.preventDefault()
  setPageState(enums.page_states.LOGGED_IN)
})
$('#userDetailPageBack').on('click', (e) => {
  e.preventDefault()
  setPageState(enums.page_states.USER_LIST)
})


// Functions
function register(fullname, email, password, passwordRepeat, language, country) {


  return axios.request({
    url: `http://localhost:3000/v1/users`,
    method: 'POST',
    data: {
      full_name: fullname,
      email: email,
      password: password,
      password_repeat: passwordRepeat,
      language: language,
      country: country
    },
    headers: {
      authorization: `Bearer ${token}`
    }
  }).then(response => {
    setPageState(enums.page_states.LOGIN)
  }).catch(err => {
    return err.response?.data?.message ?? 'Unknown error'
  })
}

function getUserDetail(userId) {
  setPageState(enums.page_states.USER_DETAIL)
  return axios.request({
    url: `http://localhost:3000/v1/users/${userId}`,
    method: 'GET',
    headers: {
      authorization: `Bearer ${token}`
    }
  }).then(response => {
    const user = response.data.user
    $('#userDetailTable tbody').empty()
    $('#userDetailTable tbody').append(
        `
        <tr>
            <td>${user._id}</td>
            <td>${user.first_name}</td>
            <td>${user.last_name}</td>
            <td>${user.email}</td>
            <td>${user.status}</td>
        </tr>
                  
        `
    )

  }).catch(err => console.error(err))

}

function updateOnlineUserGui(onlineUsers) {
  $('#onlineUserTable tbody').empty()
  onlineUsers.forEach(onlineUser => {
    $('#onlineUserTable tbody').append(
        `
        <tr>
            <td>${onlineUser._id}</td>
            <td>${onlineUser.first_name}</td>
            <td>${onlineUser.last_name}</td>
            <td>${onlineUser.email}</td>
            <td><a href="#" id="detailButton-${onlineUser._id}">Details</a></td>
        </tr>
                  
        `
    )
    $(`#detailButton-${onlineUser._id}`).on('click', (e) => {
      e.preventDefault()
      getUserDetail(userId = onlineUser._id)
    })


  })

}

function listUsers() {
  return axios.request({
    url: 'http://localhost:3000/v1/users',
    headers: {
      authorization: `Bearer ${token}`
    },
    method: 'GET'
  }).then(response => {
    return response.data.online_users
  }).catch(err => console.error(err))
}

function setPageState(_pageState) {

  $('.page').each((index, element) => {

    $(element).addClass('d-none')

  })

  pageState = _pageState
  $(`.${pageState}`).removeClass('d-none')

}

function login(email, password) {

  socket.emit('event', {
    type: 'LOGIN',
    data: {
      email: email,
      password: password
    }
  })


}
