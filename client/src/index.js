// import '@fortawesome/fontawesome-free/js/all';
// import 'swiper/css';
import Swiper from 'swiper';

import './scss/style.scss';

import Main from './components/main';
import User from '../services/user';
import GroupStore from '../services/groupStore';
import Storage from './storage';
import Slide from './components/slide';

// Global variables
const mainContainer = document.querySelector('#main-page .page-container');
const groupContainer = document.querySelector('#group-page .page-container');
const swiperWrapper = document.querySelector('.swiper-wrapper');

// Swiper Initialize ---------------------
const horizontalSwipe = new Swiper('.swiper-h', {
  allowTouchMove: false,
  speed: 700,
});

// -------------------
class App {
  constructor() {
    this.user = null;
    this.slides = [];

    this.main = new Main();
    // ---------
    this.isEditMode = false;
    this.isSelectMode = false;
    this.selectionSrc = null;
    this.srcGroup = null;
    this.srcGroupID = null;

    document.addEventListener('DOMContentLoaded', this.restore.bind(this));
  }

  // ----------------------
  async restore() {
    mainContainer.innerHTML = '';
    groupContainer.innerHTML = '';
    Storage.clearSelected();

    if (!Storage.getUserName()) {
      this.main.render();
    } else {
      const userState = await User.getUserState(Storage.getUserName());
      userState === 'loggedOut' && this.main.render();
      userState === 'loggedIn' &&
        (this.user = await User.getUser(Storage.getUserName())) &&
        this.main.reload();
    }
  }

  // @Group Page -------------------
  async displaySlides(groupID = Storage.getCurrentGroupID()) {
    const currentGroup = await GroupStore.getGroupByID(groupID);
    if (currentGroup) {
      groupContainer.innerHTML = '';
      this.slides = [];
      for (let index = 0; index < currentGroup.slides.length; index++) {
        this.slides[index] = new Slide(index);
      }
    }
  }
}

// Shared Methods ----------------
const getSlideAtIndex = (index) => {
  return groupContainer.querySelector(`.slide[data-index="${index}"]`);
};

// ----------------------
const app = new App();

export { app, horizontalSwipe, swiperWrapper, mainContainer, groupContainer };
export { getSlideAtIndex };
