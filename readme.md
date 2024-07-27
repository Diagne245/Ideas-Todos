# Ideas&Todos App

This is an application for storing Ideas and Todos. It is the `FullStack version of the TODO App` ( [See Repository](https://github.com/Diagne245/Todo) ).

This app includes a `Node.js/Express` API that uses `MongoDB` for a database and `Mongoose` for querying. The client-side is built with `Webpack`.

We added a `basic authentication system` requiring just an username and a password.

![App Screenshot](/client/src/images/screenshot.png)

Demo: &ensp;**https://itemstore.onrender.com/**

## Functionalities

- `Authentication` system with `Username` and `Password`
- `CRUD` capabilities
- Create `Groups` to organize items
- A `Slide System` for each group to further organize items
- A `Select Mode` that allows us to:
  - Transfer items from one slide to another or one group to another
  - Delete multiple items at once
- A `Focus Area` to add motivation text like quotes, etc.

### How To

1. To `Get Started`, Log On by providing a username and a password. Then you can start adding items, create groups, etc.

1. Click on an item to enter **`Edit Mode`** and click it again to exit

1. `Double Click` any item to enter `Select Mode`. You can then select items by clicking on them to either:

   - `Move` them to another location by hitting the `Add Selection` button
   - `Delete` them by pressing the `Remove Items` button

1. To `Delete a Group`, you need to remove all his slides.

1. To `Change Focus Text`, click on it, edit it, then press Enter. `Slide Titles` can be edited too.

## Usage

### Install Dependencies

Install dependencies on the front-end and back-end

```bash
npm install
cd client
npm install
```

### Back-end/Express Server

```bash
node server
```

or

```bash
npm run dev (Nodemon)
```

Visit `http://localhost:5000`

### Front-end/Webpack Dev Server

```bash
cd client
npm run dev
```

Visit `http://localhost:3000`

To build front-end production files

```bash
cd client
npm run build
```

The production build will be put into the `public` folder, which is the Express static folder.

### Environment Variables

Rename `.env-example` to `.env` and add your MongoDB URI to the `.env` file.

```
MONGO_URI=your_mongodb_uri
```

## API Endpoints

### Users

| Endpoint         | Description      | Method | Body                   |
| ---------------- | ---------------- | ------ | ---------------------- |
| /users           | Get all users    | GET    | None                   |
| /users           | Get user by name | GET    | userName               |
| /users/:id       | Get user by id   | GET    | None                   |
| /users           | Add user         | POST   | { userName, password } |
| /users/userState | Get userState    | GET    | userName               |
| /users/          | update userState | PUT    | userName               |
| /users/:id       | Delete user      | DELETE | None                   |

### MainStore

| Endpoint             | Description     | Method | Body (or params )        |
| -------------------- | --------------- | ------ | ------------------------ |
| user/mainStore/      | Get all items   | GET    | userId                   |
| user/mainStore/:id   | Get item by id  | GET    | userId                   |
| user/mainStore/focus | Set Focus Text  | PUT    | userId                   |
| user/mainStore/focus | Get Focus Text  | GET    | userId                   |
| user/mainStore/      | Add single item | POST   | { userId, text }         |
| user/mainStore/      | Add many items  | POST   | { userId, arrayOfItems } |
| user/mainStore/:id   | Update an item  | PUT    | { userId, text }         |
| user/mainStore/:id   | Delete an item  | DELETE | userId                   |
| user/mainStore/      | Clear All items | DELETE | userId                   |

### Groups & Slides

- The `:id` in the endpoints refers to the `Group Id`

| Endpoint        | Description                   | Method | Body (or params )                  |
| --------------- | ----------------------------- | ------ | ---------------------------------- |
| user/groups/    | Get all groups                | GET    | userId                             |
| user/groups/:id | Get group by id               | GET    | userId                             |
| user/groups/    | Add a group                   | POST   | { userId, title }                  |
| user/groups/:id | Add Slide at index to group   | POST   | { userId, index }                  |
| user/groups/:id | Set slide landing text        | PUT    | { userId, index, landingText }     |
| user/groups/:id | Add item to slide at index    | POST   | { userId, index, text }            |
| user/groups/:id | Add multiple items to slide   | POST   | { userId, index, arrayOfItems }    |
| user/groups/:id | Update item of slide at index | PUT    | { userId, index, itemID, newText } |
| user/groups/:id | Delete slide items            | DELETE | { userId, index, arrayOfIds }      |
| user/groups/    | Clear All slide items         | DELETE | { userId, index, arrayOfIds=[] }   |
| user/groups/:id | Delete slide at index         | DELETE | { userId, index }                  |
| user/groups/:id | Delete group                  | DELETE | userId                             |

## Features to Add

- Implement `Stronger Authentication` System and `Encryption`

- Improve the `User Experience`

- Add a `Sticky About App Group` to have a `How To` section

- Add `Color Themes`
