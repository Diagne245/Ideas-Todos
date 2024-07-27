import axios from 'axios';
import { app } from '../src/index.js';
import Storage from '../src/storage.js';
import MainStore from './mainStore';

// -----------------
class GroupStore {
  constructor() {
    this.groupsUrl = '/user/groups';
  }

  // Get groups----------------------
  getGroups = async () => {
    const res = await axios.get(this.groupsUrl, {
      params: { userId: app.user._id },
    });
    return res.data.data;
  };

  getGroupByID = async (groupID = Storage.getCurrentGroupID()) => {
    const res = await axios.get(`${this.groupsUrl}/${groupID}`, {
      params: { userId: app.user._id },
    });
    return res.data.data;
  };

  getSlideLandingText = async (index) => {
    const currentGroup = await this.getGroupByID();
    return currentGroup.slides[index].landingText;
  };

  setSlideLandingText = async (landingText, index) => {
    await axios.put(`${this.groupsUrl}/${Storage.getCurrentGroupID()}`, {
      userId: app.user._id,
      index,
      landingText,
    });
  };

  // Add a group & slide ------------------
  addGroup = async (title) => {
    return await axios.post(this.groupsUrl, { userId: app.user._id, title });
  };

  addNewSlide = async (index) => {
    await axios.post(`${this.groupsUrl}/${Storage.getCurrentGroupID()}`, {
      userId: app.user._id,
      index,
    });
  };

  // ------------
  addItemToSlide = async (text, index) => {
    const res = await axios.post(
      `${this.groupsUrl}/${Storage.getCurrentGroupID()}`,
      {
        userId: app.user._id,
        index,
        text,
      }
    );
    return res.data.data;
  };

  // ----------
  updateItem = async (itemID, newText, index) => {
    const res = await axios.put(
      `${this.groupsUrl}/${Storage.getCurrentGroupID()}`,
      {
        userId: app.user._id,
        index,
        itemID,
        newText,
      }
    );
    return res.data.data;
  };

  // -------------
  getSlideItems = async (index, groupID = Storage.getCurrentGroupID()) => {
    const group = await this.getGroupByID(groupID);
    return group.slides[index].slideItems;
  };

  // ----------
  addSelection = async (index) => {
    // Put selected items into an array
    const arrayOfItems = await Storage.getArrayOfSelectedItems();

    // delete selected items from src
    if (app.srcGroup === null) {
      await MainStore.deleteSelectedItems();
    } else {
      await this.removeSlideItems(
        Storage.getSelectedItems(),
        app.selectionSrc,
        app.srcGroupID
      );
    }

    // add selected items to destination slide
    await axios.post(`${this.groupsUrl}/${Storage.getCurrentGroupID()}`, {
      userId: app.user._id,
      arrayOfItems,
      index,
    });
  };

  // ----------------
  removeSlideItems = async (
    arrayOfIds,
    index,
    groupID = Storage.getCurrentGroupID()
  ) => {
    await axios.delete(`${this.groupsUrl}/${groupID}`, {
      data: {
        userId: app.user._id,
        arrayOfIds,
        index,
      },
    });
  };

  // --------------
  clearSlideItems = async (index) => {
    await axios.delete(`${this.groupsUrl}/${Storage.getCurrentGroupID()}`, {
      data: {
        userId: app.user._id,
        arrayOfIds: [],
        index,
      },
    });
  };

  // Remove group & slide
  removeSlide = async (index) => {
    await axios.delete(`${this.groupsUrl}/${Storage.getCurrentGroupID()}`, {
      data: { userId: app.user._id, index },
    });
  };

  removeGroup = async () => {
    await axios.delete(`${this.groupsUrl}/${Storage.getCurrentGroupID()}`, {
      data: {
        userId: app.user._id,
      },
    });
  };
}

export default new GroupStore();
