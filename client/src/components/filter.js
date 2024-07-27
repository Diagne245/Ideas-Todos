import { mainContainer, getSlideAtIndex} from '..';

class Filter {
  constructor(index = null) {
    index === null
      ? (this.filterEl = mainContainer.querySelector('#filter'))
      : (this.filterEl = getSlideAtIndex(index).querySelector('.slide-filter'));

    this.index = index;
    this.render();
  }

  render() {
    this.filterEl.innerHTML = `
      <input
      type="text"
      class="filter-input"
      name="filter"
      spellcheck="false"
      autocomplete="off"
      placeholder="Filter"
      onfocus="this.placeholder = ''"
      onblur="this.placeholder = 'Filter'"
      />
      <div class="line"></div>
    `;
    this.filterInput = this.filterEl.querySelector('.filter-input');

    
  }
  // Methods --------
  show() {
    this.filterEl.style.display = 'block';
  }
  hide() {
    this.filterEl.style.display = 'none';
  }
}

export default Filter;
