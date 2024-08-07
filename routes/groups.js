const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();
const { ObjectId } = require('mongodb');

const User = require('../models/User');
const GroupSchema = require('../models/Group');
const Group = new mongoose.model('Group', GroupSchema, 'users');

const SlideSchema = require('../models/Slide');
const Slide = new mongoose.model('Slide', SlideSchema, 'users');

const ItemSchema = require('../models/Item');
const Item = new mongoose.model('Item', ItemSchema, 'users');

// Displaying the results
const getCurrentGroup = async (req) => {
  const user = await User.findOne(
    { _id: req.query.userId },
    {
      groups: {
        $elemMatch: { _id: new ObjectId(req.params.id) },
      },
    }
  );
  return user.groups[0];
};

// Add a New Group
router.post('/', async (req, res) => {
  if (req.body.title) {
    let newGroup = new Group({
      title: req.body.title,
      slides: [new Slide({ landingText: req.body.title })],
    });

    try {
      const user = await User.findOneAndUpdate(
        { _id: req.body.userId },
        {
          $push: {
            groups: {
              $each: [newGroup],
            },
          },
        },
        { new: true }
      );
      const groups = user.groups;
      return res.json({
        success: true,
        data: groups[groups.length - 1],
      });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
});

router.get('/', async (req, res) => {
  try {
    // Get a group by its title
    if (req.body.title) {
      const group = await User.findOne(
        { _id: req.query.userId },
        {
          groups: {
            $elemMatch: { title: req.body.title },
          },
        }
      );
      return res.json({ success: true, data: group });
    }
    // Get all groups
    const user = await User.findOne({ _id: req.query.userId });
    return res.json({ success: true, data: user.groups });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const group = await getCurrentGroup(req);
    // Get a group by ID
    if (!req.body.index) {
      return res.json({ success: true, data: group });
    }
    // Get Slide at Index -------------
    if (req.body.index && req.body.index !== null) {
      const slide = group.slides[req.body.index];
      return res.json({ success: true, data: slide });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.post('/:id', async (req, res) => {
  try {
    if (req.body.index !== null) {
      const user = await User.findOne({ _id: req.body.userId });
      const targetGroup = user.groups.find(
        (group) =>
          JSON.stringify(group._id) ===
          JSON.stringify(new ObjectId(req.params.id))
      );
      const targetSlide = targetGroup.slides[req.body.index];

      // Add new Item to a Slide at a given index
      if (req.body.text) {
        const newItem = new Item({ text: req.body.text });
        targetSlide.slideItems.push(newItem);
        user.markModified('groups');
        await user.save();

        return res.json({
          success: true,
          data: newItem,
        });
      }

      // Add new Slide at index to Group ----------
      if (!req.body.arrayOfItems) {
        await User.findOneAndUpdate(
          {
            _id: req.body.userId,
            'groups._id': new ObjectId(req.params.id),
          },
          {
            $push: {
              'groups.$.slides': {
                $each: [new Slide()],
                $position: parseInt(req.body.index),
              },
            },
          }
        );
        const group = await getCurrentGroup(req);
        return res.json({ success: true, data: group.slides });
      } else if (req.body.arrayOfItems != []) {
        // Add selected items to Slide
        for (const item of req.body.arrayOfItems) {
          targetSlide.slideItems.push(item);
        }
        user.markModified('groups');
        await user.save();
        return res.json({ success: true, data: targetSlide.slideItems });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// Update landing text or item at Slide Index
router.put('/:id', async (req, res) => {
  try {
    if (req.body.index !== null) {
      const user = await User.findOne({ _id: req.body.userId });
      const targetGroup = user.groups.find(
        (group) =>
          JSON.stringify(group._id) ===
          JSON.stringify(new ObjectId(req.params.id))
      );
      const targetSlide = targetGroup.slides[req.body.index];

      // Updating landing text-----------
      if (req.body.landingText) {
        targetSlide.landingText = req.body.landingText;
        user.markModified('groups');
        await user.save();
        return res.json({
          success: true,
          data: targetSlide,
        });
      }

      // Updating Item Text-----------
      if (req.body.newText) {
        // get & update the item
        const itemToUpdate = targetSlide.slideItems.find(
          (item) =>
            JSON.stringify(item._id) ===
            JSON.stringify(
              new ObjectId(req.body.itemID) ||
                item_id === new ObjectId(req.body.itemID)
            )
        );
        const itemIndex = targetSlide.slideItems.indexOf(itemToUpdate);
        itemToUpdate.text = req.body.newText;

        // add the updated item and remove the old one
        targetSlide.slideItems.splice(itemIndex, 1, itemToUpdate);
        user.markModified('groups');
        await user.save();
        return res.json({ success: true, data: itemToUpdate });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

//  Delete Requests--------
router.delete('/:id', async (req, res) => {
  try {
    if (req.body.index !== undefined && req.body.index !== null) {
      const user = await User.findOne({ _id: req.body.userId });
      const targetGroup = user.groups.find(
        (group) =>
          JSON.stringify(group._id) ===
          JSON.stringify(new ObjectId(req.params.id))
      );
      const targetSlide = targetGroup.slides[req.body.index];

      // ---------------------
      if (req.body.arrayOfIds) {
        // Delete item(s) from Slide at Index ---------------
        if (req.body.arrayOfIds.length !== 0) {
          const mappedArrayOfIds = req.body.arrayOfIds.map((id) =>
            JSON.stringify(new ObjectId(id))
          );
          targetSlide.slideItems = targetSlide.slideItems.filter(
            (item) => !mappedArrayOfIds.includes(JSON.stringify(item._id))
          );
        }
        // Clear all slide Items -----------
        else if (req.body.arrayOfIds.length === 0) {
          targetSlide.slideItems = [];
        }

        user.markModified('groups');
        await user.save();
        return res.json({
          success: false,
          data: targetSlide.slideItems,
        });

        // Delete Slide at index ------------------------
      } else if (!req.body.arrayOfIds) {
        const updatedUser = await User.findOneAndUpdate(
          { _id: req.body.userId, 'groups._id': new ObjectId(req.params.id) },
          {
            $pull: {
              'groups.$.slides': { _id: targetSlide._id },
            },
          },
          { new: true }
        );
        return res.json({ success: true, data: updatedUser.groups });
      }
    } else if (req.body.index === undefined || req.body.index === null) {
      // Delete the group itself ------------------
      const updatedUser = await User.findOneAndUpdate(
        { _id: req.body.userId },
        {
          $pull: {
            groups: { _id: new ObjectId(req.params.id) },
          },
        },
        { new: true }
      );
      return res.json({ success: true, data: updatedUser.groups });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// for Dev Purposes @@@@@
// Delete all groups
// router.delete('/', async (req, res) => {
//   try {
//     const user = await User.findOneAndUpdate(
//       { _id: req.body.userId },
//       {
//         $set: {
//           groups: [],
//         },
//       },
//       { new: true }
//     );
//     return res.json({ success: true, data: user });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ success: false, error: 'Server Error' });
//   }
// });

module.exports = router;
