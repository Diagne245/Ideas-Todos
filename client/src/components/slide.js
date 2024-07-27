import GroupStore from '../../services/groupStore';
import Storage from '../storage';
import { app, horizontalSwipe, swiperWrapper, groupContainer } from '..';

import { HomeIcon, AddSlideIcon, RemoveSlideIcon } from './icons';
import SlideTitle from './slideTitle';
import { SlideForm } from './form';
import Filter from './filter';
import { ItemList, ListItem } from './listItems';
import Button from './buttons';

class Slide {
  constructor(index) {
    this.slideEl = document.createElement('div');
    this.slideEl.dataset.index = index;
    this.slideEl.classList.add('slide');
    this.index = index;

    this.addActiveClassHandler = this.addActiveSlideClass.bind(this);

    this.editModeHandler = this.editItem.bind(this);
    this.render();
  }

  // -----------------
  _slideBaseHTML() {
    this.slideEl.innerHTML = `
      <div class="home-btn"></div>
      <div class="delete-btn"></div>
      <div class="title-wrapper"></div>
      <form class="slide-form">
        <div class="buttons"></div>
      </form>
      <div class="slide-filter filter"></div>
      <ul class="items"></ul>
      <div class="clear"></div> 
      <div class="add-slide"></div>
    `;
    groupContainer.appendChild(this.slideEl);
  }

  render() {
    this._slideBaseHTML();
    // -------------
    this.homeIcon = new HomeIcon(this.index);
    this.removeSlideIcon = new RemoveSlideIcon(this.index);
    this.slideTitle = new SlideTitle(this.index);
    this.slideForm = new SlideForm(this.index);
    this.slideFilter = new Filter(this.index);
    this.slideItemList = new ItemList(this.index);
    // -------------
    this.slideClearBtn = new Button(
      this.slideEl.querySelector('.clear'),
      'button',
      ' Clear All',
      'btn btn-clear',
      'fa-solid fa-trash-can'
    );
    // -----------
    this.addSlideIcon = new AddSlideIcon(this.index);
    // -------------
    groupContainer.appendChild(this.slideEl);

    this._addEventListeners();
  }

  _addEventListeners() {
    this.slideEl.addEventListener('click', this.addActiveClassHandler);
    this.homeIcon.homeBtn.addEventListener('click', this.backToMain.bind(this));
    this.removeSlideIcon.deleteBtn.addEventListener(
      'click',
      this.removeSlide.bind(this)
    );
    this.slideTitle.titleForm.addEventListener(
      'submit',
      this.setLandingText.bind(this)
    );
    this.slideForm.formEl.addEventListener('submit', this.addEntry.bind(this));
    this.slideFilter.filterInput.addEventListener(
      'input',
      this.slideItemList.filterItems.bind(this.slideItemList)
    );
    this.slideItemList.items.addEventListener('click', this.editModeHandler);
    this.slideItemList.items.addEventListener(
      'click',
      this.deleteItem.bind(this)
    );
    this.slideClearBtn.button.addEventListener(
      'click',
      this.clearAll.bind(this)
    );
    this.addSlideIcon.addSlideBtn.addEventListener(
      'click',
      this.addNewSlide.bind(this)
    );
  }

  // Methods --------------
  reset() {
    this.slideForm.reset();
    this.slideItemList.render();
    this.hideUIElements();
    this.hideFilter();
  }

  // ---------
  hideUIElements() {
    this.homeIcon.hide();
    this.removeSlideIcon.hide();
  }

  showUIElements() {
    this.homeIcon.show();
    this.removeSlideIcon.show();
  }

  showFilter() {
    this.slideFilter.show();
    this.slideClearBtn.show();
  }
  hideFilter() {
    this.slideFilter.hide();
    this.slideClearBtn.hide();
  }

  //  --------------
  backToMain() {
    Storage.clearCurrentGroup();
    Storage.clearCurrentGroupID();
    horizontalSwipe.slidePrev();
    swiperWrapper.style.height = '100vh';
    
    // When selection src is Main
    app.isSelectMode && app.srcGroup === null && app.main.selectModeUI();
  }

  // ---------------
  editItem(e) {
    if (e.target.parentElement.classList.contains('items')) {
      if (!app.isSelectMode) {
        const li = e.target;

        // item already in edit mode
        if (li.classList.contains('edit-mode')) {
          this.exitEditMode();
          return;
        }
        setTimeout(() => {}, 200);
        app.isEditMode = true;

        // Setting current slide as active
        this.addActiveSlideClass(e);
        this.editModeUI();

        // switching to another item while in edit mode
        app.isEditMode && this.slideItemList.toggleEditMode();

        // ------
        this.slideForm.formInput.value = li.innerText;
        this.slideForm.formInput.focus();
        li.classList.add('edit-mode');
      }
    }
  }

  editModeUI() {
    this.slideForm.editMode();
  }

  exitEditMode() {
    this.slideForm.reset();
    this.slideItemList.toggleEditMode();
    app.isEditMode = false;
  }

  // ----------------------
  selectModeUI() {
    for (const slide of app.slides.filter(
      (slide) => slide.index !== this.index
    )) {
      slide.slideForm.addSelectionMode();
    }

    // Src Slide State ---------
    this.slideForm.addItemBtn.hide();
    this.slideItemList.toggleEditMode();
    this.slideFilter.show();
    this.slideClearBtn.removeSelection();
  }

  // ----------------
  async addActiveSlideClass(e) {
    if (
      !e.target.closest('.home-btn') &&
      !e.target.closest('.delete-btn') &&
      !e.target.closest('.add-slide') &&
      app.isSelectMode === false
    ) {
      this.removeActiveSlideClass(e);
      this.slideEl.classList.add('active-slide');
      this.showUIElements();

      const slideItems = await GroupStore.getSlideItems(this.index);
      slideItems.length !== 0 ? this.showFilter() : this.hideFilter();
    }
  }

  removeActiveSlideClass(e) {
    let activeSlide = app.slides.find((slide) =>
      slide.slideEl.classList.contains('active-slide')
    );
    if (activeSlide && !e.target.closest('.active-slide')) {
      activeSlide.slideEl.classList.remove('active-slide');
      activeSlide.reset();
    }
  }

  // ------------------
  addSelectionMode() {
    this.slideForm.addSelectMode();
  }

  async setLandingText(e) {
    e.preventDefault();

    const titleInput = this.slideTitle.titleInput;
    const slideTitle = this.slideTitle.slideTitle;
    await GroupStore.setSlideLandingText(titleInput.value, this.index);

    titleInput.style.display = 'none';
    slideTitle.style.display = 'block';

    slideTitle.innerText = await GroupStore.getSlideLandingText(this.index);
  }

  // -----------------
  async addEntry(e) {
    e.preventDefault();

    if (app.isSelectMode) {
      this.addSelection(); // Prevent Duplicates @@@@
      return;
    }

    const formInput = this.slideForm.formInput;
    const valid = await this.slideForm.validEntry(formInput.value, this.index);
    if (valid) {
      app.isEditMode ? this.updateItem() : this.addItem(formInput.value);
    }
    this.slideForm.blur();
  }

  async addItem(newEntry) {
    const newItem = await GroupStore.addItemToSlide(newEntry, this.index);
    this.slideItemList.items.appendChild(
      new ListItem(newItem._id, newItem.text)
    );
    this.slideForm.blur();
  }

  async updateItem() {
    const formInput = this.slideForm.formInput;
    const liToUpdate = this.slideItemList.items.querySelector('.edit-mode');

    await GroupStore.updateItem(
      liToUpdate.dataset.id,
      formInput.value,
      this.index
    );
    this.slideForm.reset();
    this.slideItemList.render();
  }
  async addSelection() {
    await GroupStore.addSelection(this.index);
    this.slideItemList.exitSelectMode();
  }

  // ------------------
  async deleteItem(e) {
    e.stopImmediatePropagation();

    if (e.target.closest('.item-btn')) {
      const li = e.target.closest('.item-btn').parentElement;

      if (confirm('Are You Sure?')) {
        await GroupStore.removeSlideItems([li.dataset.id], this.index);
        this.slideForm.reset();
        this.slideItemList.render();

        const slideItems = await GroupStore.getSlideItems(this.index);
        slideItems.length === 0 && this.hideFilter();
      }
    }
  }

  // ---------------
  async clearAll() {
    if (app.isSelectMode) {
      this.slideItemList.deleteSelectedItems(this.index);
      this.slideItemList.exitSelectMode();
      return;
    }

    if (confirm('Are You Sure?')) {
      // Regular items clearing
      await GroupStore.clearSlideItems(this.index);
      this.reset();
    }
  }

  // -------------------
  async addNewSlide(e) {
    if (e.target.closest('.add-slide')) {
      const index = +e.target.closest('.slide').dataset.index;
      await GroupStore.addNewSlide(index + 1);
      app.displaySlides();
    }
  }

  // -----------------
  async removeSlide(e) {
    if (e.target.closest('.delete-btn')) {
      if (confirm('Are You Sure?')) {
        const currentGroup = await GroupStore.getGroupByID();
        if (currentGroup.slides.length === 1) {
          this.deleteGroup();
        } else {
          const index = +e.target.closest('.slide').dataset.index;
          await GroupStore.removeSlide(index);
          app.displaySlides();
        }
      }
    }
  }

  async deleteGroup() {
    await GroupStore.removeGroup();
    Storage.clear();
    await app.main.groupList.render();
    horizontalSwipe.slidePrev();
  }
}

// -----------------
export default Slide;
