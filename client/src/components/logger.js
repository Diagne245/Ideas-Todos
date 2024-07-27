import User from '../../services/user';
import Storage from '../storage';
import { app } from '..';

// -------------------
class Logger {
  constructor() {
    this.logger = document.getElementById('user-login');
    this.logger.classList.add('login');
    this.render();
  }

  render() {
    this.logger.innerHTML = `
      <div class="user-icon">
      <i class="fa-regular fa-circle-user"></i>
      <h4>Log In</h4>
      </div>
      <form id="login-form" class="login-form">
        <input
          type="text"
          id="username"
          name="username"
          class="username form-control"
          spellcheck="false"
          autocomplete = "true"
          placeholder="username" >
        <input 
          type="password" 
          name="password" 
          id="password" 
          class="password 
          form-control" 
          spellcheck="false" 
          autocomplete="true"
          placeholder="password">
        <button type="submit" class="btn">Log In</button>
      </form>
    `;

    this.userIcon = this.logger.querySelector('.user-icon');
    this.loginForm = this.logger.querySelector('#login-form');
    this.hideLoginForm();
    this._addEventListeners();
  }

  _addEventListeners() {
    this.userIcon.addEventListener('click', this.showLoginForm.bind(this));
    this.loginForm.addEventListener('submit', this.handleLogin.bind(this));
  }

  showLoginForm() {
    this.userIcon.style.display = 'none';
    this.logger.classList.add('form-active');
    this.loginForm.style.display = 'block';
    // this.logger.style.height = `${this.logger.scrollHeight}px` 
    this.userNameInput = this.loginForm.querySelector('#username');
    // login form username prefill
    Storage.getUserName() && (this.userNameInput.value = Storage.getUserName());

    this.passwordInput = this.loginForm.querySelector('#password');
  }

  hideLoginForm() {
    this.loginForm.style.display = 'none';
    this.userIcon.style.display = 'block';
  }

  async handleLogin(e) {
    e.preventDefault();

    app.user = await User.initUser(
      this.userNameInput.value,
      this.passwordInput.value
    );
    if (app.user) {
      Storage.setUserName(app.user.userName);
      this.logger.style.display = 'none';
      app.main.form.logoutIcon.style.display = 'inline-block';
      app.main.loadUser();
      await User.setUserState('loggedIn')
    } else {
      alert('UserName and Password Does Not match!');
      return;
    }
  }
}

export default Logger;
