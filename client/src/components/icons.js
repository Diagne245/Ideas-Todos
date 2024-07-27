import { getSlideAtIndex } from '..';

class HomeIcon {
  constructor(index) {
    this.homeBtn = getSlideAtIndex(index).querySelector('.home-btn');

    const homeIcon = document.createElement('i');
    homeIcon.className = 'fa-solid fa-house fa-2x';

    this.homeBtn.appendChild(homeIcon);
  }

  // ----------------
  show() {
    this.homeBtn.style.display = 'block';
  }

  hide() {
    this.homeBtn.style.display = 'none';
  }
}

class RemoveSlideIcon {
  constructor(index) {
    this.deleteBtn = getSlideAtIndex(index).querySelector('.delete-btn');

    const deleteIcon = document.createElement('i');
    deleteIcon.className = 'fa-solid fa-trash-can fa-2x';

    this.deleteBtn.appendChild(deleteIcon);
  }

  // ----------------
  show() {
    this.deleteBtn.style.display = 'block';
  }

  hide() {
    this.deleteBtn.style.display = 'none';
  }
}

class AddSlideIcon {
  constructor(index) {
    this.addSlideBtn = getSlideAtIndex(index).querySelector('.add-slide');

    const icon = document.createElement('i');
    icon.className = 'fa-solid fa-plus fa-2x';

    this.addSlideBtn.appendChild(icon);
  }
}

export { HomeIcon, AddSlideIcon, RemoveSlideIcon };
