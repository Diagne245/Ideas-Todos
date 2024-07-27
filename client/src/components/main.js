import Storage from '../storage';
import User from '../../services/user';
import MainStore from '../../services/mainStore';
import GroupStore from '../../services/groupStore';
import Logger from './logger';
import { MainForm } from './form';
import { GroupList, ItemList } from './listItems';
import Filter from './filter';
import Button from './buttons';
import { app, horizontalSwipe, mainContainer, groupContainer } from '..';
import Focus from './focus';

// ------------------
class Main {
  constructor() {
    this.editModeHandler = this.editItem.bind(this);
    this.render();
  }

  // ---------
  _mainBaseHTML() {
    mainContainer.innerHTML = `
      <section id="main-section">
        <article id="main-base" class="main-base">
          <form id="main-form" class="main-form">
            <div class="buttons"></div>
          </form>
          <div class="main-line line"></div>
        </article>
        
        <aside id="user-login"></aside>
      
        <article id="user-data">
          <ul id="groups"></ul>
          <div id="filter" class="filter"></div>
          <ul class="items"></ul>
          <div class="clear"></div>
        </article>
      </section>
      <aside id="focus"></aside>
    `;

    this.mainSection = mainContainer.querySelector('#main-section');
    this.mainLine = this.mainSection.querySelector('.main-line');
  }

  _baseMain() {
    this._mainBaseHTML();
    this.form = new MainForm();
  }

  async render() {
    this._baseMain();
    this.logger = new Logger();
  }

  async reload() {
    if (Storage.onGroupPage()) {
      await app.displaySlides();
      horizontalSwipe.slideTo(1, 0, false);
    }
    this._baseMain();
    this.loadUser();
  }

  async logout() {
    await User.setUserState('loggedOut');
    app.user = null;

    mainContainer.innerHTML = '';
    groupContainer.innerHTML = '';
    this._baseMain();
    this.logger = new Logger();

    Storage.clearSelected();
  }

  loadUser() {
    this.form.logoutIcon.style.display = 'inline-block';
    this.form.logoutIcon.addEventListener('click', this.logout.bind(this));
    // -------
    this.groupList = new GroupList();
    this.filter = new Filter();
    this.itemList = new ItemList();
    // ---------------------------
    this.clearAllBtn = new Button(
      this.mainSection.querySelector('.clear'),
      'button',
      ' Clear All',
      'btn btn-clear',
      'fa-solid fa-trash-can'
    );
    this.focus = new Focus();

    this._addEventListeners();
  }

  _addEventListeners() {
    this.form.formEl.addEventListener('submit', this.onSubmitEvent.bind(this));
    this.itemList.items.addEventListener('click', this.editModeHandler);
    this.itemList.items.addEventListener('click', this.deleteItem.bind(this));
    this.filter.filterInput.addEventListener(
      'input',
      this.itemList.filterItems.bind(this.itemList)
    );
    this.clearAllBtn.button.addEventListener('click', this.clearAll.bind(this));
  }

  // reset main leaving select mode active
  resetMain() {
    app.isEditMode = false;
    this.form.reset();
    this.itemList.render();
    this.hideUIElements();
  }

  // UI State--------
  editModeUI() {
    this.form.editMode();
    this.showUIElements();
  }
  selectModeUI() {
    this.form.addItemBtn.hide();
    this.itemList.toggleEditMode();
    this.showUIElements();
    this.clearAllBtn.removeSelection();
  }

  // Adding & Updating of entries --------------------
  async onSubmitEvent(e) {
    e.preventDefault();

    if (app.isSelectMode) {
      this.addSelection();
      return;
    }
    const formInput = this.form.formInput;
    e.submitter === this.form.addItemBtn.button &&
      (await this.form.validEntry(formInput.value)) &&
      (app.isEditMode ? this.updateItem() : this.addItem(formInput.value));

    e.submitter === this.form.addGroupBtn.button &&
      (await this.form.validGroup(formInput.value)) &&
      this.addGroup(formInput.value);

    this.form.blur();
  }

  async addItem(newEntry) {
    await MainStore.addItem(newEntry);
    this.itemList.render();
  }

  async updateItem() {
    const formInput = this.form.formInput;
    const liToUpdateID =
      this.itemList.items.querySelector('.edit-mode').dataset.id;

    await MainStore.updateItem(liToUpdateID, formInput.value);

    this.resetMain();
  }

  async addGroup(title) {
    const validTitle = title
      .trim()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
      .join(' ');

    await GroupStore.addGroup(validTitle);
    this.groupList.render();
  }

  async addSelection() {
    await MainStore.addSelection();
    this.itemList.exitSelectMode();
  }

  // Edit Mode ------------------------
  editItem(e) {
    if (e.target.parentElement.classList.contains('items')) {
      setTimeout(() => {
        if (!app.isSelectMode) {
          const li = e.target;

          // item already in edit mode
          if (li.classList.contains('edit-mode')) {
            this.resetMain();
            return;
          }
          setTimeout(() => {}, 200);
          const formInput = this.form.formInput;
          this.editModeUI();

          // switching to another item while in edit mode
          app.isEditMode && this.itemList.toggleEditMode();

          // ------
          formInput.value = li.innerText;
          formInput.focus();
          li.classList.add('edit-mode');
          app.isEditMode = true;
        }
      }, 200);
    }
  }
  // Items Removal----------------------
  async deleteItem(e) {
    e.stopImmediatePropagation();

    if (e.target.closest('.item-btn')) {
      const liToDeleteID =
        e.target.closest('.item-btn').parentElement.dataset.id;

      if (confirm('Are You Sure?')) {
        await MainStore.deleteItem(liToDeleteID);
        this.form.reset();
        this.itemList.render();

        // Display UI Elements
        const items = await MainStore.getItems();
        items.length === 0 && this.hideUIElements();
      }
    }
  }

  async clearAll(e) {
    if (app.isSelectMode) {
      await this.itemList.deleteSelectedItems();
      return;
    }
    // Regular items clearing
    if (confirm('Are You Sure?')) {
      await MainStore.clearAll();
      this.resetMain();
    }
  }
  // ---------
  hideUIElements() {
    this.mainLine.style.display = 'block';
    this.filter.hide();
    this.clearAllBtn.hide();
    this.focus.show();
  }

  showUIElements() {
    this.mainLine.style.display = 'none';
    this.filter.show();
    this.clearAllBtn.show();
    this.focus.hide();
  }
}

export default Main;
