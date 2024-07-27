import MainStore from '../../services/mainStore';
import GroupStore from '../../services/groupStore';
import Storage from '../storage.js';
import {
  app,
  horizontalSwipe,
  swiperWrapper,
  mainContainer,
  getSlideAtIndex,
} from '../index.js';
// ---------------------
class GroupList {
  constructor() {
    this.groupListEl = mainContainer.querySelector('#groups');
    this.render();
  }

  async render() {
    this.groupListEl.innerHTML = '';
    const groups = await GroupStore.getGroups();

    if (groups.length !== 0) {
      groups.forEach((group) => {
        this._displayGroupBtn(group._id, group.title);
      });
    }
    this.groupListEl.addEventListener('click', this._expandGroup.bind(this));
  }

  async _expandGroup(e) {
    !app.isSelectMode && app.main.resetMain();
    Storage.setCurrentGroup(e.target.innerText);
    Storage.setCurrentGroupID(e.target.id);

    await app.displaySlides();

    // Select Mode------
    if (app.isSelectMode) {
      // Restore src slide state
      let addSelectionSlides;
      if (app.srcGroup === e.target.innerText) {
        addSelectionSlides = app.slides.filter(
          (slide) => slide.index !== app.selectionSrc
        );
        this.restoreSrcSlide();
      } else {
        addSelectionSlides = app.slides;
      }

      for (const slide of addSelectionSlides) {
        slide.slideForm.addSelectionMode();
        slide.slideEl.removeEventListener('click', slide.addActiveClassHandler);
      }
    }
    horizontalSwipe.slideNext();
    swiperWrapper.style.height = 'fit-content';
  }

  restoreSrcSlide() {
    const srcSlide = app.slides.find(
      (slide) => slide.index === app.selectionSrc
    );
    srcSlide.selectModeUI();
    srcSlide.showUIElements();
    srcSlide.slideEl.removeEventListener(
      'click',
      srcSlide.addActiveClassHandler
    );
    setTimeout(() => {
      // Add selected class to selected list items
      srcSlide.slideItemList.items.childNodes.forEach((li) => {
        Storage.getSelectedItems().includes(li.dataset.id) &&
          li.classList.add('selected');
      });
    }, 500);
  }

  // -----------------------
  _displayGroupBtn(id, title) {
    const groupLi = document.createElement('button');
    groupLi.type = 'button';
    groupLi.id = id;
    groupLi.className = 'group btn group-theme';
    groupLi.appendChild(document.createTextNode(title));
    this.groupListEl.appendChild(groupLi);
  }
}

// -----------------------------
class ItemList {
  constructor(index = null) {
    index !== null
      ? (this.items = getSlideAtIndex(index).querySelector('.items'))
      : (this.items = mainContainer.querySelector('.items'));

    this.index = index;
    this._eventHandlers();
    this.render();
  }

  _eventHandlers() {
    this.selectItemsHandler = this.selectItems.bind(this);
    this.selectModeHandler = this.selectMode.bind(this);
  }

  render() {
    this._resetItems();
    this._addEventListeners();
  }

  // Render list items no event listener added yet
  async _resetItems() {
    this.items.innerHTML = '';
    let items = [];
    this.index !== null && Storage.onGroupPage()
      ? (items = await GroupStore.getSlideItems(this.index))
      : (items = await MainStore.getItems());

    items.forEach((item) => {
      this.items.appendChild(new ListItem(item._id, item.text));
    });
    app.isEditMode = false;
  }

  _addEventListeners() {
    this.items.addEventListener('click', this.selectItemsHandler);
    this.items.addEventListener('dblclick', this.selectModeHandler);

    this.items.addEventListener('mouseover', this.deleteMode.bind(this));
    this.items.addEventListener('mouseout', this.deleteMode.bind(this));
  }

  // Methods --------------------
  toggleEditMode() {
    this.items.querySelector('.edit-mode') &&
      this.items.querySelector('.edit-mode').removeAttribute('class');
  }

  // ------------------------
  filterItems = async (e) => {
    let items;
    this.index !== null
      ? (items = await GroupStore.getSlideItems(this.index))
      : (items = await MainStore.getItems());

    let str = e.target.value.toLowerCase();
    for (let item of items) {
      item.text.toLowerCase().includes(str)
        ? this._showLi(item.text, this.items)
        : this._hideLi(item.text, this.items);
    }
  };

  _hideLi = (name, items) => {
    items.querySelectorAll('li').forEach((li) => {
      if (li.textContent.toLowerCase() === name.toLowerCase()) {
        li.style.display = 'none';
      }
    });
  };
  _showLi = (name, items) => {
    items.querySelectorAll('li').forEach((li) => {
      if (li.textContent.toLowerCase() === name.toLowerCase()) {
        li.style.display = 'block';
      }
    });
  };

  // @Select Mode -------------
  selectMode(e) {
    if (e.target.parentElement.classList.contains('items')) {
      // Reset UI in case we were in edit mode
      this.index !== null
        ? app.slides[this.index].exitEditMode()
        : app.main.resetMain();

      // Case we are already in selection mode
      if (app.isSelectMode) {
        this.exitSelectMode();
        return;
      }

      // Entering Select Mode
      app.isSelectMode = true;
      // ---------
      if (this.index !== null) {
        // Add selection btn of main
        app.main.form.addSelectionMode();

        // --------------
        const inSelectModeSlide = app.slides[this.index];
        inSelectModeSlide.selectModeUI();
        // --------------------
        app.selectionSrc = this.index;
        app.srcGroup = Storage.getCurrentGroupTitle();
        app.srcGroupID = Storage.getCurrentGroupID();
      } else {
        app.main.selectModeUI();
        app.selectionSrc = null;
        app.srcGroup = null;
        app.srcGroupID = null;
      }
    }
  }
  // Selecting Items------------------
  selectItems(e) {
    // Disable selecting items in other places
    if (app.isSelectMode && app.srcGroup === Storage.getCurrentGroupTitle()) {
      if (
        (e.target.closest('.slide') &&
          app.selectionSrc === +e.target.closest('.slide').dataset.index) ||
        app.selectionSrc === null
      ) {
        const li = e.target;
        // add to or remove item from selection
        if (li.classList.contains('selected')) {
          Storage.removeFromSelection(li.dataset.id);
          li.removeAttribute('class');
        } else {
          Storage.selectItem(li.dataset.id);
          li.classList.add('selected');
        }
      }
    }
  }
  // Deleting Selection ---------------
  async deleteSelectedItems(index = null, groupID = app.srcGroupID) {
    if (confirm('Are You Sure?')) {
      index !== null
        ? await GroupStore.removeSlideItems(
            Storage.getSelectedItems(),
            index,
            groupID
          )
        : await MainStore.deleteSelectedItems();
    }
    this.exitSelectMode();
  }
  // Exiting Select Mode ------------
  exitSelectMode(e) {
    if (!e || e.target.parentElement.classList.contains('items')) {
      app.restore();

      app.selectionSrc = null;
      app.srcGroup = null;
      app.srcGroupID = null;
      app.isSelectMode = false;
      app.isEditMode = false;
    }
    Storage.clearSelected();
  }

  // ---------------------------
  deleteMode = (e) => {
    if (e.target.closest('.item-btn')) {
      const li = e.target.closest('.item-btn').parentElement;
      li.classList.toggle('delete-mode');
    }
  };

  // --------------
  clear() {
    this.items.innerHTML = '';
  }
}

// ------------------
class ListItem {
  constructor(id, newEntry) {
    this.itemEl = document.createElement('li');
    this.itemEl.dataset.id = id;

    this.newEntry = newEntry;

    this.render();
    return this.itemEl;
  }

  render() {
    this.itemEl.appendChild(document.createTextNode(this.newEntry));

    const itemBtn = document.createElement('button');
    itemBtn.className = 'item-btn text-red';

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-xmark';

    itemBtn.appendChild(icon);
    this.itemEl.appendChild(itemBtn);
  }
}

export { GroupList, ItemList, ListItem };
