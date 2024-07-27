import MainStore from '../../services/mainStore';

class Focus {
  constructor() {
    this.mainContainer = document.querySelector('#main-page .page-container');
    this.focus = document.getElementById('focus');

    this._render();
  }

  async _render() {
    this.focus.innerHTML = `
    <form class="focus-form">
      <textarea id="focus-area" class="focus-area" name="focus" spellcheck="false"></textarea>    
      <button type="submit" style="display:none;"></button>
    </form>
    <h4 class="main-focus"></h4>
    <div class="line"></div>
    `;

    this._setVariables();
    this._addEventListeners();

    this.mainFocus.innerText = await MainStore.getFocusText();
  }
  _setVariables() {
    this.focusForm = document.querySelector('.focus-form');
    this.focusTextarea = document.getElementById('focus-area');
    this.mainFocus = document.querySelector('.main-focus');
  }

  async _updateFocusText() {
    this.mainContainer.querySelector('.main-wrapper').style.display = 'none';
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
    await MainStore.setFocusText(this.focusTextarea.value);

    this.focusTextarea.style.display = 'none';
    this.mainFocus.style.display = 'block';

    this.mainFocus.innerText = await MainStore.setFocusText();
    this.mainFocus.nextElementSibling.style.display = 'none';

    this.mainContainer.querySelector('.main-wrapper').style.display = 'block';
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
}

export default Focus;
