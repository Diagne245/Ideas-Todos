import { mainContainer } from '..';
import MainStore from '../../services/mainStore';

// ------------
class Focus {
  constructor() {
    this.focus = document.createElement('aside');
    this.focus.id = 'focus';
    this.render();
  }

  async render() {
    this.focus.innerHTML = `
    <form class="focus-form">
      <textarea 
        id="focus-textarea"
        class="focus-textarea"
        name="focus"
        spellcheck="false">
      </textarea>    
      <button type="submit" style="display:none;"></button>
    </form>
    <h4 class="main-focus"></h4>
    <div class="line"></div>
    `;
    this._setVariables();
    this._addEventListeners();

    this.mainFocus.innerText = await MainStore.getFocusText();
    mainContainer.appendChild(this.focus);
  }

  _setVariables() {
    this.focusForm = this.focus.querySelector('.focus-form');
    this.focusTextarea = this.focus.querySelector('.focus-textarea');
    this.mainFocus = this.focus.querySelector('.main-focus');
  }

  async _updateFocusText() {
    mainContainer.querySelector('#main-section').style.display = 'none';
    this.mainFocus.style.display = 'none';
    this.focusTextarea.style.display = 'block';

    this.focusTextarea.value = await MainStore.getFocusText();
    this.focusTextarea.focus();
    this.focusTextarea.style.height = `${this.focusTextarea.scrollHeight}px`;

    // displaying the line
    this.mainFocus.nextElementSibling.style.display = 'block';
  }

  async _setMainFocus(e) {
    e.preventDefault();
    const focusText = await MainStore.setFocusText(this.focusTextarea.value);

    this.focusTextarea.style.display = 'none';
    this.mainFocus.style.display = 'block';

    this.mainFocus.innerText = focusText;
    this.mainFocus.nextElementSibling.style.display = 'none';

    mainContainer.querySelector('#main-section').style.display = 'block';
  }

  _addEventListeners() {
    this.mainFocus.addEventListener('click', this._updateFocusText.bind(this));

    this.focusTextarea.addEventListener('input', () => {
      this.focusTextarea.style.height = `${this.focusTextarea.scrollHeight}px`;
    });

    this.focusTextarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        this.focusForm.querySelector('[type=submit]').click();
      }
    });

    this.focusForm.addEventListener('submit', this._setMainFocus.bind(this));
  }

  // Focus Display
  show() {
    this.focus.style.display = 'block';
  }

  hide() {
    this.focus.style.display = 'none';
  }
}

export default Focus;
