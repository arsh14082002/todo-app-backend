import mongoose from 'mongoose';

let profile_imgs_name_list = [
  'Garfield',
  'Tinkerbell',
  'Annie',
  'Loki',
  'Cleo',
  'Angel',
  'Bob',
  'Mia',
  'Coco',
  'Gracie',
  'Bear',
  'Bella',
  'Abby',
  'Harley',
  'Cali',
  'Leo',
  'Luna',
  'Jack',
  'Felix',
  'Kiki',
];
let profile_imgs_collections_list = ['notionists-neutral', 'adventurer-neutral', 'fun-emoji'];

const userSchema = new mongoose.Schema(
  {
    fullname: {
      required: true,
      type: String,
    },

    email: {
      required: true,
      type: String,
      unique: true,
    },

    username: {
      required: true,
      type: String,
      unique: true,
    },

    password: {
      required: true,
      type: String,
    },

    profile_img: {
      type: String,
      default: () => {
        return `https://api.dicebear.com/6.x/${
          profile_imgs_collections_list[
            Math.floor(Math.random() * profile_imgs_collections_list.length)
          ]
        }/svg?seed=${
          profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)]
        }`;
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    todos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Todo',
      },
    ],
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

export default User;
