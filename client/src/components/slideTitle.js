import GroupStore from '../../services/groupStore';
import { getSlideAtIndex } from '..';

class SlideTitle {
  constructor(index) {
    this.titleDiv = getSlideAtIndex(index).querySelector('.title-wrapper');
    this.index = index;

    this.render();
  }

  async render() {
    this.titleDiv.innerHTML = `
      <form class="title-form" >
        <input
          type="text"
          spellcheck="false"
          autocomplete="off"
          class="title-input filter"
          name='slide-title'
        />
      </form>
      <h4 class="slide-title"></h4>
    `;

    this._setVariables();
    const landingText = await GroupStore.getSlideLandingText(this.index);
    this._displayTitle(landingText);

    this._addEventListeners();
  }
  // ----------------------------------
  _setVariables() {
    this.titleForm = this.titleDiv.querySelector('.title-form');
    this.titleInput = this.titleDiv.querySelector('.title-input');
    this.slideTitle = this.titleDiv.querySelector('.slide-title');
  }

  _displayTitle(landingText) {
    this.slideTitle.innerText = landingText;
    this._landingTextFontSize(this.slideTitle, landingText);
  }

  _addEventListeners() {
    this.slideTitle.addEventListener(
      'click',
      this._updateLandingText.bind(this, this.index)
    );
  }

  // -------------------------------
  async _updateLandingText(index) {
    this.slideTitle.style.display = 'none';
    this.titleInput.style.display = 'block';
    this.titleInput.addEventListener(
      'input',
      this._landingTextFontSize.bind(
        this,
        this.titleInput,
        this.titleInput.value
      )
    );

    this.titleInput.value = await GroupStore.getSlideLandingText(index);
    this.titleInput.focus();
  }

  // ------------------
  _landingTextFontSize(element, text) {
    const lgth = text.length;
    if (lgth < 25) {
      this._setFont(element, '1.1rem', 600);
    } else if (lgth < 40) {
      this._setFont(element, '1rem', 500);
    } else {
      this._setFont(element, '.9rem', 400);
    }
  }
  _setFont(element, size, weight) {
    element.style.fontSize = size;
    element.style.fontWeight = weight;
  }
}
// -------------------------

export default SlideTitle;
